import { useEffect, useState } from "react";
import {
  HiOutlinePlus, HiOutlineTrash, HiOutlineSearch, HiOutlineX,
  HiOutlineUsers, HiOutlineFolder, HiOutlineBriefcase, HiOutlineShare,
} from "react-icons/hi";
import { Loader } from "../components/Loader";
import { skillsAPI, analyticsAPI } from "../services/api";

const CATEGORY_COLORS = {
  "Programming Language": "bg-blue-500/10 text-blue-300 border-blue-500/20",
  "Frontend Framework":   "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  "Backend Framework":    "bg-green-500/10 text-green-300 border-green-500/20",
  "Backend Runtime":      "bg-teal-500/10 text-teal-300 border-teal-500/20",
  "Database":             "bg-orange-500/10 text-orange-300 border-orange-500/20",
  "DevOps":               "bg-red-500/10 text-red-300 border-red-500/20",
  "Cloud Platform":       "bg-sky-500/10 text-sky-300 border-sky-500/20",
  "AI/ML":                "bg-purple-500/10 text-purple-300 border-purple-500/20",
  "API Technology":       "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  "Tool":                 "bg-gray-500/10 text-gray-300 border-gray-500/20",
  "Design Tool":          "bg-pink-500/10 text-pink-300 border-pink-500/20",
};

