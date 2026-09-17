'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Building2,
  MapPin,
  Layers,
  DollarSign,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { useTravelPartnerStore } from '@/stores/useTravelPartnerStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { PARTNER_ROLE_LABELS } from '@/types/travelPartner';

type CarTab = 'branches' | 'classes' | 'fleet' | 'rate_plans' | 'calendar' | 'profile';

export function CarRentalPartnerDashboard() {
  const {
    carRentalProfile,
    branches,
    addDraftBranch,
    deleteDraftBranch,
    vehicleClasses,
    addDraftVehicleClass,
    deleteDraftVehicleClass,
    fleetVehicles,
    addDraftFleetVehicle,
    deleteDraftFleetVehicle,
    carRatePlans,
    addDraftCarRatePlan,
    deleteDraftCarRatePlan,
  } = useTravelPartnerStore();

  const [activeTab, setActiveTab] = useState<CarTab>('fleet');

  // Modals
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isRatePlanModalOpen, setIsRatePlanModalOpen] = useState(false);

  // Form states for Branch
  const [branchName, setBranchName] = useState('İstanbul Havalimanı (IST) Ofisi');
  const [branchCity, setBranchCity] = useState('İstanbul');
  const [branchDistrict, setBranchDistrict] = useState('Arnavutköy');
  const [branchAddress, setBranchAddress] = useState('Havalimanı Terminal Katı Rent a Car Alanı');
  const [branchPhone, setBranchPhone] = useState('0212 555 0199');
  const [isAirportBranch, setIsAirportBranch] = useState(true);

  // Form states for Vehicle Class
  const [classCode, setClassCode] = useState<'economy' | 'compact' | 'suv' | 'luxury' | 'van'>('economy');
  const [className, setClassName] = useState('Ekonomi Sınıf (Renault Clio veya benzeri)');
  const [transmission, setTransmission] = useState<'manual' | 'automatic'>('automatic');
  const [fuelType, setFuelType] = useState<'gasoline' | 'diesel' | 'hybrid' | 'electric'>('gasoline');
  const [seatCapacity, setSeatCapacity] = useState(5);
  const [minDriverAge, setMinDriverAge] = useState(21);
  const [minLicenseYears, setMinLicenseYears] = useState(2);

  // Form states for Vehicle
  const [vehicleBrand, setVehicleBrand] = useState('Renault');
  const [vehicleModel, setVehicleModel] = useState('Clio 1.0 TCe');
  const [vehicleYear, setVehicleYear] = useState(2024);
  const [plateNumber, setPlateNumber] = useState('34-LIF-801');
  const [mileage, setMileage] = useState(12500);

  // Form states for Rate Plan
  const [planName, setPlanName] = useState('Standart Günlük Kiralama');
  const [dailyRate, setDailyRate] = useState(1450);
  const [weeklyDiscount, setWeeklyDiscount] = useState(10);
  const [depositAmount, setDepositAmount] = useState(2500);

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) return;
    addDraftBranch({
      name: branchName,
      city: branchCity,
      district: branchDistrict,
      address: branchAddress,
      phone: branchPhone,
      isAirportBranch,
    });
    setIsBranchModalOpen(false);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    addDraftVehicleClass({
      classCode,
      className,
      transmission,
      fuelType,
      seatCapacity,
      minDriverAge,
      minDrivingLicenseYears: minLicenseYears,
    });
    setIsClassModalOpen(false);
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim()) return;
    addDraftFleetVehicle({
      branchId: branches[0]?.id || 'BRN-1',
      classId: vehicleClasses[0]?.id || 'CLS-1',
      brand: vehicleBrand,
      model: vehicleModel,
      year: vehicleYear,
      plateNumber,
      mileage,
    });
    setIsVehicleModalOpen(false);
  };

  const handleCreateRatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;
    addDraftCarRatePlan({
      classId: vehicleClasses[0]?.id || 'CLS-1',
      planName,
      dailyRate,
      weeklyDiscountPercent: weeklyDiscount,
      depositAmount,
    });
    setIsRatePlanModalOpen(false);
  };

  return (
    <div className="mx-4 mt-4 space-y-4">
      {/* Car Rental Partner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-blue-500/30 bg-card p-4.5 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white text-2xl shadow-md shadow-blue-500/20">
            🚗
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                {carRentalProfile?.companyName || 'LifeCar Rent a Car A.Ş.'}
              </h2>
              <Badge variant="success" className="text-[10px] py-0 px-2">
                ✓ KABİS Onaylı
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Filo: ~{carRentalProfile?.fleetSize || 50} Araç • Yetkili: {carRentalProfile?.authorizedPersonName} ({PARTNER_ROLE_LABELS[carRentalProfile?.authorizedRole || 'company_owner']})
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-xs py-1 px-3 self-start sm:self-center font-mono">
          {carRentalProfile?.kabisNumber || 'KABIS-34-2024-419'}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'fleet', label: 'Araç Filosu', icon: Car },
          { id: 'classes', label: 'Araç Sınıfları', icon: Layers },
          { id: 'branches', label: 'Şubeler', icon: MapPin },
          { id: 'rate_plans', label: 'Fiyat Planları', icon: DollarSign },
          { id: 'calendar', label: 'Müsaitlik Takvimi', icon: Calendar },
          { id: 'profile', label: 'Firma Bilgileri', icon: FileCheck2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CarTab)}
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
      {/* 1. ARAÇ FİLOSU */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'fleet' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Kayıtlı Filo Araçları</h3>
            <Button
              onClick={() => setIsVehicleModalOpen(true)}
              size="sm"
              className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Araç Ekle
            </Button>
          </div>

          {fleetVehicles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 text-center">
              <Car className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <div className="text-sm font-bold text-foreground">Filoda kayıtlı araç yok</div>
              <p className="text-xs text-muted-foreground mt-1">
                Plaka ve model bilgisi ile filonuza araç tanımlayın.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fleetVehicles.map((v) => (
                <div key={v.id} className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-sm text-foreground">{v.plateNumber}</div>
                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400">{v.brand} {v.model} ({v.year})</div>
                    </div>
                    <button onClick={() => deleteDraftFleetVehicle(v.id)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Kilometre: {v.mileage.toLocaleString('tr-TR')} km • Durum: Müsait
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 2. ARAÇ SINIFLARI */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'classes' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Araç Sınıfları & Segmentler</h3>
            <Button
              onClick={() => setIsClassModalOpen(true)}
              size="sm"
              className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Sınıf Tanımla
            </Button>
          </div>

          {vehicleClasses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 text-center">
              <Layers className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <div className="text-sm font-bold text-foreground">Tanımlı araç sınıfı yok</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ekonomi, SUV, Lüks gibi araç sınıflarını ve asgari sürücü yaşını tanımlayın.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {vehicleClasses.map((c) => (
                <div key={c.id} className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-foreground">{c.className}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {c.transmission === 'automatic' ? 'Otomatik Vites' : 'Manuel Vites'} • {c.fuelType} • {c.seatCapacity} Kişilik
                      </div>
                    </div>
                    <button onClick={() => deleteDraftVehicleClass(c.id)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Asgari Yaş: {c.minDriverAge} Yaş • Ehliyet: Asgari {c.minDrivingLicenseYears} Yıl
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 3. ŞUBELER */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'branches' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Teslimat Şubeleri & Ofisler</h3>
            <Button
              onClick={() => setIsBranchModalOpen(true)}
              size="sm"
              className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Şube Ekle
            </Button>
          </div>

          {branches.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <div className="text-sm font-bold text-foreground">Kayıtlı şube bulunamadı</div>
              <p className="text-xs text-muted-foreground mt-1">
                Havalimanı ve şehir içi teslimat ofislerinizi ekleyin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {branches.map((b) => (
                <div key={b.id} className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-foreground">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.city} / {b.district} {b.isAirportBranch ? '(Havalimanı Ofisi)' : ''}</div>
                    </div>
                    <button onClick={() => deleteDraftBranch(b.id)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">Tel: {b.phone}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 4. FİYAT PLANLARI */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'rate_plans' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Kiralama Fiyat Tarifeleri</h3>
            <Button
              onClick={() => setIsRatePlanModalOpen(true)}
              size="sm"
              className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Tarife Ekle
            </Button>
          </div>

          {carRatePlans.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 text-center">
              <DollarSign className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <div className="text-sm font-bold text-foreground">Fiyat tarifesi yok</div>
              <p className="text-xs text-muted-foreground mt-1">
                Günlük kira bedeli, haftalık indirim ve depozito tutarları belirleyin.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {carRatePlans.map((rp) => (
                <div key={rp.id} className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
                  <div>
                    <div className="font-bold text-xs text-foreground">{rp.planName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Günlük: <span className="font-bold text-blue-500">{rp.dailyRate} TL</span> • Depozito: {rp.depositAmount} TL • Günlük Limit: {rp.mileageLimitPerDay} km
                    </div>
                  </div>
                  <button onClick={() => deleteDraftCarRatePlan(rp.id)} className="p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 5. MÜSAİTLİK TAKVİMİ */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'calendar' && (
        <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground">Filo Müsaitlik & Rezervasyon Takvimi</h3>
          <p className="text-xs text-muted-foreground">
            Araç sınıfları ve teslimat şubelerine göre günlük müsaitlik takibi.
          </p>
          <div className="rounded-2xl border border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">
            Tüm filo araçları ve fiyat tarifeleri taslak durumundadır; yolcu kiralama aramalarında henüz listelenmez.
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 6. FİRMA BİLGİLERİ */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'profile' && (
        <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground">Rent a Car Firma Bilgileri</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl bg-muted/30 p-3 border border-border/60">
              <div className="text-muted-foreground">Firma Ünvanı</div>
              <div className="font-bold text-foreground mt-0.5">{carRentalProfile?.companyName}</div>
            </div>
            <div className="rounded-2xl bg-muted/30 p-3 border border-border/60">
              <div className="text-muted-foreground">KABİS Belge Numarası</div>
              <div className="font-bold font-mono text-foreground mt-0.5">{carRentalProfile?.kabisNumber}</div>
            </div>
            <div className="rounded-2xl bg-muted/30 p-3 border border-border/60">
              <div className="text-muted-foreground">Kayıtlı Filo Kapasitesi</div>
              <div className="font-bold text-foreground mt-0.5">~{carRentalProfile?.fleetSize} Araç</div>
            </div>
            <div className="rounded-2xl bg-muted/30 p-3 border border-border/60">
              <div className="text-muted-foreground">Yetkili Kişi</div>
              <div className="font-bold text-foreground mt-0.5">{carRentalProfile?.authorizedPersonName}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Branch */}
      <AnimatePresence>
        {isBranchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl bg-card p-6 border border-border shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-foreground">Şube Ekle</h3>
                <button onClick={() => setIsBranchModalOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleCreateBranch} className="space-y-3">
                <Input label="Şube Adı *" value={branchName} onChange={(e) => setBranchName(e.target.value)} required />
                <div className="grid grid-cols-2 gap-2.5">
                  <Input label="Şehir *" value={branchCity} onChange={(e) => setBranchCity(e.target.value)} required />
                  <Input label="İlçe *" value={branchDistrict} onChange={(e) => setBranchDistrict(e.target.value)} required />
                </div>
                <Input label="Telefon *" value={branchPhone} onChange={(e) => setBranchPhone(e.target.value)} required />
                <div className="pt-2">
                  <Button type="submit" className="w-full rounded-2xl bg-blue-500 hover:bg-blue-600 text-white">Kaydet</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Class */}
      <AnimatePresence>
        {isClassModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl bg-card p-6 border border-border shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-foreground">Araç Sınıfı Ekle</h3>
                <button onClick={() => setIsClassModalOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleCreateClass} className="space-y-3">
                <Input label="Sınıf Adı *" value={className} onChange={(e) => setClassName(e.target.value)} required />
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">Vites</label>
                    <select value={transmission} onChange={(e) => setTransmission(e.target.value as any)} className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground">
                      <option value="automatic">Otomatik</option>
                      <option value="manual">Manuel</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">Yakıt</label>
                    <select value={fuelType} onChange={(e) => setFuelType(e.target.value as any)} className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground">
                      <option value="gasoline">Benzin</option>
                      <option value="diesel">Dizel</option>
                      <option value="hybrid">Hibrit</option>
                      <option value="electric">Elektrik</option>
                    </select>
                  </div>
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full rounded-2xl bg-blue-500 hover:bg-blue-600 text-white">Kaydet</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Vehicle */}
      <AnimatePresence>
        {isVehicleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl bg-card p-6 border border-border shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-foreground">Filoya Araç Ekle</h3>
                <button onClick={() => setIsVehicleModalOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleCreateVehicle} className="space-y-3">
                <Input label="Plaka Numarası *" placeholder="Örn: 34-RENT-102" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} required />
                <div className="grid grid-cols-2 gap-2.5">
                  <Input label="Marka *" value={vehicleBrand} onChange={(e) => setVehicleBrand(e.target.value)} required />
                  <Input label="Model *" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Input label="Model Yılı" type="number" value={vehicleYear.toString()} onChange={(e) => setVehicleYear(parseInt(e.target.value) || 2024)} required />
                  <Input label="Mevcut Km" type="number" value={mileage.toString()} onChange={(e) => setMileage(parseInt(e.target.value) || 0)} required />
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full rounded-2xl bg-blue-500 hover:bg-blue-600 text-white">Aracı Kaydet</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Rate Plan */}
      <AnimatePresence>
        {isRatePlanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl bg-card p-6 border border-border shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-foreground">Fiyat Tarifesi Ekle</h3>
                <button onClick={() => setIsRatePlanModalOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleCreateRatePlan} className="space-y-3">
                <Input label="Tarife Adı *" value={planName} onChange={(e) => setPlanName(e.target.value)} required />
                <div className="grid grid-cols-2 gap-2.5">
                  <Input label="Günlük Kira (TL) *" type="number" value={dailyRate.toString()} onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)} required />
                  <Input label="Depozito (TL)" type="number" value={depositAmount.toString()} onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)} required />
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full rounded-2xl bg-blue-500 hover:bg-blue-600 text-white">Tarifeyi Kaydet</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
