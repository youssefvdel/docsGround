import { Engine } from "../core/engine.js";
import { ConfigManager } from "../core/config.js";

export function createHttpServer(engine: Engine, port: number = 3030) {
  return Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      };

      if (req.method === "OPTIONS") {
        return new Response(null, { headers });
      }

      // API Endpoints
      if (url.pathname === "/api/search" && req.method === "GET") {
        const q = url.searchParams.get("q") || "";
        const lib = url.searchParams.get("library") || undefined;
        const limit = Number(url.searchParams.get("limit")) || 10;
        const results = await engine.query(q, lib, limit);
        return Response.json(results, { headers });
      }

      if (url.pathname === "/api/libraries" && req.method === "GET") {
        const libs = engine.db.listLibraries();
        return Response.json(libs, { headers });
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

      if (url.pathname === "/api/ingest" && req.method === "POST") {
        try {
          const body = await req.json() as any;
          const result = await engine.ingest({
            library: body.library,
            target: body.target,
            subpath: body.subpath || "docs",
            type: body.target.includes("github.com") ? "git" : "web"
          });
          return Response.json({ success: true, ...result }, { headers });
        } catch (err: any) {
          return Response.json({ success: false, error: err.message }, { status: 400, headers });
        }
      }

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
  <title>docsGround ⚡ Live Agent Docs & Grounding</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { background-color: #0b0f17; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .glass-card { background: rgba(18, 24, 38, 0.7); backdrop-filter: blur(14px); border: 1px solid rgba(48, 54, 61, 0.6); }
    .glass-card:hover { border-color: #38ef7d; }
    .accent-gradient { background: linear-gradient(135deg, #38ef7d 0%, #11998e 100%); }
    .tab-active { background: rgba(56, 239, 125, 0.15); color: #38ef7d; border-color: rgba(56, 239, 125, 0.4); }
  </style>
</head>
<body class="min-h-screen flex flex-col antialiased">
  <div id="root" class="flex-1 flex flex-col"></div>

  <script type="text/babel">
    const { useState, useEffect } = React;

    function App() {
      const [tab, setTab] = useState("search");
      const [query, setQuery] = useState("");
      const [results, setResults] = useState([]);
      const [libraries, setLibraries] = useState([]);
      const [selectedLib, setSelectedLib] = useState("");
      const [activeDoc, setActiveDoc] = useState(null);
      const [loading, setLoading] = useState(false);
      const [ingestLib, setIngestLib] = useState("");
      const [ingestUrl, setIngestUrl] = useState("");
      const [ingesting, setIngesting] = useState(false);
      const [ingestMsg, setIngestMsg] = useState("");

      // Settings State
      const [config, setConfig] = useState({
        embedding: { provider: "local", baseUrl: "http://127.0.0.1:20128/v1", apiKey: "", model: "text-embedding-3-small" },
        search: { searxngUrl: "http://127.0.0.1:28080", autoStartEmbedded: true }
      });
      const [savingConfig, setSavingConfig] = useState(false);
      const [configMsg, setConfigMsg] = useState("");

      useEffect(() => {
        loadLibraries();
        loadConfig();
      }, []);

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
        } catch (e) {
          console.error(e);
        }
      };

      const handleSaveConfig = async (e) => {
        e.preventDefault();
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
            setConfigMsg("✅ Settings saved successfully!");
          } else {
            setConfigMsg("❌ " + data.error);
          }
        } catch (err) {
          setConfigMsg("❌ " + err.message);
        } finally {
          setSavingConfig(false);
        }
      };

      const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        try {
          const url = "/api/search?q=" + encodeURIComponent(query) + (selectedLib ? "&library=" + encodeURIComponent(selectedLib) : "");
          const res = await fetch(url);
          const data = await res.json();
          setResults(data.results || []);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };

      const handleViewDoc = async (id) => {
        try {
          const res = await fetch("/api/doc?id=" + encodeURIComponent(id));
          const data = await res.json();
          setActiveDoc(data);
        } catch (e) {
          console.error(e);
        }
      };

      const handleIngest = async (e) => {
        e.preventDefault();
        if (!ingestLib || !ingestUrl) return;
        setIngesting(true);
        setIngestMsg("");
        try {
          const res = await fetch("/api/ingest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ library: ingestLib, target: ingestUrl })
          });
          const data = await res.json();
          if (data.success) {
            setIngestMsg("✅ Indexed " + data.indexed + " docs successfully!");
            setIngestLib("");
            setIngestUrl("");
            loadLibraries();
          } else {
            setIngestMsg("❌ " + data.error);
          }
        } catch (err) {
          setIngestMsg("❌ " + err.message);
        } finally {
          setIngesting(false);
        }
      };

      return (
        <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto p-6 gap-6">
          {/* Header */}
          <header class="flex justify-between items-center pb-6 border-b border-gray-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center text-black font-black text-xl shadow-lg shadow-emerald-500/20">
                ⚡
              </div>
              <div>
                <h1 class="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  docsGround <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">v1.0.0</span>
                </h1>
                <p class="text-xs text-gray-400">Zero-Hallucination Real-time Context Engine for AI Agents</p>
              </div>
            </div>
            
            {/* Tabs */}
            <div class="flex items-center gap-2 bg-[#121826] p-1.5 rounded-xl border border-gray-800 text-xs">
              <button 
                onClick={() => setTab("search")}
                class={"px-4 py-2 rounded-lg font-medium transition " + (tab === "search" ? "tab-active" : "text-gray-400 hover:text-white")}
              >
                <i class="fa-solid fa-magnifying-glass mr-2"></i> Explorer
              </button>
              <button 
                onClick={() => setTab("settings")}
                class={"px-4 py-2 rounded-lg font-medium transition " + (tab === "settings" ? "tab-active" : "text-gray-400 hover:text-white")}
              >
                <i class="fa-solid fa-gear mr-2"></i> Settings
              </button>
            </div>
          </header>

          {/* Tab 1: Search & Ingestion */}
          {tab === "search" && (
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
              <div class="lg:col-span-8 flex flex-col gap-6">
                <form onSubmit={handleSearch} class="glass-card p-4 rounded-2xl flex flex-col gap-3 shadow-xl">
                  <div class="flex gap-2">
                    <div class="relative flex-1">
                      <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                      <input 
                        type="text" 
                        value={query} 
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search docs or ask API syntax (e.g. 'ratatui layout constraint', 'bun sqlite WAL')..."
                        class="w-full bg-[#0b0f17] border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-gray-500 transition"
                      />
                    </div>
                    <select 
                      value={selectedLib} 
                      onChange={e => setSelectedLib(e.target.value)}
                      class="bg-[#0b0f17] border border-gray-700 rounded-xl px-3 text-xs text-gray-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">All Libraries</option>
                      {libraries.map(lib => (
                        <option key={lib.name} value={lib.name}>{lib.name} ({lib.docCount})</option>
                      ))}
                    </select>
                    <button 
                      type="submit" 
                      disabled={loading}
                      class="px-5 py-3 rounded-xl accent-gradient text-black font-semibold text-xs hover:opacity-90 transition flex items-center gap-2"
                    >
                      {loading ? <i class="fa-solid fa-spinner fa-spin"></i> : <i class="fa-solid fa-arrow-right"></i>}
                      Search
                    </button>
                  </div>
                </form>

                {activeDoc && (
                  <div class="glass-card p-6 rounded-2xl flex flex-col gap-4 border border-emerald-500/40">
                    <div class="flex justify-between items-start">
                      <div>
                        <span class="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-mono uppercase">{activeDoc.library}</span>
                        <h2 class="text-lg font-bold text-white mt-2">{activeDoc.title}</h2>
                        <p class="text-xs text-gray-400 mt-0.5">{activeDoc.path}</p>
                      </div>
                      <button onClick={() => setActiveDoc(null)} class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
                    </div>
                    <div class="bg-[#0b0f17] p-4 rounded-xl text-xs font-mono text-gray-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-gray-800">
                      {activeDoc.content}
                    </div>
                  </div>
                )}

                <div class="flex-1 flex flex-col gap-3">
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400">Search Hits ({results.length})</h3>
                  {results.length === 0 && !loading && (
                    <div class="glass-card p-8 rounded-2xl text-center text-gray-500 text-xs flex flex-col items-center gap-2">
                      <i class="fa-regular fa-folder-open text-2xl"></i>
                      No indexed docs found yet. Try searching or ingest a GitHub repo on the right!
                    </div>
                  )}
                  {results.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => handleViewDoc(r.id)}
                      class="glass-card p-4 rounded-xl cursor-pointer transition flex flex-col gap-2 group hover:border-emerald-500"
                    >
                      <div class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                          <span class="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">{r.library}</span>
                          <h4 class="text-sm font-semibold text-white group-hover:text-emerald-400 transition">{r.title}</h4>
                        </div>
                        <span class="text-xs font-mono text-gray-500">Score: {r.score.toFixed(2)}</span>
                      </div>
                      <p class="text-xs text-gray-400 line-clamp-2" dangerouslySetInnerHTML={{__html: r.snippet}}></p>
                    </div>
                  ))}
                </div>
              </div>

              <div class="lg:col-span-4 flex flex-col gap-6">
                <div class="glass-card p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
                  <div class="flex items-center gap-2 text-white font-semibold text-sm">
                    <i class="fa-solid fa-plus-circle text-emerald-400"></i>
                    Ingest New Documentation
                  </div>
                  <form onSubmit={handleIngest} class="flex flex-col gap-3">
                    <div>
                      <label class="text-xs text-gray-400 block mb-1">Library / Tool Name</label>
                      <input 
                        type="text" 
                        value={ingestLib} 
                        onChange={e => setIngestLib(e.target.value)}
                        placeholder="e.g. ratatui, bun, tailwind"
                        class="w-full bg-[#0b0f17] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label class="text-xs text-gray-400 block mb-1">GitHub Repo or Doc URL</label>
                      <input 
                        type="text" 
                        value={ingestUrl} 
                        onChange={e => setIngestUrl(e.target.value)}
                        placeholder="https://github.com/ratatui/ratatui"
                        class="w-full bg-[#0b0f17] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={ingesting}
                      class="mt-1 w-full py-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500 hover:text-black transition flex items-center justify-center gap-2"
                    >
                      {ingesting ? <i class="fa-solid fa-spinner fa-spin"></i> : <i class="fa-solid fa-download"></i>}
                      Start Ingestion
                    </button>
                    {ingestMsg && <p class="text-xs mt-1 text-center font-mono">{ingestMsg}</p>}
                  </form>
                </div>

                <div class="glass-card p-5 rounded-2xl flex flex-col gap-3 shadow-xl">
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">Indexed Libraries</span>
                    <span class="text-xs font-mono text-emerald-400">{libraries.length} active</span>
                  </div>
                  <div class="flex flex-col gap-2 max-h-72 overflow-y-auto">
                    {libraries.map(lib => (
                      <div key={lib.name} class="p-2.5 rounded-lg bg-[#0b0f17] border border-gray-800 flex justify-between items-center">
                        <div>
                          <p class="text-xs font-bold text-white">{lib.name}</p>
                          <p class="text-[10px] text-gray-500">{lib.docCount} docs • {new Date(lib.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <span class="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">{lib.latestVersion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Settings Page */}
          {tab === "settings" && (
            <div class="max-w-3xl w-full mx-auto flex flex-col gap-6">
              <form onSubmit={handleSaveConfig} class="glass-card p-6 rounded-2xl flex flex-col gap-6 shadow-xl">
                <div class="border-b border-gray-800 pb-4">
                  <h2 class="text-base font-bold text-white flex items-center gap-2">
                    <i class="fa-solid fa-brain text-emerald-400"></i> Embedding Provider Configuration
                  </h2>
                  <p class="text-xs text-gray-400 mt-1">Configure whether docsGround runs local ONNX embeddings or routes to any OpenAI-compatible provider (9Router, vLLM, OpenAI, Ollama).</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-xs font-semibold text-gray-300 block mb-1">Embedding Engine</label>
                    <select 
                      value={config.embedding?.provider || "local"} 
                      onChange={e => setConfig({ ...config, embedding: { ...config.embedding, provider: e.target.value } })}
                      class="w-full bg-[#0b0f17] border border-gray-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="local">Local Transformer (BGE-Small / Quantized ONNX)</option>
                      <option value="openai">OpenAI-Compatible Gateway (Custom / 9Router / Remote)</option>
                    </select>
                  </div>

                  <div>
                    <label class="text-xs font-semibold text-gray-300 block mb-1">Model Name</label>
                    <input 
                      type="text" 
                      value={config.embedding?.model || ""} 
                      onChange={e => setConfig({ ...config, embedding: { ...config.embedding, model: e.target.value } })}
                      placeholder="e.g. text-embedding-3-small or bge-small"
                      class="w-full bg-[#0b0f17] border border-gray-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {config.embedding?.provider === "openai" && (
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-800/60">
                    <div>
                      <label class="text-xs font-semibold text-gray-300 block mb-1">Base URL</label>
                      <input 
                        type="text" 
                        value={config.embedding?.baseUrl || ""} 
                        onChange={e => setConfig({ ...config, embedding: { ...config.embedding, baseUrl: e.target.value } })}
                        placeholder="http://127.0.0.1:20128/v1"
                        class="w-full bg-[#0b0f17] border border-gray-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-gray-300 block mb-1">API Key (Optional)</label>
                      <input 
                        type="password" 
                        value={config.embedding?.apiKey || ""} 
                        onChange={e => setConfig({ ...config, embedding: { ...config.embedding, apiKey: e.target.value } })}
                        placeholder="sk-..."
                        class="w-full bg-[#0b0f17] border border-gray-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                )}

                <div class="border-t border-gray-800 pt-4">
                  <h2 class="text-base font-bold text-white flex items-center gap-2 mb-3">
                    <i class="fa-solid fa-globe text-amber-400"></i> Live Search & Meta-Search Config
                  </h2>
                  <div>
                    <label class="text-xs font-semibold text-gray-300 block mb-1">SearxNG Instance URL</label>
                    <input 
                      type="text" 
                      value={config.search?.searxngUrl || ""} 
                      onChange={e => setConfig({ ...config, search: { ...config.search, searxngUrl: e.target.value } })}
                      placeholder="http://127.0.0.1:28080"
                      class="w-full bg-[#0b0f17] border border-gray-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div class="flex justify-between items-center pt-2">
                  <span class="text-xs font-mono text-emerald-400">{configMsg}</span>
                  <button 
                    type="submit" 
                    disabled={savingConfig}
                    class="px-6 py-2.5 rounded-xl accent-gradient text-black font-semibold text-xs hover:opacity-90 transition flex items-center gap-2"
                  >
                    {savingConfig ? <i class="fa-solid fa-spinner fa-spin"></i> : <i class="fa-solid fa-floppy-disk"></i>}
                    Save Settings
                  </button>
                </div>
              </form>
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
