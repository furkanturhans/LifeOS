'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Car,
  Compass,
  Truck,
  Wrench,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';

export function HomeServicesHero() {
  const { getProfile } = useProviderAuthStore();

  const services = [
    {
      id: 'taxi',
      title: 'Taksi',
      description: 'Hızlı ve güvenli şehir içi yolculuk talebi',
      icon: Car,
      color: 'text-amber-500',
      action: 'Yolculuk Başlat',
      href: '/services/taxi',
      isVerified: getProfile('taxi').status === 'provider_verified',
    },
    {
      id: 'travel',
      title: 'Seyahat',
      description: 'Otobüs seferi arama, bilet ve rota planı',
      icon: Compass,
      color: 'text-blue-500',
      action: 'Sefer Ara',
      href: '/services/travel',
      isVerified: getProfile('travel').status === 'provider_verified',
    },
    {
      id: 'moving',
      title: 'Nakliye',
      description: 'Evden eve, parça eşya ve şehirlerarası taşıma',
      icon: Truck,
      color: 'text-emerald-500',
      action: 'Taşıma Talebi',
      href: '/services/moving',
      isVerified: getProfile('moving').status === 'provider_verified',
    },
    {
      id: 'craftsman',
      title: 'Usta',
      description: 'Elektrik, tesisat, boya ve ev bakımı',
      icon: Wrench,
      color: 'text-purple-500',
      action: 'Usta Çağır',
      href: '/services/craftsman',
      isVerified: getProfile('craftsman').status === 'provider_verified',
    },
  ];

  return (
    <div className="px-4 mt-6 sm:px-6">
      <Card className="overflow-hidden border-border bg-card shadow-sm">
        {/* Header Strip */}
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Hizmetler Ekosistemi</h2>
              <p className="text-[11px] text-muted-foreground">Taksi, seyahat, nakliye ve usta çözümleri</p>
            </div>
          </div>

          <Link
            href="/services"
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>Merkezi Aç</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 4 Interactive Service Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
          {services.map((svc, idx) => {
            const Icon = svc.icon;
            return (
              <Link
                key={svc.id}
                href={svc.href}
                className="group relative flex flex-col justify-between p-4.5 hover:bg-muted/40 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted border border-border group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors">
                      <Icon className={`h-5 w-5 ${svc.color}`} />
                    </div>
                    {svc.isVerified ? (
                      <StatusBadge status="verified" label="Hizmet Veren" size="sm" />
                    ) : (
                      <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground flex items-center gap-0.5">
                        Aktif
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {svc.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {svc.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-foreground group-hover:text-primary">
                  <span>{svc.action}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Trust & Provider Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/70 bg-muted/20 px-5 py-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Doğrulanmış sağlayıcılar, gizli teklifler ve güvenli işlem protokolü.</span>
          </div>

          <Link
            href="/services"
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground whitespace-nowrap"
          >
            Hizmet Veren / İş Ortağı Paneli →
          </Link>
        </div>
      </Card>
    </div>
  );
}
