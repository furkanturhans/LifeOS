export type SmartDeviceCategory =
  | 'light'
  | 'switch'
  | 'climate'
  | 'heat_pump'
  | 'solar_inverter'
  | 'battery_storage'
  | 'appliance'
  | 'sensor'
  | 'door_window'
  | 'motion'
  | 'lock'
  | 'camera'
  | 'vacuum'
  | 'cover'
  | 'media_player'
  | 'safety_sensor'
  | 'energy_meter';

export type SmartDeviceState =
  | 'on'
  | 'off'
  | 'locked'
  | 'unlocked'
  | 'open'
  | 'closed'
  | 'alarm'
  | 'idle'
  | 'cleaning'
  | 'running'
  | 'paused'
  | 'playing'
  | 'generating'
  | 'heating'
  | 'cooling'
  | 'standby'
  | 'unavailable';

export type SmartHomeRole =
  | 'home_owner'
  | 'admin'
  | 'family_member'
  | 'guest'
  | 'child';

export type SecurityMode = 'disarmed' | 'armed_home' | 'armed_away' | 'alarm_triggered';

export interface SmartDevice {
  id: string; // e.g., 'light.salon_tavan', 'inverter.solar_main', 'heatpump.home'
  externalEntityId: string; // Home Assistant entity_id
  name: string;
  room: string; // e.g., 'Salon', 'Mutfak', 'Çatı & Enerji Odası', 'Kazan Dairesi'
  category: SmartDeviceCategory;
  state: SmartDeviceState;
  attributes: {
    brightness?: number; // 0-100%
    colorTemp?: number;
    targetTemperature?: number;
    currentTemperature?: number;
    humidity?: number;
    batteryLevel?: number;
    powerWatt?: number; // Live power draw in Watts
    powerKW?: number; // Live power in kW
    energyKWh?: number; // Cumulative kWh
    isCriticalSecurity?: boolean; // Requires PIN / Owner permission
    cameraStreamUrl?: string;
    isAlarmActive?: boolean;
    alarmType?: 'water_leak' | 'smoke' | 'gas' | 'motion' | 'door_breach';
    speedLevel?: number;
    volumeLevel?: number;
    // Solar & Inverter specific attributes
    solarProductionKW?: number;
    batteryStoragePercent?: number;
    gridFeedInKW?: number;
    gridDrawKW?: number;
    inverterEfficiencyPercent?: number;
    // Heat pump specific attributes
    waterFlowTempC?: number;
    waterReturnTempC?: number;
    hotWaterTankTempC?: number;
    copEfficiency?: number;
    compressorLoadPercent?: number;
    heatPumpMode?: 'heating' | 'cooling' | 'hot_water' | 'eco';
    // Appliance specific attributes
    applianceType?: 'washing_machine' | 'dishwasher' | 'oven' | 'dryer' | 'robot_vacuum' | 'refrigerator' | 'coffee_maker';
    programName?: string;
    remainingMinutes?: number;
    progressPercent?: number;
    doorOpen?: boolean;
    ecoSolarAutoStart?: boolean;
  };
  isOnline: boolean;
  lastUpdated: string; // ISO
}

export interface SmartRoom {
  id: string;
  name: string;
  icon: string;
  deviceCount: number;
  activeSummary: string; // e.g., '2 ışık açık • 22.4°C'
}

export interface SmartHomeHome {
  id: string;
  name: string; // 'Ev', 'Yazlık', 'Ofis'
  address?: string;
  isBridgeConnected: boolean;
  bridgeType: 'home_assistant' | 'matter_hub' | 'disabled';
  bridgeUrl?: string; // Server side only, masked for client
  securityMode: SecurityMode;
  roomCount: number;
  deviceCount: number;
}

export interface SmartScene {
  id: string;
  name: string;
  icon: string;
  description: string;
  actionsCount: number;
  lastActivatedAt?: string;
}

export interface SmartAutomation {
  id: string;
  name: string;
  description: string;
  triggerDescription: string;
  actionDescription: string;
  isActive: boolean;
  lastRunAt?: string;
  lastResult?: 'success' | 'failed';
  resultNote?: string;
}

export interface SmartHomeAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: SmartHomeRole;
  deviceId?: string;
  deviceName?: string;
  action: string;
  status: 'success' | 'rejected' | 'failed';
  note?: string;
  requiresPin?: boolean;
}

