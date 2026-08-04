import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineUsers, HiOutlineChip, HiOutlineFolder,
  HiOutlineOfficeBuilding, HiOutlineBriefcase, HiOutlineShare,
  HiOutlineChartBar, HiOutlineArrowRight,
} from "react-icons/hi";
import StatCard from "../components/Cards/StatCard";
import CustomBarChart from "../components/Charts/BarChart";
import CustomPieChart from "../components/Charts/PieChart";
import { Loader, SkeletonCard } from "../components/Loader";
import {
  usersAPI, skillsAPI, projectsAPI, companiesAPI, jobsAPI,
  recommendationsAPI, analyticsAPI,
} from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [graphStats, setGraphStats] = useState(null);
  const [topSkills, setTopSkills] = useState([]);
  const [skillsDist, setSkillsDist] = useState([]);
  const [jobsByLocation, setJobsByLocation] = useState([]);
  const [usersByExp, setUsersByExp] = useState([]);
  const [projectsByTech, setProjectsByTech] = useState([]);
  const [densityData, setDensityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const usersRes = await usersAPI.getCount();
        console.log("Users", usersRes.data);

        const skillsRes = await skillsAPI.getCount();
        console.log("Skills", skillsRes.data);

        const projectsRes = await projectsAPI.getCount();
        console.log("Projects", projectsRes.data);

        const companiesRes = await companiesAPI.getCount();
        console.log("Companies", companiesRes.data);

        const jobsRes = await jobsAPI.getCount();
        console.log("Jobs", jobsRes.data);

        const graphRes = await recommendationsAPI.getGraphStats();
        console.log("Graph", graphRes.data);

        const topSkillsRes = await skillsAPI.getTop();
        console.log("Top Skills", topSkillsRes.data);

        const skillsDistRes = await skillsAPI.getDistribution();
        console.log("Distribution", skillsDistRes.data);

        const jobsLocRes = await jobsAPI.getByLocation();
        console.log("Jobs Location", jobsLocRes.data);

        const usersExpRes = await usersAPI.getByExperience();
        console.log("Users Experience", usersExpRes.data);

        const projTechRes = await projectsAPI.getByTechnology();
        console.log("Project Technology", projTechRes.data);

        const densRes = await analyticsAPI.getGraphDensity();
        console.log("Density", densRes.data);

        setStats({
          users:     usersRes.data.data?.total,
          skills:    skillsRes.data.data?.total,
          projects:  projectsRes.data.data?.total,
          companies: companiesRes.data.data?.total,
          jobs:      jobsRes.data.data?.total,
        });
        setGraphStats(graphRes.data.data);
        setTopSkills(topSkillsRes.data.data || []);
        setSkillsDist(skillsDistRes.data.data || []);
        setJobsByLocation(jobsLocRes.data.data || []);
        setUsersByExp(usersExpRes.data.data || []);
        setProjectsByTech(projTechRes.data.data || []);
        setDensityData(densRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Career Knowledge Graph — real-time overview</p>
        </div>
        <Link to="/analytics" className="btn-ghost text-xs py-2">
          <HiOutlineChartBar className="w-4 h-4" /> Graph Analytics
          <HiOutlineArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Total Users"     value={stats.users}     icon={HiOutlineUsers}           color="blue"   />
          <StatCard title="Total Skills"    value={stats.skills}    icon={HiOutlineChip}            color="purple" />
          <StatCard title="Total Projects"  value={stats.projects}  icon={HiOutlineFolder}          color="cyan"   />
          <StatCard title="Total Companies" value={stats.companies} icon={HiOutlineOfficeBuilding}  color="orange" />
          <StatCard title="Total Jobs"      value={stats.jobs}      icon={HiOutlineBriefcase}       color="green"  />
          <StatCard title="Relationships"   value={graphStats?.relationships} icon={HiOutlineShare} color="pink"   />
        </div>
      )}

      {/* Graph Stats Banner */}
      {graphStats && (
        <div className="glass-card p-5 bg-gradient-to-r from-primary-500/5 to-accent-purple/5 border-primary-500/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HiOutlineShare className="w-4 h-4 text-primary-400" />
              <h2 className="text-sm font-semibold text-gray-300">Graph Statistics</h2>
            </div>
            {densityData && (
              <span className="text-xs text-gray-500 bg-dark-700/40 rounded-xl px-2.5 py-1 font-mono">
                Density: {(densityData.density * 100).toFixed(3)}%
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { label: "Nodes: Users",     value: graphStats.users },
              { label: "Nodes: Skills",    value: graphStats.skills },
              { label: "Nodes: Projects",  value: graphStats.projects },
              { label: "Nodes: Companies", value: graphStats.companies },
              { label: "Nodes: Jobs",      value: graphStats.jobs },
              { label: "Total Edges",      value: graphStats.relationships },
            ].map(({ label, value }) => (
              <div key={label} className="bg-dark-800/40 rounded-xl px-3 py-2.5">
                <div className="text-lg font-bold text-primary-400 font-mono">{value ?? "–"}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CustomBarChart
          data={topSkills.map(d => ({ name: d.skill, count: d.userCount }))}
          dataKey="count"
          nameKey="name"
          title="🏆 Top 10 Skills by User Adoption"
        />
        <CustomPieChart
          data={skillsDist.map(d => ({ name: d.category, count: d.skillCount }))}
          dataKey="count"
          nameKey="name"
          title="🧩 Skills Distribution by Category"
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CustomBarChart
          data={jobsByLocation.map(d => ({ name: d.location?.split(",")[0] || d.location, count: d.jobCount }))}
          dataKey="count"
          nameKey="name"
          title="📍 Jobs by Location"
        />
        <CustomPieChart
          data={usersByExp.map(d => ({ name: d.level, count: d.userCount }))}
          dataKey="count"
          nameKey="name"
          title="👤 Users by Experience Level"
        />
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CustomBarChart
          data={projectsByTech.map(d => ({ name: d.technology, count: d.projectCount }))}
          dataKey="count"
          nameKey="name"
          title="🛠️ Projects by Technology"
        />

        {/* Top Skills Table */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">🥇 Top Skills Leaderboard</h3>
          <div className="overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Skill</th>
                  <th>Category</th>
                  <th>Users</th>
                </tr>
              </thead>
              <tbody>
                {topSkills.slice(0, 8).map((s, i) => (
                  <tr key={i}>
                    <td><span className="font-mono text-gray-500">{String(i + 1).padStart(2, "0")}</span></td>
                    <td><span className="font-medium text-gray-200">{s.skill}</span></td>
                    <td><span className="stat-badge bg-dark-700/60 text-gray-400">{s.category}</span></td>
                    <td><span className="font-semibold text-primary-400">{s.userCount}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
