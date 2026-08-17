// @ts-nocheck — Browser-script bundle (React via CDN globals); transpiled at runtime by Bun.Transpiler
const { useState, useEffect, useRef, useMemo } = React;

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
  network: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>,
  layers: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className || "w-4 h-4"}><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
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
      className="flex items-start gap-3 p-3 bg-[#16171b] hover:bg-[#1c1e24] rounded-xl border border-[#23252d] transition cursor-pointer select-none group"
    >
      <div className={"w-4 h-4 rounded-md mt-0.5 flex items-center justify-center transition flex-shrink-0 " + 
        (checked ? "bg-[#10B981] border border-[#10B981]" : "bg-[#121316] border border-[#2b2e38] group-hover:border-[#10B981]")}
      >
        {checked && (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-white">{label}</span>
        {description && <span className="text-[11px] text-[#71717A]">{description}</span>}
      </div>
    </div>
  );
}

function CustomNumberStepper({ value, onChange, min = 0, max = 10000, step = 1, unit = "" }) {
  const handleDecrement = (e) => {
    e.preventDefault();
    const current = Number(value) || 0;
    onChange(Math.max(min, current - step));
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    const current = Number(value) || 0;
    onChange(Math.min(max, current + step));
  };

  const isUnlimited = Number(value) === 0;

  return (
    <div className="flex items-center bg-[#0C0D0F] border border-[#22252D] hover:border-[#333845] focus-within:border-emerald-500 rounded-xl overflow-hidden transition shadow-inner">
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const val = Number(e.target.value);
          onChange(isNaN(val) ? 0 : Math.max(min, Math.min(max, val)));
        }}
        className="w-full bg-transparent px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
      />
      <span className="text-[11px] font-mono text-[#71717A] pr-2.5 select-none whitespace-nowrap">
        {isUnlimited ? "∞ (Unlimited)" : unit}
      </span>
      <div className="flex flex-col border-l border-[#22252D] bg-[#14161A] flex-shrink-0">
        <button
          type="button"
          onClick={handleIncrement}
          className="px-2.5 py-1 hover:bg-[#20232B] text-[#A1A1AA] hover:text-emerald-400 border-b border-[#22252D] transition flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          className="px-2.5 py-1 hover:bg-[#20232B] text-[#A1A1AA] hover:text-emerald-400 transition flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Obsidian Force-Directed Physics Graph View (Spring + Repulsion + Drift)
// -----------------------------------------------------------------------------
// Obsidian Ultra-High-Performance Canvas 2D Physics Graph (Zero DOM Overload)
// -----------------------------------------------------------------------------
function ObsidianGraphCanvas({ topology, activeGlowIds, recentlySpawnedIds, lastSearchInfo, onOpenDoc, height = "520px" }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const panRef = useRef({ x: 500, y: 220 });
  const zoomRef = useRef(0.38);
  const isPanningRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggingNodeRef = useRef(null);
  const hoveredNodeRef = useRef(null);

  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const animFrameRef = useRef(null);

  // Sync Topology into Physics Graph Nodes
  useEffect(() => {
    const libs = topology.libraries || [];
    const docs = topology.docs || [];
    const clusterRadius = libs.length <= 1 ? 0 : 280;

    const newNodes = [];
    const newEdges = [];

    const palette = {
      bun: "#F97316",
      tauri: "#38BDF8",
      react: "#60A5FA",
      reactflow: "#F43F5E",
      slint: "#34D399",
      ratatui: "#A855F7"
    };

    if (libs.length > 1) {
      newNodes.push({
        id: "hub:root",
        label: "docsGround",
        type: "root",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        color: "#10B981",
        r: 26,
        isFixed: true
      });
    }

    libs.forEach((lib, libIdx) => {
      const isSingle = libs.length <= 1;
      const libAngle = (libIdx / Math.max(libs.length, 1)) * 2 * Math.PI - (Math.PI / 2);
      const libX = isSingle ? 0 : Math.cos(libAngle) * clusterRadius;
      const libY = isSingle ? 0 : Math.sin(libAngle) * clusterRadius;
      const libId = `lib:${lib.name}`;
      const libColor = palette[lib.name] || "#10B981";

      const existing = nodesRef.current.find(n => n.id === libId);

      newNodes.push({
        id: libId,
        label: lib.name,
        type: "library",
        x: existing ? existing.x : libX,
        y: existing ? existing.y : libY,
        targetX: libX,
        targetY: libY,
        vx: existing ? existing.vx : 0,
        vy: existing ? existing.vy : 0,
        color: libColor,
        r: isSingle ? 24 : 18,
        libName: lib.name,
        isFixed: isSingle
      });

      if (!isSingle) {
        newEdges.push({
          id: `e-root-${libId}`,
          source: "hub:root",
          target: libId,
          color: libColor,
          length: clusterRadius
        });
      }

      const libDocs = docs.filter(d => (d.library || lib.name) === lib.name);
      libDocs.forEach((d, dIdx) => {
        const docAngle = (dIdx / Math.max(libDocs.length, 1)) * 2 * Math.PI;
        const dist = isSingle ? (110 + ((dIdx % 4) * 35)) : (80 + ((dIdx % 3) * 28));
        const docX = libX + Math.cos(docAngle) * dist;
        const docY = libY + Math.sin(docAngle) * dist;

        const existingDoc = nodesRef.current.find(n => n.id === d.id);

        newNodes.push({
          id: d.id,
          label: d.title || d.path,
          type: "doc",
          x: existingDoc ? existingDoc.x : docX,
          y: existingDoc ? existingDoc.y : docY,
          targetX: docX,
          targetY: docY,
          vx: existingDoc ? existingDoc.vx : 0,
          vy: existingDoc ? existingDoc.vy : 0,
          color: libColor,
          r: 7,
          docId: d.id,
          library: d.library || lib.name
        });

        newEdges.push({
          id: `e-${libId}-${d.id}`,
          source: libId,
          target: d.id,
          color: libColor,
          length: dist
        });
      });
    });

    nodesRef.current = newNodes;
    edgesRef.current = newEdges;
  }, [topology]);

  // Direct Hardware-Accelerated Canvas Rendering & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = container.clientWidth || 800;
    let heightPx = container.clientHeight || 520;
    let hasCentered = false;

    const updateSize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      if (rect.width > 50 && rect.height > 50) {
        width = rect.width;
        heightPx = rect.height;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = heightPx * dpr;
        canvas.style.width = width + "px";
        canvas.style.height = heightPx + "px";
        ctx.resetTransform();
        ctx.scale(dpr, dpr);

        if (!hasCentered) {
          panRef.current = { x: width / 2, y: heightPx / 2 };
          hasCentered = true;
        }
      }
    };

    const ro = new ResizeObserver(() => updateSize());
    ro.observe(container);
    updateSize();

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      zoomRef.current = Math.max(0.12, Math.min(2.5, zoomRef.current * delta));
    };

    container.addEventListener("wheel", onWheel, { passive: false });

    let time = 0;
    const render = () => {
      time += 0.02;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const pan = panRef.current;
      const zoom = zoomRef.current;
      const draggingNode = draggingNodeRef.current;
      const activeGlows = activeGlowIds;
      const spawned = recentlySpawnedIds;

      // 1. Cluster-Restricted Fast Repulsion (O(K * M) instead of O(N^2))
      for (let i = 0; i < nodes.length; i += 2) {
        const na = nodes[i];
        if (!na) continue;
        for (let j = i + 1; j < Math.min(nodes.length, i + 35); j++) {
          const nb = nodes[j];
          if (!nb || (na.type === "doc" && nb.type === "doc" && na.library !== nb.library)) continue;
          const dx = nb.x - na.x;
          const dy = nb.y - na.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 140) {
            const force = (140 - dist) / dist * 0.12;
            if (!na.isFixed && na !== draggingNode) {
              na.vx -= dx * force;
              na.vy -= dy * force;
            }
            if (!nb.isFixed && nb !== draggingNode) {
              nb.vx += dx * force;
              nb.vy += dy * force;
            }
          }
        }
      }

      // 2. Hooke's Elastic Springs
      const nodeMap = new Map(nodes.map(n => [n.id, n]));
      for (const edge of edges) {
        const src = nodeMap.get(edge.source);
        const tgt = nodeMap.get(edge.target);
        if (!src || !tgt) continue;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const displacement = dist - edge.length;
        const springForce = displacement * 0.025;

        if (!src.isFixed && src !== draggingNode) {
          src.vx += (dx / dist) * springForce;
          src.vy += (dy / dist) * springForce;
        }
        if (!tgt.isFixed && tgt !== draggingNode) {
          tgt.vx -= (dx / dist) * springForce;
          tgt.vy -= (dy / dist) * springForce;
        }
      }

      // 3. Ambient Drift & Friction Damping
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.isFixed || n === draggingNode) continue;
        const driftX = Math.sin(time + i * 0.7) * 0.22;
        const driftY = Math.cos(time + i * 0.9) * 0.22;

        n.vx = (n.vx + driftX) * 0.86;
        n.vy = (n.vy + driftY) * 0.86;
        n.x += n.vx;
        n.y += n.vy;
      }

      // -------------------------------------------------------------
      // DRAW CANVAS FRAME
      // -------------------------------------------------------------
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#0A0B0D";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, pan.x * dpr, pan.y * dpr);

      // Draw Grid Dots
      ctx.fillStyle = "#1C1E24";
      const gridSize = 40;
      const startX = Math.floor((-pan.x / zoom) / gridSize) * gridSize - gridSize;
      const startY = Math.floor((-pan.y / zoom) / gridSize) * gridSize - gridSize;
      const endX = startX + (width / zoom) + gridSize * 2;
      const endY = startY + (heightPx / zoom) + gridSize * 2;

      for (let x = startX; x < endX; x += gridSize) {
        for (let y = startY; y < endY; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Edges
      for (const edge of edges) {
        const src = nodeMap.get(edge.source);
        const tgt = nodeMap.get(edge.target);
        if (!src || !tgt) continue;

        const isGlowing = activeGlows.has(tgt.id);
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = isGlowing ? "#34D399" : edge.color;
        ctx.globalAlpha = isGlowing ? 0.9 : 0.22;
        ctx.lineWidth = isGlowing ? 2.5 : 1.2;
        if (isGlowing) {
          ctx.setLineDash([4, 3]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
      ctx.setLineDash([]);

      // Draw Nodes
      const hovered = hoveredNodeRef.current;
      for (const node of nodes) {
        const isGlowing = activeGlows.has(node.id);
        const isSpawned = spawned.has(node.id);
        const isHovered = hovered?.id === node.id;

        // Glowing Halo
        if (isGlowing || isSpawned) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r * 2.4, 0, Math.PI * 2);
          ctx.strokeStyle = isGlowing ? "#34D399" : "#FBBF24";
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.6 + Math.sin(time * 6) * 0.3;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }

        // Base Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = "#111215";
        ctx.fill();
        ctx.strokeStyle = isGlowing ? "#34D399" : isSpawned ? "#FBBF24" : node.color;
        ctx.lineWidth = isGlowing ? 2.8 : isHovered ? 2.4 : 1.6;
        ctx.stroke();

        // Inner Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = isGlowing ? "#34D399" : node.color;
        ctx.globalAlpha = isGlowing ? 0.9 : 0.38;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Labels
        if (node.type === "root" || node.type === "library" || isGlowing || isHovered) {
          ctx.font = `${node.type === "root" ? "bold 13px" : node.type === "library" ? "bold 12px" : "11px"} Inter, sans-serif`;
          ctx.fillStyle = isGlowing ? "#34D399" : "#FFFFFF";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const labelText = node.label.length > 22 ? node.label.slice(0, 20) + "…" : node.label;
          ctx.fillText(labelText, node.x, node.type === "doc" ? node.y - 14 : node.y + 4);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    const handleResize = () => resize();
    window.addEventListener("resize", handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeGlowIds, recentlySpawnedIds]);

  // Hit-testing helpers for interaction
  const getNodeAtPoint = (screenX, screenY) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = screenX - rect.left;
    const mouseY = screenY - rect.top;
    const worldX = (mouseX - panRef.current.x) / zoomRef.current;
    const worldY = (mouseY - panRef.current.y) / zoomRef.current;

    for (let i = nodesRef.current.length - 1; i >= 0; i--) {
      const n = nodesRef.current[i];
      const dx = worldX - n.x;
      const dy = worldY - n.y;
      const hitRadius = (n.r + 6);
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        return n;
      }
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const node = getNodeAtPoint(e.clientX, e.clientY);
    if (node) {
      draggingNodeRef.current = node;
    } else {
      isPanningRef.current = true;
      dragStartRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
    }
  };

  const handleMouseMove = (e) => {
    if (isPanningRef.current) {
      panRef.current = {
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      };
    } else if (draggingNodeRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const node = draggingNodeRef.current;
      node.x = (mouseX - panRef.current.x) / zoomRef.current;
      node.y = (mouseY - panRef.current.y) / zoomRef.current;
      node.vx = 0;
      node.vy = 0;
    } else {
      const hovered = getNodeAtPoint(e.clientX, e.clientY);
      hoveredNodeRef.current = hovered;
    }
  };

  const handleMouseUp = (e) => {
    if (draggingNodeRef.current && !isPanningRef.current) {
      const node = draggingNodeRef.current;
      if (node.docId) {
        onOpenDoc(node.library, node.docId);
      }
    }
    isPanningRef.current = false;
    draggingNodeRef.current = null;
  };

  const resetView = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      panRef.current = { x: rect.width / 2, y: rect.height / 2 };
      zoomRef.current = 0.38;
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{ height }}
      className="relative w-full bg-[#0A0B0D] border border-[#1E2026] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none shadow-2xl"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Obsidian Header Pill */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 pointer-events-none">
        <div className="flex items-center gap-2.5 bg-[#14161A]/90 backdrop-blur-md border border-[#272B33] px-4 py-2 rounded-xl text-xs font-mono shadow-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-white font-semibold tracking-tight">Obsidian Knowledge Mesh</span>
          <span className="text-[#71717A]">({nodesRef.current.filter(n => n.type === 'doc').length} live neurons)</span>
        </div>

        {lastSearchInfo && (
          <div className="flex items-center gap-2 bg-[#064E3B]/80 backdrop-blur border border-emerald-500/40 text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-mono animate-fade-in shadow-2xl">
            <Icons.bolt className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">Search Activated:</span>
            <span className="truncate max-w-[200px]">"{lastSearchInfo.query}"</span>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-200 rounded-full text-[10px] font-bold">
              {lastSearchInfo.count} glowing
            </span>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-[#14161A]/90 backdrop-blur border border-[#272B33] p-1.5 rounded-xl text-xs shadow-xl">
        <button onClick={() => { zoomRef.current = Math.min(2.5, zoomRef.current * 1.2); }} className="w-7 h-7 flex items-center justify-center hover:bg-[#22252C] text-white rounded-lg transition font-mono">+</button>
        <button onClick={() => { zoomRef.current = Math.max(0.12, zoomRef.current * 0.8); }} className="w-7 h-7 flex items-center justify-center hover:bg-[#22252C] text-white rounded-lg transition font-mono">-</button>
        <button onClick={resetView} className="px-3 py-1 hover:bg-[#22252C] text-xs text-[#A1A1AA] hover:text-white rounded-lg transition font-mono">Reset</button>
      </div>

      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main Application Component with Obsidian-Inspired Studio Layout
// -----------------------------------------------------------------------------
function App() {
  const [view, setView] = useState("page"); // "page" | "graph" | "library" | "settings"
  const [libraries, setLibraries] = useState([]);
  const [currentLib, setCurrentLib] = useState(null);
  const [libraryDocs, setLibraryDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docTab, setDocTab] = useState("content");
  const [copied, setCopied] = useState(false);

  const [activeJobs, setActiveJobs] = useState([]);
  const [activeGlowIds, setActiveGlowIds] = useState(new Set());
  const [recentlySpawnedIds, setRecentlySpawnedIds] = useState(new Set());
  const [lastSearchInfo, setLastSearchInfo] = useState(null);
  const [topology, setTopology] = useState({ libraries: [], docs: [] });

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

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [latency, setLatency] = useState(null);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);

  const [ingestOpen, setIngestOpen] = useState(false);
  const [ingestLib, setIngestLib] = useState("");
  const [ingestUrlsText, setIngestUrlsText] = useState("");
  const [ingestSubpath, setIngestSubpath] = useState("");
  const [showAdvIngest, setShowAdvIngest] = useState(false);
  const [ingestMaxPages, setIngestMaxPages] = useState(0);
  const [ingestMaxDepth, setIngestMaxDepth] = useState(0);
  const [ingestCleanReindex, setIngestCleanReindex] = useState(false);

  const [settingsTab, setSettingsTab] = useState("general");
  const [config, setConfig] = useState({
    embedding: { provider: "local", model: "Xenova/bge-small-en-v1.5" },
    crawler: { maxPages: 0, maxDepth: 0 },
    server: { port: 3030, host: "0.0.0.0" }
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMsg, setConfigMsg] = useState("");

  const searchInputRef = useRef(null);

  const loadLibraries = () => {
    fetch("/api/libraries")
      .then(r => r.json())
      .then(data => setLibraries(data))
      .catch(console.error);
  };

  const loadTopology = () => {
    fetch("/api/graph-topology")
      .then(r => r.json())
      .then(data => {
        if (data.libraries && data.docs) setTopology(data);
      })
      .catch(console.error);
  };

  const loadConfig = () => {
    fetch("/api/config")
      .then(r => r.json())
      .then(data => {
        if (data && data.crawler) {
          setConfig(data);
          setIngestMaxPages(data.crawler.maxPages ?? 0);
          setIngestMaxDepth(data.crawler.maxDepth ?? 0);
        }
      })
      .catch(console.error);
  };

  const pollJobs = () => {
    fetch("/api/jobs")
      .then(r => r.json())
      .then(data => {
        const jobs = data.active || [];
        setActiveJobs(jobs);
        if (jobs.some(j => j.status === "completed")) {
          loadLibraries();
          loadTopology();
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadLibraries();
    loadTopology();
    loadConfig();
    pollJobs();

    const interval = setInterval(pollJobs, 650);

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // SSE Stream with event batching
    const es = new EventSource("/api/events");
    let pendingBatch = [];
    let batchTimer = null;

    const flushDocBatch = () => {
      if (pendingBatch.length === 0) return;
      const incoming = [...pendingBatch];
      pendingBatch = [];

      setTopology(prev => {
        const existingSet = new Set(prev.docs.map(d => d.id));
        const toAdd = incoming.filter(d => !existingSet.has(d.docId)).map(d => ({
          id: d.docId,
          library: d.library,
          title: d.title,
          path: d.path,
          symbols: d.symbols || []
        }));
        if (toAdd.length === 0) return prev;
        return {
          ...prev,
          docs: [...prev.docs, ...toAdd]
        };
      });

      const newIds = incoming.map(d => d.docId);
      setRecentlySpawnedIds(prev => new Set([...prev, ...newIds]));
      setTimeout(() => {
        setRecentlySpawnedIds(prev => {
          const next = new Set(prev);
          for (const id of newIds) next.delete(id);
          return next;
        });
      }, 3500);
      loadLibraries();
    };

    es.addEventListener("search_fired", (e) => {
      try {
        const data = JSON.parse(e.data);
        const ids = new Set(data.matchedDocIds || []);
        setActiveGlowIds(ids);
        setLastSearchInfo({ query: data.query, count: ids.size, source: data.source, time: Date.now() });
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
        pendingBatch.push(data);
        if (!batchTimer) {
          batchTimer = setTimeout(() => {
            batchTimer = null;
            flushDocBatch();
          }, 350);
        }
      } catch {}
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
      es.close();
    };
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const openLibrary = async (libName) => {
    setCurrentLib(libName);
    setView("library");
    try {
      const res = await fetch("/api/library-docs?library=" + encodeURIComponent(libName));
      const data = await res.json();
      setLibraryDocs(data);
      if (data.length > 0) {
        loadDoc(data[0].id);
      } else {
        setSelectedDoc(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadDoc = async (docId) => {
    try {
      const res = await fetch("/api/doc?id=" + encodeURIComponent(docId));
      const data = await res.json();
      setSelectedDoc(data);
      setDocTab("content");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLibrary = (libName, e) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      open: true,
      title: `Delete Collection "${libName}"?`,
      message: `Permanently removes all indexed documents and vector embeddings for "${libName}". This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal({ open: false, title: "", message: "", onConfirm: null });
        try {
          const res = await fetch("/api/library?name=" + encodeURIComponent(libName), { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            showToast(`Collection "${libName}" permanently deleted`, "info");
            loadLibraries();
            loadTopology();
            if (currentLib === libName) {
              setCurrentLib(null);
              setSelectedDoc(null);
              setView("page");
            }
          }
        } catch (err) {
          showToast(`Failed: ${err.message}`, "error");
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
    setEditUrlsText(urls.join("\n"));
    setEditMaxPages(config.crawler?.maxPages ?? 0);
    setEditMaxDepth(config.crawler?.maxDepth ?? 0);
    setCleanReindex(false);
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const cleanName = editNewName.trim().toLowerCase();
    if (!cleanName) return;

    const urls = editUrlsText.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
    const oldName = editLibName;
    const isClean = cleanReindex;
    const maxPages = editMaxPages;
    const maxDepth = editMaxDepth;

    // Immediately close modal so user can work / trigger other jobs
    setEditOpen(false);
    showToast(`Started reindexing "${cleanName}" in background`, "success");

    try {
      if (cleanName !== oldName) {
        await fetch("/api/library/rename", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldName, newName: cleanName })
        });
      }

      if (urls.length > 0) {
        await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            library: cleanName,
            targets: urls,
            cleanReindex: isClean,
            maxPages: maxPages,
            maxDepth: maxDepth
          })
        });
      }
      loadLibraries();
      pollJobs();
    } catch (err) {
      showToast("Update failed: " + err.message, "error");
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
    const lib = ingestLib.trim().toLowerCase();
    const urls = ingestUrlsText.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
    if (!lib || urls.length === 0) return;

    try {
      const payload = {
        library: lib,
        targets: urls,
        subpath: ingestSubpath.trim(),
        cleanReindex: ingestCleanReindex,
        maxPages: showAdvIngest ? ingestMaxPages : undefined,
        maxDepth: showAdvIngest ? ingestMaxDepth : undefined
      };

      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setIngestOpen(false);
        setIngestLib("");
        setIngestUrlsText("");
        setIngestSubpath("");
        setIngestCleanReindex(false);
        showToast(`Ingesting ${urls.length} link(s) for "${lib}" in background`, "success");
        loadLibraries();
        pollJobs();
      } else {
        showToast(data.error || "Failed", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const payload = {
        ...config,
        crawler: {
          maxPages: config.crawler?.maxPages !== undefined ? Number(config.crawler.maxPages) : 2000,
          maxDepth: config.crawler?.maxDepth !== undefined ? Number(config.crawler.maxDepth) : 10
        }
      };
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        setIngestMaxPages(data.config.crawler.maxPages);
        setIngestMaxDepth(data.config.crawler.maxDepth);
        setConfigMsg("Saved successfully");
        showToast("Settings saved to disk", "success");
        setTimeout(() => setConfigMsg(""), 2500);
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingConfig(false);
    }
  };

  const totalDocsCount = useMemo(() => {
    return libraries.reduce((acc, l) => acc + (l.docCount || 0), 0);
  }, [libraries]);

  const getTagColorClass = (lib) => {
    const map = {
      bun: "notion-tag-orange",
      tauri: "notion-tag-blue",
      react: "notion-tag-blue",
      reactflow: "notion-tag-purple",
      slint: "notion-tag-green",
      ratatui: "notion-tag-purple"
    };
    return map[lib] || "notion-tag-gray";
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0B0D] text-[#E4E4E7] font-sans text-[13px]">
      
      {/* Slim Obsidian Icon Dock */}
      <aside className="w-14 bg-[#111215] border-r border-[#1F2128] flex flex-col items-center justify-between py-4 select-none flex-shrink-0 z-30">
        <div className="flex flex-col items-center gap-4">
          <div 
            onClick={() => setView("page")}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition shadow-lg"
          >
            <img src="/logo.svg" alt="docsGround" className="w-8 h-8 rounded-lg" />
          </div>

          <div className="w-6 h-[1px] bg-[#242731]"></div>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setView("page")}
              title="Overview & Collections"
              className={"w-9 h-9 rounded-xl flex items-center justify-center transition " + 
                (view === "page" ? "bg-[#1E2129] text-emerald-400 font-bold shadow-inner" : "text-[#71717A] hover:text-white hover:bg-[#181A20]")}
            >
              <Icons.document className="w-4 h-4" />
            </button>

            <button
              onClick={() => setView("graph")}
              title="Knowledge Graph Universe"
              className={"w-9 h-9 rounded-xl flex items-center justify-center transition " + 
                (view === "graph" ? "bg-[#1E2129] text-emerald-400 font-bold shadow-inner" : "text-[#71717A] hover:text-white hover:bg-[#181A20]")}
            >
              <Icons.network className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              title="Search (Ctrl+K)"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#71717A] hover:text-white hover:bg-[#181A20] transition"
            >
              <Icons.search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setView("settings")}
              title="Settings"
              className={"w-9 h-9 rounded-xl flex items-center justify-center transition " + 
                (view === "settings" ? "bg-[#1E2129] text-emerald-400 font-bold shadow-inner" : "text-[#71717A] hover:text-white hover:bg-[#181A20]")}
            >
              <Icons.settings className="w-4 h-4" />
            </button>
          </nav>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setIngestOpen(true)}
            title="Add Library"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition shadow-lg"
          >
            <Icons.plus className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0A0B0D]">
        
        {/* Top Minimalist Header */}
        <header className="h-12 px-6 border-b border-[#1A1C22] flex items-center justify-between text-xs text-[#71717A] bg-[#0E0F12]/90 backdrop-blur z-20">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-white tracking-tight font-mono">docsGround</span>
            <span className="text-[#3F3F46]">/</span>
            <span className="text-[#A1A1AA] font-mono capitalize">{view === "page" ? "Overview" : view === "graph" ? "Knowledge Universe" : view === "library" ? currentLib : "Settings"}</span>
          </div>

          <div className="flex items-center gap-3">
            {activeJobs.slice(0, 2).map(job => (
              <div key={job.id} className="flex items-center gap-2 px-3 py-1 bg-[#0C4A6E]/80 border border-[#0284C7]/50 rounded-xl text-xs font-mono text-[#38BDF8] shadow-lg animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping"></span>
                <span className="font-semibold truncate max-w-[120px]">{job.library}:</span>
                <span>{job.progress}%</span>
                <div className="w-14 bg-[#082F49] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#38BDF8] h-full transition-all duration-200" style={{ width: job.progress + '%' }}></div>
                </div>
              </div>
            ))}
            {activeJobs.length > 2 && (
              <span className="text-[11px] font-mono text-[#38BDF8] px-2 py-0.5 rounded-lg bg-[#0C4A6E]/60 border border-[#0284C7]/40">
                +{activeJobs.length - 2} more
              </span>
            )}

            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#14161A] hover:bg-[#1C1E24] border border-[#23262F] text-xs text-[#A1A1AA] transition shadow-sm group"
            >
              <Icons.search className="w-3.5 h-3.5 text-[#71717A] group-hover:text-white" />
              <span>Search docs or web...</span>
              <kbd className="text-[10px] font-mono text-[#71717A] border border-[#2B2E38] px-1 rounded bg-[#0A0B0D]">Ctrl+K</kbd>
            </button>

            <span className="text-[11px] font-mono text-[#71717A] flex items-center gap-1.5 pl-2 border-l border-[#1F2128]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              :3030
            </span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex h-full overflow-hidden">
          
          {/* VIEW: OVERVIEW */}
          {view === "page" && (
            <main className="flex-1 w-full h-full overflow-y-auto bg-[#0A0B0D]">
              <div className="max-w-6xl w-full mx-auto p-8 flex flex-col gap-8">
                
                {/* Hero Banner */}
                <div className="flex items-center justify-between pb-2 border-b border-[#1A1C22]">
                  <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Documentation Grounding Core</h1>
                    <p className="text-xs text-[#71717A]">Offline high-density semantic vector search with real-time neural activity.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[#14161A] border border-[#242731] rounded-xl text-xs font-mono text-emerald-400 font-semibold">
                      {totalDocsCount} Indexed Documents
                    </span>
                    <span className="px-3 py-1 bg-[#14161A] border border-[#242731] rounded-xl text-xs font-mono text-[#38BDF8]">
                      {libraries.length} Collections
                    </span>
                  </div>
                </div>

                {/* Active Jobs Progress Banner */}
                {activeJobs.length > 0 && (
                  <div className="flex flex-col gap-2.5 bg-[#14161A] border border-[#242731] p-4 rounded-2xl shadow-xl animate-fade-in">
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping"></span>
                      <span>Active Ingestion ({activeJobs.length} jobs in progress)</span>
                    </div>
                    {activeJobs.map(job => (
                      <div key={job.id} className="flex flex-col gap-1.5 bg-[#0C0D0F] p-3 rounded-xl border border-[#1C1E24]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-white font-semibold">{job.library}</span>
                          <span className="font-mono text-[#38BDF8]">{job.progress}% ({job.processedFiles}/{job.totalFiles || '?'})</span>
                        </div>
                        <div className="w-full bg-[#1A1C22] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#38BDF8] h-full transition-all duration-300 rounded-full" style={{ width: job.progress + '%' }}></div>
                        </div>
                        {job.currentFile && (
                          <span className="text-[10px] font-mono text-[#71717A] truncate">{job.currentFile}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Obsidian Physics Graph View */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-2">
                      <Icons.network className="w-3.5 h-3.5 text-emerald-400" /> LIVE NEURAL MESH (FORCE-DIRECTED)
                    </span>
                    <button 
                      onClick={() => setView("graph")}
                      className="text-xs text-[#38BDF8] hover:underline font-mono"
                    >
                      Open Full-Screen Universe →
                    </button>
                  </div>

                  <ObsidianGraphCanvas
                    topology={topology}
                    activeGlowIds={activeGlowIds}
                    recentlySpawnedIds={recentlySpawnedIds}
                    lastSearchInfo={lastSearchInfo}
                    onOpenDoc={(lib, docId) => {
                      openLibrary(lib);
                      setTimeout(() => loadDoc(docId), 150);
                    }}
                    height="440px"
                  />
                </div>

                {/* Collections Grid Cards */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">COLLECTIONS ({libraries.length})</span>
                    <button
                      onClick={() => setIngestOpen(true)}
                      className="text-xs px-3 py-1.5 rounded-xl bg-[#181A20] hover:bg-[#22252C] border border-[#272B33] text-white transition flex items-center gap-1.5 font-medium"
                    >
                      <Icons.plus className="w-3 h-3 text-emerald-400" /> Ingest Documentation
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {libraries.map(lib => {
                      const activeJob = activeJobs.find(j => j.library === lib.name);
                      return (
                        <div 
                          key={lib.name}
                          onClick={() => openLibrary(lib.name)}
                          className={"p-4 bg-[#111216] hover:bg-[#16181E] border rounded-2xl transition cursor-pointer flex flex-col justify-between h-36 group shadow-lg " +
                            (activeJob ? "border-[#0284C7] shadow-sky-950/30 ring-1 ring-[#0284C7]/50" : "border-[#1E2027] hover:border-[#2C303B]")}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-[#1A1C23] flex items-center justify-center text-white">
                                <Icons.book className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-white text-sm group-hover:text-emerald-400 transition">{lib.name}</span>
                                <span className="text-[10px] font-mono text-[#71717A]">{lib.latestVersion}</span>
                              </div>
                            </div>
                            <span className="text-xs font-mono text-[#71717A] bg-[#16181E] px-2 py-0.5 rounded-lg border border-[#22252D]">
                              {lib.docCount} docs
                            </span>
                          </div>

                          {activeJob ? (
                            <div className="flex flex-col gap-1 pt-2 border-t border-[#1C1E24]">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="text-[#38BDF8] font-semibold">
                                  {activeJob.status === "completed" ? "✓ Indexed" : `Indexing (${activeJob.processedFiles}/${activeJob.totalFiles || '?'})`}
                                </span>
                                <span className="text-[#38BDF8]">{activeJob.progress}%</span>
                              </div>
                              <div className="w-full bg-[#14161A] h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[#38BDF8] h-full transition-all duration-200 rounded-full" style={{ width: activeJob.progress + '%' }}></div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#1C1E24]">
                              <span className="text-[11px] text-[#71717A] truncate max-w-[160px]">Open Reader</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => openEditModal(lib, e)}
                                  title="Edit & Re-index"
                                  className="p-1 text-[#71717A] hover:text-white rounded-lg hover:bg-[#22252D] transition"
                                >
                                  <Icons.edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteLibrary(lib.name, e)}
                                  title="Delete"
                                  className="p-1 text-[#71717A] hover:text-rose-400 rounded-lg hover:bg-[#22252D] transition"
                                >
                                  <Icons.trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </main>
          )}

          {/* VIEW: FULL SCREEN GRAPH UNIVERSE */}
          {view === "graph" && (
            <main className="flex-1 flex flex-col h-full bg-[#0A0B0D] p-6 gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A1C22]">
                <div className="flex items-center gap-2 font-mono text-xs text-white">
                  <Icons.network className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-sm">Full-Scale Knowledge Universe</span>
                  <span className="text-[#71717A]">({totalDocsCount} documents connected)</span>
                </div>
                <button 
                  onClick={() => setView("page")}
                  className="px-3 py-1 rounded-xl bg-[#16181E] border border-[#242731] hover:bg-[#20232B] text-xs text-[#A1A1AA] hover:text-white font-mono"
                >
                  ← Back to Overview
                </button>
              </div>

              <div className="flex-1 w-full h-full">
                <ObsidianGraphCanvas
                  topology={topology}
                  activeGlowIds={activeGlowIds}
                  recentlySpawnedIds={recentlySpawnedIds}
                  lastSearchInfo={lastSearchInfo}
                  onOpenDoc={(lib, docId) => {
                    openLibrary(lib);
                    setTimeout(() => loadDoc(docId), 150);
                  }}
                  height="100%"
                />
              </div>
            </main>
          )}

          {/* VIEW: DOCUMENT WORKSPACE READER */}
          {view === "library" && (
            <div className="flex-1 flex h-full overflow-hidden">
              
              {/* Library Docs Navigation Tree */}
              <aside className="w-72 bg-[#0E0F13] border-r border-[#1C1E25] flex flex-col flex-shrink-0">
                <div className="p-3.5 border-b border-[#1C1E25] flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={"notion-tag font-mono " + getTagColorClass(currentLib)}>{currentLib}</span>
                    <span className="text-xs font-mono text-[#71717A]">{libraryDocs.length} files</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const libObj = libraries.find(l => l.name === currentLib) || { name: currentLib, sourceUrl: "" };
                        openEditModal(libObj);
                      }}
                      className="text-[#71717A] hover:text-white p-1 rounded hover:bg-[#1E2128]"
                      title="Edit & Re-index"
                    >
                      <Icons.edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setView("page")} className="text-[#71717A] hover:text-white p-1 rounded hover:bg-[#1E2128]">
                      <Icons.close className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Active Re-index Progress Bar in Sidebar */}
                {(() => {
                  const job = activeJobs.find(j => j.library === currentLib);
                  if (!job) return null;
                  return (
                    <div className="p-3 bg-[#082F49]/40 border-b border-[#0284C7]/30 flex flex-col gap-1.5 animate-pulse">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#38BDF8] font-semibold">{job.status === "completed" ? "✓ Done" : "Re-indexing..."}</span>
                        <span className="text-[#38BDF8]">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-[#0C1E2E] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#38BDF8] h-full transition-all duration-200" style={{ width: job.progress + '%' }}></div>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
                  {libraryDocs.map(d => (
                    <button
                      key={d.id}
                      onClick={() => loadDoc(d.id)}
                      className={"w-full text-left px-3 py-2 rounded-xl text-xs transition flex flex-col gap-0.5 " +
                        (selectedDoc?.id === d.id ? "bg-[#181A21] text-white font-medium border border-[#2B2F3B] shadow-sm" : "text-[#A1A1AA] hover:bg-[#131418] hover:text-white")}
                    >
                      <span className="truncate">{d.title || d.path}</span>
                      <span className="text-[10px] font-mono text-[#52525B] truncate">{d.path}</span>
                    </button>
                  ))}
                </div>
              </aside>

              {/* Document Reading Pane */}
              <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#0A0B0D]">
                {selectedDoc ? (
                  <div className="max-w-4xl w-full mx-auto px-12 py-10 flex flex-col gap-6">
                    
                    {/* Header Details */}
                    <div className="flex items-start justify-between pb-4 border-b border-[#1C1E25]">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className={"notion-tag font-mono " + getTagColorClass(selectedDoc.library)}>{selectedDoc.library}</span>
                          <span className="text-xs font-mono text-[#71717A]">{selectedDoc.version}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">{selectedDoc.title}</h1>
                        <a href={selectedDoc.url || "#"} target="_blank" rel="noreferrer" className="text-xs font-mono text-[#71717A] hover:text-[#38BDF8] flex items-center gap-1.5">
                          <Icons.external className="w-3 h-3" /> {selectedDoc.path}
                        </a>
                      </div>
                      <button
                        onClick={handleCopyDoc}
                        className="px-3.5 py-1.5 rounded-xl bg-[#14161A] hover:bg-[#1E2128] border border-[#242731] text-xs text-white transition flex items-center gap-1.5 shadow-sm font-medium"
                      >
                        {copied ? <Icons.check className="w-3.5 h-3.5 text-emerald-400" /> : <Icons.copy className="w-3.5 h-3.5 text-[#71717A]" />}
                        {copied ? "Copied" : "Copy Raw"}
                      </button>
                    </div>

                    {/* View Switcher: Document vs Local Knowledge Mesh */}
                    <div className="flex items-center gap-2 border-b border-[#1C1E25] pb-2.5">
                      <button
                        onClick={() => setDocTab("content")}
                        className={"px-3.5 py-1.5 rounded-xl text-xs transition flex items-center gap-2 font-medium " +
                          (docTab === "content" ? "bg-[#1E2129] text-white shadow-sm border border-[#2B2E38]" : "text-[#71717A] hover:text-white hover:bg-[#14161A]")}
                      >
                        <Icons.document className="w-3.5 h-3.5" />
                        <span>Document Content</span>
                      </button>
                      <button
                        onClick={() => setDocTab("graph")}
                        className={"px-3.5 py-1.5 rounded-xl text-xs transition flex items-center gap-2 font-medium " +
                          (docTab === "graph" ? "bg-[#1E2129] text-white shadow-sm border border-[#2B2E38]" : "text-[#71717A] hover:text-white hover:bg-[#14161A]")}
                      >
                        <Icons.network className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Local Symbol Mesh</span>
                      </button>
                    </div>

                    {docTab === "graph" ? (
                      <div className="flex flex-col gap-3">
                        <ObsidianGraphCanvas
                          topology={{ libraries: [{ name: selectedDoc.library }], docs: libraryDocs }}
                          activeGlowIds={new Set([selectedDoc.id])}
                          recentlySpawnedIds={new Set()}
                          lastSearchInfo={null}
                          onOpenDoc={(lib, docId) => loadDoc(docId)}
                          height="560px"
                        />
                      </div>
                    ) : (
                      <>
                        {selectedDoc.symbols && selectedDoc.symbols.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-mono text-[#71717A] uppercase font-semibold">Symbols:</span>
                            {selectedDoc.symbols.slice(0, 12).map(sym => (
                              <span key={sym} className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[#14161A] text-[#D4D4D8] border border-[#22252D]">
                                {sym}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pb-20">
                          <MarkdownRenderer content={selectedDoc.content} />
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-[#71717A] font-mono">
                    Select a document from the left sidebar to view.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {view === "settings" && (
            <main className="flex-1 w-full h-full overflow-y-auto bg-[#0A0B0D]">
              <div className="max-w-4xl w-full mx-auto p-10 flex flex-col gap-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#1A1C22]">
                  <h1 className="text-xl font-bold text-white tracking-tight">System Settings & Engine Defaults</h1>
                  <button 
                    onClick={() => setView("page")}
                    className="px-3 py-1 rounded-xl bg-[#16181E] border border-[#242731] hover:bg-[#20232B] text-xs text-[#A1A1AA] hover:text-white font-mono"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
                  
                  {/* Local Vectorizer Card */}
                  <div className="p-5 bg-[#111216] border border-[#1E2027] rounded-2xl flex flex-col gap-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icons.cpu className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-white">Local ONNX Vector Engine (Quantized BGE-Small)</span>
                      </div>
                      <span className="notion-tag-green font-mono px-2 py-0.5 rounded text-[11px]">Active • 384 Dim</span>
                    </div>
                    <p className="text-xs text-[#71717A] leading-relaxed">
                      Runs 100% offline via local ONNX runtime. Zero API keys, zero rate-limits, and private memory execution.
                    </p>
                  </div>

                  {/* Multi-Engine Search */}
                  <div className="p-5 bg-[#111216] border border-[#1E2027] rounded-2xl flex flex-col gap-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icons.globe className="w-4 h-4 text-[#38BDF8]" />
                        <span className="text-sm font-semibold text-white">Native Stealth Multi-Engine Meta Search</span>
                      </div>
                      <span className="notion-tag-blue font-mono px-2 py-0.5 rounded text-[11px]">Parallel Live Fallback</span>
                    </div>
                    <p className="text-xs text-[#71717A] leading-relaxed">
                      Aggregates live results directly from Bing RSS, DuckDuckGo Lite, Brave, GitHub API, and Wikipedia with rotating browser fingerprints.
                    </p>
                  </div>

                  {/* Crawler Options */}
                  <div className="p-5 bg-[#111216] border border-[#1E2027] rounded-2xl flex flex-col gap-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">Crawler Ingestion Limits</span>
                      <span className="text-[11px] font-mono text-emerald-400/80">0 = Unlimited full site ingestion</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[#A1A1AA] block mb-1.5 text-xs font-medium">Default Max Pages (0 for all)</label>
                        <CustomNumberStepper
                          min={0}
                          max={50000}
                          step={100}
                          unit="pages"
                          value={config.crawler?.maxPages ?? 2000}
                          onChange={(val) => setConfig({ ...config, crawler: { ...config.crawler, maxPages: val } })}
                        />
                      </div>
                      <div>
                        <label className="text-[#A1A1AA] block mb-1.5 text-xs font-medium">Default Max Crawl Depth (0 for all)</label>
                        <CustomNumberStepper
                          min={0}
                          max={50}
                          step={1}
                          unit="levels"
                          value={config.crawler?.maxDepth ?? 10}
                          onChange={(val) => setConfig({ ...config, crawler: { ...config.crawler, maxDepth: val } })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-mono text-emerald-400">{configMsg}</span>
                    <button
                      type="submit"
                      disabled={savingConfig}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition shadow-lg"
                    >
                      {savingConfig ? "Saving..." : "Save Configuration"}
                    </button>
                  </div>
                </form>
              </div>
            </main>
          )}

        </div>
      </div>

      {/* QUICK FIND / SEARCH MODAL */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={() => setSearchOpen(false)}>
          <div 
            className="bg-[#121317] border border-[#262831] w-[640px] rounded-2xl shadow-2xl overflow-hidden flex flex-col" 
            onClick={e => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSearchSelectedIndex(prev => Math.min(results.length - 1, prev + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSearchSelectedIndex(prev => Math.max(0, prev - 1));
              } else if (e.key === "Enter" && results[searchSelectedIndex]) {
                e.preventDefault();
                const r = results[searchSelectedIndex];
                handleSelectSearchResult(r.id, r.library, r.library === "live-web", r.url);
              } else if (e.key === "Escape") {
                setSearchOpen(false);
              }
            }}
          >
            <form onSubmit={handleSearch} className="flex items-center px-4 py-3.5 border-b border-[#20222A] gap-3">
              <Icons.search className="w-4 h-4 text-[#71717A]" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSearchSelectedIndex(0);
                }}
                placeholder="Search symbol, concept, crates.io, npm..."
                className="bg-transparent text-sm text-white placeholder-[#71717A] focus:outline-none flex-1 font-mono"
              />
              {loading ? (
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping"></span>
              ) : (
                <kbd className="text-[10px] font-mono text-[#71717A] border border-[#2B2E38] px-1.5 py-0.5 rounded bg-[#0A0B0D]">ESC to close</kbd>
              )}
            </form>

            <div className="max-h-[420px] overflow-y-auto p-2 divide-y divide-[#1C1E25]">
              {results.map((r, i) => {
                const isSelected = i === searchSelectedIndex;
                return (
                  <div 
                    key={i}
                    onMouseEnter={() => setSearchSelectedIndex(i)}
                    onClick={() => handleSelectSearchResult(r.id, r.library, r.library === "live-web", r.url)}
                    className={"p-3 rounded-xl cursor-pointer transition flex flex-col gap-1.5 " +
                      (isSelected ? "bg-[#1C1F28] border border-[#2C3242] shadow-md" : "hover:bg-[#16181F]")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-xs font-semibold text-white truncate">{r.title}</span>
                        {r.engine && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#101216] border border-[#242833] text-[#38BDF8]">
                            {r.engine}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {r.score && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                            {(r.score * 100).toFixed(0)}% match
                          </span>
                        )}
                        <span className={"notion-tag font-mono " + getTagColorClass(r.library)}>{r.library}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA] line-clamp-2 leading-relaxed font-sans">{r.snippet}</p>
                  </div>
                );
              })}
              {results.length === 0 && !loading && (
                <div className="p-8 text-center text-xs text-[#71717A] font-mono flex flex-col gap-1.5 items-center">
                  <span>Type a concept, symbol, or question and press Enter.</span>
                  <span className="text-[10px] text-[#52525B]">Supports offline vector embeddings + live crates.io / npm / multi-engine fallback.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INGEST MODAL */}
      {ingestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in" onClick={() => setIngestOpen(false)}>
          <div className="bg-[#121317] border border-[#262831] w-[520px] rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#20222A]">
              <span className="font-semibold text-white text-sm">Ingest New Documentation</span>
              <button onClick={() => setIngestOpen(false)} className="text-[#71717A] hover:text-white"><Icons.close className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleIngest} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-[#A1A1AA] block mb-1">Collection Name</label>
                <input
                  type="text"
                  value={ingestLib}
                  onChange={e => setIngestLib(e.target.value)}
                  placeholder="e.g. tauri, react, ratatui"
                  required
                  className="w-full bg-[#0C0D0F] border border-[#22252D] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-[#A1A1AA] block mb-1">Documentation Target URL(s)</label>
                <textarea
                  rows={4}
                  value={ingestUrlsText}
                  onChange={e => setIngestUrlsText(e.target.value)}
                  placeholder="https://docs.rs/tauri/latest/tauri/&#10;https://github.com/user/repo"
                  required
                  className="w-full bg-[#0C0D0F] border border-[#22252D] rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <CustomCheckbox
                id="clean-reindex"
                checked={ingestCleanReindex}
                onChange={setIngestCleanReindex}
                label="Clean Re-index"
                description="Wipe existing vectors for this library before ingestion"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-[#20222A]">
                <button type="button" onClick={() => setIngestOpen(false)} className="px-4 py-2 rounded-xl text-xs text-[#A1A1AA] hover:bg-[#1A1C22]">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs shadow-lg">Start Ingestion</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in" onClick={() => setEditOpen(false)}>
          <div className="bg-[#121317] border border-[#262831] w-[520px] rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#20222A]">
              <span className="font-semibold text-white text-sm">Edit Collection & Re-index</span>
              <button onClick={() => setEditOpen(false)} className="text-[#71717A] hover:text-white"><Icons.close className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-[#A1A1AA] block mb-1">Collection Name</label>
                <input
                  type="text"
                  value={editNewName}
                  onChange={e => setEditNewName(e.target.value)}
                  required
                  className="w-full bg-[#0C0D0F] border border-[#22252D] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-[#A1A1AA] block mb-1">Documentation Source URLs</label>
                <textarea
                  rows={4}
                  value={editUrlsText}
                  onChange={e => setEditUrlsText(e.target.value)}
                  className="w-full bg-[#0C0D0F] border border-[#22252D] rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <CustomCheckbox
                id="edit-clean-reindex"
                checked={cleanReindex}
                onChange={setCleanReindex}
                label="Clean Re-index on submit"
                description="Erase old vectors before re-crawling"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-[#20222A]">
                <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-xl text-xs text-[#A1A1AA] hover:bg-[#1A1C22]">Cancel</button>
                <button type="submit" disabled={reindexing} className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs shadow-lg">
                  {reindexing ? "Updating..." : "Save & Reindex"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#14161A] border border-[#2A2E38] w-[440px] rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Icons.trash className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white text-sm">{confirmModal.title}</span>
                <span className="text-xs text-[#71717A] mt-0.5">{confirmModal.message}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#20222A]">
              <button onClick={() => setConfirmModal({ open: false, title: "", message: "", onConfirm: null })} className="px-4 py-2 rounded-xl text-xs text-[#A1A1AA] hover:bg-[#1A1C22]">Cancel</button>
              <button onClick={confirmModal.onConfirm} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg">Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST ALERTS */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#14161A] border border-[#272B33] text-xs text-white shadow-2xl animate-fade-in font-mono">
          <span className={"w-2 h-2 rounded-full " + (toast.type === "success" ? "bg-emerald-400" : toast.type === "error" ? "bg-rose-400" : "bg-[#38BDF8]")}></span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
