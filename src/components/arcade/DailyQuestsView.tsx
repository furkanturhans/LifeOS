'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Target,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useArcadeStore } from '@/stores/useArcadeStore';
import { cn } from '@/lib/utils';

interface DailyQuestsViewProps {
  onBackToArcade: () => void;
}

export function DailyQuestsView({ onBackToArcade }: DailyQuestsViewProps) {
  const {
    dailyQuests,
    totalXp,
    checkAndResetDailyQuests,
    setActiveSection,
    setActiveGameId,
  } = useArcadeStore();

  useEffect(() => {
    checkAndResetDailyQuests();
  }, [checkAndResetDailyQuests]);

  const completedCount = dailyQuests.filter((q) => q.isCompleted).length;
  const totalQuests = dailyQuests.length;
  const progressPercent = Math.round((completedCount / (totalQuests || 1)) * 100);

  function handleStartQuestGame(targetGameId?: string) {
    if (targetGameId) {
      setActiveGameId(targetGameId as any);
    }
    setActiveSection('mini_games');
  }

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

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-amber-500/10 text-amber-500 shadow-xs text-lg">
            🎯
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Günlük Görevler
              </h1>
              <StatusBadge
                status={completedCount === totalQuests ? 'completed' : 'pending'}
                label={`${completedCount}/${totalQuests} Tamamlandı`}
                size="sm"
              />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Her gece yarısı yenilenen günlük hedefler
            </p>
          </div>
        </div>

        {/* Total XP badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{totalXp} XP</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full">
        {/* Daily Progress Overview Card */}
        <Card className="p-4 border-border bg-gradient-to-br from-amber-500/10 via-card to-card shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Bugünün İlerlemesi
              </span>
              <span className="text-lg font-extrabold text-foreground">
                %{progressPercent} Tamamlandı
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>Gece 00:00&apos;da sıfırlanır</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-amber-500 rounded-full"
            />
          </div>
        </Card>

        {/* Quests List */}
        <div className="space-y-3">
          <div className="px-1 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Aktif Görevler
            </h2>
            <span className="text-xs text-muted-foreground font-medium">
              {totalQuests} Görev
            </span>
          </div>

          {dailyQuests.map((quest, index) => {
            const questPercent = Math.min(
              100,
              Math.round((quest.currentValue / quest.targetValue) * 100)
            );

            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                <Card
                  className={cn(
                    'p-4 border-border transition-all shadow-2xs',
                    quest.isCompleted
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-card hover:border-amber-500/40'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/60 text-2xl shadow-2xs">
                        {quest.iconEmoji}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground truncate">
                            {quest.title}
                          </h3>
                          {quest.isCompleted && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="h-3 w-3" /> Tamamlandı
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                          {quest.description}
                        </p>

                        {/* Progress Bar & Value */}
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              style={{ width: `${questPercent}%` }}
                              className={cn(
                                'h-full rounded-full transition-all duration-300',
                                quest.isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                              )}
                            />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground shrink-0">
                            {quest.currentValue} / {quest.targetValue}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reward badge / Action button */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                        +{quest.xpReward} XP
                      </span>

                      {!quest.isCompleted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartQuestGame(quest.targetGameId)}
                          className="h-7 text-[11px] font-semibold px-2.5"
                        >
                          Oyna <ChevronRight className="h-3 w-3 ml-0.5" />
                        </Button>
                      )}
                    </div>
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
