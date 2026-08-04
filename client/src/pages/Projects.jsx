import { useEffect, useState } from "react";
import {
  HiOutlinePlus, HiOutlineTrash, HiOutlineSearch, HiOutlineX,
  HiOutlineExternalLink, HiOutlineChip, HiOutlineUsers, HiOutlineShare,
} from "react-icons/hi";
import { Loader } from "../components/Loader";
import { projectsAPI, analyticsAPI } from "../services/api";

/* ── Project Detail Drawer ──────────────────────────────────── */
function ProjectDrawer({ project, onClose }) {
  const [full, setFull] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!project?.id) return;
    async function load() {
      setLoading(true);
      try {
        const res = await projectsAPI.getById(project.id);
        setFull(res.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [project]);

  const skills  = full?.skills  || project?.skills  || [];
  const members = full?.members || [];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-dark-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-dark-900/95 border-l border-white/[0.05] h-full overflow-y-auto flex flex-col animate-slide-up">
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-bold text-gray-100 text-lg">{project?.name}</h2>
              {project?.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 mt-1">
                  <HiOutlineExternalLink className="w-3.5 h-3.5" /> GitHub Repository
                </a>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400 flex-shrink-0">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{project?.description}</p>
        </div>

        {loading ? <Loader /> : (
          <div className="flex-1 p-6 space-y-5">
            {/* Tech stack */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineChip className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-gray-300">Technologies Used ({skills.length})</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, i) => (
                  <span key={i} className="stat-badge bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">{s?.name}</span>
                ))}
              </div>
            </div>

            {/* Contributors */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineUsers className="w-4 h-4 text-primary-400" />
                <h3 className="text-sm font-semibold text-gray-300">Contributors ({members.length})</h3>
              </div>
              {members.length === 0 ? (
                <p className="text-xs text-gray-500">No contributors recorded.</p>
              ) : (
                <div className="space-y-2">
                  {members.map((u, i) => (
                    <div key={i} className="flex items-center gap-3 bg-dark-700/40 rounded-xl px-3 py-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {u?.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">{u?.name}</p>
                        <p className="text-xs text-gray-500">{u?.experience}y exp</p>
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

/* ── Main Projects Page ──────────────────────────────────────── */
export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", github: "" });
  const [submitting, setSubmitting] = useState(false);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await projectsAPI.getAll();
      const data = res.data.data.map(r => ({ ...r.p, skills: r.skills || [], memberCount: r.memberCount }));
      setProjects(data);
      setFiltered(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    if (!search) return setFiltered(projects);
    const q = search.toLowerCase();
    setFiltered(projects.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.skills?.some(s => s?.name?.toLowerCase().includes(q))
    ));
  }, [search, projects]);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await projectsAPI.create(form);
      setShowModal(false);
      setForm({ name: "", description: "", github: "" });
      await fetchProjects();
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm("Delete this project?")) return;
    try { await projectsAPI.delete(id); await fetchProjects(); } catch (e) { console.error(e); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} projects</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <HiOutlinePlus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <div className="flex items-center gap-2 glass-card px-4 py-2.5 max-w-md">
        <HiOutlineSearch className="w-4 h-4 text-gray-500" />
        <input className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-full" placeholder="Search by name, description, technology…" value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch("")} className="text-gray-500 hover:text-gray-300"><HiOutlineX className="w-4 h-4" /></button>}
      </div>

      {loading ? <Loader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div
              key={p.id}
              className="glass-card p-5 group cursor-pointer hover:border-cyan-500/30 transition-all hover:scale-[1.01]"
              onClick={() => setSelected(p)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-100 group-hover:text-cyan-400 transition-colors leading-tight pr-2">
                  {p.name}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <HiOutlineUsers className="w-3 h-3" />{p.memberCount}
                  </span>
                  <button
                    onClick={(e) => handleDelete(p.id, e)}
                    className="p-1 rounded bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30 ml-1"
                  >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {p.skills?.slice(0, 4).map((s, i) => (
                  <span key={i} className="stat-badge bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">{s?.name}</span>
                ))}
                {p.skills?.length > 4 && <span className="stat-badge bg-dark-700/60 text-gray-500">+{p.skills.length - 4}</span>}
              </div>
              {p.github && (
                <a
                  href={p.github} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-400 transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  <HiOutlineExternalLink className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 glass-card p-12 text-center">
              <p className="text-gray-500 text-sm">No projects found.</p>
            </div>
          )}
        </div>
      )}

      {selected && <ProjectDrawer project={selected} onClose={() => setSelected(null)} />}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm p-4">
          <div className="glass-card p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-100">Add New Project</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400"><HiOutlineX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required className="form-input" placeholder="Project Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <textarea required rows={3} className="form-input resize-none" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input className="form-input" placeholder="GitHub URL (optional)" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} />
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">{submitting ? "Creating…" : "Create Project"}</button>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
