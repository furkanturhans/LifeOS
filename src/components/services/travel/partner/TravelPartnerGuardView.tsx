'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Bus,
  Plane,
  Building,
  Car,
  MapPin,
  FileCheck2,
  RotateCcw,
} from 'lucide-react';
import { useTravelPartnerStore } from '@/stores/useTravelPartnerStore';
import { TravelPartnerApplicationModal } from './TravelPartnerApplicationModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PARTNER_ROLE_LABELS, PRODUCT_LABELS, type TravelProductCategory } from '@/types/travelPartner';
import { cn } from '@/lib/utils';

interface TravelPartnerGuardViewProps {
  onReturnToPassenger: () => void;
}

export function TravelPartnerGuardView({ onReturnToPassenger }: TravelPartnerGuardViewProps) {
  const {
    activePartnerProduct,
    setActivePartnerProduct,
    statusByProduct,
    busProfile,
    flightProfile,
    hotelProfile,
    carRentalProfile,
    approveDemoPartnership,
    resetPartnerProfile,
  } = useTravelPartnerStore();

  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  const currentStatus = statusByProduct[activePartnerProduct] || 'partner_guest';
  const productInfo = PRODUCT_LABELS[activePartnerProduct];

  // Get active profile for this product
  const currentProfile: any =
    activePartnerProduct === 'bus'
      ? busProfile
      : activePartnerProduct === 'flight'
      ? flightProfile
      : activePartnerProduct === 'hotel'
      ? hotelProfile
      : carRentalProfile;

  return (
    <div className="mx-4 mt-5 space-y-4">
      {/* Product Selector Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(['bus', 'flight', 'hotel', 'car_rental'] as TravelProductCategory[]).map((prod) => {
          const isSelected = activePartnerProduct === prod;
          const info = PRODUCT_LABELS[prod];
          const prodStatus = statusByProduct[prod];
          return (
            <button
              key={prod}
              onClick={() => setActivePartnerProduct(prod)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border',
                isSelected
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/25'
                  : 'bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <span>{info.emoji}</span>
              <span>{info.labelTr}</span>
              {prodStatus === 'partner_verified' && (
                <span className="rounded-full bg-emerald-500 text-white px-1.5 py-0.2 text-[9px] font-bold">
                  ✓
                </span>
              )}
              {prodStatus === 'partner_applicant' && (
                <span className="rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[9px] font-bold">
                  İnceleniyor
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* CASE 1: GUEST (Başvuru Yapmamış Normal Kullanıcı) */}
      {/* --------------------------------------------------------------------- */}
      {currentStatus === 'partner_guest' && (
        <motion.div
          key={`guest-${activePartnerProduct}`}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="rounded-3xl border border-border/80 bg-card p-6 text-center shadow-lg"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/15 text-3xl shadow-sm">
            {productInfo.emoji}
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Building2 className="h-3.5 w-3.5" />
            <span>{productInfo.labelTr} İş Ortaklığı & Yetkilendirme</span>
          </div>

          <h3 className="mt-3 text-lg font-bold text-foreground">
            {productInfo.labelTr} Firma Paneline Başvurun
          </h3>

          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
            {productInfo.descTr}. Yönetim paneline erişmek, araç/uçuş/oda/filo taslaklarınızı oluşturmak için iş ortaklığı başvurunuzu tamamlayın.
          </p>

          {/* Feature Highlights for Product */}
          <div className="my-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-left">
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
              <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5 text-blue-500" />
                <span>Lisans & Yetki Ayrımı</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                Her seyahat ürünü kendi resmi ruhsat ve yetki belgesiyle doğrulanır.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
              <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                <span>İzole Taslak Yönetimi</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                Taslak seferler, uçuşlar ve odalar onayınız olmadan asla yayınlanmaz.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
              <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>Özel Firma Paneli</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                Sektörünüze özel geliştirilmiş araç, rota ve fiyat planı araçları.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={() => setIsApplicationModalOpen(true)}
              size="lg"
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700"
            >
              <span>{productInfo.labelTr} İş Ortaklığı Başvurusu Yap</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              onClick={onReturnToPassenger}
              variant="outline"
              size="sm"
              className="w-full rounded-2xl text-xs text-muted-foreground hover:text-foreground"
            >
              Yolcu Moduna Geri Dön
            </Button>
          </div>
        </motion.div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CASE 2: APPLICANT (İnceleme Aşamasında) */}
      {/* --------------------------------------------------------------------- */}
      {currentStatus === 'partner_applicant' && (
        <motion.div
          key={`applicant-${activePartnerProduct}`}
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
            {productInfo.labelTr} İş Ortaklığı Başvurunuz Değerlendirmede
          </h3>

          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
            Firma ve yetki belgesi başvurunuz incelenmektedir. Onay işlemi tamamlandığında {productInfo.labelTr} Firma Paneline tam erişim sağlanacaktır.
          </p>

          {/* Application Summary Card */}
          {currentProfile && (
            <div className="my-5 rounded-2xl border border-border/80 bg-muted/30 p-4 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Firma Ünvanı:</span>
                <span className="font-semibold text-foreground">{currentProfile.companyName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Yetkili Ad Soyad:</span>
                <span className="font-semibold text-foreground">{currentProfile.authorizedPersonName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Yetkili Rolü:</span>
                <span className="text-foreground font-medium">{PARTNER_ROLE_LABELS[currentProfile.authorizedRole as keyof typeof PARTNER_ROLE_LABELS]}</span>
              </div>
              {currentProfile.d2LicenseNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">D2 Belge No:</span>
                  <span className="font-mono text-foreground">{currentProfile.d2LicenseNumber}</span>
                </div>
              )}
              {currentProfile.shgmLicenseNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">SHGM Ruhsat No:</span>
                  <span className="font-mono text-foreground">{currentProfile.shgmLicenseNumber}</span>
                </div>
              )}
              {currentProfile.tourismLicenseNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Turizm Ruhsat No:</span>
                  <span className="font-mono text-foreground">{currentProfile.tourismLicenseNumber}</span>
                </div>
              )}
              {currentProfile.kabisNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">KABİS Belge No:</span>
                  <span className="font-mono text-foreground">{currentProfile.kabisNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Başvuru Tarihi:</span>
                <span className="text-muted-foreground">
                  {new Date(currentProfile.appliedAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          )}

          {/* Dev Demo Approval Button */}
          <div className="rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/10 p-4 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-left">
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Demo Test Ortamı</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {productInfo.labelTr} panelini anında onaylayıp test edin.
                </p>
              </div>
              <Button
                onClick={() => approveDemoPartnership(activePartnerProduct)}
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
              onClick={onReturnToPassenger}
              variant="outline"
              size="sm"
              className="rounded-2xl text-xs text-muted-foreground"
            >
              Yolcu Moduna Dön
            </Button>
            <Button
              onClick={() => resetPartnerProfile(activePartnerProduct)}
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
      {/* CASE 3: SUSPENDED */}
      {/* --------------------------------------------------------------------- */}
      {currentStatus === 'partner_suspended' && (
        <motion.div
          key={`suspended-${activePartnerProduct}`}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="rounded-3xl border border-destructive/30 bg-card p-6 text-center shadow-lg"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-destructive/15 text-destructive shadow-sm">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <Badge variant="destructive" className="text-xs py-1 px-3 mb-2">
            Firma Hesabı Askıda
          </Badge>

          <h3 className="mt-2 text-lg font-bold text-foreground">
            {productInfo.labelTr} Paneli Yetkiniz Askıya Alındı
          </h3>

          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
            Belge veya lisans güncellemesi nedeniyle panel erişiminiz durdurulmuştur.
          </p>

          <div className="pt-4 flex justify-center gap-3">
            <Button
              onClick={onReturnToPassenger}
              variant="outline"
              size="sm"
              className="rounded-2xl text-xs"
            >
              Yolcu Moduna Dön
            </Button>
            <Button
              onClick={() => resetPartnerProfile(activePartnerProduct)}
              variant="ghost"
              size="sm"
              className="rounded-2xl text-xs text-muted-foreground"
            >
              Durumu Sıfırla
            </Button>
          </div>
        </motion.div>
      )}

      {/* Application Modal */}
      <TravelPartnerApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        initialProduct={activePartnerProduct}
      />
    </div>
  );
}
