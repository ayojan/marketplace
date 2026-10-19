'use client';

import React from 'react';
import { Bell, MessageCircle, Phone, Mail, Sparkles, ShieldCheck } from 'lucide-react';
import { CustomerProfileData } from './types';

interface CustomerNotificationSettingsProps {
  data: CustomerProfileData;
  onChange: (updated: Partial<CustomerProfileData>) => void;
}

export default function CustomerNotificationSettings({
  data,
  onChange,
}: CustomerNotificationSettingsProps) {
  const notifications = data.notifications || {
    whatsapp: true,
    sms: true,
    email: true,
    marketing: false,
  };

  const toggleNotification = (key: keyof CustomerProfileData['notifications']) => {
    onChange({
      notifications: {
        ...notifications,
        [key]: !notifications[key],
      },
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center">
              <Bell className="size-4" />
            </span>
            <h3 className="font-serif font-bold text-lg text-[#221F1C]">
              Communication &amp; Alert Channels
            </h3>
          </div>
          <p className="text-xs text-[#6B6560] mt-1">
            Choose where you receive instant date availability responses, quote reviews, and booking contracts
          </p>
        </div>

        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
          <ShieldCheck className="size-3 text-emerald-600" /> Spam-Free Guarantee
        </span>
      </div>

      <div className="space-y-4">
        {/* WhatsApp Alerts */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="size-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <MessageCircle className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-[#221F1C]">WhatsApp Celebration Alerts</h4>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">Recommended</span>
              </div>
              <p className="text-xs text-[#6B6560] mt-0.5 leading-relaxed">
                Receive instant WhatsApp alerts when studios respond to inquiries, confirm dates, or send revised quotes.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={notifications.whatsapp}
              onChange={() => toggleNotification('whatsapp')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9E5338]"></div>
          </label>
        </div>

        {/* SMS Critical Reminders */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="size-10 rounded-xl bg-[#F3EADF] text-[#9E5338] flex items-center justify-center shrink-0">
              <Phone className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#221F1C]">SMS Milestone Notifications</h4>
              <p className="text-xs text-[#6B6560] mt-0.5 leading-relaxed">
                Critical payment receipts, official booking OTPs, and event day execution reminders 48 hours in advance.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={() => toggleNotification('sms')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9E5338]"></div>
          </label>
        </div>

        {/* Email Contracts */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="size-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Mail className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#221F1C]">Email Invoices &amp; PDF Contracts</h4>
              <p className="text-xs text-[#6B6560] mt-0.5 leading-relaxed">
                Complete printable service contracts, deliverable breakdown PDFs, and tax invoices delivered straight to your inbox.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={() => toggleNotification('email')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9E5338]"></div>
          </label>
        </div>

        {/* Marketing / Trending Inspiration */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="size-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#221F1C]">Trending Inspiration &amp; Seasonal Partner Highlights</h4>
              <p className="text-xs text-[#6B6560] mt-0.5 leading-relaxed">
                Occasional digests showcasing newly verified artists, decor ideas, and regional vendor offers.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={notifications.marketing}
              onChange={() => toggleNotification('marketing')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9E5338]"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
