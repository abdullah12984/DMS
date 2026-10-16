import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/Badge';
import { api } from '../../services/api';

const Resources = ({ role = 'viewer' }) => {
  const canManage = role === 'superadmin' || role === 'admin';
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getResourceStats()
      .then(data => setResources(data.resources || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const available = resources.filter(r => r.status === 'Available').length;
  const busy = resources.filter(r => r.status === 'Busy').length;
  const avgUtil = resources.length > 0
    ? Math.round(resources.reduce((s, r) => s + r.utilization, 0) / resources.length)
    : 0;

  const getUtilColor = (u) => u > 80 ? 'bg-red-500' : u > 50 ? 'bg-amber-500' : 'bg-emerald-500';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Resource Management</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitor team availability and workload</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5">
          <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</p>
          <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1.5">{resources.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 md:p-5">
          <p className="text-[10px] md:text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Available</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{available}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 md:p-5">
          <p className="text-[10px] md:text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Busy</p>
          <p className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1.5">{busy}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5">
          <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Load</p>
          <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1.5">{avgUtil}%</p>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-20 text-center">
          <p className="text-5xl mb-4">👥</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">No resources yet</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Employee</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Tasks</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map(r => (
                    <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{r.role}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{r.activeTasks}</td>
                      <td className="px-6 py-4">
                        <Badge variant={r.status === 'Available' ? 'success' : 'warning'}>{r.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${getUtilColor(r.utilization)}`} style={{ width: `${r.utilization}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-9">{r.utilization}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {resources.map(r => (
              <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{r.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{r.role}</p>
                  </div>
                  <Badge variant={r.status === 'Available' ? 'success' : 'warning'} size="sm">{r.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-slate-500 dark:text-slate-400">Active Tasks</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{r.activeTasks}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getUtilColor(r.utilization)}`} style={{ width: `${r.utilization}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-9 text-right">{r.utilization}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Resources;