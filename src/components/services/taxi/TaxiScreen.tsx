'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Car,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Sparkles,
  Plus,
  Inbox,
  Coins,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { TaxiHeader } from './TaxiHeader';
import { CreateTaxiRequestModal } from './CreateTaxiRequestModal';
import { SubmitTaxiBidModal } from './SubmitTaxiBidModal';
import { TaxiRequestDetailModal } from './TaxiRequestDetailModal';
import { ProviderGuardView } from '@/components/services/provider/ProviderGuardView';
import { Dock } from '@/components/os/Dock';
import { useTaxiStore } from '@/stores/useTaxiStore';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';
import { TAXI_STATUS_LABELS, type TaxiRequest } from '@/types/taxi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function TaxiScreen() {
  const {
    currentRole,
    config,
    myRequests,
    getMarketplaceRequestsForDriver,
    getMySubmittedBids,
    getBidsForMyRequest,
  } = useTaxiStore();

  const { isVerifiedFor } = useProviderAuthStore();
  const isTaxiVerified = isVerifiedFor('taxi');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<TaxiRequest | null>(null);
  const [selectedRequestForBid, setSelectedRequestForBid] = useState<TaxiRequest | null>(null);

  // Guarantee deduplication for UI rendering
  const deduplicatedMyRequests = Array.from(new Map(myRequests.map((r) => [r.id, r])).values());
  const driverMarketplaceRequests = getMarketplaceRequestsForDriver();
  const myBids = Array.from(new Map(getMySubmittedBids().map((b) => [b.id, b])).values());

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <TaxiHeader />

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mt-4 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Sabit Fiyat & Güvenli Taksi</span>
              </div>
              <h2 className="mt-1 text-base font-bold text-foreground">
                {currentRole === 'customer'
                  ? 'Taksi Talepleri & Teklif Yönetimi'
                  : 'Şoför Pazar Yeri & Açık Talepler'}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {currentRole === 'customer'
                  ? 'Gideceğiniz güzergahı belirtin, onaylı taksi şoförlerinden sabit fiyat teklifi toplayın. Numaranız gizli tutulur.'
                  : 'Açık taksi taleplerini inceleyin, doğrudan sabit yolculuk teklifinizi iletin. Diğer şoförlerin teklifleri gizlidir.'}
              </p>
            </div>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-2xl shadow-sm">
              🚕
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-border/40">
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Numara Gizleme Garantisi</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              <span>Teklif Kredisi: {config.bidCreditFee} {config.currency}</span>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* CUSTOMER VIEW (HİZMET ALAN / YOLCU) */}
        {/* ========================================================================= */}
        {currentRole === 'customer' && (
          <div className="space-y-6">
            {/* 1. Action Card: Yolculuk Talebi Oluştur */}
            <div className="mt-5 px-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-orange-500/5 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/25">
                      <Car className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Yolculuk Talebi Oluştur
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Şehir içi sabit fiyatlı hızlı taksi çağır
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    size="sm"
                    className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md shadow-amber-500/20"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Taksi Çağır
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* 2. My Requests Section */}
            <div className="px-4">
              <div className="mb-3 px-2 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Taleplerim & Gelen Teklifler
                </h2>
                <span className="text-[11px] font-medium text-amber-500">
                  {deduplicatedMyRequests.length} Talep
                </span>
              </div>

              {deduplicatedMyRequests.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Henüz Bir Taksi Talebiniz Yok
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Yukarıdaki butona basarak ilk yolculuk talebinizi anonim olarak oluşturabilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deduplicatedMyRequests.map((req) => {
                    const statusInfo = TAXI_STATUS_LABELS[req.status];
                    const reqBids = getBidsForMyRequest(req.id);

                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequestForDetail(req)}
                        className="group rounded-3xl border border-border/80 bg-card p-4.5 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-amber-500">
                                #{req.id}
                              </span>
                              <Badge variant={statusInfo.badgeVariant} className="text-[10px] py-0 px-2">
                                {statusInfo.tr}
                              </Badge>
                            </div>
                            <h3 className="text-sm font-bold text-foreground mt-1">
                              {req.pickupLocation} → {req.dropoffLocation}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {req.requestedDateTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {req.passengerCount} Yolcu
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                              {reqBids.length} Teklif
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{req.notes ? `Not: ${req.notes}` : 'Ek not yok'}</span>
                          <span className="font-semibold text-amber-500 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>Teklifleri Gör</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DRIVER VIEW (HİZMET VEREN / ŞOFÖR) */}
        {/* ========================================================================= */}
        {currentRole === 'provider' && (
          <>
            {/* If NOT verified specifically for taxi, show Taxi ProviderGuardView */}
            {!isTaxiVerified ? (
              <ProviderGuardView serviceType="taxi" />
            ) : (
              /* Verified Taxi Driver View */
              <div className="mt-5 px-4 space-y-6">
                {/* Open Marketplace Requests */}
                <div>
                  <div className="mb-3 px-2 flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Açık Taksi Talepleri (Pazar Yeri)
                    </h2>
                    <span className="text-[11px] font-medium text-amber-500">
                      {driverMarketplaceRequests.length} Talep
                    </span>
                  </div>

                  {driverMarketplaceRequests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-5 text-center text-xs text-muted-foreground">
                      Şu anda teklif verilebilecek açık taksi talebi bulunmuyor.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {driverMarketplaceRequests.map((req) => {
                        const statusInfo = TAXI_STATUS_LABELS[req.status];
                        const hasGivenBid = myBids.some((b) => b.requestId === req.id);

                        return (
                          <div
                            key={req.id}
                            onClick={() => setSelectedRequestForBid(req)}
                            className="group rounded-3xl border border-border/80 bg-card p-4.5 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-semibold text-amber-500">
                                    Talep #{req.id}
                                  </span>
                                  <Badge variant={statusInfo.badgeVariant} className="text-[10px] py-0 px-2">
                                    {statusInfo.tr}
                                  </Badge>
                                </div>
                                <h3 className="text-sm font-bold text-foreground mt-1 group-hover:text-amber-500 transition-colors">
                                  {req.pickupLocation} → {req.dropoffLocation}
                                </h3>
                              </div>

                              {hasGivenBid && (
                                <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-blue-500">
                                  Teklifiniz Var
                                </span>
                              )}
                            </div>

                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-amber-500" />
                                {req.requestedDateTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5 text-amber-500" />
                                {req.passengerCount} Yolcu
                              </span>
                            </div>

                            {req.notes && (
                              <p className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl">
                                Yolcu Notu: {req.notes}
                              </p>
                            )}

                            {/* Submit Bid Button */}
                            <div className="mt-3.5 pt-2.5 border-t border-border/40 flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">
                                Kredi: <strong className="text-foreground">{config.bidCreditFee} {config.currency}</strong>
                              </span>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRequestForBid(req);
                                }}
                                size="sm"
                                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm"
                              >
                                {hasGivenBid ? 'Teklifi Düzenle' : 'Sabit Teklif Ver'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* My Submitted Bids */}
                <div>
                  <div className="mb-3 px-2 flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Verdiğim Teklifler ({myBids.length})
                    </h2>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Sadece Sizin Teklifleriniz
                    </span>
                  </div>

                  {myBids.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-5 text-center text-xs text-muted-foreground">
                      Henüz bir taksi talebine teklif vermediniz.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {myBids.map((bid) => (
                        <div
                          key={bid.id}
                          className="rounded-2xl border border-border/80 bg-card p-3.5 text-xs flex items-center justify-between shadow-sm"
                        >
                          <div>
                            <div className="font-semibold text-foreground">
                              Talep #{bid.requestId} için Teklifiniz
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              "{bid.bidNote}" ({bid.vehicleType})
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm text-amber-500">
                              {bid.price.toLocaleString('tr-TR')} {bid.currency}
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {bid.status === 'accepted' ? '✓ Kabul Edildi' : 'Beklemede'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Bottom spacer */}
        <div className="h-6" />
      </div>

      {/* Dock */}
      <Dock />

      {/* Modals */}
      <CreateTaxiRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <TaxiRequestDetailModal
        isOpen={!!selectedRequestForDetail}
        onClose={() => setSelectedRequestForDetail(null)}
        request={selectedRequestForDetail}
      />

      <SubmitTaxiBidModal
        isOpen={!!selectedRequestForBid}
        onClose={() => setSelectedRequestForBid(null)}
        request={selectedRequestForBid}
      />
    </div>
  );
}
