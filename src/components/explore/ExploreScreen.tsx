'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { ExploreHeader } from './ExploreHeader';
import { ExploreFeaturesGrid, type ExploreFeatureCardConfig } from './ExploreFeaturesGrid';
import { LockedExploreModal } from './LockedExploreModal';
import { Dock } from '@/components/os/Dock';

export function ExploreScreen() {
  const [selectedLockedFeature, setSelectedLockedFeature] = useState<{
    title: string;
    icon: React.ReactNode;
  } | null>(null);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Header */}
      <ExploreHeader />

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mt-4 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Compass className="h-3.5 w-3.5" />
                <span>LifeOS Keşfet & Akış</span>
              </div>
              <h2 className="mt-1 text-base font-bold text-foreground">
                Sakin ve Güvenli Sosyal Alan
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                İlgi alanlarına özel topluluklar, samimi aile paylaşımları ve ilham verici içerikler. Algoritmik gürültüden uzak, temiz bir deneyim.
              </p>
            </div>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-2xl shadow-sm">
              🧭
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-border/40">
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
              <span>Aileye Uygun & Güvenli</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>Reklamsız Akış</span>
            </div>
          </div>
        </motion.div>

        {/* 4 Feature Cards: Sana Özel, Topluluklar, Aile Paylaşımları, Popüler */}
        <ExploreFeaturesGrid
          onFeatureClick={(feature: ExploreFeatureCardConfig) =>
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
      <LockedExploreModal
        isOpen={!!selectedLockedFeature}
        onClose={() => setSelectedLockedFeature(null)}
        featureTitle={selectedLockedFeature?.title}
        featureIcon={selectedLockedFeature?.icon}
      />
    </div>
  );
}
