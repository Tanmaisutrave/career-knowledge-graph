import { NavLink } from "react-router-dom";
import {
  HiOutlineHome, HiOutlineUsers, HiOutlineChip, HiOutlineFolder,
  HiOutlineOfficeBuilding, HiOutlineBriefcase, HiOutlineLightBulb,
  HiOutlineGlobe, HiOutlineSparkles, HiOutlineChartBar,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { TbGraphFilled } from "react-icons/tb";

const navSections = [
  {
    label: "Overview",
    items: [
      { path: "/home",       icon: HiOutlineHome,       label: "Home" },
      { path: "/dashboard",  icon: HiOutlineViewGrid,   label: "Dashboard" },
    ],
  },
  {
    label: "Data",
    items: [
      { path: "/users",      icon: HiOutlineUsers,          label: "Users" },
      { path: "/skills",     icon: HiOutlineChip,           label: "Skills" },
      { path: "/projects",   icon: HiOutlineFolder,         label: "Projects" },
      { path: "/companies",  icon: HiOutlineOfficeBuilding, label: "Companies" },
      { path: "/jobs",       icon: HiOutlineBriefcase,      label: "Jobs" },
    ],
  },
  {
    label: "Graph Features",
    items: [
      { path: "/recommendations", icon: HiOutlineLightBulb, label: "Recommendations" },
      { path: "/graph-explorer",  icon: HiOutlineGlobe,     label: "Graph Explorer" },
      { path: "/analytics",       icon: HiOutlineChartBar,  label: "Analytics" },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-dark-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 flex flex-col
          bg-dark-900/95 backdrop-blur-xl border-r border-white/[0.05]
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-white/[0.05] flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center flex-shrink-0">
            <TbGraphFilled className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-100 leading-tight">Career Graph</p>
            <p className="text-[10px] text-gray-500">Powered by CognoDB</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navSections.map(({ label, items }) => (
            <div key={label}>
              <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold px-3 mb-1.5">
                {label}
              </p>
              <div className="space-y-0.5">
                {items.map(({ path, icon: Icon, label: itemLabel }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    onClick={() => onClose && onClose()}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {itemLabel}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.05] flex-shrink-0">
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <HiOutlineSparkles className="w-3.5 h-3.5 text-accent-purple" />
              <span className="text-xs font-semibold text-gray-300">Wexa AI Assignment</span>
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Career Knowledge Graph — Graph Database Demo
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-500">CognoDB Connected</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
