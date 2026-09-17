'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Wrench,
  MapPin,
  Calendar,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldCheck,
  Ban,
  Clock,
  Timer,
} from 'lucide-react';
import { useCraftsmanStore } from '@/stores/useCraftsmanStore';
import {
  CRAFTSMAN_CATEGORIES_CONFIG,
  CRAFTSMAN_STATUS_LABELS,
  type CraftsmanRequest,
  type CraftsmanBid,
} from '@/types/craftsman';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface CraftsmanRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CraftsmanRequest | null;
}

export function CraftsmanRequestDetailModal({
  isOpen,
  onClose,
  request,
}: CraftsmanRequestDetailModalProps) {
  const { getBidsForMyRequest, acceptBid, cancelRequest } = useCraftsmanStore();
  const [lockedActionNotice, setLockedActionNotice] = useState<string | null>(null);

  if (!request) return null;

  const bids = getBidsForMyRequest(request.id);
  const statusInfo = CRAFTSMAN_STATUS_LABELS[request.status];
  const categoryConfig = CRAFTSMAN_CATEGORIES_CONFIG.find((c) => c.id === request.category);
  const isMatchConfirmed = request.status === 'match_confirmed';
  const acceptedBid = bids.find((b) => b.id === request.acceptedBidId || b.status === 'accepted');

  function handleAccept(bid: CraftsmanBid) {
    if (!request) return;
    acceptBid(request.id, bid.id);
  }

  function handleCancel() {
    if (!request) return;
    cancelRequest(request.id);
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

            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-purple-500">
                  Talep #{request.id}
                </span>
                <Badge variant={statusInfo.badgeVariant} className="text-[10px] py-0 px-2">
                  {statusInfo.tr}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-foreground mt-1">
                Usta Talebi Detayı
              </h3>
            </div>

            {/* Request Summary Card */}
            <div className="mb-5 rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <span className="text-base">{categoryConfig?.iconEmoji || '🛠️'}</span>
                <span>{categoryConfig?.labelTr || 'Ustalık Hizmeti'}</span>
              </div>

              <div className="bg-card/60 p-3 rounded-xl border border-border/40 text-foreground leading-relaxed">
                "{request.problemDescription}"
              </div>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-[11px] pt-1 border-t border-border/30">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-purple-500" />
                  {request.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-purple-500" />
                  {request.preferredDateTime}
                </span>
              </div>

              {request.notes && (
                <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                  Not: {request.notes}
                </div>
              )}
            </div>

            {/* MATCH CONFIRMED STATE */}
            {isMatchConfirmed && (
              <div className="mb-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4.5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Eşleşme Onaylandı!</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ustanız talebinizi kabul etti ve belirtilen saatte adresinizde olacaktır.
                </p>

                {acceptedBid && (
                  <div className="rounded-xl border border-emerald-500/30 bg-card p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-foreground">{acceptedBid.craftsmanAnonymousTitle}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Tahmini Süre: {acceptedBid.estimatedDuration}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-500 text-sm">
                        {acceptedBid.price.toLocaleString('tr-TR')} {acceptedBid.currency}
                      </div>
                      <span className="text-[10px] text-muted-foreground">Sabit Teklif</span>
                    </div>
                  </div>
                )}

                {/* Coming soon buttons for calling / messaging */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    onClick={() =>
                      setLockedActionNotice(
                        'Arama özelliği çok yakında sizlerle. Güvenli hat entegrasyonu tamamlanana kadar kişisel telefon numaraları gizli tutulmaktadır.'
                      )
                    }
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs flex items-center justify-center gap-1.5 border-emerald-500/30"
                  >
                    <Phone className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Arama (Çok Yakında)</span>
                  </Button>
                  <Button
                    onClick={() =>
                      setLockedActionNotice(
                        'Mesajlaşma çok yakında sizlerle. Uçtan uca şifreli usta mesajlaşma sistemi üzerinde çalışıyoruz.'
                      )
                    }
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs flex items-center justify-center gap-1.5 border-emerald-500/30"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Mesajlaşma (Çok Yakında)</span>
                  </Button>
                </div>

                {lockedActionNotice && (
                  <div className="rounded-xl bg-muted/60 p-2.5 text-[11px] text-muted-foreground border border-border/40 flex items-start gap-2">
                    <Clock className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>{lockedActionNotice}</span>
                  </div>
                )}
              </div>
            )}

            {/* INCOMING BIDS LIST (When waiting for bids) */}
            {!isMatchConfirmed && request.status !== 'cancelled' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Gelen Teklifler ({bids.length})
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    Usta & Fiyat Seçin
                  </span>
                </div>

                {bids.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-5 text-center text-xs text-muted-foreground">
                    Şu anda henüz teklif gelmedi. Uygun ustalar inceliyor...
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {bids.map((bid) => (
                      <div
                        key={bid.id}
                        className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm hover:border-purple-500/40 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                              <Wrench className="h-4 w-4 text-purple-500" />
                              <span>{bid.craftsmanAnonymousTitle}</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Timer className="h-3 w-3 text-muted-foreground" />
                              <span>Süre: {bid.estimatedDuration}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-base text-purple-500">
                              {bid.price.toLocaleString('tr-TR')} {bid.currency}
                            </div>
                            <span className="text-[10px] text-muted-foreground">Hizmet Bedeli</span>
                          </div>
                        </div>

                        {bid.bidNote && (
                          <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/30">
                            "{bid.bidNote}"
                          </p>
                        )}

                        <Button
                          onClick={() => handleAccept(bid)}
                          size="sm"
                          className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Teklifi Kabul Et & Eşleş
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Cancel Request Option */}
            {request.status === 'waiting_bids' && (
              <div className="mt-5 pt-3 border-t border-border/40 text-center">
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-xs text-muted-foreground hover:text-destructive"
                >
                  <Ban className="h-3.5 w-3.5 mr-1" />
                  Talebi İptal Et
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
