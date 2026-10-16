import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../services/apiClient';

const UserTaskChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getUserTaskStats()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Top performer
  const topUser = data[0];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Task Completion by User
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Who completed the most tasks
          </p>
        </div>
        {topUser && (
          <div className="text-right shrink-0">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              🏆 Top Performer
            </p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {topUser.fullName}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {topUser.completed} task{topUser.completed !== 1 ? 's' : ''} completed
            </p>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No task data yet — assign tasks to see this chart
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
            barCategoryGap={16}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={{ stroke: '#334155' }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#cbd5e1' }}
              axisLine={{ stroke: '#334155' }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                color: 'white',
                fontSize: 12,
              }}
              formatter={(value, name) => [value, name]}
              labelFormatter={(label, payload) => {
                const user = payload?.[0]?.payload;
                return user ? `${user.fullName} (${user.role})` : label;
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
            <Bar
              dataKey="completed"
              stackId="a"
              fill="#10b981"
              name="Completed"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="inProgress"
              stackId="a"
              fill="#3b82f6"
              name="In Progress"
            />
            <Bar
              dataKey="pending"
              stackId="a"
              fill="#f59e0b"
              name="Pending"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Leaderboard */}
      {data.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
            Leaderboard
          </p>
          <div className="space-y-2">
            {data.slice(0, 5).map((u, idx) => {
              const pct =
                u.total > 0 ? Math.round((u.completed / u.total) * 100) : 0;
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx === 0
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                        : idx === 1
                        ? 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100'
                        : idx === 2
                        ? 'bg-gradient-to-br from-amber-700 to-amber-800 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {u.fullName}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {u.completed}/{u.total} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTaskChart;