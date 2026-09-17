'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, MapPin, Calendar, Check, Sparkles, Shield, FileText, Package } from 'lucide-react';
import { useMovingStore } from '@/stores/useMovingStore';
import { MOVING_CATEGORY_DEFINITIONS, type MovingCategoryType } from '@/types/moving';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRequestModal({ isOpen, onClose }: CreateRequestModalProps) {
  const { createMovingRequest } = useMovingStore();

  const [movingType, setMovingType] = useState<MovingCategoryType>('home_to_home');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [loadDescription, setLoadDescription] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fromCity.trim() || !toCity.trim() || !loadDescription.trim()) return;

    createMovingRequest({
      fromCity,
      toCity,
      movingType,
      loadDescription,
      requestedDate,
      notes,
    });

    // Reset and close
    setFromCity('');
    setToCity('');
    setLoadDescription('');
    setRequestedDate('');
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
            <div className="mb-5 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-2xl shadow-lg shadow-emerald-500/20 text-white">
                <Truck className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Taşıma Talebi Oluştur</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                İlanınızı yayınlayın, onaylı taşıyıcılardan gizli fiyat teklifleri toplayın.
              </p>
            </div>

            {/* Privacy Guarantee Box */}
            <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-600 dark:text-emerald-400">
              <Shield className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>Gizlilik Güvencesi:</strong> İsim, telefon ve açık adresiniz talep formunda istenmez ve nakliyecilere gösterilmez.
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Picker */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Taşıma Türü
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MOVING_CATEGORY_DEFINITIONS.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setMovingType(cat.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-2xl border p-2.5 text-left text-xs font-semibold transition-all',
                        movingType === cat.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500'
                          : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                      )}
                    >
                      <span className="text-base">{cat.iconEmoji}</span>
                      <span className="truncate">{cat.labelTr}</span>
                      {movingType === cat.id && (
                        <Check className="ml-auto h-3 w-3 text-emerald-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Route: Çıkış ve Varış İli */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  label="Çıkış İli / İlçesi"
                  placeholder="Örn: İstanbul - Kadıköy"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                  required
                />
                <Input
                  label="Varış İli / İlçesi"
                  placeholder="Örn: İzmir - Karşıyaka"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                  required
                />
              </div>

              {/* Load / Item Description */}
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Yaklaşık Yük / Ürün Bilgisi
                </label>
                <textarea
                  value={loadDescription}
                  onChange={(e) => setLoadDescription(e.target.value)}
                  placeholder="Örn: 2+1 ev eşyası, buzdolabı, çamaşır makinesi, koltuk takımı ve 15 adet koli."
                  rows={2}
                  className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Date & Extra Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  label="İstenen Taşıma Tarihi"
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                />
                <Input
                  label="Ek Not (Opsiyonel)"
                  placeholder="Örn: Yükleme tarafında asansör var"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Talebi Yayınla & Teklif Bekle
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
