'use client';

import React from 'react';
import {
  LayoutDashboard,
  Activity,
  History,
  Percent,
  Sparkles,
  GraduationCap,
  Truck,
  BookOpen,
  RotateCcw,
  Wallet,
  FileSpreadsheet,
} from 'lucide-react';
import { useAdminFinanceStore } from '@/stores/useAdminFinanceStore';
import { cn } from '@/lib/utils';
import type { FinanceTabKey } from '@/types/finance';

import { FinanceOverviewView } from './FinanceOverviewView';
import { FinanceTransactionsView } from './FinanceTransactionsView';
import { FinanceCommissionsView } from './FinanceCommissionsView';
import { FinanceSubscriptionsView } from './FinanceSubscriptionsView';
import { FinanceInstructorsView } from './FinanceInstructorsView';
import { FinanceProvidersView } from './FinanceProvidersView';
import { FinanceDigitalProductsView } from './FinanceDigitalProductsView';
import { FinanceRefundsView } from './FinanceRefundsView';
import { FinancePayoutsView } from './FinancePayoutsView';
import { FinanceReportsView } from './FinanceReportsView';

const FINANCE_TABS: {
  id: FinanceTabKey;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'stream', label: 'Gelir Akışı', icon: Activity },
  { id: 'history', label: 'İşlem Geçmişi', icon: History },
  { id: 'commissions', label: 'Komisyonlar', icon: Percent },
  { id: 'subscriptions', label: 'Abonelikler', icon: Sparkles },
  { id: 'instructor_earnings', label: 'Eğitmen Kazançları', icon: GraduationCap },
  { id: 'provider_earnings', label: 'Hizmet Sağlayıcı Kazançları', icon: Truck },
  { id: 'digital_products', label: 'Kitap & Dijital Ürünler', icon: BookOpen },
  { id: 'refunds', label: 'İadeler & Düzeltmeler', icon: RotateCcw },
  { id: 'payouts', label: 'Ödemeler / Hakedişler', icon: Wallet },
  { id: 'reports', label: 'Raporlar', icon: FileSpreadsheet },
];

export function AdminFinanceHub() {
  const { activeFinanceTab, setActiveFinanceTab } = useAdminFinanceStore();

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-border/80 pb-2">
        {FINANCE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFinanceTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveFinanceTab(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Sub-View Rendering */}
      <div>
        {activeFinanceTab === 'overview' && <FinanceOverviewView />}
        {(activeFinanceTab === 'stream' || activeFinanceTab === 'history') && <FinanceTransactionsView />}
        {activeFinanceTab === 'commissions' && <FinanceCommissionsView />}
        {activeFinanceTab === 'subscriptions' && <FinanceSubscriptionsView />}
        {activeFinanceTab === 'instructor_earnings' && <FinanceInstructorsView />}
        {activeFinanceTab === 'provider_earnings' && <FinanceProvidersView />}
        {activeFinanceTab === 'digital_products' && <FinanceDigitalProductsView />}
        {activeFinanceTab === 'refunds' && <FinanceRefundsView />}
        {activeFinanceTab === 'payouts' && <FinancePayoutsView />}
        {activeFinanceTab === 'reports' && <FinanceReportsView />}
      </div>
    </div>
  );
}
