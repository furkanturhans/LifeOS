import { create } from 'zustand';
import type {
  SmartDevice,
  SmartRoom,
  SmartHomeHome,
  SmartScene,
  SmartAutomation,
  SmartHomeAuditLog,
  SmartHomeRole,
  SmartEnergyOverview,
  SmartDeviceCategory,
  SmartSolarSystem,
  SmartHeatPumpSystem,
  SmartCameraSystem,
  SmartApplianceSystem,
  SmartEnergyFlowOverview,
} from '@/types/smarthome';

export type SmartHomeTab =
  | 'dashboard'
  | 'solar'
  | 'heatpump'
  | 'cameras'
  | 'appliances'
  | 'powerflow'
  | 'automations';

interface SmartHomeState {
  home: SmartHomeHome | null;
  overview: {
    activeLights: number;
    activeSwitches: number;
    openDoorsWindows: number;
    activeAlarms: number;
    averageTemperature?: string;
    totalDevices: number;
    securityMode: string;
    isBridgeConnected: boolean;
    solarProductionKW?: number;
    heatPumpStatus?: string;
    liveHomePowerKW?: string;
  } | null;
  devices: SmartDevice[];
  rooms: SmartRoom[];
  scenes: SmartScene[];
  automations: SmartAutomation[];
  auditLogs: SmartHomeAuditLog[];
  energy: SmartEnergyOverview | null;
  solar: SmartSolarSystem | null;
  heatPump: SmartHeatPumpSystem | null;
  cameras: SmartCameraSystem[];
  appliances: SmartApplianceSystem[];
  energyFlow: SmartEnergyFlowOverview | null;

  activeTab: SmartHomeTab;
  selectedRoom: string | 'all';
  selectedCategory: SmartDeviceCategory | 'all';
  currentRole: SmartHomeRole;
  isLoading: boolean;
  isActionLoading: boolean;
  isScanningWifi: boolean;
  wifiScanDevices: Array<{
    ip: string;
    hostname: string;
    type: string;
    vendor: string;
    model: string;
    pingMs: number;
    isConfigured: boolean;
  }>;
  error: string | null;

  setActiveTab: (tab: SmartHomeTab) => void;
  fetchSmartHomeStatus: () => Promise<void>;
  setCurrentRole: (role: SmartHomeRole) => void;
  setSelectedRoom: (room: string | 'all') => void;
  setSelectedCategory: (category: SmartDeviceCategory | 'all') => void;
  connectBridge: (url: string, token: string) => Promise<{ success: boolean; message: string }>;
  disconnectBridge: () => Promise<{ success: boolean; message: string }>;
  controlDevice: (
    deviceId: string,
    command: 'turn_on' | 'turn_off' | 'toggle' | 'lock' | 'unlock' | 'set_brightness' | 'set_temperature',
    value?: number,
    securityPin?: string
  ) => Promise<{ success: boolean; message: string }>;
  activateScene: (sceneId: string) => Promise<{ success: boolean; message: string }>;

  // Specialized Control Actions
  controlSolarInverter: (params: {
    surplusAction?: 'battery_first' | 'ev_charge' | 'heat_pump_hotwater' | 'grid_export';
    inverterStatus?: 'generating' | 'standby';
  }) => Promise<{ success: boolean; message: string }>;

  controlHeatPump: (params: {
    mode?: 'heating' | 'cooling' | 'hot_water' | 'eco' | 'off';
    targetTempC?: number;
    hotWaterTankTargetTempC?: number;
    silentMode?: boolean;
    boostMode?: boolean;
    solarSyncEnabled?: boolean;
  }) => Promise<{ success: boolean; message: string }>;

  controlCamera: (params: {
    cameraId: string;
    privacyMode?: boolean;
    nightVision?: boolean;
    ptzDirection?: 'up' | 'down' | 'left' | 'right';
  }) => Promise<{ success: boolean; message: string }>;

  controlAppliance: (params: {
    applianceId: string;
    command: 'start' | 'pause' | 'stop' | 'toggle_solar_sync';
    programName?: string;
  }) => Promise<{ success: boolean; message: string }>;

  scanWifiNetwork: () => Promise<void>;
}

