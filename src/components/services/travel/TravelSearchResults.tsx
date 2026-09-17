'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Bus,
  Plane,
  Building,
  Car,
  Calendar,
  Users,
  Building2,
  ShieldCheck,
  MapPin,
  Clock,
} from 'lucide-react';
import { useTravelStore } from '@/stores/useTravelStore';
import { Badge } from '@/components/ui/Badge';

export function TravelSearchResults() {
  const {
    activeTab,
    hasSearched,
    busQuery,
    flightQuery,
    hotelQuery,
    carRentalQuery,
    registeredTrips,
    registeredFlights,
    registeredHotels,
    registeredCars,
  } = useTravelStore();

  const isSearched = hasSearched[activeTab];

  if (!isSearched) {
    return null;
  }

  return (
    <div className="mx-4 mt-6 space-y-4">
      {/* ----------------------------------------------------------------- */}
      {/* 1. OTOBÜS ARAMA SONUCU */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'bus' && (
        <>
          <div className="flex items-center justify-between px-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  {busQuery.fromLocation} → {busQuery.toLocation}
                </h3>
                <Badge variant="secondary" className="text-[10px] py-0 px-2">
                  Otobüs Seferleri
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {busQuery.departureDate || 'Tarih Belirtilmedi'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {busQuery.passengerCount} Yolcu
                </span>
              </div>
            </div>
          </div>

          {registeredTrips.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-border/80 bg-card/60 p-8 text-center shadow-sm backdrop-blur-sm"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/15 text-3xl text-blue-500 shadow-sm">
                <Bus className="h-8 w-8" />
              </div>
              <h4 className="text-base font-bold text-foreground">
                Bu güzergah için aktif sefer bulunamadı.
              </h4>
              <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
                Seçtiğiniz tarihte anlaşmalı D2 belgeli otobüs firmalarımızın yayınlanmış tarifeli seferi bulunmamaktadır.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-border/40 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-blue-500" />
                  <span>D2 / B2 Onaylı Otobüs Firmaları</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Doğrulanmış Biletleme</span>
                </span>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 2. UÇAK ARAMA SONUCU */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'flight' && (
        <>
          <div className="flex items-center justify-between px-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  {flightQuery.fromAirport} → {flightQuery.toAirport}
                </h3>
                <Badge variant="secondary" className="text-[10px] py-0 px-2">
                  Uçuş Arama
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {flightQuery.departureDate || 'Tarih Belirtilmedi'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {flightQuery.passengerCount} Yolcu ({flightQuery.cabinClass === 'economy' ? 'Ekonomi' : 'Business'})
                </span>
              </div>
            </div>
          </div>

          {registeredFlights.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-border/80 bg-card/60 p-8 text-center shadow-sm backdrop-blur-sm"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/15 text-3xl text-blue-500 shadow-sm">
                <Plane className="h-8 w-8" />
              </div>
              <h4 className="text-base font-bold text-foreground">
                Aradığınız kriterlere uygun uçuş bulunamadı.
              </h4>
              <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
                Seçtiğiniz havalimanları ve tarih için anlaşmalı havayolu ortaklarımızın yayınlanmış tarifeli uçuş kaydı bulunmamaktadır.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-border/40 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-blue-500" />
                  <span>SHGM & IATA Lisanslı Havayolları</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Direkt & Aktarmalı Uçuş Altyapısı</span>
                </span>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 3. OTEL ARAMA SONUCU */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'hotel' && (
        <>
          <div className="flex items-center justify-between px-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  {hotelQuery.location}
                </h3>
                <Badge variant="secondary" className="text-[10px] py-0 px-2">
                  Otel & Tesis Arama
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {hotelQuery.checkInDate} - {hotelQuery.checkOutDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {hotelQuery.guestCount} Misafir, {hotelQuery.roomCount} Oda
                </span>
              </div>
            </div>
          </div>

          {registeredHotels.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-border/80 bg-card/60 p-8 text-center shadow-sm backdrop-blur-sm"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/15 text-3xl text-blue-500 shadow-sm">
                <Building className="h-8 w-8" />
              </div>
              <h4 className="text-base font-bold text-foreground">
                Seçtiğiniz tarihler için müsait otel bulunamadı.
              </h4>
              <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
                Bu bölgede yayınlanmış aktif oda kontenjanı bulunmamaktadır. Otel ortaklarımızın tesis tanımlamaları tamamlandığında odalar burada listelenecektir.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-border/40 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-blue-500" />
                  <span>Turizm İşletme Belgeli Tesisler</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Ücretsiz İptal & Fiyat Güvencesi</span>
                </span>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 4. ARAÇ KİRALAMA ARAMA SONUCU */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'car_rental' && (
        <>
          <div className="flex items-center justify-between px-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  {carRentalQuery.pickupLocation}
                </h3>
                <Badge variant="secondary" className="text-[10px] py-0 px-2">
                  Kiralık Araç Arama
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {carRentalQuery.pickupDate} ({carRentalQuery.pickupTime}) - {carRentalQuery.dropoffDate} ({carRentalQuery.dropoffTime})
                </span>
              </div>
            </div>
          </div>

          {registeredCars.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-border/80 bg-card/60 p-8 text-center shadow-sm backdrop-blur-sm"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/15 text-3xl text-blue-500 shadow-sm">
                <Car className="h-8 w-8" />
              </div>
              <h4 className="text-base font-bold text-foreground">
                Seçtiğiniz lokasyon ve tarihte kiralık araç bulunamadı.
              </h4>
              <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
                Bu teslimat ofisinde aktif müsait filo aracı bulunmamaktadır. KABİS kayıtlı araç kiralama iş ortaklarımızın filo entegrasyonu devam etmektedir.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-border/40 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-blue-500" />
                  <span>KABİS Onaylı Rent-a-Car Firmaları</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Şeffaf Depozito & Kasko Güvencesi</span>
                </span>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
