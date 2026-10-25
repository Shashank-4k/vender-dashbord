import React from 'react';

const ChartCard = ({ title, subtitle, children, headerRight, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#293548] p-5 shadow-xs transition-colors duration-200 ${className}`}>
      <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-[#293548] mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-[#F1F5F9]">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {headerRight && <div>{headerRight}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default ChartCard;

