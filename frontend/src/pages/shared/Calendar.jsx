// import React, { useState, useEffect } from 'react';
// import { Badge } from '../../components/Badge';
// import { useNavigate } from 'react-router-dom';
// import { api } from '../../services/api';

// const Calendar = ({ role = 'viewer' }) => {
//   const canCreate = role === 'superadmin';
//   const navigate = useNavigate();
//   const [meetings, setMeetings] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api.getMeetings().then(setMeetings).catch(console.error).finally(() => setLoading(false));
//   }, []);

//   const today = new Date();
//   const currentMonth = today.getMonth();
//   const currentYear = today.getFullYear();
//   const firstDay = new Date(currentYear, currentMonth, 1).getDay();
//   const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

//   const hasMeetingOn = (day) => meetings.some(m => {
//     const d = new Date(m.date);
//     return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
//   });

//   const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   const upcoming = meetings
//     .filter(m => new Date(m.date) >= new Date())
//     .sort((a, b) => new Date(a.date) - new Date(b.date))
//     .slice(0, 5);

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Calendar & Meetings</h1>
//           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Upcoming meetings and events</p>
//         </div>
//         {canCreate && (
//           <button
//             onClick={() => navigate('/superadmin/calendar/new')}
//             className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
//           >
//             <span className="text-base">+</span> New Meeting
//           </button>
//         )}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//         {/* Calendar */}
//         <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
//               {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
//             </h3>
//             <div className="flex gap-1">
//               <button className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition">‹</button>
//               <button className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition">›</button>
//             </div>
//           </div>

//           <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
//             {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
//               <div key={i} className="text-center text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-2">
//                 <span className="hidden md:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</span>
//                 <span className="md:hidden">{d}</span>
//               </div>
//             ))}
//           </div>
//           <div className="grid grid-cols-7 gap-1 md:gap-2">
//             {Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} className="aspect-square"></div>)}
//             {Array.from({ length: daysInMonth }, (_, i) => {
//               const day = i + 1;
//               const isToday = day === today.getDate();
//               const hasEvent = hasMeetingOn(day);
//               return (
//                 <div
//                   key={day}
//                   className={`aspect-square flex flex-col items-center justify-center text-xs md:text-sm rounded-lg md:rounded-xl relative transition-all cursor-pointer ${
//                     isToday
//                       ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold shadow-lg shadow-blue-500/30'
//                       : hasEvent
//                       ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20'
//                       : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
//                   }`}
//                 >
//                   {day}
//                   {hasEvent && !isToday && (
//                     <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400"></span>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Upcoming */}
//         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
//           <div className="flex items-center justify-between mb-5">
//             <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Upcoming</h3>
//             <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
//               {upcoming.length} events
//             </span>
//           </div>
//           {upcoming.length === 0 ? (
//             <div className="text-center py-12">
//               <p className="text-4xl mb-3">📅</p>
//               <p className="text-xs text-slate-500 dark:text-slate-400">No upcoming meetings</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {upcoming.map(m => (
//                 <div key={m.id} className="relative bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 transition-all">
//                   <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${m.client ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
//                   <div className="pl-3">
//                     <div className="flex items-start justify-between gap-2 mb-1.5">
//                       <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">{m.title}</p>
//                       <Badge variant={m.client ? 'purple' : 'info'} size="sm">{m.client ? 'Client' : 'Internal'}</Badge>
//                     </div>
//                     <p className="text-xs text-slate-500 dark:text-slate-400">
//                       {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {formatTime(m.date)}
//                     </p>
//                     {m.participants?.length > 0 && (
//                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">👥 {m.participants.length} attendees</p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Calendar;





