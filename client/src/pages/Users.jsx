import { useEffect, useState } from "react";
import {
  HiOutlineSearch, HiOutlinePlus, HiOutlineTrash, HiOutlineX,
  HiOutlineChip, HiOutlineFolder, HiOutlineBriefcase, HiOutlineShare,
  HiOutlineLocationMarker, HiOutlineArrowRight,
} from "react-icons/hi";
import UserCard from "../components/Cards/UserCard";
import { Loader } from "../components/Loader";
import { usersAPI, recommendationsAPI } from "../services/api";

const AVATAR_GRADIENTS = [
  "from-primary-500 to-accent-purple",
  "from-accent-cyan to-primary-500",
  "from-accent-green to-accent-cyan",
  "from-accent-orange to-accent-pink",
  "from-accent-purple to-accent-pink",
];

/* ── User Detail Drawer ─────────────────────────────────────── */
function UserDrawer({ user, onClose }) {
  const [full, setFull] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      setLoading(true);
      try {
        const [profile, conn] = await Promise.all([
          usersAPI.getById(user.id),
          recommendationsAPI.getConnections(user.id),
        ]);
        setFull(profile.data.data);
        setConnections(conn.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  const gradient = AVATAR_GRADIENTS[user?.name?.charCodeAt(0) % AVATAR_GRADIENTS.length];
  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-dark-950/70 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-md bg-dark-900/95 border-l border-white/[0.05] h-full overflow-y-auto flex flex-col animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                {initials}
              </div>
              <div>
                <h2 className="font-bold text-gray-100">{user?.name}</h2>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <HiOutlineLocationMarker className="w-3.5 h-3.5 text-gray-500" />
              {user?.location}
            </span>
            <span className="flex items-center gap-1">
              <HiOutlineBriefcase className="w-3.5 h-3.5 text-gray-500" />
              {user?.experience} years exp
            </span>
          </div>
        </div>

        {loading ? <Loader /> : (
          <div className="flex-1 p-6 space-y-5">
            {/* Skills */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineChip className="w-4 h-4 text-primary-400" />
                <h3 className="text-sm font-semibold text-gray-300">Skills ({full?.skills?.length || 0})</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(full?.skills || []).map((s, i) => (
                  <span key={i} className="stat-badge bg-primary-500/10 text-primary-300 border border-primary-500/20">{s?.name}</span>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineFolder className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-gray-300">Projects ({full?.projects?.length || 0})</h3>
              </div>
              <div className="space-y-2">
                {(full?.projects || []).map((p, i) => (
                  <div key={i} className="bg-dark-700/40 rounded-xl px-3 py-2.5">
                    <p className="text-sm font-medium text-gray-200">{p?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p?.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications */}
            {full?.applications?.filter(a => a?.job).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineBriefcase className="w-4 h-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Applied Jobs</h3>
                </div>
                <div className="space-y-2">
                  {full.applications.filter(a => a?.job).map((a, i) => (
                    <div key={i} className="bg-dark-700/40 rounded-xl px-3 py-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-200">{a.job?.title}</p>
                        <p className="text-xs text-gray-500">{a.company?.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Graph connections */}
            {connections.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineShare className="w-4 h-4 text-accent-purple" />
                  <h3 className="text-sm font-semibold text-gray-300">Reachable Companies</h3>
                  <span className="text-xs text-gray-500">(via skills→jobs)</span>
                </div>
                <div className="space-y-2">
                  {connections.map((conn, i) => (
                    <div key={i} className="flex items-center justify-between bg-dark-700/40 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">
                          {conn.c?.name?.[0] || "?"}
                        </div>
                        <span className="text-sm text-gray-200">{conn.c?.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{conn.relevantJobs} jobs</span>
                    </div>
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

/* ── Main Users Page ─────────────────────────────────────────── */
export default function Users() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", experience: "", location: "" });
  const [submitting, setSubmitting] = useState(false);
  const [filterExp, setFilterExp] = useState("All");

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await usersAPI.getAll();
      const data = res.data.data.map(r => ({ ...r.u, skills: r.skills || [], projects: r.projects || [] }));
      setUsers(data);
      setFiltered(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let result = users;
    if (filterExp !== "All") {
      result = result.filter(u => {
        if (filterExp === "Junior")   return u.experience <= 2;
        if (filterExp === "Mid")      return u.experience >= 3 && u.experience <= 5;
        if (filterExp === "Senior")   return u.experience >= 6 && u.experience <= 8;
        if (filterExp === "Principal") return u.experience >= 9;
        return true;
      });
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q) ||
        u.skills?.some(s => s?.name?.toLowerCase().includes(q))
      );
    }
    setFiltered(result);
  }, [search, users, filterExp]);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await usersAPI.create({ ...form, experience: Number(form.experience) });
      setShowModal(false);
      setForm({ name: "", email: "", experience: "", location: "" });
      await fetchUsers();
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm("Delete this user and all their relationships?")) return;
    try { await usersAPI.delete(id); await fetchUsers(); }
    catch (e) { console.error(e); }
  }

  const EXP_FILTERS = ["All", "Junior", "Mid", "Senior", "Principal"];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} of {users.length} professionals</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <HiOutlinePlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 glass-card px-4 py-2.5 flex-1 min-w-[200px] max-w-md">
          <HiOutlineSearch className="w-4 h-4 text-gray-500" />
          <input
            className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-full"
            placeholder="Search by name, skill, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch("")} className="text-gray-500 hover:text-gray-300"><HiOutlineX className="w-4 h-4" /></button>}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Level:</span>
          {EXP_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilterExp(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterExp === f
                  ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                  : "bg-dark-700/40 text-gray-400 border border-white/[0.06] hover:bg-dark-700/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? <Loader /> : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-gray-500 text-sm">No users found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map(u => (
            <div key={u.id} className="relative group">
              <UserCard user={u} onClick={() => setSelected(u)} />
              <button
                onClick={(e) => handleDelete(u.id, e)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20
                           opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
              >
                <HiOutlineTrash className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Detail drawer */}
      {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} />}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm p-4">
          <div className="glass-card p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-100">Add New User</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required className="form-input" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input required type="email" className="form-input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input required type="number" min="0" max="50" className="form-input" placeholder="Years of Experience" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
              <input required className="form-input" placeholder="Location (e.g. San Francisco, CA)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? "Creating…" : "Create User"}
                </button>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
