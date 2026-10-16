import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import ProgressCharts from '../../components/ProgressCharts';
import UserTaskChart from '../../components/UserTaskChart';
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, projectsData, logsData] = await Promise.all([
          api.getDashboardStats(),
          api.getProjects(),
          api.getAuditLogs(),
        ]);
        setStats(statsData);
        setProjects(projectsData);
        setAuditLogs(logsData.slice(0, 5));
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

  // Calculate project stats
  const activeProjects = projects.filter(p => p.status === 'In Progress');
  const completedProjects = projects.filter(p => p.status === 'Completed');
  const onHoldProjects = projects.filter(p => p.status === 'On Hold');

  const statsCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'blue', trend: `${stats?.availableUsers || 0} active` },
    { title: 'Pending Registrations', value: stats?.pendingUsers || 0, icon: '⏳', color: 'amber', trend: stats?.pendingUsers > 0 ? 'Needs review' : 'All clear' },
    { title: 'Total Projects', value: stats?.totalProjects || 0, icon: '📁', color: 'purple' },
    { title: 'Active Projects', value: stats?.activeProjects || 0, icon: '🚀', color: 'green', trend: 'In progress' },
    { title: 'Completed', value: stats?.completedProjects || 0, icon: '✓', color: 'slate', trend: 'All time' },
    { title: 'Available Resources', value: stats?.availableUsers || 0, icon: '🎯', color: 'blue', trend: `${stats?.busyUsers || 0} busy` },
    { title: 'Total Leads', value: stats?.totalLeads || 0, icon: '📞', color: 'purple' },
    { title: 'Total Tasks', value: stats?.totalTasks || 0, icon: '✓', color: 'amber' },
  ];

  const activityTypes = {
    info: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', icon: 'ℹ️' },
    success: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', icon: '✓' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', icon: '🔄' },
    warning: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', icon: '⚠️' },
    danger: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', icon: '🗑️' },
  };

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const typeVariant = { Active: 'success', Internal: 'info', Training: 'warning', Product: 'purple' };
  const statusVariant = { 'In Progress': 'info', 'On Hold': 'warning', Completed: 'success', 'Not Started': 'default' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome back, Super Admin 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Here's what's happening in your department today
          </p>
        </div>
        <button
          onClick={() => navigate('/superadmin/projects/new')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-95"
        >
          <span className="text-base">+</span> New Project
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        {statsCards.map((s, i) => (
          <Card key={i} {...s} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Recent Activity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest actions across the system</p>
            </div>
            <button
              onClick={() => navigate('/superadmin/audit')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all →
            </button>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log, i) => {
                const style = activityTypes[log.type] || activityTypes.info;
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className={`w-9 h-9 rounded-xl ${style.bg} ${style.text} flex items-center justify-center text-sm shrink-0`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        <span className="font-semibold">{log.userName}</span>
                        <span className="text-slate-500 dark:text-slate-400"> {log.action}</span>
                        {log.target && (
                          <span className="text-blue-600 dark:text-blue-400"> {log.target}</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">
                        {formatTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Department Overview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">Department Overview</h3>

          <div className="space-y-5">
            {/* Project Status */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Project Status</p>
              <div className="space-y-3">
                {[
                  { label: 'Active', count: activeProjects.length, total: projects.length, color: 'bg-emerald-500' },
                  { label: 'Completed', count: completedProjects.length, total: projects.length, color: 'bg-slate-500' },
                  { label: 'On Hold', count: onHoldProjects.length, total: projects.length, color: 'bg-amber-500' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{s.label}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{s.count}/{s.total}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${s.color} rounded-full transition-all duration-500`}
                        style={{ width: `${s.total > 0 ? (s.count / s.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Availability */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Resources</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Available</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats?.availableUsers || 0}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Busy</p>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats?.busyUsers || 0}</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Quick Actions</p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/superadmin/registrations')}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>📝</span> Review Registrations
                  </span>
                  {stats?.pendingUsers > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                      {stats.pendingUsers}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/superadmin/tasks/new')}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <span>✓</span> Assign New Task
                </button>
                <button
                  onClick={() => navigate('/superadmin/emails')}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <span>✉️</span> Open Inbox
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Active Projects</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Projects currently in progress</p>
          </div>
          <button
            onClick={() => navigate('/superadmin/projects')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all →
          </button>
        </div>

        {activeProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📁</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">No active projects yet</p>
            <button
              onClick={() => navigate('/superadmin/projects/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition"
            >
              + Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeProjects.slice(0, 6).map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/superadmin/projects/${p.id}`)}
                className="group bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-4 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Badge variant={typeVariant[p.type] || 'info'} size="sm">{p.type}</Badge>
                  <Badge variant={statusVariant[p.status] || 'default'} size="sm">{p.status}</Badge>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {p.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-3 truncate">{p.client || 'Internal'}</p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Progress</span>
                    <span className="text-slate-900 dark:text-slate-100">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {(p.manager?.name || 'U').charAt(0)}
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">
                    {p.manager?.name || 'Unassigned'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Progress Charts */}
<ProgressCharts />
{/* User Task Chart */}
<UserTaskChart />
    </div>
  );
};

export default SuperAdminDashboard;