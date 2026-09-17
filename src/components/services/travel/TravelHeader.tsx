'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Compass, Bus, Plane, Building, Car } from 'lucide-react';
import { TRAVEL_TABS, type TravelTabCategory } from '@/types/travel';
import { cn } from '@/lib/utils';

export type TravelViewRole = 'passenger' | 'partner';

interface TravelHeaderProps {
  currentRole: TravelViewRole;
  onRoleChange: (role: TravelViewRole) => void;
  activeTab: TravelTabCategory;
  onTabSelect: (tab: TravelTabCategory) => void;
  onLockedTabClick: (tab: { id: string; labelTr: string; iconEmoji: string }) => void;
}

const TAB_ICONS: Record<string, React.ReactNode> = {
  bus: <Bus className="h-3.5 w-3.5" />,
  flight: <Plane className="h-3.5 w-3.5" />,
  hotel: <Building className="h-3.5 w-3.5" />,
  car_rental: <Car className="h-3.5 w-3.5" />,
};

export function TravelHeader({
  currentRole,
  onRoleChange,
  activeTab,
  onTabSelect,
  onLockedTabClick,
}: TravelHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-20 border-b border-border/70 bg-background/90 px-4 pt-3.5 pb-2.5 backdrop-blur-md transition-colors sm:px-6">
      <div className="flex items-center justify-between gap-3">
        {/* Back Button & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.push('/services')}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
            aria-label="Hizmetlere Dön"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-xs">
            <Compass className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Seyahat
              </h1>
              <span className="hidden sm:inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {currentRole === 'passenger' ? 'Yolcu' : 'Firma Paneli'}
              </span>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Otobüs, Uçak, Otel ve Araç Kiralama
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Yolcu / Firma Paneli */}
        <div className="flex items-center rounded-xl border border-border/80 bg-muted/40 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => onRoleChange('passenger')}
            className={cn(
              'rounded-lg px-3 py-1 font-semibold transition-all',
              currentRole === 'passenger'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Yolcu
          </button>
          <button
            type="button"
            onClick={() => onRoleChange('partner')}
            className={cn(
              'rounded-lg px-3 py-1 font-semibold transition-all',
              currentRole === 'partner'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Firma Paneli
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      {currentRole === 'passenger' && (
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {TRAVEL_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = TAB_ICONS[tab.id] || <Compass className="h-3.5 w-3.5" />;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.isActive) {
                    onTabSelect(tab.id);
                  } else {
                    onLockedTabClick(tab);
                  }
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-transparent'
                )}
              >
                {Icon}
                <span>{tab.labelTr}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

