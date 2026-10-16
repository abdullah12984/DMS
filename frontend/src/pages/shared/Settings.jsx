import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import EmailSetupSection from '../../components/EmailSetupSection';
import GoogleCalendarSection from '../../components/GoogleCalendarSection';
import UserEmailSettings from '../../components/UserEmailSettings';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import { api } from '../../services/apiClient';
const Settings = () => {
  const { theme, setTheme } = useTheme();
 const { user, logout, refreshUser } = useAuth();
  const [nameInput, setNameInput] = useState(user?.name || '');
const [emailInput, setEmailInput] = useState(user?.email || '');
const [savingName, setSavingName] = useState(false);
const [savingEmail, setSavingEmail] = useState(false);
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const handleLogout = () => {
    if (!confirm('Sign out of DMS Portal?')) return;
    logout();
    navigate('/');
  };

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full transition-all relative ${
        value ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
          value ? 'left-6' : 'left-0.5'
        }`}
      ></span>
    </button>
  );
const handleSaveName = async () => {
  if (!nameInput.trim() || nameInput === user?.name) return;
  setSavingName(true);
  try {
    await api.updateMyProfile({ name: nameInput.trim() });
    await refreshUser();       // if available in AuthContext
    alert('✅ Name updated');
  } catch (err) {
    alert(err.message);
  } finally {
    setSavingName(false);
  }
};

const handleSaveEmail = async () => {
  if (!emailInput.trim() || emailInput === user?.email) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
    alert('Invalid email format');
    return;
  }
  if (!confirm('Changing email will require re-login. Continue?')) return;

  setSavingEmail(true);
  try {
    await api.updateMyProfile({ email: emailInput.trim() });
    alert('✅ Email updated. Please log in again with your new email.');
    logout();
    navigate('/');
  } catch (err) {
    alert(err.message);
  } finally {
    setSavingEmail(false);
  }
};
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your preferences</p>
      </div>

      {/* ===== SUPER ADMIN SECTIONS ===== */}
      <GoogleCalendarSection />
      {user?.role === 'SUPER_ADMIN' && <EmailSetupSection />}

      {/* ===== NON SUPER ADMIN: Notification Email ===== */}
      {user?.role !== 'SUPER_ADMIN' && <UserEmailSettings />}

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Appearance</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Choose how DMS looks to you</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'dark', label: 'Dark Mode', icon: '🌙', desc: 'Easy on the eyes' },
            { key: 'light', label: 'Light Mode', icon: '☀️', desc: 'Bright and clean' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                theme === t.key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm shadow-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{t.icon}</span>
                {theme === t.key && (
                  <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Personal Information */}
<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
  <div className="mb-5">
    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Personal Information</h3>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      Update your display name and email
    </p>
  </div>

  <div className="space-y-4">
    {/* Name */}
    <div>
      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
        Full Name
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Your name"
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition"
        />
        <button
          onClick={handleSaveName}
          disabled={savingName || nameInput === user?.name}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {savingName ? '...' : 'Update'}
        </button>
      </div>
    </div>

    {/* Email */}
    <div>
      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
        Email Address
      </label>
      <div className="flex gap-2">
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="your-email@example.com"
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition"
        />
        <button
          onClick={handleSaveEmail}
          disabled={savingEmail || emailInput === user?.email}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {savingEmail ? '...' : 'Update'}
        </button>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
        ⚠️ Changing email will require re-login. Make sure it's a real email.
      </p>
    </div>
  </div>
</div>
      

      {/* Security */}
     {/* Security */}
<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
  <div className="mb-5">
    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Security</h3>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Keep your account safe</p>
  </div>
  <div className="space-y-2">
    <button
      onClick={() => setShowPasswordModal(true)}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">🔐</span>
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Change Password</span>
      </div>
      <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">→</span>
    </button>
  </div>
</div>

{/* Modal */}
{showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-500/20 rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-base font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Careful — these actions affect your account</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-500/20 transition"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Settings;