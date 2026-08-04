import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import {
  HiOutlineRefresh, HiOutlineX, HiOutlineZoomIn, HiOutlineZoomOut,
  HiOutlineSearch, HiOutlineInformationCircle, HiOutlineShare,
  HiOutlineArrowsExpand,
} from "react-icons/hi";
import { Loader } from "../components/Loader";
import { recommendationsAPI } from "../services/api";

const NODE_COLORS = {
  User:    "#3b82f6",
  Skill:   "#a855f7",
  Project: "#06b6d4",
  Company: "#f59e0b",
  Job:     "#10b981",
};

const NODE_SIZES = {
  User: 6, Skill: 5, Project: 6, Company: 8, Job: 5,
};

const LEGEND = Object.entries(NODE_COLORS).map(([label, color]) => ({ label, color }));

/* ── Neighbor highlighting hook ─────────────────────────────── */
function useHighlight(graphData) {
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);

  const onNodeHover = useCallback((node) => {
    setHoverNode(node);
    if (!node) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      return;
    }
    const connNodes = new Set([node]);
    const connLinks = new Set();
    graphData.links.forEach(link => {
      const srcId = link.source?.id ?? link.source;
      const tgtId = link.target?.id ?? link.target;
      if (srcId === node.id || tgtId === node.id) {
        connLinks.add(link);
        const neighbor = graphData.nodes.find(
          n => n.id === (srcId === node.id ? tgtId : srcId)
        );
        if (neighbor) connNodes.add(neighbor);
      }
    });
    setHighlightNodes(connNodes);
    setHighlightLinks(connLinks);
  }, [graphData]);

  return { highlightNodes, highlightLinks, hoverNode, onNodeHover };
}

export default function GraphExplorer() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fgRef = useRef();
  const containerRef = useRef();

  async function fetchGraph() {
    setLoading(true);
    try {
      const res = await recommendationsAPI.getGraphData();
      setGraphData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchGraph(); }, []);

  // Filtered data by node type + search
  const filteredData = useMemo(() => {
    let nodes = graphData.nodes;

    if (filter !== "All") nodes = nodes.filter(n => n.label === filter);

    if (search.trim()) {
      const q = search.toLowerCase();
      nodes = nodes.filter(n =>
        n.name?.toLowerCase().includes(q) ||
        n.label?.toLowerCase().includes(q) ||
        Object.values(n.properties || {}).some(v => String(v).toLowerCase().includes(q))
      );
    }

    const nodeIds = new Set(nodes.map(n => n.id));
    const links = graphData.links.filter(l => {
      const s = l.source?.id ?? l.source;
      const t = l.target?.id ?? l.target;
      return nodeIds.has(s) && nodeIds.has(t);
    });

    return { nodes, links };
  }, [graphData, filter, search]);

  const { highlightNodes, highlightLinks, hoverNode, onNodeHover } = useHighlight(filteredData);

  const handleNodeClick = useCallback((node) => {
    setSelected(node);
    fgRef.current?.centerAt(node.x, node.y, 800);
    fgRef.current?.zoom(2.5, 800);
  }, []);

  const handleNodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const color = NODE_COLORS[node.label] || "#888";
    const baseSize = NODE_SIZES[node.label] || 5;
    const isSelected = selected?.id === node.id;
    const isHighlighted = highlightNodes.has(node);
    const isHovered = hoverNode?.id === node.id;
    const dimmed = highlightNodes.size > 0 && !isHighlighted;

    const size = isSelected ? baseSize + 2 : isHovered ? baseSize + 1 : baseSize;
    const alpha = dimmed ? 0.2 : 1;

    ctx.globalAlpha = alpha;

    // Outer glow ring for selected/hovered
    if (isSelected || isHovered) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 5, 0, 2 * Math.PI);
      ctx.fillStyle = color + "22";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI);
      ctx.strokeStyle = color + "66";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Neighbor ring
    if (isHighlighted && !isSelected && !isHovered) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 2.5, 0, 2 * Math.PI);
      ctx.strokeStyle = color + "88";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = isSelected ? color : color + "cc";
    ctx.fill();

    ctx.strokeStyle = isSelected ? "#ffffff" : color + "55";
    ctx.lineWidth = isSelected ? 1.5 : 0.5;
    ctx.stroke();

    // Label
    const label = node.name;
    const fontSize = Math.max(3, 11 / globalScale);
    if (globalScale >= 1.4 || isSelected || isHovered) {
      ctx.font = `${isSelected ? "bold " : ""}${fontSize}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = isSelected ? "#fff" : "rgba(255,255,255,0.8)";
      ctx.fillText(
        label.length > 18 ? label.slice(0, 16) + "…" : label,
        node.x,
        node.y + size + fontSize * 0.9
      );
    }

    ctx.globalAlpha = 1;
  }, [selected, highlightNodes, hoverNode]);

  const handleLinkCanvasObject = useCallback((link, ctx) => {
    const isHighlighted = highlightLinks.has(link);
    const dimmed = highlightLinks.size > 0 && !isHighlighted;

    const srcNode = typeof link.source === "object" ? link.source : null;
    const tgtNode = typeof link.target === "object" ? link.target : null;
    if (!srcNode || !tgtNode) return;

    ctx.globalAlpha = dimmed ? 0.05 : isHighlighted ? 0.8 : 0.15;
    ctx.beginPath();
    ctx.moveTo(srcNode.x, srcNode.y);
    ctx.lineTo(tgtNode.x, tgtNode.y);
    ctx.strokeStyle = isHighlighted ? "#a5b4fc" : "rgba(150,160,200,0.4)";
    ctx.lineWidth = isHighlighted ? 1.5 : 0.8;
    ctx.stroke();

    // Relationship label on highlighted links
    if (isHighlighted && link.type) {
      const mx = (srcNode.x + tgtNode.x) / 2;
      const my = (srcNode.y + tgtNode.y) / 2;
      ctx.font = "9px Inter, sans-serif";
      ctx.fillStyle = "rgba(165,180,252,0.9)";
      ctx.textAlign = "center";
      ctx.fillText(link.type, mx, my - 4);
    }

    ctx.globalAlpha = 1;
  }, [highlightLinks]);

  const connectedLinks = useMemo(() => {
    if (!selected) return [];
    return filteredData.links.filter(l => {
      const s = l.source?.id ?? l.source;
      const t = l.target?.id ?? l.target;
      return s === selected.id || t === selected.id;
    });
  }, [selected, filteredData]);

  function centerGraph() {
    fgRef.current?.zoomToFit(400, 40);
  }

  function toggleFullscreen() {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(f => !f);
  }

  const data = filteredData;

  return (
    <div className="space-y-4 animate-fade-in h-full" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Graph Explorer</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data.nodes.length} nodes · {data.links.length} relationships
            {filter !== "All" && <span className="text-primary-400 ml-1">· Filtered: {filter}</span>}
            {search && <span className="text-yellow-400 ml-1">· Search: "{search}"</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-xs py-2" onClick={centerGraph}>
            <HiOutlineArrowsExpand className="w-4 h-4" /> Fit
          </button>
          <button className="btn-ghost text-xs py-2" onClick={fetchGraph}>
            <HiOutlineRefresh className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Controls: Filter + Search */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-500">Filter:</span>
          {["All", ...Object.keys(NODE_COLORS)].map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelected(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filter === f
                  ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                  : "bg-dark-700/40 text-gray-400 border border-white/[0.06] hover:bg-dark-700/80"
              }`}
            >
              {f !== "All" && (
                <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: NODE_COLORS[f] }} />
              )}
              {f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 glass-card px-3 py-1.5 ml-auto">
          <HiOutlineSearch className="w-3.5 h-3.5 text-gray-500" />
          <input
            className="bg-transparent text-xs text-gray-300 placeholder-gray-600 outline-none w-36"
            placeholder="Search nodes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-500 hover:text-gray-300">
              <HiOutlineX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4" style={{ height: "calc(100vh - 240px)", minHeight: "500px" }}>
        {/* ── Graph Canvas ───────────────────────────── */}
        <div className="flex-1 glass-card overflow-hidden relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center"><Loader /></div>
          ) : (
            <>
              <ForceGraph2D
                ref={fgRef}
                graphData={data}
                nodeCanvasObject={handleNodeCanvasObject}
                nodeCanvasObjectMode={() => "replace"}
                linkCanvasObject={handleLinkCanvasObject}
                linkCanvasObjectMode={() => "replace"}
                linkDirectionalArrowLength={3}
                linkDirectionalArrowRelPos={1}
                linkDirectionalParticles={link => highlightLinks.has(link) ? 2 : 0}
                linkDirectionalParticleWidth={2}
                linkDirectionalParticleColor={() => "rgba(165,180,252,0.8)"}
                backgroundColor="transparent"
                onNodeClick={handleNodeClick}
                onNodeHover={onNodeHover}
                onBackgroundClick={() => { setSelected(null); onNodeHover(null); }}
                enableNodeDrag
                cooldownTicks={120}
                nodeLabel={node => `${node.label}: ${node.name}`}
              />

              {/* Zoom controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-1">
                <button
                  onClick={() => fgRef.current?.zoom(fgRef.current?.zoom() * 1.35, 300)}
                  className="p-2 glass-card hover:bg-dark-700/80 transition-colors"
                  title="Zoom in"
                >
                  <HiOutlineZoomIn className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => fgRef.current?.zoom(fgRef.current?.zoom() * 0.75, 300)}
                  className="p-2 glass-card hover:bg-dark-700/80 transition-colors"
                  title="Zoom out"
                >
                  <HiOutlineZoomOut className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={centerGraph}
                  className="p-2 glass-card hover:bg-dark-700/80 transition-colors"
                  title="Fit all nodes"
                >
                  <HiOutlineArrowsExpand className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Node count badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-dark-800/80 rounded-xl px-2.5 py-1.5 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-[10px] text-gray-400 font-mono">
                  {data.nodes.length}n · {data.links.length}e
                </span>
              </div>
            </>
          )}
        </div>

        {/* ── Right sidebar ─────────────────────────── */}
        <div className="w-60 flex flex-col gap-3 flex-shrink-0 overflow-y-auto">
          {/* Legend */}
          <div className="glass-card p-4">
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Node Types</h3>
            <div className="space-y-2">
              {LEGEND.map(({ label, color }) => {
                const count = graphData.nodes.filter(n => n.label === label).length;
                return (
                  <div
                    key={label}
                    className="flex items-center justify-between cursor-pointer hover:opacity-80"
                    onClick={() => { setFilter(filter === label ? "All" : label); setSelected(null); }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-xs text-gray-300">{label}</span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How to use (when nothing selected) */}
          {!selected && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineInformationCircle className="w-4 h-4 text-primary-400" />
                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">How to Use</h3>
              </div>
              <ul className="text-[11px] text-gray-500 space-y-1.5 leading-relaxed">
                <li>• <strong className="text-gray-400">Hover</strong> to highlight neighbors</li>
                <li>• <strong className="text-gray-400">Click</strong> to inspect a node</li>
                <li>• <strong className="text-gray-400">Drag</strong> nodes to rearrange</li>
                <li>• <strong className="text-gray-400">Scroll</strong> to zoom in/out</li>
                <li>• <strong className="text-gray-400">Filter</strong> by node type above</li>
                <li>• <strong className="text-gray-400">Search</strong> nodes by name</li>
              </ul>
            </div>
          )}

          {/* Node details panel */}
          {selected && (
            <div className="glass-card p-4 animate-slide-up flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: (NODE_COLORS[selected.label] || "#888") + "22",
                      color: NODE_COLORS[selected.label] || "#888"
                    }}
                  >
                    {selected.label}
                  </span>
                  <h3 className="text-sm font-bold text-gray-100 mt-1.5 leading-tight">{selected.name}</h3>
                </div>
                <button
                  onClick={() => { setSelected(null); onNodeHover(null); }}
                  className="p-1 text-gray-500 hover:text-gray-300 flex-shrink-0"
                >
                  <HiOutlineX className="w-4 h-4" />
                </button>
              </div>

              {/* Properties */}
              <div className="space-y-1.5 mb-4">
                {Object.entries(selected.properties || {})
                  .filter(([k, v]) => v && k !== "id")
                  .map(([k, v]) => (
                    <div key={k} className="bg-dark-700/40 rounded-lg px-2.5 py-1.5">
                      <p className="text-[9px] text-gray-600 uppercase tracking-wider">{k}</p>
                      <p className="text-xs text-gray-200 truncate mt-0.5">{String(v)}</p>
                    </div>
                  ))}
              </div>

              {/* Connected edges */}
              {connectedLinks.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <HiOutlineShare className="w-3 h-3 text-gray-500" />
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                      Relationships ({connectedLinks.length})
                    </p>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {connectedLinks.slice(0, 15).map((link, i) => {
                      const srcId = link.source?.id ?? link.source;
                      const tgtId = link.target?.id ?? link.target;
                      const isOutgoing = srcId === selected.id;
                      const otherId = isOutgoing ? tgtId : srcId;
                      const otherNode = filteredData.nodes.find(n => n.id === otherId);
                      if (!otherNode) return null;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 bg-dark-700/30 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-dark-700/60 transition-colors"
                          onClick={() => {
                            setSelected(otherNode);
                            fgRef.current?.centerAt(otherNode.x, otherNode.y, 600);
                            fgRef.current?.zoom(2.5, 600);
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: NODE_COLORS[otherNode.label] || "#888" }}
                          />
                          <div className="min-w-0">
                            <p className="text-[9px] text-gray-500">{isOutgoing ? "→" : "←"} {link.type}</p>
                            <p className="text-[10px] text-gray-300 truncate">{otherNode.name}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
