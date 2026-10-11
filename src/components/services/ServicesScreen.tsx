'use client';

import React from 'react';
import { ServicesHeader } from './ServicesHeader';
import { ServicesHubGrid } from './ServicesHubGrid';
import { Dock } from '@/components/os/Dock';
import Link from 'next/link';
import { ShieldCheck, MessageCircle, Wallet } from 'lucide-react';
import { useLocaleRender } from '@/lib/i18n/runtime';

export function ServicesScreen() {
  const l=useLocaleRender();
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Header */}
      <ServicesHeader />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        {/* Simplified 4 Service Cards Grid */}
        <ServicesHubGrid />
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-2 px-4 pb-6">{[{href:'/profile/professions',label:'Meslek ve Yetkilerim',icon:ShieldCheck},{href:'/chat',label:'Lifechat',icon:MessageCircle},{href:'/finance',label:'Finans',icon:Wallet}].map(item=><Link key={item.href} href={item.href} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl bg-muted/40 px-2 text-center text-xs"><item.icon className="h-5 w-5 text-primary"/>{l(item.label)}</Link>)}</div>
      </div>

      {/* Mobile Glass Dock */}
      <Dock />
    </div>
  );
}


