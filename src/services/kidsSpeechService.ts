import type { KidsVoiceSettings, KidsVoicePersona, KidsSpeechSpeed } from '@/types/kids';

export const NO_AZURE_CONFIG_NOTICE =
  'Sesli anlatımı etkinleştirmek için anlatıcı servisi yapılandırılmalıdır.';

export const PREVIEW_SAMPLE_TEXT =
  'Merhaba. Ben LifeOS Kids anlatıcısıyım. Birlikte öğrenmeye ve güzel hikâyeler keşfetmeye hazır mısın?';

export const AZURE_PRIMARY_FEMALE_VOICE = 'tr-TR-Elif:MAI-Voice-2';
export const AZURE_FALLBACK_FEMALE_VOICE = 'tr-TR-EmelNeural';

/**
 * Normalizes Turkish text for natural, warm, and child-friendly speech synthesis.
 * Converts math operations, times, ordinal numbers, age ranges, and pauses.
 */
export function normalizeTurkishForSpeech(text: string): string {
  if (!text) return '';

  let clean = text;

  // 1. Remove emojis so they aren't mechanically verbalized as "gülen yüz emojisi"
  clean = clean.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, ' ');

  // 2. Normalize Age Ranges (e.g. "3-5 Yaş" -> "3 ile 5 yaş arası")
  clean = clean.replace(/(\d+)\s*-\s*(\d+)\s*(yaş|Yaş)/gi, '$1 ile $2 yaş arası');

  // 3. Normalize Times (e.g. "12:30" -> "12 30", "14:00" -> "14 00")
  clean = clean.replace(/(\d{1,2}):(\d{2})/g, '$1 $2');

  // 4. Normalize Common Ordinals (e.g. "1." -> "birinci", "2." -> "ikinci")
  const ordinals: Record<string, string> = {
    '1.': 'birinci',
    '2.': 'ikinci',
    '3.': 'üçüncü',
    '4.': 'dördüncü',
    '5.': 'beşinci',
    '6.': 'altıncı',
    '7.': 'yedinci',
    '8.': 'sekizinci',
    '9.': 'dokuzuncu',
    '10.': 'onuncu',
  };
  clean = clean.replace(/\b(10|[1-9])\./g, (match) => ordinals[match] || match);

  // 5. Normalize Math Operations in context (e.g. "2 + 3 = 5" -> "2 artı 3 eşittir 5")
  clean = clean.replace(/(\d+)\s*\+\s*(\d+)/g, '$1 artı $2');
  clean = clean.replace(/(\d+)\s*-\s*(\d+)/g, '$1 eksi $2');
  clean = clean.replace(/(\d+)\s*[x*]\s*(\d+)/g, '$1 çarpı $2');
  clean = clean.replace(/(\d+)\s*[/÷]\s*(\d+)/g, '$1 bölü $2');
  clean = clean.replace(/=\s*(\d+)/g, 'eşittir $1');

  // 6. Natural breathing pauses for punctuation
  clean = clean.replace(/\.{3}/g, '... ');
  clean = clean.replace(/,\s*/g, ', ');
  clean = clean.replace(/\s+/g, ' ').trim();

  return clean;
}

/**
 * Splits long story texts into sentence chunks so playback can be queued seamlessly.
 */
export function splitTextIntoSentences(text: string): string[] {
  if (!text) return [];
  const chunks = text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return chunks.length > 0 ? chunks : [text];
}

