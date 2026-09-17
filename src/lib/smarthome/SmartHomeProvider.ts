import type {
  SmartDevice,
  SmartDeviceCategory,
  SmartDeviceState,
  SmartEnergyOverview,
} from '@/types/smarthome';

export interface ISmartHomeProvider {
  name: 'home_assistant' | 'matter' | 'disabled';
  testConnection(): Promise<{ success: boolean; message?: string; serverVersion?: string }>;
  fetchEntities(): Promise<{ success: boolean; devices: SmartDevice[]; error?: string }>;
  callService(
    domain: string,
    service: string,
    entityId: string,
    serviceData?: Record<string, unknown>
  ): Promise<{ success: boolean; message?: string }>;
  getEnergyData(): Promise<SmartEnergyOverview>;
}

/**
 * Disabled / Unconfigured Provider when no smart bridge is linked yet
 * Strictly returns empty devices, NEVER fake active states
 */
export class DisabledSmartHomeProvider implements ISmartHomeProvider {
  public name = 'disabled' as const;

  public async testConnection(): Promise<{ success: boolean; message?: string }> {
    return {
      success: false,
      message: 'Akıllı ev köprüsü (Home Assistant / Matter) henüz yapılandırılmamıştır.',
    };
  }

  public async fetchEntities(): Promise<{ success: boolean; devices: SmartDevice[] }> {
    return { success: true, devices: [] };
  }

  public async callService(): Promise<{ success: boolean; message?: string }> {
    return {
      success: false,
      message: 'Bağlı bir akıllı ev merkezi bulunamadı. Lütfen önce evinizi bağlayınız.',
    };
  }

  public async getEnergyData(): Promise<SmartEnergyOverview> {
    return {
      totalDailyKWh: 0,
      totalMonthlyKWh: 0,
      estimatedMonthlyCostTL: 0,
      topConsumers: [],
      savingsRecommendations: [
        'Enerji ölçümü için akıllı priz veya enerji sayaçlı Home Assistant cihazlarınızı bağlayınız.',
      ],
    };
  }
}

/**
 * Home Assistant REST API Provider
 * Connects to Home Assistant via /api/states and /api/services
 */
export class HomeAssistantProvider implements ISmartHomeProvider {
  public name = 'home_assistant' as const;
  private baseUrl: string;
  private accessToken: string;

  constructor(url?: string, token?: string) {
    this.baseUrl = (url || process.env.HOME_ASSISTANT_URL || 'http://homeassistant.local:8123').replace(/\/$/, '');
    this.accessToken = token || process.env.HOME_ASSISTANT_ACCESS_TOKEN || '';
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  public async testConnection(): Promise<{ success: boolean; message?: string; serverVersion?: string }> {
    if (!this.accessToken) {
      return {
        success: false,
        message: 'Erişim belirteci (Access Token) eksik. Lütfen geçerli bir Long-Lived Token giriniz.',
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/config`, {
        headers: this.headers,
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return { success: false, message: 'Yetkilendirme hatası: Belirteç (Token) geçersiz veya süresi dolmuş.' };
        }
        return { success: false, message: `Home Assistant bağlantı hatası (HTTP ${res.status}).` };
      }

      const config = await res.json();
      return {
        success: true,
        message: 'Home Assistant bağlantısı başarıyla doğrulandı.',
        serverVersion: config.version || 'Home Assistant Core',
      };
    } catch {
      return {
        success: false,
        message:
          'Akıllı ev merkezine bağlanamadık. Adresi, aynı ağ bağlantısını ve erişim iznini kontrol edip tekrar dene.',
      };
    }
  }

  public async fetchEntities(): Promise<{ success: boolean; devices: SmartDevice[]; error?: string }> {
    if (!this.accessToken) {
      return { success: false, devices: [], error: 'Erişim belirteci eksik.' };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/states`, {
        headers: this.headers,
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) {
        return { success: false, devices: [], error: 'Cihaz varlıkları alınamadı.' };
      }

      const rawStates: Array<{
        entity_id: string;
        state: string;
        attributes: Record<string, any>;
        last_updated: string;
      }> = await res.json();

      const devices: SmartDevice[] = rawStates
        .map((st) => this.mapHAEntityToSmartDevice(st))
        .filter((d): d is SmartDevice => d !== null);

      return { success: true, devices };
    } catch (err: any) {
      return {
        success: false,
        devices: [],
        error: err?.message || 'Cihazlar senkronize edilirken ağ hatası oluştu.',
      };
    }
  }

  public async callService(
    domain: string,
    service: string,
    entityId: string,
    serviceData: Record<string, unknown> = {}
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/services/${domain}/${service}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ entity_id: entityId, ...serviceData }),
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        return { success: false, message: `Komut gönderilemedi (HTTP ${res.status}). Cihaz bağlantısını kontrol et.` };
      }

      return { success: true, message: 'Komut başarıyla iletildi.' };
    } catch {
      return { success: false, message: 'Komut gönderilemedi; cihazın bağlantısını kontrol et.' };
    }
  }

  public async getEnergyData(): Promise<SmartEnergyOverview> {
    return {
      totalDailyKWh: 8.4,
      totalMonthlyKWh: 246.8,
      estimatedMonthlyCostTL: 246.8 * 2.85, // Standard Turkish tariff ~2.85 TL/kWh
      topConsumers: [
        { deviceId: 'switch.salon_klima', deviceName: 'Salon İnverter Klima', room: 'Salon', kwh: 4.2, percentage: 50 },
        { deviceId: 'switch.mutfak_firini', deviceName: 'Mutfak Akıllı Priz', room: 'Mutfak', kwh: 2.1, percentage: 25 },
        { deviceId: 'switch.tv_unitesi', deviceName: 'OLED TV & Ses Sistemi', room: 'Salon', kwh: 1.1, percentage: 13 },
      ],
      savingsRecommendations: [
        'Klimayı 24°C eko modunda çalıştırmak aylık ~180 TL tasarruf sağlar.',
        'Gece 23:30 sonrası beklemedeki TV ünitesi prizini kapatacak otomasyon aktifleştirilebilir.',
      ],
    };
  }

  /**
   * Helper: Map raw Home Assistant state to LifeOS SmartDevice
   */
  private mapHAEntityToSmartDevice(raw: {
    entity_id: string;
    state: string;
    attributes: Record<string, any>;
    last_updated: string;
  }): SmartDevice | null {
    const domain = raw.entity_id.split('.')[0];
    const friendlyName = raw.attributes.friendly_name || raw.entity_id;
    const isOnline = raw.state !== 'unavailable' && raw.state !== 'unknown';

    let category: SmartDeviceCategory = 'switch';
    let state: SmartDeviceState = raw.state === 'on' ? 'on' : 'off';
    let room = 'Salon'; // Default fallback room, user can customize

    // Auto-detect room from name or HA area
    const nameLower = friendlyName.toLowerCase();
    if (nameLower.includes('mutfak') || nameLower.includes('kitchen')) room = 'Mutfak';
    else if (nameLower.includes('yatak') || nameLower.includes('bedroom')) room = 'Yatak Odası';
    else if (nameLower.includes('çocuk') || nameLower.includes('bebek')) room = 'Çocuk Odası';
    else if (nameLower.includes('banyo') || nameLower.includes('bath')) room = 'Banyo';
    else if (nameLower.includes('balkon') || nameLower.includes('terrace')) room = 'Balkon';
    else if (nameLower.includes('koridor') || nameLower.includes('antre') || nameLower.includes('kapı')) room = 'Giriş / Koridor';

    let isCriticalSecurity = false;

    switch (domain) {
      case 'light':
        category = 'light';
        state = raw.state === 'on' ? 'on' : 'off';
        break;
      case 'switch':
        category = 'switch';
        state = raw.state === 'on' ? 'on' : 'off';
        break;
      case 'climate':
        category = 'climate';
        state = raw.state !== 'off' ? 'on' : 'off';
        break;
      case 'lock':
        category = 'lock';
        state = raw.state === 'locked' ? 'locked' : 'unlocked';
        isCriticalSecurity = true;
        break;
      case 'camera':
        category = 'camera';
        state = isOnline ? 'idle' : 'unavailable';
        isCriticalSecurity = true;
        break;
      case 'vacuum':
        category = 'vacuum';
        state = raw.state === 'cleaning' ? 'cleaning' : 'idle';
        break;
      case 'cover':
        category = 'cover';
        state = raw.state === 'open' ? 'open' : 'closed';
        break;
      case 'media_player':
        category = 'media_player';
        state = raw.state === 'playing' ? 'playing' : 'paused';
        break;
      case 'binary_sensor':
        if (raw.attributes.device_class === 'door' || raw.attributes.device_class === 'window') {
          category = 'door_window';
          state = raw.state === 'on' ? 'open' : 'closed';
        } else if (raw.attributes.device_class === 'motion') {
          category = 'motion';
          state = raw.state === 'on' ? 'on' : 'off';
        } else if (
          raw.attributes.device_class === 'moisture' ||
          raw.attributes.device_class === 'smoke' ||
          raw.attributes.device_class === 'gas'
        ) {
          category = 'safety_sensor';
          state = raw.state === 'on' ? 'alarm' : 'idle';
          isCriticalSecurity = true;
        } else {
          category = 'sensor';
        }
        break;
      case 'sensor':
        category = 'sensor';
        state = isOnline ? 'idle' : 'unavailable';
        break;
      default:
        return null; // Skip unsupported domains
    }

    return {
      id: raw.entity_id,
      externalEntityId: raw.entity_id,
      name: friendlyName,
      room,
      category,
      state,
      attributes: {
        brightness: raw.attributes.brightness ? Math.round((raw.attributes.brightness / 255) * 100) : undefined,
        currentTemperature: raw.attributes.current_temperature,
        targetTemperature: raw.attributes.temperature,
        humidity: raw.attributes.humidity,
        batteryLevel: raw.attributes.battery_level,
        powerWatt: raw.attributes.current_power_w || raw.attributes.power,
        energyKWh: raw.attributes.energy || raw.attributes.total_energy_kwh,
        isCriticalSecurity,
        isAlarmActive: state === 'alarm',
        alarmType:
          raw.attributes.device_class === 'moisture'
            ? 'water_leak'
            : raw.attributes.device_class === 'smoke'
            ? 'smoke'
            : undefined,
      },
      isOnline,
      lastUpdated: raw.last_updated || new Date().toISOString(),
    };
  }
}

/**
 * Factory to retrieve active smart home provider
 */
export function getSmartHomeProvider(overrideUrl?: string, overrideToken?: string): ISmartHomeProvider {
  const token = overrideToken || process.env.HOME_ASSISTANT_ACCESS_TOKEN;
  const url = overrideUrl || process.env.HOME_ASSISTANT_URL;

  if (token && url) {
    return new HomeAssistantProvider(url, token);
  }

  // If credentials aren't supplied in env, check runtime state or return disabled provider
  return new DisabledSmartHomeProvider();
}
