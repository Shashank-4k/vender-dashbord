import React from 'react';

const KPICard = ({ title, value, subtext, icon: Icon, color = 'indigo', trend }) => {
  const colorMap = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800/40',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800/40',
    blue: 'text-blue-600 bg-blue-50 border-blue-100 dark:text-sky-400 dark:bg-sky-950/40 dark:border-sky-800/40',
    amber: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800/40',
    rose: 'text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-800/40',
    purple: 'text-purple-600 bg-purple-50 border-purple-100 dark:text-purple-400 dark:bg-purple-950/40 dark:border-purple-800/40',
  };

  const badgeClass = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#293548] p-5 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${badgeClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline space-x-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F1F5F9]">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold ${trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {trend > 0 ? `+${trend}%` : `${trend}%`}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtext}</p>
      )}
    </div>
  );
};

export default KPICard;

