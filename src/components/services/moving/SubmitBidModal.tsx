'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Truck,
  MapPin,
  Calendar,
  Package,
  FileText,
  Sparkles,
  Coins,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useMovingStore } from '@/stores/useMovingStore';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';
import { MOVING_CATEGORY_DEFINITIONS, type MovingRequest } from '@/types/moving';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface SubmitBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: MovingRequest | null;
}

export function SubmitBidModal({ isOpen, onClose, request }: SubmitBidModalProps) {
  const { config, submitBid, getExistingBidForRequest } = useMovingStore();
  const { isVerifiedFor } = useProviderAuthStore();

  const [price, setPrice] = useState('');
  const [bidNote, setBidNote] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('Kapalı Kasa Kamyonet / Asansörlü');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const existingBid = request ? getExistingBidForRequest(request.id) : undefined;
  const isMovingVerified = isVerifiedFor('moving');
  const isSelfRequest = request?.creatorId === 'current_user_me';

  useEffect(() => {
    if (request && isOpen) {
      if (existingBid) {
        setPrice(existingBid.price.toString());
        setBidNote(existingBid.bidNote);
        setVehicleInfo(existingBid.providerVehicleInfo);
      } else {
        setPrice('');
        setBidNote('');
        setVehicleInfo('Kapalı Kasa Kamyonet / Asansörlü');
      }
      setValidationError(null);
      setIsSuccess(false);
    }
  }, [request, isOpen, existingBid]);

  if (!request) return null;

  const categoryDef = MOVING_CATEGORY_DEFINITIONS.find((c) => c.id === request.movingType);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (isSelfRequest) {
      setValidationError('Kendi oluşturduğunuz taşıma talebine teklif veremezsiniz.');
      return;
    }

    if (!isMovingVerified) {
      setValidationError('Teklif verebilmek için Nakliye Hizmet Veren Başvurunuzun onaylanması gerekir.');
      return;
    }

    const numericPrice = parseFloat(price);
    if (!price.trim() || isNaN(numericPrice) || numericPrice <= 0) {
      setValidationError('Lütfen geçerli bir teklif fiyatı girin.');
      return;
    }

    if (!bidNote.trim()) {
      setValidationError('Lütfen müşteriye sunulan hizmet kapsamını veya kısa bir açıklama notu girin.');
      return;
    }

    if (!request) return;

    try {
      submitBid({
        requestId: request.id,
        price: numericPrice,
        bidNote: bidNote.trim(),
        providerVehicleInfo: vehicleInfo.trim() || 'Kapalı Kasa Kamyonet / Asansörlü',
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setValidationError(err?.message || 'Teklif iletilirken bir hata oluştu.');
    }
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
                <span className="font-mono text-xs font-semibold text-emerald-500">
                  İlan #{request.id}
                </span>
                <Badge variant="warning" className="text-[10px] py-0 px-2">
                  {existingBid ? 'Teklifiniz Kayıtlı' : 'Açık Taşıma İlanı'}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-foreground mt-1">
                {existingBid ? 'Fiyat Teklifini Güncelle' : 'Fiyat Teklifi İlet'}
              </h3>
            </div>

            {/* Anonymous Request Details (NO Customer name/phone/address) */}
            <div className="mb-5 rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>{request.fromCity} → {request.toCity}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-base">{categoryDef?.iconEmoji || '📦'}</span>
                <span className="font-medium text-foreground">{categoryDef?.labelTr || 'Taşıma'}</span>
              </div>

              <div className="flex items-start gap-2 text-muted-foreground bg-card/60 p-2.5 rounded-xl">
                <Package className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed text-foreground">{request.loadDescription}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-[11px] pt-1 border-t border-border/30">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                  {request.requestedDate}
                </span>
                {request.notes && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-emerald-500" />
                    Not: {request.notes}
                  </span>
                )}
              </div>
            </div>

            {/* Self-Bid Block Warning */}
            {isSelfRequest && (
              <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-start gap-2.5">
                <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Kendi Talebinize Teklif Veremezsiniz</div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Bu talep sizin tarafınızdan oluşturulmuştur. LifeOS güvenlik kuralları gereği kendi ilanlarınıza teklif iletemezsiniz.
                  </p>
                </div>
              </div>
            )}

            {/* Success Feedback */}
            {isSuccess ? (
              <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-6 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-500" />
                <h4 className="text-base font-bold text-foreground">
                  Teklif Başarıyla İletildi!
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Müşteri teklifinizi incelediğinde durum güncellenecektir.
                </p>
              </div>
            ) : (
              /* Bid Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Validation Error Alert */}
                {validationError && (
                  <div className="flex items-center gap-2 rounded-2xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Price & Currency */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Teklif Fiyatı (TL) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Örn: 14500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isSelfRequest}
                      className="w-full rounded-2xl border border-border bg-card p-3 pl-4 pr-12 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                      {config.currency}
                    </span>
                  </div>
                </div>

                {/* Vehicle info */}
                <Input
                  label="Araç ve Ekipman Tipi"
                  placeholder="Örn: Kapalı Kasa Kamyonet / Asansörlü"
                  value={vehicleInfo}
                  onChange={(e) => setVehicleInfo(e.target.value)}
                  icon={<Truck className="h-4 w-4 text-muted-foreground" />}
                  disabled={isSelfRequest}
                />

                {/* Description / Bid Note */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Açıklama / Hizmet Notu *
                  </label>
                  <textarea
                    value={bidNote}
                    onChange={(e) => setBidNote(e.target.value)}
                    placeholder="Örn: 2 kişilik profesyonel taşıma ekibi, eşyaların balonlu naylonla sarılması ve mobilya montajı fiyata dahildir."
                    rows={3}
                    disabled={isSelfRequest}
                    className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                    required
                  />
                </div>

                {/* Required Visible Credit Text */}
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-foreground">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <Coins className="h-4 w-4 text-amber-500" />
                      <span>Teklif Kredisi Bilgisi</span>
                    </div>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {config.bidCreditFee} {config.currency}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-foreground leading-relaxed">
                    Bu teklif için <strong>{config.bidCreditFee} {config.currency}</strong> teklif kredisi kullanılır.
                  </p>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSelfRequest}
                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {existingBid ? 'Teklifi Güncelle' : 'Teklif Ver'}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
