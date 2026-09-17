'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  Target,
  Trophy,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { ArcadeSectionKey } from '@/types/arcade';

export interface ArcadeFeatureCardConfig {
  id: ArcadeSectionKey;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  accentBg: string;
  isAvailable?: boolean;
}

const ARCADE_SECTIONS: ArcadeFeatureCardConfig[] = [
  {
    id: 'mini_games',
    title: 'Mini Oyunlar',
    description: 'Hafıza eşleştirme, şekil sayma, renk ve desen oyunları (Reklamsız & Güvenli)',
    icon: <Gamepad2 className="h-5 w-5 text-primary" />,
    gradient: '',
    accentBg: 'bg-primary/10 text-primary',
    isAvailable: true,
  },
  {
    id: 'daily_quests',
    title: 'Günlük Görevler',
    description: 'Her gün yenilenen hedefler, zeka egzersizleri ve XP ödülleri',
    icon: <Target className="h-5 w-5 text-amber-500" />,
    gradient: '',
    accentBg: 'bg-amber-500/10 text-amber-500',
    isAvailable: true,
  },
  {
    id: 'achievements',
    title: 'Başarımlar',
    description: 'Kazanılan rozetler, ustalık dereceleri ve kilit açma ilerlemeleri',
    icon: <Trophy className="h-5 w-5 text-purple-500" />,
    gradient: '',
    accentBg: 'bg-purple-500/10 text-purple-500',
    isAvailable: true,
  },
  {
    id: 'leaderboard',
    title: 'Liderlik Tablosu',
    description: 'Dostça sıralama, haftalık rekorlar ve genel skor tablosu',
    icon: <Crown className="h-5 w-5 text-yellow-500" />,
    gradient: '',
    accentBg: 'bg-yellow-500/10 text-yellow-500',
    isAvailable: true,
  },
];

interface ArcadeFeaturesGridProps {
  onFeatureClick: (feature: ArcadeFeatureCardConfig) => void;
}

export function ArcadeFeaturesGrid({ onFeatureClick }: ArcadeFeaturesGridProps) {
  return (
    <div className="mt-4 px-4">
      <div className="mb-3 px-1 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Arcade Alanları
        </h2>
        <span className="text-xs font-medium text-muted-foreground">
          4 Aktif Bölüm
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ARCADE_SECTIONS.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onFeatureClick(section)}
            className="cursor-pointer"
          >
            <Card hover interactive className="h-full">
              <CardHeader className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted border border-border">
                      {section.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold">
                        {section.title}
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs line-clamp-2">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>

                  <StatusBadge
                    status={section.isAvailable ? 'active' : 'locked'}
                    label={section.isAvailable ? 'Aktif' : 'Yakında'}
                    size="sm"
                  />
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Bölüme Gir</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
