import React, { useState, useEffect } from 'react';
import { api } from '../services/apiClient';

const EmailSetupSection = () => {
  const [status, setStatus] = useState({ connected: false, emailUser: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    emailUser: '',
    emailPass: '',
    emailHost: 'smtp.gmail.com',
    emailPort: 587,
  });

  const loadStatus = async () => {
    try {
      const data = await api.getEmailConfigStatus();
      setStatus(data);
      if (data.emailUser) {
        setForm((f) => ({ ...f, emailUser: data.emailUser, emailHost: data.host }));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await api.setupEmailConfig(form);
      alert(result.message);
      setForm({ ...form, emailPass: '' });
      setShowForm(false);
      loadStatus();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const r = await api.testEmailConfig();
      alert(r.message);
    } catch (err) {
      alert(err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect your email? Emails will fall back to the system address.')) return;
    try {
      await api.disconnectEmailConfig();
      loadStatus();
    } catch (err) {
      alert(err.message);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all';

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3"></div>
        <div className="animate-pulse h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Email Sending</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Connect your Gmail to send emails from your own address
          </p>
        </div>
        <span
          className={`text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${
            status.connected
              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
          }`}
        >
          {status.connected ? '✅ Connected' : '⚠️ Not connected'}
        </span>
      </div>

      {/* Connected state */}
      {status.connected && !showForm && (
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">
              Sending From
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 break-all">
              {status.emailUser}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold rounded-xl border border-emerald-200 dark:border-emerald-500/20 transition disabled:opacity-50"
            >
              {testing ? 'Sending...' : '✉️ Send Test'}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition"
            >
              🔄 Change Email
            </button>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-500/20 transition"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Setup form */}
      {(!status.connected || showForm) && (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Gmail Address
            </label>
            <input
              type="email"
              required
              value={form.emailUser}
              onChange={(e) => setForm({ ...form, emailUser: e.target.value })}
              placeholder="you@gmail.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              App Password (16 characters)
            </label>
            <input
              type="password"
              required={!status.connected}
              value={form.emailPass}
              onChange={(e) => setForm({ ...form, emailPass: e.target.value.replace(/\s/g, '') })}
              placeholder="abcd efgh ijkl mnop"
              className={inputClass + ' font-mono tracking-wider'}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Get your 16-character password from{' '}
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline font-medium"
              >
                myaccount.google.com/apppasswords
              </a>{' '}
              (requires 2-Step Verification enabled).
            </p>
          </div>

          <details className="text-xs text-slate-500 dark:text-slate-400">
            <summary className="cursor-pointer font-semibold hover:text-slate-700 dark:hover:text-slate-200">
              Advanced (SMTP settings)
            </summary>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <input
                value={form.emailHost}
                onChange={(e) => setForm({ ...form, emailHost: e.target.value })}
                placeholder="smtp.gmail.com"
                className={inputClass}
              />
              <input
                type="number"
                value={form.emailPort}
                onChange={(e) => setForm({ ...form, emailPort: parseInt(e.target.value) || 587 })}
                placeholder="587"
                className={inputClass}
              />
            </div>
          </details>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
            >
              {saving ? 'Testing & Saving...' : '✓ Connect Email'}
            </button>
            {showForm && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm({ ...form, emailPass: '' });
                }}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Help text */}
      <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed">
          <b className="text-slate-700 dark:text-slate-300">How to get an App Password:</b>
          <br />
          1. Go to Google Account → Security → Enable 2-Step Verification
          <br />
          2. Visit myaccount.google.com/apppasswords
          <br />
          3. Create an app called "DMS Portal" → copy the 16-char password
          <br />
          4. Paste it above → click Connect Email
        </p>
      </div>
    </div>
  );
};

export default EmailSetupSection;