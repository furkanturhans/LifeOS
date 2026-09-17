'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet,
  Users,
  Compass,
  Gamepad2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function HomeActiveModules() {
  return (
    <div className="px-4 mt-6 sm:px-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Aktif Yaşam Modülleri
        </h2>
        <span className="text-xs font-semibold text-muted-foreground">
          4 Modül
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Finance Card */}
        <Link href="/finance" className="group">
          <Card hover className="h-full border-border bg-card p-5 transition-all shadow-xs hover:shadow-md">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <Wallet className="h-5 w-5" />
              </div>
              <StatusBadge status="active" label="Aktif" size="sm" />
            </div>

            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
              Finans & Varlık Yönetimi
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Bütçe takibi, harcama analizleri ve güvenli dijital cüzdan yönetimi.
            </p>

            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Finans Paneline Git</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        {/* Family Card */}
        <Link href="/family" className="group">
          <Card hover className="h-full border-border bg-card p-5 transition-all shadow-xs hover:shadow-md">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <StatusBadge status="active" label="Aktif" size="sm" />
            </div>

            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
              Aile & Ortak Yaşam
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Aile çemberi, güvenli konum paylaşımı, ortak harcama ve takvim eşitleme.
            </p>

            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Aile Alanını Aç</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        {/* Explore Card */}
        <Link href="/explore" className="group">
          <Card hover className="h-full border-border bg-card p-5 transition-all shadow-xs hover:shadow-md">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:scale-105 transition-transform">
                <Compass className="h-5 w-5" />
              </div>
              <StatusBadge status="active" label="Aktif" size="sm" />
            </div>

            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
              Keşfet & Topluluk
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Güvenli ilgi grupları, yerel öneriler ve aile dostu içerik akışı.
            </p>

            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Akışı İncele</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        {/* Arcade Card */}
        <Link href="/arcade" className="group">
          <Card hover className="h-full border-border bg-card p-5 transition-all shadow-xs hover:shadow-md">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 group-hover:scale-105 transition-transform">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <StatusBadge status="active" label="Aktif" size="sm" />
            </div>

            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
              Arcade & Eğlence
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Zeka egzersizleri, mini oyunlar, günlük hedefler ve aile ligi.
            </p>

            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Oyun Merkezine Gir</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
