import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/Badge';
import { api } from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (e) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (id, role) => {
    if (!confirm(`Change role to ${role}?`)) return;
    try {
      await api.updateUserRole(id, role);
      fetchUsers();
    } catch (e) {
      alert(e.message);
    }
  };

  const removeUser = async (id, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await api.deleteUser(id);
      fetchUsers();
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = filter === 'all' ? users
    : filter === 'active' ? users.filter(u => u.isActive)
    : users.filter(u => !u.isActive);

  const roleVariant = (r) => {
    if (r === 'SUPER_ADMIN') return 'danger';
    if (r === 'ADMIN') return 'info';
    if (r === 'MANAGER') return 'purple';
    if (r === 'VIEWER') return 'default';
    return 'success';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">User Management</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage users, roles and access</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-slate-900 dark:text-slate-100' },
          { label: 'Active', value: users.filter(u => u.isActive).length, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Pending', value: users.filter(u => !u.isActive).length, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Admins', value: users.filter(u => ['SUPER_ADMIN', 'ADMIN'].includes(u.role)).length, color: 'text-blue-600 dark:text-blue-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5">
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl md:text-2xl font-bold mt-1.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: `All (${users.length})` },
          { key: 'active', label: `Active (${users.filter(u => u.isActive).length})` },
          { key: 'pending', label: `Pending (${users.filter(u => !u.isActive).length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
              filter === t.key
                ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading users...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">User</th>
                  <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-left px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Joined</th>
                  <th className="text-right px-6 py-3.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{u.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        disabled={u.role === 'SUPER_ADMIN'}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 cursor-pointer disabled:opacity-50 focus:outline-none"
                      >
                        <option value="INTERN">INTERN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="VIEWER">VIEWER</option>
                        {u.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">SUPER_ADMIN</option>}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.isActive ? 'success' : 'warning'}>
                        {u.isActive ? 'Active' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => removeUser(u.id, u.name)}
                          className="px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs font-semibold rounded-lg transition"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">No users match this filter</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;