export class KidsSpeechService {
  private static instance: KidsSpeechService;
  private audioCache = new Map<string, string>(); // In-memory blob URL cache (key: voice_speed_text)
  private currentAudio: HTMLAudioElement | null = null;
  private isConfiguredCache: boolean | null = null;
  private configCheckPromise: Promise<boolean> | null = null;
  private cancelCurrentSpeech = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.checkConfiguration();
    }
  }

  public static getInstance(): KidsSpeechService {
    if (!KidsSpeechService.instance) {
      KidsSpeechService.instance = new KidsSpeechService();
    }
    return KidsSpeechService.instance;
  }

  /**
   * Checks whether the server-side Azure Speech provider is configured.
   */
  public async checkConfiguration(): Promise<boolean> {
    if (this.isConfiguredCache !== null) {
      return this.isConfiguredCache;
    }

    if (this.configCheckPromise) {
      return this.configCheckPromise;
    }

    this.configCheckPromise = (async () => {
      try {
        const res = await fetch('/api/kids/tts');
        if (res.ok) {
          const data = await res.json();
          this.isConfiguredCache = Boolean(data.isConfigured);
        } else {
          this.isConfiguredCache = false;
        }
      } catch {
        this.isConfiguredCache = false;
      }
      this.configCheckPromise = null;
      return this.isConfiguredCache ?? false;
    })();

    return this.configCheckPromise;
  }

  public isVoiceConfigured(): boolean {
    return this.isConfiguredCache ?? false;
  }

  /**
  /**
   * Fetches and caches audio blob URL for a specific text chunk.
   */
  private async fetchAudioBlobUrl(
    text: string,
    voice: string,
    speed: KidsSpeechSpeed
  ): Promise<string | null> {
    const cacheKey = `${voice}_${speed}_${text}`;
    const cached = this.audioCache.get(cacheKey);
    if (cached) return cached;

    const response = await fetch('/api/kids/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice,
        speed,
      }),
    });

    if (!response.ok) {
      if (response.status === 503) {
        this.isConfiguredCache = false;
      }
      return null;
    }

    const audioBlob = await response.blob();
    const blobUrl = URL.createObjectURL(audioBlob);
    this.audioCache.set(cacheKey, blobUrl);
    return blobUrl;
  }

  /**
   * Speaks the text using Azure Speech Turkish female narrator.
   * Caches synthesized audio in-memory and splits long stories into chunks.
   */
  public async speak(
    text: string,
    options?: {
      settings?: Partial<KidsVoiceSettings>;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
      onUnavailable?: (message: string) => void;
    }
  ): Promise<void> {
    if (typeof window === 'undefined' || !text || !text.trim()) {
      options?.onEnd?.();
      return;
    }

    // Check master switch
    if (options?.settings?.isVoiceEnabled === false) {
      options?.onEnd?.();
      return;
    }

    // Check server configuration
    const isConfigured = await this.checkConfiguration();
    if (!isConfigured) {
      options?.onUnavailable?.(NO_AZURE_CONFIG_NOTICE);
      options?.onEnd?.();
      return;
    }

    const normalized = normalizeTurkishForSpeech(text);
    if (!normalized) {
      options?.onEnd?.();
      return;
    }

    this.stop();
    this.cancelCurrentSpeech = false;

    const speed: KidsSpeechSpeed = options?.settings?.speed || 'normal';
    const volume = options?.settings?.volume !== undefined ? options.settings.volume : 0.9;
    const requestedVoice = options?.settings?.selectedVoiceURI || AZURE_PRIMARY_FEMALE_VOICE;

    // If text is long (> 200 chars and multiple sentences), split into sequential chunks
    const sentences = splitTextIntoSentences(normalized);
    const chunks = (sentences.length > 1 && normalized.length > 200) ? sentences : [normalized];

    try {
      options?.onStart?.();

      for (let i = 0; i < chunks.length; i++) {
        if (this.cancelCurrentSpeech) break;

        const chunkText = chunks[i];
        const blobUrl = await this.fetchAudioBlobUrl(chunkText, requestedVoice, speed);

        if (!blobUrl) {
          if (this.isConfiguredCache === false) {
            options?.onUnavailable?.(NO_AZURE_CONFIG_NOTICE);
          } else {
            options?.onError?.(new Error('Audio synthesis request failed'));
          }
          options?.onEnd?.();
          return;
        }

        if (this.cancelCurrentSpeech) break;

        // Play the chunk and wait for it to finish before next sentence
        await new Promise<void>((resolve, reject) => {
          if (this.cancelCurrentSpeech) {
            resolve();
            return;
          }

          const audio = new Audio(blobUrl);
          this.currentAudio = audio;
          audio.volume = Math.max(0, Math.min(1, volume));

          audio.onended = () => {
            this.currentAudio = null;
            resolve();
          };

          audio.onerror = (e) => {
            this.currentAudio = null;
            reject(e);
          };

          audio.play().catch((err) => {
            this.currentAudio = null;
            reject(err);
          });
        });
      }

      options?.onEnd?.();
    } catch (err) {
      this.currentAudio = null;
      options?.onError?.(err);
      options?.onEnd?.();
    }
  }

  /**
   * Stops any ongoing audio playback.
   */
  public stop(): void {
    this.cancelCurrentSpeech = true;
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }
  }

  /**
   * Previews the Azure Speech Turkish female narrator with exact requested sample text.
   */
  public preview(
    settings: KidsVoiceSettings,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onUnavailable?: (message: string) => void;
      onError?: (err: any) => void;
    }
  ): void {
    this.speak(PREVIEW_SAMPLE_TEXT, {
      settings,
      onStart: callbacks?.onStart,
      onEnd: callbacks?.onEnd,
      onUnavailable: callbacks?.onUnavailable,
      onError: callbacks?.onError,
    });
  }
}

export const kidsSpeech = KidsSpeechService.getInstance();
