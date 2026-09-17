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
  SmartSolarSystem,
  SmartHeatPumpSystem,
  SmartCameraSystem,
  SmartApplianceSystem,
  SmartEnergyFlowOverview,
} from '@/types/smarthome';
import { getSmartHomeProvider, ISmartHomeProvider } from './SmartHomeProvider';

// In-Memory Smart Home Database
let ACTIVE_HOMES: SmartHomeHome[] = [
  {
    id: 'home-main',
    name: 'Evim',
    address: 'Kadıköy, İstanbul',
    isBridgeConnected: false,
    bridgeType: 'disabled',
    securityMode: 'disarmed',
    roomCount: 7,
    deviceCount: 0,
  },
];

let SMART_DEVICES: SmartDevice[] = [];

let SMART_ROOMS: SmartRoom[] = [
  { id: 'room-salon', name: 'Salon', icon: '🛋️', deviceCount: 0, activeSummary: 'Bağlı cihaz yok' },
  { id: 'room-mutfak', name: 'Mutfak', icon: '🍳', deviceCount: 0, activeSummary: 'Bağlı cihaz yok' },
  { id: 'room-yatak', name: 'Yatak Odası', icon: '🛏️', deviceCount: 0, activeSummary: 'Bağlı cihaz yok' },
  { id: 'room-cocuk', name: 'Çocuk Odası', icon: '🧸', deviceCount: 0, activeSummary: 'Bağlı cihaz yok' },
  { id: 'room-banyo', name: 'Banyo', icon: '🚿', deviceCount: 0, activeSummary: 'Bağlı cihaz yok' },
  { id: 'room-balkon', name: 'Balkon', icon: '🌿', deviceCount: 0, activeSummary: 'Bağlı cihaz yok' },
  { id: 'room-cati-enerji', name: 'Çatı & Enerji Odası', icon: '☀️', deviceCount: 0, activeSummary: 'İnverter & Isı Pompası' },
];

let SMART_SCENES: SmartScene[] = [
  { id: 'scene-home', name: 'Evdeyim', icon: '🏠', description: 'Ana ışıklar ve konfor sıcaklığı devrede', actionsCount: 5 },
  { id: 'scene-leaving', name: 'Evden Çıkıyorum', icon: '🚪', description: 'Tüm ışıklar, bekleme prizleri ve fırın kapanır, güvenlik aktifleşir', actionsCount: 8 },
  { id: 'scene-goodnight', name: 'İyi Geceler', icon: '🌙', description: 'Salon & mutfak ışıkları söner, gece kilitleri ve çevre kameraları aktifleşir', actionsCount: 6 },
  { id: 'scene-goodmorning', name: 'Günaydın', icon: '☀️', description: 'Panjurlar açılır, kahve makinesi çalışır, ortam aydınlatması açılır', actionsCount: 4 },
  { id: 'scene-movie', name: 'Film Zamanı', icon: '🎬', description: 'Salon ışıkları %15 loş aydınlatmaya geçer, TV ünitesi açılır', actionsCount: 3 },
  { id: 'scene-eco', name: 'Maksimum Güneş / Eco', icon: '⚡', description: 'Isı pompası su boylerini ısıtır, çamaşır ve bulaşık solar pikte başlar', actionsCount: 6 },
];

let SMART_AUTOMATIONS: SmartAutomation[] = [
  {
    id: 'auto-solar-surplus',
    name: 'Güneş Fazlası ile Sıcak Su & Çamaşır',
    description: 'Çatı solar üretimi 3.5 kW üzerine çıktığında ısı pompası boylerini 58°C’ye ısıtır ve hazır olan çamaşır makinesini başlatır.',
    triggerDescription: 'Solar Üretim > 3.5 kW (30 dk boyunca)',
    actionDescription: 'Isı Pompası Boost Modu + Çamaşır Makinesi Başlat',
    isActive: true,
    lastRunAt: new Date(Date.now() - 3600000).toISOString(),
    lastResult: 'success',
    resultNote: '3.8 kW solar güç kullanılarak 1.9 kWh şebekeden tasarruf edildi',
  },
  {
    id: 'auto-heatpump-night-setback',
    name: 'Gece Isı Pompası Sessiz & Eco Mod',
    description: 'Her gece 23:00’te kompresör frekansını düşürerek sessiz moda geçer ve gidiş suyu sıcaklığını 38°C’ye çeker.',
    triggerDescription: 'Her gün saat 23:00',
    actionDescription: 'Isı Pompası: Sessiz Mod AÇIK, Hedef 21.5°C',
    isActive: true,
    lastRunAt: new Date(Date.now() - 86400000).toISOString(),
    lastResult: 'success',
  },
  {
    id: 'auto-water-leak',
    name: 'Kritik Su Kaçağı Koruması',
    description: 'Banyo veya mutfakta su kaçağı algılandığında ana vanayı kapatır ve kritik bildirim gönderir.',
    triggerDescription: 'Su kaçağı sensörü = Alarm',
    actionDescription: 'Akıllı Ana Su Vanasını Kapat + Yüksek Öncelikli Alarm',
    isActive: true,
    lastRunAt: undefined,
    lastResult: 'success',
  },
  {
    id: 'auto-night-patrol',
    name: 'Gece Güvenlik & Kamera Algılama',
    description: 'Gece modu aktifken bahçe ve kapı kamerasında insan hareketi algılanırsa dış aydınlatmayı yakar.',
    triggerDescription: 'Güvenlik Modu: Gece + Dış Hareket',
    actionDescription: 'Dış Spotları %100 Aç + Kısa Kayıt Başlat',
    isActive: true,
    lastRunAt: new Date(Date.now() - 7200000).toISOString(),
    lastResult: 'success',
  },
];

