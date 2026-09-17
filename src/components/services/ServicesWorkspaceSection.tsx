'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Briefcase,
  Building2,
  Car,
  Truck,
  Wrench,
  Bus,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';
import { ProviderApplicationModal } from './provider/ProviderApplicationModal';
import type { ServiceCategoryKey } from '@/types/providerAuth';

export function ServicesWorkspaceSection() {
  const { getProfile, approveDemoApplication } = useProviderAuthStore();
  const [activeModalService, setActiveModalService] = useState<ServiceCategoryKey | null>(null);

  const providerCards = [
    {
      key: 'taxi' as ServiceCategoryKey,
      title: 'Taksi Şoförü',
      icon: Car,
      color: 'text-amber-500',
      description: 'Yolculuk taleplerine teklif verin ve sürüş gerçekleştirin.',
      href: '/services/taxi',
    },
    {
      key: 'moving' as ServiceCategoryKey,
      title: 'Nakliye Taşıyıcısı',
      icon: Truck,
      color: 'text-emerald-500',
      description: 'Evden eve ve parça taşıma taleplerine teklif sunun.',
      href: '/services/moving',
    },
    {
      key: 'craftsman' as ServiceCategoryKey,
      title: 'Hizmet Ustası',
      icon: Wrench,
      color: 'text-purple-500',
      description: 'Elektrik, tesisat, tamirat ve montaj işlerine teklif iletin.',
      href: '/services/craftsman',
    },
  ];

  return (
    <div className="px-4 mt-8 sm:px-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Hizmet Veren & İş Ortaklığı Yönetimi
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Doğrulanmış hizmet sağlayıcıları ve kurumsal seyahat iş ortakları alanı
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Individual Provider Status Cards */}
        <div className="lg:col-span-2 space-y-3">
          {providerCards.map((p) => {
            const profile = getProfile(p.key);
            const isVerified = profile.status === 'provider_verified';
            const isApplicant = profile.status === 'provider_applicant';
            const Icon = p.icon;

            return (
              <Card key={p.key} className="border-border bg-card p-4 transition-all hover:border-border/80 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted border border-border">
                      <Icon className={`h-5 w-5 ${p.color}`} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">{p.title}</h3>
                        <StatusBadge
                          status={
                            isVerified
                              ? 'verified'
                              : isApplicant
                              ? 'pending'
                              : 'open'
                          }
                          label={
                            isVerified
                              ? 'Yetkili Sağlayıcı'
                              : isApplicant
                              ? 'İnceleniyor'
                              : 'Başvuru Yapılmadı'
                          }
                          size="sm"
                        />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {isVerified ? (
                      <Link href={p.href}>
                        <Button variant="outline" size="sm" className="text-xs font-semibold">
                          Teklif Paneli →
                        </Button>
                      </Link>
                    ) : isApplicant ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => approveDemoApplication(p.key)}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Demo Onayla
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveModalService(p.key)}
                        className="text-xs font-semibold"
                      >
                        Başvuru Yap
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right 1 Col: Travel Corporate Partner Portal */}
        <div>
          <Card className="h-full border-border bg-card p-5 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <StatusBadge status="verified" label="İş Ortaklığı" size="sm" />
              </div>

              <h3 className="text-sm font-bold text-foreground">
                Seyahat İş Ortaklığı
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Otobüs firmaları, acenteler ve seyahat sağlayıcıları için kurumsal sefer, filo ve güzergâh yönetim sistemi.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-border/50">
              <Link href="/services/travel">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                  <span>Firma Paneline Giriş</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Application Modal */}
      {activeModalService && (
        <ProviderApplicationModal
          isOpen={Boolean(activeModalService)}
          onClose={() => setActiveModalService(null)}
          serviceType={activeModalService}
        />
      )}
    </div>
  );
}
