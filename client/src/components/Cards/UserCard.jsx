import { HiOutlineLocationMarker, HiOutlineBriefcase } from "react-icons/hi";

const AVATAR_COLORS = [
  "from-primary-500 to-accent-purple",
  "from-accent-cyan to-primary-500",
  "from-accent-green to-accent-cyan",
  "from-accent-orange to-accent-pink",
  "from-accent-purple to-accent-pink",
];

export default function UserCard({ user, onClick }) {
  const gradient = AVATAR_COLORS[user?.name?.charCodeAt(0) % AVATAR_COLORS.length];
  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const skills = user?.skills || [];

  return (
    <div
      className="glass-card p-5 hover:border-primary-500/30 transition-all duration-200 cursor-pointer hover:scale-[1.01] group"
      onClick={onClick}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-100 group-hover:text-primary-400 transition-colors truncate">{user?.name}</h3>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <HiOutlineLocationMarker className="w-3.5 h-3.5 text-gray-500" />
          {user?.location}
        </span>
        <span className="flex items-center gap-1">
          <HiOutlineBriefcase className="w-3.5 h-3.5 text-gray-500" />
          {user?.experience}y exp
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {skills.slice(0, 4).map((s, i) => (
          <span key={i} className="stat-badge bg-primary-500/10 text-primary-300 border border-primary-500/20">
            {s?.name || s}
          </span>
        ))}
        {skills.length > 4 && (
          <span className="stat-badge bg-dark-700/60 text-gray-500">+{skills.length - 4}</span>
        )}
      </div>
    </div>
  );
}