/* ── Skill Detail Drawer ─────────────────────────────────────── */
function SkillDrawer({ skill, onClose }) {
  const [full, setFull] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!skill?.id) return;
    async function load() {
      setLoading(true);
      try {
        const [detail, rel] = await Promise.all([
          skillsAPI.getById(skill.id),
          analyticsAPI.getRelatedSkills(skill.id),
        ]);
        setFull(detail.data.data);
        setRelated(rel.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [skill]);

  const colorClass = CATEGORY_COLORS[skill?.category] || "bg-gray-500/10 text-gray-300 border-gray-500/20";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-dark-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-dark-900/95 border-l border-white/[0.05] h-full overflow-y-auto flex flex-col animate-slide-up">
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className={`stat-badge border text-xs mb-2 ${colorClass}`}>{skill?.category}</span>
              <h2 className="text-xl font-bold text-gray-100">{skill?.name}</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400 flex-shrink-0">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? <Loader /> : (
          <div className="flex-1 p-6 space-y-5">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Users",    value: full?.users?.length || 0,    icon: HiOutlineUsers,    color: "text-primary-400" },
                { label: "Projects", value: full?.projects?.length || 0, icon: HiOutlineFolder,   color: "text-cyan-400" },
                { label: "Jobs",     value: full?.jobs?.length || 0,     icon: HiOutlineBriefcase, color: "text-green-400" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="glass-card p-3 text-center">
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                  <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
                  <div className="text-[10px] text-gray-500">{label}</div>
                </div>
              ))}
            </div>

            {/* Users having skill */}
            {full?.users?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineUsers className="w-4 h-4 text-primary-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Users with this skill</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {full.users.map((u, i) => (
                    <span key={i} className="stat-badge bg-dark-700/40 text-gray-300 border border-white/[0.06]">
                      {u?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Jobs requiring this skill */}
            {full?.jobs?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineBriefcase className="w-4 h-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Jobs requiring this skill</h3>
                </div>
                <div className="space-y-2">
                  {full.jobs.map((j, i) => (
                    <div key={i} className="bg-dark-700/40 rounded-xl px-3 py-2.5 flex items-center justify-between">
                      <span className="text-sm text-gray-200">{j?.title}</span>
                      <span className="text-xs text-gray-500">{j?.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related skills */}
            {related.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineShare className="w-4 h-4 text-accent-purple" />
                  <h3 className="text-sm font-semibold text-gray-300">Related Skills</h3>
                  <span className="text-xs text-gray-500">(co-occur in same projects/jobs)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {related.map((r, i) => (
                    <span key={i} className="stat-badge bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {r?.related?.name}
                      <span className="text-purple-600 ml-1">{r?.coOccurrences}×</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Skills Page ─────────────────────────────────────────── */
export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", category: "" });
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("grouped"); // grouped | list

  async function fetchSkills() {
    setLoading(true);
    try {
      const res = await skillsAPI.getAll();
      const data = res.data.data.map(r => ({ ...r.s, userCount: r.userCount }));
      setSkills(data);
      setFiltered(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  useEffect(() => { fetchSkills(); }, []);

  useEffect(() => {
    if (!search) return setFiltered(skills);
    const q = search.toLowerCase();
    setFiltered(skills.filter(s => s.name?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q)));
  }, [search, skills]);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await skillsAPI.create(form);
      setShowModal(false);
      setForm({ name: "", category: "" });
      await fetchSkills();
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm("Delete this skill?")) return;
    try { await skillsAPI.delete(id); await fetchSkills(); } catch (e) { console.error(e); }
  }

  const grouped = filtered.reduce((acc, s) => {
    acc[s.category] = [...(acc[s.category] || []), s];
    return acc;
  }, {});

  // Sort groups by total userCount desc
  const sortedGroups = Object.entries(grouped).sort(
    ([, a], [, b]) => b.reduce((s, x) => s + (x.userCount || 0), 0) - a.reduce((s, x) => s + (x.userCount || 0), 0)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Skills</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} skills · {Object.keys(grouped).length} categories</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-dark-700/40 rounded-xl p-0.5 border border-white/[0.06]">
            {["grouped", "list"].map(m => (
              <button key={m} onClick={() => setViewMode(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === m ? "bg-dark-600/80 text-gray-200" : "text-gray-500 hover:text-gray-300"}`}>
                {m === "grouped" ? "Grouped" : "List"}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <HiOutlinePlus className="w-4 h-4" /> Add Skill
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 glass-card px-4 py-2.5 max-w-md">
        <HiOutlineSearch className="w-4 h-4 text-gray-500" />
        <input className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-full" placeholder="Search skills or categories…" value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch("")} className="text-gray-500 hover:text-gray-300"><HiOutlineX className="w-4 h-4" /></button>}
      </div>

      {loading ? <Loader /> : (
        viewMode === "grouped" ? (
          <div className="space-y-5">
            {sortedGroups.map(([category, items]) => (
              <div key={category} className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`stat-badge border ${CATEGORY_COLORS[category] || "bg-gray-500/10 text-gray-300 border-gray-500/20"}`}>
                    {category}
                  </span>
                  <span className="text-xs text-gray-500">{items.length} skills</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {items.map(s => (
                    <div
                      key={s.id}
                      className="group relative bg-dark-700/40 rounded-xl p-3 cursor-pointer hover:bg-dark-700/80 transition-all border border-white/[0.04] hover:border-white/[0.12] hover:scale-[1.02]"
                      onClick={() => setSelected(s)}
                    >
                      <p className="text-sm font-medium text-gray-200 mb-1">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.userCount} users</p>
                      <button
                        onClick={(e) => handleDelete(s.id, e)}
                        className="absolute top-2 right-2 p-1 rounded bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
                      >
                        <HiOutlineTrash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Category</th>
                  <th>Users</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.sort((a, b) => (b.userCount || 0) - (a.userCount || 0)).map(s => (
                  <tr key={s.id} className="cursor-pointer" onClick={() => setSelected(s)}>
                    <td><span className="font-medium text-gray-200">{s.name}</span></td>
                    <td><span className={`stat-badge border text-[10px] ${CATEGORY_COLORS[s.category] || "bg-gray-500/10 text-gray-300 border-gray-500/20"}`}>{s.category}</span></td>
                    <td><span className="font-semibold text-primary-400 font-mono">{s.userCount}</span></td>
                    <td>
                      <button onClick={(e) => handleDelete(s.id, e)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/30 transition-colors">
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {selected && <SkillDrawer skill={selected} onClose={() => setSelected(null)} />}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm p-4">
          <div className="glass-card p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-100">Add New Skill</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400"><HiOutlineX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required className="form-input" placeholder="Skill Name (e.g. Rust)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input required className="form-input" placeholder="Category (e.g. Programming Language)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">{submitting ? "Creating…" : "Create Skill"}</button>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
