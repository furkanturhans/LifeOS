'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ListChecks,
  Clock,
  CheckCircle2,
  AlertCircle,
  Film,
  CalendarCheck,
  Users,
  Briefcase,
  Wallet,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { ASSISTANT_TYPE_CONFIG, type AssistantTaskType } from '@/types/assistant';

const STATUS_TABS = [
  { id: 'all' as const, label: 'Görevlerim' },
  { id: 'pending_approval' as const, label: 'Onay Bekleyenler' },
  { id: 'in_progress' as const, label: 'İşleniyor' },
  { id: 'completed' as const, label: 'Tamamlananlar' },
];

const CATEGORIES: { id: AssistantTaskType | 'all'; label: string }[] = [
  { id: 'all', label: 'Tüm Kategoriler' },
  { id: 'content', label: 'İçerik & Video' },
  { id: 'planning', label: 'Planlama' },
  { id: 'family', label: 'Aile' },
  { id: 'services', label: 'Hizmetler' },
  { id: 'finance', label: 'Finans' },
  { id: 'research', label: 'Araştırma' },
];

export function AssistantTaskTabs() {
  const {
    tasks,
    activeTab,
    selectedCategory,
    setActiveTab,
    setSelectedCategory,
  } = useAssistantStore();

  const pendingCount = tasks.filter((t) => t.status === 'pending_approval').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress' || t.status === 'awaiting_input').length;

  return (
    <div className="px-4 mt-6 sm:px-6 space-y-3">
      {/* Primary Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const showBadge = tab.id === 'pending_approval' && pendingCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span>{tab.label}</span>
              {showBadge && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 text-white px-1 text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Secondary Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors border',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border/70 bg-card text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
