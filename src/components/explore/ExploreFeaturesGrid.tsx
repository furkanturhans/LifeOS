'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Users,
  Home,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { ExploreSectionKey } from '@/types/explore';

export interface ExploreFeatureCardConfig {
  id: ExploreSectionKey;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  accentBg: string;
}

const EXPLORE_SECTIONS: ExploreFeatureCardConfig[] = [
  {
    id: 'for_you',
    title: 'Sana Özel',
    description: 'İlgi alanlarına, alışkanlıklarına ve tercihlerine göre derlenen içerikler',
    icon: <Sparkles className="h-5 w-5 text-primary" />,
    gradient: '',
    accentBg: 'bg-primary/10 text-primary',
  },
  {
    id: 'communities',
    title: 'Topluluklar',
    description: 'Ortak ilgi alanlarına sahip güvenli topluluklar, kulüpler ve ilgi grupları',
    icon: <Users className="h-5 w-5 text-blue-500" />,
    gradient: '',
    accentBg: 'bg-blue-500/10 text-blue-500',
  },
  {
    id: 'family_feed',
    title: 'Aile Paylaşımları',
    description: 'Sadece aile bireylerinin görebildiği güvenli, samimi ve kapalı devre akış',
    icon: <Home className="h-5 w-5 text-amber-500" />,
    gradient: '',
    accentBg: 'bg-amber-500/10 text-amber-500',
  },
  {
    id: 'popular',
    title: 'Popüler',
    description: 'LifeOS evreninde öne çıkan, ilham veren ve en çok ilgi gören başlıklar',
    icon: <Flame className="h-5 w-5 text-orange-500" />,
    gradient: '',
    accentBg: 'bg-orange-500/10 text-orange-500',
  },
];

interface ExploreFeaturesGridProps {
  onFeatureClick: (feature: ExploreFeatureCardConfig) => void;
}

export function ExploreFeaturesGrid({ onFeatureClick }: ExploreFeaturesGridProps) {
  return (
    <div className="mt-4 px-4">
      <div className="mb-3 px-1 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Keşfet Akışları
        </h2>
        <span className="text-xs font-medium text-muted-foreground">
          4 Bölüm
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EXPLORE_SECTIONS.map((section, index) => (
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

                  <StatusBadge status="locked" label="Yakında" size="sm" />
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Akışı incele</span>
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