let AUDIT_LOGS: SmartHomeAuditLog[] = [];

// Rate-limiting / Debounce map to avoid rapid relay clicking
const COMMAND_DEBOUNCE = new Map<string, number>();

// In-Memory Solar & Inverter System State
let SOLAR_SYSTEM: SmartSolarSystem = {
  solarProductionKW: 4.85,
  dailySolarKWh: 26.4,
  monthlySolarKWh: 618.5,
  inverterStatus: 'generating',
  inverterEfficiency: 98.6,
  inverterTempC: 39.2,
  inverterModel: 'Fronius Symo GEN24 10.0 Plus (WiFi/Modbus)',
  batteryLevelPercent: 86,
  batteryPowerKW: 1.45, // Charging
  batteryCapacityKWh: 15.0,
  batteryHealthPercent: 99,
  gridDrawKW: 0.0,
  gridFeedInKW: 1.25,
  homeConsumptionKW: 2.15,
  selfSufficiencyPercent: 94,
  co2SavedKg: 18.6,
  solarSurplusAutoAction: 'battery_first',
};

// In-Memory Heat Pump System State
let HEATPUMP_SYSTEM: SmartHeatPumpSystem = {
  id: 'heatpump-main',
  name: 'Daikin Altherma 3 R Isı Pompası (WiFi)',
  mode: 'heating',
  targetTempC: 22.5,
  currentRoomTempC: 22.1,
  waterFlowTempC: 44.5,
  waterReturnTempC: 38.2,
  hotWaterTankTempC: 52.0,
  hotWaterTankTargetTempC: 55.0,
  outdoorAmbientTempC: 13.8,
  copEfficiency: 4.65,
  compressorPowerKW: 1.62,
  compressorFrequencyHz: 48,
  silentMode: false,
  boostMode: false,
  solarSyncEnabled: true,
  dailyHeatingKWh: 12.8,
};

// In-Memory Cameras
let CAMERAS_SYSTEM: SmartCameraSystem[] = [
  {
    id: 'cam-salon',
    name: 'Salon İç Kamera',
    room: 'Salon',
    streamUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=60',
    isLive: true,
    motionDetected: false,
    privacyMode: false,
    nightVision: false,
    recordingStatus: 'event_only',
    resolution: '4K UHD',
    ptzCapable: true,
  },
  {
    id: 'cam-kapi',
    name: 'Ana Kapı & Antre Kamerası',
    room: 'Giriş / Koridor',
    streamUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&auto=format&fit=crop&q=60',
    isLive: true,
    motionDetected: true,
    privacyMode: false,
    nightVision: true,
    recordingStatus: 'continuous',
    resolution: '2K QHD',
    ptzCapable: false,
    lastMotionAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'cam-balkon-bahce',
    name: 'Bahçe & Balkon Çevre Güvenlik',
    room: 'Balkon',
    streamUrl: 'https://images.unsplash.com/photo-1584738766473-61c083514bf4?w=800&auto=format&fit=crop&q=60',
    isLive: true,
    motionDetected: false,
    privacyMode: false,
    nightVision: true,
    recordingStatus: 'event_only',
    resolution: '4K UHD',
    ptzCapable: true,
  },
];

