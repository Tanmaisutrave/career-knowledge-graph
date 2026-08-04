import { useEffect, useState } from "react";
import {
  HiOutlinePlus, HiOutlineTrash, HiOutlineSearch, HiOutlineX,
  HiOutlineChip, HiOutlineUsers, HiOutlineLocationMarker,
  HiOutlineCurrencyDollar, HiOutlineBriefcase,
} from "react-icons/hi";
import JobCard from "../components/Cards/JobCard";
import { Loader } from "../components/Loader";
import { jobsAPI, recommendationsAPI } from "../services/api";

/* ── Job Detail Drawer ───────────────────────────────────────── */
function JobDrawer({ job, onClose }) {
  const [full, setFull] = useState(null);
  const [loading, setLoading] = useState(true);

  const j = job?.j || job;

  useEffect(() => {
    if (!j?.id) return;
    async function load() {
      setLoading(true);
      try {
        const res = await jobsAPI.getById(j.id);
        setFull(res.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [j?.id]);

  const c = full?.c || job?.c;
  const skills = full?.skills || job?.skills || [];
  const applicants = full?.applicants || [];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-dark-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-dark-900/95 border-l border-white/[0.05] h-full overflow-y-auto flex flex-col animate-slide-up">
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-bold text-gray-100 text-lg">{j?.title}</h2>
              {c && <p className="text-sm text-gray-400 mt-0.5">{c.name} · {c.industry}</p>}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400 flex-shrink-0">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-dark-700/40 rounded-xl p-2.5">
              <p className="text-[10px] text-gray-500 mb-0.5">Location</p>
              <p className="text-sm text-gray-200">{j?.location}</p>
            </div>
            <div className="bg-dark-700/40 rounded-xl p-2.5">
              <p className="text-[10px] text-gray-500 mb-0.5">Experience</p>
              <p className="text-sm text-gray-200">{j?.experience}+ years</p>
            </div>
            <div className="bg-dark-700/40 rounded-xl p-2.5 col-span-2">
              <p className="text-[10px] text-gray-500 mb-0.5">Salary</p>
              <p className="text-sm text-green-400 font-semibold">{j?.salary}</p>
            </div>
          </div>
        </div>

        {loading ? <Loader /> : (
          <div className="flex-1 p-6 space-y-5">
            {/* Required skills */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineChip className="w-4 h-4 text-primary-400" />
                <h3 className="text-sm font-semibold text-gray-300">Required Skills ({skills.length})</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, i) => (
                  <span key={i} className="stat-badge bg-primary-500/10 text-primary-300 border border-primary-500/20">{s?.name}</span>
                ))}
                {skills.length === 0 && <p className="text-xs text-gray-500">No required skills specified.</p>}
              </div>
            </div>

            {/* Applicants */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineUsers className="w-4 h-4 text-accent-purple" />
                <h3 className="text-sm font-semibold text-gray-300">Applicants ({applicants.length})</h3>
              </div>
              {applicants.length === 0 ? (
                <p className="text-xs text-gray-500">No applicants yet.</p>
              ) : (
                <div className="space-y-2">
                  {applicants.map((u, i) => (
                    <div key={i} className="flex items-center gap-3 bg-dark-700/40 rounded-xl px-3 py-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u?.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">{u?.name}</p>
                        <p className="text-xs text-gray-500">{u?.experience}y exp · {u?.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Jobs Page ──────────────────────────────────────────── */
export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: "", experience: "", location: "", salary: "" });
  const [submitting, setSubmitting] = useState(false);
  const [filterLocation, setFilterLocation] = useState("All");

  async function fetchJobs() {
    setLoading(true);
    try {
      const res = await jobsAPI.getAll();
      setJobs(res.data.data);
      setFiltered(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  useEffect(() => { fetchJobs(); }, []);

  // Unique locations for filter
  const locations = ["All", ...new Set(jobs.map(j => {
    const loc = (j?.j?.location || j?.location || "");
    return loc.includes("Remote") ? "Remote" : loc.split(",")[0]?.trim();
  }).filter(Boolean))].slice(0, 8);

  useEffect(() => {
    let result = jobs;
    if (filterLocation !== "All") {
      result = result.filter(job => {
        const loc = job?.j?.location || job?.location || "";
        return filterLocation === "Remote" ? loc.includes("Remote") : loc.includes(filterLocation);
      });
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(job => {
        const j = job?.j || job;
        const c = job?.c;
        return j?.title?.toLowerCase().includes(q) ||
               c?.name?.toLowerCase().includes(q) ||
               j?.location?.toLowerCase().includes(q) ||
               job?.skills?.some(s => s?.name?.toLowerCase().includes(q));
      });
    }
    setFiltered(result);
  }, [search, jobs, filterLocation]);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await jobsAPI.create(form);
      setShowModal(false);
      setForm({ title: "", experience: "", location: "", salary: "" });
      await fetchJobs();
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm("Delete this job?")) return;
    try { await jobsAPI.delete(id); await fetchJobs(); } catch (e) { console.error(e); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Jobs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} open positions</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <HiOutlinePlus className="w-4 h-4" /> Add Job
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 glass-card px-4 py-2.5 flex-1 min-w-[200px] max-w-sm">
          <HiOutlineSearch className="w-4 h-4 text-gray-500" />
          <input className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-full" placeholder="Search by title, company, skill…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch("")} className="text-gray-500 hover:text-gray-300"><HiOutlineX className="w-4 h-4" /></button>}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-500">Location:</span>
          {locations.map(loc => (
            <button
              key={loc}
              onClick={() => setFilterLocation(loc)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterLocation === loc
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-dark-700/40 text-gray-400 border border-white/[0.06] hover:bg-dark-700/80"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job, i) => {
            const j = job?.j || job;
            return (
              <div key={j?.id || i} className="relative group">
                <JobCard job={job} onClick={() => setSelected(job)} />
                <button
                  onClick={(e) => handleDelete(j?.id, e)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
                >
                  <HiOutlineTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3 glass-card p-12 text-center">
              <p className="text-gray-500 text-sm">No jobs match your filters.</p>
            </div>
          )}
        </div>
      )}

      {selected && <JobDrawer job={selected} onClose={() => setSelected(null)} />}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm p-4">
          <div className="glass-card p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-100">Add New Job</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400"><HiOutlineX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required className="form-input" placeholder="Job Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <input required type="number" min="0" className="form-input" placeholder="Min Experience (years)" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
              <input required className="form-input" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              <input required className="form-input" placeholder="Salary (e.g. $120,000 - $160,000)" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">{submitting ? "Creating…" : "Create Job"}</button>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
