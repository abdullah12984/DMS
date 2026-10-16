import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const Reports = ({ role = 'viewer' }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProgressStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  const reports = [
    { title: 'Monthly Activity Report', desc: 'October 2026 — department overview', icon: '📊', color: 'blue' },
    { title: 'Resource Utilization', desc: 'Current quarter analysis', icon: '👥', color: 'purple' },
    { title: 'Project Completion Rate', desc: 'Year-to-date performance', icon: '✅', color: 'emerald' },
    { title: 'Task Velocity', desc: 'Last 30 days throughput', icon: '⚡', color: 'amber' },
  ];

  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Department Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Read-only analytics & insights</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition">
          ⬇️ Export All
        </button>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5">
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projects</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5">
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Progress</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.avgProgress}%</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5">
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active</p>
            <p className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">{stats.byStatus['In Progress'] || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5">
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed</p>
            <p className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{stats.byStatus.Completed || 0}</p>
          </div>
        </div>
      )}

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map((r, i) => (
          <div key={i} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorMap[r.color]} group-hover:scale-110 transition-transform`}>
                {r.icon}
              </div>
              <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                Download ↓
              </button>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{r.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;