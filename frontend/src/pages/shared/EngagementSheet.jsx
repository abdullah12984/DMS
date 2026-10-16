// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Badge } from '../../components/Badge';
// import { api } from '../../services/api';

// const EngagementSheet = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [engagement, setEngagement] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api.getEngagement(id).then(setEngagement).catch(console.error).finally(() => setLoading(false));
//   }, [id]);

//   if (loading) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading...</div>;
//   if (!engagement) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Engagement not found</div>;

//   const typeVariant = { Active: 'success', Internal: 'info', Training: 'warning', Product: 'purple' };

//   return (
//     <div className="space-y-6 max-w-4xl">
//       <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
//         ← Back
//       </button>

//       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
//         <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
//         <div className="p-6 md:p-8">
//           <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
//             <div>
//               <Badge variant={typeVariant[engagement.type]}>{engagement.type}</Badge>
//               <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-3">{engagement.name}</h1>
//               <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Client: {engagement.client || '—'}</p>
//             </div>
//             <div className="flex gap-2">
//               <button className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-500/20 transition">
//                 📄 Export PDF
//               </button>
//               <button className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold rounded-xl border border-emerald-200 dark:border-emerald-500/20 transition">
//                 📊 Excel
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl mb-6">
//             <div>
//               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">Status</p>
//               <Badge variant="info">{engagement.status}</Badge>
//             </div>
//             <div>
//               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">Progress</p>
//               <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{engagement.progress}%</p>
//             </div>
//             <div>
//               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">Start Date</p>
//               <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
//                 {engagement.startDate ? new Date(engagement.startDate).toLocaleDateString() : '—'}
//               </p>
//             </div>
//             <div>
//               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">End Date</p>
//               <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
//                 {engagement.endDate ? new Date(engagement.endDate).toLocaleDateString() : '—'}
//               </p>
//             </div>
//           </div>

//           {engagement.project && (
//             <div className="mb-6">
//               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2">Related Project</p>
//               <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{engagement.project.name}</p>
//             </div>
//           )}

//           {engagement.scope && (
//             <div className="mb-6">
//               <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Scope</h3>
//               <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{engagement.scope}</p>
//             </div>
//           )}

//           {engagement.objectives && (
//             <div className="mb-6">
//               <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Objectives</h3>
//               <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{engagement.objectives}</p>
//             </div>
//           )}

//           <div>
//             <div className="flex justify-between text-sm mb-2">
//               <span className="font-semibold text-slate-600 dark:text-slate-400">Progress</span>
//               <span className="font-bold text-slate-900 dark:text-slate-100">{engagement.progress}%</span>
//             </div>
//             <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
//               <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${engagement.progress}%` }}></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EngagementSheet;
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import * as XLSX from 'xlsx';

