'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Wrench,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Sparkles,
  Coins,
  AlertCircle,
  CheckCircle2,
  Lock,
  Timer,
} from 'lucide-react';
import { useCraftsmanStore } from '@/stores/useCraftsmanStore';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';
import {
  CRAFTSMAN_CATEGORIES_CONFIG,
  type CraftsmanRequest,
} from '@/types/craftsman';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface SubmitCraftsmanBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CraftsmanRequest | null;
}

export function SubmitCraftsmanBidModal({
  isOpen,
  onClose,
  request,
}: SubmitCraftsmanBidModalProps) {
  const { config, submitBid, getExistingBidForRequest } = useCraftsmanStore();
  const { isVerifiedFor } = useProviderAuthStore();

  const [price, setPrice] = useState('');
  const [bidNote, setBidNote] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('1-2 Saat');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const existingBid = request ? getExistingBidForRequest(request.id) : undefined;
  const isCraftsmanVerified = isVerifiedFor('craftsman');
  const isSelfRequest = request?.creatorId === 'current_user_me';

  useEffect(() => {
    if (request && isOpen) {
      if (existingBid) {
        setPrice(existingBid.price.toString());
        setBidNote(existingBid.bidNote);
        setEstimatedDuration(existingBid.estimatedDuration);
      } else {
        setPrice('');
        setBidNote('');
        setEstimatedDuration('1-2 Saat');
      }
      setValidationError(null);
      setIsSuccess(false);
    }
  }, [request, isOpen, existingBid]);

  if (!request) return null;

  const categoryConfig = CRAFTSMAN_CATEGORIES_CONFIG.find((c) => c.id === request.category);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (isSelfRequest) {
      setValidationError('Kendi oluşturduğunuz usta talebine teklif veremezsiniz.');
      return;
    }

    if (!isCraftsmanVerified) {
      setValidationError('Teklif verebilmek için Usta Hizmet Veren Başvurunuzun onaylanması gerekir.');
      return;
    }

    const numericPrice = parseFloat(price);
    if (!price.trim() || isNaN(numericPrice) || numericPrice <= 0) {
      setValidationError('Lütfen geçerli bir teklif fiyatı girin.');
      return;
    }

    if (!bidNote.trim()) {
      setValidationError('Lütfen müşteriye yapılacak işçilik, malzeme durumu veya garanti hakkında bir açıklama girin.');
      return;
    }

    if (!estimatedDuration.trim()) {
      setValidationError('Lütfen tahmini tamamlanma süresini belirtin.');
      return;
    }

    if (!request) return;

    try {
      submitBid({
        requestId: request.id,
        price: numericPrice,
        bidNote: bidNote.trim(),
        estimatedDuration: estimatedDuration.trim(),
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
                <span className="font-mono text-xs font-semibold text-purple-500">
                  Talep #{request.id}
                </span>
                <Badge variant="secondary" className="text-[10px] py-0 px-2">
                  {existingBid ? 'Teklifiniz Kayıtlı' : 'Açık Usta Talebi'}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-foreground mt-1">
                {existingBid ? 'Ustalık Teklifini Güncelle' : 'Fiyat ve Süre Teklifi İlet'}
              </h3>
            </div>

            {/* Anonymous Request Details */}
            <div className="mb-5 rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <span className="text-base">{categoryConfig?.iconEmoji || '🛠️'}</span>
                <span>{categoryConfig?.labelTr || 'Ustalık Hizmeti'}</span>
              </div>

              <div className="bg-card/60 p-3 rounded-xl border border-border/40 text-foreground leading-relaxed">
                "{request.problemDescription}"
              </div>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-[11px] pt-1">
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
                  Müşteri Notu: {request.notes}
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
                    Bu usta talebini siz oluşturdunuz. Kendi taleplerinize teklif iletemezsiniz.
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
                  Müşteri teklifinizi onayladığında eşleşme tamamlanacaktır.
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
                    Hizmet & İşçilik Teklifi (TL) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Örn: 850"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isSelfRequest}
                      className="w-full rounded-2xl border border-border bg-card p-3 pl-4 pr-12 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                      {config.currency}
                    </span>
                  </div>
                </div>

                {/* Estimated Duration */}
                <Input
                  label="Tahmini Tamamlanma Süresi *"
                  placeholder="Örn: 2-3 Saat / Aynı Gün / 1 Gün"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  icon={<Timer className="h-4 w-4 text-muted-foreground" />}
                  disabled={isSelfRequest}
                  required
                />

                {/* Description / Bid Note */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Açıklama & Garanti / Kapsam Notu *
                  </label>
                  <textarea
                    value={bidNote}
                    onChange={(e) => setBidNote(e.target.value)}
                    placeholder="Örn: Gerekli tüm profesyonel aletlerle geleceğim. Değişen parçalara 1 yıl işçilik garantisi verilir."
                    rows={3}
                    disabled={isSelfRequest}
                    className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
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
                    className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 font-semibold text-white shadow-lg shadow-purple-500/25 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
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
