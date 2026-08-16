import { Engine } from "../core/engine.js";
import { ConfigManager } from "../core/config.js";
import { JobManager } from "../core/jobs.js";
import { StealthFetcher } from "../fetcher/index.js";
import { DocParser } from "../parser/index.js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Pre-transpile React frontend code to vanilla JS on startup using Bun's native transpiler
function getCompiledFrontendJs(): string {
  const tsxPath = join(import.meta.dir, "frontend.tsx");
  if (!existsSync(tsxPath)) return "console.error('frontend.tsx missing');";
  const rawTsx = readFileSync(tsxPath, "utf-8");
  const transpiler = new Bun.Transpiler({
    loader: "tsx",
    tsconfig: JSON.stringify({ compilerOptions: { jsx: "react" } })
  });
  return transpiler.transformSync(rawTsx);
}

const COMPILED_APP_JS = getCompiledFrontendJs();

export function createHttpServer(engine: Engine, port: number = 3030) {
  return Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      };

      if (req.method === "OPTIONS") {
        return new Response(null, { headers });
      }

      // Serve app icon / logo
      if (url.pathname === "/logo.png") {
        const logoPath = join(import.meta.dir, "../../logo.png");
        if (existsSync(logoPath)) {
          return new Response(new Uint8Array(await Bun.file(logoPath).arrayBuffer()), {
            headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400", ...headers }
          });
        }
        return new Response("Not Found", { status: 404 });
      }

      // Serve pre-compiled native JavaScript bundle for 0ms startup & zero Babel dependency
      if (url.pathname === "/app.js") {
        return new Response(COMPILED_APP_JS, {
          headers: { "Content-Type": "application/javascript; charset=utf-8", ...headers }
        });
      }

      // API Endpoints
      if (url.pathname === "/api/search" && req.method === "GET") {
        const q = url.searchParams.get("q") || "";
        const lib = url.searchParams.get("library") || undefined;
        const limit = Number(url.searchParams.get("limit")) || 12;
        const startTime = performance.now();
        const results = await engine.query(q, lib, limit);
        const latencyMs = (performance.now() - startTime).toFixed(1);
        return Response.json({ ...results, latencyMs }, { headers });
      }

      if (url.pathname === "/api/libraries" && req.method === "GET") {
        const libs = engine.db.listLibraries();
        return Response.json(libs, { headers });
      }

      if (url.pathname === "/api/library-docs" && req.method === "GET") {
        const lib = url.searchParams.get("library") || "";
        const docs = engine.db.getDocsByLibrary(lib);
        return Response.json(docs, { headers });
      }

      if (url.pathname === "/api/library" && req.method === "DELETE") {
        const lib = url.searchParams.get("name") || "";
        if (!lib) return Response.json({ success: false, error: "Name required" }, { status: 400, headers });
        engine.db.deleteLibrary(lib);
        return Response.json({ success: true, deleted: lib }, { headers });
      }

      if (url.pathname === "/api/library/rename" && req.method === "POST") {
        try {
          const { oldName, newName } = await req.json() as any;
          const ok = engine.db.renameLibrary(oldName, newName);
          return Response.json({ success: ok }, { headers });
        } catch (err: any) {
          return Response.json({ success: false, error: err.message }, { status: 400, headers });
        }
      }

      if (url.pathname === "/api/doc" && req.method === "GET") {
        const id = url.searchParams.get("id") || "";
        const doc = engine.db.getDoc(id);
        if (!doc) return new Response("Not found", { status: 404, headers });
        return Response.json(doc, { headers });
      }

      if (url.pathname === "/api/config" && req.method === "GET") {
        return Response.json(ConfigManager.get(), { headers });
      }

      if (url.pathname === "/api/config" && req.method === "POST") {
        try {
          const body = await req.json() as any;
          const updated = ConfigManager.save(body);
          return Response.json({ success: true, config: updated }, { headers });
        } catch (err: any) {
          return Response.json({ success: false, error: err.message }, { status: 400, headers });
        }
      }

      if (url.pathname === "/api/jobs" && req.method === "GET") {
        return Response.json({
          active: JobManager.getActiveJobs(),
          all: JobManager.getAllJobs()
        }, { headers });
      }

      // Fetch Models endpoint: Filters exclusively for embedding models
      if (url.pathname === "/api/fetch-models" && req.method === "POST") {
        try {
          const { baseUrl, apiKey } = await req.json() as any;
          if (!baseUrl) {
            return Response.json({ success: false, error: "Base URL is required" }, { status: 400, headers });
          }

          const cleanUrl = baseUrl.replace(/\/+$/, "");
          const target = `${cleanUrl}/models`;

          const reqHeaders: Record<string, string> = { "Accept": "application/json" };
          if (apiKey) reqHeaders["Authorization"] = `Bearer ${apiKey}`;

          const res = await fetch(target, {
            headers: reqHeaders,
            signal: AbortSignal.timeout(5000)
          });

          if (!res.ok) {
            return Response.json({ success: false, error: `Provider returned HTTP ${res.status}` }, { headers });
          }

          const data = await res.json() as any;
          const rawModels: { id: string; capabilities?: any }[] = [];

          if (Array.isArray(data.data)) {
            for (const m of data.data) {
              if (m && m.id) rawModels.push({ id: m.id, capabilities: m.capabilities });
            }
          } else if (Array.isArray(data)) {
            for (const m of data) {
              if (typeof m === "string") rawModels.push({ id: m });
              else if (m && m.id) rawModels.push({ id: m.id, capabilities: m.capabilities });
            }
          }

          const isEmbeddingModel = (m: { id: string; capabilities?: any }) => {
            const id = m.id.toLowerCase();
            const embedKeywords = ["embed", "bge", "nomic", "gte", "e5", "minilm", "ada", "bert", "voyage", "cohere-embed"];
            if (embedKeywords.some(k => id.includes(k))) return true;
            if (m.capabilities && (m.capabilities.embedding === true || m.capabilities.type === "embedding")) return true;
            return false;
          };

          let embeddingModels = rawModels.filter(isEmbeddingModel).map(m => m.id);

          if (embeddingModels.length === 0) {
            embeddingModels = [
              "text-embedding-3-small",
              "text-embedding-3-large",
              "text-embedding-ada-002",
              "bge-m3",
              "bge-small-en-v1.5",
              "bge-large-en-v1.5",
              "nomic-embed-text",
              "all-MiniLM-L6-v2"
            ];
          }

          return Response.json({ success: true, models: embeddingModels }, { headers });
        } catch (err: any) {
          return Response.json({ success: false, error: err.message }, { headers });
        }
      }

      // Live web meta-search (used by the native Hermes plugin)
      if (url.pathname === "/api/web-search" && req.method === "POST") {
        try {
          const body = await req.json() as any;
          const q = String(body.query || "").trim();
          const limit = body.limit ? Number(body.limit) : 6;
          if (!q) return Response.json({ success: false, error: "query required" }, { status: 400, headers });
          const results = await engine.searx.search(q, limit);
          return Response.json({ success: true, results }, { headers });
        } catch (err: any) {
          return Response.json({ success: false, error: err.message }, { headers });
        }
      }

      // Web extract to clean markdown (used by the native Hermes plugin)
      if (url.pathname === "/api/extract" && req.method === "POST") {
        try {
          const body = await req.json() as any;
          const targetUrl = String(body.url || "").trim();
          if (!targetUrl) return Response.json({ success: false, error: "url required" }, { status: 400, headers });
          const { html, url: finalUrl } = await StealthFetcher.fetchWebPage(targetUrl);
          const parsed = DocParser.parseHTML(html, finalUrl);
          return Response.json({ success: true, url: finalUrl, title: parsed.title, markdown: parsed.markdown.slice(0, 50000) }, { headers });
        } catch (err: any) {
          return Response.json({ success: false, error: err.message }, { headers });
        }
      }

      // Background Async Ingestion with Multi-link, Per-job Advanced Limits & Re-index
      if (url.pathname === "/api/ingest" && req.method === "POST") {
        try {
          const body = await req.json() as any;
          const libName = body.library.trim().toLowerCase();
          
          const rawTargets = body.targets || body.target || "";
          const targets = Array.isArray(rawTargets) 
            ? rawTargets 
            : String(rawTargets).split(/[\n,]+/).map(t => t.trim()).filter(Boolean);

          if (targets.length === 0) {
            return Response.json({ success: false, error: "At least one target URL is required" }, { status: 400, headers });
          }

          if (body.cleanReindex) {
            engine.db.deleteLibrary(libName);
          }

          const crawlerOpts = {
            maxPages: body.maxPages ? Number(body.maxPages) : undefined,
            maxDepth: body.maxDepth ? Number(body.maxDepth) : undefined
          };

          const job = JobManager.createJob(libName, targets.join(", "));

          (async () => {
            try {
              for (const target of targets) {
                await engine.ingestWithProgress({
                  library: libName,
                  target,
                  subpath: body.subpath ? body.subpath.trim() : "",
                  type: target.includes("github.com") ? "git" : "web"
                }, job.id, crawlerOpts);
              }
            } catch (err: any) {
              JobManager.failJob(job.id, err.message || "Failed");
            }
          })();

          return Response.json({
            success: true,
            jobId: job.id,
            library: libName,
            targetsCount: targets.length,
            status: "running"
          }, { headers });
        } catch (err: any) {
          return Response.json({ success: false, error: err.message }, { status: 400, headers });
        }
      }

      // Notion Design Language Web UI
      if (url.pathname === "/" || url.pathname === "/index.html") {
        return new Response(getWebUiHtml(), {
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }

      return new Response("Not Found", { status: 404 });
    }
  });
}

function getWebUiHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>docsGround</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            notion: {
              bg: '#191919',
              sidebar: '#202020',
              card: '#202020',
              hover: '#282828',
              active: '#303030',
              border: '#2e2e2e',
              text: '#D4D4D4',
              textMuted: '#848484',
              heading: '#FFFFFF',
              callout: '#222222',
              blue: '#529CCA',
              green: '#4DAB9A',
              purple: '#9A6DD7',
              orange: '#FF7347',
              gray: '#9B9A97'
            }
          },
          fontFamily: {
            sans: ['Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif],
            mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace']
          }
        }
      }
    }
  </script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script>
    window.onerror = function(msg, url, line, col, error) {
      var root = document.getElementById("root");
      if (root) {
        root.innerHTML = '<div style="color:#ff6b6b;padding:30px;font-family:monospace;background:#1e1e1e;border:1px solid #ff6b6b;margin:20px;border-radius:8px;"><h3>UI Runtime Error</h3><p>' + msg + '</p><p>Line: ' + line + ':' + col + '</p><pre style="margin-top:10px;color:#aaa;">' + (error ? error.stack : '') + '</pre></div>';
      }
    };
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #191919;
      color: #D4D4D4;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      user-select: none;
    }
    .select-text { user-select: text; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #2e2e2e; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #3e3e3e; }
    .notion-tag-blue { background: rgba(82, 156, 202, 0.15); color: #529CCA; }
    .notion-tag-green { background: rgba(77, 171, 154, 0.15); color: #4DAB9A; }
    .notion-tag-purple { background: rgba(154, 109, 215, 0.15); color: #9A6DD7; }
    .notion-tag-orange { background: rgba(255, 115, 71, 0.15); color: #FF7347; }
    .notion-tag-gray { background: rgba(155, 154, 151, 0.15); color: #9B9A97; }
    .notion-modal-overlay { background-color: rgba(15, 15, 15, 0.7); backdrop-filter: blur(2px); }
    
    .notion-markdown { line-height: 1.65; color: #d4d4d4; }
    .notion-markdown h1 { font-size: 1.8rem; font-weight: 700; color: #ffffff; margin-top: 1.5rem; margin-bottom: 0.8rem; border-bottom: 1px solid #2e2e2e; padding-bottom: 0.3rem; }
    .notion-markdown h2 { font-size: 1.35rem; font-weight: 600; color: #ffffff; margin-top: 1.3rem; margin-bottom: 0.6rem; border-bottom: 1px solid #282828; padding-bottom: 0.2rem; }
    .notion-markdown h3 { font-size: 1.1rem; font-weight: 600; color: #f0f0f0; margin-top: 1.1rem; margin-bottom: 0.4rem; }
    .notion-markdown p { margin-bottom: 0.8rem; color: #d4d4d4; font-size: 13.5px; }
    .notion-markdown code { font-family: 'JetBrains Mono', monospace; background: rgba(255,255,255,0.08); color: #EB5757; padding: 2px 5px; border-radius: 4px; font-size: 12px; }
    .notion-markdown pre { background: #111111; border: 1px solid #2a2a2a; border-radius: 6px; padding: 12px 14px; margin: 12px 0; overflow-x: auto; }
    .notion-markdown pre code { background: transparent; color: #e2e8f0; padding: 0; font-size: 12px; }
    .notion-markdown ul { list-style-type: disc; padding-left: 1.4rem; margin-bottom: 0.8rem; font-size: 13.5px; }
    .notion-markdown ol { list-style-type: decimal; padding-left: 1.4rem; margin-bottom: 0.8rem; font-size: 13.5px; }
    .notion-markdown li { margin-bottom: 0.25rem; }
    .notion-markdown a { color: #529CCA; text-decoration: underline; text-underline-offset: 3px; }
    .notion-markdown blockquote { border-left: 3px solid #529CCA; padding-left: 12px; color: #9b9a97; margin: 12px 0; font-style: italic; }
    .notion-markdown table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 13px; }
    .notion-markdown th { background: #222222; border: 1px solid #2e2e2e; padding: 6px 10px; text-align: left; color: #ffffff; }
    .notion-markdown td { border: 1px solid #2a2a2a; padding: 6px 10px; }
  </style>
</head>
<body class="h-screen w-screen overflow-hidden bg-[#191919] text-[#D4D4D4] font-sans text-[13px]">
  <div id="root" class="h-full w-full flex"></div>
  <script src="/app.js"></script>
</body>
</html>`;
}
