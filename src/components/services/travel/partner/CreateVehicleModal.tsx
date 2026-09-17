'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bus, Sparkles, AlertCircle } from 'lucide-react';
import { useTravelPartnerStore } from '@/stores/useTravelPartnerStore';
import { VEHICLE_TYPE_LABELS } from '@/types/travelPartner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CreateVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateVehicleModal({ isOpen, onClose }: CreateVehicleModalProps) {
  const { addDraftVehicle } = useTravelPartnerStore();

  const [vehicleCode, setVehicleCode] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<'2+1_comfort' | '2+2_standard'>('2+1_comfort');
  const [seatCapacity, setSeatCapacity] = useState(38);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!vehicleCode.trim()) {
      setError('Lütfen araç adı veya filo kodunu girin.');
      return;
    }

    if (!plateNumber.trim()) {
      setError('Lütfen araç plakasını girin.');
      return;
    }

    addDraftVehicle({
      vehicleCode,
      plateNumber,
      vehicleType,
      seatCapacity,
      features: ['Wi-Fi', '220V Priz', 'TV Ekran', 'İkram'],
    });

    setVehicleCode('');
    setPlateNumber('');
    setSeatCapacity(38);
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
              <h3 className="text-xl font-bold text-foreground">Yeni Araç Tanımla</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Filonuzdaki otobüsü koltuk düzeni ve kapasitesiyle sisteme kaydedin.
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Input
                  label="Araç Adı / Filo Kodu *"
                  placeholder="Örn: Travego-01 / 34-LIF-01"
                  value={vehicleCode}
                  onChange={(e) => setVehicleCode(e.target.value)}
                  icon={<Bus className="h-4 w-4 text-muted-foreground" />}
                  required
                />
                <Input
                  label="Plaka No *"
                  placeholder="Örn: 34 TRV 100"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Koltuk Düzeni & Araç Tipi *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVehicleType('2+1_comfort');
                      setSeatCapacity(38);
                    }}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                      vehicleType === '2+1_comfort'
                        ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-border/80 bg-muted/30 text-foreground'
                    }`}
                  >
                    <div>💺 2+1 Rahat Hat</div>
                    <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                      38 Koltuklu Geniş Otobüs
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVehicleType('2+2_standard');
                      setSeatCapacity(46);
                    }}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                      vehicleType === '2+2_standard'
                        ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-border/80 bg-muted/30 text-foreground'
                    }`}
                  >
                    <div>🚌 2+2 Standart</div>
                    <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                      46-54 Koltuklu Standart
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Koltuk Kapasitesi
                </label>
                <input
                  type="number"
                  value={seatCapacity}
                  onChange={(e) => setSeatCapacity(parseInt(e.target.value) || 38)}
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
                  Aracı Filoya Ekle
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
