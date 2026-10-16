import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export const Topbar = ({ role, onMenuClick }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, soundEnabled, setSoundEnabled } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const displayName = user?.name || 'Super Admin';
  const displayEmail = user?.email || 'admin@dms.com';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  const typeIcons = {
    task: '✓', warning: '⏰', user: '👤',
    meeting: '📅', project: '📁', lead: '📞', info: 'ℹ️',
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="min-w-0">
          <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 capitalize truncate">
            {role} Workspace
          </h2>
          <p className="text-[10px] md:text-xs text-slate-500 truncate hidden sm:block">Department Management System</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
      
        <ThemeToggle />

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors active:scale-95"
          >
            <span className="text-base">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/20 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-sm"
                  >
                    {soundEnabled ? '🔊' : '🔇'}
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline px-2"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-3xl mb-2">🔕</p>
                    <p className="text-xs text-slate-500">No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 20).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.link) { navigate(n.link); setShowNotifs(false); }
                      }}
                      className={`flex items-start gap-3 px-5 py-3.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors ${
                        !n.isRead ? 'bg-blue-50/40 dark:bg-blue-500/5' : ''
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm shrink-0">
                        {typeIcons[n.type] || 'ℹ️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs truncate ${!n.isRead ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{formatTime(n.createdAt)}</p>
                      </div>
                      {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-2"></span>}
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => { navigate(`/${role}/notifications`); setShowNotifs(false); }}
                className="w-full py-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-t border-slate-100 dark:border-slate-800"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="hidden md:block min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">{displayName}</p>
            <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{displayEmail}</p>
          </div>
        </div>
      </div>
    </header>
  );
};