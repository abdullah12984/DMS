import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const EmailCompose = () => {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    to: '',
    subject: '',
    body: '',
    category: 'Work',
    leadId: '',
    projectId: '',
  });

  useEffect(() => {
    api.getEmailTemplates().then(setTemplates).catch(() => {});
    api.getLeads().then(setLeads).catch(() => {});
    api.getProjects().then(setProjects).catch(() => {});
  }, []);

  const applyTemplate = (templateId) => {
    const t = templates.find(x => x.id === templateId);
    if (t) setForm({ ...form, subject: t.subject, body: t.body });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const payload = {
        from: 'superadmin@dms.com',
        to: form.to,
        subject: form.subject,
        body: form.body,
        category: form.category,
        leadId: form.leadId || null,
        projectId: form.projectId || null,
      };
      console.log('Sending email:', payload);
      const result = await api.sendEmail(payload);
      console.log('Sent successfully:', result);
      alert('✅ Email sent!');
      navigate('/superadmin/emails');
    } catch (err) {
      console.error('Send failed:', err);
      setError(err.message || 'Failed to send email');
      alert('❌ ' + (err.message || 'Failed to send email'));
    } finally {
      setSending(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2";

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
        ← Back to Inbox
      </button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Compose Email</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Send a new email</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 text-sm text-red-600 dark:text-red-400">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSend} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div>
          <label className={labelClass}>Template</label>
          <select onChange={(e) => applyTemplate(e.target.value)} className={inputClass + ' cursor-pointer'}>
            <option value="">Choose a template...</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>To *</label>
          <input
            type="email"
            required
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
            placeholder="recipient@example.com"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass + ' cursor-pointer'}>
              <option>Work</option>
              <option>Leads</option>
              <option>Meetings</option>
              <option>Junk</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Related Lead</label>
            <select value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })} className={inputClass + ' cursor-pointer'}>
              <option value="">None</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.companyName}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Related Project</label>
            <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className={inputClass + ' cursor-pointer'}>
              <option value="">None</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Subject *</label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Email subject"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Message *</label>
          <textarea
            required
            rows="12"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Write your email..."
            className={inputClass + ' resize-none'}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {sending ? '⏳ Sending...' : '✉️ Send Email'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailCompose;