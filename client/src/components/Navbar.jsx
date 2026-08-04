import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineBell, HiOutlineSearch, HiMenuAlt2, HiOutlineX } from "react-icons/hi";
import { usersAPI, skillsAPI, jobsAPI, companiesAPI, projectsAPI } from "../services/api";

/* ── Global search result item ─────────────────────────────── */
function SearchResult({ label, name, sub, color, onClick }) {
  return (
    <button
      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/[0.04] rounded-lg transition-colors"
      onClick={onClick}
    >
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0">
        <p className="text-sm text-gray-200 truncate">{name}</p>
        {sub && <p className="text-xs text-gray-500 truncate">{sub}</p>}
      </div>
      <span
        className="ml-auto text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color + "20", color }}
      >
        {label}
      </span>
    </button>
  );
}

const TYPE_COLORS = {
  User: "#3b82f6", Skill: "#a855f7", Project: "#06b6d4",
  Company: "#f59e0b", Job: "#10b981",
};
const TYPE_ROUTES = {
  User: "/users", Skill: "/skills", Project: "/projects",
  Company: "/companies", Job: "/jobs",
};

export default function Navbar({ onToggleSidebar }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const id = setTimeout(async () => {
      setSearching(true);
      try {
        const q = query.toLowerCase();
        const [users, skills, jobs, companies, projects] = await Promise.all([
          usersAPI.getAll().then(r => r.data.data?.map(d => ({ ...d.u, skills: d.skills || [] })) || []),
          skillsAPI.getAll().then(r => r.data.data?.map(d => d.s) || []),
          jobsAPI.getAll().then(r => r.data.data || []),
          companiesAPI.getAll().then(r => r.data.data?.map(d => d.c) || []),
          projectsAPI.getAll().then(r => r.data.data?.map(d => d.p) || []),
        ]);

        const found = [
          ...users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
            .slice(0, 3).map(u => ({ type: "User", id: u.id, name: u.name, sub: u.email })),
          ...skills.filter(s => s.name?.toLowerCase().includes(q))
            .slice(0, 3).map(s => ({ type: "Skill", id: s.id, name: s.name, sub: s.category })),
          ...jobs.filter(job => { const j = job.j || job; return j.title?.toLowerCase().includes(q); })
            .slice(0, 3).map(job => { const j = job.j || job; const c = job.c; return { type: "Job", id: j.id, name: j.title, sub: c?.name || j.location }; }),
          ...companies.filter(c => c.name?.toLowerCase().includes(q))
            .slice(0, 2).map(c => ({ type: "Company", id: c.id, name: c.name, sub: c.industry })),
          ...projects.filter(p => p.name?.toLowerCase().includes(q))
            .slice(0, 2).map(p => ({ type: "Project", id: p.id, name: p.name, sub: p.description?.slice(0, 60) + "…" })),
        ];
        setResults(found);
        setOpen(found.length > 0);
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(id);
  }, [query]);

  function handleSelect(item) {
    navigate(TYPE_ROUTES[item.type] || "/");
    setQuery("");
    setOpen(false);
  }

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-white/[0.05] bg-dark-950/80 backdrop-blur-md sticky top-0 z-30 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/[0.06] transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <HiMenuAlt2 className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div className="relative hidden md:block" ref={panelRef}>
          <div className="flex items-center gap-2 bg-dark-800/60 border border-white/[0.06] rounded-xl px-3 py-2 w-72 focus-within:border-primary-500/40 focus-within:bg-dark-700/60 transition-all">
            <HiOutlineSearch className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder="Search users, skills, jobs…"
              className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-full"
            />
            {query && (
              <button onClick={() => { setQuery(""); setOpen(false); }} className="text-gray-500 hover:text-gray-300">
                <HiOutlineX className="w-3.5 h-3.5" />
              </button>
            )}
            {!query && <span className="text-xs text-gray-600 font-mono">⌘K</span>}
          </div>

          {/* Search dropdown */}
          {open && (
            <div className="absolute top-full mt-2 left-0 w-80 glass-card py-2 shadow-2xl z-50 animate-slide-up">
              {searching && (
                <div className="px-3 py-2 text-xs text-gray-500">Searching…</div>
              )}
              {!searching && results.length === 0 && query && (
                <div className="px-3 py-2 text-xs text-gray-500">No results for "{query}"</div>
              )}
              {results.map((item, i) => (
                <SearchResult
                  key={i}
                  label={item.type}
                  name={item.name}
                  sub={item.sub}
                  color={TYPE_COLORS[item.type]}
                  onClick={() => handleSelect(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">CognoDB</span>
        </div>
        <button className="p-2 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-white/[0.06] transition-colors relative">
          <HiOutlineBell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary-500" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-xs font-bold text-white ml-1">
          WX
        </div>
      </div>
    </header>
  );
}
