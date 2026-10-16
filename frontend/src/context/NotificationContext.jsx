import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevUnreadRef = useRef(0);
  const audioRef = useRef(null);

  // Init beep sound
  useEffect(() => {
    // Simple beep using Web Audio API (no external file)
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioRef.current = ctx;
  }, []);

  const playSound = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return;
    try {
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  }, [soundEnabled]);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('dms_token');
    if (!token) return;
    try {
      const data = await api.getNotifications();
      const unread = data.filter((n) => !n.isRead).length;

      if (unread > prevUnreadRef.current && prevUnreadRef.current !== 0) {
        playSound();
      }
      prevUnreadRef.current = unread;
      setNotifications(data);
      setUnreadCount(unread);
    } catch (e) {}
  }, [playSound]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        playSound,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);