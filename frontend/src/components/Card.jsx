// import React from 'react';

// export const Card = ({ title, value, icon, trend, color = 'blue' }) => {
//   const colorMap = {
//     blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 ring-blue-500/10',
//     green: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 ring-emerald-500/10',
//     amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 ring-amber-500/10',
//     red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 ring-red-500/10',
//     purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 ring-purple-500/10',
//     slate: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-500/10 ring-slate-500/10',
//   };

//   return (
//     <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-0.5 transition-all duration-300">
//       <div className="flex items-start justify-between gap-3">
//         <div className="min-w-0 flex-1">
//           <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider truncate">{title}</p>
//           <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2 tracking-tight">{value}</p>
//           {trend && (
//             <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5 flex items-center gap-1">
//               <span className="inline-block w-1 h-1 rounded-full bg-emerald-500"></span>
//               {trend}
//             </p>
//           )}
//         </div>
//         <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ring-1 ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
//           {icon}
//         </div>
//       </div>
//     </div>
//   );
// };


import React from 'react';

export const Card = ({ title, value, trend, color = 'blue' }) => {
  const accentMap = {
    blue: 'border-l-blue-500',
    green: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    red: 'border-l-red-500',
    purple: 'border-l-purple-500',
    slate: 'border-l-slate-400',
  };

  const dotMap = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    slate: 'bg-slate-400',
  };

  return (
    <div
      className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${accentMap[color]} rounded-2xl p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-0.5 transition-all duration-300`}
    >
      <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider truncate">
        {title}
      </p>
      <p className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mt-2 tracking-tight">
        {value}
      </p>
      {trend && (
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 flex items-center gap-1.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotMap[color]}`}></span>
          {trend}
        </p>
      )}
    </div>
  );
};