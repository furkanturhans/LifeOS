'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Car,
  MapPin,
  Calendar,
  Users,
  FileText,
  Sparkles,
  Coins,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useTaxiStore } from '@/stores/useTaxiStore';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';
import { TAXI_VEHICLE_OPTIONS, type TaxiRequest } from '@/types/taxi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface SubmitTaxiBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: TaxiRequest | null;
}

export function SubmitTaxiBidModal({ isOpen, onClose, request }: SubmitTaxiBidModalProps) {
  const { config, submitBid, getExistingBidForRequest } = useTaxiStore();
  const { isVerifiedFor } = useProviderAuthStore();

  const [price, setPrice] = useState('');
  const [bidNote, setBidNote] = useState('');
  const [vehicleType, setVehicleType] = useState('Sarı Taksi - Sedan');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const existingBid = request ? getExistingBidForRequest(request.id) : undefined;
  const isTaxiVerified = isVerifiedFor('taxi');
  const isSelfRequest = request?.creatorId === 'current_user_me';

  useEffect(() => {
    if (request && isOpen) {
      if (existingBid) {
        setPrice(existingBid.price.toString());
        setBidNote(existingBid.bidNote);
        setVehicleType(existingBid.vehicleType);
      } else {
        setPrice('');
        setBidNote('');
        setVehicleType('Sarı Taksi - Sedan');
      }
      setValidationError(null);
      setIsSuccess(false);
    }
  }, [request, isOpen, existingBid]);

  if (!request) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (isSelfRequest) {
      setValidationError('Kendi oluşturduğunuz yolculuk talebine teklif veremezsiniz.');
      return;
    }

    if (!isTaxiVerified) {
      setValidationError('Teklif verebilmek için Taksi Hizmet Veren Başvurunuzun onaylanması gerekir.');
      return;
    }

    const numericPrice = parseFloat(price);
    if (!price.trim() || isNaN(numericPrice) || numericPrice <= 0) {
      setValidationError('Lütfen geçerli bir sabit teklif fiyatı girin.');
      return;
    }

    if (!bidNote.trim()) {
      setValidationError('Lütfen yolcuya sunacağınız hizmet veya tahmini varış süresi hakkında kısa bir açıklama notu girin.');
      return;
    }

    if (!request) return;

    try {
      submitBid({
        requestId: request.id,
        price: numericPrice,
        bidNote: bidNote.trim(),
        vehicleType: vehicleType.trim() || 'Sarı Taksi - Sedan',
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
                <span className="font-mono text-xs font-semibold text-amber-500">
                  Talep #{request.id}
                </span>
                <Badge variant="warning" className="text-[10px] py-0 px-2">
                  {existingBid ? 'Teklifiniz Kayıtlı' : 'Açık Taksi Talebi'}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-foreground mt-1">
                {existingBid ? 'Taksi Teklifini Güncelle' : 'Sabit Fiyat Teklifi Ver'}
              </h3>
            </div>

            {/* Anonymous Request Details */}
            <div className="mb-5 rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <span>{request.pickupLocation} → {request.dropoffLocation}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-[11px] pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" />
                  {request.requestedDateTime}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-amber-500" />
                  {request.passengerCount} Yolcu
                </span>
              </div>

              {request.notes && (
                <div className="flex items-start gap-2 text-muted-foreground bg-card/60 p-2.5 rounded-xl border border-border/40">
                  <FileText className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-foreground">Yolcu Notu: {request.notes}</span>
                </div>
              )}
            </div>

            {/* Self-Bid Block Warning */}
            {isSelfRequest && (
              <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-start gap-2.5">
                <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Kendi Talebinize Teklif Veremezsiniz</div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Bu taksi talebini siz oluşturdunuz. Kendi taleplerinize teklif iletemezsiniz.
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
                  Yolcu teklifinizi onayladığında eşleşme durumu güncellenecektir.
                </p>
              </div>
            ) : (
              /* Bid Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {validationError && (
                  <div className="flex items-center gap-2 rounded-2xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Price */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Sabit Yolculuk Teklifi (TL) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Örn: 450"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isSelfRequest}
                      className="w-full rounded-2xl border border-border bg-card p-3 pl-4 pr-12 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                      {config.currency}
                    </span>
                  </div>
                </div>

                {/* Vehicle type */}
                <Input
                  label="Araç ve Segment Tipi"
                  placeholder="Örn: Sarı Taksi - Fiat Egea / Sedan"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  icon={<Car className="h-4 w-4 text-muted-foreground" />}
                  disabled={isSelfRequest}
                />

                {/* Description / Bid Note */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Kısa Açıklama & Tahmini Varış *
                  </label>
                  <textarea
                    value={bidNote}
                    onChange={(e) => setBidNote(e.target.value)}
                    placeholder="Örn: Bölgenize 5 dakika mesafedeyim. Temiz ve klimalı araç ile sabit ücret garantisi."
                    rows={2}
                    disabled={isSelfRequest}
                    className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                    required
                  />
                </div>

                {/* Mandatory Credit Info text: "Bu teklif için 80 TL teklif kredisi kullanılır." */}
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
                    className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50"
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
