// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Badge } from '../../components/Badge';
// import { api } from '../../services/apiClient';

// const ProjectDetail = ({ role = 'viewer' }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [project, setProject] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api
//       .getProject(id)
//       .then(setProject)
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );
//   }
//   if (!project)
//     return (
//       <div className="text-center py-20 text-slate-500 dark:text-slate-400">
//         Project not found
//       </div>
//     );

//   const statusVariant = (s) =>
//     s === 'Completed' ? 'success' : s === 'In Progress' ? 'info' : s === 'On Hold' ? 'warning' : 'default';
//   const typeVariant = { Active: 'success', Internal: 'info', Training: 'warning', Product: 'purple' };
//   const priorityVariant = (p) =>
//     p === 'High' ? 'danger' : p === 'Medium' ? 'warning' : 'info';

//   return (
//     <div className="space-y-6 max-w-5xl">
//       <button
//         onClick={() => navigate(-1)}
//         className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
//       >
//         ← Back
//       </button>

//       {/* Hero Card */}
//       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
//         <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
//         <div className="p-6 md:p-8">
//           <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
//             <div className="min-w-0">
//               <div className="flex flex-wrap items-center gap-2 mb-3">
//                 <Badge variant={typeVariant[project.type] || 'info'}>{project.type}</Badge>
//                 <Badge variant={statusVariant(project.status)}>{project.status}</Badge>
//                 {project.priority && (
//                   <Badge variant={priorityVariant(project.priority)}>
//                     {project.priority} Priority
//                   </Badge>
//                 )}
//               </div>
//               <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
//                 {project.name}
//               </h1>
//               <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
//                 Client: {project.client || 'Internal'}
//               </p>
//             </div>
//             <button
//               onClick={() => navigate(`/${role}/projects/${id}/edit`)}
//               className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition whitespace-nowrap"
//             >
//               ✏️ Edit
//             </button>
//           </div>

//           {project.description && (
//             <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
//               {project.description}
//             </p>
//           )}

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl mb-6">
//             <div>
//               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">
//                 Manager
//               </p>
//               <div className="flex items-center gap-2">
//                 <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
//                   {(project.manager?.name || 'U').charAt(0)}
//                 </div>
//                 <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
//                   {project.manager?.name || 'Unassigned'}
//                 </p>
//               </div>
//             </div>
//             <div>
//               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">
//                 Start
//               </p>
//               <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
//                 {project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}
//               </p>
//             </div>
//             <div>
//               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">
//                 Deadline
//               </p>
//               <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
//                 {project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}
//               </p>
//             </div>
//             <div>
//               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">
//                 Tasks
//               </p>
//               <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
//                 {project.tasks?.length || 0}
//               </p>
//             </div>
//           </div>

