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

export type SmartDeviceSource = 'matter' | 'home_assistant' | 'vendor_oauth';

export type SmartHomeRole =
  | 'home_owner'
  | 'admin'
  | 'family_member'
  | 'guest'
  | 'child';

export type SecurityMode = 'disarmed' | 'armed_home' | 'armed_away' | 'alarm_triggered';

export interface SmartDeviceCapabilities {
  canDim?: boolean;
  hasColor?: boolean;
  hasEnergyMonitoring?: boolean;
  hasPowerMeasurement?: boolean;
  hasTemperature?: boolean;
  hasHumidity?: boolean;
  hasBattery?: boolean;
  isCriticalSecurity?: boolean;
  isLock?: boolean;
  isCamera?: boolean;
  canPTZ?: boolean;
  isHeatPump?: boolean;
  isSolarInverter?: boolean;
  isAppliance?: boolean;
  supportedModes?: string[];
}

export interface CandidateSmartDevice {
  providerDeviceId: string;
  source: SmartDeviceSource;
  vendorName?: string;
  name: string;
  suggestedRoom?: string;
  category: SmartDeviceCategory;
  state: SmartDeviceState;
  capabilities: SmartDeviceCapabilities;
  attributes: Record<string, any>;
  isOnline: boolean;
}

export interface SmartDevice {
  id: string; // Internal LifeOS unique ID
  providerDeviceId: string; // ID from Matter/HA/Vendor
  source: SmartDeviceSource;
  vendorName?: string;
  name: string;
  room?: string; // Optional user-assigned room
  roomId?: string;
  category: SmartDeviceCategory;
  state: SmartDeviceState;
  capabilities: SmartDeviceCapabilities;
  attributes: {
    brightness?: number; // 0-100%
    colorTemp?: number;
    targetTemperature?: number;
    currentTemperature?: number;
    humidity?: number;
    batteryLevel?: number;
    powerWatt?: number; // Live power draw in Watts (only if hasPowerMeasurement)
    powerKW?: number;
    energyKWh?: number; // Cumulative kWh (only if hasEnergyMonitoring)
    isCriticalSecurity?: boolean; // Requires PIN / Owner permission
    cameraStreamUrl?: string;
    isAlarmActive?: boolean;
    alarmType?: 'water_leak' | 'smoke' | 'gas' | 'motion' | 'door_breach';
    speedLevel?: number;
    volumeLevel?: number;
    // Solar & Inverter specific attributes (only if isSolarInverter)
    solarProductionKW?: number;
    batteryStoragePercent?: number;
    gridFeedInKW?: number;
    gridDrawKW?: number;
    inverterEfficiencyPercent?: number;
    // Heat pump specific attributes (only if isHeatPump)
    waterFlowTempC?: number;
    waterReturnTempC?: number;
    hotWaterTankTempC?: number;
    copEfficiency?: number;
    compressorLoadPercent?: number;
    heatPumpMode?: 'heating' | 'cooling' | 'hot_water' | 'eco';
    // Appliance specific attributes (only if isAppliance)
    applianceType?: 'washing_machine' | 'dishwasher' | 'oven' | 'dryer' | 'robot_vacuum' | 'refrigerator' | 'coffee_maker';
    programName?: string;
    remainingMinutes?: number;
    progressPercent?: number;
    doorOpen?: boolean;
    ecoSolarAutoStart?: boolean;
  };
  isOnline: boolean;
  dateAdded: string; // ISO
  lastSyncedAt: string; // ISO
}

export interface SmartRoom {
  id: string;
  name: string;
  icon?: string;
  deviceCount: number;
  activeSummary?: string;
}

export interface SmartHomeHome {
  id: string;
  name: string;
  address?: string;
  isBridgeConnected: boolean;
  bridgeType: 'home_assistant' | 'matter_hub' | 'vendor_oauth' | 'disabled';
  bridgeUrl?: string;
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

// Matter Commissioning Payload
export interface MatterCommissionRequest {
  setupCode: string; // QR payload or 11/21 digit manual pairing code
  deviceName: string;
  roomName?: string;
  discriminator?: number;
}

// Vendor Account OAuth Definition
export interface SupportedVendorAccount {
  id: string;
  name: string;
  brandIcon: string;
  description: string;
  isSupported: boolean;
  authType: 'oauth2' | 'token' | 'unsupported';
  oauthUrl?: string;
  statusNotice?: string;
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
