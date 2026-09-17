'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Bus,
  MapPin,
  Calendar,
  LayoutGrid,
} from 'lucide-react';
import { CompanyProfileSection } from './CompanyProfileSection';
import { VehiclesSection } from './VehiclesSection';
import { RoutesSection } from './RoutesSection';
import { TripsSection } from './TripsSection';
import { SeatPlansSection } from './SeatPlansSection';
import { cn } from '@/lib/utils';

type PartnerTab = 'firmam' | 'araclar' | 'rotalar' | 'seferler' | 'koltuk_planlari';

const PARTNER_TABS: { id: PartnerTab; labelTr: string; icon: React.ReactNode }[] = [
  { id: 'firmam', labelTr: 'Firmam', icon: <Building2 className="h-4 w-4" /> },
  { id: 'araclar', labelTr: 'Araçlar', icon: <Bus className="h-4 w-4" /> },
  { id: 'rotalar', labelTr: 'Rotalar', icon: <MapPin className="h-4 w-4" /> },
  { id: 'seferler', labelTr: 'Seferler', icon: <Calendar className="h-4 w-4" /> },
  { id: 'koltuk_planlari', labelTr: 'Koltuk Planları', icon: <LayoutGrid className="h-4 w-4" /> },
];

export function TravelPartnerDashboard() {
  const [activeTab, setActiveTab] = useState<PartnerTab>('firmam');

  return (
    <div className="mx-4 mt-5 space-y-5">
      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar rounded-2xl bg-muted/60 p-1.5">
        {PARTNER_TABS.map((tab) => {
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                isSelected
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.icon}
              <span>{tab.labelTr}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active Section */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'firmam' && <CompanyProfileSection />}
        {activeTab === 'araclar' && <VehiclesSection />}
        {activeTab === 'rotalar' && <RoutesSection />}
        {activeTab === 'seferler' && <TripsSection />}
        {activeTab === 'koltuk_planlari' && <SeatPlansSection />}
      </motion.div>
    </div>
  );
}
