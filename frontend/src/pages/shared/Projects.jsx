import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/Badge';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const Projects = ({ role = 'viewer' }) => {
  const canCreate = role === 'superadmin' || role === 'admin';
  const canEdit = role === 'superadmin' || role === 'admin' || role === 'manager';
  const canDelete = role === 'superadmin';
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete project "${name}"?`)) return;
    try {
      await api.deleteProject(id);
      fetchProjects();
    } catch (e) {
      alert(e.message);
    }
  };

  const typeColors = { Active: 'success', Internal: 'info', Training: 'warning', Product: 'purple' };
  const statusColors = {
    'In Progress': 'info',
    'On Hold': 'warning',
    Completed: 'success',
    'Not Started': 'default',
  };

  const filters = ['All', 'Active', 'Internal', 'Training', 'Product'];
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.type === filter);

  const typeStats = {
    total: projects.length,
    active: projects.filter((p) => p.type === 'Active').length,
    inProgress: projects.filter((p) => p.status === 'In Progress').length,
    onHold: projects.filter((p) => p.status === 'On Hold').length,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Projects
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {role === 'viewer'
              ? 'View all departmental projects (read-only)'
              : 'Manage departmental projects'}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate(`/${role}/projects/new`)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <span className="text-base">+</span> New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total', value: typeStats.total, color: 'text-slate-900 dark:text-slate-100' },
          { label: 'Active', value: typeStats.active, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'In Progress', value: typeStats.inProgress, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'On Hold', value: typeStats.onHold, color: 'text-amber-600 dark:text-amber-400' },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5"
          >
            <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {s.label}
            </p>
            <p className={`text-xl md:text-2xl font-bold mt-1.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              filter === f
                ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-20 text-center">
          <p className="text-5xl mb-4">📁</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {projects.length === 0 ? 'No projects yet' : 'No projects match this filter'}
          </p>
          {canCreate && projects.length === 0 && (
            <button
              onClick={() => navigate(`/${role}/projects/new`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition"
            >
              + Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <Badge variant={typeColors[p.type] || 'info'}>{p.type}</Badge>
                <Badge variant={statusColors[p.status] || 'default'}>{p.status}</Badge>
              </div>

              <h3
                onClick={() => navigate(`/${role}/projects/${p.id}`)}
                className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 cursor-pointer group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1"
              >
                {p.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">{p.client || 'Internal'}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Progress</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{p.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${p.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Team + Manager Row */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Team avatars stack */}
                  {p.team?.length > 0 && (
                    <div className="flex -space-x-2">
                      {p.team.slice(0, 3).map((member) => (
                        <div
                          key={member.id}
                          className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white dark:ring-slate-900"
                          title={member.name}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {p.team.length > 3 && (
                        <div className="w-7 h-7 rounded-lg bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 text-[10px] font-bold ring-2 ring-white dark:ring-slate-900">
                          +{p.team.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Manager */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {(p.manager?.name || 'U').charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                      {p.manager?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>

                <span className="text-xs text-slate-500 dark:text-slate-500 whitespace-nowrap">
                  📅 {p.endDate ? new Date(p.endDate).toLocaleDateString() : '—'}
                </span>
              </div>

              {(canEdit || canDelete) && (
                <div className="flex gap-2 mt-4">
                  {canEdit && (
                    <button
                      onClick={() => navigate(`/${role}/projects/${p.id}/edit`)}
                      className="flex-1 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition"
                    >
                      ✏️ Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="flex-1 py-2 text-xs font-semibold bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition border border-red-200 dark:border-red-500/20"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;