'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Wrench,
  MapPin,
  Calendar,
  FileText,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useCraftsmanStore } from '@/stores/useCraftsmanStore';
import {
  CRAFTSMAN_CATEGORIES_CONFIG,
  type CraftsmanCategory,
} from '@/types/craftsman';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocationAutocompleteInput } from '@/components/services/common/LocationAutocompleteInput';
import { cn } from '@/lib/utils';

interface CreateCraftsmanRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCraftsmanRequestModal({
  isOpen,
  onClose,
}: CreateCraftsmanRequestModalProps) {
  const { createCraftsmanRequest } = useCraftsmanStore();

  const [category, setCategory] = useState<CraftsmanCategory>('electrical');
  const [problemDescription, setProblemDescription] = useState('');
  const [location, setLocation] = useState('');
  const [preferredDateTime, setPreferredDateTime] = useState('Hafta içi / En Kısa Sürede');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!problemDescription.trim()) {
      setError('Lütfen yapılacak işi veya sorunu kısaca açıklayın.');
      return;
    }

    if (!location.trim()) {
      setError('Lütfen il ve bölge bilginizi girin.');
      return;
    }

    createCraftsmanRequest({
      category,
      problemDescription,
      location,
      preferredDateTime,
      notes,
    });

    // Reset & Close
    setProblemDescription('');
    setLocation('');
    setPreferredDateTime('Hafta içi / En Kısa Sürede');
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
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-3xl shadow-lg shadow-purple-500/20 text-white">
                🛠️
              </div>
              <h3 className="text-xl font-bold text-foreground">Usta Talebi Oluştur</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                İhtiyacınıza uygun alandaki doğrulanmış ustalardan fiyat ve süre teklifi toplayın.
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Selector */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hizmet Kategorisi Seçin *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CRAFTSMAN_CATEGORIES_CONFIG.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          'flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all',
                          isSelected
                            ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500'
                            : 'border-border/80 bg-muted/30 hover:bg-muted/60'
                        )}
                      >
                        <span className="text-xl">{cat.iconEmoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-foreground truncate">
                            {cat.labelTr}
                          </div>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-purple-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Sorunun veya İhtiyacın Kısa Açıklaması *
                </label>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Örn: Mutfak lavabosu altındaki su borusundan damlama var, contaların değişmesi ve genel kontrol gerekiyor."
                  rows={3}
                  className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Location & Preferred Time */}
              <div className="space-y-2.5">
                <LocationAutocompleteInput
                  label="İl / İlçe / Bölge *"
                  placeholder="Örn: İstanbul - Kadıköy / Moda"
                  value={location}
                  onChange={(val) => setLocation(val)}
                  icon={<MapPin className="h-4 w-4 text-purple-500" />}
                  required
                />
                <Input
                  label="Uygun Tarih ve Saat *"
                  placeholder="Örn: Cumartesi 14:00 - 18:00"
                  value={preferredDateTime}
                  onChange={(e) => setPreferredDateTime(e.target.value)}
                  icon={<Calendar className="h-4 w-4 text-purple-500" />}
                  required
                />
              </div>

              {/* Extra Notes */}
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Ek Not (Opsiyonel)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Malzemeler evde hazır / Ustanın malzeme getirmesi gerekiyor"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Privacy Notice */}
              <div className="rounded-2xl border border-border/80 bg-muted/30 p-3 text-xs space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
                  <span>Gizlilik Garantisi</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Telefon numaranız, açık ev adresiniz ve kimlik bilgileriniz ustalara gösterilmez. Yalnızca bölge ve iş detayı iletilir.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 font-semibold text-white shadow-lg shadow-purple-500/25 hover:from-purple-700 hover:to-indigo-700"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Usta Talebini Yayınla
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
