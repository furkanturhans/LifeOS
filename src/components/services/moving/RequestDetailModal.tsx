'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { useMovingStore } from '@/stores/useMovingStore';
import { MOVING_STATUS_LABELS, type MovingRequest } from '@/types/moving';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LockedServicesModal } from '@/components/services/LockedServicesModal';

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: MovingRequest | null;
}

export function RequestDetailModal({
  isOpen,
  onClose,
  request,
}: RequestDetailModalProps) {
  const { getBidsForMyRequest, acceptBid } = useMovingStore();
  const [lockedMsgTitle, setLockedMsgTitle] = useState<string | null>(null);

  if (!request) return null;

  const rawBids = getBidsForMyRequest(request.id);
  // Guarantee deduplication by bid.id
  const bids = Array.from(new Map(rawBids.map((b) => [b.id, b])).values());

  const statusLabel = MOVING_STATUS_LABELS[request.status];
  const isMatched = request.status === 'match_confirmed';

  function handleAccept(bidId: string) {
    if (!request) return;
    acceptBid(request.id, bidId);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header & Status */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-emerald-500">
                  Talep #{request.id}
                </span>
                <Badge variant={statusLabel.badgeVariant} className="text-[10px] py-0 px-2">
                  {statusLabel.tr}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-foreground mt-1">
                {request.fromCity} → {request.toCity}
              </h3>
            </div>

            {/* Request Summary */}
            <div className="mb-5 rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Package className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>{request.loadDescription}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-[11px] pt-1 border-t border-border/30">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                  {request.requestedDate}
                </span>
                {request.notes && (
                  <span>Not: {request.notes}</span>
                )}
              </div>
            </div>

            {/* Matched Success Banner (Eşleşme Onaylandı Durumu) */}
            {isMatched && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-5 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 to-teal-500/5 p-4 text-center"
              >
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  Eşleşme Onaylandı!
                </h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Taşıyıcı teklifi kabul edildi. Taşıma detayları için iletişim kanalları hazırlanıyor.
                </p>

                {/* Coming Soon Chat & Call actions */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLockedMsgTitle('Mesajlaşma')}
                    className="flex items-center justify-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-card p-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Mesajlaşma Çok Yakında</span>
                  </button>

                  <button
                    onClick={() => setLockedMsgTitle('Arama Özelliği')}
                    className="flex items-center justify-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-card p-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Arama Çok Yakında</span>
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Kişisel veriler ve telefon numaraları gizlilik gereği korunmaktadır.</span>
                </div>
              </motion.div>
            )}

            {/* Incoming Bids Section */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Gelen Fiyat Teklifleri ({bids.length})
                </h4>
                <span className="text-[11px] text-emerald-500 font-medium">
                  Gizli Teklifler
                </span>
              </div>

              {bids.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 bg-card/50 p-6 text-center text-xs text-muted-foreground">
                  <Clock className="mx-auto mb-2 h-6 w-6 text-amber-500" />
                  <span>Onaylı nakliyecilerden teklif bekleniyor... Teklifler geldikçe burada listelenecektir.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {bids.map((bid) => {
                    const isBidAccepted = bid.status === 'accepted';

                    return (
                      <div
                        key={bid.id}
                        className={`rounded-2xl border p-4 transition-all ${
                          isBidAccepted
                            ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                            : 'border-border/80 bg-card'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground">
                                {bid.providerAnonymousTitle}
                              </span>
                              {isBidAccepted && (
                                <Badge variant="success" className="text-[10px] py-0 px-2">
                                  Kabul Edildi
                                </Badge>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {bid.providerVehicleInfo}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                              {bid.price.toLocaleString('tr-TR')} {bid.currency}
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              Sabit Teklif
                            </span>
                          </div>
                        </div>

                        {bid.bidNote && (
                          <p className="mt-2 text-xs text-muted-foreground bg-muted/40 p-2 rounded-xl">
                            "{bid.bidNote}"
                          </p>
                        )}

                        {/* Accept Button if not matched */}
                        {!isMatched && (
                          <div className="mt-3 pt-2 border-t border-border/40">
                            <Button
                              onClick={() => handleAccept(bid.id)}
                              size="sm"
                              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Teklifi Kabul Et & Eşleş
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Locked Modal for Chat/Call */}
      <LockedServicesModal
        isOpen={!!lockedMsgTitle}
        onClose={() => setLockedMsgTitle(null)}
        serviceTitle={lockedMsgTitle || 'Bu Özellik'}
      />
    </AnimatePresence>
  );
}
