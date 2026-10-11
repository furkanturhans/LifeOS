'use client';

import React from 'react';
import {
  GraduationCap,
  Users,
  Car,
  Truck,
  Wrench,
  Compass,
  ShieldCheck,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import type { Conversation } from '@/types/connect';
import { useLocaleRender } from '@/lib/i18n/runtime';

interface ConnectScopeCardProps {
  conversation: Conversation;
}

export function ConnectScopeCard({ conversation }: ConnectScopeCardProps) {
  const localizeText = useLocaleRender();
  const { scope, scopeMeta } = conversation;

  if (scope === 'education') {
    const meta = scopeMeta.type === 'education' ? scopeMeta : null;
    if (!meta) return null;

    return (
      <div className="mx-4 mt-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 sm:mx-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-300">
                  {localizeText(meta.courseTitle)}
                </span>
                {meta.isQnaChannel && (
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-medium text-blue-300">{localizeText("Soru - Cevap & Kaynaklar")}</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{localizeText("Eğitmen:")}<span className="text-foreground">{localizeText(meta.instructorName)}</span>
                {localizeText(meta.topicTitle && ` • ${meta.topicTitle}`)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-blue-400">
              <ShieldCheck className="h-3 w-3" />{localizeText("Sınıf İçi İletişim")}</span>
          </div>
        </div>
      </div>
    );
  }

  if (scope === 'family') {
    const meta = scopeMeta.type === 'family' ? scopeMeta : null;
    if (!meta) return null;

    return (
      <div className="mx-4 mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 sm:mx-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-300">
                {localizeText(meta.roomName)}{localizeText("• Güvenli Aile Odası")}</span>
              <p className="text-[11px] text-muted-foreground">
                {localizeText(conversation.participants.length)}{localizeText(" Aile Üyesi • Çocuklar için korumalı ortak alan")}</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">{localizeText("Hane İçi")}</span>
        </div>
      </div>
    );
  }

  if (scope === 'services') {
    const meta = scopeMeta.type === 'services' ? scopeMeta : null;
    if (!meta) return null;

    const ServiceIcon =
      meta.serviceType === 'taxi'
        ? Car
        : meta.serviceType === 'moving'
        ? Truck
        : meta.serviceType === 'craftsman'
        ? Wrench
        : Compass;

    return (
      <div className="mx-4 mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 sm:mx-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <ServiceIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-300">
                  {localizeText(meta.serviceTitle)}
                </span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                  {localizeText(meta.serviceStatus === 'active' ? 'Aktif İş' : 'Tamamlandı')}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">{localizeText("Hizmet Veren:")}<span className="text-foreground">{localizeText(meta.providerName)}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90">
            <Info className="h-3.5 w-3.5" />
            <span>{localizeText("İş bitiminde bu konuşma otomatik arşivlenebilir.")}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
