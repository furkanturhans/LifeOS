'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  MapPin,
  Calendar,
  ShieldCheck,
  Sparkles,
  Plus,
  Inbox,
  Coins,
  ChevronRight,
  Clock,
  Timer,
} from 'lucide-react';
import { CraftsmanHeader } from './CraftsmanHeader';
import { CreateCraftsmanRequestModal } from './CreateCraftsmanRequestModal';
import { SubmitCraftsmanBidModal } from './SubmitCraftsmanBidModal';
import { CraftsmanRequestDetailModal } from './CraftsmanRequestDetailModal';
import { ProviderGuardView } from '@/components/services/provider/ProviderGuardView';
import { Dock } from '@/components/os/Dock';
import { useCraftsmanStore } from '@/stores/useCraftsmanStore';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';
import {
  CRAFTSMAN_CATEGORIES_CONFIG,
  CRAFTSMAN_STATUS_LABELS,
  type CraftsmanRequest,
} from '@/types/craftsman';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function CraftsmanScreen() {
  const {
    currentRole,
    config,
    myRequests,
    getMarketplaceRequestsForCraftsman,
    getMySubmittedBids,
    getBidsForMyRequest,
  } = useCraftsmanStore();

  const { isVerifiedFor } = useProviderAuthStore();
  const isCraftsmanVerified = isVerifiedFor('craftsman');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<CraftsmanRequest | null>(null);
  const [selectedRequestForBid, setSelectedRequestForBid] = useState<CraftsmanRequest | null>(null);

  // Guarantee deduplication for UI rendering
  const deduplicatedMyRequests = Array.from(new Map(myRequests.map((r) => [r.id, r])).values());
  const craftsmanMarketplaceRequests = getMarketplaceRequestsForCraftsman();
  const myBids = Array.from(new Map(getMySubmittedBids().map((b) => [b.id, b])).values());

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <CraftsmanHeader />

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mt-4 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Doğrulanmış Usta & Güvenli Hizmet</span>
              </div>
              <h2 className="mt-1 text-base font-bold text-foreground">
                {currentRole === 'customer'
                  ? 'Usta Talepleri & Teklif Yönetimi'
                  : 'Usta Pazar Yeri & Açık İş İlanları'}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {currentRole === 'customer'
                  ? 'Ev veya ofisinizdeki tamirat ihtiyacını belirtin, onaylı ustalardan fiyat ve süre teklifi toplayın. Numaranız gizli tutulur.'
                  : 'Açık usta taleplerini inceleyin, doğrudan fiyat ve süre teklifinizi iletin. Diğer ustaların teklifleri gizlidir.'}
              </p>
            </div>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-500/15 text-2xl shadow-sm">
              🛠️
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
        {/* CUSTOMER VIEW (HİZMET ALAN / MÜŞTERİ) */}
        {/* ========================================================================= */}
        {currentRole === 'customer' && (
          <div className="space-y-6">
            {/* 1. Action Card: Usta Talebi Oluştur */}
            <div className="mt-5 px-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/15 to-indigo-500/5 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/25">
                      <Wrench className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        Usta Talebi Oluştur
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Elektrik, tesisat, boya, mobilya ve onarım
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    size="sm"
                    className="rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-500/20"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Usta Çağır
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
                <span className="text-[11px] font-medium text-purple-500">
                  {deduplicatedMyRequests.length} Talep
                </span>
              </div>

              {deduplicatedMyRequests.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Henüz Bir Usta Talebiniz Yok
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Yukarıdaki butona basarak ilk tamirat talebinizi anonim olarak oluşturabilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deduplicatedMyRequests.map((req) => {
                    const statusInfo = CRAFTSMAN_STATUS_LABELS[req.status];
                    const categoryConfig = CRAFTSMAN_CATEGORIES_CONFIG.find((c) => c.id === req.category);
                    const reqBids = getBidsForMyRequest(req.id);

                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequestForDetail(req)}
                        className="group rounded-3xl border border-border/80 bg-card p-4.5 shadow-sm hover:border-purple-500/40 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-purple-500">
                                #{req.id}
                              </span>
                              <Badge variant={statusInfo.badgeVariant} className="text-[10px] py-0 px-2">
                                {statusInfo.tr}
                              </Badge>
                            </div>
                            <h3 className="text-sm font-bold text-foreground mt-1 flex items-center gap-1.5">
                              <span>{categoryConfig?.iconEmoji}</span>
                              <span>{categoryConfig?.labelTr}</span>
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              "{req.problemDescription}"
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {req.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {req.preferredDateTime}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                              {reqBids.length} Teklif
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{req.notes ? `Not: ${req.notes}` : 'Ek not yok'}</span>
                          <span className="font-semibold text-purple-500 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
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
        {/* CRAFTSMAN VIEW (HİZMET VEREN / USTA) */}
        {/* ========================================================================= */}
        {currentRole === 'provider' && (
          <>
            {/* If NOT verified specifically for craftsman, show Craftsman ProviderGuardView */}
            {!isCraftsmanVerified ? (
              <ProviderGuardView serviceType="craftsman" />
            ) : (
              /* Verified Craftsman View */
              <div className="mt-5 px-4 space-y-6">
                {/* Open Marketplace Requests */}
                <div>
                  <div className="mb-3 px-2 flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Açık Usta Talepleri (Pazar Yeri)
                    </h2>
                    <span className="text-[11px] font-medium text-purple-500">
                      {craftsmanMarketplaceRequests.length} Talep
                    </span>
                  </div>

                  {craftsmanMarketplaceRequests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-5 text-center text-xs text-muted-foreground">
                      Şu anda teklif verilebilecek açık usta talebi bulunmuyor.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {craftsmanMarketplaceRequests.map((req) => {
                        const statusInfo = CRAFTSMAN_STATUS_LABELS[req.status];
                        const categoryConfig = CRAFTSMAN_CATEGORIES_CONFIG.find((c) => c.id === req.category);
                        const hasGivenBid = myBids.some((b) => b.requestId === req.id);

                        return (
                          <div
                            key={req.id}
                            onClick={() => setSelectedRequestForBid(req)}
                            className="group rounded-3xl border border-border/80 bg-card p-4.5 shadow-sm hover:border-purple-500/40 hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-semibold text-purple-500">
                                    Talep #{req.id}
                                  </span>
                                  <Badge variant={statusInfo.badgeVariant} className="text-[10px] py-0 px-2">
                                    {statusInfo.tr}
                                  </Badge>
                                </div>
                                <h3 className="text-sm font-bold text-foreground mt-1 group-hover:text-purple-500 transition-colors flex items-center gap-1.5">
                                  <span>{categoryConfig?.iconEmoji}</span>
                                  <span>{categoryConfig?.labelTr}</span>
                                </h3>
                              </div>

                              {hasGivenBid && (
                                <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-blue-500">
                                  Teklifiniz Var
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-xs text-foreground bg-muted/40 p-2.5 rounded-xl leading-relaxed">
                              "{req.problemDescription}"
                            </p>

                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-purple-500" />
                                {req.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-purple-500" />
                                {req.preferredDateTime}
                              </span>
                            </div>

                            {req.notes && (
                              <p className="mt-2 text-[11px] text-muted-foreground">
                                Not: {req.notes}
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
                                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm"
                              >
                                {hasGivenBid ? 'Teklifi Düzenle' : 'Teklif İlet'}
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
                      Henüz bir usta talebine teklif vermediniz.
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
                              "{bid.bidNote}" ({bid.estimatedDuration})
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm text-purple-500">
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
      <CreateCraftsmanRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <CraftsmanRequestDetailModal
        isOpen={!!selectedRequestForDetail}
        onClose={() => setSelectedRequestForDetail(null)}
        request={selectedRequestForDetail}
      />

      <SubmitCraftsmanBidModal
        isOpen={!!selectedRequestForBid}
        onClose={() => setSelectedRequestForBid(null)}
        request={selectedRequestForBid}
      />
    </div>
  );
}
