import React from 'react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';

const ManagerDashboard = () => {
  const stats = [
    { title: 'Managed Projects', value: '3', icon: '📁', color: 'blue' },
    { title: 'Team Members', value: '8', icon: '👥', color: 'purple' },
    { title: 'Active Tasks', value: '14', icon: '✓', color: 'green' },
    { title: 'Due This Week', value: '5', icon: '⏰', color: 'amber' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Manager Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your projects and team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => <Card key={i} {...s} />)}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-semibold text-slate-100 mb-4">Team Tasks</h3>
        <div className="space-y-3">
          {[
            { task: 'Frontend components', assignee: 'Sara Ali', status: 'In Progress', priority: 'High' },
            { task: 'API integration', assignee: 'Usman Tariq', status: 'In Progress', priority: 'High' },
            { task: 'Documentation', assignee: 'Bilal Raza', status: 'Not Started', priority: 'Low' },
            { task: 'Unit tests', assignee: 'Hassan Malik', status: 'Completed', priority: 'Medium' },
          ].map((t, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                  {t.assignee.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-100">{t.task}</p>
                  <p className="text-xs text-slate-500">{t.assignee}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={t.priority === 'High' ? 'danger' : t.priority === 'Medium' ? 'warning' : 'info'}>
                  {t.priority}
                </Badge>
                <Badge variant={t.status === 'Completed' ? 'success' : t.status === 'In Progress' ? 'info' : 'default'}>
                  {t.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;