import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const MeetingForm = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [externalInput, setExternalInput] = useState('');
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '10:00',
    location: '',
    client: '',
    projectId: '',
    participants: [],
    externalEmails: [],
  });

  useEffect(() => {
    api.getUsers().then(setUsers).catch(console.error);
    api.getProjects().then(setProjects).catch(console.error);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleParticipant = (userId) => {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter((x) => x !== userId)
        : [...prev.participants, userId],
    }));
    setSearchTerm('');
    setShowDropdown(false);
  };

  const removeParticipant = (userId) => {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.filter((x) => x !== userId),
    }));
  };

  const addExternalEmail = () => {
    const email = externalInput.trim();
    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (form.externalEmails.includes(email)) {
      alert('This email is already added');
      return;
    }

    setForm({ ...form, externalEmails: [...form.externalEmails, email] });
    setExternalInput('');
  };

  const removeExternalEmail = (email) => {
    setForm({ ...form, externalEmails: form.externalEmails.filter((e) => e !== email) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createMeeting(form);
      alert(
        `✅ Meeting created!\n\nInvitations sent to ${
          form.participants.length + form.externalEmails.length
        } recipient(s) via email.`
      );
      navigate('/superadmin/calendar');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all';
  const labelClass =
    'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2';

  // Filter users for the search dropdown
  const eligibleUsers = users.filter((u) => u.isActive && u.role !== 'VIEWER');
  const filteredUsers = eligibleUsers
    .filter((u) => !form.participants.includes(u.id))
    .filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const selectedParticipants = form.participants
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
      >
        ← Back
      </button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">New Meeting</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Schedule a meeting — invitations are sent automatically
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div>
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
            Auto-Generated Meeting Link
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
            A Google Meet link will be automatically created and included in the invitation emails.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm"
      >
        <div>
          <label className={labelClass}>Meeting Title *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Sprint Planning"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            rows="2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What's this meeting about?"
            className={inputClass + ' resize-none'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Date *</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Time *</label>
            <input
              type="time"
              required
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Location (optional)</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Conference Room A"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Client (optional)</label>
            <input
              type="text"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              placeholder="e.g. ABC Corp"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Related Project (optional)</label>
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className={inputClass + ' cursor-pointer'}
            >
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ========== PARTICIPANTS ========== */}
        <div>
          <label className={labelClass}>
            Participants {form.participants.length > 0 && `(${form.participants.length})`}
          </label>

          {selectedParticipants.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedParticipants.map((p) => (
                <div
                  key={p.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-blue-500/20"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{p.name}</span>
                  <button
                    type="button"
                    onClick={() => removeParticipant(p.id)}
                    className="hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center transition"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="+ Add participant (search by name or email)"
                className={inputClass + ' pl-11'}
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 font-bold text-lg">
                +
              </span>
            </div>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-20">
                {filteredUsers.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {searchTerm ? 'No matching users' : 'All users already added'}
                    </p>
                  </div>
                ) : (
                  filteredUsers.slice(0, 10).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleParticipant(u.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {u.notificationEmail || u.email} · {u.role}
                        </p>
                      </div>
                      <span className="text-blue-500 text-lg font-bold shrink-0">+</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            💡 Selected participants will receive an email invitation at their notification email
          </p>
        </div>

        {/* ========== EXTERNAL EMAILS ========== */}
        <div>
          <label className={labelClass}>
            External Emails (clients, guests){' '}
            {form.externalEmails.length > 0 && `(${form.externalEmails.length})`}
          </label>

          {form.externalEmails.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {form.externalEmails.map((email) => (
                <div
                  key={email}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-xs font-semibold shadow-sm shadow-purple-500/20"
                >
                  <span>✉️ {email}</span>
                  <button
                    type="button"
                    onClick={() => removeExternalEmail(email)}
                    className="hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center transition"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="email"
              value={externalInput}
              onChange={(e) => setExternalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addExternalEmail();
                }
              }}
              placeholder="+ Add external email (client@company.com)"
              className={inputClass + ' flex-1'}
            />
            <button
              type="button"
              onClick={addExternalEmail}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            💡 People outside DMS (e.g., clients) will also receive the meeting invitation
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {saving ? '⏳ Creating...' : '✓ Create & Send Invitations'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeetingForm;