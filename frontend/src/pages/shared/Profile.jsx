import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/apiClient';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    department: '',
  });

  const loadProfile = async () => {
    try {
      const data = await api.getMyProfile();
      console.log('Profile loaded:', data);
      setProfile(data);
      setForm({
        name: data.name || '',
        phone: data.phone || '',
        department: data.department || '',
      });
    } catch (e) {
      console.error('Profile load error:', e);
      // Fallback to auth user data
      if (user) {
        setProfile({
          ...user,
          _count: { tasks: 0, projects: 0, teamProjects: 0 },
        });
        setForm({
          name: user.name || '',
          phone: '',
          department: '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateMyProfile(form);
      await loadProfile();
      alert('✅ Profile updated');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const initials = (profile?.name || user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const stats = [
    { label: 'Projects', value: profile?._count?.teamProjects || 0 },
    { label: 'Tasks', value: profile?._count?.tasks || 0 },
    { label: 'Managing', value: profile?._count?.projects || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          My Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your personal information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Info Card */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/30">
              {initials}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-4">
              {profile?.name || user?.name || 'User'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {profile?.email || user?.email || ''}
            </p>
            <span className="inline-block mt-3 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-200 dark:border-blue-500/20">
              {(profile?.role || user?.role || 'USER').replace('_', ' ')}
            </span>

            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              {stats.map((s, i) => (
                <div key={i}>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {s.value}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
              Activity
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-500">Member since</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {memberSince}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-500">Department</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {profile?.department || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-500">Phone</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {profile?.phone || 'Not set'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Editable Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                value={profile?.email || user?.email || ''}
                disabled
                className={inputClass + ' opacity-60 cursor-not-allowed'}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+92 300 1234567"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Department
              </label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="Engineering"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
            <button
              onClick={() => {
                setForm({
                  name: profile?.name || '',
                  phone: profile?.phone || '',
                  department: profile?.department || '',
                });
              }}
              className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;