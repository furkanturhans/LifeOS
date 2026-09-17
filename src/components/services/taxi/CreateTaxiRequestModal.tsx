'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Calendar,
  Users,
  FileText,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useTaxiStore } from '@/stores/useTaxiStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocationAutocompleteInput } from '@/components/services/common/LocationAutocompleteInput';

interface CreateTaxiRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTaxiRequestModal({ isOpen, onClose }: CreateTaxiRequestModalProps) {
  const { createTaxiRequest } = useTaxiStore();

  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [requestedDateTime, setRequestedDateTime] = useState('Hemen (En Kısa Sürede)');
  const [passengerCount, setPassengerCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!pickupLocation.trim() || !dropoffLocation.trim()) {
      setError('Lütfen alınış ve varış bölgelerini girin.');
      return;
    }

    createTaxiRequest({
      pickupLocation,
      dropoffLocation,
      requestedDateTime,
      passengerCount,
      notes,
    });

    // Reset & Close
    setPickupLocation('');
    setDropoffLocation('');
    setRequestedDateTime('Hemen (En Kısa Sürede)');
    setPassengerCount(1);
    setNotes('');
    onClose();
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
            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl shadow-lg shadow-amber-500/20 text-white">
                🚕
              </div>
              <h3 className="text-xl font-bold text-foreground">Yolculuk Talebi Oluştur</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Konumunuza en yakın onaylı taksi şoförlerinden sabit fiyat teklifleri toplayın.
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Pickup & Dropoff */}
              <div className="space-y-3">
                <LocationAutocompleteInput
                  label="Alınış İli / Bölgesi *"
                  placeholder="Örn: İstanbul - Kadıköy Rıhtım / Moda"
                  value={pickupLocation}
                  onChange={(val) => setPickupLocation(val)}
                  icon={<MapPin className="h-4 w-4 text-amber-500" />}
                  required
                />
                <LocationAutocompleteInput
                  label="Varış İli / Bölgesi *"
                  placeholder="Örn: İstanbul - Sabiha Gökçen Havalimanı"
                  value={dropoffLocation}
                  onChange={(val) => setDropoffLocation(val)}
                  icon={<MapPin className="h-4 w-4 text-orange-500" />}
                  required
                />
              </div>

              {/* Date/Time and Passenger Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Zamanlama *
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Hemen / 15 dk sonra / 19:30"
                    value={requestedDateTime}
                    onChange={(e) => setRequestedDateTime(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Yolcu Sayısı
                  </label>
                  <div className="flex items-center gap-1 rounded-2xl border border-border bg-card p-1">
                    {[1, 2, 3, 4, 6].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setPassengerCount(count)}
                        className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                          passengerCount === count
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {count === 6 ? '5+' : count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Extra Notes */}
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Ek Not & Özel İstekler (Opsiyonel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Örn: 2 büyük valizimiz var, geniş bagajlı araç rica ederiz."
                  rows={2}
                  className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Privacy Notice */}
              <div className="rounded-2xl border border-border/80 bg-muted/30 p-3 text-xs space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                  <span>Kişisel Veri ve Gizlilik Koruması</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Telefon numaranız, açık adresiniz ve tam kimliğiniz şoförlere gösterilmez. Yalnızca bölge ve yolculuk detayı iletilir.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-700"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Taksi Talebini Yayınla
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
