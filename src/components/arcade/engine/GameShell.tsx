'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RotateCcw,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Star,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useArcadeStore } from '@/stores/useArcadeStore';
import { cn } from '@/lib/utils';
import { useLocaleRender } from '@/lib/i18n/runtime';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface GameShellProps {
  title: string;
  iconEmoji?: string;
  onBack: () => void;
  onRestart: () => void;
  difficulty?: Difficulty;
  onDifficultyChange?: (diff: Difficulty) => void;
  stats?: {
    score?: number;
    streak?: number;
    level?: number;
    round?: number;
    maxRounds?: number;
    moves?: number;
    timeSeconds?: number;
    customStatLabel?: string;
    customStatValue?: string | number;
    bestScore?: number | string;
  };
  isGameOver?: boolean;
  isVictory?: boolean;
  gameOverTitle?: string;
  gameOverDescription?: string;
  starCount?: number;
  xpEarned?: number;
  children: React.ReactNode;
}

export function GameShell({
  title,
  iconEmoji = '🎮',
  onBack,
  onRestart,
  difficulty,
  onDifficultyChange,
  stats,
  isGameOver = false,
  isVictory = true,
  gameOverTitle,
  gameOverDescription,
  starCount = 3,
  xpEarned = 30,
  children,
}: GameShellProps) {
  const localizeText = useLocaleRender();
  const { isMuted, toggleMute } = useArcadeStore();
  const [isPaused, setIsPaused] = useState(false);

  function formatTime(totalSec: number) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  return (
    <div className="flex flex-col h-full bg-background select-none">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={onBack}
            className="h-9 px-2.5 text-xs font-semibold shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{localizeText("Katalog")}</span>
          </Button>

          <div className="flex items-center gap-1.5 truncate">
            <span className="text-lg">{localizeText(iconEmoji)}</span>
            <span className="font-bold text-sm text-foreground truncate">{localizeText(title)}</span>
          </div>
        </div>

        {/* Optional Difficulty Selector */}
        {difficulty && onDifficultyChange && (
          <div className="flex items-center rounded-xl border border-border/80 bg-muted/40 p-0.5 text-xs">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => onDifficultyChange(d)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                  difficulty === d
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {localizeText(d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor')}
              </button>
            ))}
          </div>
        )}

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleMute}
            className="h-9 w-9 rounded-xl border border-border/80 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title={localizeText(isMuted ? 'Sesi Aç' : 'Sesi Kapat')}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-primary" />}
          </button>

          <button
            onClick={() => setIsPaused(true)}
            className="h-9 w-9 rounded-xl border border-border/80 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title={localizeText("Duraklat")}
          >
            <Pause className="h-4 w-4" />
          </button>

          <button
            onClick={onRestart}
            className="h-9 w-9 rounded-xl border border-border/80 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title={localizeText("Yeniden Başlat")}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar (if stats provided) */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 px-4 py-2 max-w-md mx-auto w-full text-center">
          {stats.score !== undefined && (
            <div className="rounded-xl border border-border bg-card p-1.5 shadow-2xs">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">{localizeText("Puan")}</span>
              <span className="text-base font-extrabold text-foreground">{localizeText(stats.score)}</span>
            </div>
          )}

          {stats.round !== undefined && (
            <div className="rounded-xl border border-border bg-card p-1.5 shadow-2xs">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">{localizeText("Tur")}</span>
              <span className="text-base font-extrabold text-foreground">
                {localizeText(stats.round)}{localizeText(stats.maxRounds ? `/${stats.maxRounds}` : '')}
              </span>
            </div>
          )}

          {stats.level !== undefined && stats.round === undefined && (
            <div className="rounded-xl border border-border bg-card p-1.5 shadow-2xs">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">{localizeText("Seviye")}</span>
              <span className="text-base font-extrabold text-foreground">{localizeText(stats.level)}</span>
            </div>
          )}

          {stats.moves !== undefined && (
            <div className="rounded-xl border border-border bg-card p-1.5 shadow-2xs">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">{localizeText("Hamle")}</span>
              <span className="text-base font-extrabold text-foreground">{localizeText(stats.moves)}</span>
            </div>
          )}

          {stats.timeSeconds !== undefined && stats.round === undefined && (
            <div className="rounded-xl border border-border bg-card p-1.5 shadow-2xs">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">{localizeText("Süre")}</span>
              <span className="text-base font-extrabold text-foreground">
                {localizeText(formatTime(stats.timeSeconds))}
              </span>
            </div>
          )}

          {stats.streak !== undefined && stats.streak > 1 && (
            <div className="rounded-xl border border-border bg-card p-1.5 shadow-2xs">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">{localizeText("Seri")}</span>
              <span className="text-base font-extrabold text-amber-500">🔥 {localizeText(stats.streak)}{localizeText(" x")}</span>
            </div>
          )}

          {stats.customStatLabel && (
            <div className="rounded-xl border border-border bg-card p-1.5 shadow-2xs">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                {localizeText(stats.customStatLabel)}
              </span>
              <span className="text-base font-extrabold text-foreground">
                {localizeText(stats.customStatValue)}
              </span>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-1.5 shadow-2xs">
            <span className="block text-[10px] uppercase font-bold text-muted-foreground">{localizeText("En Yüksek")}</span>
            <span className="text-base font-extrabold text-primary">
              {localizeText(stats.bestScore !== undefined && stats.bestScore !== 0 ? stats.bestScore : '-')}
            </span>
          </div>
        </div>
      )}

      {/* Main Game Stage */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-4">
        {children}
      </div>

      {/* Pause Modal */}
      <Modal
        isOpen={isPaused}
        onClose={() => setIsPaused(false)}
        title={localizeText("Oyun Duraklatıldı")}
        description={localizeText("Mola verdiniz. Hazır olduğunuzda devam edin.")}
        size="sm"
      >
        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            onClick={() => setIsPaused(false)}
            className="w-full font-bold h-11 text-sm"
          >
            <Play className="h-4 w-4 mr-1.5" />{localizeText("Devam Et")}</Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsPaused(false);
              onRestart();
            }}
            className="w-full font-semibold text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />{localizeText("Yeniden Başlat")}</Button>
          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full text-xs text-muted-foreground"
          >{localizeText("Kataloğa Dön")}</Button>
        </div>
      </Modal>

      {/* Game Over / Victory Modal */}
      <Modal
        isOpen={isGameOver}
        onClose={onRestart}
        title={
          localizeText(gameOverTitle ||
          (isVictory ? 'Tebrikler! 🏆' : 'Oyun Tamamlandı'))
        }
        description={
          localizeText(gameOverDescription ||
          (isVictory
            ? 'Harika bir performans sergilediniz!'
            : 'Bu tur tamamlandı. Tekrar deneyebilirsiniz.'))
        }
        size="sm"
      >
        <div className="text-center py-2 space-y-4">
          {/* Star Rating */}
          <div className="flex items-center justify-center gap-1.5 text-amber-400">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={cn(
                  'h-8 w-8 transition-transform',
                  starIdx <= starCount
                    ? 'fill-amber-400 text-amber-400 scale-110'
                    : 'text-muted/40'
                )}
              />
            ))}
          </div>

          {/* Stats Summary */}
          <div className="rounded-2xl border border-border bg-muted/30 p-3.5 text-center">
            <span className="text-xs text-muted-foreground block mb-1">{localizeText("Kazanılan Skor")}</span>
            <span className="text-2xl font-extrabold text-primary">
              {localizeText(stats?.score !== undefined ? stats.score : 50)}{localizeText(" Puan")}</span>
            <div className="mt-2 flex items-center justify-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>+{localizeText(xpEarned)}{localizeText(" Arcade XP Eklendi")}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              onClick={onRestart}
              className="w-full font-bold h-11 text-sm"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />{localizeText("Tekrar Oyna")}</Button>
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full text-xs font-semibold"
            >{localizeText("Mini Oyunlar Kataloğuna Dön")}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
