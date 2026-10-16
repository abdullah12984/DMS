import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/Badge';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const Leads = ({ role = 'viewer' }) => {
  const canCreate = role === 'superadmin';
  const canFollowUp = role === 'superadmin';
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeads().then(setLeads).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statusColors = {
    'New Lead': 'info', 'Contacted': 'warning', 'Discussion': 'purple',
    'Requirement Gathering': 'purple', 'Proposal Sent': 'purple',
    'Negotiation': 'warning', 'Won': 'success', 'Lost': 'danger',
  };

  const filters = ['All', 'New Lead', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won'];
  const filtered = filter === 'All' ? leads : leads.filter(l => l.status === filter);

  const stats = {
    total: leads.length,
    active: leads.filter(l => !['Won', 'Lost'].includes(l.status)).length,
    won: leads.filter(l => l.status === 'Won').length,
    followUps: leads.filter(l => l.nextFollowUp && new Date(l.nextFollowUp) >= new Date()).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Lead Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track potential clients and follow-ups</p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('/superadmin/leads/new')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <span className="text-base">+</span> Add Lead
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Leads', value: stats.total, color: 'text-slate-900 dark:text-slate-100' },
          { label: 'Active', value: stats.active, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Won', value: stats.won, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Follow-ups Due', value: stats.followUps, color: 'text-amber-600 dark:text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5">
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl md:text-2xl font-bold mt-1.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              filter === f
                ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-20 text-center">
          <p className="text-5xl mb-4">📞</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {leads.length === 0 ? 'No leads yet' : 'No leads match this filter'}
          </p>
          {canCreate && leads.length === 0 && (
            <button
              onClick={() => navigate('/superadmin/leads/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition"
            >
              + Add your first lead
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Company</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Contact</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Assigned</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Next Follow-up</th>
                    {canFollowUp && <th className="text-right px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(l => (
                    <tr
                      key={l.id}
                      onClick={() => navigate(`/superadmin/leads/${l.id}`)}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{l.companyName}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{l.contactName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">{l.email}</p>
                      </td>
                      <td className="px-6 py-4"><Badge variant={statusColors[l.status] || 'default'}>{l.status}</Badge></td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{l.assignedTo?.name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {l.nextFollowUp ? new Date(l.nextFollowUp).toLocaleDateString() : '—'}
                      </td>
                      {canFollowUp && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/superadmin/leads/${l.id}/follow-up`); }}
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg transition border border-blue-200 dark:border-blue-500/20"
                          >
                            Follow-up →
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(l => (
              <div
                key={l.id}
                onClick={() => navigate(`/superadmin/leads/${l.id}`)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 cursor-pointer hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{l.companyName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{l.contactName}</p>
                  </div>
                  <Badge variant={statusColors[l.status] || 'default'} size="sm">{l.status}</Badge>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  📅 Next: {l.nextFollowUp ? new Date(l.nextFollowUp).toLocaleDateString() : '—'}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Leads;