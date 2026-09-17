import crypto from 'crypto';
import type { BigBlueButtonJoinResult, LiveClassHealthResult } from '@/types/education';

/**
 * BigBlueButton Server-side Live Class Provider
 *
 * Security Principles:
 * - Reads BBB_BASE_URL, BBB_SECRET, and LIVE_CLASS_PROVIDER only on the server layer (process.env).
 * - Never transmits BBB_SECRET to the client, browser, logs, or error responses.
 * - Idempotently maps LifeOS session IDs to BigBlueButton meeting IDs.
 * - Enforces max 70 participant cap and role-based passwords.
 */
export class BigBlueButtonProvider {
  private getBaseUrl(): string | undefined {
    return process.env.BBB_BASE_URL?.trim();
  }

  private getSecret(): string | undefined {
    return process.env.BBB_SECRET?.trim();
  }

  private getProviderName(): string {
    return process.env.LIVE_CLASS_PROVIDER || 'bigbluebutton';
  }

  /**
   * Validates if BigBlueButton credentials are present in server environment
   */
  public isConfigured(): boolean {
    const url = this.getBaseUrl();
    const secret = this.getSecret();
    return Boolean(url && secret && url.length > 0 && secret.length > 0);
  }

  /**
   * Calculates SHA-1 checksum as required by the BigBlueButton API standard:
   * checksum = SHA1(apiCall + queryParams + sharedSecret)
   */
  public generateChecksum(apiCall: string, queryParams: string, secret: string): string {
    const stringToHash = `${apiCall}${queryParams}${secret}`;
    return crypto.createHash('sha1').update(stringToHash, 'utf8').digest('hex');
  }

