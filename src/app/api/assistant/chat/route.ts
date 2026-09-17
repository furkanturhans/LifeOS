import { NextRequest, NextResponse } from 'next/server';
import { providerRegistry } from '@/services/assistant/ai/ProviderRegistry';

/**
 * GET /api/assistant/chat
 * Checks health and active model info of the active AI provider
 */
export async function GET() {
  try {
    const provider = providerRegistry.getActiveProvider();
    const health = await provider.checkHealth();

    return NextResponse.json({
      activeProvider: provider.id,
      ...health,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        activeProvider: process.env.AI_PROVIDER || 'ollama',
        isAvailable: false,
        status: 'error',
        message: error?.message || 'Sağlayıcı durumu kontrol edilemedi.',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assistant/chat
 * Generates chat response using the active AI provider (Ollama / OpenAI)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId,
      messages = [],
      permissionScopes = [],
      attachedPhoto,
      contextData,
    } = body;

    const provider = providerRegistry.getActiveProvider();

    const response = await provider.generateChat({
      conversationId: conversationId || `conv_${Date.now()}`,
      messages,
      permissionScopes,
      attachedPhoto,
      contextData,
    });

    if (response.status === 'offline' || response.status === 'unconfigured') {
      return NextResponse.json({
        configured: false,
        status: response.status,
        provider: response.providerId,
        providerName: response.providerName,
        model: response.model,
        error: response.error,
        message: response.content,
      });
    }

    if (response.status === 'error') {
      return NextResponse.json({
        configured: true,
        status: 'error',
        provider: response.providerId,
        providerName: response.providerName,
        model: response.model,
        error: response.error,
        message: response.content,
      });
    }

    return NextResponse.json({
      configured: true,
      status: 'success',
      provider: response.providerId,
      providerName: response.providerName,
      model: response.model,
      content: response.content,
      suggestedToolCalls: response.suggestedToolCalls,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        configured: false,
        status: 'error',
        error: 'SERVER_ERROR',
        message: error?.message || 'Sunucu tarafında bilinmeyen bir hata oluştu.',
      },
      { status: 500 }
    );
  }
}