import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/Badge';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const Calendar = ({ role = 'viewer' }) => {
  const canCreate = role === 'superadmin';
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => {
    api.getMeetings().then(setMeetings).catch(console.error).finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const getMeetingsOn = (day) =>
    meetings.filter((m) => {
      const d = new Date(m.date);
      return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

  const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const handleDayClick = (day) => {
    const dayMeetings = getMeetingsOn(day);
    if (dayMeetings.length === 0) return;
    setSelectedDate(day);
    setSelectedMeeting(dayMeetings[0]); // auto-select first meeting
  };

  const downloadICS = async (meetingId, title) => {
    try {
      const token = localStorage.getItem('dms_token');
      const res = await fetch(`http://localhost:5000/api/meetings/${meetingId}/ics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to download');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download .ics');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const upcoming = meetings
    .filter((m) => new Date(m.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 6);

  const selectedDayMeetings = selectedDate ? getMeetingsOn(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Calendar & Meetings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Click any date to see meetings
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('/superadmin/calendar/new')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <span className="text-base">+</span> New Meeting
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-1">
              <button className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition">
                ‹
              </button>
              <button className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition">
                ›
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div
                key={i}
                className="text-center text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-2"
              >
                <span className="hidden md:inline">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
                </span>
                <span className="md:hidden">{d}</span>
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const isToday = day === today.getDate();
              const isSelected = day === selectedDate;
              const dayMeetings = getMeetingsOn(day);
              const hasMeetings = dayMeetings.length > 0;

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  disabled={!hasMeetings}
                  className={`aspect-square flex flex-col items-center justify-center text-xs md:text-sm rounded-lg md:rounded-xl relative transition-all ${
                    isSelected
                      ? 'bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/30'
                      : isToday
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold shadow-lg shadow-blue-500/30'
                      : hasMeetings
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20 cursor-pointer'
                      : 'text-slate-700 dark:text-slate-300 cursor-default'
                  }`}
                >
                  {day}
                  {hasMeetings && !isToday && !isSelected && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {dayMeetings.slice(0, 3).map((_, idx) => (
                        <span key={idx} className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                      ))}
                    </div>
                  )}
                  {hasMeetings && (isToday || isSelected) && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {dayMeetings.slice(0, 3).map((_, idx) => (
                        <span key={idx} className="w-1 h-1 rounded-full bg-white/80"></span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Has meetings
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-300"></span> Today
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> Selected
            </div>
          </div>
        </div>

        {/* Selected Date Panel / Upcoming */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          {selectedDate ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedDayMeetings.length} meeting{selectedDayMeetings.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedDate(null); setSelectedMeeting(null); }}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {selectedDayMeetings.map((m) => {
                  const isActive = selectedMeeting?.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMeeting(m)}
                      className={`rounded-xl border p-4 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {m.title}
                        </p>
                        <Badge variant={m.client ? 'purple' : 'info'} size="sm">
                          {m.client ? 'Client' : 'Internal'}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        ⏰ {m.time || 'Anytime'}
                      </p>

                      {m.participants?.length > 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          👥 {m.participants.length} participant{m.participants.length !== 1 ? 's' : ''}
                        </p>
                      )}

                      {m.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                          {m.description}
                        </p>
                      )}

                      {/* Join Link — big and prominent */}
                      {m.link ? (
                        <a
                          href={m.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all mb-2"
                        >
                          📹 Join Meeting
                        </a>
                      ) : (
                        <div className="w-full text-center px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold rounded-lg mb-2">
                          No meeting link
                        </div>
                      )}

                      {/* Secondary actions */}
                      <div className="flex gap-2">
                        {m.googleCalendarLink && (
                          <a
                            href={m.googleCalendarLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-all"
                          >
                            📅 Add to Google
                          </a>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadICS(m.id, m.title); }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-all"
                        >
                          ⬇️ .ics
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Upcoming</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  {upcoming.length} events
                </span>
              </div>

              {upcoming.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📅</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">No upcoming meetings</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        const d = new Date(m.date);
                        setSelectedDate(d.getDate());
                        setSelectedMeeting(m);
                      }}
                      className="relative bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 cursor-pointer transition-all"
                    >
                      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${m.client ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                      <div className="pl-3">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                            {m.title}
                          </p>
                          <Badge variant={m.client ? 'purple' : 'info'} size="sm">
                            {m.client ? 'Client' : 'Internal'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {m.time || formatTime(m.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;