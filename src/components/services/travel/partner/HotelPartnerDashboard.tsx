'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building,
  Bed,
  DoorClosed,
  DollarSign,
  Calendar,
  Layers,
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

type HotelTab = 'properties' | 'room_types' | 'rooms' | 'rate_plans' | 'calendar';

export function HotelPartnerDashboard() {
  const {
    hotelProfile,
    properties,
    addDraftProperty,
    deleteDraftProperty,
    roomTypes,
    addDraftRoomType,
    deleteDraftRoomType,
    rooms,
    addDraftRoom,
    deleteDraftRoom,
    ratePlans,
    addDraftRatePlan,
    deleteDraftRatePlan,
  } = useTravelPartnerStore();

  const [activeTab, setActiveTab] = useState<HotelTab>('properties');

  // Modals
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isRoomTypeModalOpen, setIsRoomTypeModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isRatePlanModalOpen, setIsRatePlanModalOpen] = useState(false);

  // Form states for Property
  const [propName, setPropName] = useState('Grand Life Resort');
  const [propType, setPropType] = useState<'hotel' | 'resort' | 'boutique' | 'apartment' | 'pension'>('resort');
  const [propStars, setPropStars] = useState(5);
  const [propCity, setPropCity] = useState('Antalya');
  const [propDistrict, setPropDistrict] = useState('Kemer');
  const [propAddress, setPropAddress] = useState('Göynük Mah. Sahil Cad. No:12');

  // Form states for Room Type
  const [roomTypeTitle, setRoomTypeTitle] = useState('Deluxe Deniz Manzaralı Oda');
  const [bedConfig, setBedConfig] = useState('1 Çift Kişilik King Yatak');
  const [maxGuests, setMaxGuests] = useState(3);
  const [sizeSqMeters, setSizeSqMeters] = useState(38);

  // Form states for Room
  const [roomNumber, setRoomNumber] = useState('301');
  const [roomFloor, setRoomFloor] = useState(3);

  // Form states for Rate Plan
  const [planName, setPlanName] = useState('Her Şey Dahil (All Inclusive)');
  const [mealBoard, setMealBoard] = useState<'room_only' | 'bed_and_breakfast' | 'half_board' | 'all_inclusive'>('all_inclusive');
  const [basePricePerNight, setBasePricePerNight] = useState(4850);
  const [cancellationPolicy, setCancellationPolicy] = useState<'free_cancellation' | 'non_refundable'>('free_cancellation');

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propName.trim()) return;
    addDraftProperty({
      name: propName,
      propertyType: propType,
      starRating: propStars,
      city: propCity,
      district: propDistrict,
      address: propAddress,
      amenities: ['Açık Havuz', 'Özel Plaj', 'Spa & Hamam', 'Wi-Fi', 'Ücretsiz Otopark'],
    });
    setIsPropertyModalOpen(false);
  };

  const handleCreateRoomType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomTypeTitle.trim()) return;
    addDraftRoomType({
      propertyId: properties[0]?.id || 'PRP-1',
      title: roomTypeTitle,
      bedConfig,
      maxGuests,
      sizeSqMeters,
      amenities: ['Balkon', 'Klima', 'Minibar', 'Led TV', 'Kasa'],
    });
    setIsRoomTypeModalOpen(false);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) return;
    addDraftRoom({
      propertyId: properties[0]?.id || 'PRP-1',
      roomTypeId: roomTypes[0]?.id || 'RMT-1',
      roomNumber,
      floor: roomFloor,
    });
    setIsRoomModalOpen(false);
  };

  const handleCreateRatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;
    addDraftRatePlan({
      propertyId: properties[0]?.id || 'PRP-1',
      roomTypeId: roomTypes[0]?.id || 'RMT-1',
      planName,
      mealBoard,
      basePricePerNight,
      cancellationPolicy,
    });
    setIsRatePlanModalOpen(false);
  };

  return (
    <div className="mx-4 mt-4 space-y-4">
      {/* Hotel Partner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-blue-500/30 bg-card p-4.5 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white text-2xl shadow-md shadow-blue-500/20">
            🏨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                {hotelProfile?.propertyName || 'Grand Life Resort & Spa'}
              </h2>
              <Badge variant="success" className="text-[10px] py-0 px-2">
                ✓ Turizm İşletme Belgeli
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {hotelProfile?.city} / {hotelProfile?.district} • {hotelProfile?.starRating || 5} Yıldız • Yetkili: {hotelProfile?.authorizedPersonName}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-xs py-1 px-3 self-start sm:self-center font-mono">
          {hotelProfile?.tourismLicenseNumber || 'KTB-TR-2024-88'}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'properties', label: 'Tesis Bilgileri', icon: Building },
          { id: 'room_types', label: 'Oda Tipleri', icon: Bed },
          { id: 'rooms', label: 'Odalar', icon: DoorClosed },
          { id: 'rate_plans', label: 'Fiyat Planları', icon: DollarSign },
          { id: 'calendar', label: 'Müsaitlik Takvimi', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as HotelTab)}
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
      {/* 1. TESİS BİLGİLERİ */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'properties' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Kayıtlı Tesis / Otel</h3>
            <Button
              onClick={() => setIsPropertyModalOpen(true)}
              size="sm"
              className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Tesis Ekle
            </Button>
          </div>

          {properties.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 text-center">
              <Building className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <div className="text-sm font-bold text-foreground">Tanımlı tesis bulunamadı</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tesis adı, adres ve olanaklar tanımlayarak otelinizi oluşturun.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {properties.map((p) => (
                <div key={p.id} className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.city} / {p.district} • {p.starRating} Yıldız ({p.propertyType})</div>
                    </div>
                    <button onClick={() => deleteDraftProperty(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Adres: {p.address} • Giriş/Çıkış: {p.checkInTime} / {p.checkOutTime}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 2. ODA TİPLERİ */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'room_types' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Oda Tipleri & Konfigürasyonları</h3>
            <Button
              onClick={() => setIsRoomTypeModalOpen(true)}
              size="sm"
              className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Oda Tipi Ekle
            </Button>
          </div>

          {roomTypes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 text-center">
              <Bed className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <div className="text-sm font-bold text-foreground">Tanımlı oda tipi yok</div>
              <p className="text-xs text-muted-foreground mt-1">
                Standart, Deluxe, Suit gibi oda kategorilerini ve yatak kapasitelerini tanımlayın.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roomTypes.map((rt) => (
                <div key={rt.id} className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm relative">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-foreground">{rt.title}</div>
                    <button onClick={() => deleteDraftRoomType(rt.id)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {rt.bedConfig} • {rt.maxGuests} Misafir Kapasitesi • {rt.sizeSqMeters} m²
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 3. ODALAR */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'rooms' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Oda Numaraları / Envanter</h3>
            <Button
              onClick={() => setIsRoomModalOpen(true)}
              size="sm"
              className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Oda Ekle
            </Button>
          </div>

          {rooms.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 text-center">
              <DoorClosed className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <div className="text-sm font-bold text-foreground">Tanımlı oda numarası yok</div>
              <p className="text-xs text-muted-foreground mt-1">
                Kat ve kapı numaralarını ekleyerek oda envanterinizi yönetin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {rooms.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 text-xs">
                  <div>
                    <div className="font-bold text-foreground">Oda #{r.roomNumber}</div>
                    <div className="text-[10px] text-muted-foreground">{r.floor}. Kat</div>
                  </div>
                  <button onClick={() => deleteDraftRoom(r.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
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
            <h3 className="text-sm font-bold text-foreground">Pansiyon & Fiyat Planları</h3>
            <Button
              onClick={() => setIsRatePlanModalOpen(true)}
              size="sm"
              className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Fiyat Planı Ekle
            </Button>
          </div>

          {ratePlans.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 text-center">
              <DollarSign className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <div className="text-sm font-bold text-foreground">Fiyat planı tanımlanmadı</div>
              <p className="text-xs text-muted-foreground mt-1">
                Oda Kahvaltı, Her Şey Dahil gibi pansiyon türleri ve gecelik taban fiyatları ekleyin.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {ratePlans.map((rp) => (
                <div key={rp.id} className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
                  <div>
                    <div className="font-bold text-xs text-foreground">{rp.planName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Gecelik: <span className="font-bold text-blue-500">{rp.basePricePerNight} TL</span> • {rp.cancellationPolicy === 'free_cancellation' ? 'Ücretsiz İptal' : 'İadesiz'}
                    </div>
                  </div>
                  <button onClick={() => deleteDraftRatePlan(rp.id)} className="p-1 text-muted-foreground hover:text-destructive">
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
          <h3 className="text-sm font-bold text-foreground">Oda Müsaitlik & Doluluk Takvimi</h3>
          <p className="text-xs text-muted-foreground">
            Oda tiplerine göre günlük kontenjan ve dinamik gecelik fiyatlandırma takvimi.
          </p>
          <div className="rounded-2xl border border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">
            Tüm oda envanteri ve fiyat planları taslak olarak kaydedilmiştir; henüz yolcu aramalarına açılmamıştır.
          </div>
        </div>
      )}

      {/* Modal: Property */}
      <AnimatePresence>
        {isPropertyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl bg-card p-6 border border-border shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-foreground">Tesis Tanımla</h3>
                <button onClick={() => setIsPropertyModalOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleCreateProperty} className="space-y-3">
                <Input label="Tesis Adı *" value={propName} onChange={(e) => setPropName(e.target.value)} required />
                <div className="grid grid-cols-2 gap-2.5">
                  <Input label="Şehir *" value={propCity} onChange={(e) => setPropCity(e.target.value)} required />
                  <Input label="İlçe / Belde *" value={propDistrict} onChange={(e) => setPropDistrict(e.target.value)} required />
                </div>
                <Input label="Açık Adres *" value={propAddress} onChange={(e) => setPropAddress(e.target.value)} required />
                <div className="pt-2">
                  <Button type="submit" className="w-full rounded-2xl bg-blue-500 hover:bg-blue-600 text-white">Kaydet</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Room Type */}
      <AnimatePresence>
        {isRoomTypeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl bg-card p-6 border border-border shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-foreground">Oda Tipi Tanımla</h3>
                <button onClick={() => setIsRoomTypeModalOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleCreateRoomType} className="space-y-3">
                <Input label="Oda Başlığı / Tipi *" value={roomTypeTitle} onChange={(e) => setRoomTypeTitle(e.target.value)} required />
                <Input label="Yatak Konfigürasyonu *" value={bedConfig} onChange={(e) => setBedConfig(e.target.value)} required />
                <div className="grid grid-cols-2 gap-2.5">
                  <Input label="Maksimum Misafir" type="number" value={maxGuests.toString()} onChange={(e) => setMaxGuests(parseInt(e.target.value) || 2)} required />
                  <Input label="Oda Alanı (m²)" type="number" value={sizeSqMeters.toString()} onChange={(e) => setSizeSqMeters(parseInt(e.target.value) || 30)} required />
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full rounded-2xl bg-blue-500 hover:bg-blue-600 text-white">Kaydet</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Room */}
      <AnimatePresence>
        {isRoomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl bg-card p-6 border border-border shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-foreground">Oda Numarası Ekle</h3>
                <button onClick={() => setIsRoomModalOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleCreateRoom} className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <Input label="Oda No *" placeholder="Örn: 301" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required />
                  <Input label="Bulunduğu Kat" type="number" value={roomFloor.toString()} onChange={(e) => setRoomFloor(parseInt(e.target.value) || 1)} required />
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full rounded-2xl bg-blue-500 hover:bg-blue-600 text-white">Odayı Ekle</Button>
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
                <h3 className="font-bold text-base text-foreground">Fiyat Planı Ekle</h3>
                <button onClick={() => setIsRatePlanModalOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleCreateRatePlan} className="space-y-3">
                <Input label="Plan Adı *" value={planName} onChange={(e) => setPlanName(e.target.value)} required />
                <Input label="Gecelik Taban Fiyat (TL) *" type="number" value={basePricePerNight.toString()} onChange={(e) => setBasePricePerNight(parseFloat(e.target.value) || 0)} required />
                <div className="pt-2">
                  <Button type="submit" className="w-full rounded-2xl bg-blue-500 hover:bg-blue-600 text-white">Planı Kaydet</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
