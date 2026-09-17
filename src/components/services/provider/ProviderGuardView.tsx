'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  FileCheck2,
  RotateCcw,
} from 'lucide-react';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';
import { useMovingStore } from '@/stores/useMovingStore';
import { ProviderApplicationModal } from './ProviderApplicationModal';
import {
  SERVICE_DETAILS_CONFIG,
  type ServiceCategoryKey,
} from '@/types/providerAuth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ProviderGuardViewProps {
  serviceType?: ServiceCategoryKey;
}

export function ProviderGuardView({ serviceType = 'moving' }: ProviderGuardViewProps) {
  const { getProfile, approveDemoApplication, resetServiceProfile } = useProviderAuthStore();
  const { setCurrentRole } = useMovingStore();
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  const profile = getProfile(serviceType);
  const config = SERVICE_DETAILS_CONFIG[serviceType] || SERVICE_DETAILS_CONFIG.moving;

  return (
    <div className="mx-4 mt-5 space-y-4">
      {/* --------------------------------------------------------------------- */}
      {/* CASE 1: CUSTOMER (Yetkisiz Kullanıcı) */}
      {/* --------------------------------------------------------------------- */}
      {profile.status === 'customer' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="rounded-3xl border border-border/80 bg-card p-6 text-center shadow-lg"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/15 text-3xl shadow-sm">
            {config.iconEmoji}
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>{config.titleTr} Hizmet Veren Yetkisi Gerekli</span>
          </div>

          <h3 className="mt-3 text-lg font-bold text-foreground">
            {config.roleNameTr} Olarak Başvurun
          </h3>

          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
            {config.titleTr} alanında teklif verebilmek ve pazar yerinde iş alabilmek için başvurunuzun onaylanması gerekir. Güvenli platform standartlarımız gereği tüm hizmet sağlayıcılar doğrulanmaktadır.
          </p>

          {/* Feature Highlights */}
          <div className="my-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-left">
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
              <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Gizli & Adil Teklif</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                Diğer hizmet verenlerin fiyatları gizlidir, adil ve rekabetçi ortam sağlanır.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
              <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Doğrulanmış {config.roleNameTr}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                Belge ve ruhsat onayınızla güvenilir hizmet veren rozetine sahip olun.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={() => setIsApplicationModalOpen(true)}
              size="lg"
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-700"
            >
              <span>{config.titleTr} Başvurusu Yap</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              onClick={() => setCurrentRole('customer')}
              variant="outline"
              size="sm"
              className="w-full rounded-2xl text-xs text-muted-foreground hover:text-foreground"
            >
              Müşteri Moduna Geri Dön
            </Button>
          </div>
        </motion.div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CASE 2: APPLICANT (İnceleme Aşamasında) */}
      {/* --------------------------------------------------------------------- */}
      {profile.status === 'provider_applicant' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="rounded-3xl border border-blue-500/30 bg-card p-6 text-center shadow-lg"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/15 text-blue-500 shadow-sm">
            <Clock className="h-8 w-8 animate-pulse" />
          </div>

          <Badge variant="secondary" className="text-xs py-1 px-3 mb-2">
            Başvurunuz İnceleniyor
          </Badge>

          <h3 className="mt-2 text-lg font-bold text-foreground">
            {config.titleTr} Başvurunuz Değerlendirme Aşamasında
          </h3>

          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
            {config.roleNameTr} başvurunuz güvenlik ve belge uygunluğu açısından incelenmektedir. Onay işlemi tamamlandığında açık taleplere teklif vermeye başlayabilirsiniz.
          </p>

          {/* Application Summary Card */}
          <div className="my-5 rounded-2xl border border-border/80 bg-muted/30 p-4 text-left text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Hizmet Modülü:</span>
              <span className="font-semibold text-foreground">{config.titleTr} ({config.iconEmoji})</span>
            </div>
            {profile.fullName && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ad Soyad / Yetkili:</span>
                <span className="font-semibold text-foreground">{profile.fullName}</span>
              </div>
            )}
            {profile.businessTitle && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Firma Ünvanı:</span>
                <span className="font-medium text-foreground">{profile.businessTitle}</span>
              </div>
            )}
            {profile.vehicleOrEquipmentInfo && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Araç / Belge:</span>
                <span className="font-mono text-[11px] text-foreground">{profile.vehicleOrEquipmentInfo}</span>
              </div>
            )}
            {profile.submittedAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Başvuru Tarihi:</span>
                <span className="text-muted-foreground">
                  {new Date(profile.submittedAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            )}

            {/* Document Checklist Preview */}
            <div className="pt-2 border-t border-border/40">
              <span className="font-semibold text-foreground text-[11px] block mb-1.5">
                İncelenen {config.titleTr} Belgeleri:
              </span>
              <div className="space-y-1">
                {profile.documentChecklist.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{doc.titleTr}</span>
                    <span className="text-blue-500 font-medium">✓ İletildi</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dev Demo Approval Button for this specific service */}
          <div className="rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/10 p-4 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-left">
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Demo Test Ortamı</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Sadece {config.titleTr} modülünü anında onaylayıp teklif vermeyi test edin.
                </p>
              </div>
              <Button
                onClick={() => approveDemoApplication(serviceType)}
                size="sm"
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold whitespace-nowrap shadow-md shadow-emerald-500/20"
              >
                Hemen Onayla
              </Button>
            </div>
          </div>

          {/* Reset & Back */}
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={() => setCurrentRole('customer')}
              variant="outline"
              size="sm"
              className="rounded-2xl text-xs text-muted-foreground"
            >
              Müşteri Moduna Dön
            </Button>
            <Button
              onClick={() => resetServiceProfile(serviceType)}
              variant="ghost"
              size="sm"
              className="rounded-2xl text-xs text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Başvuruyu Sıfırla
            </Button>
          </div>
        </motion.div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CASE 3: SUSPENDED (Askıya Alınmış) */}
      {/* --------------------------------------------------------------------- */}
      {profile.status === 'provider_suspended' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="rounded-3xl border border-destructive/30 bg-card p-6 text-center shadow-lg"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-destructive/15 text-destructive shadow-sm">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <Badge variant="destructive" className="text-xs py-1 px-3 mb-2">
            Hesap Askıya Alındı
          </Badge>

          <h3 className="mt-2 text-lg font-bold text-foreground">
            {config.titleTr} Hizmet Veren Hesabınız Geçici Olarak Askıda
          </h3>

          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
            Güvenlik veya belge incelemesi nedeniyle {config.titleTr} hizmet veren işlemleriniz geçici olarak durdurulmuştur.
          </p>

          <div className="pt-4 flex justify-center gap-3">
            <Button
              onClick={() => setCurrentRole('customer')}
              variant="outline"
              size="sm"
              className="rounded-2xl text-xs"
            >
              Müşteri Paneline Dön
            </Button>
            <Button
              onClick={() => resetServiceProfile(serviceType)}
              variant="ghost"
              size="sm"
              className="rounded-2xl text-xs text-muted-foreground"
            >
              Durumu Sıfırla
            </Button>
          </div>
        </motion.div>
      )}

      {/* Application Modal - Bound strictly to this serviceType */}
      <ProviderApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        serviceType={serviceType}
      />
    </div>
  );
}
