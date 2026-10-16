// import React, { useState, useEffect } from 'react';
// import { Badge } from '../../components/Badge';
// import { useNavigate } from 'react-router-dom';
// import { api } from '../../services/api';

// const Tasks = ({ role = 'viewer' }) => {
//   const canCreate = role === 'superadmin' || role === 'admin' || role === 'manager';
//   const navigate = useNavigate();
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api.getTasks().then(setTasks).catch(console.error).finally(() => setLoading(false));
//   }, []);

//   const columns = [
//     { title: 'Not Started', key: 'Not Started', color: 'slate' },
//     { title: 'In Progress', key: 'In Progress', color: 'blue' },
//     { title: 'On Hold', key: 'On Hold', color: 'amber' },
//     { title: 'Completed', key: 'Completed', color: 'emerald' },
//   ];

//   const priorityColors = { High: 'danger', Medium: 'warning', Low: 'info' };

//   const columnStyles = {
//     slate: 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800',
//     blue: 'bg-blue-50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20',
//     amber: 'bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/20',
//     emerald: 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20',
//   };
//   const headerColors = {
//     slate: 'text-slate-700 dark:text-slate-300',
//     blue: 'text-blue-700 dark:text-blue-400',
//     amber: 'text-amber-700 dark:text-amber-400',
//     emerald: 'text-emerald-700 dark:text-emerald-400',
//   };
//   const dotColors = {
//     slate: 'bg-slate-500',
//     blue: 'bg-blue-500',
//     amber: 'bg-amber-500',
//     emerald: 'bg-emerald-500',
//   };

//   const getTasksForColumn = (key) => tasks.filter(t => t.status === key);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Task Board</h1>
//           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
//             {role === 'viewer' ? 'Overview of all tasks (read-only)' : `${tasks.length} tasks across 4 columns`}
//           </p>
//         </div>
//         {canCreate && (
//           <button
//             onClick={() => navigate(`/${role}/tasks/new`)}
//             className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
//           >
//             <span className="text-base">+</span> New Task
//           </button>
//         )}
//       </div>

//       {tasks.length === 0 ? (
//         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-20 text-center">
//           <p className="text-5xl mb-4">✓</p>
//           <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No tasks yet</p>
//           {canCreate && (
//             <button
//               onClick={() => navigate(`/${role}/tasks/new`)}
//               className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition"
//             >
//               + Create your first task
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {columns.map(col => {
//             const colTasks = getTasksForColumn(col.key);
//             return (
//               <div key={col.key} className={`rounded-2xl border p-4 ${columnStyles[col.color]}`}>
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center gap-2">
//                     <span className={`w-2 h-2 rounded-full ${dotColors[col.color]}`}></span>
//                     <h3 className={`text-sm font-bold ${headerColors[col.color]}`}>{col.title}</h3>
//                   </div>
//                   <span className="text-xs font-bold px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-800">
//                     {colTasks.length}
//                   </span>
//                 </div>
//                 <div className="space-y-3">
//                   {colTasks.map(t => (
//                     <div
//                       key={t.id}
//                       onClick={() => navigate(`/${role}/tasks/${t.id}`)}
//                       className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
//                     >
//                       <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
//                         {t.title}
//                       </p>
//                       <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-3">{t.project?.name || 'No project'}</p>
//                       <div className="flex items-center justify-between mb-3">
//                         <Badge variant={priorityColors[t.priority]} size="sm">{t.priority}</Badge>
//                         <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
//                           📅 {t.deadline ? new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
//                         <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
//                           {(t.assignee?.name || 'U').charAt(0)}
//                         </div>
//                         <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
//                           {t.assignee?.name || 'Unassigned'}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                   {colTasks.length === 0 && (
//                     <div className="text-center py-6 text-[11px] text-slate-400 dark:text-slate-500">
//                       No tasks
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Tasks;







import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/Badge';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const Tasks = ({ role = 'viewer' }) => {
  const canCreate = role === 'superadmin' || role === 'admin' || role === 'manager';
  const canAssign = role === 'superadmin' || role === 'admin' || role === 'manager';
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTasks().then(setTasks).catch(console.error).finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: 'Not Started', key: 'Not Started', color: 'slate' },
    { title: 'On Hold', key: 'On Hold', color: 'amber' },
    { title: 'In Progress', key: 'In Progress', color: 'blue' },
    { title: 'In QC', key: 'In QC', color: 'purple' },
    { title: 'Completed', key: 'Completed', color: 'emerald' },
  ];

  const priorityColors = { High: 'danger', Medium: 'warning', Low: 'info' };

  const columnStyles = {
    slate: 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800',
    amber: 'bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/20',
    blue: 'bg-blue-50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20',
    purple: 'bg-purple-50 dark:bg-purple-500/5 border-purple-100 dark:border-purple-500/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20',
  };
  const headerColors = {
    slate: 'text-slate-700 dark:text-slate-300',
    amber: 'text-amber-700 dark:text-amber-400',
    blue: 'text-blue-700 dark:text-blue-400',
    purple: 'text-purple-700 dark:text-purple-400',
    emerald: 'text-emerald-700 dark:text-emerald-400',
  };
  const dotColors = {
    slate: 'bg-slate-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
  };

  const getTasksForColumn = (key) => tasks.filter((t) => t.status === key);

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
            Task Board
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {role === 'viewer'
              ? 'Overview of all tasks (read-only)'
              : `${tasks.length} tasks across 5 columns`}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate(`/${role}/tasks/new`)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <span className="text-base">+</span> New Task
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-20 text-center">
          <p className="text-5xl mb-4">✓</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No tasks yet</p>
          {canCreate && (
            <button
              onClick={() => navigate(`/${role}/tasks/new`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition"
            >
              + Create your first task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {columns.map((col) => {
            const colTasks = getTasksForColumn(col.key);
            return (
              <div
                key={col.key}
                className={`rounded-2xl border p-4 ${columnStyles[col.color]}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dotColors[col.color]}`}></span>
                    <h3 className={`text-sm font-bold ${headerColors[col.color]}`}>
                      {col.title}
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-800">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => navigate(`/${role}/tasks/${t.id}`)}
                      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                    >
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-3">
                        {t.project?.name || 'No project'}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={priorityColors[t.priority]} size="sm">
                          {t.priority}
                        </Badge>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          📅{' '}
                          {t.deadline
                            ? new Date(t.deadline).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {(t.assignee?.name || 'U').charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                          {t.assignee?.name || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="text-center py-6 text-[11px] text-slate-400 dark:text-slate-500">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tasks;