'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  BookOpen,
  Users,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';
import type { AgeGroup } from '@/types/education';

interface ExploreViewProps {
  onBackToHub: () => void;
}

const AGE_GROUPS_CONFIG: { id: 'all' | AgeGroup; label: string; ageRange: string; icon: string }[] = [
  { id: 'all', label: 'Tüm Yaşlar', ageRange: 'Tümü', icon: '🌐' },
  { id: 'preschool', label: 'Okul Öncesi', ageRange: '3-6 Yaş', icon: '🧸' },
  { id: 'child', label: 'Çocuk', ageRange: '7-12 Yaş', icon: '🎨' },
  { id: 'youth', label: 'Genç', ageRange: '13-18 Yaş', icon: '🚀' },
  { id: 'adult', label: 'Yetişkin', ageRange: '19-64 Yaş', icon: '💼' },
  { id: 'senior', label: '65+ Kıdemli', ageRange: '65+ Yaş', icon: '🌱' },
];

const CATEGORIES = [
  { id: 'tech', name: 'Yazılım & Yapay Zeka', icon: '💻', count: '12 Kurs Taslağı' },
  { id: 'lang', name: 'Yabancı Dil & İletişim', icon: '🗣️', count: '8 Kurs Taslağı' },
  { id: 'math', name: 'Matematik & Temel Bilimler', icon: '📐', count: '10 Kurs Taslağı' },
  { id: 'art', name: 'Görsel Sanatlar & Müzik', icon: '🎨', count: '6 Kurs Taslağı' },
  { id: 'personal', name: 'Kişisel Gelişim & Liderlik', icon: '🌱', count: '5 Kurs Taslağı' },
  { id: 'exam_prep', name: 'Sınavlara Hazırlık & LGS/YKS', icon: '📝', count: '9 Kurs Taslağı' },
];

export function ExploreView({ onBackToHub }: ExploreViewProps) {
  const [selectedAge, setSelectedAge] = useState<'all' | AgeGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col h-full bg-background select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/70 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToHub}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
            aria-label="Dersler Merkezine Dön"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-xs text-lg">
            🧭
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Kurs & Eğitim Keşfi
              </h1>
              <StatusBadge status="active" label="Katalog" size="sm" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Yaş grupları ve uzmanlık alanlarına göre eğitimler
            </p>
          </div>
        </div>
      </div>

      {/* Search & Age Filter Bar */}
      <div className="px-4 py-2.5 border-b border-border/60 bg-muted/20 space-y-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kurs veya konu ara..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Age Group Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {AGE_GROUPS_CONFIG.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedAge(group.id)}
              className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 shrink-0',
                selectedAge === group.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <span>{group.icon}</span>
              <span>{group.label}</span>
              <span className="text-[10px] opacity-70">({group.ageRange})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full">
        {/* Safe Education Shield */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-xs text-blue-800 dark:text-blue-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold block">Güvenli Eğitim Ortamı</span>
              <span className="text-[11px] opacity-90 block">
                Doğrulanmış eğitmenler, pedagojik denetim ve veli kontrolü ile güvenli öğrenim.
              </span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-3">
          <div className="px-1 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Eğitim Kategorileri
            </h2>
            <span className="text-xs font-medium text-muted-foreground">
              6 Kategori
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Card className="p-4 border-border bg-card hover:border-primary/40 transition-all shadow-2xs group cursor-pointer">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/60 text-2xl shadow-2xs group-hover:scale-105 transition-transform">
                      {cat.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {cat.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground font-medium">
                        {cat.count}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