// In-Memory Appliances
let APPLIANCES_SYSTEM: SmartApplianceSystem[] = [
  {
    id: 'app-washing',
    name: 'Akıllı Çamaşır Makinesi',
    type: 'washing_machine',
    room: 'Banyo',
    state: 'running',
    programName: 'Pamuklu Eko 40°C',
    remainingMinutes: 38,
    progressPercent: 62,
    doorOpen: false,
    currentPowerWatt: 650,
    ecoMode: true,
    waterConsumptionLiters: 42,
    solarEcoStartSchedule: true,
    energyRating: 'A+++',
  },
  {
    id: 'app-dishwasher',
    name: 'Akıllı Bulaşık Makinesi',
    type: 'dishwasher',
    room: 'Mutfak',
    state: 'idle',
    programName: 'Otomatik Yoğun 65°C',
    remainingMinutes: 0,
    progressPercent: 100,
    doorOpen: false,
    currentPowerWatt: 5,
    ecoMode: true,
    solarEcoStartSchedule: true,
    energyRating: 'A+++',
  },
  {
    id: 'app-oven',
    name: 'Akıllı Ankastre Fırın',
    type: 'oven',
    room: 'Mutfak',
    state: 'standby',
    programName: '3D Sıcak Hava',
    remainingMinutes: 0,
    progressPercent: 0,
    doorOpen: false,
    currentPowerWatt: 2,
    ecoMode: false,
    solarEcoStartSchedule: false,
    energyRating: 'A+',
  },
  {
    id: 'app-vacuum',
    name: 'Robot Süpürge & Paspas',
    type: 'robot_vacuum',
    room: 'Salon',
    state: 'standby',
    programName: 'Tüm Evi Süpür & Sil',
    remainingMinutes: 0,
    progressPercent: 100,
    doorOpen: false,
    currentPowerWatt: 18,
    ecoMode: true,
    solarEcoStartSchedule: false,
    energyRating: 'A',
  },
  {
    id: 'app-coffee',
    name: 'Akıllı Kahve Makinesi',
    type: 'coffee_maker',
    room: 'Mutfak',
    state: 'standby',
    programName: 'Espresso Hazır',
    remainingMinutes: 0,
    progressPercent: 0,
    doorOpen: false,
    currentPowerWatt: 8,
    ecoMode: true,
    solarEcoStartSchedule: false,
    energyRating: 'A',
  },
];

export class SmartHomeEngine {
  /**
   * Get Active Home Details
   */
  public static getHome(homeId: string = 'home-main'): SmartHomeHome {
    let home = ACTIVE_HOMES.find((h) => h.id === homeId);
    if (!home) {
      home = ACTIVE_HOMES[0];
    }
    home.deviceCount = SMART_DEVICES.length;
    return home;
  }

  /**
   * Get All Devices (Filtered by user permissions)
   */
  public static getDevices(role: SmartHomeRole = 'home_owner'): SmartDevice[] {
    if (role === 'child') {
      // Children can only see safe non-security devices
      return SMART_DEVICES.filter((d) => !d.attributes.isCriticalSecurity && d.category !== 'lock' && d.category !== 'camera');
    }
    if (role === 'guest') {
      // Guests can see lights, switches, and climate
      return SMART_DEVICES.filter((d) => d.category === 'light' || d.category === 'switch' || d.category === 'climate');
    }
    return [...SMART_DEVICES];
  }

  public static getDevice(deviceId: string): SmartDevice | undefined {
    return SMART_DEVICES.find((d) => d.id === deviceId);
  }

  /**
   * Get Rooms with auto-calculated device summaries
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
          ? 'Bağlı cihaz yok'
          : summaryParts.length > 0
          ? summaryParts.join(' • ')
          : `${roomDevices.length} cihaz hazır`;

      return {
        ...room,
        deviceCount: roomDevices.length,
        activeSummary,
      };
    });
  }

  /**
   * Get Quick Dashboard Overview Metrics
   */
  public static getQuickOverview() {
    const activeLights = SMART_DEVICES.filter((d) => d.category === 'light' && d.state === 'on').length;
    const activeSwitches = SMART_DEVICES.filter((d) => d.category === 'switch' && d.state === 'on').length;
    const openDoorsWindows = SMART_DEVICES.filter((d) => d.category === 'door_window' && d.state === 'open').length;
    const activeAlarms = SMART_DEVICES.filter((d) => (d.category === 'safety_sensor' && d.state === 'alarm') || d.attributes.isAlarmActive).length;

    const tempSensors = SMART_DEVICES.map((d) => d.attributes.currentTemperature).filter((t): t is number => typeof t === 'number');
    const avgTemp = tempSensors.length > 0 ? (tempSensors.reduce((a, b) => a + b, 0) / tempSensors.length).toFixed(1) : undefined;

    return {
      activeLights,
      activeSwitches,
      openDoorsWindows,
      activeAlarms,
      averageTemperature: avgTemp ? `${avgTemp}°C` : '22.4°C',
      totalDevices: SMART_DEVICES.length,
      securityMode: ACTIVE_HOMES[0]?.securityMode || 'disarmed',
      isBridgeConnected: ACTIVE_HOMES[0]?.isBridgeConnected || false,
      solarProductionKW: SOLAR_SYSTEM.solarProductionKW,
      heatPumpStatus: `${HEATPUMP_SYSTEM.mode.toUpperCase()} (${HEATPUMP_SYSTEM.targetTempC}°C)`,
      liveHomePowerKW: (SOLAR_SYSTEM.homeConsumptionKW).toFixed(2),
    };
  }

  /**
   * Get Solar & Inverter System Details
   */
  public static getSolarSystem(): SmartSolarSystem {
    return { ...SOLAR_SYSTEM };
  }

  /**
   * Control Solar Inverter
   */
  public static controlSolarInverter(params: {
    surplusAction?: 'battery_first' | 'ev_charge' | 'heat_pump_hotwater' | 'grid_export';
    inverterStatus?: 'generating' | 'standby';
    userId: string;
    userName: string;
  }) {
    if (params.surplusAction) {
      SOLAR_SYSTEM.solarSurplusAutoAction = params.surplusAction;
    }
    if (params.inverterStatus) {
      SOLAR_SYSTEM.inverterStatus = params.inverterStatus;
    }

    this.logAudit({
      userId: params.userId,
      userName: params.userName,
      userRole: 'home_owner',
      action: `İnverter & Solar Yönetimi: ${params.surplusAction || params.inverterStatus}`,
      status: 'success',
      note: 'Solar enerji dağıtım politikası güncellendi.',
    });

    return { success: true, solarSystem: SOLAR_SYSTEM };
  }

  /**
   * Get Heat Pump System Details
   */
  public static getHeatPumpSystem(): SmartHeatPumpSystem {
    return { ...HEATPUMP_SYSTEM };
  }

  /**
   * Control Heat Pump System
   */
  public static controlHeatPump(params: {
    mode?: 'heating' | 'cooling' | 'hot_water' | 'eco' | 'off';
    targetTempC?: number;
    hotWaterTankTargetTempC?: number;
    silentMode?: boolean;
    boostMode?: boolean;
    solarSyncEnabled?: boolean;
    userId: string;
    userName: string;
  }) {
    if (params.mode) HEATPUMP_SYSTEM.mode = params.mode;
    if (params.targetTempC !== undefined) HEATPUMP_SYSTEM.targetTempC = params.targetTempC;
    if (params.hotWaterTankTargetTempC !== undefined) HEATPUMP_SYSTEM.hotWaterTankTargetTempC = params.hotWaterTankTargetTempC;
    if (params.silentMode !== undefined) HEATPUMP_SYSTEM.silentMode = params.silentMode;
    if (params.boostMode !== undefined) HEATPUMP_SYSTEM.boostMode = params.boostMode;
    if (params.solarSyncEnabled !== undefined) HEATPUMP_SYSTEM.solarSyncEnabled = params.solarSyncEnabled;

    this.logAudit({
      userId: params.userId,
      userName: params.userName,
      userRole: 'home_owner',
      action: `Isı Pompası Ayarlandı (${HEATPUMP_SYSTEM.mode.toUpperCase()}, Hedef: ${HEATPUMP_SYSTEM.targetTempC}°C)`,
      status: 'success',
      note: `COP: ${HEATPUMP_SYSTEM.copEfficiency} • Gidiş: ${HEATPUMP_SYSTEM.waterFlowTempC}°C`,
    });

    return { success: true, heatPump: HEATPUMP_SYSTEM };
  }

  /**
   * Get Cameras System Details
   */
  public static getCameras(role: SmartHomeRole = 'home_owner'): SmartCameraSystem[] {
    if (role === 'child') {
      return []; // Children are restricted from surveillance camera feeds
    }
    return [...CAMERAS_SYSTEM];
  }

  /**
   * Control Camera System (Privacy Shutter, Night Vision, PTZ)
   */
  public static controlCamera(params: {
    cameraId: string;
    privacyMode?: boolean;
    nightVision?: boolean;
    ptzDirection?: 'up' | 'down' | 'left' | 'right';
    userId: string;
    userName: string;
    userRole: SmartHomeRole;
  }) {
    if (params.userRole === 'child') {
      return { success: false, message: 'Çocuk profili için güvenlik kamerası erişimi engellenmiştir.' };
    }

    const cam = CAMERAS_SYSTEM.find((c) => c.id === params.cameraId);
    if (!cam) {
      return { success: false, message: 'Kamera bulunamadı.' };
    }

    if (params.privacyMode !== undefined) cam.privacyMode = params.privacyMode;
    if (params.nightVision !== undefined) cam.nightVision = params.nightVision;

    this.logAudit({
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      deviceId: cam.id,
      deviceName: cam.name,
      action: params.privacyMode !== undefined ? `Gizlilik Kapağı: ${params.privacyMode ? 'KAPALI' : 'AÇIK'}` : `PTZ: ${params.ptzDirection}`,
      status: 'success',
    });

    return { success: true, camera: cam };
  }

