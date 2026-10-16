import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const GoogleCalendarSection = () => {
  const [status, setStatus] = useState({ connected: false, email: null });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const s = await api.getCalendarStatus();
      setStatus(s);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
    const params = new URLSearchParams(window.location.search);
    if (params.get('calendar') === 'connected') {
      setTimeout(load, 500);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const connect = () => {
    const token = localStorage.getItem('dms_token');
    window.location.href = `http://localhost:5000/api/calendar-oauth/google/start?token=${token}`;
  };

  const disconnect = async () => {
    if (!confirm('Disconnect Google Calendar?')) return;
    await api.disconnectCalendar();
    load();
  };

  if (loading) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Google Calendar</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sync meetings with your Google Calendar</p>
        </div>
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${
          status.connected
            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
        }`}>
          {status.connected ? '✅ Connected' : '⚠️ Not connected'}
        </span>
      </div>

      {status.connected ? (
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Connected Account</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 break-all">{status.email}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-700 dark:text-emerald-400">
            ✅ New meetings in DMS will automatically appear in your Google Calendar
          </div>
          <button onClick={disconnect} className="px-4 py-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-500/20 transition">
            Disconnect
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={connect} className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Connect Google Calendar
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            One-click authorization. No password needed.
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarSection;