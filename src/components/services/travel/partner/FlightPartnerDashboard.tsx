'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane,
  Building2,
  MapPin,
  Calendar,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';
import { useTravelPartnerStore } from '@/stores/useTravelPartnerStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { PARTNER_ROLE_LABELS } from '@/types/travelPartner';

type FlightTab = 'profile' | 'fleet' | 'airports' | 'routes' | 'flights' | 'seat_plans';

export function FlightPartnerDashboard() {
  const {
    flightProfile,
    aircrafts,
    addDraftAircraft,
    deleteDraftAircraft,
    airports,
    addDraftAirport,
    flightRoutes,
    addDraftFlightRoute,
    deleteDraftFlightRoute,
    draftFlights,
    addDraftFlight,
    deleteDraftFlight,
    resetPartnerProfile,
  } = useTravelPartnerStore();

  const [activeTab, setActiveTab] = useState<FlightTab>('flights');

  // Modals
  const [isAircraftModalOpen, setIsAircraftModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);

  // Form states for Aircraft
  const [tailNumber, setTailNumber] = useState('');
  const [aircraftModel, setAircraftModel] = useState('Airbus A320neo');
  const [totalSeats, setTotalSeats] = useState(180);
  const [economySeats, setEconomySeats] = useState(168);
  const [businessSeats, setBusinessSeats] = useState(12);

  // Form states for Route
  const [originApt, setOriginApt] = useState('IST');
  const [destApt, setDestApt] = useState('ESB');
  const [flightDuration, setFlightDuration] = useState(65);

  // Form states for Flight
  const [flightNumber, setFlightNumber] = useState('LF-204');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [selectedAircraftId, setSelectedAircraftId] = useState('');
  const [departureDateTime, setDepartureDateTime] = useState('');
  const [arrivalDateTime, setArrivalDateTime] = useState('');
  const [economyPrice, setEconomyPrice] = useState(1650);
  const [businessPrice, setBusinessPrice] = useState(3850);

  const handleCreateAircraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tailNumber.trim()) return;
    addDraftAircraft({
      tailNumber,
      model: aircraftModel,
      totalSeats,
      economySeats,
      businessSeats,
      features: ['Wi-Fi', 'USB Güç Portu', 'Sıcak İkram'],
    });
    setTailNumber('');
    setIsAircraftModalOpen(false);
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    addDraftFlightRoute({
      originAirportCode: originApt,
      destinationAirportCode: destApt,
      flightDurationMinutes: flightDuration,
    });
    setIsRouteModalOpen(false);
  };

  const handleCreateFlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightNumber.trim() || !departureDateTime) return;
    addDraftFlight({
      flightNumber,
      routeId: selectedRouteId || flightRoutes[0]?.id || 'RT-1',
      aircraftId: selectedAircraftId || aircrafts[0]?.id || 'AC-1',
      departureDateTime,
      arrivalDateTime: arrivalDateTime || departureDateTime,
      economyBasePrice: economyPrice,
      businessBasePrice: businessPrice,
    });
    setIsFlightModalOpen(false);
  };

  return (
    <div className="mx-4 mt-4 space-y-4">
      {/* Flight Company Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-blue-500/30 bg-card p-4.5 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white text-2xl shadow-md shadow-blue-500/20">
            ✈️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                {flightProfile?.companyName || 'LifeAir Havacılık A.Ş.'}
              </h2>
              <Badge variant="success" className="text-[10px] py-0 px-2">
                ✓ SHGM Onaylı
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Yetkili: {flightProfile?.authorizedPersonName} ({PARTNER_ROLE_LABELS[flightProfile?.authorizedRole || 'company_owner']}) • IATA: {flightProfile?.iataCode || 'LF'}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-xs py-1 px-3 self-start sm:self-center font-mono">
          {flightProfile?.shgmLicenseNumber || 'SHGM.TR.AOC-092'}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'flights', label: 'Uçuşlar', icon: Calendar },
          { id: 'fleet', label: 'Uçak Filosu', icon: Plane },
          { id: 'routes', label: 'Rotalar', icon: MapPin },
          { id: 'airports', label: 'Havalimanları', icon: Building2 },
          { id: 'seat_plans', label: 'Koltuk Planları', icon: Layers },
          { id: 'profile', label: 'Havayolu/Firma', icon: FileCheck2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FlightTab)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all',
                isSelected
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 1. UÇUŞLAR TAB */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'flights' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Tarifeli Uçuş Taslakları</h3>
            <Button
              onClick={() => setIsFlightModalOpen(true)}
              size="sm"
              className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Yeni Uçuş Taslağı
            </Button>
          </div>

          {draftFlights.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 text-center">
              <Plane className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <div className="text-sm font-bold text-foreground">Kayıtlı uçuş taslağı yok</div>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Uçuş numarası, güzergah ve fiyat belirleyerek yeni bir uçuş taslağı oluşturun.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {draftFlights.map((flight) => (
                <div
                  key={flight.id}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 font-bold text-xs">
                      {flight.flightNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground">Kalkış: {new Date(flight.departureDateTime).toLocaleString('tr-TR')}</span>
                        <Badge variant="outline" className="text-[9px] py-0">Taslak (Yayında Değil)</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Ekonomi: {flight.economyBasePrice} TL • Business: {flight.businessBasePrice} TL
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteDraftFlight(flight.id)}
                    className="p-2 text-muted-foreground hover:text-destructive rounded-xl hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 2. UÇAK FİLOSU TAB */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'fleet' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Kayıtlı Uçak Filosu</h3>
            <Button
              onClick={() => setIsAircraftModalOpen(true)}
              size="sm"
              className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Yeni Uçak Ekle
            </Button>
          </div>

          {aircrafts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 text-center">
              <Plane className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <div className="text-sm font-bold text-foreground">Filoda uçak bulunamadı</div>
              <p className="text-xs text-muted-foreground mt-1">
                Kuyruk tescili ve koltuk konfigürasyonu ile filonuza uçak ekleyin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aircrafts.map((ac) => (
                <div key={ac.id} className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-sm text-foreground">{ac.tailNumber}</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">{ac.model}</div>
                    </div>
                    <button
                      onClick={() => deleteDraftAircraft(ac.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Toplam: {ac.totalSeats} Koltuk ({ac.businessSeats} Business + {ac.economySeats} Ekonomi)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 3. ROTALAR TAB */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'routes' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Uçuş Rotaları</h3>
            <Button
              onClick={() => setIsRouteModalOpen(true)}
              size="sm"
              className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Yeni Rota Ekle
            </Button>
          </div>

          {flightRoutes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <div className="text-sm font-bold text-foreground">Tanımlı rota yok</div>
              <p className="text-xs text-muted-foreground mt-1">
                Kalkış ve varış havalimanı seçerek uçuş güzergahı oluşturun.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {flightRoutes.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <span>{r.originAirportCode}</span>
                    <span>✈️</span>
                    <span>{r.destinationAirportCode}</span>
                    <span className="text-muted-foreground font-normal">({r.flightDurationMinutes} dk)</span>
                  </div>
                  <button onClick={() => deleteDraftFlightRoute(r.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 4. HAVALİMANLARI TAB */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'airports' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Sistemde Tanımlı Havalimanları</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {airports.map((apt) => (
              <div key={apt.id} className="rounded-2xl border border-border/80 bg-card p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{apt.name}</span>
                  <Badge variant="secondary" className="font-mono text-[10px]">{apt.iataCode}</Badge>
                </div>
                <div className="text-muted-foreground text-[11px] mt-1">{apt.city}, {apt.country}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 5. KOLTUK PLANLARI TAB */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'seat_plans' && (
        <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground">Uçak Kabin & Koltuk Şablonları</h3>
          <p className="text-xs text-muted-foreground">
            Standart dar gövde (3+3 Ekonomi / 2+2 Business) ve geniş gövde (2+4+2) kabin konfigürasyonları.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-2xl border border-border bg-muted/30 p-3 text-xs">
              <div className="font-bold text-foreground mb-1">Dar Gövde (A320 / B737)</div>
              <div className="text-[11px] text-muted-foreground">Business: A-C | D-F (2+2) • Ekonomi: A-B-C | D-E-F (3+3)</div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/30 p-3 text-xs">
              <div className="font-bold text-foreground mb-1">Geniş Gövde (A330 / B787)</div>
              <div className="text-[11px] text-muted-foreground">Ekonomi: A-B | C-D-E-F | G-H (2+4+2 Çift Koridor)</div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 6. HAVAYOLU / FİRMA BİLGİLERİ */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'profile' && (
        <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground">Havayolu Şirket Bilgileri</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl bg-muted/30 p-3 border border-border/60">
              <div className="text-muted-foreground">Firma Ünvanı</div>
              <div className="font-bold text-foreground mt-0.5">{flightProfile?.companyName}</div>
            </div>
            <div className="rounded-2xl bg-muted/30 p-3 border border-border/60">
              <div className="text-muted-foreground">SHGM Ruhsat Numarası</div>
              <div className="font-bold font-mono text-foreground mt-0.5">{flightProfile?.shgmLicenseNumber}</div>
            </div>
            <div className="rounded-2xl bg-muted/30 p-3 border border-border/60">
              <div className="text-muted-foreground">IATA / ICAO Kodları</div>
              <div className="font-bold font-mono text-foreground mt-0.5">{flightProfile?.iataCode} / {flightProfile?.icaoCode}</div>
            </div>
            <div className="rounded-2xl bg-muted/30 p-3 border border-border/60">
              <div className="text-muted-foreground">Operasyon Yetkilisi</div>
              <div className="font-bold text-foreground mt-0.5">{flightProfile?.authorizedPersonName}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Aircraft */}
      <AnimatePresence>
        {isAircraftModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl bg-card p-6 border border-border shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-foreground">Filoya Uçak Ekle</h3>
                <button onClick={() => setIsAircraftModalOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleCreateAircraft} className="space-y-3">
                <Input label="Kuyruk Tescil Kodu *" placeholder="Örn: TC-LFA" value={tailNumber} onChange={(e) => setTailNumber(e.target.value)} required />
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Uçak Modeli</label>
                  <select value={aircraftModel} onChange={(e) => setAircraftModel(e.target.value)} className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground">
                    <option value="Airbus A320neo">Airbus A320neo (180 Koltuk)</option>
                    <option value="Airbus A321neo">Airbus A321neo (220 Koltuk)</option>
                    <option value="Boeing 737-800">Boeing 737-800 (189 Koltuk)</option>
                    <option value="Boeing 737 MAX 8">Boeing 737 MAX 8 (189 Koltuk)</option>
                  </select>
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full rounded-2xl bg-blue-500 hover:bg-blue-600 text-white">Kaydet</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: New Route */}
      <AnimatePresence>
        {isRouteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl bg-card p-6 border border-border shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-foreground">Yeni Uçuş Rotası Ekle</h3>
                <button onClick={() => setIsRouteModalOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleCreateRoute} className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <Input label="Kalkış Havalimanı (IATA) *" value={originApt} onChange={(e) => setOriginApt(e.target.value.toUpperCase())} required />
                  <Input label="Varış Havalimanı (IATA) *" value={destApt} onChange={(e) => setDestApt(e.target.value.toUpperCase())} required />
                </div>
                <Input label="Tahmini Uçuş Süresi (Dakika) *" type="number" value={flightDuration.toString()} onChange={(e) => setFlightDuration(parseInt(e.target.value) || 60)} required />
                <div className="pt-2">
                  <Button type="submit" className="w-full rounded-2xl bg-blue-500 hover:bg-blue-600 text-white">Rotayı Kaydet</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: New Flight */}
      <AnimatePresence>
        {isFlightModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl bg-card p-6 border border-border shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-foreground">Yeni Uçuş Taslağı</h3>
                <button onClick={() => setIsFlightModalOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleCreateFlight} className="space-y-3">
                <Input label="Uçuş Numarası *" placeholder="Örn: LF-204" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} required />
                <Input label="Kalkış Tarih & Saat *" type="datetime-local" value={departureDateTime} onChange={(e) => setDepartureDateTime(e.target.value)} required />
                <div className="grid grid-cols-2 gap-2.5">
                  <Input label="Ekonomi Fiyatı (TL) *" type="number" value={economyPrice.toString()} onChange={(e) => setEconomyPrice(parseFloat(e.target.value) || 0)} required />
                  <Input label="Business Fiyatı (TL) *" type="number" value={businessPrice.toString()} onChange={(e) => setBusinessPrice(parseFloat(e.target.value) || 0)} required />
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full rounded-2xl bg-blue-500 hover:bg-blue-600 text-white">Taslağı Oluştur</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
