import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/Badge';
import { api } from '../../services/api';

const RegistrationApproval = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const data = await api.getPendingUsers();
      setPending(Array.isArray(data) ? data : []);
    } catch (e) {
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const approve = async (id) => {
    if (!confirm('Approve this user?')) return;
    try {
      await api.approveUser(id);
      fetchPending();
    } catch (e) {
      alert(e.message);
    }
  };

  const reject = async (id) => {
    if (!confirm('Reject and delete this registration?')) return;
    try {
      await api.rejectUser(id);
      fetchPending();
    } catch (e) {
      alert(e.message);
    }
  };

  const roleVariant = (r) => {
    if (r === 'ADMIN') return 'info';
    if (r === 'MANAGER') return 'purple';
    if (r === 'VIEWER') return 'default';
    return 'success';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Registration Approvals</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review pending user registrations</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading...</div>
      ) : pending.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center">
          <p className="text-5xl mb-4">✅</p>
          <p className="text-slate-500 dark:text-slate-400">No pending registrations</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Requested</th>
                  <th className="text-right px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(u => (
                  <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {u.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{u.email}</td>
                    <td className="px-6 py-4"><Badge variant={roleVariant(u.role)}>{u.role}</Badge></td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => approve(u.id)} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-200 dark:border-emerald-500/20 transition">
                          ✓ Approve
                        </button>
                        <button onClick={() => reject(u.id)} className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-500/20 transition">
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationApproval;