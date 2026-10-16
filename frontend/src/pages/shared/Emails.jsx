// import React, { useState, useEffect } from 'react';
// import { Badge } from '../../components/Badge';
// import { useNavigate } from 'react-router-dom';
// import { api } from '../../services/apiClient';

// const Emails = ({ role = 'viewer' }) => {
//   const navigate = useNavigate();
//   const [category, setCategory] = useState('all');
//   const [search, setSearch] = useState('');
//   const [emails, setEmails] = useState([]);
//   const [counts, setCounts] = useState({ all: 0, Work: 0, Leads: 0, Meetings: 0, Junk: 0, unread: 0 });
//   const [loading, setLoading] = useState(true);

//   const fetchEmails = async () => {
//     try {
//       const params = {};
//       if (category !== 'all') params.category = category;
//       if (search) params.search = search;

//       const [emailsData, countsData] = await Promise.all([
//         api.getEmails(params),
//         api.getEmailCounts(),
//       ]);
//       setEmails(emailsData);
//       setCounts(countsData);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const timer = setTimeout(fetchEmails, search ? 300 : 0);
//     return () => clearTimeout(timer);
//   }, [category, search]);

//   const handleOpen = async (id) => {
//     await api.markEmailRead(id, true);
//     navigate(`/superadmin/emails/${id}`);
//   };

//   const handleToggleRead = async (e, id, current) => {
//     e.stopPropagation();
//     await api.markEmailRead(id, !current);
//     fetchEmails();
//   };

//   const handleToggleStar = async (e, id, current) => {
//     e.stopPropagation();
//     await api.starEmail(id, !current);
//     fetchEmails();
//   };

//   const handleDelete = async (e, id) => {
//     e.stopPropagation();
//     if (!confirm('Delete this email?')) return;
//     await api.deleteEmail(id);
//     fetchEmails();
//   };

//   const categoryColors = { Work: 'info', Leads: 'purple', Meetings: 'success', Junk: 'default' };

//   const categories = [
//     { key: 'all', label: 'Inbox', icon: '📥', count: counts.all },
//     { key: 'Work', label: 'Work', icon: '💼', count: counts.Work },
//     { key: 'Leads', label: 'Leads', icon: '📞', count: counts.Leads },
//     { key: 'Meetings', label: 'Meetings', icon: '📅', count: counts.Meetings },
//     { key: 'Junk', label: 'Junk', icon: '🚫', count: counts.Junk },
//   ];

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Email Management</h1>
//           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
//             {counts.unread > 0 ? `${counts.unread} unread emails` : 'All caught up'}
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={() => navigate('/superadmin/emails/templates')}
//             className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition"
//           >
//             📄 Templates
//           </button>
//           {role === 'superadmin' && (
//             <button
//               onClick={() => navigate('/superadmin/emails/compose')}
//               className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
//             >
//               ✍️ Compose
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
//         {/* Sidebar */}
//         <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm h-fit">
//           <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-3">Categories</p>
//           <div className="space-y-1">
//             {categories.map(c => (
//               <button
//                 key={c.key}
//                 onClick={() => setCategory(c.key)}
//                 className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
//                   category === c.key
//                     ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm font-medium'
//                     : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
//                 }`}
//               >
//                 <span className="flex items-center gap-2.5">
//                   <span className="text-base">{c.icon}</span>
//                   <span>{c.label}</span>
//                 </span>
//                 <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
//                   category === c.key
//                     ? 'bg-blue-500 text-white'
//                     : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
//                 }`}>{c.count}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Email List */}
//         <div className="lg:col-span-3 space-y-4">
//           {/* Search */}
//           <div className="relative">
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search emails..."
//               className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
//             />
//             <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
//           </div>

//           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
//             {emails.length === 0 ? (
//               <div className="py-20 text-center">
//                 <p className="text-4xl mb-3">📭</p>
//                 <p className="text-slate-500 dark:text-slate-400 text-sm">
//                   {search ? 'No emails match your search' : 'No emails in this category'}
//                 </p>
//               </div>
//             ) : (
//               emails.map(e => (
//                 <div
//                   key={e.id}
//                   onClick={() => handleOpen(e.id)}
//                   className={`group flex items-start gap-3 md:gap-4 px-4 md:px-5 py-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors ${
//                     !e.isRead ? 'bg-blue-50/40 dark:bg-blue-500/5' : ''
//                   }`}
//                 >
//                   <button
//                     onClick={(ev) => handleToggleStar(ev, e.id, e.isStarred)}
//                     className="text-lg shrink-0 transition-transform hover:scale-125"
//                   >
//                     {e.isStarred ? '⭐' : '☆'}
//                   </button>
//                   <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
//                     {e.from.charAt(0).toUpperCase()}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 mb-1 flex-wrap">
//                       <p className={`text-sm truncate ${!e.isRead ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
//                         {e.from}
//                       </p>
//                       <Badge variant={categoryColors[e.category] || 'default'} size="sm">{e.category}</Badge>
//                       {!e.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>}
//                     </div>
//                     <p className={`text-sm mb-1 truncate ${!e.isRead ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
//                       {e.subject}
//                     </p>
//                     <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{e.body}</p>
//                   </div>
//                   <div className="flex flex-col items-end gap-2 shrink-0">
//                     <p className="text-[11px] text-slate-500 dark:text-slate-500 font-medium whitespace-nowrap">
//                       {new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                     </p>
//                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                       <button
//                         onClick={(ev) => handleToggleRead(ev, e.id, e.isRead)}
//                         className="w-6 h-6 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs"
//                         title={e.isRead ? 'Mark unread' : 'Mark read'}
//                       >
//                         {e.isRead ? '📩' : '📧'}
//                       </button>
//                       <button
//                         onClick={(ev) => handleDelete(ev, e.id)}
//                         className="w-6 h-6 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 flex items-center justify-center text-xs"
//                         title="Delete"
//                       >
//                         🗑️
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Emails;




