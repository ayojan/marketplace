'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, 
  Sparkles, 
  Camera, 
  Calendar as CalendarIcon, 
  Check, 
  X, 
  ShoppingBag, 
  Heart, 
  Star, 
  User, 
  Share2, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CustomerProfileData } from './types';

export const AVATAR_PRESETS = [
  { id: 'couple1', label: 'Wedding Couple', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80' },
  { id: 'bride', label: 'Bridal Portrait', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80' },
  { id: 'groom', label: 'Groom Portrait', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' },
  { id: 'host_woman', label: 'Host (Elegance)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
  { id: 'host_man', label: 'Host (Classic)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 'festive', label: 'Festive Celebration', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80' },
  { id: 'royal', label: 'Royal Heritage', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80' },
  { id: 'minimalist', label: 'Contemporary', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
];

interface CustomerProfileHeaderProps {
  user: any;
  profileData: CustomerProfileData;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAvatarSelect: (url: string) => void;
  bookingsCount: number;
  savedCount: number;
  completionPercentage: number;
}

export default function CustomerProfileHeader({
  user,
  profileData,
  activeTab,
  onTabChange,
  onAvatarSelect,
  bookingsCount,
  savedCount,
  completionPercentage,
}: CustomerProfileHeaderProps) {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');

  const displayName = profileData.coupleName 
    ? profileData.coupleName 
    : user?.first_name 
      ? `${user.first_name} ${user.last_name || ''}`.trim() 
      : 'Celebration Host';

  const userInitial = (user?.first_name?.[0] || displayName[0] || 'H').toUpperCase();

  const daysUntilEvent = React.useMemo(() => {
    if (!profileData.weddingDate) return null;
    const target = new Date(profileData.weddingDate).getTime();
    const today = new Date().getTime();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : diff === 0 ? 0 : null;
  }, [profileData.weddingDate]);

  const handleShareCelebration = async () => {
    const url = typeof window !== 'undefined' ? window.location.origin : '';
    const text = `Planning our ${profileData.eventType || 'celebration'} on Ayoj!`;
    if (navigator.share && navigator.canShare && navigator.canShare({ title: text, url })) {
      try {
        await navigator.share({ title: text, url });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Celebration link copied to clipboard!');
    } catch {
      toast.error('Unable to copy link.');
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm mb-8 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#F3EADF]/60 via-[#FAF7F2]/40 to-transparent rounded-full pointer-events-none -mr-20 -mt-20 blur-2xl" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            {/* Host Avatar with Change Camera Trigger */}
            <div className="relative group shrink-0">
              <div className="size-20 sm:size-24 rounded-full overflow-hidden border-3 border-[#9E5338]/30 bg-[#F3EADF] shadow-sm flex items-center justify-center text-[#9E5338] font-serif font-bold text-3xl">
                {profileData.avatarUrl ? (
                  <Image
                    src={profileData.avatarUrl}
                    alt={displayName}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                title="Change host avatar"
                aria-label="Change host avatar"
                className="absolute bottom-0 right-0 size-7 sm:size-8 rounded-full bg-[#9E5338] text-white flex items-center justify-center shadow-md hover:bg-[#86442B] transition-transform active:scale-95 cursor-pointer border-2 border-white"
              >
                <Camera className="size-3.5 sm:size-4" />
              </button>
            </div>

            {/* Host Details */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E5338] bg-[#F3EADF] px-2.5 py-0.5 rounded-full border border-[#E8E2D9] flex items-center gap-1">
                  <ShieldCheck className="size-3 text-[#9E5338]" /> Verified Host
                </span>
                
                <span className="text-[11px] text-[#6B6560] flex items-center gap-1 bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#E8E2D9]/80 font-medium">
                  <MapPin className="size-3 text-[#9E5338]" /> {profileData.city || 'Delhi NCR'}
                </span>

                {profileData.hashtag && (
                  <span className="text-[11px] font-serif italic text-[#9E5338] font-bold bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#E8E2D9]/80">
                    {profileData.hashtag.startsWith('#') ? profileData.hashtag : `#${profileData.hashtag}`}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#221F1C]">
                {displayName}
              </h1>

              <div className="flex items-center gap-3 text-xs text-[#6B6560] flex-wrap">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5 text-[#9E5338]" />
                  <span>Celebration:</span>
                  <strong className="text-[#221F1C] font-semibold">
                    {profileData.weddingDate
                      ? new Date(profileData.weddingDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Date not set'}
                  </strong>
                </span>

                {daysUntilEvent !== null && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {daysUntilEvent === 0 ? 'Today is the Celebration!' : `${daysUntilEvent} Days To Go`}
                  </span>
                )}

                {profileData.eventType && (
                  <>
                    <span className="text-stone-300">•</span>
                    <span className="font-medium text-[#221F1C]">{profileData.eventType}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Buttons & Completion Badge */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="hidden sm:flex flex-col items-end pr-3 border-r border-[#E8E2D9]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6560]">Profile Ready</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-16 h-2 rounded-full bg-[#E8E2D9] overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                    style={{ width: `${completionPercentage}%` }} 
                  />
                </div>
                <span className="text-xs font-bold text-[#221F1C]">{completionPercentage}%</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShareCelebration}
              className="px-4 py-2 rounded-full border border-[#E8E2D9] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#221F1C] hover:text-[#9E5338] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Share2 className="size-3.5" />
              <span>Share</span>
            </button>

            <Link href="/marketplace">
              <Button 
                size="sm" 
                className="w-full sm:w-auto bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold px-6 h-10 shadow-sm cursor-pointer"
              >
                <Sparkles className="size-3.5 mr-1.5" /> Find Creative Partners
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="mt-8 pt-6 border-t border-[#E8E2D9] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', name: 'Overview', icon: CalendarIcon },
            { id: 'bookings', name: 'My Bookings', icon: ShoppingBag, badge: bookingsCount > 0 ? bookingsCount.toString() : undefined },
            { id: 'saved', name: 'Saved Pros', icon: Heart, badge: savedCount > 0 ? savedCount.toString() : undefined },
            { id: 'reviews', name: 'My Reviews', icon: Star },
            { id: 'profile', name: 'Celebration Passport & Settings', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'profile' && activeTab === 'settings');
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#F3EADF] text-[#9E5338] border border-[#E8E2D9] shadow-2xs'
                    : 'text-[#6B6560] hover:text-[#221F1C] hover:bg-[#FAF7F2]'
                }`}
              >
                <Icon size={15} />
                <span>{tab.name}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-[#9E5338] text-white' : 'bg-[#E8E2D9] text-[#6B6560]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Choose Avatar Modal */}
      {isAvatarModalOpen && (
        <div 
          onClick={() => setIsAvatarModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E8E2D9] space-y-5 animate-in fade-in-0 zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3.5">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#221F1C]">Select Host Avatar</h3>
                <p className="text-xs text-[#6B6560]">Choose a celebration preset or paste an image URL</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="size-8 rounded-full bg-[#FAF7F2] text-[#6B6560] hover:text-[#221F1C] flex items-center justify-center cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = profileData.avatarUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onAvatarSelect(preset.url);
                      setIsAvatarModalOpen(false);
                      toast.success(`Selected "${preset.label}" avatar`);
                    }}
                    className={`group flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all cursor-pointer ${
                      isSelected ? 'border-[#9E5338] bg-[#F3EADF]/60 ring-2 ring-[#9E5338]/30' : 'border-[#E8E2D9] hover:border-[#9E5338]/40 hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="relative size-14 rounded-full overflow-hidden border border-[#E8E2D9]">
                      <Image
                        src={preset.url}
                        alt={preset.label}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#9E5338]/40 flex items-center justify-center">
                          <Check className="size-4 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-[#221F1C] text-center line-clamp-1">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom URL Input */}
            <div className="pt-2 border-t border-[#E8E2D9] space-y-2">
              <label className="text-xs font-bold text-[#221F1C] block">
                Or paste a custom image URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={customAvatarInput}
                  onChange={(e) => setCustomAvatarInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (!customAvatarInput) {
                      toast.error('Please enter an image URL');
                      return;
                    }
                    onAvatarSelect(customAvatarInput);
                    setIsAvatarModalOpen(false);
                    toast.success('Custom avatar saved!');
                  }}
                  className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-xl text-xs font-semibold px-4 cursor-pointer"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
