'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PackagePlus,
  Truck,
  ShieldCheck,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Inbox,
  Coins,
  CheckCircle2,
  FileText,
  Package,
} from 'lucide-react';
import { MovingHeader } from './MovingHeader';
import { CreateRequestModal } from './CreateRequestModal';
import { SubmitBidModal } from './SubmitBidModal';
import { RequestDetailModal } from './RequestDetailModal';
import { LockedServicesModal } from '@/components/services/LockedServicesModal';
import { ProviderGuardView } from '@/components/services/provider/ProviderGuardView';
import { Dock } from '@/components/os/Dock';
import { useMovingStore } from '@/stores/useMovingStore';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';
import { MOVING_STATUS_LABELS, type MovingRequest } from '@/types/moving';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function MovingScreen() {
  const {
    currentRole,
    config,
    myRequests,
    getMarketplaceRequestsForProvider,
    getMySubmittedBids,
    getBidsForMyRequest,
  } = useMovingStore();

  const { isVerifiedFor } = useProviderAuthStore();
  const isMovingVerified = isVerifiedFor('moving');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<MovingRequest | null>(null);
  const [selectedRequestForBid, setSelectedRequestForBid] = useState<MovingRequest | null>(null);
  const [lockedFeatureTitle, setLockedFeatureTitle] = useState<string | null>(null);

  // Guarantee deduplication for UI rendering
  const deduplicatedMyRequests = Array.from(new Map(myRequests.map((r) => [r.id, r])).values());
  // Provider only sees marketplace requests excluding their own created requests
  const providerMarketplaceRequests = getMarketplaceRequestsForProvider();
  const myBids = Array.from(new Map(getMySubmittedBids().map((b) => [b.id, b])).values());

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Header */}
      <MovingHeader />

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mt-4 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Gizli Teklif & Güvenli Nakliye</span>
              </div>
              <h2 className="mt-1 text-base font-bold text-foreground">
                {currentRole === 'customer'
                  ? 'Taşıma Talepleri & Teklif Yönetimi'
                  : 'Nakliyeci Pazar Yeri & Açık İlanlar'}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {currentRole === 'customer'
                  ? 'Taşıma talebinizi oluşturun, onaylı taşıyıcılardan fiyat toplayın. Numaranız ve açık adresiniz gizli tutulur.'
                  : 'Açık taşıma ilanlarını inceleyin, doğrudan fiyat teklifi iletin. Diğer nakliyecilerin teklifleri gizlidir.'}
              </p>
            </div>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-2xl shadow-sm">
              🚚
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
        {/* CUSTOMER VIEW (SADECE HİZMET ALAN / MÜŞTERİ) */}
        {/* ========================================================================= */}
        {currentRole === 'customer' && (
          <div className="space-y-6">
            {/* 1. Action Card: Taşıma Talebi Oluştur */}
            <div className="mt-5 px-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-teal-500/5 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/25">
                      <PackagePlus className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Taşıma Talebi Oluştur
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Evden eve, parça eşya veya şehirlerarası
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    size="sm"
                    className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-500/20"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Yeni Talep
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
                <span className="text-[11px] font-medium text-emerald-500">
                  {deduplicatedMyRequests.length} Talep
                </span>
              </div>

              {deduplicatedMyRequests.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Henüz Bir Taşıma Talebiniz Yok
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Yukarıdaki butona basarak ilk taşıma talebinizi anonim olarak yayınlayabilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deduplicatedMyRequests.map((req) => {
                    const statusInfo = MOVING_STATUS_LABELS[req.status];
                    const reqBids = getBidsForMyRequest(req.id);

                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequestForDetail(req)}
                        className="group rounded-3xl border border-border/80 bg-card p-4.5 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-emerald-500">
                                #{req.id}
                              </span>
                              <Badge variant={statusInfo.badgeVariant} className="text-[10px] py-0 px-2">
                                {statusInfo.tr}
                              </Badge>
                            </div>
                            <h3 className="text-sm font-bold text-foreground mt-1">
                              {req.fromCity} → {req.toCity}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                              {req.loadDescription}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {reqBids.length} Teklif
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {req.requestedDate}
                          </span>
                          <span className="font-semibold text-emerald-500 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>Detayları ve Teklifleri Gör</span>
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
        {/* PROVIDER VIEW: YETKİ KONTROLÜ (SADECE NAKLİYE YETKİSİ KONTROL EDİLİR) */}
        {/* ========================================================================= */}
        {currentRole === 'provider' && (
          <>
            {/* If NOT verified for moving, show the Nakliye ProviderGuardView */}
            {!isMovingVerified ? (
              <ProviderGuardView serviceType="moving" />
            ) : (
              /* Verified Moving Transporter View */
              <div className="mt-5 px-4 space-y-6">
                {/* Open Marketplace Requests */}
                <div>
                  <div className="mb-3 px-2 flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Açık Taşıma İlanları (Pazar Yeri)
                    </h2>
                    <span className="text-[11px] font-medium text-emerald-500">
                      {providerMarketplaceRequests.length} İlan
                    </span>
                  </div>

                  {providerMarketplaceRequests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-5 text-center text-xs text-muted-foreground">
                      Şu anda teklif verilebilecek açık ilan bulunmuyor.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {providerMarketplaceRequests.map((req) => {
                        const statusInfo = MOVING_STATUS_LABELS[req.status];
                        const hasGivenBid = myBids.some((b) => b.requestId === req.id);

                        return (
                          <div
                            key={req.id}
                            onClick={() => setSelectedRequestForBid(req)}
                            className="group rounded-3xl border border-border/80 bg-card p-4.5 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-semibold text-emerald-500">
                                    İlan #{req.id}
                                  </span>
                                  <Badge variant={statusInfo.badgeVariant} className="text-[10px] py-0 px-2">
                                    {statusInfo.tr}
                                  </Badge>
                                </div>
                                <h3 className="text-sm font-bold text-foreground mt-1 group-hover:text-emerald-500 transition-colors">
                                  {req.fromCity} → {req.toCity}
                                </h3>
                              </div>

                              {hasGivenBid && (
                                <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-blue-500">
                                  Teklifiniz Var
                                </span>
                              )}
                            </div>

                            {/* Load info - NO customer personal details */}
                            <p className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl leading-relaxed line-clamp-2">
                              📦 {req.loadDescription}
                            </p>

                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {req.requestedDate}
                              </span>
                              {req.notes && (
                                <span className="line-clamp-1">Not: {req.notes}</span>
                              )}
                            </div>

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
                                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-sm"
                              >
                                {hasGivenBid ? 'Teklifi Düzenle' : 'Fiyat Teklifi Ver'}
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
                      Henüz bir ilana teklif vermediniz.
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
                              "{bid.bidNote}"
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm text-emerald-500">
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

      {/* Customer: Create Request Modal */}
      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Customer: Request Detail & Bids Modal */}
      <RequestDetailModal
        isOpen={!!selectedRequestForDetail}
        onClose={() => setSelectedRequestForDetail(null)}
        request={selectedRequestForDetail}
      />

      {/* Transporter: Submit Bid Modal */}
      <SubmitBidModal
        isOpen={!!selectedRequestForBid}
        onClose={() => setSelectedRequestForBid(null)}
        request={selectedRequestForBid}
      />

      {/* Locked Feature Modal */}
      <LockedServicesModal
        isOpen={!!lockedFeatureTitle}
        onClose={() => setLockedFeatureTitle(null)}
        serviceTitle={lockedFeatureTitle || 'Bu Özellik'}
      />
    </div>
  );
}
