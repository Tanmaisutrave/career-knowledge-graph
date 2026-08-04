import { HiOutlineLocationMarker, HiOutlineCurrencyDollar, HiOutlineBriefcase } from "react-icons/hi";

const COMPANY_COLORS = [
  "from-accent-cyan/20 to-primary-500/5",
  "from-accent-purple/20 to-accent-pink/5",
  "from-accent-green/20 to-accent-cyan/5",
  "from-accent-orange/20 to-accent-pink/5",
];

export default function JobCard({ job, onClick }) {
  const gradient = COMPANY_COLORS[job?.j?.title?.charCodeAt(0) % COMPANY_COLORS.length] || COMPANY_COLORS[0];
  const j = job?.j || job;
  const company = job?.c;
  const skills = job?.skills || [];

  return (
    <div
      className={`glass-card p-5 bg-gradient-to-br ${gradient} hover:border-accent-cyan/30 transition-all duration-200 cursor-pointer hover:scale-[1.01] group`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-100 group-hover:text-accent-cyan transition-colors text-sm leading-tight mb-1">
            {j?.title}
          </h3>
          {company && (
            <p className="text-xs text-gray-400">{company?.name}</p>
          )}
        </div>
        <span className="stat-badge bg-accent-cyan/10 text-cyan-300 border border-cyan-500/20 flex-shrink-0 ml-2">
          {j?.experience}y+
        </span>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <HiOutlineLocationMarker className="w-3.5 h-3.5 text-gray-500" />
          {j?.location}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-400">
          <HiOutlineCurrencyDollar className="w-3.5 h-3.5" />
          {j?.salary}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {skills.slice(0, 3).map((s, i) => (
          <span key={i} className="stat-badge bg-dark-700/60 text-gray-400 border border-white/[0.06]">
            {s?.name || s}
          </span>
        ))}
        {skills.length > 3 && (
          <span className="stat-badge bg-dark-700/60 text-gray-500">+{skills.length - 3}</span>
        )}
      </div>
    </div>
  );
}
