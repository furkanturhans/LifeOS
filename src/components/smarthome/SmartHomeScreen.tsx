'use client';

import React, { useEffect, useState } from 'react';
import {
  Home,
  Radio,
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
  Sun,
  Flame,
  Camera,
  WashingMachine,
  Activity,
  Wifi,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSmartHomeStore, SmartHomeTab } from '@/stores/useSmartHomeStore';
import { DeviceCard } from './DeviceCard';
import { ConnectBridgeModal } from './ConnectBridgeModal';
import { SecurityConfirmModal } from './SecurityConfirmModal';
import { SolarInverterView } from './SolarInverterView';
import { HeatPumpView } from './HeatPumpView';
import { CameraGridView } from './CameraGridView';
import { AppliancesView } from './AppliancesView';
import { PowerFlowEfficiencyView } from './PowerFlowEfficiencyView';
import { AutomationsTab } from './AutomationsTab';
import { WifiDiscoveryModal } from './WifiDiscoveryModal';
import type { SmartDevice, SmartDeviceCategory, SmartHomeRole } from '@/types/smarthome';
import { cn } from '@/lib/utils';

export function SmartHomeScreen() {
  const {
    home,
    overview,
    devices,
    rooms,
    scenes,
    selectedRoom,
    selectedCategory,
    currentRole,
    activeTab,
    setActiveTab,
    fetchSmartHomeStatus,
    setCurrentRole,
    setSelectedRoom,
    setSelectedCategory,
    controlDevice,
    activateScene,
    isLoading,
  } = useSmartHomeStore();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isWifiModalOpen, setIsWifiModalOpen] = useState(false);
  const [securityModalDevice, setSecurityModalDevice] = useState<SmartDevice | null>(null);
  const [houseName, setHouseName] = useState('Evim');
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

  // Filtered devices
  const filteredDevices = devices.filter((device) => {
    const matchesRoom = selectedRoom === 'all' || device.room === selectedRoom;
    const matchesCategory =
      selectedCategory === 'all' ||
      device.category === selectedCategory ||
      (selectedCategory === 'lock' && (device.category === 'lock' || device.category === 'camera' || device.category === 'safety_sensor'));
    return matchesRoom && matchesCategory;
  });

  const isConnected = home?.isBridgeConnected;

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* House Selector & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <Home className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <select
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  aria-label="Ev seçimi"
                  className="bg-transparent font-black text-base text-foreground cursor-pointer focus:outline-none pr-1"
                >
                  <option value="Evim" className="bg-card text-foreground">Kadıköy Evim</option>
                  <option value="Yazlık" className="bg-card text-foreground">Bodrum Yazlık</option>
                  <option value="Ofis" className="bg-card text-foreground">Levent Ofis</option>
                </select>

                <span
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                    isConnected
                      ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  {isConnected ? 'WiFi & HA Bağlı' : 'Köprü Yapılandırılmadı'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                İnverter • Solar • Isı Pompası • Kamera • kW Güç • Ev Aletleri
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* WiFi Discovery Radar Button */}
            <button
              onClick={() => setIsWifiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-2xs"
            >
              <Wifi className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">WiFi Cihaz Bulucu</span>
            </button>

            {/* Bridge Setup / Status Button */}
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold text-sky-600 transition-all"
            >
              <Settings className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Köprü Ayarları</span>
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

        {/* Navigation Tabs (7 Focused Pillars) */}
        <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar border-t border-border/40 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Odalar & Cihazlar</span>
          </button>

          <button
            onClick={() => setActiveTab('solar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'solar'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            <span>Solar & İnverter</span>
          </button>

          <button
            onClick={() => setActiveTab('heatpump')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'heatpump'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-sky-500" />
            <span>Isı Pompası</span>
          </button>

          <button
            onClick={() => setActiveTab('cameras')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'cameras'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Camera className="h-3.5 w-3.5 text-indigo-500" />
            <span>Kameralar</span>
          </button>

          <button
            onClick={() => setActiveTab('appliances')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'appliances'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <WashingMachine className="h-3.5 w-3.5 text-emerald-500" />
            <span>Ev Aletleri</span>
          </button>

          <button
            onClick={() => setActiveTab('powerflow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'powerflow'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-purple-500" />
            <span>kW Güç & Verimlilik</span>
          </button>

          <button
            onClick={() => setActiveTab('automations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'automations'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Sahneler & Loglar</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        {/* Quick Real-Time Status Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-6">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-center gap-2.5">
            <Sun className="h-4.5 w-4.5 text-amber-500" />
            <div>
              <span className="text-[10px] text-muted-foreground">Solar Üretim</span>
              <div className="text-xs font-bold text-foreground">
                {overview?.solarProductionKW ? `${overview.solarProductionKW.toFixed(1)} kW` : '4.8 kW'}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-3 flex items-center gap-2.5">
            <Flame className="h-4.5 w-4.5 text-sky-500" />
            <div>
              <span className="text-[10px] text-muted-foreground">Isı Pompası</span>
              <div className="text-xs font-bold text-foreground">
                {overview?.heatPumpStatus || 'ISITMA (22.5°C)'}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-3 flex items-center gap-2.5">
            <Zap className="h-4.5 w-4.5 text-purple-500" />
            <div>
              <span className="text-[10px] text-muted-foreground">Anlık Ev Yükü</span>
              <div className="text-xs font-bold text-foreground">
                {overview?.liveHomePowerKW ? `${overview.liveHomePowerKW} kW` : '2.15 kW'}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-2.5">
            <Lightbulb className="h-4.5 w-4.5 text-amber-500" />
            <div>
              <span className="text-[10px] text-muted-foreground">Açık Işıklar</span>
              <div className="text-xs font-bold text-foreground">
                {overview?.activeLights || 0} Lamba
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-2.5">
            <DoorOpen className="h-4.5 w-4.5 text-blue-500" />
            <div>
              <span className="text-[10px] text-muted-foreground">Pencere / Kapı</span>
              <div className="text-xs font-bold text-foreground">
                {overview?.openDoorsWindows || 0} Açık
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-2.5">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
            <div>
              <span className="text-[10px] text-muted-foreground">Güvenlik</span>
              <div className="text-xs font-bold text-emerald-600">Güvende</div>
            </div>
          </div>
        </div>

        {/* Tab 1: Odalar & Cihazlar (Dashboard) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Scenes Toolbar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Hızlı Senaryolar (Tek Dokunuş)
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {scenes.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={async () => {
                      const res = await activateScene(scene.id);
                      if (res.success) showNotification(res.message);
                      else showNotification(res.message, true);
                    }}
                    className="flex flex-col items-start p-3 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-all text-left shadow-2xs hover:shadow-xs group"
                  >
                    <span className="text-xl mb-1.5 group-hover:scale-110 transition-transform">{scene.icon}</span>
                    <span className="text-xs font-bold text-foreground truncate w-full">{scene.name}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{scene.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Room Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedRoom('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedRoom === 'all'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Tüm Odalar ({devices.length})
              </button>

              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedRoom === room.name
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <span>{room.icon}</span>
                  <span>{room.name}</span>
                </button>
              ))}
            </div>

            {/* Unconnected Bridge Informative Guidance */}
            {!isConnected && devices.length === 0 && (
              <div className="rounded-3xl border border-border bg-gradient-to-br from-muted/30 via-card to-card p-8 text-center max-w-xl mx-auto my-6 shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-3">
                  <Wifi className="h-7 w-7 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Akıllı Ev Köprüsü Bağlı Değil
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Home Assistant, Matter veya yerel solar inverter sisteminize bağlanarak evinizdeki tüm cihazları, ısı pompasını ve kameraları anında kontrol edebilirsiniz.
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setIsWifiModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-95"
                  >
                    Yerel WiFi Ağından Otomatik Bul
                  </button>
                  <button
                    onClick={() => setIsConnectModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground"
                  >
                    Manuel Home Assistant Bağla
                  </button>
                </div>
              </div>
            )}

            {/* Devices Grid */}
            {filteredDevices.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Cihazlar ({filteredDevices.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredDevices.map((device) => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      onToggle={() => handleToggleDevice(device)}
                      onRequestPin={() => setSecurityModalDevice(device)}
                      userRole={currentRole}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Solar & İnverter */}
        {activeTab === 'solar' && <SolarInverterView />}

        {/* Tab 3: Isı Pompası */}
        {activeTab === 'heatpump' && <HeatPumpView />}

        {/* Tab 4: Kameralar */}
        {activeTab === 'cameras' && <CameraGridView />}

        {/* Tab 5: Ev Aletleri */}
        {activeTab === 'appliances' && <AppliancesView />}

        {/* Tab 6: kW Güç & Verimlilik */}
        {activeTab === 'powerflow' && <PowerFlowEfficiencyView />}

        {/* Tab 7: Sahneler & Otomasyonlar */}
        {activeTab === 'automations' && <AutomationsTab />}
      </main>

      {/* Modals */}
      <ConnectBridgeModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />

      <WifiDiscoveryModal
        isOpen={isWifiModalOpen}
        onClose={() => setIsWifiModalOpen(false)}
      />

      <SecurityConfirmModal
        isOpen={Boolean(securityModalDevice)}
        onClose={() => setSecurityModalDevice(null)}
        onConfirm={handleConfirmSecurityPin}
        device={securityModalDevice}
      />
    </div>
  );
}
