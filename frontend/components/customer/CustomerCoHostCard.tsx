'use client';

import React, { useState } from 'react';
import { Users2, UserPlus, Mail, Heart, Check, X, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CustomerProfileData } from './types';

interface CustomerCoHostCardProps {
  data: CustomerProfileData;
  onChange: (updated: Partial<CustomerProfileData>) => void;
}

export default function CustomerCoHostCard({
  data,
  onChange,
}: CustomerCoHostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [coHostForm, setCoHostForm] = useState({
    name: data.coHost?.name || '',
    email: data.coHost?.email || '',
    relationship: data.coHost?.relationship || 'Partner / Fiancé',
  });

  const hasCoHost = data.coHost && data.coHost.name && data.coHost.status !== 'none';

  const handleSaveCoHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coHostForm.name || !coHostForm.email) {
      toast.error('Please provide name and email for your co-host');
      return;
    }

    onChange({
      coHost: {
        name: coHostForm.name,
        email: coHostForm.email,
        relationship: coHostForm.relationship,
        status: 'invited',
      },
    });
    setIsEditing(false);
    toast.success(`Invitation prepared for ${coHostForm.name}!`);
  };

  const handleRemoveCoHost = () => {
    onChange({
      coHost: {
        name: '',
        email: '',
        relationship: '',
        status: 'none',
      },
    });
    setCoHostForm({ name: '', email: '', relationship: 'Partner / Fiancé' });
    setIsEditing(false);
    toast.info('Co-host removed');
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center">
              <Users2 className="size-4" />
            </span>
            <h3 className="font-serif font-bold text-lg text-[#221F1C]">
              Co-Host &amp; Planning Partner
            </h3>
          </div>
          <p className="text-xs text-[#6B6560] mt-1">
            Invite your partner, fiancé, or family coordinator to review quotes, shortlist studios, and manage calendar slots
          </p>
        </div>

        {!hasCoHost && !isEditing && (
          <Button
            type="button"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold px-4 h-9 shadow-2xs cursor-pointer"
          >
            <UserPlus className="size-3.5 mr-1.5" /> Invite Co-Host
          </Button>
        )}
      </div>

      {hasCoHost && !isEditing ? (
        <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center font-serif font-bold text-[#9E5338] text-lg">
              {data.coHost.name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-sm text-[#221F1C]">
                  {data.coHost.name}
                </h4>
                <span className="text-[10px] font-bold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full">
                  {data.coHost.relationship}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Invited
                </span>
              </div>
              <p className="text-xs text-[#6B6560] mt-0.5 flex items-center gap-1">
                <Mail className="size-3" /> {data.coHost.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold rounded-full border-[#E8E2D9] text-[#221F1C] hover:bg-white"
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveCoHost}
              className="text-xs font-semibold rounded-full text-rose-600 hover:bg-rose-50"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : isEditing ? (
        <form onSubmit={handleSaveCoHost} className="space-y-4 p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9]">
          <h4 className="text-xs font-bold text-[#221F1C] uppercase tracking-wider flex items-center gap-1.5">
            <UserPlus className="size-3.5 text-[#9E5338]" /> Enter Co-Host Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#221F1C] block">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rohan Verma"
                value={coHostForm.name}
                onChange={(e) => setCoHostForm({ ...coHostForm, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E2D9] bg-white text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#221F1C] block">Email Address</label>
              <input
                type="email"
                required
                placeholder="rohan@example.com"
                value={coHostForm.email}
                onChange={(e) => setCoHostForm({ ...coHostForm, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E2D9] bg-white text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#221F1C] block">Role / Relation</label>
              <select
                value={coHostForm.relationship}
                onChange={(e) => setCoHostForm({ ...coHostForm, relationship: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E2D9] bg-white text-[#221F1C] focus:outline-none focus:border-[#9E5338] cursor-pointer"
              >
                <option value="Partner / Fiancé">Partner / Fiancé</option>
                <option value="Spouse">Spouse</option>
                <option value="Family Member">Family Member</option>
                <option value="Event Planner">Event Planner / Coordinator</option>
                <option value="Best Friend">Best Friend / Maid of Honor</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="text-xs rounded-full border-[#E8E2D9]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold px-5"
            >
              Save Co-Host
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-2xl border border-dashed border-[#E8E2D9] bg-[#FAF7F2] text-center space-y-2">
          <p className="text-xs font-semibold text-[#221F1C]">No Co-Host Connected</p>
          <p className="text-xs text-[#6B6560] max-w-md mx-auto">
            Planning a celebration is better together. Invite your partner or family lead to co-manage bookings and contracts.
          </p>
        </div>
      )}
    </div>
  );
}
