'use client';

import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Settings, 
  CalendarDays, 
  Briefcase, 
  Heart, 
  LogOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderUserMenuProps {
  user: any;
  userInitials: string;
  dashboardLink: string;
  onLogout: () => void;
}

export default function HeaderUserMenu({
  user,
  userInitials,
  dashboardLink,
  onLogout
}: HeaderUserMenuProps) {
  if (!user) {
    return (
      <div className="hidden sm:flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="rounded-full text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] h-9 px-4">
            Log in
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm" className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium h-9 px-5 transition-colors">
            Sign up
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="User account menu"
          title={user.first_name ? `${user.first_name}'s account` : 'Account menu'}
          className="hidden sm:flex items-center justify-center size-9 rounded-full border border-[#E8E2D9] hover:border-[#9E5338]/60 bg-white hover:bg-[#FAF7F2] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9E5338]/20 group p-0.5 shadow-xs"
        >
          <Avatar className="size-8 ring-1 ring-[#E8E2D9]/60 transition-transform duration-150 group-hover:scale-105">
            {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.first_name || 'User avatar'} />}
            <AvatarFallback className="bg-[#9E5338] text-white text-xs font-serif font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl bg-white border border-[#E8E2D9] shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Account Details Header */}
        <div className="px-3 py-2.5 border-b border-[#E8E2D9]/80 bg-[#FAF7F2] rounded-xl mb-1">
          <p className="text-xs font-bold text-[#221F1C] truncate">
            {user.first_name ? `${user.first_name} ${user.last_name || ''}` : (user.business_name || user.email)}
          </p>
          <p className="text-[11px] text-[#6B6560] truncate">{user.email}</p>
          <div className="mt-1.5">
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#F3EADF] text-[#9E5338]">
              {user.role === 'vendor' ? (user.vendor?.is_verified || user.is_verified ? 'Verified Partner' : 'Creative Partner') : 'Customer Host'}
            </span>
          </div>
        </div>

        {/* Main Dashboard / Overview */}
        <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] cursor-pointer">
          <Link href={dashboardLink} className="flex items-center gap-2.5 w-full">
            <LayoutDashboard className="size-4 text-[#9E5338]" />
            <span>{user.role === 'vendor' ? 'Vendor Portal (Overview)' : 'Main Dashboard'}</span>
          </Link>
        </DropdownMenuItem>

        {/* Profile & Settings / Business Settings */}
        <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] cursor-pointer">
          <Link 
            href={user.role === 'vendor' ? '/vendor/dashboard?tab=settings' : '/customer/dashboard?tab=profile'} 
            className="flex items-center gap-2.5 w-full"
          >
            <Settings className="size-4 text-[#9E5338]" />
            <span>{user.role === 'vendor' ? 'Business Settings' : 'Profile & Settings'}</span>
          </Link>
        </DropdownMenuItem>

        {/* Calendar / Bookings */}
        <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] cursor-pointer">
          <Link 
            href={user.role === 'vendor' ? '/vendor/dashboard?tab=calendar' : '/customer/dashboard?tab=bookings'} 
            className="flex items-center gap-2.5 w-full"
          >
            <CalendarDays className="size-4 text-[#9E5338]" />
            <span>{user.role === 'vendor' ? 'Booking Calendar' : 'My Bookings'}</span>
          </Link>
        </DropdownMenuItem>

        {/* Manage Services (if vendor) */}
        {user.role === 'vendor' && (
          <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] cursor-pointer">
            <Link href="/vendor/dashboard?tab=services" className="flex items-center gap-2.5 w-full">
              <Briefcase className="size-4 text-[#9E5338]" />
              <span>Manage Services</span>
            </Link>
          </DropdownMenuItem>
        )}

        {/* Saved Favorites */}
        <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] cursor-pointer">
          <Link href="/customer/dashboard?tab=saved" className="flex items-center gap-2.5 w-full">
            <Heart className="size-4 text-[#9E5338]" />
            <span>Saved Pros</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 border-t border-[#E8E2D9]" />

        {/* Logout Option */}
        <DropdownMenuItem 
          onClick={onLogout}
          className="rounded-xl px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 hover:text-rose-800 cursor-pointer flex items-center gap-2.5"
        >
          <LogOut className="size-4 text-rose-600" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
