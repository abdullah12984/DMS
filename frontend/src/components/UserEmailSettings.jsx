import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const UserEmailSettings = () => {
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyNotificationEmail().then((data) => {
      setEmail(data.notificationEmail || '');
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateMyNotificationEmail(email);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">My Notification Email</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Meeting invitations will be sent to this email
          </p>
        </div>
        {saved && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            ✅ Saved
          </span>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your-email@gmail.com"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          💡 Leave empty to use your login email by default
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
      >
        {saving ? 'Saving...' : '✓ Save Email'}
      </button>
    </div>
  );
};

export default UserEmailSettings;