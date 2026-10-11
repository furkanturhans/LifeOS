'use client';

import React from 'react';
import Link from 'next/link';
import {
  Car,
  Compass,
  Truck,
  Wrench,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useLocaleRender } from '@/lib/i18n/runtime';
import { AppArtwork } from '@/components/ui/AppArtwork';
import { getModuleById, getLocalizedModuleName } from '@/modules/registry';
import { SERVICE_LINKS } from '@/modules/service-links';
import { useTranslation } from '@/lib/i18n';

const SERVICE_ITEMS = [
  {
    id: 'taxi',
    title: 'Taksi',
    subtitle: 'Şehir içi ve şehirlerarası güvenli taksi çağırma',
    icon: Car,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    href: '/services/taxi',
    status: 'Aktif',
  },
  {
    id: 'travel',
    title: 'Seyahat',
    subtitle: 'Otobüs seferleri, uçak, otel ve araç kiralama',
    icon: Compass,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    href: '/services/travel',
    status: 'Aktif',
  },
  {
    id: 'moving',
    title: 'Nakliye',
    subtitle: 'Evden eve taşıma ve parça eşya lojistiği',
    icon: Truck,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    href: '/services/moving',
    status: 'Aktif',
  },
  {
    id: 'craftsman',
    title: 'Usta',
    subtitle: 'Elektrik, tesisat, boya ve montaj ustası',
    icon: Wrench,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    href: '/services/craftsman',
    status: 'Aktif',
  },
];

export function ServicesHubGrid() {
  const localizeText = useLocaleRender();
  const { locale } = useTranslation();
  return (
    <div className="px-4 mt-4 sm:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {SERVICE_ITEMS.map((item) => {
          const Icon = item.icon;
          const serviceModule = getModuleById(item.id);
          return (
            <Link key={item.id} href={SERVICE_LINKS[item.id]} className="group block">
              <Card className="flex items-center justify-between p-4 border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-all duration-150 shadow-2xs group-active:scale-[0.99]">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${item.color} shadow-xs transition-transform group-hover:scale-105`}
                  >
                    <AppArtwork id={item.id} className="h-9 w-9 text-2xl"
                      fallback={serviceModule?.icon ?? <Icon className="h-5 w-5" />} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {serviceModule ? getLocalizedModuleName(serviceModule, locale) : localizeText(item.title)}
                      </h3>
                      <StatusBadge status="active" label={localizeText(item.status)} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {localizeText(item.subtitle)}
                    </p>
                  </div>
                </div>

                <div className="pl-3 shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

