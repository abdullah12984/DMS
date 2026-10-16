import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { api } from '../../services/apiClient';

const EmailDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMode, setReplyMode] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.getEmail(id)
      .then((data) => {
        setEmail(data);
        if (!data.isRead) api.markEmailRead(id, true);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleReply = async () => {
    if (!replyBody.trim()) return;
    setSending(true);
    try {
      await api.sendEmail({
        from: 'superadmin@dms.com',
        to: email.from,
        subject: `Re: ${email.subject}`,
        body: replyBody,
        category: email.category,
        leadId: email.leadId,
      });
      alert('Reply sent! ✅');
      setReplyBody('');
      setReplyMode(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setSending(false);
    }
  };

  const handleCategoryChange = async (newCategory) => {
    try {
      await api.updateEmailCategory(id, newCategory);
      setEmail({ ...email, category: newCategory });
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!email) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Email not found</div>;

  const categoryColors = { Work: 'info', Leads: 'purple', Meetings: 'success', Junk: 'default' };

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => navigate('/superadmin/emails')} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
        ← Back to Inbox
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {email.from.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">{email.from}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">to {email.to}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={categoryColors[email.category] || 'default'}>{email.category}</Badge>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(email.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            {email.subject}
          </h2>

          <div className="prose prose-sm max-w-none">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {email.body}
            </p>
          </div>

          {/* Category changer */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Move to category
            </p>
            <div className="flex flex-wrap gap-2">
              {['Work', 'Leads', 'Meetings', 'Junk'].map(c => (
                <button
                  key={c}
                  onClick={() => handleCategoryChange(c)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                    email.category === c
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setReplyMode(!replyMode)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
            >
              ↩️ Reply
            </button>
            <button
              onClick={() => navigate('/superadmin/emails/compose')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition"
            >
              ↪️ Forward
            </button>
          </div>

          {/* Reply box */}
          {replyMode && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Reply to {email.from}
              </p>
              <textarea
                rows="6"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write your reply..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none resize-none"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleReply}
                  disabled={sending || !replyBody.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {sending ? 'Sending...' : '✉️ Send Reply'}
                </button>
                <button
                  onClick={() => { setReplyMode(false); setReplyBody(''); }}
                  className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;