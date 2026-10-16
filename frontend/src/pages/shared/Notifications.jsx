import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

const Notifications = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications().finally(() => setLoading(false));
  }, []);

  const typeStyles = {
    task: { icon: '✓', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
    warning: { icon: '⏰', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
    user: { icon: '👤', bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
    meeting: { icon: '📅', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
    project: { icon: '📁', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300' },
    lead: { icon: '📞', bg: 'bg-pink-50 dark:bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400' },
    success: { icon: '✅', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
    info: { icon: 'ℹ️', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  };

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    if (diff < 43200) return `${Math.floor(diff / 1440)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const filtered = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const handleClick = (n) => {
    if (!n.isRead) markAsRead(n.id);
    if (n.link) navigate(n.link);
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
            Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition shadow-sm"
          >
            ✓ Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all flex items-center gap-2 ${
              filter === t.key
                ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              filter === t.key ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-5xl mb-4">🔕</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          filtered.map((n) => {
            const s = typeStyles[n.type] || typeStyles.info;
            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`group flex items-start gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors ${
                  !n.isRead ? 'bg-blue-50/40 dark:bg-blue-500/5' : ''
                }`}
              >
                <div className={`w-11 h-11 rounded-xl ${s.bg} ${s.text} flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform`}>
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm truncate ${!n.isRead ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 font-medium whitespace-nowrap shrink-0">
                  {formatTime(n.createdAt)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;