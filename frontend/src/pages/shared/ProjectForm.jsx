import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';

const ProjectForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTeam, setSearchTeam] = useState('');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const teamDropdownRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    client: '',
    type: 'Internal',
    status: 'Not Started',
    priority: 'Medium',
    progress: 0,
    startDate: '',
    endDate: '',
    managerId: '',
    teamIds: [],
  });

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => {});
    if (mode === 'edit' && id) {
      api.getProject(id).then((p) => {
        setForm({
          name: p.name || '',
          description: p.description || '',
          client: p.client || '',
          type: p.type || 'Internal',
          status: p.status || 'Not Started',
          priority: p.priority || 'Medium',
          progress: p.progress || 0,
          startDate: p.startDate?.split('T')[0] || '',
          endDate: p.endDate?.split('T')[0] || '',
          managerId: p.managerId || '',
          teamIds: p.team?.map(t => t.id) || [],
        });
      }).catch(console.error);
    }
  }, [id, mode]);

  // Close team dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(e.target)) {
        setShowTeamDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTeamMember = (userId) => {
    setForm((prev) => ({
      ...prev,
      teamIds: prev.teamIds.includes(userId)
        ? prev.teamIds.filter((x) => x !== userId)
        : [...prev.teamIds, userId],
    }));
    setSearchTeam('');
    setShowTeamDropdown(false);
  };

  const removeTeamMember = (userId) => {
    setForm((prev) => ({
      ...prev,
      teamIds: prev.teamIds.filter((x) => x !== userId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        managerId: form.managerId || null,
      };
      if (mode === 'create') {
        const project = await api.createProject(payload);
        navigate(`/superadmin/projects/${project.id}`);
      } else {
        await api.updateProject(id, payload);
        navigate(`/superadmin/projects/${id}`);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all';
  const labelClass =
    'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2';

  const eligibleUsers = users.filter((u) => u.isActive && u.role !== 'VIEWER');
  const selectedTeam = form.teamIds
    .map((uid) => users.find((u) => u.id === uid))
    .filter(Boolean);

  const filteredTeamUsers = eligibleUsers
    .filter((u) => !form.teamIds.includes(u.id))
    .filter((u) => u.id !== form.managerId)
    .filter(
      (u) =>
        u.name.toLowerCase().includes(searchTeam.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTeam.toLowerCase())
    );

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
      >
        ← Back
      </button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          {mode === 'create' ? 'New Project' : 'Edit Project'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {mode === 'create' ? 'Create a new departmental project' : 'Update project details'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm"
      >
        <div>
          <label className={labelClass}>Project Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Client Website Development"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            rows="3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description of the project..."
            className={inputClass + ' resize-none'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Client</label>
            <input
              type="text"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              placeholder="e.g. ABC Corp"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className={inputClass + ' cursor-pointer'}
            >
              <option value="Active">Active</option>
              <option value="Internal">Internal</option>
              <option value="Training">Training</option>
              <option value="Product">Product</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputClass + ' cursor-pointer'}
            >
              <option>Not Started</option>
              <option>In Progress</option>
              <option>On Hold</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className={inputClass + ' cursor-pointer'}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Start Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Expected Completion</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Manager</label>
            <select
              value={form.managerId}
              onChange={(e) => setForm({ ...form, managerId: e.target.value })}
              className={inputClass + ' cursor-pointer'}
            >
              <option value="">Select manager...</option>
              {users
                .filter((u) => ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(u.role))
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Progress ({form.progress}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        {/* ===== TEAM MEMBERS ===== */}
        <div className="md:col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className={labelClass}>
            Assigned Team {form.teamIds.length > 0 && `(${form.teamIds.length})`}
          </label>

          {/* Selected team chips */}
          {selectedTeam.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTeam.map((u) => (
                <div
                  key={u.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-purple-500/20"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{u.name}</span>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(u.id)}
                    className="hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center transition"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search + Add Team */}
          <div className="relative" ref={teamDropdownRef}>
            <input
              type="text"
              value={searchTeam}
              onChange={(e) => {
                setSearchTeam(e.target.value);
                setShowTeamDropdown(true);
              }}
              onFocus={() => setShowTeamDropdown(true)}
              placeholder="+ Add team member (search by name or email)"
              className={inputClass + ' pl-11'}
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-500 font-bold text-lg">
              +
            </span>

            {showTeamDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-20">
                {filteredTeamUsers.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {searchTeam ? 'No matching users' : 'All users already added'}
                    </p>
                  </div>
                ) : (
                  filteredTeamUsers.slice(0, 10).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleTeamMember(u.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {u.email} · {u.role}
                        </p>
                      </div>
                      <span className="text-purple-500 text-lg font-bold shrink-0">+</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            💡 Team members can be assigned tasks on this project
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : mode === 'create' ? '✓ Create Project' : '✓ Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;