'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  Bus,
  Plane,
  Building,
  Car,
  ShieldCheck,
  FileText,
  Sparkles,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { useTravelPartnerStore } from '@/stores/useTravelPartnerStore';
import {
  PARTNER_ROLE_LABELS,
  PRODUCT_LABELS,
  type PartnerAuthorizedRole,
  type TravelProductCategory,
} from '@/types/travelPartner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface TravelPartnerApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: TravelProductCategory;
}

export function TravelPartnerApplicationModal({
  isOpen,
  onClose,
  initialProduct = 'bus',
}: TravelPartnerApplicationModalProps) {
  const {
    applyForBusPartnership,
    applyForFlightPartnership,
    applyForHotelPartnership,
    applyForCarRentalPartnership,
    setActivePartnerProduct,
  } = useTravelPartnerStore();

  const [selectedProduct, setSelectedProduct] = useState<TravelProductCategory>(initialProduct);
  const [companyName, setCompanyName] = useState('');
  const [authorizedPersonName, setAuthorizedPersonName] = useState('');
  const [authorizedRole, setAuthorizedRole] = useState<PartnerAuthorizedRole>('company_owner');
  const [taxNumber, setTaxNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Product-specific states
  const [d2LicenseNumber, setD2LicenseNumber] = useState('');
  const [shgmLicenseNumber, setShgmLicenseNumber] = useState('');
  const [iataCode, setIataCode] = useState('');
  const [icaoCode, setIcaoCode] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [tourismLicenseNumber, setTourismLicenseNumber] = useState('');
  const [propertyType, setPropertyType] = useState<'hotel' | 'resort' | 'boutique' | 'apartment' | 'pension'>('hotel');
  const [starRating, setStarRating] = useState<number>(5);
  const [hotelCity, setHotelCity] = useState('Antalya');
  const [hotelDistrict, setHotelDistrict] = useState('Kemer');
  const [kabisNumber, setKabisNumber] = useState('');
  const [fleetSize, setFleetSize] = useState<number>(25);

  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError('Lütfen firma ticari unvanını veya marka adını girin.');
      return;
    }

    if (!authorizedPersonName.trim()) {
      setError('Lütfen yetkili ad ve soyadını girin.');
      return;
    }

    if (selectedProduct === 'bus') {
      applyForBusPartnership({
        companyName,
        authorizedPersonName,
        authorizedRole,
        d2LicenseNumber,
        taxNumber,
        contactEmail,
      });
    } else if (selectedProduct === 'flight') {
      applyForFlightPartnership({
        companyName,
        authorizedPersonName,
        authorizedRole,
        shgmLicenseNumber,
        iataCode,
        icaoCode,
        taxNumber,
        contactEmail,
      });
    } else if (selectedProduct === 'hotel') {
      applyForHotelPartnership({
        companyName,
        propertyName: propertyName || companyName,
        authorizedPersonName,
        authorizedRole,
        tourismLicenseNumber,
        propertyType,
        starRating,
        city: hotelCity,
        district: hotelDistrict,
        taxNumber,
        contactEmail,
      });
    } else if (selectedProduct === 'car_rental') {
      applyForCarRentalPartnership({
        companyName,
        authorizedPersonName,
        authorizedRole,
        kabisNumber,
        fleetSize,
        taxNumber,
        contactEmail,
      });
    }

    setActivePartnerProduct(selectedProduct);
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
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl shadow-lg shadow-blue-500/20 text-white">
                🏢
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Seyahat İş Ortağı Başvurusu
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Firmanızı ilgili seyahat kategorisinde LifeOS Seyahat Merkezi ağına dahil edin.
              </p>
            </div>

            {/* Product Category Selection */}
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['bus', 'flight', 'hotel', 'car_rental'] as TravelProductCategory[]).map((cat) => {
                const isSelected = selectedProduct === cat;
                const info = PRODUCT_LABELS[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedProduct(cat)}
                    className={cn(
                      'flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all',
                      isSelected
                        ? 'border-blue-500 bg-blue-500/15 text-foreground shadow-sm ring-1 ring-blue-500'
                        : 'border-border/70 bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <span className="text-xl mb-1">{info.emoji}</span>
                    <span className="text-[11px] font-bold leading-tight line-clamp-1">
                      {info.labelTr.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Info Banner */}
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs flex items-center gap-2 text-foreground">
                <span className="text-lg">{PRODUCT_LABELS[selectedProduct].emoji}</span>
                <div>
                  <div className="font-bold">{PRODUCT_LABELS[selectedProduct].labelTr} Başvurusu</div>
                  <div className="text-[11px] text-muted-foreground">{PRODUCT_LABELS[selectedProduct].descTr}</div>
                </div>
              </div>

              {/* Company Name */}
              <Input
                label="Firma Ticari Unvanı / Marka Adı *"
                placeholder={
                  selectedProduct === 'flight'
                    ? 'Örn: LifeAir Havacılık ve Taşımacılık A.Ş.'
                    : selectedProduct === 'hotel'
                    ? 'Örn: Grand Life Turizm Otelcilik A.Ş.'
                    : selectedProduct === 'car_rental'
                    ? 'Örn: LifeCar Rent a Car A.Ş.'
                    : 'Örn: Anadolu Turizm Seyahat A.Ş.'
                }
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
                required
              />

              {/* Authorized Person & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Input
                  label="Yetkili Ad Soyad *"
                  placeholder="Adınız Soyadınız"
                  value={authorizedPersonName}
                  onChange={(e) => setAuthorizedPersonName(e.target.value)}
                  icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
                  required
                />

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">
                    Yetkili Rolü / Unvanı *
                  </label>
                  <select
                    value={authorizedRole}
                    onChange={(e) => setAuthorizedRole(e.target.value as PartnerAuthorizedRole)}
                    className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {Object.entries(PARTNER_ROLE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ----------------- PRODUCT SPECIFIC FIELDS ----------------- */}
              {selectedProduct === 'bus' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Input
                    label="D2 / B2 Yetki Belgesi No"
                    placeholder="Örn: D2.34.19820"
                    value={d2LicenseNumber}
                    onChange={(e) => setD2LicenseNumber(e.target.value)}
                    icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                  />
                  <Input
                    label="Vergi No (Opsiyonel)"
                    placeholder="Örn: 1234567890"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                  />
                </div>
              )}

              {selectedProduct === 'flight' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <Input
                      label="SHGM Lisans No"
                      placeholder="Örn: SHGM-TR-AOC-99"
                      value={shgmLicenseNumber}
                      onChange={(e) => setShgmLicenseNumber(e.target.value)}
                      icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                    />
                    <Input
                      label="IATA Kodu (2 Harf)"
                      placeholder="Örn: LF"
                      value={iataCode}
                      onChange={(e) => setIataCode(e.target.value)}
                    />
                    <Input
                      label="ICAO Kodu (3 Harf)"
                      placeholder="Örn: LFA"
                      value={icaoCode}
                      onChange={(e) => setIcaoCode(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {selectedProduct === 'hotel' && (
                <div className="space-y-2.5">
                  <Input
                    label="Tesis Adı (Tabela Adı) *"
                    placeholder="Örn: Grand Life Resort & Spa"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    icon={<Building className="h-4 w-4 text-muted-foreground" />}
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <Input
                      label="Turizm İşletme / Ruhsat No"
                      placeholder="Örn: KTB-TR-2024-88"
                      value={tourismLicenseNumber}
                      onChange={(e) => setTourismLicenseNumber(e.target.value)}
                    />
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">
                        Tesis Türü
                      </label>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value as any)}
                        className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="hotel">Otel</option>
                        <option value="resort">Resort & Tatil Köyü</option>
                        <option value="boutique">Butik Otel</option>
                        <option value="apartment">Apart Otel</option>
                        <option value="pension">Pansiyon</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedProduct === 'car_rental' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Input
                    label="KABİS Yetki / Kayıt No"
                    placeholder="Örn: KABIS-34-2024-419"
                    value={kabisNumber}
                    onChange={(e) => setKabisNumber(e.target.value)}
                    icon={<Car className="h-4 w-4 text-muted-foreground" />}
                  />
                  <Input
                    label="Tahmini Filo Araç Sayısı"
                    type="number"
                    placeholder="Örn: 50"
                    value={fleetSize.toString()}
                    onChange={(e) => setFleetSize(parseInt(e.target.value) || 0)}
                  />
                </div>
              )}

              {/* Partner Document Requirements Notice */}
              <div className="rounded-2xl border border-border/80 bg-muted/30 p-3 text-xs space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                  <span>Ürün Yetkilendirme İzolasyonu</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Bu başvuru yalnızca seçili <strong>{PRODUCT_LABELS[selectedProduct].labelTr}</strong> alanında geçerlidir. Diğer seyahat ürünleri bağımsız başvuru gerektirir.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {PRODUCT_LABELS[selectedProduct].labelTr} Başvurusunu Gönder
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
