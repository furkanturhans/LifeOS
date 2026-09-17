'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  QrCode,
  Home,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ChevronRight,
  Smartphone,
  Check,
} from 'lucide-react';
import { useSmartHomeStore } from '@/stores/useSmartHomeStore';
import type { CandidateSmartDevice, SupportedVendorAccount } from '@/types/smarthome';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AddMethod = 'select' | 'matter' | 'home_assistant' | 'vendor';

export function AddDeviceModal({ isOpen, onClose }: AddDeviceModalProps) {
  const {
    commissionMatterDevice,
    discoverHomeAssistantEntities,
    importHomeAssistantDevices,
    supportedVendors,
    rooms,
  } = useSmartHomeStore();

  const [step, setStep] = useState<AddMethod>('select');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Matter Form State
  const [matterCode, setMatterCode] = useState('');
  const [matterDeviceName, setMatterDeviceName] = useState('');
  const [matterRoomName, setMatterRoomName] = useState('');

  // Home Assistant Form State
  const [haUrl, setHaUrl] = useState('http://homeassistant.local:8123');
  const [haToken, setHaToken] = useState('');
  const [haCandidates, setHaCandidates] = useState<CandidateSmartDevice[]>([]);
  const [selectedHaIds, setSelectedHaIds] = useState<Record<string, boolean>>({});
  const [customHaNames, setCustomHaNames] = useState<Record<string, string>>({});
  const [customHaRooms, setCustomHaRooms] = useState<Record<string, string>>({});
  const [isHaLoaded, setIsHaLoaded] = useState(false);

  // Vendor State
  const [selectedVendor, setSelectedVendor] = useState<SupportedVendorAccount | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep('select');
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(false);
    setMatterCode('');
    setMatterDeviceName('');
    setMatterRoomName('');
    setHaCandidates([]);
    setSelectedHaIds({});
    setIsHaLoaded(false);
    setSelectedVendor(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // 1. Submit Matter Commissioning
  const handleMatterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matterCode.trim()) {
      setError('Lütfen geçerli bir Matter QR / eşleştirme kodu giriniz.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const res = await commissionMatterDevice({
      setupCode: matterCode.trim(),
      customName: matterDeviceName.trim() || 'Matter Akıllı Cihaz',
      roomName: matterRoomName.trim() || undefined,
    });

    setIsSubmitting(false);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccessMsg(res.message);
      setTimeout(() => handleClose(), 1500);
    }
  };

  // 2. Discover Home Assistant Entities
  const handleHaDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!haUrl.trim() || !haToken.trim()) {
      setError('Home Assistant adresi ve Erişim Belirteci (Token) zorunludur.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const res = await discoverHomeAssistantEntities({
      url: haUrl.trim(),
      token: haToken.trim(),
    });

    setIsSubmitting(false);
    if (!res.success) {
      setError(res.message);
    } else {
      setHaCandidates(res.candidates);
      setIsHaLoaded(true);
      // Pre-select all by default for convenience, user can uncheck
      const initialSelection: Record<string, boolean> = {};
      const initialRooms: Record<string, string> = {};
      const initialNames: Record<string, string> = {};
      res.candidates.forEach((c) => {
        initialSelection[c.providerDeviceId] = true;
        initialNames[c.providerDeviceId] = c.name;
        initialRooms[c.providerDeviceId] = c.suggestedRoom || '';
      });
      setSelectedHaIds(initialSelection);
      setCustomHaNames(initialNames);
      setCustomHaRooms(initialRooms);
    }
  };

  // 2.2 Import Selected Home Assistant Entities
  const handleHaImportSelected = async () => {
    const selectedList = haCandidates.filter((c) => selectedHaIds[c.providerDeviceId]);
    if (selectedList.length === 0) {
      setError('Lütfen içe aktarmak için en az 1 cihaz seçiniz.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const payload = selectedList.map((c) => ({
      candidate: c,
      customName: customHaNames[c.providerDeviceId] || c.name,
      roomName: customHaRooms[c.providerDeviceId] || undefined,
    }));

    const res = await importHomeAssistantDevices({
      url: haUrl.trim(),
      token: haToken.trim(),
      selectedEntities: payload,
    });

    setIsSubmitting(false);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccessMsg(res.message);
      setTimeout(() => handleClose(), 1500);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {step === 'select'
                    ? 'Yeni Akıllı Cihaz Ekle'
                    : step === 'matter'
                    ? 'Matter Cihazı Eşleştir'
                    : step === 'home_assistant'
                    ? 'Home Assistant Entegrasyonu'
                    : 'Desteklenen Marka Hesabı'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Yalnızca fiziksel olarak sahip olduğunuz gerçek cihazları bağlayın
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {/* Step 1: Selection Screen (3 Verified Paths) */}
            {step === 'select' && (
              <div className="space-y-3">
                {/* 1. Matter Option */}
                <div
                  onClick={() => setStep('matter')}
                  className="group cursor-pointer rounded-2xl border border-border p-4 bg-card hover:bg-muted/40 hover:border-primary/50 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                        <QrCode className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">Matter Cihazı Ekle</h3>
                          <span className="rounded bg-emerald-500/15 px-2 py-0.2 text-[10px] font-bold text-emerald-600">
                            Yerel Standart
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Kutu veya cihaz üzerindeki Matter QR kodunu veya 11/21 haneli kurulum kodunu tarayın.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                {/* 2. Home Assistant Option */}
                <div
                  onClick={() => setStep('home_assistant')}
                  className="group cursor-pointer rounded-2xl border border-border p-4 bg-card hover:bg-muted/40 hover:border-primary/50 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 group-hover:scale-105 transition-transform">
                        <Home className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">Home Assistant’a Bağlan</h3>
                          <span className="rounded bg-sky-500/15 px-2 py-0.2 text-[10px] font-bold text-sky-600">
                            Köprü
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Evinizdeki Home Assistant varlıklarını doğrulayın ve istediklerinizi seçerek ekleyin.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                {/* 3. Vendor Account Option */}
                <div
                  onClick={() => setStep('vendor')}
                  className="group cursor-pointer rounded-2xl border border-border p-4 bg-card hover:bg-muted/40 hover:border-primary/50 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 group-hover:scale-105 transition-transform">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">Desteklenen Marka Hesabını Bağla</h3>
                          <span className="rounded bg-purple-500/15 px-2 py-0.2 text-[10px] font-bold text-purple-600">
                            Resmi API
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Philips Hue, Tuya, Shelly, Netatmo, Daikin, Fronius resmi OAuth hesabı bağlama.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                {/* Mobile WiFi Notice Card */}
                <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 mt-4 flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Yerel Ağ & Bluetooth Keşfi</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Yerel ağ izni ve Bluetooth ile doğrudan donanım eşleştirmesi için LifeOS mobil uygulamasını kullanabilirsiniz. Tarayıcıda güvenli Matter kodu veya Home Assistant / Marka API'si ile cihaz ekleyebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Matter Pairing Form */}
            {step === 'matter' && (
              <form onSubmit={handleMatterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Matter Kurulum Kodu veya QR Metni
                  </label>
                  <input
                    type="text"
                    value={matterCode}
                    onChange={(e) => setMatterCode(e.target.value)}
                    placeholder="Örn: MT:Y35J04VJ00MAS000000 veya 11/21 haneli kod"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Cihazın üzerindeki veya kutusundaki resmi Matter QR kodunu giriniz.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Cihaz Adı
                  </label>
                  <input
                    type="text"
                    value={matterDeviceName}
                    onChange={(e) => setMatterDeviceName(e.target.value)}
                    placeholder="Örn: Salon Lambaderi"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Oda Belirle (İsteğe Bağlı)
                  </label>
                  <input
                    type="text"
                    value={matterRoomName}
                    onChange={(e) => setMatterRoomName(e.target.value)}
                    placeholder="Örn: Salon, Çalışma Odası, Balkon"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Geri
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    <span>Eşleştirmeyi Doğrula & Ekle</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Home Assistant Connect & Entity Selector */}
            {step === 'home_assistant' && (
              <div className="space-y-4">
                {!isHaLoaded ? (
                  <form onSubmit={handleHaDiscover} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">
                        Home Assistant Sunucu Adresi
                      </label>
                      <input
                        type="url"
                        value={haUrl}
                        onChange={(e) => setHaUrl(e.target.value)}
                        placeholder="http://homeassistant.local:8123"
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">
                        Long-Lived Access Token (Erişim Belirteci)
                      </label>
                      <textarea
                        value={haToken}
                        onChange={(e) => setHaToken(e.target.value)}
                        placeholder="Home Assistant Profilinizden oluşturulan Uzun Süreli Erişim Belirteci"
                        rows={3}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                        required
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Token yalnızca sunucu tarafında güvenle saklanır, istemciye iletilmez.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <button
                        type="button"
                        onClick={() => setStep('select')}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted"
                      >
                        Geri
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                        <span>Bağlantıyı Doğrula & Cihazları Listele</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Bulunan Gerçek Cihazlar ({haCandidates.length})
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          LifeOS’a eklemek istediğiniz cihazları işaretleyin:
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsHaLoaded(false)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Adres/Token Değiştir
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {haCandidates.map((candidate) => {
                        const isChecked = Boolean(selectedHaIds[candidate.providerDeviceId]);
                        return (
                          <div
                            key={candidate.providerDeviceId}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              isChecked
                                ? 'border-primary/50 bg-primary/5'
                                : 'border-border/70 bg-card opacity-60 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) =>
                                  setSelectedHaIds((prev) => ({
                                    ...prev,
                                    [candidate.providerDeviceId]: e.target.checked,
                                  }))
                                }
                                className="mt-1 h-4 w-4 rounded text-primary focus:ring-primary/40 cursor-pointer"
                              />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-foreground truncate">
                                    {candidate.name}
                                  </span>
                                  <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-mono text-muted-foreground">
                                    {candidate.providerDeviceId}
                                  </span>
                                </div>

                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={customHaNames[candidate.providerDeviceId] || ''}
                                    onChange={(e) =>
                                      setCustomHaNames((prev) => ({
                                        ...prev,
                                        [candidate.providerDeviceId]: e.target.value,
                                      }))
                                    }
                                    placeholder="Cihaz Adı"
                                    className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none"
                                  />

                                  <input
                                    type="text"
                                    value={customHaRooms[candidate.providerDeviceId] || ''}
                                    onChange={(e) =>
                                      setCustomHaRooms((prev) => ({
                                        ...prev,
                                        [candidate.providerDeviceId]: e.target.value,
                                      }))
                                    }
                                    placeholder="Oda (örn: Salon, Mutfak)"
                                    className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {Object.values(selectedHaIds).filter(Boolean).length} cihaz seçildi
                      </span>

                      <button
                        type="button"
                        onClick={handleHaImportSelected}
                        disabled={isSubmitting || Object.values(selectedHaIds).filter(Boolean).length === 0}
                        className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                        <span>Seçilenleri LifeOS’a Ekle</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Supported Vendor Accounts */}
            {step === 'vendor' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {supportedVendors.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVendor(v)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedVendor?.id === v.id
                          ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                          : 'border-border bg-card hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{v.brandIcon}</span>
                          <span className="text-xs font-bold text-foreground">{v.name}</span>
                        </div>
                        {v.isSupported ? (
                          <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                            OAuth2 Aktif
                          </span>
                        ) : (
                          <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[9px] font-bold text-amber-600">
                            Desteklenmiyor
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {v.description}
                      </p>
                    </div>
                  ))}
                </div>

                {selectedVendor && (
                  <div className="mt-4 p-4 rounded-2xl border border-border bg-muted/40 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedVendor.brandIcon}</span>
                      <h4 className="text-xs font-bold text-foreground">{selectedVendor.name} Bağlantısı</h4>
                    </div>

                    {selectedVendor.isSupported ? (
                      <div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Resmi OAuth2 yetkilendirmesi ile {selectedVendor.name} hesabınızı güvenli şekilde bağlayabilirsiniz. Şifreniz asla LifeOS’a iletilmez.
                        </p>
                        <button
                          onClick={() => {
                            setSuccessMsg(`${selectedVendor.name} yetkilendirme penceresi açılıyor...`);
                            setTimeout(() => handleClose(), 1500);
                          }}
                          className="mt-3 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-95 flex items-center gap-1.5"
                        >
                          <span>{selectedVendor.name} ile Giriş Yap</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{selectedVendor.statusNotice}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Geri
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
