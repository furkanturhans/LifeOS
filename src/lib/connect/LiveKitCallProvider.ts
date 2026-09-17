import crypto from 'crypto';
import type { LiveKitTokenResponse } from '@/types/connect';

export interface LiveKitTokenParams {
  roomName: string;
  participantIdentity: string;
  participantName: string;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
  ttlSeconds?: number;
}

export class LiveKitCallProvider {
  /**
   * Check if LiveKit environment variables are configured.
   */
  public static isConfigured(): boolean {
    const url = process.env.LIVEKIT_URL;
    const key = process.env.LIVEKIT_API_KEY;
    const secret = process.env.LIVEKIT_API_SECRET;

    return Boolean(url && key && secret && url.trim().length > 0 && key.trim().length > 0 && secret.trim().length > 0);
  }

  /**
   * Get safe LiveKit status without leaking secrets.
   */
  public static getStatus(): { configured: boolean; url: string | null } {
    const configured = this.isConfigured();
    const rawUrl = process.env.LIVEKIT_URL?.trim() || null;
    return {
      configured,
      url: configured ? rawUrl : null,
    };
  }

  /**
   * Generate a secure JWT room token for LiveKit.
   */
  public static generateToken(params: LiveKitTokenParams): LiveKitTokenResponse {
    if (!this.isConfigured()) {
      return {
        configured: false,
        message: 'LiveKit sesli/görüntülü arama sunucusu henüz yapılandırılmadı (LIVEKIT_URL, LIVEKIT_API_KEY veya LIVEKIT_API_SECRET eksik).',
      };
    }

    const apiKey = process.env.LIVEKIT_API_KEY!.trim();
    const apiSecret = process.env.LIVEKIT_API_SECRET!.trim();
    const livekitUrl = process.env.LIVEKIT_URL!.trim();

    const now = Math.floor(Date.now() / 1000);
    const ttl = params.ttlSeconds || 3600; // 1 hour default

    const sanitizedRoom = params.roomName.replace(/[^a-zA-Z0-9_\-]/g, '_');

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const payload = {
      iss: apiKey,
      sub: params.participantIdentity,
      nbf: now - 5,
      exp: now + ttl,
      name: params.participantName,
      video: {
        room: sanitizedRoom,
        roomJoin: true,
        canPublish: params.canPublish ?? true,
        canSubscribe: params.canSubscribe ?? true,
        canPublishData: params.canPublishData ?? true,
      },
    };

    const encodeBase64Url = (obj: object | string): string => {
      const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
      return Buffer.from(str)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    };

    const encodedHeader = encodeBase64Url(header);
    const encodedPayload = encodeBase64Url(payload);
    const message = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(message)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const jwtToken = `${message}.${signature}`;

    return {
      configured: true,
      token: jwtToken,
      url: livekitUrl,
      roomName: sanitizedRoom,
      participantIdentity: params.participantIdentity,
      participantName: params.participantName,
    };
  }
}
