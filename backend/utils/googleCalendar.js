const { google } = require('googleapis');
const { encrypt, decrypt } = require('./crypto');

const getOAuthClient = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT
  );

// ========== CREATE MEETING + AUTO-GENERATE GOOGLE MEET LINK ==========
const pushMeetingToGoogle = async (encryptedRefreshToken, meeting) => {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ refresh_token: decrypt(encryptedRefreshToken) });
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const start = new Date(meeting.date);
  if (meeting.time) {
    const [h, m] = meeting.time.split(':').map(Number);
    start.setHours(h, m, 0, 0);
  }
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const event = {
    summary: meeting.title,
    description: meeting.description || 'Scheduled from DMS Portal',
    location: meeting.location || '',
    start: { dateTime: start.toISOString(), timeZone: 'Asia/Karachi' },
    end: { dateTime: end.toISOString(), timeZone: 'Asia/Karachi' },
    // 👇 AUTO-GENERATES GOOGLE MEET LINK
    conferenceData: {
      createRequest: {
        requestId: `dms-meet-${meeting.id}-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 15 },
        { method: 'email', minutes: 30 },
      ],
    },
  };

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    conferenceDataVersion: 1, // ← Required for Google Meet
  });

  return res.data;
};

// ========== UPDATE EVENT ==========
const updateGoogleEvent = async (encryptedRefreshToken, eventId, meeting) => {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ refresh_token: decrypt(encryptedRefreshToken) });
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const start = new Date(meeting.date);
  if (meeting.time) {
    const [h, m] = meeting.time.split(':').map(Number);
    start.setHours(h, m, 0, 0);
  }
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  await calendar.events.update({
    calendarId: 'primary',
    eventId,
    requestBody: {
      summary: meeting.title,
      description: meeting.description || '',
      location: meeting.location || '',
      start: { dateTime: start.toISOString(), timeZone: 'Asia/Karachi' },
      end: { dateTime: end.toISOString(), timeZone: 'Asia/Karachi' },
    },
  });
};

// ========== DELETE EVENT ==========
const deleteGoogleEvent = async (encryptedRefreshToken, eventId) => {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ refresh_token: decrypt(encryptedRefreshToken) });
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  await calendar.events.delete({ calendarId: 'primary', eventId });
};

// ========== FETCH UPCOMING ==========
const fetchUpcomingEvents = async (encryptedRefreshToken) => {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ refresh_token: decrypt(encryptedRefreshToken) });
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    timeMax: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    maxResults: 100,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return res.data.items || [];
};

module.exports = {
  getOAuthClient,
  pushMeetingToGoogle,
  updateGoogleEvent,
  deleteGoogleEvent,
  fetchUpcomingEvents,
};