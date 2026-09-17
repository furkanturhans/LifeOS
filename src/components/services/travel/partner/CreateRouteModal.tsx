'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { useTravelPartnerStore } from '@/stores/useTravelPartnerStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocationAutocompleteInput } from '@/components/services/common/LocationAutocompleteInput';

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRouteModal({ isOpen, onClose }: CreateRouteModalProps) {
  const { addDraftRoute } = useTravelPartnerStore();

  const [originCity, setOriginCity] = useState('');
  const [originTerminal, setOriginTerminal] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationTerminal, setDestinationTerminal] = useState('');
  const [intermediateStops, setIntermediateStops] = useState('');
  const [estimatedDurationHours, setEstimatedDurationHours] = useState(6);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!originCity.trim() || !destinationCity.trim()) {
      setError('Lütfen kalkış ve varış illerini girin.');
      return;
    }

    const stopsArray = intermediateStops
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addDraftRoute({
      originCity,
      originTerminal: originTerminal.trim() || `${originCity} Otogarı`,
      destinationCity,
      destinationTerminal: destinationTerminal.trim() || `${destinationCity} Otogarı`,
      intermediateStops: stopsArray,
      estimatedDurationHours,
    });

    setOriginCity('');
    setOriginTerminal('');
    setDestinationCity('');
    setDestinationTerminal('');
    setIntermediateStops('');
    setEstimatedDurationHours(6);
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
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-xl font-bold text-foreground">Yeni Güzergah & Rota Ekle</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Kalkış ve varış noktaları ile isteğe bağlı ara durakları tanımlayın.
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <LocationAutocompleteInput
                  label="Kalkış İli / Şehir *"
                  placeholder="Örn: İstanbul"
                  value={originCity}
                  onChange={(val) => setOriginCity(val)}
                  icon={<MapPin className="h-4 w-4 text-blue-500" />}
                  required
                />
                <Input
                  label="Kalkış Otogarı / Terminal"
                  placeholder="Örn: Esenler / Alibeyköy"
                  value={originTerminal}
                  onChange={(e) => setOriginTerminal(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <LocationAutocompleteInput
                  label="Varış İli / Şehir *"
                  placeholder="Örn: Ankara"
                  value={destinationCity}
                  onChange={(val) => setDestinationCity(val)}
                  icon={<MapPin className="h-4 w-4 text-indigo-500" />}
                  required
                />
                <Input
                  label="Varış Otogarı / Terminal"
                  placeholder="Örn: AŞTİ"
                  value={destinationTerminal}
                  onChange={(e) => setDestinationTerminal(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Ara Duraklar (İsteğe Bağlı, Virgülle Ayırın)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Gebze, Kocaeli (İzmit), Düzce, Bolu"
                  value={intermediateStops}
                  onChange={(e) => setIntermediateStops(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Tahmini Varış Süresi (Saat)
                </label>
                <input
                  type="number"
                  value={estimatedDurationHours}
                  onChange={(e) => setEstimatedDurationHours(parseFloat(e.target.value) || 6)}
                  className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-500/25"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Rotayı Kaydet
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
