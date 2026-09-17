'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, MapPin, Calendar, Home, Check, Sparkles } from 'lucide-react';
import { useServicesStore } from '@/stores/useServicesStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocationAutocompleteInput } from '@/components/services/common/LocationAutocompleteInput';
import { cn } from '@/lib/utils';
import type { MovingCategory } from '@/types/services';

interface CreateMovingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOVING_CATEGORIES: { id: MovingCategory; labelTr: string; icon: string }[] = [
  { id: 'home_to_home', labelTr: 'Evden Eve', icon: '🏡' },
  { id: 'partial_item', labelTr: 'Parça Eşya', icon: '📦' },
  { id: 'office', labelTr: 'Ofis / İşyeri', icon: '🏢' },
  { id: 'intercity', labelTr: 'Şehirlerarası', icon: '🛣️' },
];

export function CreateMovingRequestModal({
  isOpen,
  onClose,
}: CreateMovingRequestModalProps) {
  const { createTransportRequest } = useServicesStore();

  const [category, setCategory] = useState<MovingCategory>('home_to_home');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [movingDate, setMovingDate] = useState('');
  const [roomInfo, setRoomInfo] = useState('2+1');
  const [hasElevatorFrom, setHasElevatorFrom] = useState(true);
  const [hasElevatorTo, setHasElevatorTo] = useState(true);
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fromLocation.trim() || !toLocation.trim()) return;

    createTransportRequest({
      category,
      fromLocation,
      toLocation,
      movingDate: movingDate || 'Belirtilmedi',
      roomInfo,
      hasElevatorFrom,
      hasElevatorTo,
      notes,
    });

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
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl"
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
                Talebinizi oluşturun, onaylı nakliyecilerden teklif toplayın.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Picker */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Taşıma Türü
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MOVING_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-2xl border p-2.5 text-left text-xs font-semibold transition-all',
                        category === cat.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500'
                          : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                      )}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="truncate">{cat.labelTr}</span>
                      {category === cat.id && (
                        <Check className="ml-auto h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-3">
                <LocationAutocompleteInput
                  label="Nereden (İl / İlçe / Bölge) *"
                  placeholder="Örn: İstanbul - Kadıköy / Moda"
                  value={fromLocation}
                  onChange={(val) => setFromLocation(val)}
                  icon={<MapPin className="h-4 w-4 text-emerald-500" />}
                  required
                />
                <LocationAutocompleteInput
                  label="Nereye (İl / İlçe / Bölge) *"
                  placeholder="Örn: İzmir - Karşıyaka / Bostanlı"
                  value={toLocation}
                  onChange={(val) => setToLocation(val)}
                  icon={<MapPin className="h-4 w-4 text-teal-500" />}
                  required
                />
              </div>

              {/* Room Info & Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Hacim / Ev Tipi
                  </label>
                  <select
                    value={roomInfo}
                    onChange={(e) => setRoomInfo(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="1+1">1+1 Daire</option>
                    <option value="2+1">2+1 Daire</option>
                    <option value="3+1">3+1 Daire</option>
                    <option value="4+1">4+1 veya Villa</option>
                    <option value="Parça Eşya">Parça / Az Eşya</option>
                    <option value="Ofis">Ofis / Büro</option>
                  </select>
                </div>

                <Input
                  label="Tahmini Tarih"
                  type="date"
                  value={movingDate}
                  onChange={(e) => setMovingDate(e.target.value)}
                />
              </div>

              {/* Elevator Options */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/30 p-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasElevatorFrom}
                    onChange={(e) => setHasElevatorFrom(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Yükleme Asansörü</span>
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/30 p-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasElevatorTo}
                    onChange={(e) => setHasElevatorTo(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Varış Asansörü</span>
                </label>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Talebi Yayınla & Teklif Al
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
