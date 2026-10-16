import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../services/apiClient';

const ProgressCharts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('weekly'); // 'weekly' | 'monthly'

  useEffect(() => {
    api.getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Progress Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Weekly and monthly insights
          </p>
        </div>

        {/* Toggle */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {[
            { key: 'weekly', label: '📅 Weekly' },
            { key: 'monthly', label: '📊 Monthly' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                view === t.key
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Summary Cards */}
      {view === 'monthly' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tasks Created
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {data.monthly.tasksCreated}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {data.monthly.label}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tasks Completed
            </p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {data.monthly.tasksCompleted}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {data.monthly.tasksCreated > 0
                ? Math.round((data.monthly.tasksCompleted / data.monthly.tasksCreated) * 100)
                : 0}
              % completion rate
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Projects Created
            </p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
              {data.monthly.projectsCreated}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              This month
            </p>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Task Status Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Task Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Distribution across all tasks
            </p>
          </div>
          {data.taskStatus.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">No task data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.taskStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  labelLine={false}
                >
                  {data.taskStatus.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    color: 'white',
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Project Types Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Project Types
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Active, Internal, Training, Product
            </p>
          </div>
          {data.projectTypes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-3xl mb-2">📁</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">No project data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.projectTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  labelLine={false}
                >
                  {data.projectTypes.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    color: 'white',
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Weekly Bar Chart */}
      {view === 'weekly' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Weekly Task Activity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Last 8 weeks — created vs completed
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="created" fill="#3b82f6" name="Created" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="completed"
                fill="#10b981"
                name="Completed"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weekly Line Chart */}
      {view === 'weekly' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Completion Trend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              How many tasks get completed each week
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 5, fill: '#10b981' }}
                name="Completed"
              />
              <Line
                type="monotone"
                dataKey="created"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5, fill: '#3b82f6' }}
                name="Created"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ProgressCharts;