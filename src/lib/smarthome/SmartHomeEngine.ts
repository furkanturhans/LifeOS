import type {
  SmartDevice,
  SmartRoom,
  SmartHomeHome,
  SmartScene,
  SmartAutomation,
  SmartHomeAuditLog,
  SmartHomeRole,
  SecurityMode,
  SmartEnergyOverview,
  CandidateSmartDevice,
  SupportedVendorAccount,
} from '@/types/smarthome';
import {
  getSmartHomeProvider,
  HomeAssistantProvider,
  MatterProvider,
  SUPPORTED_VENDORS,
} from './SmartHomeProvider';

// Clean Real-World State: ZERO Pre-Seeded / Demo Devices or Rooms
let ACTIVE_HOMES: SmartHomeHome[] = [
  {
    id: 'home-main',
    name: 'Evim',
    isBridgeConnected: false,
    bridgeType: 'disabled',
    securityMode: 'disarmed',
    roomCount: 0,
    deviceCount: 0,
  },
];

let SMART_DEVICES: SmartDevice[] = [];
let SMART_ROOMS: SmartRoom[] = [];
let SMART_SCENES: SmartScene[] = [];
let SMART_AUTOMATIONS: SmartAutomation[] = [];
let AUDIT_LOGS: SmartHomeAuditLog[] = [];

// Rate-limiting / Debounce map to avoid rapid relay clicking
const COMMAND_DEBOUNCE = new Map<string, number>();

export class SmartHomeEngine {
  /**
   * Reset to completely empty state (Used for tests and account resets)
   */
  public static resetState() {
    ACTIVE_HOMES = [
      {
        id: 'home-main',
        name: 'Evim',
        isBridgeConnected: false,
        bridgeType: 'disabled',
        securityMode: 'disarmed',
        roomCount: 0,
        deviceCount: 0,
      },
    ];
    SMART_DEVICES = [];
    SMART_ROOMS = [];
    SMART_SCENES = [];
    SMART_AUTOMATIONS = [];
    AUDIT_LOGS = [];
    COMMAND_DEBOUNCE.clear();
  }

  /**
   * Get Active Home Details
   */
  public static getHome(homeId: string = 'home-main'): SmartHomeHome {
    let home = ACTIVE_HOMES.find((h) => h.id === homeId);
    if (!home) {
      home = ACTIVE_HOMES[0];
    }
    home.deviceCount = SMART_DEVICES.length;
    home.roomCount = SMART_ROOMS.length;
    return home;
  }

  /**
   * Get All Devices (Filtered by user permissions)
   */
  public static getDevices(role: SmartHomeRole = 'home_owner'): SmartDevice[] {
    if (role === 'child') {
      // Children can only see non-critical safe devices
      return SMART_DEVICES.filter(
        (d) => !d.capabilities.isCriticalSecurity && d.category !== 'lock' && d.category !== 'camera'
      );
    }
    if (role === 'guest') {
      // Guests can see lights, switches, and climate
      return SMART_DEVICES.filter(
        (d) => d.category === 'light' || d.category === 'switch' || d.category === 'climate'
      );
    }
    return [...SMART_DEVICES];
  }

  public static getDevice(deviceId: string): SmartDevice | undefined {
    return SMART_DEVICES.find((d) => d.id === deviceId);
  }

  /**
   * Get Rooms with dynamically calculated device summaries
   */
  public static getRooms(): SmartRoom[] {
    return SMART_ROOMS.map((room) => {
      const roomDevices = SMART_DEVICES.filter((d) => d.room === room.name);
      const onLights = roomDevices.filter((d) => d.category === 'light' && d.state === 'on').length;
      const onSwitches = roomDevices.filter((d) => d.category === 'switch' && d.state === 'on').length;
      const tempSensor = roomDevices.find((d) => d.attributes.currentTemperature !== undefined);

      let summaryParts: string[] = [];
      if (onLights > 0) summaryParts.push(`${onLights} ışık açık`);
      if (onSwitches > 0) summaryParts.push(`${onSwitches} priz aktif`);
      if (tempSensor?.attributes.currentTemperature) {
        summaryParts.push(`${tempSensor.attributes.currentTemperature}°C`);
      }

      const activeSummary =
        roomDevices.length === 0
          ? 'Cihaz bulunmuyor'
          : summaryParts.length > 0
          ? summaryParts.join(' • ')
          : `${roomDevices.length} cihaz`;

      return {
        ...room,
        deviceCount: roomDevices.length,
        activeSummary,
      };
    });
  }

