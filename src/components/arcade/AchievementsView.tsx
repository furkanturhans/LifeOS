'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  Award,
  Lock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useArcadeStore } from '@/stores/useArcadeStore';
import type { AchievementCategory } from '@/types/arcade';
import { cn } from '@/lib/utils';

interface AchievementsViewProps {
  onBackToArcade: () => void;
}

const CATEGORY_TABS: { id: 'all' | AchievementCategory; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'general', label: 'Genel' },
  { id: 'puzzle', label: 'Zeka & Bulmaca' },
  { id: 'visual', label: 'Görsel & Şekil' },
  { id: 'reflex', label: 'Hız & Refleks' },
  { id: 'learning', label: 'Öğrenme & Bilgi' },
];

export function AchievementsView({ onBackToArcade }: AchievementsViewProps) {
  const { achievements, totalXp } = useArcadeStore();
  const [selectedCategory, setSelectedCategory] = useState<'all' | AchievementCategory>('all');

  const filteredAchievements = achievements.filter((ach) => {
    if (selectedCategory === 'all') return true;
    return ach.category === selectedCategory;
  });

  const totalCount = achievements.length;
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalScorePoints = achievements
    .filter((a) => a.isUnlocked)
    .reduce((acc, curr) => acc + curr.points, 0);

  return (
    <div className="flex flex-col h-full bg-background select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/70 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToArcade}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
            aria-label="Arcade'e Dön"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-purple-500/10 text-purple-500 shadow-xs text-lg">
            🏆
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Başarımlar
              </h1>
              <StatusBadge
                status={unlockedCount > 0 ? 'verified' : 'draft'}
                label={`${unlockedCount}/${totalCount} Açıldı`}
                size="sm"
              />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Kazanılan rozetler ve ustalık dereceleri
            </p>
          </div>
        </div>

        {/* Total Points */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-extrabold text-xs">
          <Trophy className="h-3.5 w-3.5" />
          <span>{totalScorePoints} Puan</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 py-2 border-b border-border/60 bg-muted/20 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                selectedCategory === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredAchievements.map((ach, index) => {
            const progPercent = Math.min(
              100,
              Math.round((ach.progress.current / ach.progress.max) * 100)
            );

            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Card
                  className={cn(
                    'p-4 h-full border-border transition-all shadow-2xs flex flex-col justify-between',
                    ach.isUnlocked
                      ? 'bg-purple-500/5 border-purple-500/30'
                      : 'bg-card/70 opacity-80'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl shadow-2xs',
                        ach.isUnlocked
                          ? 'border-purple-500/30 bg-purple-500/10'
                          : 'border-border bg-muted grayscale opacity-60'
                      )}
                    >
                      {ach.isUnlocked ? ach.iconEmoji : <Lock className="h-5 w-5 text-muted-foreground" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-bold text-foreground truncate">
                          {ach.title}
                        </h3>
                        <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400 shrink-0">
                          +{ach.points}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground leading-snug">
                        {ach.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress / Status Footer */}
                  <div className="mt-3 pt-2.5 border-t border-border/50">
                    {ach.isUnlocked ? (
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Rozet Kazanıldı
                        </span>
                        {ach.unlockedAt && (
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(ach.unlockedAt).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                          <span>İlerleme</span>
                          <span>
                            {ach.progress.current} / {ach.progress.max}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            style={{ width: `${progPercent}%` }}
                            className="h-full bg-purple-500/60 rounded-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
