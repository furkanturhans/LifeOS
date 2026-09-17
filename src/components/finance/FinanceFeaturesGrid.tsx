'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  CreditCard,
  Target,
  Trophy,
  Repeat,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinanceSectionKey } from '@/types/finance';
import { StatusBadge } from '@/components/ui/StatusBadge';

export interface FinanceFeatureCardConfig {
  id: FinanceSectionKey;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FINANCE_SECTIONS: FinanceFeatureCardConfig[] = [
  {
    id: 'overview',
    title: 'Genel Bakış',
    description: 'Varlık dağılımı, nakit akışı ve genel finansal durum özeti',
    icon: <PieChart className="h-5 w-5 text-emerald-500" />,
  },
  {
    id: 'expenses',
    title: 'Harcamalar',
    description: 'Günlük gider takibi, harcama kategorileri ve geçmiş döküm',
    icon: <CreditCard className="h-5 w-5 text-teal-500" />,
  },
  {
    id: 'budget',
    title: 'Bütçe',
    description: 'Aylık bütçe limitleri, tasarruf planları ve harcama uyarıları',
    icon: <Target className="h-5 w-5 text-cyan-500" />,
  },
  {
    id: 'goals',
    title: 'Hedefler',
    description: 'Birikim hedefleri, gelecek planları ve tasarruf motivasyonu',
    icon: <Trophy className="h-5 w-5 text-amber-500" />,
  },
  {
    id: 'subscriptions',
    title: 'Abonelikler',
    description: 'Düzenli faturalar, dijital servisler ve yenileme takvimi',
    icon: <Repeat className="h-5 w-5 text-indigo-500" />,
  },
];

interface FinanceFeaturesGridProps {
  onFeatureClick: (feature: FinanceFeatureCardConfig) => void;
}

export function FinanceFeaturesGrid({ onFeatureClick }: FinanceFeaturesGridProps) {
  return (
    <div className="mt-4 px-4 sm:px-6">
      <div className="mb-3 px-1 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Finansal Bölümler
        </h2>
        <span className="text-xs font-semibold text-muted-foreground">
          5 Bölüm
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {FINANCE_SECTIONS.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            onClick={() => onFeatureClick(section)}
            className={cn(
              'group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:border-primary/50',
              index === 0 ? 'sm:col-span-2' : ''
            )}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/40 shadow-xs transition-transform group-hover:scale-105">
                  {section.icon}
                </div>

                <StatusBadge status="locked" label="Çok Yakında" size="sm" />
              </div>

              <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                {section.title}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {section.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-primary">Önizle</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