//           <div>
//             <div className="flex justify-between text-sm mb-2">
//               <span className="font-semibold text-slate-600 dark:text-slate-400">Overall Progress</span>
//               <span className="font-bold text-slate-900 dark:text-slate-100">{project.progress}%</span>
//             </div>
//             <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
//                 style={{ width: `${project.progress}%` }}
//               ></div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Team Members */}
//       {project.team && project.team.length > 0 && (
//         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
//               Team Members ({project.team.length})
//             </h3>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//             {project.team.map((member) => (
//               <div
//                 key={member.id}
//                 className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
//               >
//                 <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
//                   {member.name
//                     .split(' ')
//                     .map((n) => n[0])
//                     .join('')
//                     .slice(0, 2)
//                     .toUpperCase()}
//                 </div>
//                 <div className="min-w-0">
//                   <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
//                     {member.name}
//                   </p>
//                   <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
//                     {member.role}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Tasks */}
//       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
//         <div className="flex items-center justify-between mb-5">
//           <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
//             Tasks ({project.tasks?.length || 0})
//           </h3>
//           {(role === 'superadmin' || role === 'admin' || role === 'manager') && (
//             <button
//               onClick={() => navigate(`/${role}/tasks/new?projectId=${id}`)}
//               className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
//             >
//               + Add Task
//             </button>
//           )}
//         </div>
//         {!project.tasks || project.tasks.length === 0 ? (
//           <div className="text-center py-8">
//             <p className="text-3xl mb-2">📋</p>
//             <p className="text-xs text-slate-500 dark:text-slate-400">
//               No tasks in this project yet
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {project.tasks.map((t) => (
//               <div
//                 key={t.id}
//                 onClick={() => navigate(`/${role}/tasks/${t.id}`)}
//                 className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition"
//               >
//                 <div className="flex items-center gap-3 flex-1 min-w-0">
//                   <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
//                     {(t.assignee?.name || 'U').charAt(0)}
//                   </div>
//                   <div className="min-w-0">
//                     <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
//                       {t.title}
//                     </p>
//                     <p className="text-xs text-slate-500 dark:text-slate-400">
//                       {t.assignee?.name || 'Unassigned'}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2 shrink-0">
//                   <Badge variant={priorityVariant(t.priority)} size="sm">
//                     {t.priority}
//                   </Badge>
//                   <Badge variant={statusVariant(t.status)} size="sm">
//                     {t.status}
//                   </Badge>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProjectDetail;




import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { api } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

const ProjectDetail = ({ role = 'viewer' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [posting, setPosting] = useState(false);

  const loadProject = () => {
    api.getProject(id).then(setProject).catch(console.error).finally(() => setLoading(false));
  };

  const loadNotes = () => {
    api.getProjectNotes(id).then(setNotes).catch(console.error);
  };

  useEffect(() => {
    if (id) {
      loadProject();
      loadNotes();
    }
  }, [id]);

  const postNote = async () => {
    if (!noteText.trim()) return;
    setPosting(true);
    try {
      const n = await api.addProjectNote(id, noteText.trim());
      setNotes([n, ...notes]);
      setNoteText('');
    } catch (e) {
      alert(e.message);
    } finally {
      setPosting(false);
    }
  };

  const removeNote = async (noteId) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.deleteProjectNote(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch (e) {
      alert(e.message);
    }
  };

  const formatTime = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!project)
    return (
      <div className="text-center py-20 text-slate-500 dark:text-slate-400">
        Project not found
      </div>
    );

  const statusVariant = (s) =>
    s === 'Completed' ? 'success' : s === 'In Progress' ? 'info' : s === 'On Hold' ? 'warning' : 'default';
  const typeVariant = { Active: 'success', Internal: 'info', Training: 'warning', Product: 'purple' };
  const priorityVariant = (p) =>
    p === 'High' ? 'danger' : p === 'Medium' ? 'warning' : 'info';

  return (
    <div className="space-y-6 max-w-5xl">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
      >
        ← Back
      </button>

      {/* Hero Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant={typeVariant[project.type] || 'info'}>{project.type}</Badge>
                <Badge variant={statusVariant(project.status)}>{project.status}</Badge>
                {project.priority && (
                  <Badge variant={priorityVariant(project.priority)}>
                    {project.priority} Priority
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {project.name}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Client: {project.client || 'Internal'}
              </p>
            </div>
            <button
              onClick={() => navigate(`/${role}/projects/${id}/edit`)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition whitespace-nowrap"
            >
              ✏️ Edit
            </button>
          </div>

          {project.description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
              {project.description}
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl mb-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Manager
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {(project.manager?.name || 'U').charAt(0)}
                </div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {project.manager?.name || 'Unassigned'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Start
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Deadline
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Tasks
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {project.tasks?.length || 0}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Overall Progress</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{project.progress}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      {project.team && project.team.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Team Members ({project.team.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {project.team.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {member.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== PROJECT NOTES ==================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Project Notes ({notes.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visible to all team members
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Notes
          </span>
        </div>

        {/* Add note */}
        <div className="flex gap-2 mb-5">
          <textarea
            rows="2"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                postNote();
              }
            }}
            placeholder="Write a note or update about this project... (Enter to post, Shift+Enter for new line)"
            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none resize-none transition-all"
          />
          <button
            onClick={postNote}
            disabled={posting || !noteText.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50 self-end"
          >
            {posting ? '...' : 'Post'}
          </button>
        </div>

        {/* Notes list */}
        {notes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-2">📝</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No notes yet. Be the first to add one!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((n) => (
              <div
                key={n.id}
                className="group flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {n.author.name
                    .split(' ')
                    .map((x) => x[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {n.author.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider font-semibold">
                      {n.author.role}
                    </span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500">
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line break-words leading-relaxed">
                    {n.content}
                  </p>
                  {(n.author.id === user?.id || user?.role === 'SUPER_ADMIN') && (
                    <button
                      onClick={() => removeNote(n.id)}
                      className="text-[10px] text-red-500 hover:underline mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Tasks ({project.tasks?.length || 0})
          </h3>
          {(role === 'superadmin' || role === 'admin' || role === 'manager') && (
            <button
              onClick={() => navigate(`/${role}/tasks/new?projectId=${id}`)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Add Task
            </button>
          )}
        </div>
        {!project.tasks || project.tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No tasks in this project yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(`/${role}/tasks/${t.id}`)}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(t.assignee?.name || 'U').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {t.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.assignee?.name || 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={priorityVariant(t.priority)} size="sm">
                    {t.priority}
                  </Badge>
                  <Badge variant={statusVariant(t.status)} size="sm">
                    {t.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;