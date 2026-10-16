import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const LeadFollowUp = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    body: '',
    templateId: '',
  });

  useEffect(() => {
    api.getLead(id).then(setLead).catch(console.error);
    api.getEmailTemplates().then(setTemplates).catch(console.error);
  }, [id]);

  const applyTemplate = (templateId) => {
    const t = templates.find(x => x.id === templateId);
    if (t) {
      setForm({
        ...form,
        templateId,
        subject: t.subject.replace('{{contact}}', lead?.contactName || ''),
        body: t.body.replace('{{contact}}', lead?.contactName || '').replace('{{company}}', lead?.companyName || ''),
      });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.sendEmail({
        from: 'superadmin@dms.com',
        to: lead.email,
        subject: form.subject,
        body: form.body,
        category: 'Leads',
        leadId: id,
      });
      await api.updateLeadStatus(id, lead.status);
      alert('Follow-up sent! ✅');
      navigate(`/superadmin/leads/${id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all";

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
        ← Back
      </button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Send Follow-up</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          To: <span className="font-semibold">{lead?.companyName}</span> ({lead?.email})
        </p>
      </div>

      <form onSubmit={handleSend} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Use Template</label>
          <select
            value={form.templateId}
            onChange={(e) => applyTemplate(e.target.value)}
            className={inputClass + ' cursor-pointer'}
          >
            <option value="">Choose a template...</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Subject</label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Message</label>
          <textarea
            required
            rows="10"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className={inputClass + ' resize-none font-mono text-xs'}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {sending ? 'Sending...' : '✉️ Send Follow-up'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadFollowUp;