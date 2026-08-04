import { useEffect, useState } from "react";
import {
  HiOutlineChartBar, HiOutlineShare, HiOutlineChip, HiOutlineOfficeBuilding,
  HiOutlineArrowUp, HiOutlineArrowDown
} from "react-icons/hi";
import CustomBarChart from "../components/Charts/BarChart";
import CustomPieChart from "../components/Charts/PieChart";
import { Loader, SkeletonCard } from "../components/Loader";
import { analyticsAPI } from "../services/api";

function MetricCard({ title, value, subtitle, color = "blue", icon: Icon, note }) {
  const colors = {
    blue:   "from-primary-500/10 to-primary-600/5 border-primary-500/20 text-primary-400",
    purple: "from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400",
    cyan:   "from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
    green:  "from-green-500/10 to-green-600/5 border-green-500/20 text-green-400",
    orange: "from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-400",
  };
  const iconBg = {
    blue: "bg-primary-500/10 text-primary-400",
    purple: "bg-purple-500/10 text-purple-400",
    cyan: "bg-cyan-500/10 text-cyan-400",
    green: "bg-green-500/10 text-green-400",
    orange: "bg-orange-500/10 text-orange-400",
  };

  return (
    <div className={`glass-card p-5 bg-gradient-to-br border ${colors[color]} relative overflow-hidden`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg[color]}`}>
          {Icon && <Icon className="w-4.5 h-4.5" />}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-100 font-mono mb-0.5">
        {value !== undefined ? (typeof value === "number" ? value.toFixed(value % 1 ? 2 : 0) : value) : <span className="skeleton h-7 w-16 block rounded" />}
      </div>
      <p className="text-sm text-gray-400">{title}</p>
      {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
      {note && <p className="text-[10px] text-gray-600 mt-2 font-mono">{note}</p>}
    </div>
  );
}

export default function Analytics() {
  const [degreeData, setDegreeData] = useState(null);
  const [topNodes, setTopNodes] = useState([]);
  const [relDist, setRelDist] = useState([]);
  const [nodeDist, setNodeDist] = useState([]);
  const [connectedSkills, setConnectedSkills] = useState([]);
  const [densityData, setDensityData] = useState(null);
  const [topHiring, setTopHiring] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [degRes, nodesRes, relRes, nodeRes, skillRes, densRes, hiringRes] = await Promise.all([
          analyticsAPI.getAverageDegree(),
          analyticsAPI.getConnectedNodes(),
          analyticsAPI.getRelationshipDistribution(),
          analyticsAPI.getNodeDistribution(),
          analyticsAPI.getConnectedSkills(),
          analyticsAPI.getGraphDensity(),
          analyticsAPI.getTopHiring(),
        ]);
        setDegreeData(degRes.data.data);
        setTopNodes(nodesRes.data.data || []);
        setRelDist(relRes.data.data || []);
        setNodeDist(nodeRes.data.data || []);
        setConnectedSkills(skillRes.data.data || []);
        setDensityData(densRes.data.data);
        setTopHiring(hiringRes.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const topNode = topNodes[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Graph Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Degree centrality, relationship distribution, and graph structure metrics
        </p>
      </div>

      {/* Key metrics */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Avg Node Degree"
            value={degreeData?.avgDegree}
            icon={HiOutlineShare}
            color="blue"
            subtitle="avg relationships per node"
          />
          <MetricCard
            title="Max Degree"
            value={degreeData?.maxDegree}
            icon={HiOutlineArrowUp}
            color="purple"
            subtitle={`most connected: ${topNode?.name || "–"}`}
          />
          <MetricCard
            title="Graph Density"
            value={densityData ? (densityData.density * 100).toFixed(3) + "%" : undefined}
            icon={HiOutlineChartBar}
            color="cyan"
            subtitle={`${densityData?.nodeCount} nodes · ${densityData?.edgeCount} edges`}
          />
          <MetricCard
            title="Total Nodes"
            value={degreeData?.totalNodes}
            icon={HiOutlineChip}
            color="green"
            subtitle="across all labels"
          />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CustomBarChart
          data={relDist.map(d => ({ name: d.relType, count: d.relCount }))}
          dataKey="count"
          nameKey="name"
          title="🔗 Relationship Type Distribution"
        />
        <CustomPieChart
          data={nodeDist.map(d => ({ name: d.nodeLabel, count: d.nodeCount }))}
          dataKey="count"
          nameKey="name"
          title="🔵 Node Label Distribution"
        />
      </div>

      {/* Most connected nodes table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.05]">
          <h3 className="text-sm font-semibold text-gray-300">🏆 Most Connected Nodes — Degree Centrality</h3>
          <p className="text-xs text-gray-500 mt-0.5">Ranked by total relationship count (higher = more influential)</p>
        </div>
        {loading ? <Loader /> : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Node</th>
                  <th>Type</th>
                  <th>Degree</th>
                  <th>Bar</th>
                </tr>
              </thead>
              <tbody>
                {topNodes.map((n, i) => {
                  const pct = topNodes[0]?.degree > 0 ? (n.degree / topNodes[0].degree) * 100 : 0;
                  const nodeColor = {
                    User: "bg-primary-500/10 text-primary-300 border-primary-500/20",
                    Skill: "bg-purple-500/10 text-purple-300 border-purple-500/20",
                    Project: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
                    Company: "bg-orange-500/10 text-orange-300 border-orange-500/20",
                    Job: "bg-green-500/10 text-green-300 border-green-500/20",
                  }[n.nodeLabel] || "bg-dark-700/60 text-gray-400";
                  const barColor = {
                    User: "bg-primary-500",
                    Skill: "bg-purple-500",
                    Project: "bg-cyan-500",
                    Company: "bg-orange-500",
                    Job: "bg-green-500",
                  }[n.nodeLabel] || "bg-gray-500";
                  return (
                    <tr key={i}>
                      <td><span className="font-mono text-gray-500 text-xs">{String(i + 1).padStart(2, "0")}</span></td>
                      <td><span className="font-medium text-gray-200">{n.name}</span></td>
                      <td><span className={`stat-badge border ${nodeColor}`}>{n.label}</span></td>
                      <td><span className="font-bold text-gray-100 font-mono">{n.degree}</span></td>
                      <td className="w-32">
                        <div className="h-1.5 bg-dark-700/60 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Connected skills + top hiring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most connected skills */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05]">
            <h3 className="text-sm font-semibold text-gray-300">🛠️ Most Connected Skills</h3>
            <p className="text-xs text-gray-500 mt-0.5">Used by users + projects + jobs</p>
          </div>
          {loading ? <Loader /> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Users</th>
                  <th>Projects</th>
                  <th>Jobs</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {connectedSkills.map((s, i) => (
                  <tr key={i}>
                    <td>
                      <div>
                        <p className="font-medium text-gray-200 text-xs">{s.skill}</p>
                        <p className="text-[10px] text-gray-600">{s.category}</p>
                      </div>
                    </td>
                    <td><span className="text-primary-400 font-mono text-xs">{s.userCount}</span></td>
                    <td><span className="text-cyan-400 font-mono text-xs">{s.projectCount}</span></td>
                    <td><span className="text-green-400 font-mono text-xs">{s.jobCount}</span></td>
                    <td><span className="font-bold text-gray-100 font-mono text-xs">{s.totalConnections}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top hiring companies */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05]">
            <h3 className="text-sm font-semibold text-gray-300">🏢 Top Hiring Companies</h3>
            <p className="text-xs text-gray-500 mt-0.5">Ranked by number of applicants</p>
          </div>
          {loading ? <Loader /> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Industry</th>
                  <th>Jobs</th>
                  <th>Applicants</th>
                </tr>
              </thead>
              <tbody>
                {topHiring.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold flex-shrink-0">
                          {c.company?.[0]}
                        </div>
                        <span className="font-medium text-gray-200 text-xs">{c.company}</span>
                      </div>
                    </td>
                    <td><span className="stat-badge bg-orange-500/10 text-orange-300 border border-orange-500/20 text-[10px]">{c.industry}</span></td>
                    <td><span className="text-green-400 font-mono text-xs">{c.jobs}</span></td>
                    <td><span className="font-bold text-gray-100 font-mono text-xs">{c.applicants}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Graph explanation callout */}
      <div className="glass-card p-5 bg-gradient-to-r from-primary-500/5 to-accent-purple/5 border-primary-500/10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <HiOutlineShare className="w-4 h-4 text-primary-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-1">Why Graph Analytics Matter</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Degree centrality reveals the most influential nodes — a highly connected Skill is a
              "bridge skill" sought by many employers and held by many candidates. Graph density
              measures how tightly connected the overall network is. These metrics are impossible
              to compute efficiently in a relational database without full table scans, but are
              native operations in a property graph.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
