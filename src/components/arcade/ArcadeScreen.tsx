'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { ArcadeHeader } from './ArcadeHeader';
import { ArcadeFeaturesGrid, type ArcadeFeatureCardConfig } from './ArcadeFeaturesGrid';
import { MiniGamesCatalog } from './MiniGamesCatalog';
import { DailyQuestsView } from './DailyQuestsView';
import { AchievementsView } from './AchievementsView';
import { LeaderboardView } from './LeaderboardView';
import { Dock } from '@/components/os/Dock';
import { useArcadeStore } from '@/stores/useArcadeStore';

export function ArcadeScreen() {
  const { activeSection, setActiveSection, setActiveGameId } = useArcadeStore();

  function handleFeatureClick(feature: ArcadeFeatureCardConfig) {
    setActiveGameId(null);
    setActiveSection(feature.id);
  }

  // Active View Routing
  if (activeSection === 'mini_games') {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex-1 overflow-hidden">
          <MiniGamesCatalog onBackToArcade={() => setActiveSection(null)} />
        </div>
        <Dock />
      </div>
    );
  }

  if (activeSection === 'daily_quests') {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex-1 overflow-hidden">
          <DailyQuestsView onBackToArcade={() => setActiveSection(null)} />
        </div>
        <Dock />
      </div>
    );
  }

  if (activeSection === 'achievements') {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex-1 overflow-hidden">
          <AchievementsView onBackToArcade={() => setActiveSection(null)} />
        </div>
        <Dock />
      </div>
    );
  }

  if (activeSection === 'leaderboard') {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex-1 overflow-hidden">
          <LeaderboardView onBackToArcade={() => setActiveSection(null)} />
        </div>
        <Dock />
      </div>
    );
  }

  // Arcade Home Screen (Clean 4 Entrance Points, no open nested game/quest lists)
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Header */}
      <ArcadeHeader />

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mt-4 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                <Zap className="h-3.5 w-3.5" />
                <span>LifeOS Arcade Merkezi</span>
              </div>
              <h2 className="mt-1 text-base font-bold text-foreground">
                Eğlence ve Zeka Molası
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Kısa günlük molalar, zeka bulmacaları ve eğlenceli mini oyunlar. Cihazınızda hızlı, temiz ve reklamsız bir deneyim.
              </p>
            </div>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-2xl shadow-sm">
              🎯
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-border/40">
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-rose-500" />
              <span>Reklamsız & Güvenli</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-pink-500" />
              <span>Çevrimdışı Çalışma</span>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards Grid (Clean 4 Sections) */}
        <ArcadeFeaturesGrid onFeatureClick={handleFeatureClick} />

        {/* Bottom spacer */}
        <div className="h-6" />
      </div>

      {/* Dock */}
      <Dock />
    </div>
  );
}
