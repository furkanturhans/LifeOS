'use client';

import React from 'react';
import { ServicesHeader } from './ServicesHeader';
import { ServicesHubGrid } from './ServicesHubGrid';
import { Dock } from '@/components/os/Dock';

export function ServicesScreen() {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Header */}
      <ServicesHeader />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        {/* Simplified 4 Service Cards Grid */}
        <ServicesHubGrid />
      </div>

      {/* Mobile Glass Dock */}
      <Dock />
    </div>
  );
}


