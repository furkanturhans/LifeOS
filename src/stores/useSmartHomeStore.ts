import { create } from 'zustand';
import type {
  SmartDevice,
  SmartRoom,
  SmartHomeHome,
  SmartScene,
  SmartAutomation,
  SmartHomeAuditLog,
  SmartHomeRole,
  CandidateSmartDevice,
  SupportedVendorAccount,
} from '@/types/smarthome';

interface SmartHomeState {
  home: SmartHomeHome | null;
  overview: {
    activeLights: number;
    activeSwitches: number;
    openDoorsWindows: number;
    activeAlarms: number;
    averageTemperature?: string;
    totalDevices: number;
    totalRooms: number;
    securityMode: string;
    isBridgeConnected: boolean;
  } | null;
  devices: SmartDevice[];
  rooms: SmartRoom[];
  scenes: SmartScene[];
  automations: SmartAutomation[];
  auditLogs: SmartHomeAuditLog[];
  supportedVendors: SupportedVendorAccount[];

  selectedRoom: string | 'all';
  currentRole: SmartHomeRole;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;

  fetchSmartHomeStatus: () => Promise<void>;
  setCurrentRole: (role: SmartHomeRole) => void;
  setSelectedRoom: (room: string | 'all') => void;

  // Real Device Pairing Actions
  commissionMatterDevice: (params: {
    setupCode: string;
    customName: string;
    roomName?: string;
  }) => Promise<{ success: boolean; message: string; device?: SmartDevice }>;

  discoverHomeAssistantEntities: (params: {
    url: string;
    token: string;
  }) => Promise<{ success: boolean; message: string; candidates: CandidateSmartDevice[] }>;

  importHomeAssistantDevices: (params: {
    url: string;
    token: string;
    selectedEntities: Array<{
      candidate: CandidateSmartDevice;
      customName?: string;
      roomName?: string;
    }>;
  }) => Promise<{ success: boolean; message: string; addedCount: number }>;

  // Device & Room Management
  controlDevice: (
    deviceId: string,
    command: 'turn_on' | 'turn_off' | 'toggle' | 'lock' | 'unlock' | 'set_brightness' | 'set_temperature',
    value?: number,
    securityPin?: string
  ) => Promise<{ success: boolean; message: string; device?: SmartDevice }>;

  removeDevice: (deviceId: string) => Promise<{ success: boolean; message: string }>;

  createRoom: (name: string, icon?: string) => Promise<{ success: boolean; room?: SmartRoom }>;
  deleteRoom: (roomId: string) => Promise<{ success: boolean }>;

  activateScene: (sceneId: string) => Promise<{ success: boolean; message: string }>;
}

export const useSmartHomeStore = create<SmartHomeState>((set, get) => ({
  home: null,
  overview: null,
  devices: [],
  rooms: [],
  scenes: [],
  automations: [],
  auditLogs: [],
  supportedVendors: [],

  selectedRoom: 'all',
  currentRole: 'home_owner',
  isLoading: false,
  isActionLoading: false,
  error: null,

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
          supportedVendors: data.supportedVendors || [],
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

  commissionMatterDevice: async (params) => {
    set({ isActionLoading: true });
    try {
      const res = await fetch('/api/smarthome/matter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchSmartHomeStatus();
      }
      set({ isActionLoading: false });
      return data;
    } catch {
      set({ isActionLoading: false });
      return { success: false, message: 'Matter eşleştirme isteği gönderilemedi.' };
    }
  },

  discoverHomeAssistantEntities: async (params) => {
    set({ isActionLoading: true });
    try {
      const res = await fetch('/api/smarthome/ha/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      set({ isActionLoading: false });
      return data;
    } catch {
      set({ isActionLoading: false });
      return { success: false, message: 'Home Assistant varlıkları taranamadı.', candidates: [] };
    }
  },

  importHomeAssistantDevices: async (params) => {
    set({ isActionLoading: true });
    try {
      const res = await fetch('/api/smarthome/ha/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchSmartHomeStatus();
      }
      set({ isActionLoading: false });
      return data;
    } catch {
      set({ isActionLoading: false });
      return { success: false, message: 'Cihazlar içe aktarılamadı.', addedCount: 0 };
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

  removeDevice: async (deviceId: string) => {
    try {
      const res = await fetch('/api/smarthome/devices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchSmartHomeStatus();
      }
      return data;
    } catch {
      return { success: false, message: 'Cihaz silinemedi.' };
    }
  },

  createRoom: async (name: string, icon = '🏠') => {
    try {
      const res = await fetch('/api/smarthome/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon }),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchSmartHomeStatus();
      }
      return data;
    } catch {
      return { success: false };
    }
  },

  deleteRoom: async (roomId: string) => {
    try {
      const res = await fetch('/api/smarthome/rooms', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchSmartHomeStatus();
      }
      return data;
    } catch {
      return { success: false };
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
}));