export const useSmartHomeStore = create<SmartHomeState>((set, get) => ({
  home: null,
  overview: null,
  devices: [],
  rooms: [],
  scenes: [],
  automations: [],
  auditLogs: [],
  energy: null,
  solar: null,
  heatPump: null,
  cameras: [],
  appliances: [],
  energyFlow: null,

  activeTab: 'dashboard',
  selectedRoom: 'all',
  selectedCategory: 'all',
  currentRole: 'home_owner',
  isLoading: false,
  isActionLoading: false,
  isScanningWifi: false,
  wifiScanDevices: [],
  error: null,

  setActiveTab: (tab: SmartHomeTab) => set({ activeTab: tab }),

  fetchSmartHomeStatus: async () => {
    const role = get().currentRole;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/smarthome/status?role=${role}`);
      const data = await res.json();
      if (data.success) {
        set({
          home: data.home,
          overview: data.overview,
          devices: data.devices || [],
          rooms: data.rooms || [],
          scenes: data.scenes || [],
          automations: data.automations || [],
          auditLogs: data.auditLogs || [],
          energy: data.energy || null,
          solar: data.solar || null,
          heatPump: data.heatPump || null,
          cameras: data.cameras || [],
          appliances: data.appliances || [],
          energyFlow: data.energyFlow || null,
          isLoading: false,
        });
      } else {
        set({ error: data.error || 'Akıllı ev durumu alınamadı.', isLoading: false });
      }
    } catch {
      set({ error: 'Sunucuya bağlanılamadı.', isLoading: false });
    }
  },

  setCurrentRole: (role: SmartHomeRole) => {
    set({ currentRole: role });
    get().fetchSmartHomeStatus();
  },

  setSelectedRoom: (room: string | 'all') => {
    set({ selectedRoom: room });
  },

  setSelectedCategory: (category: SmartDeviceCategory | 'all') => {
    set({ selectedCategory: category });
  },

  connectBridge: async (url: string, token: string) => {
    set({ isActionLoading: true });
    try {
      const res = await fetch('/api/smarthome/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, token, action: 'connect' }),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchSmartHomeStatus();
      }
      set({ isActionLoading: false });
      return data;
    } catch {
      set({ isActionLoading: false });
      return { success: false, message: 'Bağlantı isteği gönderilemedi.' };
    }
  },

  disconnectBridge: async () => {
    set({ isActionLoading: true });
    try {
      const res = await fetch('/api/smarthome/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchSmartHomeStatus();
      }
      set({ isActionLoading: false });
      return data;
    } catch {
      set({ isActionLoading: false });
      return { success: false, message: 'Bağlantı kesme işlemi başarısız.' };
    }
  },

  controlDevice: async (deviceId, command, value, securityPin) => {
    const role = get().currentRole;
    try {
      const res = await fetch('/api/smarthome/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          command,
          value,
          securityPin,
          userRole: role,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistically update device in state
        set((state) => ({
          devices: state.devices.map((d) => (d.id === deviceId ? data.device || d : d)),
        }));
        get().fetchSmartHomeStatus();
      }
      return data;
    } catch {
      return { success: false, message: 'Cihaza komut iletilemedi.' };
    }
  },

  activateScene: async (sceneId: string) => {
    const role = get().currentRole;
    set({ isActionLoading: true });
    try {
      const res = await fetch('/api/smarthome/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId, userRole: role }),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchSmartHomeStatus();
      }
      set({ isActionLoading: false });
      return data;
    } catch {
      set({ isActionLoading: false });
      return { success: false, message: 'Sahne etkinleştirilemedi.' };
    }
  },

  controlSolarInverter: async (params) => {
    try {
      const res = await fetch('/api/smarthome/solar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success && data.solar) {
        set({ solar: data.solar });
      }
      return data;
    } catch {
      return { success: false, message: 'Solar ayarı iletilemedi.' };
    }
  },

  controlHeatPump: async (params) => {
    try {
      const res = await fetch('/api/smarthome/heatpump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success && data.heatPump) {
        set({ heatPump: data.heatPump });
      }
      return data;
    } catch {
      return { success: false, message: 'Isı pompası komutu iletilemedi.' };
    }
  },

  controlCamera: async (params) => {
    const role = get().currentRole;
    try {
      const res = await fetch('/api/smarthome/camera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, userRole: role }),
      });
      const data = await res.json();
      if (data.success && data.camera) {
        set((state) => ({
          cameras: state.cameras.map((c) => (c.id === params.cameraId ? data.camera : c)),
        }));
      }
      return data;
    } catch {
      return { success: false, message: 'Kamera komutu iletilemedi.' };
    }
  },

  controlAppliance: async (params) => {
    try {
      const res = await fetch('/api/smarthome/appliances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success && data.appliance) {
        set((state) => ({
          appliances: state.appliances.map((a) => (a.id === params.applianceId ? data.appliance : a)),
        }));
      }
      return data;
    } catch {
      return { success: false, message: 'Ev aleti komutu iletilemedi.' };
    }
  },

  scanWifiNetwork: async () => {
    set({ isScanningWifi: true });
    try {
      const res = await fetch('/api/smarthome/scan-wifi');
      const data = await res.json();
      if (data.success) {
        set({ wifiScanDevices: data.foundDevices || [], isScanningWifi: false });
      } else {
        set({ isScanningWifi: false });
      }
    } catch {
      set({ isScanningWifi: false });
    }
  },
}));
