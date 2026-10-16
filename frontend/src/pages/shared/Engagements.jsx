import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/Badge';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const Engagements = ({ role = 'viewer' }) => {
  const navigate = useNavigate();
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getEngagements()
      .then(setEngagements)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const typeColors = { Active: 'success', Internal: 'info', Training: 'warning', Product: 'purple' };
  const statusColors = {
    'In Progress': 'info',
    'On Hold': 'warning',
    Completed: 'success',
    'Not Started': 'default',
    Cancelled: 'danger',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Engagement Sheets
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Engagement documents — auto-generated from projects
        </p>
      </div>

      {engagements.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-20 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">No engagement sheets yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Create a project — its engagement sheet will be auto-generated
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {engagements.map((e) => (
            <div
              key={e.id}
              onClick={() => navigate(`/${role}/engagements/${e.id}`)}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {e.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Client:{' '}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {e.client || '—'}
                    </span>
                  </p>
                </div>
                <Badge variant={typeColors[e.type] || 'info'}>{e.type}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Manager
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {(e.manager?.name || 'U').charAt(0)}
                    </div>
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                      {e.manager?.name || 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Team
                  </p>
                  <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                    {e.team?.length || 0} members
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Start
                  </p>
                  <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                    {e.startDate ? new Date(e.startDate).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    End
                  </p>
                  <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                    {e.endDate ? new Date(e.endDate).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Progress</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{e.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${e.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <Badge variant={statusColors[e.status] || 'default'} size="sm">
                  {e.status}
                </Badge>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                  View Sheet →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Engagements;