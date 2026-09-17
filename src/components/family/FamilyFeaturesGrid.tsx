'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Image as ImageIcon, Calendar, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FamilyFeatureKey } from '@/types/family';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface FeatureCardConfig {
  id: FamilyFeatureKey;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FAMILY_FEATURES: FeatureCardConfig[] = [
  {
    id: 'shared_space',
    title: 'Ortak Alan',
    description: 'Aile duyuruları, anlık paylaşımlar ve ortak akış',
    icon: <Globe className="h-5 w-5 text-indigo-500" />,
  },
  {
    id: 'memories',
    title: 'Anılar',
    description: 'Birlikte kaydedilen fotoğraflar, videolar ve albümler',
    icon: <ImageIcon className="h-5 w-5 text-pink-500" />,
  },
  {
    id: 'calendar',
    title: 'Takvim',
    description: 'Doğum günleri, aile etkinlikleri ve ortak planlar',
    icon: <Calendar className="h-5 w-5 text-amber-500" />,
  },
  {
    id: 'notes',
    title: 'Notlar',
    description: 'Ortak alışveriş listeleri, yapılacaklar ve not defteri',
    icon: <FileText className="h-5 w-5 text-emerald-500" />,
  },
];

interface FamilyFeaturesGridProps {
  onFeatureClick: (feature: FeatureCardConfig) => void;
}

export function FamilyFeaturesGrid({ onFeatureClick }: FamilyFeaturesGridProps) {
  return (
    <div className="mt-4 px-4 sm:px-6">
      <div className="mb-3 px-1 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Aile Modülleri
        </h2>
        <span className="text-xs font-semibold text-muted-foreground">
          4 Modül
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {FAMILY_FEATURES.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            onClick={() => onFeatureClick(feature)}
            className={cn(
              'group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:border-primary/50'
            )}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/40 shadow-xs transition-transform group-hover:scale-105">
                  {feature.icon}
                </div>

                <StatusBadge status="locked" label="Çok Yakında" size="sm" />
              </div>

              <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-primary">Önizle</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

