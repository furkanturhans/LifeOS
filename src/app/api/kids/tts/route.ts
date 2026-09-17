import { NextRequest, NextResponse } from 'next/server';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const PRIMARY_VOICE = process.env.KIDS_TTS_VOICE || 'tr-TR-Elif:MAI-Voice-2';
const FALLBACK_VOICE = 'tr-TR-EmelNeural';

async function synthesizeWithAzure(
  text: string,
  voiceName: string,
  rateStr: string,
  apiKey: string,
  region: string
): Promise<{ ok: boolean; status: number; data?: ArrayBuffer; errorText?: string }> {
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="tr-TR">
  <voice name="${voiceName}">
    <prosody rate="${rateStr}" pitch="0%">
      ${escapeXml(text)}
    </prosody>
  </voice>
</speak>`;

  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'LifeOS-Kids-Narrator',
      },
      body: ssml,
    });

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      return { ok: true, status: 200, data: arrayBuffer };
    } else {
      const errorText = await response.text();
      return { ok: false, status: response.status, errorText };
    }
  } catch (err: any) {
    return { ok: false, status: 500, errorText: err?.message || 'Network error' };
  }
}

/**
 * GET /api/kids/tts
 * Returns configuration status without exposing sensitive API keys.
 */
export async function GET() {
  const key = process.env.AZURE_SPEECH_KEY?.trim();
  const region = process.env.AZURE_SPEECH_REGION?.trim();
  const isConfigured = Boolean(key && region);

  return NextResponse.json({
    isConfigured,
    provider: process.env.KIDS_TTS_PROVIDER || 'azure',
    voice: PRIMARY_VOICE,
    fallbackVoice: FALLBACK_VOICE,
  });
}

/**
 * POST /api/kids/tts
 * Synthesizes Turkish female narration audio securely via Azure Speech.
 */
export async function POST(req: NextRequest) {
  const key = process.env.AZURE_SPEECH_KEY?.trim();
  const region = process.env.AZURE_SPEECH_REGION?.trim();

  if (!key || !region) {
    return NextResponse.json(
      {
        error: 'Sesli anlatımı etkinleştirmek için anlatıcı servisi yapılandırılmalıdır.',
        isConfigured: false,
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const text = (body?.text || '').trim();
    const speed = body?.speed || 'normal';
    const requestedVoice = body?.voice || PRIMARY_VOICE;

    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    // Prosody rate mappings
    let rateStr = '-12%'; // Default normal (0.88x)
    if (speed === 'slow') rateStr = '-18%';
    if (speed === 'fast') rateStr = '0%';

    // 1. Try primary voice (tr-TR-Elif:MAI-Voice-2 or requested voice)
    let result = await synthesizeWithAzure(text, requestedVoice, rateStr, key, region);

    // 2. If primary fails (e.g. 400/404 custom voice unavailable in region), fallback to tr-TR-EmelNeural
    if (!result.ok && requestedVoice !== FALLBACK_VOICE) {
      console.warn(`[LifeOS Kids TTS] Primary voice (${requestedVoice}) failed, falling back to ${FALLBACK_VOICE}`);
      result = await synthesizeWithAzure(text, FALLBACK_VOICE, rateStr, key, region);
    }

    if (!result.ok || !result.data) {
      return NextResponse.json(
        { error: 'TTS synthesis failed', details: result.errorText },
        { status: result.status >= 400 && result.status < 600 ? result.status : 500 }
      );
    }

    return new Response(result.data, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error during speech synthesis' },
      { status: 500 }
    );
  }
}