// Inverter & Solar System detailed model
export interface SmartSolarSystem {
  solarProductionKW: number;
  dailySolarKWh: number;
  monthlySolarKWh: number;
  inverterStatus: 'generating' | 'standby' | 'fault' | 'grid_sync';
  inverterEfficiency: number; // e.g. 98.4%
  inverterTempC: number;
  inverterModel: string;
  batteryLevelPercent: number;
  batteryPowerKW: number; // Positive = Charging, Negative = Discharging
  batteryCapacityKWh: number;
  batteryHealthPercent: number;
  gridDrawKW: number;
  gridFeedInKW: number;
  homeConsumptionKW: number;
  selfSufficiencyPercent: number; // e.g. 91%
  co2SavedKg: number;
  solarSurplusAutoAction: 'battery_first' | 'ev_charge' | 'heat_pump_hotwater' | 'grid_export';
}

// Heat Pump system detailed model
export interface SmartHeatPumpSystem {
  id: string;
  name: string;
  mode: 'heating' | 'cooling' | 'hot_water' | 'eco' | 'off';
  targetTempC: number;
  currentRoomTempC: number;
  waterFlowTempC: number;
  waterReturnTempC: number;
  hotWaterTankTempC: number;
  hotWaterTankTargetTempC: number;
  outdoorAmbientTempC: number;
  copEfficiency: number; // e.g. 4.7
  compressorPowerKW: number; // e.g. 1.85 kW
  compressorFrequencyHz: number;
  silentMode: boolean;
  boostMode: boolean;
  solarSyncEnabled: boolean; // Overheat water tank during peak solar hours
  dailyHeatingKWh: number;
}

// Smart Camera detailed model
export interface SmartCameraSystem {
  id: string;
  name: string;
  room: string;
  streamUrl: string;
  rtspUrl?: string;
  isLive: boolean;
  motionDetected: boolean;
  privacyMode: boolean;
  nightVision: boolean;
  recordingStatus: 'continuous' | 'event_only' | 'off';
  resolution: string;
  ptzCapable: boolean;
  batteryPercent?: number;
  lastMotionAt?: string;
}

// Smart Household Appliance model
export interface SmartApplianceSystem {
  id: string;
  name: string;
  type: 'washing_machine' | 'dishwasher' | 'oven' | 'dryer' | 'robot_vacuum' | 'refrigerator' | 'coffee_maker';
  room: string;
  state: 'running' | 'idle' | 'paused' | 'delayed_start' | 'completed' | 'cleaning' | 'standby';
  programName: string;
  remainingMinutes: number;
  progressPercent: number;
  doorOpen: boolean;
  currentPowerWatt: number;
  ecoMode: boolean;
  waterConsumptionLiters?: number;
  solarEcoStartSchedule: boolean; // Automatically start when solar power exceeds 2.5 kW
  energyRating: string; // 'A+++', 'A'
}

// Real-time kW Power & Energy Flow Overview
export interface SmartEnergyFlowOverview {
  currentTotalPowerKW: number;
  solarProductionKW: number;
  gridPowerKW: number; // Positive = Draw from grid, Negative = Feed to grid
  batteryPowerKW: number; // Positive = Charging, Negative = Discharging
  batteryPercent: number;
  homeConsumptionKW: number;
  heatPumpKW: number;
  appliancesKW: number;
  lightsAndPlugsKW: number;
  dailyTotalSolarKWh: number;
  dailyTotalConsumedKWh: number;
  dailyGridImportKWh: number;
  dailyGridExportKWh: number;
  selfConsumptionPercent: number;
  efficiencyScore: number; // 0 - 100
  estimatedDailyCostTL: number;
  estimatedDailySavedTL: number;
  topConsumers: Array<{
    deviceId: string;
    deviceName: string;
    room: string;
    category: string;
    currentKW: number;
    dailyKWh: number;
    percentage: number;
  }>;
  smartSavingsTips: string[];
}

export interface SmartEnergyOverview {
  totalDailyKWh: number;
  totalMonthlyKWh: number;
  estimatedMonthlyCostTL: number;
  topConsumers: Array<{
    deviceId: string;
    deviceName: string;
    room: string;
    kwh: number;
    percentage: number;
  }>;
  savingsRecommendations: string[];
}