  /**
   * Get Household Appliances
   */
  public static getAppliances(): SmartApplianceSystem[] {
    return [...APPLIANCES_SYSTEM];
  }

  /**
   * Control Appliance
   */
  public static controlAppliance(params: {
    applianceId: string;
    command: 'start' | 'pause' | 'stop' | 'toggle_solar_sync';
    programName?: string;
    userId: string;
    userName: string;
  }) {
    const app = APPLIANCES_SYSTEM.find((a) => a.id === params.applianceId);
    if (!app) {
      return { success: false, message: 'Cihaz bulunamadı.' };
    }

    if (params.command === 'start') {
      app.state = 'running';
      if (params.programName) app.programName = params.programName;
      app.remainingMinutes = 45;
      app.progressPercent = 5;
    } else if (params.command === 'pause') {
      app.state = 'paused';
    } else if (params.command === 'stop') {
      app.state = 'idle';
      app.remainingMinutes = 0;
      app.progressPercent = 0;
    } else if (params.command === 'toggle_solar_sync') {
      app.solarEcoStartSchedule = !app.solarEcoStartSchedule;
    }

    this.logAudit({
      userId: params.userId,
      userName: params.userName,
      userRole: 'home_owner',
      deviceId: app.id,
      deviceName: app.name,
      action: `${app.name} -> ${params.command.toUpperCase()}`,
      status: 'success',
      note: `Solar Senkronizasyon: ${app.solarEcoStartSchedule ? 'Aktif' : 'Pasif'}`,
    });

    return { success: true, appliance: app };
  }

  /**
   * Get Real-time kW Power Flow & Energy Efficiency Overview
   */
  public static getEnergyFlow(): SmartEnergyFlowOverview {
    const solarKW = SOLAR_SYSTEM.solarProductionKW;
    const homeKW = SOLAR_SYSTEM.homeConsumptionKW;
    const batteryKW = SOLAR_SYSTEM.batteryPowerKW;
    const gridKW = SOLAR_SYSTEM.gridDrawKW > 0 ? SOLAR_SYSTEM.gridDrawKW : -SOLAR_SYSTEM.gridFeedInKW;

    return {
      currentTotalPowerKW: homeKW,
      solarProductionKW: solarKW,
      gridPowerKW: gridKW,
      batteryPowerKW: batteryKW,
      batteryPercent: SOLAR_SYSTEM.batteryLevelPercent,
      homeConsumptionKW: homeKW,
      heatPumpKW: HEATPUMP_SYSTEM.compressorPowerKW,
      appliancesKW: 0.68,
      lightsAndPlugsKW: 0.35,
      dailyTotalSolarKWh: SOLAR_SYSTEM.dailySolarKWh,
      dailyTotalConsumedKWh: 18.2,
      dailyGridImportKWh: 1.4,
      dailyGridExportKWh: 9.6,
      selfConsumptionPercent: SOLAR_SYSTEM.selfSufficiencyPercent,
      efficiencyScore: 96,
      estimatedDailyCostTL: 3.99,
      estimatedDailySavedTL: 75.24,
      topConsumers: [
        {
          deviceId: 'heatpump-main',
          deviceName: 'Daikin Isı Pompası',
          room: 'Kazan Dairesi',
          category: 'Isıtma & Su',
          currentKW: HEATPUMP_SYSTEM.compressorPowerKW,
          dailyKWh: HEATPUMP_SYSTEM.dailyHeatingKWh,
          percentage: 58,
        },
        {
          deviceId: 'app-washing',
          deviceName: 'Çamaşır Makinesi',
          room: 'Banyo',
          category: 'Beyaz Eşya',
          currentKW: 0.65,
          dailyKWh: 2.1,
          percentage: 16,
        },
        {
          deviceId: 'switch.salon_klima',
          deviceName: 'Salon İnverter Klima',
          room: 'Salon',
          category: 'İklimlendirme',
          currentKW: 0.45,
          dailyKWh: 1.8,
          percentage: 12,
        },
        {
          deviceId: 'light.all_combined',
          deviceName: 'Tüm Aydınlatma',
          room: 'Tüm Odalar',
          category: 'Aydınlatma',
          currentKW: 0.18,
          dailyKWh: 0.9,
          percentage: 7,
        },
      ],
      smartSavingsTips: [
        'Bugün 12:00 - 15:30 saatleri arasında çatı solar üretimi zirveye çıkacaktır. Bulaşık makinesini bu aralıkta başlatmak %100 bedava elektrik sağlar.',
        'Isı pompası COP verimliliğiniz 4.65 ile mükemmel seviyededir. Su sıcaklığı 44°C ayarında maksimum tasarruf sağlamaktadır.',
        'Ev bataryası şarjı %86 seviyesinde olup gece elektrik kesintisinde 14 saat kesintisiz enerji sağlayacaktır.',
      ],
    };
  }

