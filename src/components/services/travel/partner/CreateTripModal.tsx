'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Sparkles, AlertCircle, Coins, Bus, MapPin } from 'lucide-react';
import { useTravelPartnerStore } from '@/stores/useTravelPartnerStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLocaleRender } from '@/lib/i18n/runtime';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTripModal({ isOpen, onClose }: CreateTripModalProps) {
  const localizeText = useLocaleRender();
  const { getMyRoutes, getMyVehicles, addDraftTrip } = useTravelPartnerStore();

  const routes = getMyRoutes();
  const vehicles = getMyVehicles();

  const [routeId, setRouteId] = useState(routes[0]?.id || '');
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [departureDateTime, setDepartureDateTime] = useState('');
  const [baseTicketPrice, setBaseTicketPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!routeId) {
      setError('Lütfen bir güzergah seçin.');
      return;
    }

    if (!vehicleId) {
      setError('Lütfen sefer için bir araç seçin.');
      return;
    }

    if (!departureDateTime.trim()) {
      setError('Lütfen kalkış tarih ve saatini girin.');
      return;
    }

    const numericPrice = parseFloat(baseTicketPrice);
    if (!baseTicketPrice.trim() || isNaN(numericPrice) || numericPrice <= 0) {
      setError('Lütfen geçerli bir taban bilet fiyatı girin.');
      return;
    }

    addDraftTrip({
      routeId,
      vehicleId,
      departureDateTime,
      baseTicketPrice: numericPrice,
      notes,
    });

    setDepartureDateTime('');
    setBaseTicketPrice('');
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
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-xl font-bold text-foreground">{localizeText("Yeni Sefer Taslağı Oluştur")}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{localizeText("Rota, araç, kalkış saati ve taban bilet fiyatı belirleyin.")}</p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{localizeText(error)}</span>
              </div>
            )}

            {routes.length === 0 || vehicles.length === 0 ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-foreground space-y-2">
                <div className="font-bold text-amber-600 dark:text-amber-400">{localizeText("Önce Araç ve Rota Tanımlanmalı")}</div>
                <p className="text-[11px] text-muted-foreground">{localizeText("Sefer taslağı oluşturabilmek için en az 1 araç ve 1 güzergah kaydı bulunmalıdır.")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Route Selection */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">{localizeText("Güzergah / Hat Seçin *")}</label>
                  <select
                    value={routeId}
                    onChange={(e) => setRouteId(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    {routes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {localizeText(rt.originCity)} → {localizeText(rt.destinationCity)} (~{localizeText(rt.estimatedDurationHours)}{localizeText(" Saat)")}</option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Selection */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">{localizeText("Görevli Otobüs / Araç *")}</label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {localizeText(v.vehicleCode)} ({localizeText(v.plateNumber)}) — {localizeText(v.seatCapacity)}{localizeText(" Koltuk")}</option>
                    ))}
                  </select>
                </div>

                {/* Departure Date/Time & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Input
                    label={localizeText("Kalkış Tarih ve Saati *")}
                    placeholder={localizeText("Örn: 2026-09-28 22:30")}
                    value={departureDateTime}
                    onChange={(e) => setDepartureDateTime(e.target.value)}
                    icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                    required
                  />

                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">{localizeText("Taban Bilet Fiyatı (TL) *")}</label>
                    <input
                      type="number"
                      placeholder={localizeText("Örn: 650")}
                      value={baseTicketPrice}
                      onChange={(e) => setBaseTicketPrice(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Draft Status Notice */}
                <div className="rounded-2xl border border-border/80 bg-muted/30 p-3 text-xs text-muted-foreground">
                  <p className="text-[11px] leading-relaxed">{localizeText("ℹ️ Bu sefer")}<strong>{localizeText("Taslak")}</strong>{localizeText("olarak kaydedilir. Henüz canlı yolcu arama sonuçlarında görünmez ve bilet satışı yapılmaz.")}</p>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-500/25"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />{localizeText("Sefer Taslağını Kaydet")}</Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
