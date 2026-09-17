'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldCheck,
  Info,
  Play,
  Grid,
  Palette,
  Calculator,
  Smile,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MemoryMatchGame } from './MemoryMatchGame';
import { ShapeCounterGame } from './ShapeCounterGame';
import { ColorPatternGame } from './ColorPatternGame';
import { KidsGameCreditsModal } from './KidsGameCreditsModal';
import { useKidsGamesStore } from '@/stores/useKidsGamesStore';
import type { KidsGameId } from '@/types/arcade';
import { cn } from '@/lib/utils';

const KIDS_GAMES = [
  {
    id: 'memory_match' as const,
    title: 'Hafıza Eşleştirme',
    subtitle: 'Kartları çevir, eşleşen çiftleri bul ve hafızanı güçlendir',
    ageRange: '4-8 Yaş',
    category: 'Görsel Bellek',
    iconEmoji: '🧩',
    colorClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'shape_counting' as const,
    title: 'Şekil Sayma',
    subtitle: 'Ekrandaki sevimli şekilleri say ve doğru sayıyı seç',
    ageRange: '3-7 Yaş',
    category: 'Temel Matematik',
    iconEmoji: '🔢',
    colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'color_pattern' as const,
    title: 'Renk & Desen',
    subtitle: 'Renk sırasını ve eğlenceli desenleri takip et',
    ageRange: '4-9 Yaş',
    category: 'Mantık & Sıralama',
    iconEmoji: '🎨',
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
];

interface KidsGamesHubProps {
  onBackToArcade: () => void;
}

export function KidsGamesHub({ onBackToArcade }: KidsGamesHubProps) {
  const { isMuted, toggleMute } = useKidsGamesStore();
  const [activeGameId, setActiveGameId] = useState<KidsGameId | null>(null);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  // If a game is actively playing, render the game component
  if (activeGameId === 'memory_match') {
    return <MemoryMatchGame onBack={() => setActiveGameId(null)} />;
  }

  if (activeGameId === 'shape_counting') {
    return <ShapeCounterGame onBack={() => setActiveGameId(null)} />;
  }

  if (activeGameId === 'color_pattern') {
    return <ColorPatternGame onBack={() => setActiveGameId(null)} />;
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

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-pink-500/10 text-pink-600 dark:text-pink-400 shadow-xs text-lg">
            🧒
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Çocuk Oyunları
              </h1>
              <StatusBadge status="verified" label="Güvenli Alan" size="sm" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Reklamsız • Çevrimdışı • Eğitici Mini Oyunlar
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleMute}
            className="h-8 w-8 rounded-xl border border-border/80 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-primary" />}
          </button>

          <button
            onClick={() => setIsCreditsOpen(true)}
            className="h-8 w-8 rounded-xl border border-border/80 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Oyun Kredileri & Lisans"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full">
        {/* Child Safety Shield Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold block">Ebeveyn Güvencesi</span>
              <span className="text-[11px] opacity-90 block">Reklam, uygulama içi satın alma ve veri toplama bulunmaz.</span>
            </div>
          </div>
          <button
            onClick={() => setIsCreditsOpen(true)}
            className="text-[11px] font-bold underline hover:opacity-80 shrink-0"
          >
            Lisans & Bilgi
          </button>
        </div>

        {/* 3 Interactive Kids Game Cards */}
        <div className="space-y-3 pt-1">
          {KIDS_GAMES.map((game) => (
            <Card
              key={game.id}
              className="p-4 border-border bg-card hover:border-primary/40 transition-all shadow-2xs group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl shadow-xs transition-transform group-hover:scale-105',
                      game.colorClass
                    )}
                  >
                    {game.iconEmoji}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {game.title}
                      </h3>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {game.ageRange}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground leading-snug">
                      {game.subtitle}
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveGameId(game.id)}
                  className="font-bold text-xs h-9 px-4 shrink-0 shadow-xs"
                >
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Başla
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Credits & Open Source Modal */}
      <KidsGameCreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
      />
    </div>
  );
}
