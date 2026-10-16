import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/Badge';
import { api } from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';

const MyTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.getMyTasks().then(setTasks).catch(console.error).finally(() => setLoading(false));
  }, []);

  const priorityVariant = (p) => p === 'High' ? 'danger' : p === 'Medium' ? 'warning' : 'info';
  const statusVariant = (s) => {
    if (s === 'Completed') return 'success';
    if (s === 'In Progress') return 'info';
    if (s === 'On Hold') return 'warning';
    return 'default';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const filtered = filter === 'all' ? tasks
    : filter === 'pending' ? tasks.filter(t => t.status === 'Not Started')
    : filter === 'progress' ? tasks.filter(t => t.status === 'In Progress')
    : tasks.filter(t => t.status === 'Completed');

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'Not Started').length,
    progress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">My Tasks</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">All tasks assigned to you</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'pending', label: 'Pending', count: counts.pending },
          { key: 'progress', label: 'In Progress', count: counts.progress },
          { key: 'completed', label: 'Completed', count: counts.completed },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 ${
              filter === t.key
                ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              filter === t.key ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tasks */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-20 text-center">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">No tasks in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(t => {
            const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== 'Completed';
            return (
              <div
                key={t.id}
                onClick={() => navigate(`/intern/tasks/${t.id}`)}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
                  <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                  {t.project?.name || 'No project'}
                </p>

                {t.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {t.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Progress</span>
                    <span className="text-slate-900 dark:text-slate-100">{t.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${t.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className={`text-xs font-medium ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {isOverdue && '⚠️ '}📅 {formatDate(t.deadline)}
                  </span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                    Update →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTasks;