'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Sparkles, Wallet, Info } from 'lucide-react';
import { FinanceHeader } from './FinanceHeader';
import { FinanceFeaturesGrid, type FinanceFeatureCardConfig } from './FinanceFeaturesGrid';
import { LockedFinanceModal } from './LockedFinanceModal';
import { Dock } from '@/components/os/Dock';

export function FinanceScreen() {
  const [selectedLockedFeature, setSelectedLockedFeature] = useState<{
    title: string;
    icon: React.ReactNode;
  } | null>(null);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Header */}
      <FinanceHeader />

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        {/* Reassurance & Privacy Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mt-4 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Gizlilik Odaklı Finans</span>
              </div>
              <h2 className="mt-1 text-base font-bold text-foreground">
                Finansal Yaşam Alanın
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Tüm harcamalarını, bütçeni ve birikim hedeflerini tek bir güvenli çatı altında yönet. Finansal verilerin sadece senin kontrolündedir.
              </p>
            </div>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-2xl shadow-sm">
              🛡️
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-border/40">
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              <span>Cihazda Güvenli Depolama</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-teal-500" />
              <span>Modüler Entegrasyon</span>
            </div>
          </div>
        </motion.div>

        {/* 5 Feature Cards: Genel Bakış, Harcamalar, Bütçe, Hedefler, Abonelikler */}
        <FinanceFeaturesGrid
          onFeatureClick={(feature: FinanceFeatureCardConfig) =>
            setSelectedLockedFeature({
              title: feature.title,
              icon: feature.icon,
            })
          }
        />

        {/* Bottom spacer */}
        <div className="h-6" />
      </div>

      {/* Dock */}
      <Dock />

      {/* Locked Feature Modal */}
      <LockedFinanceModal
        isOpen={!!selectedLockedFeature}
        onClose={() => setSelectedLockedFeature(null)}
        featureTitle={selectedLockedFeature?.title}
        featureIcon={selectedLockedFeature?.icon}
      />
    </div>
  );
}
