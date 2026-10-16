import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { api } from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const InternDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyTasks()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  const pending = tasks.filter(t => t.status === 'Not Started');
  const inProgress = tasks.filter(t => t.status === 'In Progress');
  const completed = tasks.filter(t => t.status === 'Completed');
  const overdue = tasks.filter(t => {
    if (!t.deadline || t.status === 'Completed') return false;
    return new Date(t.deadline) < new Date();
  });

  const statsCards = [
    { title: 'Pending Tasks', value: pending.length, icon: '⏳', color: 'amber', trend: 'Not started' },
    { title: 'In Progress', value: inProgress.length, icon: '🔄', color: 'blue', trend: 'Working on' },
    { title: 'Completed', value: completed.length, icon: '✓', color: 'green', trend: 'All time' },
    { title: 'Overdue', value: overdue.length, icon: '⏰', color: 'red', trend: overdue.length > 0 ? 'Needs attention' : 'All on track' },
  ];

  const priorityVariant = (p) => p === 'High' ? 'danger' : p === 'Medium' ? 'warning' : 'info';
  const statusVariant = (s) => {
    if (s === 'Completed') return 'success';
    if (s === 'In Progress') return 'info';
    if (s === 'On Hold') return 'warning';
    return 'default';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

  // Sort: overdue first, then by deadline
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Hey, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {tasks.length > 0
              ? `You have ${pending.length + inProgress.length} task${pending.length + inProgress.length !== 1 ? 's' : ''} to work on`
              : 'No tasks assigned yet'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        {statsCards.map((s, i) => <Card key={i} {...s} />)}
      </div>

      {/* Overdue Alert */}
      {overdue.length > 0 && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              {overdue.length} overdue task{overdue.length !== 1 ? 's' : ''}!
            </p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
              Please complete them as soon as possible.
            </p>
          </div>
        </div>
      )}

      {/* Progress Summary */}
      {tasks.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">Your Progress</h3>
          <div className="space-y-4">
            {[
              { label: 'Completed', count: completed.length, total: tasks.length, color: 'bg-emerald-500' },
              { label: 'In Progress', count: inProgress.length, total: tasks.length, color: 'bg-blue-500' },
              { label: 'Pending', count: pending.length, total: tasks.length, color: 'bg-amber-500' },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{s.label}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{s.count}/{s.total}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all duration-500`}
                    style={{ width: `${s.total > 0 ? (s.count / s.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Tasks */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">My Tasks</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sorted by deadline</p>
          </div>
          <button
            onClick={() => navigate('/intern/tasks')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all →
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🎉</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">No tasks assigned yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Enjoy the peace!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.slice(0, 8).map((t) => {
              const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== 'Completed';
              return (
                <div
                  key={t.id}
                  onClick={() => navigate(`/intern/tasks/${t.id}`)}
                  className="group flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 rounded-xl cursor-pointer transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {t.title}
                      </p>
                      <Badge variant={priorityVariant(t.priority)} size="sm">{t.priority}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.project?.name || 'No project'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-[200px]">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${t.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        {t.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusVariant(t.status)} size="sm">{t.status}</Badge>
                    {t.deadline && (
                      <span className={`text-[11px] font-medium ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        📅 {formatDate(t.deadline)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InternDashboard;