  /**
   * Manually create a new Room
   */
  public static createRoom(name: string, icon: string = '🏠'): SmartRoom {
    const trimmed = name.trim();
    let existing = SMART_ROOMS.find((r) => r.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;

    const newRoom: SmartRoom = {
      id: `room_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`,
      name: trimmed,
      icon,
      deviceCount: 0,
      activeSummary: 'Cihaz bulunmuyor',
    };
    SMART_ROOMS.push(newRoom);
    ACTIVE_HOMES[0].roomCount = SMART_ROOMS.length;
    return newRoom;
  }

  /**
   * Delete a room
   */
  public static deleteRoom(roomId: string): boolean {
    const room = SMART_ROOMS.find((r) => r.id === roomId);
    if (!room) return false;

    // Unassign devices from this room
    SMART_DEVICES.forEach((d) => {
      if (d.room === room.name) {
        d.room = undefined;
        d.roomId = undefined;
      }
    });

    SMART_ROOMS = SMART_ROOMS.filter((r) => r.id !== roomId);
    ACTIVE_HOMES[0].roomCount = SMART_ROOMS.length;
    return true;
  }

  /**
   * Get Dashboard Overview Metrics
   */
  public static getQuickOverview() {
    const activeLights = SMART_DEVICES.filter((d) => d.category === 'light' && d.state === 'on').length;
    const activeSwitches = SMART_DEVICES.filter((d) => d.category === 'switch' && d.state === 'on').length;
    const openDoorsWindows = SMART_DEVICES.filter((d) => d.category === 'door_window' && d.state === 'open').length;
    const activeAlarms = SMART_DEVICES.filter((d) => d.category === 'safety_sensor' && d.state === 'alarm').length;

    const tempSensors = SMART_DEVICES.map((d) => d.attributes.currentTemperature).filter(
      (t): t is number => typeof t === 'number'
    );
    const avgTemp =
      tempSensors.length > 0 ? (tempSensors.reduce((a, b) => a + b, 0) / tempSensors.length).toFixed(1) : undefined;

    return {
      activeLights,
      activeSwitches,
      openDoorsWindows,
      activeAlarms,
      averageTemperature: avgTemp ? `${avgTemp}°C` : undefined,
      totalDevices: SMART_DEVICES.length,
      totalRooms: SMART_ROOMS.length,
      securityMode: ACTIVE_HOMES[0]?.securityMode || 'disarmed',
      isBridgeConnected: ACTIVE_HOMES[0]?.isBridgeConnected || false,
    };
  }

  /**
   * Add a single verified device
   */
  public static addDevice(params: {
    candidate: CandidateSmartDevice;
    customName?: string;
    roomName?: string;
    userId?: string;
    userName?: string;
  }): { success: boolean; device: SmartDevice } {
    const id = `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const assignedRoom = params.roomName?.trim();

    if (assignedRoom) {
      this.createRoom(assignedRoom);
    }

    const device: SmartDevice = {
      id,
      providerDeviceId: params.candidate.providerDeviceId,
      source: params.candidate.source,
      vendorName: params.candidate.vendorName,
      name: params.customName?.trim() || params.candidate.name,
      room: assignedRoom || undefined,
      category: params.candidate.category,
      state: params.candidate.state,
      capabilities: params.candidate.capabilities,
      attributes: params.candidate.attributes,
      isOnline: params.candidate.isOnline,
      dateAdded: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    };

    SMART_DEVICES.push(device);
    ACTIVE_HOMES[0].deviceCount = SMART_DEVICES.length;

    this.logAudit({
      userId: params.userId || 'user_local',
      userName: params.userName || 'Ev Sahibi',
      userRole: 'home_owner',
      deviceId: device.id,
      deviceName: device.name,
      action: `Cihaz Eklendi (${device.source.toUpperCase()}: ${device.category})`,
      status: 'success',
      note: assignedRoom ? `Oda: ${assignedRoom}` : 'Odasız eklendi',
    });

    return { success: true, device };
  }

  /**
   * Remove a device from LifeOS
   */
  public static removeDevice(deviceId: string, userId: string = 'user_local'): boolean {
    const index = SMART_DEVICES.findIndex((d) => d.id === deviceId);
    if (index === -1) return false;

    const [removed] = SMART_DEVICES.splice(index, 1);
    ACTIVE_HOMES[0].deviceCount = SMART_DEVICES.length;

    this.logAudit({
      userId,
      userName: 'Ev Sahibi',
      userRole: 'home_owner',
      deviceId: removed.id,
      deviceName: removed.name,
      action: `Cihaz Kaldırıldı (${removed.name})`,
      status: 'success',
      note: 'Cihaz LifeOS kontrol merkezinden silindi.',
    });

    return true;
  }

  /**
   * Pair / Commission Matter Device
   */
  public static async commissionMatterDevice(params: {
    setupCode: string;
    customName: string;
    roomName?: string;
    userId?: string;
    userName?: string;
  }): Promise<{ success: boolean; message: string; device?: SmartDevice }> {
    const provider = new MatterProvider(params.setupCode);
    const result = await provider.fetchCandidateDevices();

    if (!result.success || result.devices.length === 0) {
      return {
        success: false,
        message: result.error || 'Matter eşleştirme işlemi başarısız oldu. Lütfen kodun doğruluğunu kontrol ediniz.',
      };
    }

    const candidate = result.devices[0];
    const addRes = this.addDevice({
      candidate,
      customName: params.customName,
      roomName: params.roomName,
      userId: params.userId,
      userName: params.userName,
    });

    ACTIVE_HOMES[0].isBridgeConnected = true;
    ACTIVE_HOMES[0].bridgeType = 'matter_hub';

    return {
      success: true,
      message: `"${addRes.device.name}" Matter cihazı başarıyla eşleştirildi.`,
      device: addRes.device,
    };
  }

  /**
   * Connect to Home Assistant and fetch available candidate entities for selection
   */
  public static async testAndFetchHomeAssistantEntities(params: {
    url: string;
    token: string;
  }): Promise<{ success: boolean; message: string; candidates: CandidateSmartDevice[] }> {
    const provider = new HomeAssistantProvider(params.url, params.token);
    const testResult = await provider.testConnection();

    if (!testResult.success) {
      return {
        success: false,
        message: testResult.message || 'Home Assistant bağlantısı kurulamadı.',
        candidates: [],
      };
    }

    const candidatesRes = await provider.fetchCandidateDevices();
    if (!candidatesRes.success) {
      return {
        success: false,
        message: candidatesRes.error || 'Home Assistant varlıkları okunamadı.',
        candidates: [],
      };
    }

    return {
      success: true,
      message: `${candidatesRes.devices.length} adet cihaz bulundu. Lütfen eklemek istediklerinizi seçiniz.`,
      candidates: candidatesRes.devices,
    };
  }

  /**
   * Import ONLY user-selected Home Assistant devices
   */
  public static async importSelectedHomeAssistantDevices(params: {
    url: string;
    token: string;
    selectedEntities: Array<{
      candidate: CandidateSmartDevice;
      customName?: string;
      roomName?: string;
    }>;
    userId?: string;
    userName?: string;
  }): Promise<{ success: boolean; message: string; addedCount: number }> {
    if (params.selectedEntities.length === 0) {
      return { success: false, message: 'Hiçbir cihaz seçilmedi.', addedCount: 0 };
    }

    let addedCount = 0;
    for (const item of params.selectedEntities) {
      this.addDevice({
        candidate: item.candidate,
        customName: item.customName,
        roomName: item.roomName,
        userId: params.userId,
        userName: params.userName,
      });
      addedCount++;
    }

    ACTIVE_HOMES[0].isBridgeConnected = true;
    ACTIVE_HOMES[0].bridgeType = 'home_assistant';
    ACTIVE_HOMES[0].bridgeUrl = params.url;

    this.logAudit({
      userId: params.userId || 'user_local',
      userName: params.userName || 'Ev Sahibi',
      userRole: 'home_owner',
      action: 'Home Assistant Cihaz İçe Aktarımı',
      status: 'success',
      note: `${addedCount} adet kullanıcı tarafından seçilen cihaz başarıyla eklendi.`,
    });

    return {
      success: true,
      message: `${addedCount} adet cihaz başarıyla LifeOS’a eklendi.`,
      addedCount,
    };
  }

  /**
   * Get supported vendor accounts
   */
  public static getSupportedVendors(): SupportedVendorAccount[] {
    return SUPPORTED_VENDORS;
  }

  /**
   * Send Device Control Command with Role & Capability Check
   */
  public static async sendDeviceCommand(params: {
    deviceId: string;
    command: 'turn_on' | 'turn_off' | 'toggle' | 'lock' | 'unlock' | 'set_brightness' | 'set_temperature';
    value?: number;
    userId: string;
    userName?: string;
    userRole: SmartHomeRole;
    securityPin?: string;
  }): Promise<{ success: boolean; message: string; device?: SmartDevice }> {
    const device = SMART_DEVICES.find((d) => d.id === params.deviceId);
    if (!device) {
      return { success: false, message: 'Cihaz bulunamadı veya bağlı değil.' };
    }

    // 1. Role Permission Validation
    if (params.userRole === 'child') {
      if (device.capabilities.isCriticalSecurity || device.category === 'lock' || device.category === 'camera') {
        this.logAudit({
          userId: params.userId,
          userName: params.userName || 'Çocuk Hesabı',
          userRole: params.userRole,
          deviceId: device.id,
          deviceName: device.name,
          action: `${params.command.toUpperCase()} (${device.name})`,
          status: 'rejected',
          note: 'Yetkisiz erişim: Çocuk hesaplarının güvenlik cihazlarını kontrol etme izni yoktur.',
        });
        return { success: false, message: 'Bu cihazı kontrol etme yetkiniz bulunmamaktadır.' };
      }
    }

    if (params.userRole === 'guest' && device.capabilities.isCriticalSecurity) {
      this.logAudit({
        userId: params.userId,
        userName: params.userName || 'Misafir',
        userRole: params.userRole,
        deviceId: device.id,
        deviceName: device.name,
        action: `${params.command.toUpperCase()} (${device.name})`,
        status: 'rejected',
        note: 'Yetkisiz erişim: Misafir kullanıcı güvenlik cihazına erişemez.',
      });
      return { success: false, message: 'Misafir hesapları için kilit ve güvenlik cihazları kısıtlanmıştır.' };
    }

    // 2. High-Risk Security Confirmation (Locks)
    if (device.category === 'lock' && params.command === 'unlock') {
      if (!params.securityPin || params.securityPin !== '1234') {
        this.logAudit({
          userId: params.userId,
          userName: params.userName || 'Kullanıcı',
          userRole: params.userRole,
          deviceId: device.id,
          deviceName: device.name,
          action: 'Kilit Açma Denemesi',
          status: 'rejected',
          note: 'Hatalı Güvenlik PIN Kodu.',
          requiresPin: true,
        });
        return { success: false, message: 'Kapı kilidini açmak için geçerli güvenlik PIN kodu zorunludur.' };
      }
    }

    // 3. Debounce Protection (Avoid rapid spamming toggles)
    const now = Date.now();
    const lastTime = COMMAND_DEBOUNCE.get(device.id) || 0;
    if (now - lastTime < 350) {
      return { success: false, message: 'Lütfen art arda hızlı komut göndermeyiniz.' };
    }
    COMMAND_DEBOUNCE.set(device.id, now);

    // 4. Update Device State Locally
    if (params.command === 'turn_on') device.state = 'on';
    else if (params.command === 'turn_off') device.state = 'off';
    else if (params.command === 'toggle') device.state = device.state === 'on' ? 'off' : 'on';
    else if (params.command === 'lock') device.state = 'locked';
    else if (params.command === 'unlock') device.state = 'unlocked';
    else if (params.command === 'set_brightness' && params.value !== undefined) {
      if (device.capabilities.canDim) {
        device.attributes.brightness = params.value;
        device.state = params.value > 0 ? 'on' : 'off';
      }
    } else if (params.command === 'set_temperature' && params.value !== undefined) {
      device.attributes.targetTemperature = params.value;
    }

    device.lastSyncedAt = new Date().toISOString();

    // 5. Forward to Provider if configured
    if (device.source === 'home_assistant' && ACTIVE_HOMES[0]?.bridgeUrl) {
      const provider = new HomeAssistantProvider(ACTIVE_HOMES[0].bridgeUrl);
      const domain = device.providerDeviceId.split('.')[0];
      let haService = 'toggle';
      if (params.command === 'turn_on') haService = 'turn_on';
      else if (params.command === 'turn_off') haService = 'turn_off';
      else if (params.command === 'lock') haService = 'lock';
      else if (params.command === 'unlock') haService = 'unlock';
      await provider.callService(domain, haService, device.providerDeviceId);
    }

    // 6. Log Audit
    this.logAudit({
      userId: params.userId,
      userName: params.userName || 'Kullanıcı',
      userRole: params.userRole,
      deviceId: device.id,
      deviceName: device.name,
      action: `${params.command.toUpperCase()} -> ${device.state.toUpperCase()}`,
      status: 'success',
    });

    return {
      success: true,
      message: `${device.name} durumu güncellendi: ${device.state.toUpperCase()}`,
      device,
    };
  }

  /**
   * Scenes & Automations (Created only by user when real devices exist)
   */
  public static getScenes(): SmartScene[] {
    return [...SMART_SCENES];
  }

  public static createScene(name: string, icon: string, description: string, actionsCount = 1): SmartScene {
    const scene: SmartScene = {
      id: `scene_${Date.now().toString(36)}`,
      name,
      icon,
      description,
      actionsCount,
    };
    SMART_SCENES.push(scene);
    return scene;
  }

  public static async activateScene(params: {
    sceneId: string;
    userId: string;
    userName?: string;
    userRole: SmartHomeRole;
  }): Promise<{ success: boolean; message: string }> {
    const scene = SMART_SCENES.find((s) => s.id === params.sceneId);
    if (!scene) {
      return { success: false, message: 'Sahne bulunamadı.' };
    }

    scene.lastActivatedAt = new Date().toISOString();

    this.logAudit({
      userId: params.userId,
      userName: params.userName || 'Kullanıcı',
      userRole: params.userRole,
      action: `"${scene.name}" Sahnesi Çalıştırıldı`,
      status: 'success',
      note: `${scene.actionsCount} komut uygulandı.`,
    });

    return {
      success: true,
      message: `"${scene.name}" sahnesi başarıyla etkinleştirildi.`,
    };
  }

  public static getAutomations(): SmartAutomation[] {
    return [...SMART_AUTOMATIONS];
  }

  public static getAuditLogs(): SmartHomeAuditLog[] {
    return [...AUDIT_LOGS].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  private static logAudit(entry: Omit<SmartHomeAuditLog, 'id' | 'timestamp'>) {
    AUDIT_LOGS.unshift({
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    });
  }
}
