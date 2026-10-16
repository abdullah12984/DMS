import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';

const AuditLogs = ({ role = 'superadmin' }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs().then(setLogs).catch(console.error).finally(() => setLoading(false));
  }, []);

  const typeStyles = {
    info: { icon: 'ℹ️', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
    success: { icon: '✓', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
    purple: { icon: '🔄', bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
    warning: { icon: '⚠️', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
    danger: { icon: '🗑️', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
  };

  const filtered = logs.filter(l => {
    const matchSearch = l.userName?.toLowerCase().includes(search.toLowerCase()) ||
                       l.action?.toLowerCase().includes(search.toLowerCase()) ||
                       l.target?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || l.type === filter;
    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const formatTime = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Audit Logs</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track all administrative actions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500/50 focus:outline-none"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="purple">Update</option>
          <option value="warning">Warning</option>
          <option value="danger">Critical</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-20 text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">No logs yet</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {filtered.map((l) => {
            const s = typeStyles[l.type] || typeStyles.info;
            return (
              <div key={l.id} className="flex items-start gap-4 px-5 py-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.text} flex items-center justify-center text-sm shrink-0`}>
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-slate-100">
                    <span className="font-semibold">{l.userName}</span>
                    <span className="text-slate-500 dark:text-slate-400"> {l.action}</span>
                    {l.target && <span className="text-blue-600 dark:text-blue-400"> {l.target}</span>}
                  </p>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-500 whitespace-nowrap shrink-0">
                  {formatTime(l.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuditLogs;