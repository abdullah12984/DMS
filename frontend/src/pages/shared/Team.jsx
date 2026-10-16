import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/Badge';
import { api } from '../../services/apiClient';

const Team = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getResourceStats().then((data) => setResources(data.resources || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const getUtilColor = (u) => u > 80 ? 'bg-red-500' : u > 50 ? 'bg-amber-500' : 'bg-emerald-500';

  if (loading) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading team...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">My Team</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Team members and their availability</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources.map(r => (
          <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-lg transition-all">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-base font-bold shrink-0">
                {r.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{r.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.role}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-slate-500 dark:text-slate-400">Active Tasks</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{r.activeTasks}</span>
            </div>

            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-slate-500 dark:text-slate-400">Status</span>
              <Badge variant={r.status === 'Available' ? 'success' : 'warning'} size="sm">{r.status}</Badge>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${getUtilColor(r.utilization)}`} style={{ width: `${r.utilization}%` }}></div>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-9 text-right">{r.utilization}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;