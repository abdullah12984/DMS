const express = require('express');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');
const { encrypt } = require('../utils/crypto');
const { getOAuthClient, fetchUpcomingEvents } = require('../utils/googleCalendar');
const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dms_super_secret_key_change_this';

router.get('/google/start', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).json({ error: 'No token' });

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.id;
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const oauth2Client = getOAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    state: Buffer.from(JSON.stringify({ userId })).toString('base64'),
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid',
    ],
  });

  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) {
    return res.redirect(`${process.env.FRONTEND_URL}/superadmin/settings?calendar=error`);
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    await prisma.user.update({
      where: { id: userId },
      data: {
        googleCalendarRefreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
        googleCalendarConnected: true,
        googleCalendarEmail: profile.email,
      },
    });

    res.redirect(`${process.env.FRONTEND_URL}/superadmin/settings?calendar=connected`);
  } catch (err) {
    console.error('Calendar OAuth error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/superadmin/settings?calendar=error`);
  }
});

router.get('/status', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { googleCalendarConnected: true, googleCalendarEmail: true },
    });
    res.json({
      connected: user?.googleCalendarConnected || false,
      email: user?.googleCalendarEmail || null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/disconnect', verifyToken, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        googleCalendarRefreshToken: null,
        googleCalendarConnected: false,
        googleCalendarEmail: null,
      },
    });
    res.json({ message: 'Disconnected' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/events', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user.googleCalendarConnected || !user.googleCalendarRefreshToken) {
      return res.status(400).json({ error: 'Calendar not connected' });
    }
    const events = await fetchUpcomingEvents(user.googleCalendarRefreshToken);
    res.json(events);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;