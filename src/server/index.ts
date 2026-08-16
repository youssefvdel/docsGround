import { Engine } from "../core/engine.js";
import { ConfigManager } from "../core/config.js";
import { JobManager } from "../core/jobs.js";

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
          headers: { "Content-Type": "text/html" }
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
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
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

  <script type="text/babel">
    const { useState, useEffect, useRef } = React;

    const Icons = {
      bolt: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
      search: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
      document: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
      book: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
      settings: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
      plus: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
      refresh: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>,
      info: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
      copy: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
      check: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><polyline points="20 6 9 17 4 12"></polyline></svg>,
      trash: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
      edit: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
      external: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>,
      close: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
      database: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>,
      cpu: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>,
      globe: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
    };

    function MarkdownRenderer({ content }) {
      const formattedHtml = marked.parse(content || "");
      return (
        <div 
          className="notion-markdown select-text" 
          dangerouslySetInnerHTML={{ __html: formattedHtml }} 
        />
      );
    }

    function CustomCheckbox({ id, checked, onChange, label, description }) {
      return (
        <div 
          onClick={() => onChange(!checked)}
          class="flex items-start gap-3 p-3 bg-[#1e1e1e] hover:bg-[#252525] rounded-lg border border-[#2e2e2e] transition cursor-pointer select-none group"
        >
          <div class={"w-4 h-4 rounded mt-0.5 flex items-center justify-center transition flex-shrink-0 " + 
            (checked ? "bg-[#529CCA] border border-[#529CCA]" : "bg-[#181818] border border-[#3e3e3e] group-hover:border-[#529CCA]")}
          >
            {checked && (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs font-medium text-white">{label}</span>
            {description && <span class="text-[11px] text-[#787774]">{description}</span>}
          </div>
        </div>
      );
    }

    function App() {
      const [view, setView] = useState("page");
      const [libraries, setLibraries] = useState([]);
      const [currentLib, setCurrentLib] = useState(null);
      const [libraryDocs, setLibraryDocs] = useState([]);
      const [selectedDoc, setSelectedDoc] = useState(null);
      const [copied, setCopied] = useState(false);

      const [activeJobs, setActiveJobs] = useState([]);

      // Active confirmation modal state
      const [confirmModal, setConfirmModal] = useState({ open: false, title: "", message: "", onConfirm: null });
      const [toast, setToast] = useState({ show: false, message: "", type: "info" });

      const showToast = (message, type = "info") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
      };
      const [editOpen, setEditOpen] = useState(false);
      const [editLibName, setEditLibName] = useState("");
      const [editNewName, setEditNewName] = useState("");
      const [editUrlsText, setEditUrlsText] = useState("");
      const [editMaxPages, setEditMaxPages] = useState(500);
      const [editMaxDepth, setEditMaxDepth] = useState(4);
      const [cleanReindex, setCleanReindex] = useState(false);
      const [reindexing, setReindexing] = useState(false);

      // Quick Find / Search Modal State
      const [searchOpen, setSearchOpen] = useState(false);
      const [query, setQuery] = useState("");
      const [results, setResults] = useState([]);
      const [latency, setLatency] = useState(null);
      const [source, setSource] = useState(null);
      const [loading, setLoading] = useState(false);

      // Ingest Modal State
      const [ingestOpen, setIngestOpen] = useState(false);
      const [ingestLib, setIngestLib] = useState("");
      const [ingestUrlsText, setIngestUrlsText] = useState("");
      const [ingestSubpath, setIngestSubpath] = useState("");
      const [showAdvIngest, setShowAdvIngest] = useState(false);
      const [ingestMaxPages, setIngestMaxPages] = useState(500);
      const [ingestMaxDepth, setIngestMaxDepth] = useState(4);
      const [ingestCleanReindex, setIngestCleanReindex] = useState(false);

      // Settings State
      const [settingsTab, setSettingsTab] = useState("general");
      const [config, setConfig] = useState({
        embedding: { provider: "local", baseUrl: "http://127.0.0.1:20128/v1", apiKey: "", model: "text-embedding-3-small" },
        search: { searxngUrl: "http://127.0.0.1:8888", autoStartEmbedded: false },
        crawler: { maxPages: 500, maxDepth: 4 },
        server: { port: 3030, host: "0.0.0.0" }
      });
      const [fetchedModels, setFetchedModels] = useState([]);
      const [fetchingModels, setFetchingModels] = useState(false);
      const [fetchError, setFetchError] = useState("");
      const [savingConfig, setSavingConfig] = useState(false);
      const [configMsg, setConfigMsg] = useState("");

      const searchInputRef = useRef(null);

      useEffect(() => {
        loadLibraries();
        loadConfig();
        pollJobs();

        const interval = setInterval(() => {
          pollJobs();
        }, 1200);

        const handleKeyDown = (e) => {
          if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "p")) {
            e.preventDefault();
            setSearchOpen(true);
          }
          if (e.key === "Escape") {
            setSearchOpen(false);
            setIngestOpen(false);
            setEditOpen(false);
          }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
          clearInterval(interval);
          window.removeEventListener("keydown", handleKeyDown);
        };
      }, []);

      useEffect(() => {
        if (searchOpen) {
          setTimeout(() => searchInputRef.current?.focus(), 50);
        }
      }, [searchOpen]);

      const pollJobs = async () => {
        try {
          const res = await fetch("/api/jobs");
          const data = await res.json();
          setActiveJobs(data.active || []);
          if ((data.active || []).length > 0) {
            loadLibraries();
          }
        } catch {}
      };

      const loadLibraries = async () => {
        try {
          const res = await fetch("/api/libraries");
          const data = await res.json();
          setLibraries(data);
        } catch (e) {
          console.error(e);
        }
      };

      const loadConfig = async () => {
        try {
          const res = await fetch("/api/config");
          const data = await res.json();
          setConfig(data);
          if (data.crawler?.maxPages) setIngestMaxPages(data.crawler.maxPages);
          if (data.crawler?.maxDepth) setIngestMaxDepth(data.crawler.maxDepth);
        } catch (e) {
          console.error(e);
        }
      };

      const handleFetchModels = async () => {
        setFetchingModels(true);
        setFetchError("");
        try {
          const res = await fetch("/api/fetch-models", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              baseUrl: config.embedding?.baseUrl || "http://127.0.0.1:20128/v1",
              apiKey: config.embedding?.apiKey || ""
            })
          });
          const data = await res.json();
          if (data.success && data.models.length > 0) {
            setFetchedModels(data.models);
          } else {
            setFetchError(data.error || "No embedding models found");
          }
        } catch (err) {
          setFetchError(err.message);
        } finally {
          setFetchingModels(false);
        }
      };

      const openLibrary = async (libName) => {
        try {
          const res = await fetch("/api/library-docs?library=" + encodeURIComponent(libName));
          const docs = await res.json();
          setLibraryDocs(docs);
          setCurrentLib(libName);
          setView("library");
          if (docs.length > 0) {
            loadDoc(docs[0].id);
          } else {
            setSelectedDoc(null);
          }
        } catch (e) {
          console.error(e);
        }
      };

      const loadDoc = async (id) => {
        try {
          const res = await fetch("/api/doc?id=" + encodeURIComponent(id));
          const doc = await res.json();
          setSelectedDoc(doc);
        } catch (e) {
          console.error(e);
        }
      };

      const handleDeleteLibrary = (libName, e) => {
        if (e) e.stopPropagation();
        setConfirmModal({
          open: true,
          title: "Delete Library",
          message: "Are you sure you want to permanently delete '" + libName + "' and all its indexed vector embeddings?",
          onConfirm: async () => {
            setConfirmModal({ open: false, title: "", message: "", onConfirm: null });
            try {
              const res = await fetch("/api/library?name=" + encodeURIComponent(libName), { method: "DELETE" });
              const data = await res.json();
              if (data.success) {
                showToast("Library '" + libName + "' deleted successfully", "success");
                loadLibraries();
                if (currentLib === libName) {
                  setView("page");
                  setCurrentLib(null);
                }
              }
            } catch (err) {
              showToast("Failed to delete: " + err.message, "error");
            }
          }
        });
      };

      const openEditModal = (lib, e) => {
        if (e) e.stopPropagation();
        setEditLibName(lib.name);
        setEditNewName(lib.name);
        
        let urls = [];
        try {
          urls = JSON.parse(lib.sourceUrl || "[]");
          if (!Array.isArray(urls)) urls = [lib.sourceUrl];
        } catch {
          urls = lib.sourceUrl ? [lib.sourceUrl] : [];
        }
        setEditUrlsText(urls.join("\\n"));
        setEditMaxPages(config.crawler?.maxPages || 500);
        setEditMaxDepth(config.crawler?.maxDepth || 4);
        setCleanReindex(false);
        setEditOpen(true);
      };

      const handleEditSubmit = async (e) => {
        e.preventDefault();
        const cleanName = editNewName.trim().toLowerCase();
        if (!cleanName) return;

        setReindexing(true);
        try {
          if (cleanName !== editLibName) {
            await fetch("/api/library/rename", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ oldName: editLibName, newName: cleanName })
            });
          }

          const urls = editUrlsText.split(/[\\n,]+/).map(u => u.trim()).filter(Boolean);

          if (urls.length > 0) {
            await fetch("/api/ingest", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                library: cleanName,
                targets: urls,
                cleanReindex: cleanReindex,
                maxPages: editMaxPages,
                maxDepth: editMaxDepth
              })
            });
          }

          setEditOpen(false);
          loadLibraries();
          pollJobs();
        } catch (err) {
          alert("Update failed: " + err.message);
        } finally {
          setReindexing(false);
        }
      };

      const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        try {
          const url = "/api/search?q=" + encodeURIComponent(query) + "&limit=12";
          const res = await fetch(url);
          const data = await res.json();
          setResults(data.results || []);
          setLatency(data.latencyMs);
          setSource(data.source);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };

      const handleSelectSearchResult = (id, libName, isWeb, url) => {
        setSearchOpen(false);
        if (isWeb || libName === "live-web") {
          window.open(url, "_blank");
        } else {
          openLibrary(libName).then(() => {
            loadDoc(id);
          });
        }
      };

      const handleCopyDoc = () => {
        if (!selectedDoc) return;
        navigator.clipboard.writeText(selectedDoc.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      };

      const handleIngest = async (e) => {
        e.preventDefault();
        if (!ingestLib || !ingestUrlsText) return;

        const lib = ingestLib.trim().toLowerCase();
        const urls = ingestUrlsText.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
        const sub = ingestSubpath.trim();

        setIngestOpen(false);
        setIngestLib("");
        setIngestUrlsText("");

        try {
          await fetch("/api/ingest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              library: lib,
              targets: urls,
              subpath: sub,
              cleanReindex: ingestCleanReindex,
              maxPages: ingestMaxPages,
              maxDepth: ingestMaxDepth
            })
          });
          showToast("Started background crawl for '" + lib + "'", "info");
          pollJobs();
        } catch (err) {
          showToast("Ingest error: " + err.message, "error");
        }
      };

      const handleSaveConfig = async (e) => {
        if (e) e.preventDefault();
        setSavingConfig(true);
        setConfigMsg("");
        try {
          const res = await fetch("/api/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(config)
          });
          const data = await res.json();
          if (data.success) {
            setConfigMsg("Settings saved successfully");
            setTimeout(() => setConfigMsg(""), 2500);
          } else {
            setConfigMsg("Error: " + data.error);
          }
        } catch (err) {
          setConfigMsg("Error: " + err.message);
        } finally {
          setSavingConfig(false);
        }
      };

      const getTagColorClass = (name) => {
        if (name === "live-web") return "notion-tag-orange";
        const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colors = ["notion-tag-blue", "notion-tag-green", "notion-tag-purple", "notion-tag-orange", "notion-tag-gray"];
        return colors[hash % colors.length];
      };

      const totalDocsCount = libraries.reduce((acc, l) => acc + l.docCount, 0);

      return (
        <div class="flex h-full w-full bg-[#191919] text-[#D4D4D4] font-sans">
          {/* Left Notion Sidebar */}
          <aside class="w-60 bg-[#202020] border-r border-[#2a2a2a] flex flex-col justify-between select-none flex-shrink-0">
            <div class="flex flex-col">
              <div 
                onClick={() => setView("page")}
                class="px-3.5 py-3 flex items-center justify-between hover:bg-[#282828] cursor-pointer m-1 rounded transition text-xs"
              >
                <div class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded flex items-center justify-center bg-[#2e2e2e] text-[#D4D4D4]">
                    <Icons.bolt className="w-3.5 h-3.5 text-brand-400" />
                  </div>
                  <span class="font-semibold text-white tracking-tight">docsGround</span>
                </div>
                <span class="text-[10px] text-[#787774] font-mono border border-[#2e2e2e] px-1 py-0.2 rounded bg-[#191919]">v1.0</span>
              </div>

              <div class="px-2 py-1 flex flex-col gap-0.5 text-xs text-[#9B9B9B]">
                <button
                  onClick={() => setSearchOpen(true)}
                  class="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#282828] hover:text-white flex items-center justify-between transition group"
                >
                  <div class="flex items-center gap-2.5">
                    <Icons.search className="w-3.5 h-3.5 text-[#787774]" />
                    <span>Quick Find</span>
                  </div>
                  <kbd class="text-[10px] font-mono text-[#787774] border border-[#2e2e2e] px-1 rounded bg-[#191919]">Ctrl+K</kbd>
                </button>

                <button
                  onClick={() => setView("page")}
                  class={"w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2.5 transition " +
                    (view === "page" ? "bg-[#303030] text-white font-medium" : "hover:bg-[#282828] hover:text-white")}
                >
                  <Icons.document className="w-3.5 h-3.5 text-[#787774]" />
                  <span>Docs Overview</span>
                </button>

                <button
                  onClick={() => setView("settings")}
                  class={"w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2.5 transition " +
                    (view === "settings" ? "bg-[#303030] text-white font-medium" : "hover:bg-[#282828] hover:text-white")}
                >
                  <Icons.settings className="w-3.5 h-3.5 text-[#787774]" />
                  <span>Settings</span>
                </button>
              </div>

              {/* Indexed Libraries List with Actions */}
              <div class="mt-4 px-3 flex flex-col gap-1">
                <div class="flex items-center justify-between px-1 text-[11px] font-medium text-[#787774]">
                  <span>LIBRARIES ({libraries.length})</span>
                  <button onClick={() => setIngestOpen(true)} class="hover:text-white transition p-0.5">
                    <Icons.plus className="w-3 h-3" />
                  </button>
                </div>

                <div class="flex flex-col gap-0.5 max-h-72 overflow-y-auto">
                  {libraries.map((lib) => (
                    <div
                      key={lib.name}
                      onClick={() => openLibrary(lib.name)}
                      class={"px-2.5 py-1.5 rounded text-xs cursor-pointer flex items-center justify-between transition group " +
                        (view === "library" && currentLib === lib.name ? "bg-[#303030] text-white font-medium" : "text-[#9B9B9B] hover:bg-[#282828] hover:text-white")}
                    >
                      <span class="truncate flex items-center gap-2">
                        <Icons.book className="w-3.5 h-3.5 text-[#787774]" />
                        {lib.name}
                      </span>
                      <div class="flex items-center gap-1.5">
                        <span class="text-[11px] font-mono text-[#787774] group-hover:hidden">{lib.docCount}</span>
                        <button
                          onClick={(e) => openEditModal(lib, e)}
                          title="Edit & Re-index"
                          class="hidden group-hover:inline-block p-0.5 text-[#787774] hover:text-white"
                        >
                          <Icons.edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteLibrary(lib.name, e)}
                          title="Delete"
                          class="hidden group-hover:inline-block p-0.5 text-[#787774] hover:text-red-400"
                        >
                          <Icons.trash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div class="p-2 border-t border-[#2a2a2a] flex flex-col gap-1">
              <button
                onClick={() => setIngestOpen(true)}
                class="w-full text-left px-2.5 py-1.5 rounded text-xs text-[#9B9B9B] hover:bg-[#282828] hover:text-white transition flex items-center gap-2"
              >
                <Icons.plus className="w-3.5 h-3.5 text-[#787774]" />
                <span>Add Library</span>
              </button>
            </div>
          </aside>

          {/* View: Per-Library Workspace Reader */}
          {view === "library" && (
            <div class="flex-1 flex h-full overflow-hidden">
              <div class="w-64 bg-[#1b1b1b] border-r border-[#262626] flex flex-col flex-shrink-0">
                <div class="p-3 border-b border-[#262626] flex items-center justify-between">
                  <div class="flex items-center gap-2 overflow-hidden">
                    <span class={"notion-tag font-mono " + getTagColorClass(currentLib)}>{currentLib}</span>
                    <span class="text-xs text-[#787774]">{libraryDocs.length} files</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const libObj = libraries.find(l => l.name === currentLib) || { name: currentLib, sourceUrl: "" };
                        openEditModal(libObj);
                      }}
                      class="text-xs text-[#787774] hover:text-white p-1"
                      title="Edit & Re-index"
                    >
                      <Icons.edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteLibrary(currentLib, e)}
                      class="text-xs text-[#787774] hover:text-red-400 p-1"
                      title="Delete"
                    >
                      <Icons.trash className="w-3 h-3" />
                    </button>
                    <button onClick={() => setView("page")} class="text-xs text-[#787774] hover:text-white p-1">
                      <Icons.close className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div class="flex-1 overflow-y-auto p-1.5 flex flex-col gap-0.5">
                  {libraryDocs.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => loadDoc(d.id)}
                      class={"w-full text-left px-2.5 py-1.5 rounded text-xs transition flex flex-col gap-0.5 " +
                        (selectedDoc?.id === d.id ? "bg-[#2c2c2c] text-white font-medium shadow-sm" : "text-[#9B9B9B] hover:bg-[#232323] hover:text-white")}
                    >
                      <span class="truncate">{d.title || d.path}</span>
                      <span class="text-[10px] font-mono text-[#666666] truncate">{d.path}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div class="flex-1 flex flex-col h-full overflow-y-auto bg-[#191919]">
                {selectedDoc ? (
                  <div class="max-w-4xl w-full mx-auto px-12 py-10 flex flex-col gap-6">
                    <div class="flex items-start justify-between pb-4 border-b border-[#262626]">
                      <div class="flex flex-col gap-1.5">
                        <div class="flex items-center gap-2">
                          <span class={"notion-tag font-mono " + getTagColorClass(selectedDoc.library)}>{selectedDoc.library}</span>
                          <span class="text-xs font-mono text-[#787774]">{selectedDoc.version}</span>
                        </div>
                        <h1 class="text-2xl font-bold text-white tracking-tight">{selectedDoc.title}</h1>
                        <a href={selectedDoc.url || "#"} target="_blank" rel="noreferrer" class="text-xs font-mono text-[#787774] hover:text-[#529CCA] flex items-center gap-1.5">
                          <Icons.external className="w-3 h-3" /> {selectedDoc.path}
                        </a>
                      </div>
                      <button
                        onClick={handleCopyDoc}
                        class="px-3 py-1.5 rounded bg-[#242424] hover:bg-[#2e2e2e] border border-[#2a2a2a] text-xs text-white transition flex items-center gap-1.5 shadow-sm"
                      >
                        {copied ? <Icons.check className="w-3 h-3 text-emerald-400" /> : <Icons.copy className="w-3 h-3 text-[#787774]" />}
                        {copied ? "Copied" : "Copy Raw"}
                      </button>
                    </div>

                    {selectedDoc.symbols && selectedDoc.symbols.length > 0 && (
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="text-[11px] font-mono text-[#787774] uppercase">Symbols:</span>
                        {selectedDoc.symbols.slice(0, 10).map((sym) => (
                          <span key={sym} class="text-[11px] font-mono px-2 py-0.5 rounded bg-[#222222] text-[#D4D4D4] border border-[#2a2a2a]">
                            {sym}
                          </span>
                        ))}
                      </div>
                    )}

                    <div class="pb-16">
                      <MarkdownRenderer content={selectedDoc.content} />
                    </div>
                  </div>
                ) : (
                  <div class="flex-1 flex items-center justify-center text-xs text-[#787774]">
                    Select a document from the left sidebar to view.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* View: Overview Page */}
          {view === "page" && (
            <main class="flex-1 flex flex-col h-full overflow-y-auto bg-[#191919]">
              <header class="h-11 px-8 border-b border-[#252525] flex items-center justify-between text-xs text-[#787774] sticky top-0 bg-[#191919]/90 backdrop-blur z-20">
                <div class="flex items-center gap-2">
                  <span>docsGround</span>
                  <span>/</span>
                  <span class="text-[#D4D4D4]">Overview</span>
                </div>
                <span class="text-[11px] font-mono text-[#787774] flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Port :3030
                </span>
              </header>

              <div class="max-w-4xl w-full mx-auto px-12 py-10 flex flex-col gap-8">
                <div class="flex flex-col gap-3">
                  <div class="w-10 h-10 rounded-lg bg-[#242424] border border-[#2e2e2e] flex items-center justify-center text-white">
                    <Icons.bolt className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h1 class="text-3xl font-bold text-white tracking-tight">docsGround</h1>
                  <p class="text-xs text-[#9B9B9B]">Real-time grounding and symbol documentation index for AI coding agents.</p>
                </div>

                {/* Floating Active Jobs Progress Banner */}
                {activeJobs.length > 0 && (
                  <div class="flex flex-col gap-2 bg-[#202020] border border-[#2a2a2a] p-4 rounded-xl shadow-lg">
                    <div class="text-xs font-semibold text-white flex items-center gap-2">
                      <i class="fa-solid fa-spinner fa-spin text-[#529CCA]"></i>
                      <span>Background Indexing in Progress ({activeJobs.length} jobs)</span>
                    </div>
                    {activeJobs.map(job => (
                      <div key={job.id} class="flex flex-col gap-1 bg-[#191919] p-3 rounded-lg border border-[#262626]">
                        <div class="flex items-center justify-between text-xs">
                          <span class="font-mono text-white font-medium">{job.library}</span>
                          <span class="font-mono text-[#529CCA]">{job.progress}% ({job.processedFiles}/{job.totalFiles || '?'})</span>
                        </div>
                        <div class="w-full bg-[#262626] h-1.5 rounded-full overflow-hidden mt-1">
                          <div class="bg-[#529CCA] h-full transition-all duration-300 rounded-full" style={{ width: job.progress + '%' }}></div>
                        </div>
                        {job.currentFile && (
                          <span class="text-[10px] font-mono text-[#787774] truncate mt-0.5">{job.currentFile}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div class="border-y border-[#2a2a2a] py-3 flex flex-col gap-2 text-xs">
                  <div class="flex items-center">
                    <span class="w-32 text-[#787774] flex items-center gap-2"><Icons.check className="w-3.5 h-3.5" /> Status</span>
                    <span class="notion-tag-green font-mono px-2 py-0.5 rounded text-[11px]">Active</span>
                  </div>
                  <div class="flex items-center">
                    <span class="w-32 text-[#787774] flex items-center gap-2"><Icons.database className="w-3.5 h-3.5" /> Total Pages</span>
                    <span class="text-white font-mono">{totalDocsCount} indexed documents</span>
                  </div>
                  <div class="flex items-center">
                    <span class="w-32 text-[#787774] flex items-center gap-2"><Icons.cpu className="w-3.5 h-3.5" /> Embedding</span>
                    <span class="notion-tag-blue font-mono px-2 py-0.5 rounded text-[11px]">
                      {config.embedding?.provider === "openai" ? "Gateway (" + config.embedding.model + ")" : "Local ONNX (BGE-Small)"}
                    </span>
                  </div>
                  <div class="flex items-center">
                    <span class="w-32 text-[#787774] flex items-center gap-2"><Icons.globe className="w-3.5 h-3.5" /> Search Engine</span>
                    <span class="notion-tag-purple font-mono px-2 py-0.5 rounded text-[11px]">Built-in Multi-Engine Meta Search</span>
                  </div>
                </div>

                <div class="bg-[#222222] border border-[#2a2a2a] p-4 rounded-lg flex items-start gap-3 text-xs">
                  <Icons.info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div class="flex flex-col gap-1 text-[#D4D4D4]">
                    <span class="font-semibold text-white">Universal Grounding Pipeline</span>
                    <span class="text-[#9B9B9B] leading-relaxed">
                      Press <kbd class="px-1.5 py-0.5 bg-[#191919] border border-[#2e2e2e] rounded text-[#D4D4D4] font-mono">Ctrl+K</kbd> to search. Searches local vectors + FTS5, and automatically queries the live web for broader questions.
                    </span>
                  </div>
                </div>

                {/* Notion Database Table View with Manage Actions */}
                <div class="flex flex-col gap-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-semibold uppercase tracking-wider text-[#787774]">DOCS DATABASE</span>
                      <span class="text-xs font-mono text-[#787774]">({libraries.length} collections)</span>
                    </div>
                    <button
                      onClick={() => setIngestOpen(true)}
                      class="text-xs px-2.5 py-1 rounded bg-[#282828] hover:bg-[#303030] text-white transition flex items-center gap-1.5"
                    >
                      <Icons.plus className="w-3 h-3" /> Ingest New
                    </button>
                  </div>

                  <div class="border border-[#2a2a2a] rounded-lg overflow-hidden divide-y divide-[#2a2a2a] bg-[#202020]">
                    <div class="grid grid-cols-12 px-4 py-2 text-[11px] font-medium text-[#787774] uppercase bg-[#242424]">
                      <div class="col-span-6 flex items-center gap-1.5"><Icons.book className="w-3 h-3" /> Library</div>
                      <div class="col-span-3 flex items-center gap-1.5"><Icons.document className="w-3 h-3" /> Docs Count</div>
                      <div class="col-span-3 text-right">Actions</div>
                    </div>

                    {libraries.map((lib) => (
                      <div key={lib.name} class="grid grid-cols-12 px-4 py-3 text-xs hover:bg-[#282828] items-center transition">
                        <div class="col-span-6 flex items-center gap-2.5 cursor-pointer" onClick={() => openLibrary(lib.name)}>
                          <Icons.book className="w-3.5 h-3.5 text-[#787774]" />
                          <span class={"notion-tag font-mono " + getTagColorClass(lib.name)}>{lib.name}</span>
                          <span class="text-[11px] font-mono text-[#787774]">{lib.latestVersion}</span>
                        </div>
                        <div class="col-span-3 text-xs font-mono text-[#D4D4D4]">
                          {lib.docCount} pages
                        </div>
                        <div class="col-span-3 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => openLibrary(lib.name)}
                            class="px-2.5 py-1 rounded bg-[#2a2a2a] hover:bg-[#333333] text-xs text-white transition inline-flex items-center gap-1"
                          >
                            Open Reader <Icons.external className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={(e) => openEditModal(lib, e)}
                            title="Edit & Re-index"
                            class="p-1 rounded bg-[#2a2a2a] hover:bg-[#333333] text-[#9B9B9B] hover:text-white"
                          >
                            <Icons.edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteLibrary(lib.name, e)}
                            title="Delete"
                            class="p-1 rounded bg-[#2a2a2a] hover:bg-[#333333] text-[#9B9B9B] hover:text-red-400"
                          >
                            <Icons.trash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </main>
          )}

          {/* View: Settings (Structured Tabbed System) */}
          {view === "settings" && (
            <main class="flex-1 flex flex-col h-full bg-[#191919] overflow-hidden">
              <header class="h-11 px-8 border-b border-[#252525] flex items-center justify-between text-xs text-[#787774] sticky top-0 bg-[#191919]/90 backdrop-blur z-20">
                <div class="flex items-center gap-2">
                  <span>docsGround</span>
                  <span>/</span>
                  <span class="text-[#D4D4D4]">Settings</span>
                </div>
              </header>

              <div class="flex-1 max-w-5xl w-full mx-auto px-12 py-8 flex gap-8 overflow-y-auto">
                <div class="w-48 flex flex-col gap-1 flex-shrink-0 text-xs">
                  <span class="text-[11px] font-semibold text-[#787774] uppercase px-2 mb-1">Configuration</span>
                  <button
                    onClick={() => setSettingsTab("general")}
                    class={"text-left px-2.5 py-1.5 rounded transition " + (settingsTab === "general" ? "bg-[#2c2c2c] text-white font-medium" : "text-[#9B9B9B] hover:bg-[#222222] hover:text-white")}
                  >
                    General & Server
                  </button>
                  <button
                    onClick={() => setSettingsTab("crawler")}
                    class={"text-left px-2.5 py-1.5 rounded transition " + (settingsTab === "crawler" ? "bg-[#2c2c2c] text-white font-medium" : "text-[#9B9B9B] hover:bg-[#222222] hover:text-white")}
                  >
                    Crawler & Indexing
                  </button>
                  <button
                    onClick={() => setSettingsTab("embedding")}
                    class={"text-left px-2.5 py-1.5 rounded transition " + (settingsTab === "embedding" ? "bg-[#2c2c2c] text-white font-medium" : "text-[#9B9B9B] hover:bg-[#222222] hover:text-white")}
                  >
                    Embedding Provider
                  </button>
                  <button
                    onClick={() => setSettingsTab("search")}
                    class={"text-left px-2.5 py-1.5 rounded transition " + (settingsTab === "search" ? "bg-[#2c2c2c] text-white font-medium" : "text-[#9B9B9B] hover:bg-[#222222] hover:text-white")}
                  >
                    Search Engine
                  </button>
                </div>

                <div class="flex-1 bg-[#202020] border border-[#2a2a2a] rounded-lg p-6 flex flex-col justify-between text-xs">
                  <form onSubmit={handleSaveConfig} class="flex flex-col gap-6">
                    {settingsTab === "general" && (
                      <div class="flex flex-col gap-4">
                        <div class="border-b border-[#2a2a2a] pb-3">
                          <h2 class="text-sm font-semibold text-white">General & Server Settings</h2>
                          <p class="text-xs text-[#787774] mt-0.5">Control the HTTP & MCP daemon network bindings.</p>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                          <div>
                            <label class="text-[#9B9B9B] block mb-1">Server Host</label>
                            <input
                              type="text"
                              value={config.server?.host || "0.0.0.0"}
                              onChange={(e) => setConfig({ ...config, server: { ...config.server, host: e.target.value } })}
                              class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                          <div>
                            <label class="text-[#9B9B9B] block mb-1">Server Port</label>
                            <input
                              type="number"
                              value={config.server?.port || 3030}
                              onChange={(e) => setConfig({ ...config, server: { ...config.server, port: Number(e.target.value) } })}
                              class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {settingsTab === "crawler" && (
                      <div class="flex flex-col gap-4">
                        <div class="border-b border-[#2a2a2a] pb-3">
                          <h2 class="text-sm font-semibold text-white">Crawler & Indexing Defaults</h2>
                          <p class="text-xs text-[#787774] mt-0.5">Set the default maximum pages and recursive depth for documentation crawls.</p>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                          <div>
                            <label class="text-[#9B9B9B] block mb-1">Default Max Crawled Pages</label>
                            <input
                              type="number"
                              value={config.crawler?.maxPages || 500}
                              onChange={(e) => setConfig({ ...config, crawler: { ...config.crawler, maxPages: Number(e.target.value) } })}
                              class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                          <div>
                            <label class="text-[#9B9B9B] block mb-1">Default Max Crawl Depth</label>
                            <input
                              type="number"
                              value={config.crawler?.maxDepth || 4}
                              onChange={(e) => setConfig({ ...config, crawler: { ...config.crawler, maxDepth: Number(e.target.value) } })}
                              class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {settingsTab === "embedding" && (
                      <div class="flex flex-col gap-4">
                        <div class="border-b border-[#2a2a2a] pb-3">
                          <h2 class="text-sm font-semibold text-white">Embedding Provider & Vectorizer</h2>
                          <p class="text-xs text-[#787774] mt-0.5">Configure semantic embedding engine for dense vector search.</p>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                          <div>
                            <label class="text-[#9B9B9B] block mb-1">Provider Type</label>
                            <select
                              value={config.embedding?.provider || "local"}
                              onChange={(e) => setConfig({ ...config, embedding: { ...config.embedding, provider: e.target.value } })}
                              class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            >
                              <option value="local">Local ONNX (BGE-Small Quantized - Built-in)</option>
                              <option value="openai">OpenAI-Compatible Gateway</option>
                            </select>
                          </div>
                          <div>
                            <label class="text-[#9B9B9B] block mb-1">Active Model Name</label>
                            <input
                              type="text"
                              value={config.embedding?.model || "Xenova/bge-small-en-v1.5"}
                              onChange={(e) => setConfig({ ...config, embedding: { ...config.embedding, model: e.target.value } })}
                              placeholder="e.g. text-embedding-3-small"
                              class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                        </div>

                        {config.embedding?.provider === "openai" && (
                          <div class="flex flex-col gap-4 pt-2 border-t border-[#2a2a2a]">
                            <div class="grid grid-cols-2 gap-4">
                              <div>
                                <label class="text-[#9B9B9B] block mb-1">Gateway Base URL</label>
                                <input
                                  type="text"
                                  value={config.embedding?.baseUrl || ""}
                                  onChange={(e) => setConfig({ ...config, embedding: { ...config.embedding, baseUrl: e.target.value } })}
                                  placeholder="http://127.0.0.1:20128/v1"
                                  class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                                />
                              </div>
                              <div>
                                <label class="text-[#9B9B9B] block mb-1">API Key</label>
                                <input
                                  type="password"
                                  value={config.embedding?.apiKey || ""}
                                  onChange={(e) => setConfig({ ...config, embedding: { ...config.embedding, apiKey: e.target.value } })}
                                  placeholder="Optional"
                                  class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                                />
                              </div>
                            </div>

                            <div class="bg-[#191919] border border-[#2a2a2a] p-3.5 rounded-lg flex flex-col gap-3">
                              <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                  <Icons.cpu className="w-3.5 h-3.5 text-[#529CCA]" />
                                  <span class="font-medium text-white text-[12px]">Fetch Available Embedding Models</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleFetchModels}
                                  disabled={fetchingModels}
                                  class="px-3 py-1 rounded bg-[#282828] hover:bg-[#333333] text-white text-xs transition flex items-center gap-1.5"
                                >
                                  {fetchingModels ? <i class="fa-solid fa-spinner fa-spin text-[10px]"></i> : <Icons.refresh className="w-3 h-3" />}
                                  {fetchingModels ? "Fetching..." : "Fetch Models"}
                                </button>
                              </div>

                              {fetchError && <div class="text-[11px] font-mono text-red-400">{fetchError}</div>}

                              {fetchedModels.length > 0 && (
                                <div class="flex flex-col gap-1.5">
                                  <label class="text-[11px] text-[#787774]">Select embedding model ({fetchedModels.length}):</label>
                                  <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                                    {fetchedModels.map((m) => (
                                      <button
                                        key={m}
                                        type="button"
                                        onClick={() => setConfig({ ...config, embedding: { ...config.embedding, model: m } })}
                                        class={"px-2 py-0.5 rounded text-[11px] font-mono transition border " +
                                          (config.embedding?.model === m 
                                            ? "bg-[#529CCA]/20 text-[#529CCA] border-[#529CCA]/40 font-semibold" 
                                            : "bg-[#222222] text-[#9B9B9B] border-[#2e2e2e] hover:text-white hover:border-[#444444]")}
                                      >
                                        {m}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {settingsTab === "search" && (
                      <div class="flex flex-col gap-4">
                        <div class="border-b border-[#2a2a2a] pb-3">
                          <h2 class="text-sm font-semibold text-white">Live Search Engine Configuration</h2>
                          <p class="text-xs text-[#787774] mt-0.5">Control web meta-search endpoints for live retrieval.</p>
                        </div>
                        <div>
                          <label class="text-[#9B9B9B] block mb-1">Custom SearxNG URL (Optional)</label>
                          <input
                            type="text"
                            value={config.search?.searxngUrl || ""}
                            onChange={(e) => setConfig({ ...config, search: { ...config.search, searxngUrl: e.target.value } })}
                            placeholder="Leave empty to use built-in multi-engine search"
                            class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                          />
                          <span class="text-[11px] text-[#787774] mt-1 block">Default: Built-in DuckDuckGo + Brave Meta-Search (Zero external setup).</span>
                        </div>
                      </div>
                    )}

                    <div class="pt-4 border-t border-[#2a2a2a] flex items-center justify-between">
                      <span class="text-xs font-mono text-emerald-400">{configMsg}</span>
                      <button
                        type="submit"
                        disabled={savingConfig}
                        class="px-4 py-2 rounded bg-[#282828] hover:bg-[#303030] text-white text-xs font-medium transition"
                      >
                        {savingConfig ? "Saving..." : "Save Settings"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </main>
          )}

          {/* Quick Find (Notion Ctrl+K Search Modal) */}
          {searchOpen && (
            <div class="fixed inset-0 notion-modal-overlay z-50 flex items-start justify-center pt-24" onClick={() => setSearchOpen(false)}>
              <div class="w-full max-w-2xl bg-[#202020] border border-[#2e2e2e] rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSearch} class="p-3 border-b border-[#2a2a2a] flex items-center gap-2.5">
                  <Icons.search className="w-4 h-4 text-[#787774] ml-1" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search docs, meaning, or ask question (e.g. 'what is faster rust or bun')..."
                    class="flex-1 bg-transparent text-sm text-white placeholder-[#787774] focus:outline-none"
                  />
                  {loading && <i class="fa-solid fa-spinner fa-spin text-xs text-[#787774] mr-2"></i>}
                  <kbd class="text-[10px] font-mono text-[#787774] border border-[#2a2a2a] px-1 rounded bg-[#191919]">ESC</kbd>
                </form>

                <div class="max-h-96 overflow-y-auto p-2 flex flex-col gap-1">
                  {results.length === 0 && !loading && (
                    <div class="p-8 text-center text-xs text-[#787774]">
                      Type a search query and press Enter.
                    </div>
                  )}

                  {results.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => handleSelectSearchResult(r.id, r.library, r.library === "live-web", r.url)}
                      class="p-2.5 rounded-lg hover:bg-[#282828] cursor-pointer flex flex-col gap-1 transition"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 overflow-hidden">
                          <span class={"notion-tag font-mono " + getTagColorClass(r.library)}>{r.library}</span>
                          <span class="text-xs font-medium text-white truncate">{r.title}</span>
                        </div>
                        {latency && <span class="text-[10px] font-mono text-[#787774]">{source?.toUpperCase()}</span>}
                      </div>
                      <p class="text-xs text-[#9B9B9B] line-clamp-2" dangerouslySetInnerHTML={{ __html: r.snippet }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Edit Library Modal (Rename + Edit URLs + Multi-Link Reindex) */}
          {editOpen && (
            <div class="fixed inset-0 notion-modal-overlay z-50 flex items-start justify-center pt-20" onClick={() => setEditOpen(false)}>
              <div class="w-full max-w-lg bg-[#202020] border border-[#2e2e2e] rounded-xl shadow-2xl p-6 flex flex-col gap-4 text-xs" onClick={(e) => e.stopPropagation()}>
                <div class="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
                  <span class="font-semibold text-white text-sm">Edit Library & Re-index</span>
                  <button onClick={() => setEditOpen(false)} class="text-[#787774] hover:text-white">
                    <Icons.close className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} class="flex flex-col gap-4">
                  <div>
                    <label class="text-[#9B9B9B] block mb-1">Library Name</label>
                    <input
                      type="text"
                      value={editNewName}
                      onChange={(e) => setEditNewName(e.target.value)}
                      class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-500 font-mono"
                    />
                  </div>

                  <div>
                    <label class="text-[#9B9B9B] block mb-1">Source Documentation URLs (one per line)</label>
                    <textarea
                      rows={4}
                      value={editUrlsText}
                      onChange={(e) => setEditUrlsText(e.target.value)}
                      placeholder="https://docs.rs/tauri/latest/tauri/&#10;https://github.com/tauri-apps/tauri"
                      class="w-full bg-[#191919] border border-[#2a2a2a] rounded p-2.5 text-xs text-white focus:outline-none focus:border-neutral-500 font-mono resize-none"
                    />
                    <span class="text-[11px] text-[#787774] mt-1 block">Supports multiple links to crawl and aggregate into the same library.</span>
                  </div>

                  <div class="grid grid-cols-2 gap-3 pt-2 border-t border-[#2a2a2a]">
                    <div>
                      <label class="text-[#9B9B9B] block mb-1">Max Pages</label>
                      <input
                        type="number"
                        value={editMaxPages}
                        onChange={(e) => setEditMaxPages(Number(e.target.value))}
                        class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                      />
                    </div>
                    <div>
                      <label class="text-[#9B9B9B] block mb-1">Max Depth</label>
                      <input
                        type="number"
                        value={editMaxDepth}
                        onChange={(e) => setEditMaxDepth(Number(e.target.value))}
                        class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                      />
                    </div>
                  </div>

                  <CustomCheckbox
                    id="cleanReindex"
                    checked={cleanReindex}
                    onChange={setCleanReindex}
                    label="Clean Re-index"
                    description="Wipe older documents before re-indexing this library"
                  />

                  <div class="flex justify-end gap-2 pt-2 border-t border-[#2a2a2a]">
                    <button
                      type="button"
                      onClick={() => setEditOpen(false)}
                      class="px-3 py-1.5 rounded bg-transparent hover:bg-[#282828] text-[#9B9B9B] hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reindexing}
                      class="px-4 py-1.5 rounded bg-[#282828] hover:bg-[#303030] text-white font-medium transition flex items-center gap-1.5"
                    >
                      {reindexing ? <i class="fa-solid fa-spinner fa-spin"></i> : <Icons.refresh className="w-3.5 h-3.5 text-[#529CCA]" />}
                      Save & Re-index
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Ingest Modal */}
          {ingestOpen && (
            <div class="fixed inset-0 notion-modal-overlay z-50 flex items-start justify-center pt-20" onClick={() => setIngestOpen(false)}>
              <div class="w-full max-w-lg bg-[#202020] border border-[#2e2e2e] rounded-xl shadow-2xl p-6 flex flex-col gap-4 text-xs" onClick={(e) => e.stopPropagation()}>
                <div class="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
                  <span class="font-semibold text-white text-sm">Ingest Documentation in Background</span>
                  <button onClick={() => setIngestOpen(false)} class="text-[#787774] hover:text-white">
                    <Icons.close className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleIngest} class="flex flex-col gap-4">
                  <div>
                    <label class="text-[#9B9B9B] block mb-1">Library Name</label>
                    <input
                      type="text"
                      value={ingestLib}
                      onChange={(e) => setIngestLib(e.target.value)}
                      placeholder="e.g. react, tauri, tokio"
                      class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-500 font-mono"
                    />
                  </div>

                  <div>
                    <label class="text-[#9B9B9B] block mb-1">Documentation URLs (one or more per line)</label>
                    <textarea
                      rows={4}
                      value={ingestUrlsText}
                      onChange={(e) => setIngestUrlsText(e.target.value)}
                      placeholder="https://docs.rs/tokio/latest/tokio/&#10;https://github.com/tokio-rs/tokio"
                      class="w-full bg-[#191919] border border-[#2a2a2a] rounded p-2.5 text-xs text-white focus:outline-none focus:border-neutral-500 font-mono resize-none"
                    />
                    <span class="text-[11px] text-[#787774] mt-1 block">Paste multiple URLs (GitHub repos, docs.rs, web manuals) to combine them under one library.</span>
                  </div>

                  <div class="border border-[#2a2a2a] rounded-lg p-3 bg-[#1c1c1c] flex flex-col gap-3">
                    <div 
                      onClick={() => setShowAdvIngest(!showAdvIngest)}
                      class="flex items-center justify-between cursor-pointer select-none text-[#9B9B9B] hover:text-white"
                    >
                      <span class="font-medium text-[11px] uppercase tracking-wide">Advanced Crawler Options</span>
                      <span class="text-[11px] font-mono">{showAdvIngest ? "Hide ▲" : "Show ▼"}</span>
                    </div>

                    {showAdvIngest && (
                      <div class="flex flex-col gap-3 pt-2 border-t border-[#262626]">
                        <div class="grid grid-cols-3 gap-3">
                          <div>
                            <label class="text-[#787774] block mb-1 text-[11px]">Subpath</label>
                            <input
                              type="text"
                              value={ingestSubpath}
                              onChange={(e) => setIngestSubpath(e.target.value)}
                              placeholder="(optional, e.g. docs)"
                              class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                          <div>
                            <label class="text-[#787774] block mb-1 text-[11px]">Max Pages</label>
                            <input
                              type="number"
                              value={ingestMaxPages}
                              onChange={(e) => setIngestMaxPages(Number(e.target.value))}
                              class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                          <div>
                            <label class="text-[#787774] block mb-1 text-[11px]">Max Depth</label>
                            <input
                              type="number"
                              value={ingestMaxDepth}
                              onChange={(e) => setIngestMaxDepth(Number(e.target.value))}
                              class="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                        </div>

                        <CustomCheckbox
                          id="ingestCleanReindex"
                          checked={ingestCleanReindex}
                          onChange={setIngestCleanReindex}
                          label="Clean Re-index"
                          description="Overwrite any previously indexed pages with fresh data"
                        />
                      </div>
                    )}
                  </div>

                  <div class="flex justify-end gap-2 pt-2 border-t border-[#2a2a2a]">
                    <button
                      type="button"
                      onClick={() => setIngestOpen(false)}
                      class="px-3 py-1.5 rounded bg-transparent hover:bg-[#282828] text-[#9B9B9B] hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      class="px-4 py-1.5 rounded bg-[#282828] hover:bg-[#303030] text-white font-medium transition flex items-center gap-1.5"
                    >
                      <Icons.plus className="w-3.5 h-3.5 text-[#529CCA]" />
                      Start Ingest
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Custom Confirmation Modal (Notion-Styled) */}
          {confirmModal.open && (
            <div class="fixed inset-0 notion-modal-overlay z-50 flex items-start justify-center pt-24" onClick={() => setConfirmModal({ open: false, title: "", message: "", onConfirm: null })}>
              <div class="w-full max-w-md bg-[#202020] border border-[#2e2e2e] rounded-xl shadow-2xl p-6 flex flex-col gap-4 text-xs" onClick={(e) => e.stopPropagation()}>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
                    <Icons.trash className="w-4 h-4 text-red-400" />
                  </div>
                  <div class="flex flex-col">
                    <span class="font-semibold text-white text-sm">{confirmModal.title}</span>
                    <span class="text-xs text-[#9B9B9B] mt-0.5 leading-relaxed">{confirmModal.message}</span>
                  </div>
                </div>

                <div class="flex justify-end gap-2 pt-3 border-t border-[#2a2a2a]">
                  <button
                    type="button"
                    onClick={() => setConfirmModal({ open: false, title: "", message: "", onConfirm: null })}
                    class="px-3 py-1.5 rounded bg-transparent hover:bg-[#282828] text-[#9B9B9B] hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmModal.onConfirm}
                    class="px-4 py-1.5 rounded bg-red-600/80 hover:bg-red-600 text-white font-medium transition"
                  >
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification Banner */}
          {toast.show && (
            <div class="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-[#242424] border border-[#2e2e2e] text-xs text-white shadow-2xl animate-fade-in">
              <span class={"w-2 h-2 rounded-full " + (toast.type === "success" ? "bg-emerald-400" : toast.type === "error" ? "bg-red-400" : "bg-[#529CCA]")}></span>
              <span>{toast.message}</span>
            </div>
          )}
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<App />);
  </script>
</body>
</html>`;
}