import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/Badge';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/apiClient';

const Emails = ({ role = 'viewer' }) => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [emails, setEmails] = useState([]);
  const [counts, setCounts] = useState({ all: 0, Work: 0, Leads: 0, Meetings: 0, Junk: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const fetchEmails = async () => {
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (search) params.search = search;

      const [emailsData, countsData] = await Promise.all([
        api.getEmails(params),
        api.getEmailCounts(),
      ]);
      setEmails(emailsData);
      setCounts(countsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchEmails, search ? 300 : 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search]);

  // 🔄 Refresh Inbox — manual IMAP fetch
  const handleRefreshInbox = async () => {
    setFetching(true);
    try {
      const result = await api.fetchEmailsNow();
      await fetchEmails();
      // Optional toast/alert
      // alert(result.message);
    } catch (err) {
      alert('❌ ' + err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleOpen = async (id) => {
    await api.markEmailRead(id, true);
    navigate(`/superadmin/emails/${id}`);
  };

  const handleToggleRead = async (e, id, current) => {
    e.stopPropagation();
    await api.markEmailRead(id, !current);
    fetchEmails();
  };

  const handleToggleStar = async (e, id, current) => {
    e.stopPropagation();
    await api.starEmail(id, !current);
    fetchEmails();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this email?')) return;
    await api.deleteEmail(id);
    fetchEmails();
  };

  const categoryColors = { Work: 'info', Leads: 'purple', Meetings: 'success', Junk: 'default' };

  const categories = [
    { key: 'all', label: 'Inbox', icon: '📥', count: counts.all },
    { key: 'Work', label: 'Work', icon: '💼', count: counts.Work },
    { key: 'Leads', label: 'Leads', icon: '📞', count: counts.Leads },
    { key: 'Meetings', label: 'Meetings', icon: '📅', count: counts.Meetings },
    { key: 'Junk', label: 'Junk', icon: '🚫', count: counts.Junk },
  ];

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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Email Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {counts.unread > 0 ? `${counts.unread} unread emails` : 'All caught up'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* 🔄 Refresh Inbox */}
          <button
            onClick={handleRefreshInbox}
            disabled={fetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-semibold rounded-xl border border-purple-200 dark:border-purple-500/20 transition disabled:opacity-50"
            title="Fetch new emails from Gmail"
          >
            {fetching ? (
              <>
                <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
                Fetching...
              </>
            ) : (
              <>🔄 Refresh Inbox</>
            )}
          </button>

          <button
            onClick={() => navigate('/superadmin/emails/templates')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition"
          >
            📄 Templates
          </button>

          {role === 'superadmin' && (
            <button
              onClick={() => navigate('/superadmin/emails/compose')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              ✍️ Compose
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm h-fit">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-3">Categories</p>
          <div className="space-y-1">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                  category === c.key
                    ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">{c.icon}</span>
                  <span>{c.label}</span>
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    category === c.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Email List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {emails.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {search ? 'No emails match your search' : 'No emails in this category'}
                </p>
                {!search && (
                  <button
                    onClick={handleRefreshInbox}
                    disabled={fetching}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                  >
                    {fetching ? '⏳ Fetching...' : '🔄 Refresh Inbox'}
                  </button>
                )}
              </div>
            ) : (
              emails.map((e) => (
                <div
                  key={e.id}
                  onClick={() => handleOpen(e.id)}
                  className={`group flex items-start gap-3 md:gap-4 px-4 md:px-5 py-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors ${
                    !e.isRead ? 'bg-blue-50/40 dark:bg-blue-500/5' : ''
                  }`}
                >
                  <button
                    onClick={(ev) => handleToggleStar(ev, e.id, e.isStarred)}
                    className="text-lg shrink-0 transition-transform hover:scale-125"
                  >
                    {e.isStarred ? '⭐' : '☆'}
                  </button>
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {e.from.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p
                        className={`text-sm truncate ${
                          !e.isRead
                            ? 'font-bold text-slate-900 dark:text-slate-100'
                            : 'font-medium text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {e.from}
                      </p>
                      <Badge variant={categoryColors[e.category] || 'default'} size="sm">
                        {e.category}
                      </Badge>
                      {!e.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>}
                    </div>
                    <p
                      className={`text-sm mb-1 truncate ${
                        !e.isRead
                          ? 'font-semibold text-slate-900 dark:text-slate-100'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {e.subject}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{e.body}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 font-medium whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(ev) => handleToggleRead(ev, e.id, e.isRead)}
                        className="w-6 h-6 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs"
                        title={e.isRead ? 'Mark unread' : 'Mark read'}
                      >
                        {e.isRead ? '📩' : '📧'}
                      </button>
                      <button
                        onClick={(ev) => handleDelete(ev, e.id)}
                        className="w-6 h-6 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 flex items-center justify-center text-xs"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emails;