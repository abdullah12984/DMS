import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { api } from '../../services/api';

const EmailTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', body: '', category: 'General' });

  const fetchTemplates = async () => {
    try {
      const data = await api.getEmailTemplates();
      setTemplates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createEmailTemplate(form);
      setForm({ name: '', subject: '', body: '', category: 'General' });
      setShowForm(false);
      fetchTemplates();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    await api.deleteEmailTemplate(id);
    fetchTemplates();
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all";

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
          <button onClick={() => navigate('/superadmin/emails')} className="text-xs text-slate-500 dark:text-slate-400 mb-2">← Back to Inbox</button>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Email Templates</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Reusable templates for follow-ups</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
        >
          {showForm ? '✕ Cancel' : '+ New Template'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Template Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Lead Follow-up #1" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                <option>General</option>
                <option>Leads</option>
                <option>Meetings</option>
                <option>Work</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Subject</label>
            <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Body</label>
            <textarea required rows="6" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className={inputClass + ' resize-none font-mono text-xs'} />
          </div>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50">
            {saving ? 'Saving...' : '✓ Create Template'}
          </button>
        </form>
      )}

      {templates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-20 text-center">
          <p className="text-5xl mb-4">📧</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No templates yet</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition">
            + Create your first template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map(t => (
            <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t.name}</h3>
                <Badge variant={t.category === 'Leads' ? 'purple' : t.category === 'Meetings' ? 'success' : 'info'}>
                  {t.category}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-3 font-medium">Subject: {t.subject}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-line">{t.body}</p>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Subject: ${t.subject}\n\n${t.body}`);
                    alert('Copied to clipboard!');
                  }}
                  className="flex-1 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg transition"
                >
                  📋 Copy
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="px-4 py-2 text-xs font-semibold bg-red-50 dark:bg-red-500/10 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition border border-red-200 dark:border-red-500/20"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;