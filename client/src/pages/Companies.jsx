import { useEffect, useState } from "react";
import {
  HiOutlinePlus, HiOutlineTrash, HiOutlineSearch, HiOutlineX,
  HiOutlineExternalLink, HiOutlineBriefcase, HiOutlineUsers,
  HiOutlineChip, HiOutlineShare,
} from "react-icons/hi";
import { Loader } from "../components/Loader";
import { companiesAPI, usersAPI, recommendationsAPI } from "../services/api";

/* ── Company Detail Drawer ──────────────────────────────────── */
function CompanyDrawer({ company, onClose }) {
  const [full, setFull] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company?.id) return;
    async function load() {
      setLoading(true);
      try {
        // Get full company + find users connected to this company
        const [detail, usersRes] = await Promise.all([
          companiesAPI.getById(company.id),
          usersAPI.getAll(),
        ]);
        setFull(detail.data.data);
        // Find users that applied to this company's jobs
        const allUsers = (usersRes.data.data || []).map(r => ({ ...r.u, skills: r.skills || [] }));
        // Filter: users who have skills matching company's required skills
        const companySkillIds = new Set(
          (detail.data.data?.requiredSkills || []).map(s => s.id).filter(Boolean)
        );
        const matched = allUsers.filter(u =>
          u.skills?.some(s => companySkillIds.has(s.id))
        ).slice(0, 6);
        setCandidates(matched);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [company]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-dark-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-dark-900/95 border-l border-white/[0.05] h-full overflow-y-auto flex flex-col animate-slide-up">
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/20 flex items-center justify-center text-orange-400 text-xl font-bold">
                {company?.name?.[0]}
              </div>
              <div>
                <h2 className="font-bold text-gray-100">{company?.name}</h2>
                <span className="stat-badge bg-orange-500/10 text-orange-300 border border-orange-500/20 text-[10px] mt-1">
                  {company?.industry}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400 flex-shrink-0">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
          {company?.website && (
            <a href={company.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 mt-2">
              <HiOutlineExternalLink className="w-3.5 h-3.5" /> {company.website}
            </a>
          )}
        </div>

        {loading ? <Loader /> : (
          <div className="flex-1 p-6 space-y-5">
            {/* Jobs */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineBriefcase className="w-4 h-4 text-green-400" />
                <h3 className="text-sm font-semibold text-gray-300">Open Positions ({full?.jobs?.length || 0})</h3>
              </div>
              <div className="space-y-2">
                {(full?.jobs || []).map((j, i) => (
                  <div key={i} className="bg-dark-700/40 rounded-xl px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-200">{j?.title}</p>
                      <span className="text-xs text-gray-500">{j?.experience}y+</span>
                    </div>
                    <p className="text-xs text-gray-500">{j?.location} · {j?.salary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Required skills */}
            {full?.requiredSkills?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineChip className="w-4 h-4 text-primary-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Required Skills (across all jobs)</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {full.requiredSkills.map((s, i) => (
                    <span key={i} className="stat-badge bg-primary-500/10 text-primary-300 border border-primary-500/20">{s?.name}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended candidates */}
            {candidates.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineUsers className="w-4 h-4 text-accent-purple" />
                  <h3 className="text-sm font-semibold text-gray-300">Matching Candidates</h3>
                  <span className="text-xs text-gray-500">(have required skills)</span>
                </div>
                <div className="space-y-2">
                  {candidates.map((u, i) => (
                    <div key={i} className="flex items-center gap-3 bg-dark-700/40 rounded-xl px-3 py-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.experience}y exp · {u.location}</p>
                      </div>
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

/* ── Main Companies Page ─────────────────────────────────────── */
export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", industry: "", website: "" });
  const [submitting, setSubmitting] = useState(false);

  async function fetchCompanies() {
    setLoading(true);
    try {
      const res = await companiesAPI.getAll();
      const data = res.data.data.map(r => ({ ...r.c, jobs: r.jobs || [], jobCount: r.jobCount }));
      setCompanies(data);
      setFiltered(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  useEffect(() => { fetchCompanies(); }, []);

  useEffect(() => {
    if (!search) return setFiltered(companies);
    const q = search.toLowerCase();
    setFiltered(companies.filter(c => c.name?.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q)));
  }, [search, companies]);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await companiesAPI.create(form);
      setShowModal(false);
      setForm({ name: "", industry: "", website: "" });
      await fetchCompanies();
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm("Delete this company?")) return;
    try { await companiesAPI.delete(id); await fetchCompanies(); } catch (e) { console.error(e); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Companies</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} companies</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <HiOutlinePlus className="w-4 h-4" /> Add Company
        </button>
      </div>

      <div className="flex items-center gap-2 glass-card px-4 py-2.5 max-w-md">
        <HiOutlineSearch className="w-4 h-4 text-gray-500" />
        <input className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-full" placeholder="Search companies or industries…" value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch("")} className="text-gray-500 hover:text-gray-300"><HiOutlineX className="w-4 h-4" /></button>}
      </div>

      {loading ? <Loader /> : (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Industry</th>
                <th>Website</th>
                <th>Jobs Posted</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="cursor-pointer group" onClick={() => setSelected(c)}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold flex-shrink-0">
                        {c.name?.[0]}
                      </div>
                      <span className="font-medium text-gray-200 group-hover:text-orange-300 transition-colors">{c.name}</span>
                    </div>
                  </td>
                  <td><span className="stat-badge bg-orange-500/10 text-orange-300 border border-orange-500/20">{c.industry}</span></td>
                  <td>
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-xs transition-colors"
                        onClick={e => e.stopPropagation()}>
                        <HiOutlineExternalLink className="w-3.5 h-3.5" /> Visit
                      </a>
                    ) : "—"}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <HiOutlineBriefcase className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-semibold text-gray-200">{c.jobCount ?? c.jobs?.length ?? 0}</span>
                    </div>
                  </td>
                  <td>
                    <button onClick={(e) => handleDelete(c.id, e)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/30 transition-colors opacity-0 group-hover:opacity-100">
                      <HiOutlineTrash className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <CompanyDrawer company={selected} onClose={() => setSelected(null)} />}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm p-4">
          <div className="glass-card p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-100">Add New Company</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400"><HiOutlineX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required className="form-input" placeholder="Company Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input required className="form-input" placeholder="Industry (e.g. Cloud Computing)" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} />
              <input className="form-input" placeholder="Website URL" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">{submitting ? "Creating…" : "Create Company"}</button>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
