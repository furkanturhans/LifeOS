'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Shield,
  Clock,
  Volume2,
  VolumeX,
  Lock,
  Gamepad2,
  BookOpen,
  Film,
  BookMarked,
  Palette,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ParentPinModal } from './ParentPinModal';
import { ParentDashboardView } from './ParentDashboardView';
import { KidsMiniGamesView } from './KidsMiniGamesView';
import { KidsStudyView } from './KidsStudyView';
import { KidsMovieView } from './KidsMovieView';
import { KidsStoriesView } from './KidsStoriesView';
import { KidsDrawView } from './KidsDrawView';
import { useKidsStore } from '@/stores/useKidsStore';
import type { KidsSectionKey } from '@/types/kids';
import { cn } from '@/lib/utils';

export function KidsHomeScreen() {
  const {
    activeSection,
    setActiveSection,
    soundEnabled,
    toggleSound,
    todayUsageMinutes,
    dailyTimeLimitMinutes,
    isParentUnlocked,
    unlockParent,
  } = useKidsStore();

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingSection, setPendingSection] = useState<KidsSectionKey | null>(null);

  const handleSectionClick = (sectionKey: KidsSectionKey) => {
    if (sectionKey === 'parent') {
      if (isParentUnlocked) {
        setActiveSection('parent');
      } else {
        setPendingSection('parent');
        setIsPinModalOpen(true);
      }
    } else {
      setActiveSection(sectionKey);
    }
  };

  const handlePinSuccess = () => {
    unlockParent();
    if (pendingSection) {
      setActiveSection(pendingSection);
      setPendingSection(null);
    }
  };

  // Section Views Router
  if (activeSection === 'mini_games') {
    return <KidsMiniGamesView onBackToKids={() => setActiveSection(null)} />;
  }
  if (activeSection === 'study') {
    return <KidsStudyView onBackToKids={() => setActiveSection(null)} />;
  }
  if (activeSection === 'movie') {
    return <KidsMovieView onBackToKids={() => setActiveSection(null)} />;
  }
  if (activeSection === 'stories') {
    return <KidsStoriesView onBackToKids={() => setActiveSection(null)} />;
  }
  if (activeSection === 'draw') {
    return <KidsDrawView onBackToKids={() => setActiveSection(null)} />;
  }
  if (activeSection === 'parent') {
    return <ParentDashboardView onBackToKids={() => setActiveSection(null)} />;
  }

  const SECTIONS: {
    id: KidsSectionKey;
    title: string;
    subtitle: string;
    emoji: string;
    gradient: string;
    borderClass: string;
    badge: string;
  }[] = [
    {
      id: 'mini_games',
      title: 'Mini Oyunlar',
      subtitle: '30 zeka, bulmaca ve refleks oyunu',
      emoji: '🎮',
      gradient: 'from-pink-500/20 via-pink-500/5 to-card',
      borderClass: 'border-pink-500/30 hover:border-pink-500',
      badge: '30 Oyun',
    },
    {
      id: 'study',
      title: 'Kids Study',
      subtitle: 'Harfler, sayılar ve bilim dersleri',
      emoji: '📚',
      gradient: 'from-blue-500/20 via-blue-500/5 to-card',
      borderClass: 'border-blue-500/30 hover:border-blue-500',
      badge: 'Eğitici',
    },
    {
      id: 'movie',
      title: 'Kids Movie',
      subtitle: 'Güvenli çizgi film & animasyonlar',
      emoji: '🎬',
      gradient: 'from-rose-500/20 via-rose-500/5 to-card',
      borderClass: 'border-rose-500/30 hover:border-rose-500',
      badge: 'Reklamsız',
    },
    {
      id: 'stories',
      title: 'Hikâyeler',
      subtitle: 'Sesli ve resimli masal kitapları',
      emoji: '📖',
      gradient: 'from-amber-500/20 via-amber-500/5 to-card',
      borderClass: 'border-amber-500/30 hover:border-amber-500',
      badge: 'Sesli Masal',
    },
    {
      id: 'draw',
      title: 'Çizim & Sanat',
      subtitle: 'Renkli tuval, fırçalar ve çıkartmalar',
      emoji: '🎨',
      gradient: 'from-teal-500/20 via-teal-500/5 to-card',
      borderClass: 'border-teal-500/30 hover:border-teal-500',
      badge: 'Yaratıcı',
    },
    {
      id: 'parent',
      title: 'Ebeveyn Alanı',
      subtitle: 'PIN korumalı süre ve içerik denetimi',
      emoji: '🛡️',
      gradient: 'from-purple-500/20 via-purple-500/5 to-card',
      borderClass: 'border-purple-500/30 hover:border-purple-500',
      badge: 'PIN Korumalı',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/70 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 text-white shadow-md text-xl">
            🧸
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-extrabold text-foreground">
                LifeOS Kids
              </h1>
              <StatusBadge status="verified" label="Güvenli Mod" size="sm" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Çocuklara özel eğlence ve öğrenme merkezi
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="h-8 w-8 rounded-xl border border-border/80 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Ses"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Ebeveyn Kilidi Button */}
          <button
            onClick={() => handleSectionClick('parent')}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs hover:bg-purple-500/20 transition-all active:scale-95 shadow-2xs"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Ebeveyn</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full pb-12">
        {/* Playful Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-pink-500/30 bg-gradient-to-br from-pink-500/15 via-amber-500/10 to-transparent p-5 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-pink-600 dark:text-pink-400">
                <Sparkles className="h-4 w-4" />
                <span>Hoş Geldin Küçük Kaşif!</span>
              </div>
              <h2 className="mt-1 text-lg font-extrabold text-foreground">
                Öğren, Oyna ve Keşfet 🌟
              </h2>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs leading-relaxed">
                Tüm oyunlar, çizgi filmler ve masallar senin için özenle hazırlandı.
              </p>
            </div>
            <span className="text-5xl drop-shadow-md">🦄</span>
          </div>

          {/* Time Remaining Pill */}
          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>
                Bugün: {todayUsageMinutes} dk {dailyTimeLimitMinutes ? `/ ${dailyTimeLimitMinutes} dk` : ''}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Süre Sınırı Güvende
            </span>
          </div>
        </motion.div>

        {/* 6 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {SECTIONS.map((sec, idx) => (
            <motion.div
              key={sec.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
            >
              <button
                type="button"
                onClick={() => handleSectionClick(sec.id)}
                className={cn(
                  'w-full text-left p-4 rounded-3xl border bg-gradient-to-br transition-all duration-200 shadow-2xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between min-h-[120px]',
                  sec.gradient,
                  sec.borderClass
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="text-4xl group-hover:scale-110 transition-transform block">
                    {sec.emoji}
                  </span>
                  <span className="rounded-xl bg-card/80 backdrop-blur-sm border border-border/60 px-2.5 py-1 text-[11px] font-bold text-foreground shadow-2xs">
                    {sec.badge}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                    {sec.subtitle}
                  </p>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Parent PIN Modal */}
      <ParentPinModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingSection(null);
        }}
        onSuccess={handlePinSuccess}
      />
    </div>
  );
}
