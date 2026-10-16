import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/apiClient';

const TaskForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'Not Started',
    priority: 'Medium',
    progress: 0,
    startDate: '',
    deadline: '',
    assigneeId: '',
    projectId: '',
  });

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => {});
    api.getProjects().then(setProjects).catch(() => {});
    if (mode === 'edit' && id) {
      api.getTask(id).then((t) => {
        setForm({
          title: t.title || '',
          description: t.description || '',
          status: t.status || 'Not Started',
          priority: t.priority || 'Medium',
          progress: t.progress || 0,
          startDate: t.startDate?.split('T')[0] || '',
          deadline: t.deadline?.split('T')[0] || '',
          assigneeId: t.assigneeId || '',
          projectId: t.projectId || '',
        });
      }).catch(console.error);
    }
  }, [id, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        startDate: form.startDate || null,
        deadline: form.deadline || null,
        assigneeId: form.assigneeId || null,
        projectId: form.projectId || null,
      };
      if (mode === 'create') {
        await api.createTask(payload);
        navigate('/superadmin/tasks');
      } else {
        await api.updateTask(id, payload);
        navigate('/superadmin/tasks');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2";

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
        ← Back
      </button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          {mode === 'create' ? 'New Task' : 'Edit Task'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {mode === 'create' ? 'Create and assign a new task' : 'Update task details'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div>
          <label className={labelClass}>Task Title *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Design login page"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            rows="3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What needs to be done..."
            className={inputClass + ' resize-none'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Project</label>
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className={inputClass + ' cursor-pointer'}
            >
              <option value="">No project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Assignee</label>
            <select
              value={form.assigneeId}
              onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
              className={inputClass + ' cursor-pointer'}
            >
              <option value="">Unassigned</option>
              {users.filter(u => u.isActive && ['MANAGER', 'ADMIN', 'INTERN'].includes(u.role)).map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass + ' cursor-pointer'}>
            <option>Not Started</option>
  <option>On Hold</option>
  <option>In Progress</option>
  <option>In QC</option>
  <option>Completed</option>
  <option>Cancelled</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputClass + ' cursor-pointer'}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Start Date</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Deadline</label>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : mode === 'create' ? '✓ Create Task' : '✓ Save Changes'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;