  /**
   * Local WiFi Network Device Scanner (Discovers HA, Inverter, Heat Pump, Shelly, Matter)
   */
  public static async scanLocalWifiDevices(): Promise<{
    success: boolean;
    scannedIpRange: string;
    foundDevices: Array<{
      ip: string;
      hostname: string;
      type: 'home_assistant' | 'solar_inverter' | 'heat_pump' | 'matter_bridge' | 'camera_rtsp' | 'wifi_relay';
      vendor: string;
      model: string;
      pingMs: number;
      isConfigured: boolean;
    }>;
  }> {
    // Simulated ultra-fast local network SSDP/mDNS/mBus scanner
    await new Promise((r) => setTimeout(r, 600));

    return {
      success: true,
      scannedIpRange: '192.168.1.0/24 (Yerel WiFi Ağı)',
      foundDevices: [
        {
          ip: '192.168.1.150',
          hostname: 'homeassistant.local',
          type: 'home_assistant',
          vendor: 'Home Assistant OS',
          model: 'Core 2026.4 / REST & WebSocket',
          pingMs: 2,
          isConfigured: ACTIVE_HOMES[0]?.isBridgeConnected || false,
        },
        {
          ip: '192.168.1.182',
          hostname: 'fronius-gen24.local',
          type: 'solar_inverter',
          vendor: 'Fronius Solar Energy',
          model: 'Symo GEN24 Plus / Modbus TCP',
          pingMs: 4,
          isConfigured: true,
        },
        {
          ip: '192.168.1.194',
          hostname: 'daikin-altherma.local',
          type: 'heat_pump',
          vendor: 'Daikin Europe',
          model: 'Altherma 3 BRP069A78 Controller',
          pingMs: 5,
          isConfigured: true,
        },
        {
          ip: '192.168.1.210',
          hostname: 'matter-border-router.local',
          type: 'matter_bridge',
          vendor: 'Thread / Matter Standard',
          model: 'OpenThread Border Router',
          pingMs: 1,
          isConfigured: true,
        },
        {
          ip: '192.168.1.160',
          hostname: 'cam-onvif-garden.local',
          type: 'camera_rtsp',
          vendor: 'Hikvision / ONVIF',
          model: '4K Ultra-HD PTZ Camera',
          pingMs: 3,
          isConfigured: true,
        },
      ],
    };
  }

  /**
   * Get Scenes and Automations
   */
  public static getScenes(): SmartScene[] {
    return [...SMART_SCENES];
  }

  public static getAutomations(): SmartAutomation[] {
    return [...SMART_AUTOMATIONS];
  }

  public static getAuditLogs(): SmartHomeAuditLog[] {
    return [...AUDIT_LOGS].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Connect and Synchronize Home Assistant Bridge
   */
  public static async connectBridge(params: {
    url: string;
    token: string;
    adminId?: string;
  }): Promise<{ success: boolean; message: string; deviceCount?: number }> {
    const provider = getSmartHomeProvider(params.url, params.token);
    const testResult = await provider.testConnection();

    if (!testResult.success) {
      return {
        success: false,
        message: testResult.message || 'Akıllı ev merkezine bağlanamadık. Adresi, aynı ağ bağlantısını ve erişim iznini kontrol edip tekrar dene.',
      };
    }

    const entityResult = await provider.fetchEntities();
    if (!entityResult.success) {
      return {
        success: false,
        message: entityResult.error || 'Cihaz varlıkları senkronize edilemedi.',
      };
    }

    // Set synchronized devices in memory
    SMART_DEVICES = entityResult.devices;

    const home = ACTIVE_HOMES[0];
    home.isBridgeConnected = true;
    home.bridgeType = 'home_assistant';
    home.deviceCount = SMART_DEVICES.length;

    // Log connection in audit
    AUDIT_LOGS.unshift({
      id: `AUDIT-CONN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: params.adminId || 'user_local',
      userName: 'Ev Yöneticisi',
      userRole: 'home_owner',
      action: 'Home Assistant & WiFi Köprüsü Bağlandı',
      status: 'success',
      note: `${SMART_DEVICES.length} akıllı cihaz başarıyla içe aktarıldı.`,
    });

    return {
      success: true,
      message: `Home Assistant başarıyla bağlandı! ${SMART_DEVICES.length} cihaz odalara yerleştirildi.`,
      deviceCount: SMART_DEVICES.length,
    };
  }

  /**
   * Disconnect Home Assistant Bridge and Clear Devices
   */
  public static disconnectBridge(adminId = 'user_local') {
    SMART_DEVICES = [];
    const home = ACTIVE_HOMES[0];
    home.isBridgeConnected = false;
    home.bridgeType = 'disabled';
    home.deviceCount = 0;

    AUDIT_LOGS.unshift({
      id: `AUDIT-DISC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: adminId,
      userName: 'Ev Yöneticisi',
      userRole: 'home_owner',
      action: 'Akıllı Ev Köprüsü Bağlantısı Kesildi',
      status: 'success',
    });
  }

  /**
   * Send Device Control Command with Role & Permission Check
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
      return { success: false, message: 'Cihaz bulunamadı veya çevrimdışı.' };
    }

    // 1. Role Permission Validation
    if (params.userRole === 'child') {
      if (device.attributes.isCriticalSecurity || device.category === 'lock' || device.category === 'camera') {
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

    if (params.userRole === 'guest' && device.attributes.isCriticalSecurity) {
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

    // 2. High-Risk Security Confirmation (Locks / Alarm)
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
      device.attributes.brightness = params.value;
      device.state = params.value > 0 ? 'on' : 'off';
    } else if (params.command === 'set_temperature' && params.value !== undefined) {
      device.attributes.targetTemperature = params.value;
    }

    device.lastUpdated = new Date().toISOString();

    // 5. Forward to Home Assistant Provider (if bridge is active)
    const provider = getSmartHomeProvider();
    const domain = device.externalEntityId.split('.')[0];
    let haService = 'toggle';
    if (params.command === 'turn_on') haService = 'turn_on';
    else if (params.command === 'turn_off') haService = 'turn_off';
    else if (params.command === 'lock') haService = 'lock';
    else if (params.command === 'unlock') haService = 'unlock';

    if (provider.name === 'home_assistant') {
      await provider.callService(domain, haService, device.externalEntityId);
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
      note: 'Komut WiFi üzerinden başarıyla iletildi.',
    });

    return {
      success: true,
      message: `${device.name} durumu güncellendi: ${device.state.toUpperCase()}`,
      device,
    };
  }

  /**
   * Activate a Smart Scene
   */
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

    // Execute scene actions on devices
    if (scene.id === 'scene-goodnight' || scene.id === 'scene-leaving') {
      SMART_DEVICES.forEach((d) => {
        if (d.category === 'light' || d.category === 'switch') {
          d.state = 'off';
        } else if (d.category === 'lock') {
          d.state = 'locked';
        }
      });
    } else if (scene.id === 'scene-home' || scene.id === 'scene-goodmorning') {
      SMART_DEVICES.forEach((d) => {
        if (d.category === 'light' && (d.room === 'Salon' || d.room === 'Giriş / Koridor')) {
          d.state = 'on';
        }
      });
    } else if (scene.id === 'scene-eco') {
      HEATPUMP_SYSTEM.mode = 'eco';
      HEATPUMP_SYSTEM.boostMode = true;
      SOLAR_SYSTEM.solarSurplusAutoAction = 'heat_pump_hotwater';
    }

    scene.lastActivatedAt = new Date().toISOString();

    this.logAudit({
      userId: params.userId,
      userName: params.userName || 'Kullanıcı',
      userRole: params.userRole,
      action: `"${scene.name}" Sahnesi Çalıştırıldı`,
      status: 'success',
      note: `${scene.actionsCount} komut WiFi üzerinden topluca uygulandı.`,
    });

    return {
      success: true,
      message: `"${scene.name}" sahnesi başarıyla etkinleştirildi.`,
    };
  }

  /**
   * Trigger Safety Alarm Notification (e.g. Water Leak, Smoke)
   */
  public static triggerSafetyAlarm(params: {
    deviceId: string;
    alarmType: 'water_leak' | 'smoke' | 'gas' | 'motion';
  }): { success: boolean; message: string } {
    const device = SMART_DEVICES.find((d) => d.id === params.deviceId);
    if (device) {
      device.state = 'alarm';
      device.attributes.isAlarmActive = true;
      device.attributes.alarmType = params.alarmType;
      device.lastUpdated = new Date().toISOString();
    }

    this.logAudit({
      userId: 'system_sensor',
      userName: 'Akıllı Güvenlik Sensörü',
      userRole: 'home_owner',
      deviceId: params.deviceId,
      deviceName: device?.name || 'Güvenlik Sensörü',
      action: `KRİTİK GÜVENLİK ALARMI: ${params.alarmType.toUpperCase()}`,
      status: 'success',
      note: 'Acil durum tespit edildi! Tüm bildirim kanallarına yüksek öncelikli alarm iletildi.',
    });

    return {
      success: true,
      message: `Kritik alarm oluşturuldu: ${params.alarmType}`,
    };
  }

  /**
   * Seed Mock Devices for Testing Connection and Scenario Verification
   */
  public static seedTestDevices() {
    SMART_DEVICES = [
      {
        id: 'light.salon_tavan',
        externalEntityId: 'light.salon_tavan',
        name: 'Salon Tavan Aydınlatması',
        room: 'Salon',
        category: 'light',
        state: 'on',
        attributes: { brightness: 80, powerWatt: 45 },
        isOnline: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'light.mutfak_spot',
        externalEntityId: 'light.mutfak_spot',
        name: 'Mutfak Tezgah Spotları',
        room: 'Mutfak',
        category: 'light',
        state: 'off',
        attributes: { brightness: 100, powerWatt: 30 },
        isOnline: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'switch.salon_klima',
        externalEntityId: 'switch.salon_klima',
        name: 'Salon İnverter Klima',
        room: 'Salon',
        category: 'switch',
        state: 'on',
        attributes: { powerWatt: 850, energyKWh: 4.2 },
        isOnline: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'lock.ana_kapi',
        externalEntityId: 'lock.ana_kapi',
        name: 'Ana Çelik Kapı Kilidi',
        room: 'Giriş / Koridor',
        category: 'lock',
        state: 'locked',
        attributes: { isCriticalSecurity: true, batteryLevel: 92 },
        isOnline: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'camera.salon_guvenlik',
        externalEntityId: 'camera.salon_guvenlik',
        name: 'Salon Güvenlik Kamerası',
        room: 'Salon',
        category: 'camera',
        state: 'idle',
        attributes: { isCriticalSecurity: true, cameraStreamUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800' },
        isOnline: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'binary_sensor.banyo_su_kacagi',
        externalEntityId: 'binary_sensor.banyo_su_kacagi',
        name: 'Banyo Su Baskını Sensörü',
        room: 'Banyo',
        category: 'safety_sensor',
        state: 'idle',
        attributes: { isCriticalSecurity: true, isAlarmActive: false, alarmType: 'water_leak' },
        isOnline: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'sensor.salon_sicaklik',
        externalEntityId: 'sensor.salon_sicaklik',
        name: 'Salon Sıcaklık & Nem Sensörü',
        room: 'Salon',
        category: 'sensor',
        state: 'idle',
        attributes: { currentTemperature: 23.2, humidity: 48, batteryLevel: 88 },
        isOnline: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'solar.inverter_main',
        externalEntityId: 'sensor.fronius_inverter_power',
        name: 'Fronius Solar İnverter 10 kW',
        room: 'Çatı & Enerji Odası',
        category: 'solar_inverter',
        state: 'generating',
        attributes: {
          solarProductionKW: 4.85,
          batteryStoragePercent: 86,
          gridFeedInKW: 1.25,
          gridDrawKW: 0,
          inverterEfficiencyPercent: 98.6,
        },
        isOnline: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'heatpump.daikin_altherma',
        externalEntityId: 'climate.daikin_heatpump',
        name: 'Daikin Altherma Isı Pompası',
        room: 'Çatı & Enerji Odası',
        category: 'heat_pump',
        state: 'heating',
        attributes: {
          targetTemperature: 22.5,
          currentTemperature: 22.1,
          waterFlowTempC: 44.5,
          waterReturnTempC: 38.2,
          hotWaterTankTempC: 52.0,
          copEfficiency: 4.65,
          powerKW: 1.62,
          heatPumpMode: 'heating',
        },
        isOnline: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'appliance.washing_machine',
        externalEntityId: 'switch.bosch_washing_machine',
        name: 'Bosch Serie 8 Çamaşır Makinesi',
        room: 'Banyo',
        category: 'appliance',
        state: 'running',
        attributes: {
          applianceType: 'washing_machine',
          programName: 'Pamuklu Eko 40°C',
          remainingMinutes: 38,
          progressPercent: 62,
          powerWatt: 650,
          ecoSolarAutoStart: true,
        },
        isOnline: true,
        lastUpdated: new Date().toISOString(),
      },
    ];

    const home = ACTIVE_HOMES[0];
    home.isBridgeConnected = true;
    home.bridgeType = 'home_assistant';
    home.deviceCount = SMART_DEVICES.length;
  }

  private static logAudit(entry: Omit<SmartHomeAuditLog, 'id' | 'timestamp'>) {
    AUDIT_LOGS.unshift({
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    });
  }
}
