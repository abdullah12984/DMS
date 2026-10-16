import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { api } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

const UpdateTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    api.getTask(id).then(setTask).catch(console.error).finally(() => setLoading(false));
    api.getTaskComments(id).then(setComments).catch(console.error);
  }, [id]);

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
  if (!task) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Task not found</div>;

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'Completed';

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
        ← Back to my tasks
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'info'}>{task.priority}</Badge>
            <Badge variant={task.status === 'Completed' ? 'success' : 'info'}>{task.status}</Badge>
            {isOverdue && <Badge variant="danger">⚠️ Overdue</Badge>}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">{task.title}</h1>
          {task.project && <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Project: {task.project.name}</p>}
          {task.description && <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">{task.description}</p>}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">Deadline</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">Progress</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{task.progress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Update Progress</h3>
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
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>0%</span>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{task.progress}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Update Status</h3>
        <div className="grid grid-cols-3 gap-2">
          {['In Progress', 'On Hold', 'In QC'].map(s => (
            <button
              key={s}
              onClick={() => handleUpdate({ status: s })}
              disabled={saving || task.status === s}
              className={`py-3 text-sm font-semibold rounded-xl border transition-all ${
                task.status === s
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500'
              } disabled:opacity-60`}
            >
              {s === 'Completed' ? '✓ Done' : s === 'In QC' ? '📤 Submit for QC' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-5">Comments ({comments.length})</h3>

        {comments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">No comments yet</p>
          </div>
        ) : (
          <div className="space-y-4 mb-5">
            {comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {c.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{c.user.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500">{formatTime(c.createdAt)}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3">
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line break-words">{c.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && postComment()}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={postComment}
            disabled={posting || !commentText.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateTask;