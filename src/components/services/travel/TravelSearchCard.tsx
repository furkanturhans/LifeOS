'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Users,
  ArrowRightLeft,
  Search,
  AlertCircle,
  Plane,
  Building,
  Car,
  Clock,
  Briefcase,
} from 'lucide-react';
import { useTravelStore } from '@/stores/useTravelStore';
import { Button } from '@/components/ui/Button';
import { LocationAutocompleteInput } from '@/components/services/common/LocationAutocompleteInput';
import { cn } from '@/lib/utils';
import type { TravelTripType, FlightCabinClass } from '@/types/travel';

interface TravelSearchCardProps {
  onSearchExecuted?: () => void;
  onLockedFeatureClick?: (featureName: string) => void;
}

export function TravelSearchCard({ onSearchExecuted }: TravelSearchCardProps) {
  const {
    activeTab,
    busQuery,
    setBusQuery,
    swapBusLocations,
    flightQuery,
    setFlightQuery,
    swapFlightAirports,
    hotelQuery,
    setHotelQuery,
    carRentalQuery,
    setCarRentalQuery,
    executeSearch,
  } = useTravelStore();

  const [validationError, setValidationError] = useState<string | null>(null);
  const todayStr = new Date().toISOString().split('T')[0];

  // -------------------------------------------------------------------------
  // 1. OTOBÜS SUBMIT
  // -------------------------------------------------------------------------
  const handleBusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!busQuery.fromLocation.trim()) {
      setValidationError('Lütfen kalkış noktasını (Nereden) girin.');
      return;
    }
    if (!busQuery.toLocation.trim()) {
      setValidationError('Lütfen varış noktasını (Nereye) girin.');
      return;
    }
    if (busQuery.fromLocation.trim().toLowerCase() === busQuery.toLocation.trim().toLowerCase()) {
      setValidationError('Kalkış ve varış noktaları aynı olamaz.');
      return;
    }

    executeSearch('bus');
    if (onSearchExecuted) onSearchExecuted();
  };

  // -------------------------------------------------------------------------
  // 2. UÇAK SUBMIT
  // -------------------------------------------------------------------------
  const handleFlightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!flightQuery.fromAirport.trim()) {
      setValidationError('Lütfen kalkış havalimanını veya şehri girin.');
      return;
    }
    if (!flightQuery.toAirport.trim()) {
      setValidationError('Lütfen varış havalimanını veya şehri girin.');
      return;
    }
    if (flightQuery.fromAirport.trim().toLowerCase() === flightQuery.toAirport.trim().toLowerCase()) {
      setValidationError('Kalkış ve varış havalimanı aynı olamaz.');
      return;
    }

    executeSearch('flight');
    if (onSearchExecuted) onSearchExecuted();
  };

  // -------------------------------------------------------------------------
  // 3. OTEL SUBMIT
  // -------------------------------------------------------------------------
  const handleHotelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!hotelQuery.location.trim()) {
      setValidationError('Lütfen gitmek istediğiniz şehir, bölge veya otel adını girin.');
      return;
    }
    if (!hotelQuery.checkInDate) {
      setValidationError('Lütfen giriş tarihini seçin.');
      return;
    }
    if (!hotelQuery.checkOutDate) {
      setValidationError('Lütfen çıkış tarihini seçin.');
      return;
    }

    executeSearch('hotel');
    if (onSearchExecuted) onSearchExecuted();
  };

  // -------------------------------------------------------------------------
  // 4. ARAÇ KİRALAMA SUBMIT
  // -------------------------------------------------------------------------
  const handleCarRentalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!carRentalQuery.pickupLocation.trim()) {
      setValidationError('Lütfen alış noktasını (Havalimanı / Ofis) girin.');
      return;
    }
    if (!carRentalQuery.pickupDate) {
      setValidationError('Lütfen alış tarihini seçin.');
      return;
    }
    if (!carRentalQuery.dropoffDate) {
      setValidationError('Lütfen iade tarihini seçin.');
      return;
    }

    executeSearch('car_rental');
    if (onSearchExecuted) onSearchExecuted();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mt-4 overflow-hidden rounded-3xl border border-border/80 bg-card p-5 shadow-lg"
    >
      {validationError && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 1. OTOBÜS ARAMA FORMU */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'bus' && (
        <form onSubmit={handleBusSubmit} className="space-y-3.5">
          {/* Trip Type Selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBusQuery({ tripType: 'one_way' })}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                busQuery.tripType === 'one_way'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Tek Yön
            </button>
            <button
              type="button"
              onClick={() => setBusQuery({ tripType: 'round_trip' })}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                busQuery.tripType === 'round_trip'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Gidiş - Dönüş
            </button>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <LocationAutocompleteInput
                label="Kalkış Noktası (Nereden) *"
                placeholder="Örn: İstanbul - Esenler Otogarı / Harem"
                value={busQuery.fromLocation}
                onChange={(val) => setBusQuery({ fromLocation: val })}
                icon={<MapPin className="h-4 w-4 text-blue-500" />}
                required
              />
              <button
                type="button"
                onClick={swapBusLocations}
                className="absolute right-3 top-7 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card shadow-sm text-muted-foreground hover:text-blue-500 hover:scale-105 active:scale-95 transition-all"
                title="Kalkış ve Varış Noktalarını Değiştir"
              >
                <ArrowRightLeft className="h-3 w-3" />
              </button>
            </div>

            <LocationAutocompleteInput
              label="Varış Noktası (Nereye) *"
              placeholder="Örn: Ankara - AŞTİ / İzmir Otogarı"
              value={busQuery.toLocation}
              onChange={(val) => setBusQuery({ toLocation: val })}
              icon={<MapPin className="h-4 w-4 text-indigo-500" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Gidiş Tarihi *
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  value={busQuery.departureDate || todayStr}
                  onChange={(e) => setBusQuery({ departureDate: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-muted/30 p-3.5 pl-10 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
              </div>
            </div>

            {busQuery.tripType === 'round_trip' ? (
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Dönüş Tarihi *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={busQuery.departureDate || todayStr}
                    value={busQuery.returnDate || ''}
                    onChange={(e) => setBusQuery({ returnDate: e.target.value })}
                    className="w-full rounded-2xl border border-border bg-muted/30 p-3.5 pl-10 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Yolcu Sayısı
                </label>
                <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted/30 p-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBusQuery({ passengerCount: num })}
                      className={cn(
                        'flex-1 rounded-xl py-2 text-xs font-bold transition-all',
                        busQuery.passengerCount === num
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700"
            >
              <Search className="mr-2 h-4 w-4" />
              Otobüs Bileti Bul
            </Button>
          </div>
        </form>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 2. UÇAK ARAMA FORMU */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'flight' && (
        <form onSubmit={handleFlightSubmit} className="space-y-3.5">
          {/* Trip Type & Cabin Class */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFlightQuery({ tripType: 'one_way' })}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                  flightQuery.tripType === 'one_way'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Tek Yön
              </button>
              <button
                type="button"
                onClick={() => setFlightQuery({ tripType: 'round_trip' })}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                  flightQuery.tripType === 'round_trip'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Gidiş - Dönüş
              </button>
            </div>

            <div className="flex items-center gap-1">
              {(['economy', 'business'] as FlightCabinClass[]).map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setFlightQuery({ cabinClass: cls })}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all',
                    flightQuery.cabinClass === cls
                      ? 'bg-muted border border-border text-foreground font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {cls === 'economy' ? 'Ekonomi' : 'Business'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <LocationAutocompleteInput
                label="Kalkış Havalimanı / Şehir (Nereden) *"
                placeholder="Örn: IST - İstanbul Havalimanı / SAW"
                value={flightQuery.fromAirport}
                onChange={(val) => setFlightQuery({ fromAirport: val })}
                icon={<Plane className="h-4 w-4 text-blue-500" />}
                required
              />
              <button
                type="button"
                onClick={swapFlightAirports}
                className="absolute right-3 top-7 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card shadow-sm text-muted-foreground hover:text-blue-500 hover:scale-105 active:scale-95 transition-all"
                title="Havalimanlarını Değiştir"
              >
                <ArrowRightLeft className="h-3 w-3" />
              </button>
            </div>

            <LocationAutocompleteInput
              label="Varış Havalimanı / Şehir (Nereye) *"
              placeholder="Örn: ESB - Ankara Esenboğa / AYT - Antalya"
              value={flightQuery.toAirport}
              onChange={(val) => setFlightQuery({ toAirport: val })}
              icon={<Plane className="h-4 w-4 text-indigo-500 rotate-90" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Gidiş Tarihi *
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  value={flightQuery.departureDate || todayStr}
                  onChange={(e) => setFlightQuery({ departureDate: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-muted/30 p-3.5 pl-10 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
              </div>
            </div>

            {flightQuery.tripType === 'round_trip' ? (
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Dönüş Tarihi *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={flightQuery.departureDate || todayStr}
                    value={flightQuery.returnDate || ''}
                    onChange={(e) => setFlightQuery({ returnDate: e.target.value })}
                    className="w-full rounded-2xl border border-border bg-muted/30 p-3.5 pl-10 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Yolcu Sayısı
                </label>
                <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted/30 p-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFlightQuery({ passengerCount: num })}
                      className={cn(
                        'flex-1 rounded-xl py-2 text-xs font-bold transition-all',
                        flightQuery.passengerCount === num
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700"
            >
              <Search className="mr-2 h-4 w-4" />
              Uçak Bileti Bul
            </Button>
          </div>
        </form>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 3. OTEL ARAMA FORMU */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'hotel' && (
        <form onSubmit={handleHotelSubmit} className="space-y-3.5">
          <LocationAutocompleteInput
            label="Şehir, Bölge veya Otel Adı *"
            placeholder="Örn: Antalya, Bodrum, Çeşme, İstanbul"
            value={hotelQuery.location}
            onChange={(val) => setHotelQuery({ location: val })}
            icon={<Building className="h-4 w-4 text-blue-500" />}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Giriş Tarihi *
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  value={hotelQuery.checkInDate || todayStr}
                  onChange={(e) => setHotelQuery({ checkInDate: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-muted/30 p-3.5 pl-10 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Çıkış Tarihi *
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={hotelQuery.checkInDate || todayStr}
                  value={hotelQuery.checkOutDate || ''}
                  onChange={(e) => setHotelQuery({ checkOutDate: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-muted/30 p-3.5 pl-10 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Misafir Sayısı
              </label>
              <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted/30 p-1">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setHotelQuery({ guestCount: num })}
                    className={cn(
                      'flex-1 rounded-xl py-2 text-xs font-bold transition-all',
                      hotelQuery.guestCount === num
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Oda Sayısı
              </label>
              <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted/30 p-1">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setHotelQuery({ roomCount: num })}
                    className={cn(
                      'flex-1 rounded-xl py-2 text-xs font-bold transition-all',
                      hotelQuery.roomCount === num
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700"
            >
              <Search className="mr-2 h-4 w-4" />
              Otel Ara
            </Button>
          </div>
        </form>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 4. ARAÇ KİRALAMA ARAMA FORMU */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'car_rental' && (
        <form onSubmit={handleCarRentalSubmit} className="space-y-3.5">
          <LocationAutocompleteInput
            label="Teslim Alma Yeri (Havalimanı / Şehir) *"
            placeholder="Örn: İstanbul Havalimanı (IST) / İzmir Şube"
            value={carRentalQuery.pickupLocation}
            onChange={(val) => setCarRentalQuery({ pickupLocation: val })}
            icon={<Car className="h-4 w-4 text-blue-500" />}
            required
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="diffLocation"
              checked={carRentalQuery.differentDropoffLocation}
              onChange={(e) =>
                setCarRentalQuery({ differentDropoffLocation: e.target.checked })
              }
              className="rounded border-border text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="diffLocation" className="text-xs text-muted-foreground select-none cursor-pointer">
              Farklı bir lokasyonda teslim etmek istiyorum
            </label>
          </div>

          {carRentalQuery.differentDropoffLocation && (
            <LocationAutocompleteInput
              label="Bırakma Yeri *"
              placeholder="Örn: Sabiha Gökçen Havalimanı (SAW)"
              value={carRentalQuery.dropoffLocation}
              onChange={(val) => setCarRentalQuery({ dropoffLocation: val })}
              icon={<MapPin className="h-4 w-4 text-indigo-500" />}
              required
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Alış Tarihi & Saati *
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  min={todayStr}
                  value={carRentalQuery.pickupDate || todayStr}
                  onChange={(e) => setCarRentalQuery({ pickupDate: e.target.value })}
                  className="flex-1 rounded-2xl border border-border bg-muted/30 p-3.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <input
                  type="time"
                  value={carRentalQuery.pickupTime || '10:00'}
                  onChange={(e) => setCarRentalQuery({ pickupTime: e.target.value })}
                  className="w-24 rounded-2xl border border-border bg-muted/30 p-3.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                İade Tarihi & Saati *
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  min={carRentalQuery.pickupDate || todayStr}
                  value={carRentalQuery.dropoffDate || ''}
                  onChange={(e) => setCarRentalQuery({ dropoffDate: e.target.value })}
                  className="flex-1 rounded-2xl border border-border bg-muted/30 p-3.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <input
                  type="time"
                  value={carRentalQuery.dropoffTime || '10:00'}
                  onChange={(e) => setCarRentalQuery({ dropoffTime: e.target.value })}
                  className="w-24 rounded-2xl border border-border bg-muted/30 p-3.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700"
            >
              <Search className="mr-2 h-4 w-4" />
              Kiralık Araç Bul
            </Button>
          </div>
        </form>
      )}
    </motion.div>
  );
}
