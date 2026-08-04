export default function StatCard({ title, value, icon: Icon, color = "blue", trend, subtitle }) {
  const colorMap = {
    blue:   "from-primary-500/20 to-primary-600/5 border-primary-500/20 text-primary-400",
    purple: "from-accent-purple/20 to-accent-purple/5 border-purple-500/20 text-purple-400",
    cyan:   "from-accent-cyan/20 to-accent-cyan/5 border-cyan-500/20 text-cyan-400",
    green:  "from-accent-green/20 to-accent-green/5 border-green-500/20 text-green-400",
    orange: "from-accent-orange/20 to-accent-orange/5 border-orange-500/20 text-orange-400",
    pink:   "from-accent-pink/20 to-accent-pink/5 border-pink-500/20 text-pink-400",
  };

  const iconBg = {
    blue:   "bg-primary-500/10 text-primary-400",
    purple: "bg-purple-500/10 text-purple-400",
    cyan:   "bg-cyan-500/10 text-cyan-400",
    green:  "bg-green-500/10 text-green-400",
    orange: "bg-orange-500/10 text-orange-400",
    pink:   "bg-pink-500/10 text-pink-400",
  };

  return (
    <div className={`glass-card p-5 bg-gradient-to-br border ${colorMap[color]} relative overflow-hidden group
                     hover:scale-[1.01] transition-transform duration-200`}>
      {/* Background glow */}
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20 bg-current`} />

      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg[color]} flex items-center justify-center`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {trend && (
          <span className="text-xs text-green-400 bg-green-400/10 rounded-full px-2 py-0.5 font-medium">
            {trend}
          </span>
        )}
      </div>

      <div className="text-3xl font-bold text-gray-100 mb-0.5 font-mono">
        {value ?? <span className="skeleton h-8 w-16 block rounded" />}
      </div>
      <p className="text-sm text-gray-400">{title}</p>
      {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
    </div>
  );
}
