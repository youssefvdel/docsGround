import { Engine } from "../core/engine.js";
import { ConfigManager } from "../core/config.js";
import { JobManager } from "../core/jobs.js";
import { EventBus, type DocsGroundEvent } from "../core/events.js";
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

      // Serve app icon / logo (SVG preferred, PNG fallback)
      if (url.pathname === "/logo.svg" || url.pathname === "/logo.png") {
        const isSvg = url.pathname.endsWith(".svg");
        const logoPath = join(import.meta.dir, isSvg ? "../../assets/logo.svg" : "../../logo.png");
        if (existsSync(logoPath)) {
          return new Response(new Uint8Array(await Bun.file(logoPath).arrayBuffer()), {
            headers: { "Content-Type": isSvg ? "image/svg+xml" : "image/png", "Cache-Control": "public, max-age=86400", ...headers }
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

      // Real-time Event Stream (SSE) for search glow & live indexing neuron spawning
      if (url.pathname === "/api/events" && req.method === "GET") {
        let unsubscribe: (() => void) | null = null;

        const stream = new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            
            // Send initial ping
            controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`));

            unsubscribe = EventBus.subscribe((evt: DocsGroundEvent) => {
              try {
                controller.enqueue(encoder.encode(`event: ${evt.type}\ndata: ${JSON.stringify(evt.data)}\n\n`));
              } catch {
                if (unsubscribe) unsubscribe();
              }
            });
          },
          cancel() {
            if (unsubscribe) unsubscribe();
          }
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            ...headers
          }
        });
      }

      // Graph Overview Topology Data
      if (url.pathname === "/api/graph-topology" && req.method === "GET") {
        const libs = engine.db.listLibraries();
        const allDocs: { id: string; library: string; title: string; path: string; symbols: string[] }[] = [];
        for (const lib of libs) {
          const docs = engine.db.getDocsByLibrary(lib.name);
          for (const d of docs.slice(0, 40)) { // top 40 docs per library for smooth WebGL/SVG rendering
            allDocs.push({
              id: d.id,
              library: lib.name,
              title: d.title,
              path: d.path,
              symbols: (d.symbols || []).slice(0, 4)
            });
          }
        }
        return Response.json({ libraries: libs, docs: allDocs }, { headers });
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

      // Auto-context injection endpoint for Hermes & OpenCode plugins
      if (url.pathname === "/api/ground" && req.method === "POST") {
        try {
          const body = await req.json() as any;
          const queryText = String(body.query || "").trim();
          const threshold = body.threshold !== undefined ? Number(body.threshold) : 0.78;
          const limit = body.limit ? Number(body.limit) : 2;

          const result = await engine.groundQuery(queryText, threshold, limit);
          return Response.json(result, { headers });
        } catch (err: any) {
          return Response.json({ grounded: false, error: err.message }, { status: 400, headers });
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

      // Logo Static Asset
      if (url.pathname === "/logo.png") {
        const file = Bun.file(join(import.meta.dir, "../../logo.png"));
        return new Response(file, {
          headers: { "Content-Type": "image/png" }
        });
      }

      if (url.pathname === "/logo.svg") {
        const file = Bun.file(join(import.meta.dir, "../../logo.svg"));
        return new Response(file, {
          headers: { "Content-Type": "image/svg+xml" }
        });
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
  <link rel="icon" type="image/svg+xml" href="/logo.svg">
  <title>docsGround • Autonomous Knowledge Mesh</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            obsidian: {
              bg: '#08090B',
              surface: '#0E1015',
              card: '#12141A',
              hover: '#181B22',
              active: '#1E222B',
              border: '#1F232D',
              borderHover: '#2E3442',
              emerald: '#10B981',
              cyan: '#38BDF8',
              purple: '#A855F7',
              amber: '#F59E0B'
            }
          },
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif],
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
        root.innerHTML = '<div style="color:#ff6b6b;padding:30px;font-family:monospace;background:#101216;border:1px solid #ff6b6b;margin:20px;border-radius:12px;"><h3>UI Runtime Error</h3><p>' + msg + '</p><p>Line: ' + line + ':' + col + '</p><pre style="margin-top:10px;color:#aaa;">' + (error ? error.stack : '') + '</pre></div>';
      }
    };
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #08090B;
      color: #E4E4E7;
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      user-select: none;
    }
    .select-text { user-select: text; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    /* Hide native default browser number spinners */
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
    
    .notion-tag-blue { background: rgba(56, 189, 248, 0.12); color: #38BDF8; border: 1px solid rgba(56, 189, 248, 0.25); }
    .notion-tag-green { background: rgba(16, 185, 129, 0.12); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.25); }
    .notion-tag-purple { background: rgba(168, 85, 247, 0.12); color: #A855F7; border: 1px solid rgba(168, 85, 247, 0.25); }
    .notion-tag-orange { background: rgba(249, 115, 22, 0.12); color: #F97316; border: 1px solid rgba(249, 115, 22, 0.25); }
    .notion-tag-gray { background: rgba(113, 113, 122, 0.12); color: #A1A1AA; border: 1px solid rgba(113, 113, 122, 0.25); }
    
    .notion-markdown { line-height: 1.7; color: #D4D4D8; }
    .notion-markdown h1 { font-size: 1.75rem; font-weight: 700; color: #FFFFFF; margin-top: 1.8rem; margin-bottom: 0.8rem; border-bottom: 1px solid #1F232D; padding-bottom: 0.4rem; letter-spacing: -0.02em; }
    .notion-markdown h2 { font-size: 1.3rem; font-weight: 600; color: #F4F4F5; margin-top: 1.5rem; margin-bottom: 0.6rem; border-bottom: 1px solid #181B22; padding-bottom: 0.3rem; letter-spacing: -0.01em; }
    .notion-markdown h3 { font-size: 1.1rem; font-weight: 600; color: #E4E4E7; margin-top: 1.2rem; margin-bottom: 0.4rem; }
    .notion-markdown p { margin-bottom: 0.9rem; color: #D4D4D8; font-size: 13.5px; }
    .notion-markdown code { font-family: 'JetBrains Mono', monospace; background: rgba(255,255,255,0.06); color: #38BDF8; padding: 2px 6px; border-radius: 6px; font-size: 12px; border: 1px solid rgba(255,255,255,0.08); }
    .notion-markdown pre { background: #0A0B0E; border: 1px solid #1E222B; border-radius: 10px; padding: 14px 16px; margin: 14px 0; overflow-x: auto; box-shadow: inset 0 2px 8px rgba(0,0,0,0.5); }
    .notion-markdown pre code { background: transparent; color: #E4E4E7; padding: 0; font-size: 12px; border: none; }
    .notion-markdown ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.9rem; font-size: 13.5px; }
    .notion-markdown ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.9rem; font-size: 13.5px; }
    .notion-markdown li { margin-bottom: 0.3rem; }
    .notion-markdown a { color: #38BDF8; text-decoration: underline; text-underline-offset: 3px; }
    .notion-markdown blockquote { border-left: 3px solid #10B981; padding-left: 14px; color: #A1A1AA; margin: 14px 0; font-style: italic; background: rgba(16, 185, 129, 0.04); padding-top: 4px; padding-bottom: 4px; border-radius: 0 8px 8px 0; }
    .notion-markdown table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    .notion-markdown th { background: #12141A; border: 1px solid #1F232D; padding: 8px 12px; text-align: left; color: #FFFFFF; font-weight: 600; }
    .notion-markdown td { border: 1px solid #1A1D25; padding: 8px 12px; }
  </style>
</head>
<body class="h-screen w-screen overflow-hidden bg-[#08090B] text-[#E4E4E7] font-sans text-[13px]">
  <div id="root" class="h-full w-full flex"></div>
  <script src="/app.js"></script>
</body>
</html>`;
}
