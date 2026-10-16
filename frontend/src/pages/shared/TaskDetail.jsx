import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TaskDetail = ({ role = 'superadmin' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);

  const loadTask = () => {
    api.getTask(id).then(setTask).catch(console.error).finally(() => setLoading(false));
    api.getTaskComments(id).then(setComments).catch(console.error);
  };

  useEffect(() => { loadTask(); }, [id]);

  const handleUpdate = async (updates) => {
    setSaving(true);
    try {
      const updated = await api.updateTask(id, updates);
      setTask({ ...task, ...updated });
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const postComment = async () => {
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const c = await api.addComment({ content: commentText.trim(), taskId: id });
      setComments([...comments, c]);
      setCommentText('');
    } catch (e) {
      alert(e.message);
    } finally {
      setPosting(false);
    }
  };

  const deleteComment = async (cid) => {
    if (!confirm('Delete this comment?')) return;
    await api.deleteComment(cid);
    setComments(comments.filter(c => c.id !== cid));
  };

 const statusVariant = (s) =>
  s === 'Completed' ? 'success'
  : s === 'In QC' ? 'purple'
  : s === 'In Progress' ? 'info'
  : s === 'On Hold' ? 'warning'
  : 'default';
  const priorityVariant = (p) => p === 'High' ? 'danger' : p === 'Medium' ? 'warning' : 'info';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!task) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Task not found</div>;

  const formatTime = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
        ← Back
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant={priorityVariant(task.priority)}>{task.priority} Priority</Badge>
                <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{task.title}</h1>
              {task.project && (
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Project: <span className="font-medium text-slate-700 dark:text-slate-300">{task.project.name}</span>
                </p>
              )}
            </div>
            {(role === 'superadmin' || role === 'admin' || role === 'manager') && (
              <button
                onClick={() => navigate(`/${role}/tasks/${id}/edit`)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition"
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {task.description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{task.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl mb-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">Assignee</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {(task.assignee?.name || 'U').charAt(0)}
                </div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{task.assignee?.name || 'Unassigned'}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">Start</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {task.startDate ? new Date(task.startDate).toLocaleDateString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">Deadline</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">Progress</p>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{task.progress}%</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Progress</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{task.progress}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${task.progress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Update Status</h3>
        <div className="flex flex-wrap gap-2">
         {['Not Started', 'On Hold', 'In Progress', 'In QC', 'Completed', 'Cancelled'].map(s => (
            <button
              key={s}
              onClick={() => handleUpdate({ status: s })}
              disabled={saving || task.status === s}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                task.status === s
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500'
              } disabled:opacity-50`}
            >
              {s}
            </button>
          ))}
        </div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-6 mb-4">Update Progress</h3>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={task.progress}
          onChange={(e) => setTask({ ...task, progress: parseInt(e.target.value) })}
          onMouseUp={(e) => handleUpdate({ progress: parseInt(e.target.value) })}
          onTouchEnd={(e) => handleUpdate({ progress: parseInt(e.target.value) })}
          className="w-full accent-blue-600"
        />
        <p className="text-center text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">{task.progress}%</p>
      </div>

      {/* Comments */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">
          Comments ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4 mb-5">
            {comments.map(c => (
              <div key={c.id} className="flex gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {c.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{c.user.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500">{c.user.role}</span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500">{formatTime(c.createdAt)}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3">
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line break-words">{c.content}</p>
                  </div>
                  {(c.user.id === user?.id || user?.role === 'SUPER_ADMIN') && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="text-[10px] text-red-500 hover:underline mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment box */}
        <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ME'}
          </div>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && postComment()}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all"
          />
          <button
            onClick={postComment}
            disabled={posting || !commentText.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
          >
            {posting ? '...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;