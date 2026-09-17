'use client';

import React, { useEffect, useState } from 'react';
import {
  Home,
  Plus,
  ShieldCheck,
  Lightbulb,
  Power,
  Thermometer,
  Shield,
  Layers,
  Zap,
  Play,
  Settings,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  ChevronDown,
  DoorOpen,
  Droplets,
  QrCode,
  Globe,
  Trash2,
  FolderPlus,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSmartHomeStore } from '@/stores/useSmartHomeStore';
import { DeviceCard } from './DeviceCard';
import { AddDeviceModal } from './AddDeviceModal';
import { SecurityConfirmModal } from './SecurityConfirmModal';
import type { SmartDevice, SmartHomeRole } from '@/types/smarthome';
import { cn } from '@/lib/utils';

export function SmartHomeScreen() {
  const {
    home,
    overview,
    devices,
    rooms,
    scenes,
    selectedRoom,
    currentRole,
    fetchSmartHomeStatus,
    setCurrentRole,
    setSelectedRoom,
    controlDevice,
    removeDevice,
    createRoom,
    deleteRoom,
    activateScene,
    isLoading,
  } = useSmartHomeStore();

  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [securityModalDevice, setSecurityModalDevice] = useState<SmartDevice | null>(null);
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [actionAlert, setActionAlert] = useState<{ message: string; isError: boolean } | null>(null);

  useEffect(() => {
    fetchSmartHomeStatus();
  }, [fetchSmartHomeStatus]);

  const showNotification = (message: string, isError = false) => {
    setActionAlert({ message, isError });
    setTimeout(() => setActionAlert(null), 2500);
  };

  const handleToggleDevice = async (device: SmartDevice) => {
    const nextCommand = device.state === 'on' ? 'turn_off' : 'turn_on';
    const res = await controlDevice(device.id, nextCommand);
    if (!res.success) {
      showNotification(res.message, true);
    } else {
      showNotification(res.message);
    }
  };

  const handleConfirmSecurityPin = async (pin: string) => {
    if (!securityModalDevice) return;
    const res = await controlDevice(securityModalDevice.id, 'unlock', undefined, pin);
    if (!res.success) {
      throw new Error(res.message);
    }
    showNotification(res.message);
  };

  const handleRemoveDevice = async (device: SmartDevice) => {
    if (confirm(`"${device.name}" cihazını LifeOS'tan kaldırmak istediğinize emin misiniz?`)) {
      const res = await removeDevice(device.id);
      if (res.success) {
        showNotification(res.message);
      } else {
        showNotification(res.message, true);
      }
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    const res = await createRoom(newRoomName.trim());
    if (res.success) {
      showNotification(`"${newRoomName}" odası oluşturuldu.`);
      setNewRoomName('');
      setIsNewRoomModalOpen(false);
    }
  };

  // Filtered devices by user room selection
  const filteredDevices = devices.filter((device) => {
    if (selectedRoom === 'all') return true;
    return device.room === selectedRoom;
  });

  const hasDevices = devices.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Action Notification Toast */}
      {actionAlert && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold border transition-all animate-in fade-in slide-in-from-top-4 ${
            actionAlert.isError
              ? 'bg-red-500/90 text-white border-red-400'
              : 'bg-emerald-600/90 text-white border-emerald-400'
          }`}
        >
          {actionAlert.message}
        </div>
      )}

      {/* Main Top Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md px-4 py-3.5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
          {/* House Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <Home className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base text-foreground">Akıllı Evim</h1>
                {hasDevices && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {devices.length} Cihaz Bağlı
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {hasDevices ? 'Fiziksel bağlı cihaz kontrol merkezi' : 'Fiziksel cihaz eşleştirme merkezi'}
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* Add Device Primary Button */}
            <button
              onClick={() => setIsAddDeviceModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Cihaz Ekle</span>
            </button>

            {/* Role Switcher */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border text-xs">
              <UserCheck className="h-3.5 w-3.5 text-muted-foreground ml-1" />
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as SmartHomeRole)}
                aria-label="Kullanıcı rolü"
                className="bg-transparent text-[11px] font-bold text-foreground cursor-pointer focus:outline-none pr-1"
              >
                <option value="home_owner" className="bg-card">Ev Sahibi</option>
                <option value="family_member" className="bg-card">Aile Üyesi</option>
                <option value="guest" className="bg-card">Misafir</option>
                <option value="child" className="bg-card">Çocuk</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* State A: EMPTY STATE (Zero fake data) */}
        {!hasDevices ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <div className="relative mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/10">
                <Home className="h-10 w-10" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border shadow-xs text-muted-foreground">
                <Plus className="h-4 w-4 text-primary" />
              </div>
            </div>

            <h2 className="text-lg font-black tracking-tight text-foreground sm:text-xl">
              Henüz bağlı bir akıllı ev cihazın yok.
            </h2>
            <p className="mt-2 text-xs text-muted-foreground max-w-md leading-relaxed sm:text-sm">
              Fiziksel olarak sahip olduğun cihazları <strong>Matter</strong>, <strong>Home Assistant</strong> veya <strong>desteklenen resmi marka hesabı</strong> ile eşleştirerek bağlayabilirsin.
            </p>

            <button
              onClick={() => setIsAddDeviceModalOpen(true)}
              className="mt-6 flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-md shadow-primary/20 hover:opacity-95 active:scale-98 transition-all"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Cihaz Ekle</span>
            </button>

            {/* Quick Helper Cards */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl w-full text-left">
              <div
                onClick={() => setIsAddDeviceModalOpen(true)}
                className="cursor-pointer rounded-2xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-muted/30 transition-all"
              >
                <QrCode className="h-5 w-5 text-emerald-500 mb-2" />
                <h3 className="text-xs font-bold text-foreground">Matter QR Eşleştirme</h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Kutudaki veya cihazdaki resmi Matter kodunu tarayın.
                </p>
              </div>

              <div
                onClick={() => setIsAddDeviceModalOpen(true)}
                className="cursor-pointer rounded-2xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-muted/30 transition-all"
              >
                <Home className="h-5 w-5 text-sky-500 mb-2" />
                <h3 className="text-xs font-bold text-foreground">Home Assistant Köprüsü</h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Mevcut Home Assistant varlıklarınızı seçerek içe aktarın.
                </p>
              </div>

              <div
                onClick={() => setIsAddDeviceModalOpen(true)}
                className="cursor-pointer rounded-2xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-muted/30 transition-all"
              >
                <Globe className="h-5 w-5 text-purple-500 mb-2" />
                <h3 className="text-xs font-bold text-foreground">Resmi Marka Hesapları</h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Philips Hue, Tuya, Shelly veya Netatmo OAuth hesabı bağlayın.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* State B: REAL DEVICES DISPLAY (Strictly actual connected devices) */
          <div className="space-y-6">
            {/* Real Status Metrics (Calculated only from actual connected devices) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-border bg-card p-3.5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Lightbulb className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Açık Işıklar</span>
                  <span className="text-sm font-bold text-foreground">
                    {overview?.activeLights || 0} Lamba
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-3.5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Power className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Aktif Prizler</span>
                  <span className="text-sm font-bold text-foreground">
                    {overview?.activeSwitches || 0} Priz
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-3.5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <DoorOpen className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Kapı / Pencere</span>
                  <span className="text-sm font-bold text-foreground">
                    {overview?.openDoorsWindows ? `${overview.openDoorsWindows} Açık` : 'Tümü Kapalı'}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-3.5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Toplam Cihaz</span>
                  <span className="text-sm font-bold text-foreground">
                    {devices.length} Cihaz
                  </span>
                </div>
              </div>
            </div>

            {/* Room Navigation Pills */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedRoom('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedRoom === 'all'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Tüm Cihazlar ({devices.length})
                </button>

                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.name)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedRoom === room.name
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <span>{room.name}</span>
                    <span className="text-[10px] opacity-75">({room.deviceCount})</span>
                  </button>
                ))}

                {/* Create Room Button */}
                <button
                  onClick={() => setIsNewRoomModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-border hover:border-primary/50 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  <span>+ Oda Oluştur</span>
                </button>
              </div>
            </div>

            {/* Devices Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDevices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onToggle={() => handleToggleDevice(device)}
                  onRequestPin={() => setSecurityModalDevice(device)}
                  onRemove={() => handleRemoveDevice(device)}
                  userRole={currentRole}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Device Modal */}
      <AddDeviceModal
        isOpen={isAddDeviceModalOpen}
        onClose={() => setIsAddDeviceModalOpen(false)}
      />

      {/* Security Confirm Modal for Locks */}
      <SecurityConfirmModal
        isOpen={Boolean(securityModalDevice)}
        onClose={() => setSecurityModalDevice(null)}
        onConfirm={handleConfirmSecurityPin}
        device={securityModalDevice}
      />

      {/* Manual Room Creation Inline Modal */}
      {isNewRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-foreground mb-1">Yeni Oda Oluştur</h3>
            <p className="text-xs text-muted-foreground mb-4">Cihazlarınızı düzenlemek için bir oda adı belirleyin.</p>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Örn: Çalışma Odası, Balkon, Garaj"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                autoFocus
                required
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewRoomModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-95"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
