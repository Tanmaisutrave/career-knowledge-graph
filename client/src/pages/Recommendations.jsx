import { useEffect, useState } from "react";
import {
  HiOutlineLightBulb, HiOutlineUsers, HiOutlineBriefcase, HiOutlineShare,
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineChip, HiOutlineArrowRight,
} from "react-icons/hi";
import JobCard from "../components/Cards/JobCard";
import UserCard from "../components/Cards/UserCard";
import { Loader } from "../components/Loader";
import { usersAPI, companiesAPI, jobsAPI, recommendationsAPI, analyticsAPI } from "../services/api";

/* ── Tabs ─────────────────────────────────────────── */
const TABS = [
  { id: "jobs",     label: "Job Recommendations",  icon: HiOutlineBriefcase },
  { id: "users",    label: "Similar Profiles",      icon: HiOutlineUsers },
  { id: "path",     label: "Shortest Path",         icon: HiOutlineShare },
  { id: "skillgap", label: "Skill Gap Analyzer",    icon: HiOutlineChip },
];

/* ── Skill Gap ─────────────────────────────────────────── */
function SkillGapSection({ users, jobs }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (!selectedUser || !selectedJob) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await analyticsAPI.getSkillGap(selectedUser, selectedJob);
      if (res.data.data) setResult(res.data.data);
      else setError("Could not compute skill gap. Ensure both have skills/requirements.");
    } catch (e) {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const pct = result?.compatibilityPct ?? 0;
  const pctColor = pct >= 70 ? "text-green-400" : pct >= 40 ? "text-yellow-400" : "text-red-400";
  const barColor = pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="space-y-5">
      {/* Selectors */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineChip className="w-4 h-4 text-accent-purple" />
          <h2 className="text-sm font-semibold text-gray-300">Skill Gap Analyzer</h2>
          <span className="text-xs text-gray-500">— select a user and a job to compare</span>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-gray-500 mb-1.5 block">Select User</label>
            <select className="form-input" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
              <option value="">— Choose User —</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-gray-500 mb-1.5 block">Select Job</label>
            <select className="form-input" value={selectedJob} onChange={e => setSelectedJob(e.target.value)}>
              <option value="">— Choose Job —</option>
              {jobs.map(job => {
                const j = job.j || job;
                const c = job.c;
                return <option key={j.id} value={j.id}>{j.title}{c ? ` · ${c.name}` : ""}</option>;
              })}
            </select>
          </div>
          <button
            className="btn-primary whitespace-nowrap"
            onClick={analyze}
            disabled={!selectedUser || !selectedJob || loading}
          >
            {loading ? "Analyzing…" : "Analyze Gap"}
            {!loading && <HiOutlineArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && <div className="glass-card p-4 bg-red-500/5 border-red-500/20"><p className="text-sm text-red-400">{error}</p></div>}

      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Compatibility score */}
          <div className="glass-card p-5 bg-gradient-to-r from-dark-800/60 to-dark-700/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Compatibility Score</p>
                <div className={`text-4xl font-bold font-mono ${pctColor}`}>
                  {pct.toFixed(0)}<span className="text-2xl">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {result.matchCount} of {result.totalRequired} required skills matched
                </p>
              </div>
              <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${
                pct >= 70 ? "border-green-500/40 bg-green-500/10" :
                pct >= 40 ? "border-yellow-500/40 bg-yellow-500/10" :
                            "border-red-500/40 bg-red-500/10"
              }`}>
                <span className={`text-lg font-bold font-mono ${pctColor}`}>{pct.toFixed(0)}%</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-dark-700/60 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-700`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-600">0%</span>
              <span className="text-[10px] text-gray-600">100%</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Matching skills */}
            <div className="glass-card p-5 bg-green-500/[0.03] border-green-500/10">
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineCheckCircle className="w-4 h-4 text-green-400" />
                <h3 className="text-sm font-semibold text-green-400">Matching Skills ({result.matchingSkills?.length})</h3>
              </div>
              {result.matchingSkills?.length === 0 ? (
                <p className="text-xs text-gray-500">No matching skills found.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {result.matchingSkills?.map((s, i) => (
                    <span key={i} className="stat-badge bg-green-500/10 text-green-300 border border-green-500/20">
                      <HiOutlineCheckCircle className="w-3 h-3" />{s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Missing skills */}
            <div className="glass-card p-5 bg-red-500/[0.03] border-red-500/10">
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineXCircle className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-semibold text-red-400">Missing Skills ({result.missingSkills?.length})</h3>
              </div>
              {result.missingSkills?.length === 0 ? (
                <p className="text-xs text-green-400 flex items-center gap-1.5">
                  <HiOutlineCheckCircle className="w-4 h-4" /> All required skills are covered!
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills?.map((s, i) => (
                    <span key={i} className="stat-badge bg-red-500/10 text-red-300 border border-red-500/20">
                      <HiOutlineXCircle className="w-3 h-3" />{s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Suggested learning path */}
          {result.missingSkills?.length > 0 && (
            <div className="glass-card p-5 bg-gradient-to-r from-primary-500/5 to-accent-purple/5 border-primary-500/10">
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineLightBulb className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-semibold text-gray-300">Suggested Learning Path</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {result.missingSkills?.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="bg-dark-800/60 border border-white/[0.08] rounded-xl px-3 py-2 text-xs">
                      <p className="text-[10px] text-gray-500 mb-0.5">Learn</p>
                      <p className="text-gray-200 font-medium">{s.name}</p>
                    </div>
                    {i < result.missingSkills.length - 1 && (
                      <HiOutlineArrowRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-600 mt-3">
                Acquiring these {result.missingSkills.length} skill{result.missingSkills.length > 1 ? "s" : ""} would bring
                compatibility to 100%.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────── */
export default function Recommendations() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [tab, setTab] = useState("jobs");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [similarUsers, setSimilarUsers] = useState([]);
  const [shortestPath, setShortestPath] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPath, setLoadingPath] = useState(false);
  const [pathError, setPathError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [u, c, j] = await Promise.all([usersAPI.getAll(), companiesAPI.getAll(), jobsAPI.getAll()]);
        setUsers(u.data.data.map(r => ({ ...r.u, skills: r.skills || [] })));
        setCompanies(c.data.data.map(r => ({ ...r.c })));
        setJobs(j.data.data);
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  async function handleUserSelect(uid) {
    setSelectedUser(uid);
    setRecommendedJobs([]);
    setSimilarUsers([]);
    if (!uid) return;

    if (tab === "jobs" || tab === "users") {
      setLoadingJobs(true);
      setLoadingUsers(true);
      try {
        const [j, u] = await Promise.all([
          recommendationsAPI.getJobsForUser(uid),
          recommendationsAPI.getSimilarUsers(uid),
        ]);
        setRecommendedJobs(j.data.data || []);
        setSimilarUsers((u.data.data || []).map(r => ({
          ...(r.user || {}), skills: r.skills || [], sharedSkills: r.sharedSkills
        })));
      } catch (e) { console.error(e); }
      finally { setLoadingJobs(false); setLoadingUsers(false); }
    }
  }

  async function handleFindPath() {
    if (!selectedUser || !selectedCompany) return;
    setLoadingPath(true);
    setPathError("");
    setShortestPath(null);
    try {
      const res = await recommendationsAPI.getShortestPath(selectedUser, selectedCompany);
      if (res.data.data) setShortestPath(res.data.data);
      else setPathError("No path found between this user and company.");
    } catch (e) { setPathError("Could not find path."); }
    finally { setLoadingPath(false); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Recommendations</h1>
        <p className="text-sm text-gray-500 mt-0.5">Graph-powered recommendations via multi-hop Cypher traversal</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              tab === id
                ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                : "bg-dark-700/40 text-gray-400 border border-white/[0.06] hover:bg-dark-700/80"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* User selector (shown for jobs / users / path tabs) */}
      {(tab === "jobs" || tab === "users" || tab === "path") && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineLightBulb className="w-4 h-4 text-yellow-400" />
            <h2 className="text-sm font-semibold text-gray-300">Select User</h2>
          </div>
          <select
            className="form-input max-w-sm"
            value={selectedUser}
            onChange={e => handleUserSelect(e.target.value)}
          >
            <option value="">— Select a user —</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.location})</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Job recommendations tab ── */}
      {tab === "jobs" && selectedUser && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineBriefcase className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-gray-300">Recommended Jobs</h2>
            <span className="text-xs text-gray-500">(matched by skill overlap, graph traversal)</span>
          </div>
          {loadingJobs ? <Loader /> : recommendedJobs.length === 0 ? (
            <div className="glass-card p-8 text-center text-gray-500 text-sm">No job recommendations found for this user.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {recommendedJobs.map((job, i) => (
                <div key={i} className="relative">
                  <JobCard job={job} />
                  {job.matchedSkills && (
                    <div className="absolute top-3 right-3 stat-badge bg-green-500/10 text-green-300 border border-green-500/20">
                      {job.matchedSkills} match
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Similar users tab ── */}
      {tab === "users" && selectedUser && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineUsers className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-gray-300">Users with Similar Skills</h2>
            <span className="text-xs text-gray-500">(shared skill node traversal)</span>
          </div>
          {loadingUsers ? <Loader /> : similarUsers.length === 0 ? (
            <div className="glass-card p-8 text-center text-gray-500 text-sm">No similar users found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {similarUsers.map((user, i) => (
                <div key={i} className="relative">
                  <UserCard user={user} />
                  {user.sharedSkills && (
                    <div className="absolute top-3 right-3 stat-badge bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {user.sharedSkills} shared
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Shortest path tab ── */}
      {tab === "path" && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineShare className="w-4 h-4 text-primary-400" />
            <h2 className="text-sm font-semibold text-gray-300">Shortest Path: User → Company</h2>
            <span className="text-xs text-gray-500">(BFS via shortestPath() — up to 6 hops)</span>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <select className="form-input max-w-xs" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
              <option value="">— Select User —</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select className="form-input max-w-xs" value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}>
              <option value="">— Select Company —</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button
              className="btn-primary"
              onClick={handleFindPath}
              disabled={!selectedUser || !selectedCompany || loadingPath}
            >
              {loadingPath ? "Finding…" : "Find Shortest Path"}
            </button>
          </div>

          {pathError && <p className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-3 mb-4">{pathError}</p>}

          {shortestPath && (
            <div className="bg-dark-700/40 rounded-xl p-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-gray-400">Path length:</span>
                <span className="text-primary-400 font-semibold text-sm">{shortestPath.length} hops</span>
                <span className="text-xs text-gray-600">— shortest connection found</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {shortestPath.nodes?.map((node, i) => {
                  const nodeColor = {
                    User: "#3b82f6", Skill: "#a855f7", Project: "#06b6d4",
                    Company: "#f59e0b", Job: "#10b981"
                  }[node.labels?.[0]] || "#6b7280";
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="bg-dark-800/60 border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs">
                        <p
                          className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                          style={{ color: nodeColor }}
                        >
                          {node.labels?.[0]}
                        </p>
                        <p className="text-gray-200 font-medium">{node.properties?.name || node.properties?.title}</p>
                      </div>
                      {i < shortestPath.nodes.length - 1 && (
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-px bg-primary-500/30" />
                          <span className="text-[9px] text-gray-600 whitespace-nowrap">
                            {shortestPath.relationships?.[i]?.type}
                          </span>
                          <div className="w-5 h-px bg-primary-500/30" />
                          <HiOutlineArrowRight className="w-3 h-3 text-gray-600" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-600 mt-4">
                This is the BFS shortest path via <code className="font-mono">shortestPath((u)-[*..6]-(c))</code> in Cypher.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Skill gap tab ── */}
      {tab === "skillgap" && (
        <SkillGapSection users={users} jobs={jobs} />
      )}
    </div>
  );
}
