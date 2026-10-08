'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '@/lib/api';
import { Bell, Check, CheckCheck, Sparkles, Calendar, Star, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationItem {
  id: number | string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiService.notifications.getAll();
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unread_count || 0);
    } catch (err) {
      // Fallback demo notifications if offline
      setNotifications([
        {
          id: 1,
          title: 'Booking Confirmed!',
          message: 'The Wedding Narratives confirmed your session for Feb 14.',
          notification_type: 'booking_accepted',
          is_read: false,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'New Review Received',
          message: 'Priya Sharma left a 5.0★ rating for your photography service.',
          notification_type: 'review_received',
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
      setUnreadCount(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number | string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await apiService.notifications.markAsRead(id);
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await apiService.notifications.markAllRead();
    } catch (err) {}
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_accepted':
      case 'booking_created':
        return <Calendar className="size-4 text-[#9E5338]" />;
      case 'review_received':
        return <Star className="size-4 text-[#D97706] fill-[#D97706]" />;
      case 'new_message':
        return <MessageSquare className="size-4 text-blue-600" />;
      default:
        return <Sparkles className="size-4 text-[#9E5338]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-[#6B6560] hover:text-[#221F1C] hover:bg-[#F3EADF] transition-colors relative cursor-pointer"
        title="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 size-4 rounded-full bg-[#9E5338] text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E8E2D9] rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-3.5 bg-[#FAF7F2] border-b border-[#E8E2D9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-serif font-bold text-[#221F1C]">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-[#9E5338] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="size-3.5" /> Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#E8E2D9]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[#6B6560] text-xs">
                  No notifications at the moment.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      n.is_read ? 'bg-white opacity-75' : 'bg-[#F3EADF]/40 font-medium'
                    }`}
                  >
                    <div className="size-8 rounded-full bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(n.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-[#221F1C] truncate">{n.title}</p>
                        <span className="text-[9px] text-[#6B6560] shrink-0">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B6560] mt-0.5 leading-snug">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
