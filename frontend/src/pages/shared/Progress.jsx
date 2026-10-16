import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const Progress = ({ role = 'viewer' }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProgressStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading progress...</div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Progress Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Department-wide project and task tracking</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Projects', value: stats.total, color: 'text-slate-900 dark:text-slate-100' },
          { label: 'Avg Progress', value: `${stats.avgProgress}%`, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'In Progress', value: stats.byStatus['In Progress'] || 0, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Completed', value: stats.byStatus.Completed || 0, color: 'text-emerald-600 dark:text-emerald-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5">
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl md:text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* By Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">Projects by Status</h3>
          <div className="space-y-4">
            {Object.entries(stats.byStatus).map(([status, count]) => {
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const colors = {
                'In Progress': 'bg-blue-500',
                'Completed': 'bg-emerald-500',
                'On Hold': 'bg-amber-500',
                'Not Started': 'bg-slate-500',
                'Cancelled': 'bg-red-500',
              };
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{status}</span>
                    <span className="text-slate-500 dark:text-slate-400">{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[status]} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Type */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">Projects by Type</h3>
          <div className="space-y-4">
            {Object.entries(stats.byType).map(([type, count]) => {
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const colors = { Active: 'bg-emerald-500', Internal: 'bg-blue-500', Training: 'bg-amber-500', Product: 'bg-purple-500' };
              return (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{type}</span>
                    <span className="text-slate-500 dark:text-slate-400">{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[type]} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">Project Progress</h3>
        <div className="space-y-4">
          {stats.projects.map(p => (
            <div key={p.id}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{p.name}</span>
                <span className="text-slate-500 dark:text-slate-400 ml-2">{p.progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${p.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Progress;