const EngagementSheet = ({ role = 'viewer' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [engagement, setEngagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [form, setForm] = useState({
    scope: '',
    objectives: '',
    resources: '',
    notes: '',
  });
  const printRef = useRef(null);

  const load = () => {
    api
      .getEngagement(id)
      .then((data) => {
        setEngagement(data);
        setForm({
          scope: data.scope || '',
          objectives: data.objectives || '',
          resources: data.resources || '',
          notes: data.notes || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateEngagement(id, form);
      await load();
      setEditing(false);
      alert('✅ Engagement sheet updated');
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ===== PDF EXPORT =====
  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          clonedDoc.documentElement.classList.remove('dark');
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;

      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight + 10;
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }

      const filename = `${(engagement.name || 'Engagement').replace(/[^a-z0-9]/gi, '_')}.pdf`;
      pdf.save(filename);
    } catch (e) {
      console.error(e);
      alert('PDF export failed: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  // ===== EXCEL EXPORT =====
  const handleExportExcel = () => {
    try {
      const e = engagement;
      const project = e.project;
      const tasks = project?.tasks || [];
      const teamNames = (e.team || []).map((t) => `${t.name} (${t.role})`).join(', ');

      const data = [
        ['ENGAGEMENT SHEET'],
        [''],
        ['Project', project?.name || e.name],
        ['Client', e.client || project?.client || 'Internal'],
        ['Manager', e.manager?.name || 'Unassigned'],
        ['Team Members', teamNames || 'None'],
        ['Start Date', e.startDate ? new Date(e.startDate).toLocaleDateString() : '—'],
        ['End Date', e.endDate ? new Date(e.endDate).toLocaleDateString() : '—'],
        ['Overall Progress', `${e.progress || 0}%`],
        [''],
        ['TASKS & WORK ASSIGNMENT'],
        ['#', 'Task', 'Assigned To', 'Priority', 'Status', 'Progress', 'Start', 'Deadline', 'Completed'],
      ];

      tasks.forEach((t, i) => {
        data.push([
          i + 1,
          t.title || '',
          t.assignee?.name || 'Unassigned',
          t.priority || 'Medium',
          t.status || '',
          `${t.progress || 0}%`,
          t.startDate ? new Date(t.startDate).toLocaleDateString() : '—',
          t.deadline ? new Date(t.deadline).toLocaleDateString() : '—',
          t.completedAt ? new Date(t.completedAt).toLocaleDateString() : '—',
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(data);
      ws['!cols'] = [
        { wch: 5 },
        { wch: 30 },
        { wch: 20 },
        { wch: 12 },
        { wch: 15 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Engagement');
      const filename = `${(e.name || 'Engagement').replace(/[^a-z0-9]/gi, '_')}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error(err);
      alert('Excel export failed: ' + err.message);
    }
  };

  const canEdit = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!engagement) {
    return (
      <div className="text-center py-20 text-slate-500 dark:text-slate-400">
        Engagement not found
      </div>
    );
  }

  const typeColors = { Active: 'success', Internal: 'info', Training: 'warning', Product: 'purple' };
  const statusColors = {
    'In Progress': 'info',
    'On Hold': 'warning',
    Completed: 'success',
    'Not Started': 'default',
    Cancelled: 'danger',
  };
  const priorityColors = {
    High: 'danger',
    Medium: 'warning',
    Low: 'info',
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition resize-none';

  const project = engagement.project;
  const tasks = project?.tasks || [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ===== HEADER ACTIONS ===== */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        >
          ← Back
        </button>

        <div className="flex flex-wrap gap-2">
          {canEdit && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition"
            >
              ✏️ Edit Sheet
            </button>
          )}

          {editing && (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : '✓ Save'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  load();
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition"
              >
                Cancel
              </button>
            </>
          )}

          {!editing && (
            <>
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="px-4 py-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-500/20 transition disabled:opacity-50"
              >
                {exporting ? '⏳ Exporting...' : '📄 Export PDF'}
              </button>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold rounded-xl border border-emerald-200 dark:border-emerald-500/20 transition"
              >
                📊 Export Excel
              </button>
            </>
          )}
        </div>
      </div>

      {/* ================= PRINTABLE AREA ================= */}
      <div
        ref={printRef}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant={typeColors[engagement.type] || 'info'}>{engagement.type}</Badge>
            <Badge variant={statusColors[engagement.status] || 'default'}>{engagement.status}</Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {project?.name || engagement.name.replace(' — Engagement', '')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Client:{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {engagement.client || project?.client || '—'}
            </span>
          </p>

          {/* Overview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl mt-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Manager
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {(engagement.manager?.name || 'U').charAt(0)}
                </div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {engagement.manager?.name || 'Unassigned'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Team
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {engagement.team?.length || 0} members
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Start
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {engagement.startDate
                  ? new Date(engagement.startDate).toLocaleDateString()
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                End
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {engagement.endDate ? new Date(engagement.endDate).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                Overall Progress
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {engagement.progress}%
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${engagement.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      {engagement.team && engagement.team.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            👥 Team Members
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {engagement.team.length}
            </span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {engagement.team.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {m.name
                    .split(' ')
                    .map((x) => x[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {m.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {m.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TASKS & WORK ASSIGNMENT ================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          ✓ Tasks & Work Assignment
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {tasks.length}
          </span>
        </h3>

        {tasks.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No tasks assigned to this project yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Deadline
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t, i) => (
                  <tr
                    key={t.id}
                    className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition"
                  >
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-500">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[220px]">
                        {t.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {(t.assignee?.name || 'U').charAt(0)}
                        </div>
                        <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
                          {t.assignee?.name || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={priorityColors[t.priority] || 'default'} size="sm">
                        {t.priority || 'Medium'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[t.status] || 'default'} size="sm">
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {t.progress || 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {t.deadline ? new Date(t.deadline).toLocaleDateString() : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= EDIT MODE ONLY: Scope/Objectives/Resources/Notes ================= */}
      {editing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              key: 'scope',
              label: 'Scope of Work',
              icon: '🎯',
              placeholder: 'What work is included in this engagement...',
            },
            {
              key: 'objectives',
              label: 'Objectives',
              icon: '🏆',
              placeholder: 'Goals and expected outcomes...',
            },
            {
              key: 'resources',
              label: 'Resources',
              icon: '🛠️',
              placeholder: 'Technologies, tools, resources needed...',
            },
            {
              key: 'notes',
              label: 'Additional Notes',
              icon: '📝',
              placeholder: 'Extra details...',
            },
          ].map((field) => (
            <div
              key={field.key}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{field.icon}</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  {field.label}
                </h3>
              </div>
              <textarea
                rows="4"
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EngagementSheet;