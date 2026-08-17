// @ts-nocheck — Browser-script bundle (React via CDN globals); transpiled at runtime by Bun.Transpiler, not part of the server type surface.
// docsGround Web UI — Notion-style dark dashboard (see ../server/index.ts:getCompiledFrontendJs)
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
      globe: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
      network: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
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

    function OverviewNeuralGraph({ onOpenDoc }) {
      const [topology, setTopology] = useState({ libraries: [], docs: [] });
      const [activeGlowIds, setActiveGlowIds] = useState(new Set());
      const [lastSearchInfo, setLastSearchInfo] = useState(null);
      const [recentlySpawnedIds, setRecentlySpawnedIds] = useState(new Set());
      const [pan, setPan] = useState({ x: 380, y: 220 });
      const [zoom, setZoom] = useState(0.85);
      const [isDragging, setIsDragging] = useState(false);
      const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
      const [hoveredNode, setHoveredNode] = useState(null);

      // Load initial topology
      useEffect(() => {
        fetch("/api/graph-topology")
          .then(r => r.json())
          .then(data => {
            if (data.libraries && data.docs) setTopology(data);
          })
          .catch(() => {});

        // Connect to Real-time SSE Stream
        const es = new EventSource("/api/events");

        es.addEventListener("search_fired", (e) => {
          try {
            const data = JSON.parse(e.data);
            const ids = new Set(data.matchedDocIds || []);
            setActiveGlowIds(ids);
            setLastSearchInfo({ query: data.query, count: ids.size, source: data.source, time: Date.now() });
            
            // Auto clear glow after 4.5 seconds
            setTimeout(() => {
              setActiveGlowIds(prev => {
                const copy = new Set(prev);
                for (const id of ids) copy.delete(id);
                return copy;
              });
            }, 4500);
          } catch {}
        });

        es.addEventListener("doc_indexed", (e) => {
          try {
            const data = JSON.parse(e.data);
            setTopology(prev => {
              if (prev.docs.some(d => d.id === data.docId)) return prev;
              return {
                ...prev,
                docs: [
                  ...prev.docs,
                  {
                    id: data.docId,
                    library: data.library,
                    title: data.title,
                    path: data.path,
                    symbols: data.symbols || []
                  }
                ]
              };
            });

            // Mark as recently spawned for pulse animation
            setRecentlySpawnedIds(prev => new Set([...prev, data.docId]));
            setTimeout(() => {
              setRecentlySpawnedIds(prev => {
                const next = new Set(prev);
                next.delete(data.docId);
                return next;
              });
            }, 4000);
          } catch {}
        });

        return () => es.close();
      }, []);

      // Calculate cluster layout for all libraries & their documents
      const clusterRadius = 240;
      const libs = topology.libraries || [];
      const docs = topology.docs || [];

      const nodes = [];
      const edges = [];

      // Center Root Hub
      nodes.push({
        id: "hub:root",
        label: "docsGround",
        type: "root",
        x: 0,
        y: 0,
        color: "#ffffff",
        r: 32
      });

      libs.forEach((lib, libIdx) => {
        const libAngle = (libIdx / Math.max(libs.length, 1)) * 2 * Math.PI - (Math.PI / 2);
        const libX = Math.cos(libAngle) * clusterRadius;
        const libY = Math.sin(libAngle) * clusterRadius;
        const libId = `lib:${lib.name}`;

        const colorMap = {
          bun: "#FF7347",
          tauri: "#529CCA",
          react: "#61DAFB",
          reactflow: "#FF0072",
          slint: "#4DAB9A",
          ratatui: "#9A6DD7"
        };
        const libColor = colorMap[lib.name] || "#4DAB9A";

        // Library Cluster Node
        nodes.push({
          id: libId,
          label: lib.name,
          type: "library",
          x: libX,
          y: libY,
          color: libColor,
          r: 26,
          libName: lib.name
        });

        edges.push({
          id: `e-root-${libId}`,
          fromX: 0,
          fromY: 0,
          toX: libX,
          toY: libY,
          color: libColor,
          active: false
        });

        // Child Doc Nodes for this Library
        const libDocs = docs.filter(d => d.library === lib.name);
        libDocs.forEach((d, dIdx) => {
          const docAngle = (dIdx / Math.max(libDocs.length, 1)) * 2 * Math.PI;
          const dist = 75 + ((dIdx % 3) * 22);
          const docX = libX + Math.cos(docAngle) * dist;
          const docY = libY + Math.sin(docAngle) * dist;
          const isGlowing = activeGlowIds.has(d.id);
          const isSpawned = recentlySpawnedIds.has(d.id);

          nodes.push({
            id: d.id,
            label: d.title || d.path,
            type: "doc",
            x: docX,
            y: docY,
            color: isGlowing ? "#52FFB8" : isSpawned ? "#FFD700" : libColor,
            r: isGlowing ? 14 : isSpawned ? 13 : 8,
            docId: d.id,
            library: d.library,
            isGlowing,
            isSpawned
          });

          edges.push({
            id: `e-${libId}-${d.id}`,
            fromX: libX,
            fromY: libY,
            toX: docX,
            toY: docY,
            color: isGlowing ? "#52FFB8" : libColor,
            active: isGlowing
          });
        });
      });

      const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      };

      const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      };

      const handleMouseUp = () => setIsDragging(false);

      const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(z => Math.max(0.3, Math.min(2.5, z * delta)));
      };

      return (
        <div 
          className="relative w-full h-[460px] bg-[#121212] border border-[#262626] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none shadow-2xl"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Header Overlay */}
          <div className="absolute top-3 left-4 z-10 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#1b1b1b]/90 backdrop-blur border border-[#2e2e2e] px-3 py-1.5 rounded-lg text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white font-medium">Neural Knowledge Map</span>
              <span className="text-[#787774]">({docs.length} neurons live)</span>
            </div>

            {lastSearchInfo && (
              <div className="flex items-center gap-2 bg-[#10231c]/90 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-mono animate-fade-in shadow-lg">
                <span className="text-xs">⚡</span>
                <span className="font-semibold">Agent Search:</span>
                <span className="truncate max-w-[200px]">"{lastSearchInfo.query}"</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-200 rounded text-[10px] font-bold">
                  {lastSearchInfo.count} neurons glowing
                </span>
              </div>
            )}
          </div>

          <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1 bg-[#1b1b1b]/90 border border-[#2e2e2e] p-1 rounded-lg text-xs">
            <button onClick={() => setZoom(z => Math.min(2.5, z * 1.2))} className="px-2 py-1 hover:bg-[#2e2e2e] text-white rounded">+</button>
            <button onClick={() => setZoom(z => Math.max(0.3, z * 0.8))} className="px-2 py-1 hover:bg-[#2e2e2e] text-white rounded">-</button>
            <button onClick={() => { setPan({ x: 380, y: 220 }); setZoom(0.85); }} className="px-2 py-1 hover:bg-[#2e2e2e] text-xs text-[#9B9B9B] hover:text-white rounded">Reset View</button>
          </div>

          <svg className="w-full h-full">
            <defs>
              <pattern id="overview-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="0.8" fill="#262626" />
              </pattern>
              {/* Glow Filter for Active Search Neurons */}
              <filter id="electric-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#overview-grid)" />

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Axon Edges */}
              {edges.map(edge => (
                <line
                  key={edge.id}
                  x1={edge.fromX}
                  y1={edge.fromY}
                  x2={edge.toX}
                  y2={edge.toY}
                  stroke={edge.color}
                  strokeWidth={edge.active ? "2.5" : "1"}
                  strokeOpacity={edge.active ? "0.9" : "0.22"}
                  strokeDasharray={edge.active ? "4 2" : "none"}
                  filter={edge.active ? "url(#electric-glow)" : undefined}
                />
              ))}

              {/* Neuron Nodes */}
              {nodes.map(node => (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (node.docId) onOpenDoc(node.library, node.docId);
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={node.docId ? "cursor-pointer group" : "cursor-default"}
                >
                  {/* Glowing Radar Pulse for Active Search Matches */}
                  {node.isGlowing && (
                    <circle
                      r={node.r * 2.4}
                      fill="none"
                      stroke="#52FFB8"
                      strokeWidth="1.5"
                      strokeOpacity="0.8"
                      className="animate-ping"
                    />
                  )}

                  {/* Spawn Pulse for newly indexed docs */}
                  {node.isSpawned && (
                    <circle
                      r={node.r * 2}
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth="2"
                      strokeOpacity="0.9"
                      className="animate-ping"
                    />
                  )}

                  <circle
                    r={node.r}
                    fill="#181818"
                    stroke={node.color}
                    strokeWidth={node.isGlowing ? "3" : hoveredNode?.id === node.id ? "2.5" : "1.5"}
                    filter={node.isGlowing ? "url(#electric-glow)" : undefined}
                    className="transition-all duration-200"
                  />
                  <circle
                    r={node.r * 0.75}
                    fill={node.color}
                    fillOpacity={node.isGlowing ? "0.85" : "0.25"}
                  />

                  {/* Node Label */}
                  {(node.type === "root" || node.type === "library" || node.isGlowing || hoveredNode?.id === node.id) && (
                    <text
                      textAnchor="middle"
                      dy={node.type === "doc" ? "-12" : "4"}
                      fill={node.isGlowing ? "#52FFB8" : "#ffffff"}
                      fontSize={node.type === "root" ? "12" : node.type === "library" ? "11" : "10"}
                      fontWeight={node.isGlowing ? "700" : "500"}
                      fontFamily="Inter, sans-serif"
                      className="pointer-events-none select-none"
                    >
                      {node.label.length > 18 ? node.label.slice(0, 16) + "…" : node.label}
                    </text>
                  )}
                </g>
              ))}
            </g>
          </svg>
        </div>
      );
    }

    function KnowledgeGraph({ doc, libraryDocs, onSelectDoc }) {
      const canvasRef = useRef(null);
      const [pan, setPan] = useState({ x: 300, y: 250 });
      const [zoom, setZoom] = useState(1);
      const [isDragging, setIsDragging] = useState(false);
      const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
      const [hoveredNode, setHoveredNode] = useState(null);

      // Build graph nodes: Center = current doc; First ring = doc symbols; Outer ring = sibling docs in library
      const symbols = doc.symbols || [];
      const siblings = (libraryDocs || []).filter(d => d.id !== doc.id).slice(0, 10);

      const nodes = [
        { id: doc.id, label: doc.title || doc.path, type: "center", x: 0, y: 0, color: "#4DAB9A", r: 38 }
      ];

      // Symbol Nodes in inner orbit (radius = 160)
      symbols.slice(0, 8).forEach((sym, i) => {
        const angle = (i / Math.min(symbols.length, 8)) * 2 * Math.PI;
        nodes.push({
          id: `sym-${sym}`,
          label: sym,
          type: "symbol",
          x: Math.cos(angle) * 160,
          y: Math.sin(angle) * 160,
          color: "#529CCA",
          r: 22,
          symbolName: sym
        });
      });

      // Sibling Document Nodes in outer orbit (radius = 310)
      siblings.forEach((sib, i) => {
        const angle = (i / siblings.length) * 2 * Math.PI + 0.35;
        nodes.push({
          id: sib.id,
          label: sib.title || sib.path,
          type: "doc",
          x: Math.cos(angle) * 310,
          y: Math.sin(angle) * 310,
          color: "#9A6DD7",
          r: 28,
          docId: sib.id
        });
      });

      const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      };

      const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      };

      const handleMouseUp = () => setIsDragging(false);

      const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(z => Math.max(0.4, Math.min(2.5, z * delta)));
      };

      return (
        <div 
          className="relative w-full h-[650px] bg-[#141414] border border-[#262626] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Legend & Controls Overlay */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#1f1f1f]/90 backdrop-blur border border-[#2e2e2e] p-2 rounded-lg text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-[#4DAB9A]"></span> Active Doc</span>
            <span className="flex items-center gap-1.5 text-[#529CCA]"><span className="w-2.5 h-2.5 rounded-full bg-[#529CCA]"></span> Symbols</span>
            <span className="flex items-center gap-1.5 text-[#9A6DD7]"><span className="w-2.5 h-2.5 rounded-full bg-[#9A6DD7]"></span> Sibling Docs</span>
          </div>

          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 bg-[#1f1f1f]/90 border border-[#2e2e2e] p-1 rounded-lg text-xs">
            <button onClick={() => setZoom(z => Math.min(2.5, z * 1.2))} className="px-2 py-1 hover:bg-[#2e2e2e] text-white rounded">+</button>
            <button onClick={() => setZoom(z => Math.max(0.4, z * 0.8))} className="px-2 py-1 hover:bg-[#2e2e2e] text-white rounded">-</button>
            <button onClick={() => { setPan({ x: 300, y: 250 }); setZoom(1); }} className="px-2 py-1 hover:bg-[#2e2e2e] text-xs text-[#9B9B9B] hover:text-white rounded">Reset</button>
          </div>

          <svg className="w-full h-full">
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="graph-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="0.7" fill="#2a2a2a" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#graph-grid)" />

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              {nodes.filter(n => n.type !== "center").map(target => (
                <path
                  key={`edge-${target.id}`}
                  d={`M 0 0 Q ${target.x * 0.4} ${target.y * 0.7} ${target.x} ${target.y}`}
                  fill="none"
                  stroke={target.type === "symbol" ? "#529CCA" : "#9A6DD7"}
                  strokeWidth="1.5"
                  strokeOpacity="0.45"
                  strokeDasharray={target.type === "symbol" ? "3 3" : "none"}
                />
              ))}

              {/* Nodes */}
              {nodes.map(node => (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (node.docId) onSelectDoc(node.docId);
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={node.docId ? "cursor-pointer" : "cursor-default"}
                >
                  <circle
                    r={node.r}
                    fill="#1e1e1e"
                    stroke={node.color}
                    strokeWidth={hoveredNode?.id === node.id ? "3" : "2"}
                    className="transition-all duration-150"
                  />
                  <circle
                    r={node.r * 0.7}
                    fill={node.color}
                    fillOpacity="0.18"
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill="#ffffff"
                    fontSize={node.type === "center" ? "12" : "10"}
                    fontWeight="500"
                    fontFamily="Inter, sans-serif"
                    className="pointer-events-none select-none"
                  >
                    {node.label.length > 14 ? node.label.slice(0, 12) + "…" : node.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      );
    }

    function CustomCheckbox({ id, checked, onChange, label, description }) {
      return (
        <div 
          onClick={() => onChange(!checked)}
          className="flex items-start gap-3 p-3 bg-[#1e1e1e] hover:bg-[#252525] rounded-lg border border-[#2e2e2e] transition cursor-pointer select-none group"
        >
          <div className={"w-4 h-4 rounded mt-0.5 flex items-center justify-center transition flex-shrink-0 " + 
            (checked ? "bg-[#529CCA] border border-[#529CCA]" : "bg-[#181818] border border-[#3e3e3e] group-hover:border-[#529CCA]")}
          >
            {checked && (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-white">{label}</span>
            {description && <span className="text-[11px] text-[#787774]">{description}</span>}
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
      const [docTab, setDocTab] = useState("content");
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
        <div className="flex h-full w-full bg-[#191919] text-[#D4D4D4] font-sans">
          {/* Left Notion Sidebar */}
          <aside className="w-60 bg-[#202020] border-r border-[#2a2a2a] flex flex-col justify-between select-none flex-shrink-0">
            <div className="flex flex-col">
              <div 
                onClick={() => setView("page")}
                className="px-3.5 py-3 flex items-center justify-between hover:bg-[#282828] cursor-pointer m-1 rounded transition text-xs"
              >
                <div className="flex items-center gap-2">
                  <img src="/logo.svg" alt="docsGround" className="w-5 h-5 rounded-[6px] flex-shrink-0" />
                  <span className="font-semibold text-white tracking-tight">docsGround</span>
                </div>
                <span className="text-[10px] text-[#787774] font-mono border border-[#2e2e2e] px-1 py-0.2 rounded bg-[#191919]">v1.0</span>
              </div>

              <div className="px-2 py-1 flex flex-col gap-0.5 text-xs text-[#9B9B9B]">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#282828] hover:text-white flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icons.search className="w-3.5 h-3.5 text-[#787774]" />
                    <span>Quick Find</span>
                  </div>
                  <kbd className="text-[10px] font-mono text-[#787774] border border-[#2e2e2e] px-1 rounded bg-[#191919]">Ctrl+K</kbd>
                </button>

                <button
                  onClick={() => setView("page")}
                  className={"w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2.5 transition " +
                    (view === "page" ? "bg-[#303030] text-white font-medium" : "hover:bg-[#282828] hover:text-white")}
                >
                  <Icons.document className="w-3.5 h-3.5 text-[#787774]" />
                  <span>Docs Overview</span>
                </button>

                <button
                  onClick={() => setView("settings")}
                  className={"w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2.5 transition " +
                    (view === "settings" ? "bg-[#303030] text-white font-medium" : "hover:bg-[#282828] hover:text-white")}
                >
                  <Icons.settings className="w-3.5 h-3.5 text-[#787774]" />
                  <span>Settings</span>
                </button>
              </div>

              {/* Indexed Libraries List with Actions */}
              <div className="mt-4 px-3 flex flex-col gap-1">
                <div className="flex items-center justify-between px-1 text-[11px] font-medium text-[#787774]">
                  <span>LIBRARIES ({libraries.length})</span>
                  <button onClick={() => setIngestOpen(true)} className="hover:text-white transition p-0.5">
                    <Icons.plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto">
                  {libraries.map((lib) => (
                    <div
                      key={lib.name}
                      onClick={() => openLibrary(lib.name)}
                      className={"px-2.5 py-1.5 rounded text-xs cursor-pointer flex items-center justify-between transition group " +
                        (view === "library" && currentLib === lib.name ? "bg-[#303030] text-white font-medium" : "text-[#9B9B9B] hover:bg-[#282828] hover:text-white")}
                    >
                      <span className="truncate flex items-center gap-2">
                        <Icons.book className="w-3.5 h-3.5 text-[#787774]" />
                        {lib.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono text-[#787774] group-hover:hidden">{lib.docCount}</span>
                        <button
                          onClick={(e) => openEditModal(lib, e)}
                          title="Edit & Re-index"
                          className="hidden group-hover:inline-block p-0.5 text-[#787774] hover:text-white"
                        >
                          <Icons.edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteLibrary(lib.name, e)}
                          title="Delete"
                          className="hidden group-hover:inline-block p-0.5 text-[#787774] hover:text-red-400"
                        >
                          <Icons.trash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-2 border-t border-[#2a2a2a] flex flex-col gap-1">
              <button
                onClick={() => setIngestOpen(true)}
                className="w-full text-left px-2.5 py-1.5 rounded text-xs text-[#9B9B9B] hover:bg-[#282828] hover:text-white transition flex items-center gap-2"
              >
                <Icons.plus className="w-3.5 h-3.5 text-[#787774]" />
                <span>Add Library</span>
              </button>
            </div>
          </aside>

          {/* View: Per-Library Workspace Reader */}
          {view === "library" && (
            <div className="flex-1 flex h-full overflow-hidden">
              <div className="w-64 bg-[#1b1b1b] border-r border-[#262626] flex flex-col flex-shrink-0">
                <div className="p-3 border-b border-[#262626] flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={"notion-tag font-mono " + getTagColorClass(currentLib)}>{currentLib}</span>
                    <span className="text-xs text-[#787774]">{libraryDocs.length} files</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const libObj = libraries.find(l => l.name === currentLib) || { name: currentLib, sourceUrl: "" };
                        openEditModal(libObj);
                      }}
                      className="text-xs text-[#787774] hover:text-white p-1"
                      title="Edit & Re-index"
                    >
                      <Icons.edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteLibrary(currentLib, e)}
                      className="text-xs text-[#787774] hover:text-red-400 p-1"
                      title="Delete"
                    >
                      <Icons.trash className="w-3 h-3" />
                    </button>
                    <button onClick={() => setView("page")} className="text-xs text-[#787774] hover:text-white p-1">
                      <Icons.close className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-0.5">
                  {libraryDocs.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => loadDoc(d.id)}
                      className={"w-full text-left px-2.5 py-1.5 rounded text-xs transition flex flex-col gap-0.5 " +
                        (selectedDoc?.id === d.id ? "bg-[#2c2c2c] text-white font-medium shadow-sm" : "text-[#9B9B9B] hover:bg-[#232323] hover:text-white")}
                    >
                      <span className="truncate">{d.title || d.path}</span>
                      <span className="text-[10px] font-mono text-[#666666] truncate">{d.path}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#191919]">
                {selectedDoc ? (
                  <div className="max-w-4xl w-full mx-auto px-12 py-10 flex flex-col gap-6">
                    <div className="flex items-start justify-between pb-4 border-b border-[#262626]">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className={"notion-tag font-mono " + getTagColorClass(selectedDoc.library)}>{selectedDoc.library}</span>
                          <span className="text-xs font-mono text-[#787774]">{selectedDoc.version}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">{selectedDoc.title}</h1>
                        <a href={selectedDoc.url || "#"} target="_blank" rel="noreferrer" className="text-xs font-mono text-[#787774] hover:text-[#529CCA] flex items-center gap-1.5">
                          <Icons.external className="w-3 h-3" /> {selectedDoc.path}
                        </a>
                      </div>
                      <button
                        onClick={handleCopyDoc}
                        className="px-3 py-1.5 rounded bg-[#242424] hover:bg-[#2e2e2e] border border-[#2a2a2a] text-xs text-white transition flex items-center gap-1.5 shadow-sm"
                      >
                        {copied ? <Icons.check className="w-3 h-3 text-emerald-400" /> : <Icons.copy className="w-3 h-3 text-[#787774]" />}
                        {copied ? "Copied" : "Copy Raw"}
                      </button>
                    </div>

                    {/* View Switcher: Markdown Document vs Symbol Graph */}
                    <div className="flex items-center gap-2 border-b border-[#262626] pb-2">
                      <button
                        onClick={() => setDocTab("content")}
                        className={"px-3 py-1.5 rounded text-xs transition flex items-center gap-1.5 " +
                          (docTab === "content" ? "bg-[#2c2c2c] text-white font-medium shadow-sm" : "text-[#787774] hover:text-white hover:bg-[#202020]")}
                      >
                        <Icons.document className="w-3.5 h-3.5" />
                        <span>Document Markdown</span>
                      </button>
                      <button
                        onClick={() => setDocTab("graph")}
                        className={"px-3 py-1.5 rounded text-xs transition flex items-center gap-1.5 " +
                          (docTab === "graph" ? "bg-[#2c2c2c] text-white font-medium shadow-sm" : "text-[#787774] hover:text-white hover:bg-[#202020]")}
                      >
                        <Icons.network className="w-3.5 h-3.5 text-[#529CCA]" />
                        <span>Interactive Knowledge Graph</span>
                      </button>
                    </div>

                    {docTab === "graph" ? (
                      <div className="flex flex-col gap-3">
                        <KnowledgeGraph
                          doc={selectedDoc}
                          libraryDocs={libraryDocs}
                          onSelectDoc={(id) => loadDoc(id)}
                        />
                      </div>
                    ) : (
                      <>
                        {selectedDoc.symbols && selectedDoc.symbols.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-mono text-[#787774] uppercase">Symbols:</span>
                            {selectedDoc.symbols.slice(0, 10).map((sym) => (
                              <span key={sym} className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#222222] text-[#D4D4D4] border border-[#2a2a2a]">
                                {sym}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pb-16">
                          <MarkdownRenderer content={selectedDoc.content} />
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-[#787774]">
                    Select a document from the left sidebar to view.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* View: Overview Page */}
          {view === "page" && (
            <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#191919]">
              <header className="h-11 px-8 border-b border-[#252525] flex items-center justify-between text-xs text-[#787774] sticky top-0 bg-[#191919]/90 backdrop-blur z-20">
                <div className="flex items-center gap-2">
                  <span>docsGround</span>
                  <span>/</span>
                  <span className="text-[#D4D4D4]">Overview</span>
                </div>
                <span className="text-[11px] font-mono text-[#787774] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Port :3030
                </span>
              </header>

              <div className="max-w-4xl w-full mx-auto px-12 py-10 flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <img src="/logo.svg" alt="docsGround" className="w-10 h-10 rounded-xl flex-shrink-0 shadow-lg" />
                  <h1 className="text-3xl font-bold text-white tracking-tight">docsGround</h1>
                  <p className="text-xs text-[#9B9B9B]">Real-time grounding and symbol documentation index for AI coding agents.</p>
                </div>

                {/* Floating Active Jobs Progress Banner */}
                {activeJobs.length > 0 && (
                  <div className="flex flex-col gap-2 bg-[#202020] border border-[#2a2a2a] p-4 rounded-xl shadow-lg">
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <i className="fa-solid fa-spinner fa-spin text-[#529CCA]"></i>
                      <span>Background Indexing in Progress ({activeJobs.length} jobs)</span>
                    </div>
                    {activeJobs.map(job => (
                      <div key={job.id} className="flex flex-col gap-1 bg-[#191919] p-3 rounded-lg border border-[#262626]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-white font-medium">{job.library}</span>
                          <span className="font-mono text-[#529CCA]">{job.progress}% ({job.processedFiles}/{job.totalFiles || '?'})</span>
                        </div>
                        <div className="w-full bg-[#262626] h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-[#529CCA] h-full transition-all duration-300 rounded-full" style={{ width: job.progress + '%' }}></div>
                        </div>
                        {job.currentFile && (
                          <span className="text-[10px] font-mono text-[#787774] truncate mt-0.5">{job.currentFile}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-y border-[#2a2a2a] py-3 flex flex-col gap-2 text-xs">
                  <div className="flex items-center">
                    <span className="w-32 text-[#787774] flex items-center gap-2"><Icons.check className="w-3.5 h-3.5" /> Status</span>
                    <span className="notion-tag-green font-mono px-2 py-0.5 rounded text-[11px]">Active</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-[#787774] flex items-center gap-2"><Icons.database className="w-3.5 h-3.5" /> Total Pages</span>
                    <span className="text-white font-mono">{totalDocsCount} indexed documents</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-[#787774] flex items-center gap-2"><Icons.cpu className="w-3.5 h-3.5" /> Embedding</span>
                    <span className="notion-tag-blue font-mono px-2 py-0.5 rounded text-[11px]">
                      {config.embedding?.provider === "openai" ? "Gateway (" + config.embedding.model + ")" : "Local ONNX (BGE-Small)"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-[#787774] flex items-center gap-2"><Icons.globe className="w-3.5 h-3.5" /> Search Engine</span>
                    <span className="notion-tag-purple font-mono px-2 py-0.5 rounded text-[11px]">Built-in Multi-Engine Meta Search</span>
                  </div>
                </div>

                <div className="bg-[#222222] border border-[#2a2a2a] p-4 rounded-lg flex items-start gap-3 text-xs">
                  <Icons.info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col gap-1 text-[#D4D4D4]">
                    <span className="font-semibold text-white">Universal Grounding Pipeline</span>
                    <span className="text-[#9B9B9B] leading-relaxed">
                      Press <kbd className="px-1.5 py-0.5 bg-[#191919] border border-[#2e2e2e] rounded text-[#D4D4D4] font-mono">Ctrl+K</kbd> to search. Searches local vectors + FTS5, and automatically queries the live web for broader questions.
                    </span>
                  </div>
                </div>

                {/* Real-time Interactive Neural Knowledge Graph */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#787774] flex items-center gap-2">
                      <Icons.network className="w-3.5 h-3.5 text-[#529CCA]" /> LIVE KNOWLEDGE NEURONS & AGENT ACTIVITY
                    </span>
                    <span className="text-[11px] text-[#787774] font-mono">Neurons glow green on AI agent query • Gold on crawl</span>
                  </div>
                  <OverviewNeuralGraph
                    onOpenDoc={(lib, docId) => {
                      openLibrary(lib);
                      setTimeout(() => loadDoc(docId), 150);
                    }}
                  />
                </div>

                {/* Notion Database Table View with Manage Actions */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#787774]">DOCS DATABASE</span>
                      <span className="text-xs font-mono text-[#787774]">({libraries.length} collections)</span>
                    </div>
                    <button
                      onClick={() => setIngestOpen(true)}
                      className="text-xs px-2.5 py-1 rounded bg-[#282828] hover:bg-[#303030] text-white transition flex items-center gap-1.5"
                    >
                      <Icons.plus className="w-3 h-3" /> Ingest New
                    </button>
                  </div>

                  <div className="border border-[#2a2a2a] rounded-lg overflow-hidden divide-y divide-[#2a2a2a] bg-[#202020]">
                    <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-medium text-[#787774] uppercase bg-[#242424]">
                      <div className="col-span-6 flex items-center gap-1.5"><Icons.book className="w-3 h-3" /> Library</div>
                      <div className="col-span-3 flex items-center gap-1.5"><Icons.document className="w-3 h-3" /> Docs Count</div>
                      <div className="col-span-3 text-right">Actions</div>
                    </div>

                    {libraries.map((lib) => (
                      <div key={lib.name} className="grid grid-cols-12 px-4 py-3 text-xs hover:bg-[#282828] items-center transition">
                        <div className="col-span-6 flex items-center gap-2.5 cursor-pointer" onClick={() => openLibrary(lib.name)}>
                          <Icons.book className="w-3.5 h-3.5 text-[#787774]" />
                          <span className={"notion-tag font-mono " + getTagColorClass(lib.name)}>{lib.name}</span>
                          <span className="text-[11px] font-mono text-[#787774]">{lib.latestVersion}</span>
                        </div>
                        <div className="col-span-3 text-xs font-mono text-[#D4D4D4]">
                          {lib.docCount} pages
                        </div>
                        <div className="col-span-3 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => openLibrary(lib.name)}
                            className="px-2.5 py-1 rounded bg-[#2a2a2a] hover:bg-[#333333] text-xs text-white transition inline-flex items-center gap-1"
                          >
                            Open Reader <Icons.external className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={(e) => openEditModal(lib, e)}
                            title="Edit & Re-index"
                            className="p-1 rounded bg-[#2a2a2a] hover:bg-[#333333] text-[#9B9B9B] hover:text-white"
                          >
                            <Icons.edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteLibrary(lib.name, e)}
                            title="Delete"
                            className="p-1 rounded bg-[#2a2a2a] hover:bg-[#333333] text-[#9B9B9B] hover:text-red-400"
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
            <main className="flex-1 flex flex-col h-full bg-[#191919] overflow-hidden">
              <header className="h-11 px-8 border-b border-[#252525] flex items-center justify-between text-xs text-[#787774] sticky top-0 bg-[#191919]/90 backdrop-blur z-20">
                <div className="flex items-center gap-2">
                  <span>docsGround</span>
                  <span>/</span>
                  <span className="text-[#D4D4D4]">Settings</span>
                </div>
              </header>

              <div className="flex-1 max-w-5xl w-full mx-auto px-12 py-8 flex gap-8 overflow-y-auto">
                <div className="w-48 flex flex-col gap-1 flex-shrink-0 text-xs">
                  <span className="text-[11px] font-semibold text-[#787774] uppercase px-2 mb-1">Configuration</span>
                  <button
                    onClick={() => setSettingsTab("general")}
                    className={"text-left px-2.5 py-1.5 rounded transition " + (settingsTab === "general" ? "bg-[#2c2c2c] text-white font-medium" : "text-[#9B9B9B] hover:bg-[#222222] hover:text-white")}
                  >
                    General & Server
                  </button>
                  <button
                    onClick={() => setSettingsTab("crawler")}
                    className={"text-left px-2.5 py-1.5 rounded transition " + (settingsTab === "crawler" ? "bg-[#2c2c2c] text-white font-medium" : "text-[#9B9B9B] hover:bg-[#222222] hover:text-white")}
                  >
                    Crawler & Indexing
                  </button>
                  <button
                    onClick={() => setSettingsTab("embedding")}
                    className={"text-left px-2.5 py-1.5 rounded transition " + (settingsTab === "embedding" ? "bg-[#2c2c2c] text-white font-medium" : "text-[#9B9B9B] hover:bg-[#222222] hover:text-white")}
                  >
                    Embedding Provider
                  </button>
                  <button
                    onClick={() => setSettingsTab("search")}
                    className={"text-left px-2.5 py-1.5 rounded transition " + (settingsTab === "search" ? "bg-[#2c2c2c] text-white font-medium" : "text-[#9B9B9B] hover:bg-[#222222] hover:text-white")}
                  >
                    Search Engine
                  </button>
                </div>

                <div className="flex-1 bg-[#202020] border border-[#2a2a2a] rounded-lg p-6 flex flex-col justify-between text-xs">
                  <form onSubmit={handleSaveConfig} className="flex flex-col gap-6">
                    {settingsTab === "general" && (
                      <div className="flex flex-col gap-4">
                        <div className="border-b border-[#2a2a2a] pb-3">
                          <h2 className="text-sm font-semibold text-white">General & Server Settings</h2>
                          <p className="text-xs text-[#787774] mt-0.5">Control the HTTP & MCP daemon network bindings.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[#9B9B9B] block mb-1">Server Host</label>
                            <input
                              type="text"
                              value={config.server?.host || "0.0.0.0"}
                              onChange={(e) => setConfig({ ...config, server: { ...config.server, host: e.target.value } })}
                              className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                          <div>
                            <label className="text-[#9B9B9B] block mb-1">Server Port</label>
                            <input
                              type="number"
                              value={config.server?.port || 3030}
                              onChange={(e) => setConfig({ ...config, server: { ...config.server, port: Number(e.target.value) } })}
                              className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {settingsTab === "crawler" && (
                      <div className="flex flex-col gap-4">
                        <div className="border-b border-[#2a2a2a] pb-3">
                          <h2 className="text-sm font-semibold text-white">Crawler & Indexing Defaults</h2>
                          <p className="text-xs text-[#787774] mt-0.5">Set the default maximum pages and recursive depth for documentation crawls.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[#9B9B9B] block mb-1">Default Max Crawled Pages</label>
                            <input
                              type="number"
                              value={config.crawler?.maxPages || 500}
                              onChange={(e) => setConfig({ ...config, crawler: { ...config.crawler, maxPages: Number(e.target.value) } })}
                              className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                          <div>
                            <label className="text-[#9B9B9B] block mb-1">Default Max Crawl Depth</label>
                            <input
                              type="number"
                              value={config.crawler?.maxDepth || 4}
                              onChange={(e) => setConfig({ ...config, crawler: { ...config.crawler, maxDepth: Number(e.target.value) } })}
                              className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {settingsTab === "embedding" && (
                      <div className="flex flex-col gap-4">
                        <div className="border-b border-[#2a2a2a] pb-3">
                          <h2 className="text-sm font-semibold text-white">Embedding Provider & Vectorizer</h2>
                          <p className="text-xs text-[#787774] mt-0.5">Configure semantic embedding engine for dense vector search.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[#9B9B9B] block mb-1">Provider Type</label>
                            <select
                              value={config.embedding?.provider || "local"}
                              onChange={(e) => setConfig({ ...config, embedding: { ...config.embedding, provider: e.target.value } })}
                              className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            >
                              <option value="local">Local ONNX (BGE-Small Quantized - Built-in)</option>
                              <option value="openai">OpenAI-Compatible Gateway</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[#9B9B9B] block mb-1">Active Model Name</label>
                            <input
                              type="text"
                              value={config.embedding?.model || "Xenova/bge-small-en-v1.5"}
                              onChange={(e) => setConfig({ ...config, embedding: { ...config.embedding, model: e.target.value } })}
                              placeholder="e.g. text-embedding-3-small"
                              className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                        </div>

                        {config.embedding?.provider === "openai" && (
                          <div className="flex flex-col gap-4 pt-2 border-t border-[#2a2a2a]">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[#9B9B9B] block mb-1">Gateway Base URL</label>
                                <input
                                  type="text"
                                  value={config.embedding?.baseUrl || ""}
                                  onChange={(e) => setConfig({ ...config, embedding: { ...config.embedding, baseUrl: e.target.value } })}
                                  placeholder="http://127.0.0.1:20128/v1"
                                  className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                                />
                              </div>
                              <div>
                                <label className="text-[#9B9B9B] block mb-1">API Key</label>
                                <input
                                  type="password"
                                  value={config.embedding?.apiKey || ""}
                                  onChange={(e) => setConfig({ ...config, embedding: { ...config.embedding, apiKey: e.target.value } })}
                                  placeholder="Optional"
                                  className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                                />
                              </div>
                            </div>

                            <div className="bg-[#191919] border border-[#2a2a2a] p-3.5 rounded-lg flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Icons.cpu className="w-3.5 h-3.5 text-[#529CCA]" />
                                  <span className="font-medium text-white text-[12px]">Fetch Available Embedding Models</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleFetchModels}
                                  disabled={fetchingModels}
                                  className="px-3 py-1 rounded bg-[#282828] hover:bg-[#333333] text-white text-xs transition flex items-center gap-1.5"
                                >
                                  {fetchingModels ? <i className="fa-solid fa-spinner fa-spin text-[10px]"></i> : <Icons.refresh className="w-3 h-3" />}
                                  {fetchingModels ? "Fetching..." : "Fetch Models"}
                                </button>
                              </div>

                              {fetchError && <div className="text-[11px] font-mono text-red-400">{fetchError}</div>}

                              {fetchedModels.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[11px] text-[#787774]">Select embedding model ({fetchedModels.length}):</label>
                                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                                    {fetchedModels.map((m) => (
                                      <button
                                        key={m}
                                        type="button"
                                        onClick={() => setConfig({ ...config, embedding: { ...config.embedding, model: m } })}
                                        className={"px-2 py-0.5 rounded text-[11px] font-mono transition border " +
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
                      <div className="flex flex-col gap-4">
                        <div className="border-b border-[#2a2a2a] pb-3">
                          <h2 className="text-sm font-semibold text-white">Live Search Engine Configuration</h2>
                          <p className="text-xs text-[#787774] mt-0.5">Control web meta-search endpoints for live retrieval.</p>
                        </div>
                        <div>
                          <label className="text-[#9B9B9B] block mb-1">Custom SearxNG URL (Optional)</label>
                          <input
                            type="text"
                            value={config.search?.searxngUrl || ""}
                            onChange={(e) => setConfig({ ...config, search: { ...config.search, searxngUrl: e.target.value } })}
                            placeholder="Leave empty to use built-in multi-engine search"
                            className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                          />
                          <span className="text-[11px] text-[#787774] mt-1 block">Default: Built-in DuckDuckGo + Brave Meta-Search (Zero external setup).</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-[#2a2a2a] flex items-center justify-between">
                      <span className="text-xs font-mono text-emerald-400">{configMsg}</span>
                      <button
                        type="submit"
                        disabled={savingConfig}
                        className="px-4 py-2 rounded bg-[#282828] hover:bg-[#303030] text-white text-xs font-medium transition"
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
            <div className="fixed inset-0 notion-modal-overlay z-50 flex items-start justify-center pt-24" onClick={() => setSearchOpen(false)}>
              <div className="w-full max-w-2xl bg-[#202020] border border-[#2e2e2e] rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSearch} className="p-3 border-b border-[#2a2a2a] flex items-center gap-2.5">
                  <Icons.search className="w-4 h-4 text-[#787774] ml-1" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search docs, meaning, or ask question (e.g. 'what is faster rust or bun')..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-[#787774] focus:outline-none"
                  />
                  {loading && <i className="fa-solid fa-spinner fa-spin text-xs text-[#787774] mr-2"></i>}
                  <kbd className="text-[10px] font-mono text-[#787774] border border-[#2a2a2a] px-1 rounded bg-[#191919]">ESC</kbd>
                </form>

                <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-1">
                  {results.length === 0 && !loading && (
                    <div className="p-8 text-center text-xs text-[#787774]">
                      Type a search query and press Enter.
                    </div>
                  )}

                  {results.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => handleSelectSearchResult(r.id, r.library, r.library === "live-web", r.url)}
                      className="p-2.5 rounded-lg hover:bg-[#282828] cursor-pointer flex flex-col gap-1 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className={"notion-tag font-mono " + getTagColorClass(r.library)}>{r.library}</span>
                          <span className="text-xs font-medium text-white truncate">{r.title}</span>
                        </div>
                        {latency && <span className="text-[10px] font-mono text-[#787774]">{source?.toUpperCase()}</span>}
                      </div>
                      <p className="text-xs text-[#9B9B9B] line-clamp-2" dangerouslySetInnerHTML={{ __html: r.snippet }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Edit Library Modal (Rename + Edit URLs + Multi-Link Reindex) */}
          {editOpen && (
            <div className="fixed inset-0 notion-modal-overlay z-50 flex items-start justify-center pt-20" onClick={() => setEditOpen(false)}>
              <div className="w-full max-w-lg bg-[#202020] border border-[#2e2e2e] rounded-xl shadow-2xl p-6 flex flex-col gap-4 text-xs" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
                  <span className="font-semibold text-white text-sm">Edit Library & Re-index</span>
                  <button onClick={() => setEditOpen(false)} className="text-[#787774] hover:text-white">
                    <Icons.close className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[#9B9B9B] block mb-1">Library Name</label>
                    <input
                      type="text"
                      value={editNewName}
                      onChange={(e) => setEditNewName(e.target.value)}
                      className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[#9B9B9B] block mb-1">Source Documentation URLs (one per line)</label>
                    <textarea
                      rows={4}
                      value={editUrlsText}
                      onChange={(e) => setEditUrlsText(e.target.value)}
                      placeholder="https://docs.rs/tauri/latest/tauri/&#10;https://github.com/tauri-apps/tauri"
                      className="w-full bg-[#191919] border border-[#2a2a2a] rounded p-2.5 text-xs text-white focus:outline-none focus:border-neutral-500 font-mono resize-none"
                    />
                    <span className="text-[11px] text-[#787774] mt-1 block">Supports multiple links to crawl and aggregate into the same library.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2a2a2a]">
                    <div>
                      <label className="text-[#9B9B9B] block mb-1">Max Pages</label>
                      <input
                        type="number"
                        value={editMaxPages}
                        onChange={(e) => setEditMaxPages(Number(e.target.value))}
                        className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="text-[#9B9B9B] block mb-1">Max Depth</label>
                      <input
                        type="number"
                        value={editMaxDepth}
                        onChange={(e) => setEditMaxDepth(Number(e.target.value))}
                        className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
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

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#2a2a2a]">
                    <button
                      type="button"
                      onClick={() => setEditOpen(false)}
                      className="px-3 py-1.5 rounded bg-transparent hover:bg-[#282828] text-[#9B9B9B] hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reindexing}
                      className="px-4 py-1.5 rounded bg-[#282828] hover:bg-[#303030] text-white font-medium transition flex items-center gap-1.5"
                    >
                      {reindexing ? <i className="fa-solid fa-spinner fa-spin"></i> : <Icons.refresh className="w-3.5 h-3.5 text-[#529CCA]" />}
                      Save & Re-index
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Ingest Modal */}
          {ingestOpen && (
            <div className="fixed inset-0 notion-modal-overlay z-50 flex items-start justify-center pt-20" onClick={() => setIngestOpen(false)}>
              <div className="w-full max-w-lg bg-[#202020] border border-[#2e2e2e] rounded-xl shadow-2xl p-6 flex flex-col gap-4 text-xs" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
                  <span className="font-semibold text-white text-sm">Ingest Documentation in Background</span>
                  <button onClick={() => setIngestOpen(false)} className="text-[#787774] hover:text-white">
                    <Icons.close className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleIngest} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[#9B9B9B] block mb-1">Library Name</label>
                    <input
                      type="text"
                      value={ingestLib}
                      onChange={(e) => setIngestLib(e.target.value)}
                      placeholder="e.g. react, tauri, tokio"
                      className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[#9B9B9B] block mb-1">Documentation URLs (one or more per line)</label>
                    <textarea
                      rows={4}
                      value={ingestUrlsText}
                      onChange={(e) => setIngestUrlsText(e.target.value)}
                      placeholder="https://docs.rs/tokio/latest/tokio/&#10;https://github.com/tokio-rs/tokio"
                      className="w-full bg-[#191919] border border-[#2a2a2a] rounded p-2.5 text-xs text-white focus:outline-none focus:border-neutral-500 font-mono resize-none"
                    />
                    <span className="text-[11px] text-[#787774] mt-1 block">Paste multiple URLs (GitHub repos, docs.rs, web manuals) to combine them under one library.</span>
                  </div>

                  <div className="border border-[#2a2a2a] rounded-lg p-3 bg-[#1c1c1c] flex flex-col gap-3">
                    <div 
                      onClick={() => setShowAdvIngest(!showAdvIngest)}
                      className="flex items-center justify-between cursor-pointer select-none text-[#9B9B9B] hover:text-white"
                    >
                      <span className="font-medium text-[11px] uppercase tracking-wide">Advanced Crawler Options</span>
                      <span className="text-[11px] font-mono">{showAdvIngest ? "Hide ▲" : "Show ▼"}</span>
                    </div>

                    {showAdvIngest && (
                      <div className="flex flex-col gap-3 pt-2 border-t border-[#262626]">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-[#787774] block mb-1 text-[11px]">Subpath</label>
                            <input
                              type="text"
                              value={ingestSubpath}
                              onChange={(e) => setIngestSubpath(e.target.value)}
                              placeholder="(optional, e.g. docs)"
                              className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                          <div>
                            <label className="text-[#787774] block mb-1 text-[11px]">Max Pages</label>
                            <input
                              type="number"
                              value={ingestMaxPages}
                              onChange={(e) => setIngestMaxPages(Number(e.target.value))}
                              className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                          <div>
                            <label className="text-[#787774] block mb-1 text-[11px]">Max Depth</label>
                            <input
                              type="number"
                              value={ingestMaxDepth}
                              onChange={(e) => setIngestMaxDepth(Number(e.target.value))}
                              className="w-full bg-[#191919] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
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

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#2a2a2a]">
                    <button
                      type="button"
                      onClick={() => setIngestOpen(false)}
                      className="px-3 py-1.5 rounded bg-transparent hover:bg-[#282828] text-[#9B9B9B] hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded bg-[#282828] hover:bg-[#303030] text-white font-medium transition flex items-center gap-1.5"
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
            <div className="fixed inset-0 notion-modal-overlay z-50 flex items-start justify-center pt-24" onClick={() => setConfirmModal({ open: false, title: "", message: "", onConfirm: null })}>
              <div className="w-full max-w-md bg-[#202020] border border-[#2e2e2e] rounded-xl shadow-2xl p-6 flex flex-col gap-4 text-xs" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
                    <Icons.trash className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white text-sm">{confirmModal.title}</span>
                    <span className="text-xs text-[#9B9B9B] mt-0.5 leading-relaxed">{confirmModal.message}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#2a2a2a]">
                  <button
                    type="button"
                    onClick={() => setConfirmModal({ open: false, title: "", message: "", onConfirm: null })}
                    className="px-3 py-1.5 rounded bg-transparent hover:bg-[#282828] text-[#9B9B9B] hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmModal.onConfirm}
                    className="px-4 py-1.5 rounded bg-red-600/80 hover:bg-red-600 text-white font-medium transition"
                  >
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification Banner */}
          {toast.show && (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-[#242424] border border-[#2e2e2e] text-xs text-white shadow-2xl animate-fade-in">
              <span className={"w-2 h-2 rounded-full " + (toast.type === "success" ? "bg-emerald-400" : toast.type === "error" ? "bg-red-400" : "bg-[#529CCA]")}></span>
              <span>{toast.message}</span>
            </div>
          )}
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<App />);