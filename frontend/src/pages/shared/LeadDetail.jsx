import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { api } from '../../services/apiClient';

const LeadDetail = ({ role = 'superadmin' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const stages = ['New Lead', 'Contacted', 'Discussion', 'Requirement Gathering', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

  useEffect(() => {
    api.getLead(id)
      .then(setLead)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      const updated = await api.updateLeadStatus(id, status);
      setLead({ ...lead, ...updated });
    } catch (e) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const statusVariant = (s) => {
    if (s === 'Won') return 'success';
    if (s === 'Lost') return 'danger';
    if (s === 'New Lead') return 'info';
    if (s === 'Negotiation' || s === 'Proposal Sent') return 'warning';
    return 'purple';
  };

  if (loading) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading...</div>;
  if (!lead) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Lead not found</div>;

  const currentStageIndex = stages.indexOf(lead.status);

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
        ← Back to Leads
      </button>

      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div>
              <Badge variant={statusVariant(lead.status)}>{lead.status}</Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-3">{lead.companyName}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Contact: <span className="font-medium text-slate-700 dark:text-slate-300">{lead.contactName}</span></p>
            </div>
            <button
              onClick={() => navigate(`/${role}/leads/${id}/follow-up`)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
            >
              ✉️ Send Follow-up
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">Email</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{lead.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">Phone</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{lead.phone || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">Last Contact</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {lead.lastContact ? new Date(lead.lastContact).toLocaleDateString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">Next Follow-up</p>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-5">Acquisition Stage</h3>
        <div className="flex items-center overflow-x-auto pb-2">
          {stages.slice(0, 7).map((s, i) => {
            const isDone = i < currentStageIndex;
            const isCurrent = i === currentStageIndex;
            return (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isDone ? 'bg-emerald-500 text-white' :
                    isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' :
                    'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <p className={`text-[10px] mt-2 text-center font-medium ${
                    isCurrent ? 'text-blue-600 dark:text-blue-400' :
                    isDone ? 'text-slate-700 dark:text-slate-300' :
                    'text-slate-400'
                  }`}>{s}</p>
                </div>
                {i < 6 && (
                  <div className={`flex-1 h-0.5 min-w-[20px] ${isDone ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Update Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Update Stage</h3>
        <div className="flex flex-wrap gap-2">
          {stages.map(s => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={updating || lead.status === s}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                lead.status === s
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500'
              } disabled:opacity-50`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;