import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { api } from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, projectsData, tasksData, resourceData] = await Promise.all([
          api.getDashboardStats(),
          api.getProjects(),
          api.getTasks(),
          api.getResourceStats(),
        ]);
        setStats(statsData);
        setProjects(projectsData);
        setTasks(tasksData);
        setResources(resourceData.resources || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeTasks = tasks.filter(t => t.status === 'In Progress');
  const pendingTasks = tasks.filter(t => t.status === 'Not Started');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const activeProjects = projects.filter(p => p.status === 'In Progress');

  const statsCards = [
    { title: 'Total Projects', value: stats?.totalProjects || 0, icon: '📁', color: 'blue', trend: `${activeProjects.length} active` },
    { title: 'Active Tasks', value: activeTasks.length, icon: '✓', color: 'amber', trend: `${pendingTasks.length} pending` },
    { title: 'Team Available', value: stats?.availableUsers || 0, icon: '👥', color: 'green', trend: `${stats?.busyUsers || 0} busy` },
    { title: 'Completed Tasks', value: completedTasks.length, icon: '🏆', color: 'purple', trend: 'All time' },
  ];

  const priorityVariant = (p) => p === 'High' ? 'danger' : p === 'Medium' ? 'warning' : 'info';
  const statusVariant = (s) => {
    if (s === 'Completed') return 'success';
    if (s === 'In Progress') return 'info';
    if (s === 'On Hold') return 'warning';
    return 'default';
  };

  const getUtilColor = (u) => u > 80 ? 'bg-red-500' : u > 50 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Project, task & resource overview
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/projects')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition"
          >
            📁 View Projects
          </button>
          <button
            onClick={() => navigate('/admin/tasks/new')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <span className="text-base">+</span> New Task
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        {statsCards.map((s, i) => (
          <Card key={i} {...s} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* My Active Tasks */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Active Tasks</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Currently in progress</p>
            </div>
            <button
              onClick={() => navigate('/admin/tasks')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all →
            </button>
          </div>

          {activeTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">✓</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">No active tasks</p>
              <button
                onClick={() => navigate('/admin/tasks/new')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition"
              >
                + Create Task
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTasks.slice(0, 5).map((t, i) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/admin/tasks/${t.id}`)}
                  className="group flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 rounded-xl cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {(t.assignee?.name || 'U').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {t.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t.project?.name || 'No project'} · {t.assignee?.name || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={priorityVariant(t.priority)} size="sm">{t.priority}</Badge>
                    <Badge variant={statusVariant(t.status)} size="sm">{t.status}</Badge>
                    {t.deadline && (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                        📅 {new Date(t.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Overview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Team Load</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Top utilization</p>
            </div>
            <button
              onClick={() => navigate('/admin/resources')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              All →
            </button>
          </div>

          {resources.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">No team data</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resources
                .sort((a, b) => b.utilization - a.utilization)
                .slice(0, 5)
                .map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{r.name}</p>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0">
                          {r.utilization}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getUtilColor(r.utilization)} transition-all duration-500`}
                          style={{ width: `${r.utilization}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={() => navigate('/admin/resources')}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              🎯 Manage Resources
            </button>
            <button
              onClick={() => navigate('/admin/projects/new')}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              📁 Create Project
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row - Projects & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Projects */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Active Projects</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeProjects.length} in progress
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/projects')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all →
            </button>
          </div>

          {activeProjects.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">📁</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">No active projects</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeProjects.slice(0, 4).map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/admin/projects/${p.id}`)}
                  className="cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {p.name}
                    </p>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">
                      {p.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Pending Assignment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {pendingTasks.length} not started
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/tasks')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all →
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">✨</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">All tasks assigned 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.slice(0, 4).map((t, i) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/admin/tasks/${t.id}`)}
                  className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{t.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.project?.name || 'No project'}</p>
                  </div>
                  <Badge variant={priorityVariant(t.priority)} size="sm">{t.priority}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;