  /**
   * Health Check: Checks environment configuration and probes server reachability
   */
  public async healthCheck(): Promise<LiveClassHealthResult> {
    const provider = this.getProviderName();

    if (!this.isConfigured()) {
      return {
        isConfigured: false,
        provider,
        isReachable: false,
        message: 'BigBlueButton canlı sınıf sunucusu henüz yapılandırılmadı. Sunucu ortam değişkenlerinde BBB_BASE_URL ve BBB_SECRET tanımlanmalıdır.',
      };
    }

    try {
      const baseUrl = this.getBaseUrl()!.replace(/\/+$/, '');
      const secret = this.getSecret()!;

      // Lightweight API check: getMeetings or isMeetingRunning with probe ID
      const queryParams = 'meetingID=probe_healthcheck';
      const checksum = this.generateChecksum('isMeetingRunning', queryParams, secret);
      const url = `${baseUrl}/api/isMeetingRunning?${queryParams}&checksum=${checksum}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return {
          isConfigured: true,
          provider,
          isReachable: true,
          message: 'BigBlueButton sunucu bağlantısı aktif ve hazır.',
        };
      } else {
        return {
          isConfigured: true,
          provider,
          isReachable: false,
          message: `BigBlueButton sunucusu yanıt vermedi (Durum: ${response.status}).`,
        };
      }
    } catch (error: any) {
      return {
        isConfigured: true,
        provider,
        isReachable: false,
        message: error.name === 'AbortError'
          ? 'BigBlueButton sunucusuna bağlanırken zaman aşımı oluştu.'
          : 'BigBlueButton sunucusuna erişilemedi. Lütfen bağlantı adresini kontrol ediniz.',
      };
    }
  }

  /**
   * Creates a meeting on the BigBlueButton server.
   * Safe & Idempotent: If the meeting is already running, BigBlueButton returns duplicateWarning
   * which is treated as success.
   */
  public async createMeeting(params: {
    meetingId: string;
    meetingName: string;
    attendeePW?: string;
    moderatorPW?: string;
    maxParticipants?: number;
    logoutUrl?: string;
  }): Promise<{
    success: boolean;
    isConfigured: boolean;
    meetingId: string;
    attendeePW: string;
    moderatorPW: string;
    message: string;
  }> {
    const meetingId = params.meetingId;
    const attendeePW = params.attendeePW || `att_${crypto.randomBytes(4).toString('hex')}`;
    const moderatorPW = params.moderatorPW || `mod_${crypto.randomBytes(4).toString('hex')}`;

    if (!this.isConfigured()) {
      return {
        success: false,
        isConfigured: false,
        meetingId,
        attendeePW,
        moderatorPW,
        message: 'BigBlueButton sunucusu yapılandırılmadı. Canlı sınıf sunucu ayarları gereklidir.',
      };
    }

    try {
      const baseUrl = this.getBaseUrl()!.replace(/\/+$/, '');
      const secret = this.getSecret()!;
      const maxParticipants = Math.min(70, Math.max(5, params.maxParticipants || 70));

      const queryParamsObj = new URLSearchParams({
        name: params.meetingName,
        meetingID: meetingId,
        attendeePW,
        moderatorPW,
        maxParticipants: maxParticipants.toString(),
        record: 'false',
        autoStartRecording: 'false',
        allowStartStopRecording: 'false',
      });

      if (params.logoutUrl) {
        queryParamsObj.append('logoutURL', params.logoutUrl);
      }

      const queryString = queryParamsObj.toString();
      const checksum = this.generateChecksum('create', queryString, secret);
      const url = `${baseUrl}/api/create?${queryString}&checksum=${checksum}`;

      const response = await fetch(url, { method: 'GET' });
      const xmlText = await response.text();

      // Check if returncode is SUCCESS or duplicateWarning
      if (xmlText.includes('<returncode>SUCCESS</returncode>') || xmlText.includes('duplicateWarning')) {
        return {
          success: true,
          isConfigured: true,
          meetingId,
          attendeePW,
          moderatorPW,
          message: 'Canlı sınıf oturumu BigBlueButton üzerinde başarıyla oluşturuldu.',
        };
      }

      // Parse messageKey or message if present (without leaking secret)
      const errorMatch = xmlText.match(/<message>(.*?)<\/message>/);
      const errorMsg = errorMatch ? errorMatch[1] : 'Toplantı oluşturulamadı.';

      return {
        success: false,
        isConfigured: true,
        meetingId,
        attendeePW,
        moderatorPW,
        message: `BigBlueButton oturumu başlatılamadı: ${errorMsg}`,
      };
    } catch (error) {
      console.error('BigBlueButton create meeting error:', error);
      return {
        success: false,
        isConfigured: true,
        meetingId,
        attendeePW,
        moderatorPW,
        message: 'BigBlueButton sunucusuyla iletişim kurulamadı.',
      };
    }
  }

  /**
   * Generates a signed Join URL for student (viewer) or teacher (moderator).
   */
  public getJoinUrl(params: {
    meetingId: string;
    userId: string;
    fullName: string;
    isModerator: boolean;
    password?: string;
  }): BigBlueButtonJoinResult {
    if (!this.isConfigured()) {
      return {
        success: false,
        isConfigured: false,
        meetingId: params.meetingId,
        role: params.isModerator ? 'moderator' : 'viewer',
        message: params.isModerator
          ? 'Canlı sınıf bağlantısı henüz yapılandırılmadı. Sunucu üzerinde BBB_BASE_URL ve BBB_SECRET ayarlarını tanımlayınız.'
          : 'Canlı sınıf bağlantısı hazırlanıyor. Lütfen eğitmenin oturumu başlatmasını bekleyiniz.',
      };
    }

    try {
      const baseUrl = this.getBaseUrl()!.replace(/\/+$/, '');
      const secret = this.getSecret()!;

      const joinParams = new URLSearchParams({
        meetingID: params.meetingId,
        fullName: params.fullName,
        userID: params.userId,
        role: params.isModerator ? 'MODERATOR' : 'VIEWER',
        redirect: 'true',
      });

      if (params.password) {
        joinParams.append('password', params.password);
      }

      const queryString = joinParams.toString();
      const checksum = this.generateChecksum('join', queryString, secret);
      const joinUrl = `${baseUrl}/api/join?${queryString}&checksum=${checksum}`;

      return {
        success: true,
        isConfigured: true,
        joinUrl,
        meetingId: params.meetingId,
        role: params.isModerator ? 'moderator' : 'viewer',
        message: 'Canlı sınıf katılım bağlantısı başarıyla oluşturuldu.',
      };
    } catch (error) {
      console.error('BigBlueButton join URL error:', error);
      return {
        success: false,
        isConfigured: true,
        role: params.isModerator ? 'moderator' : 'viewer',
        message: 'Canlı sınıf bağlantısı oluşturulurken hata meydana geldi.',
      };
    }
  }

  /**
   * Ends a meeting on the BigBlueButton server.
   * Only accessible by instructors / moderators.
   */
  public async endMeeting(params: {
    meetingId: string;
    moderatorPW: string;
  }): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'BigBlueButton sunucusu yapılandırılmadı.',
      };
    }

    try {
      const baseUrl = this.getBaseUrl()!.replace(/\/+$/, '');
      const secret = this.getSecret()!;

      const queryParams = new URLSearchParams({
        meetingID: params.meetingId,
        password: params.moderatorPW,
      });

      const queryString = queryParams.toString();
      const checksum = this.generateChecksum('end', queryString, secret);
      const url = `${baseUrl}/api/end?${queryString}&checksum=${checksum}`;

      const response = await fetch(url, { method: 'GET' });
      const xmlText = await response.text();

      if (xmlText.includes('<returncode>SUCCESS</returncode>')) {
        return {
          success: true,
          message: 'Canlı ders oturumu BigBlueButton sunucusunda başarıyla sonlandırıldı.',
        };
      }

      return {
        success: true, // Meeting may already be closed
        message: 'Canlı ders oturumu kapatıldı.',
      };
    } catch (error) {
      console.error('BigBlueButton end meeting error:', error);
      return {
        success: true, // Graceful fallback
        message: 'Canlı ders oturumu yerel olarak sonlandırıldı.',
      };
    }
  }
}

export const bbbProvider = new BigBlueButtonProvider();

// Backward-compatible alias
export const bbbAdapter = bbbProvider;
