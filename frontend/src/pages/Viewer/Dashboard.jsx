import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { api } from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';

const ViewerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [resourceStats, setResourceStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, progressData, resourceData] = await Promise.all([
          api.getDashboardStats(),
          api.getProgressStats(),
          api.getResourceStats(),
        ]);
        setStats(statsData);
        setProgress(progressData);
        setResourceStats(resourceData);
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
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading overview...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    { title: 'Total Projects', value: stats?.totalProjects || 0, icon: '📁', color: 'blue' },
    { title: 'Active', value: stats?.activeProjects || 0, icon: '🚀', color: 'green', trend: 'In progress' },
    { title: 'Completed', value: stats?.completedProjects || 0, icon: '✓', color: 'slate', trend: 'All time' },
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'purple' },
    { title: 'Available', value: stats?.availableUsers || 0, icon: '🎯', color: 'green', trend: 'Resources' },
    { title: 'Busy', value: stats?.busyUsers || 0, icon: '⚡', color: 'amber', trend: 'Resources' },
  ];

  const getUtilColor = (u) => u > 80 ? 'bg-red-500' : u > 50 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Department Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Read-only executive dashboard
          </p>
        </div>
        <button
          onClick={() => navigate('/viewer/reports')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition"
        >
          📊 View Reports
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {statsCards.map((s, i) => <Card key={i} {...s} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Project Status */}
        {progress && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">Project Status</h3>
            <div className="space-y-4">
              {Object.entries(progress.byStatus).map(([status, count]) => {
                const pct = progress.total > 0 ? (count / progress.total) * 100 : 0;
                const colors = {
                  'In Progress': 'bg-blue-500',
                  'Completed': 'bg-emerald-500',
                  'On Hold': 'bg-amber-500',
                  'Not Started': 'bg-slate-500',
                  'Cancelled': 'bg-red-500',
                };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{status}</span>
                      <span className="text-slate-500 dark:text-slate-400">{count} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[status]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Project Types */}
        {progress && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">Project Types</h3>
            <div className="space-y-4">
              {Object.entries(progress.byType).map(([type, count]) => {
                const pct = progress.total > 0 ? (count / progress.total) * 100 : 0;
                const colors = { Active: 'bg-emerald-500', Internal: 'bg-blue-500', Training: 'bg-amber-500', Product: 'bg-purple-500' };
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{type}</span>
                      <span className="text-slate-500 dark:text-slate-400">{count} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[type]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Department Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">Department Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Employees', value: stats?.totalUsers || 0 },
              { label: 'Active Projects', value: stats?.activeProjects || 0 },
              { label: 'Total Tasks', value: stats?.totalTasks || 0 },
              { label: 'Avg Progress', value: `${progress?.avgProgress || 0}%` },
              { label: 'Total Leads', value: stats?.totalLeads || 0 },
              { label: 'Pending Approvals', value: stats?.pendingUsers || 0 },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className="text-xs text-slate-500 dark:text-slate-400">{row.label}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Snapshot */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Resource Snapshot</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Team utilization overview</p>
            </div>
            <button
              onClick={() => navigate('/viewer/resources')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all →
            </button>
          </div>

          {resourceStats && resourceStats.resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resourceStats.resources.slice(0, 6).map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{r.name}</p>
                      <Badge variant={r.status === 'Available' ? 'success' : 'warning'} size="sm">{r.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getUtilColor(r.utilization)}`} style={{ width: `${r.utilization}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 w-8 text-right">{r.utilization}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">👥</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">No resource data</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Projects */}
      {progress && progress.projects.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Project Progress</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Top projects overview</p>
            </div>
            <button
              onClick={() => navigate('/viewer/projects')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {progress.projects.slice(0, 6).map(p => (
              <div key={p.id}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{p.name}</p>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">{p.progress}%</span>
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
        </div>
      )}
    </div>
  );
};

export default ViewerDashboard;