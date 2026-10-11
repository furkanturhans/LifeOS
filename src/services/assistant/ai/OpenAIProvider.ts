import type {
  AIChatProvider,
  AIChatRequest,
  AIChatResponse,
  AIProviderHealth,
} from './types';
import type { AssistantToolCall } from '@/types/assistant';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/languages';

export class OpenAIProvider implements AIChatProvider {
  readonly id = 'openai' as const;
  readonly name = 'OpenAI Bulut Modeli';

  private getApiKey(): string | undefined {
    return process.env.OPENAI_API_KEY;
  }

  private getModelName(): string {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async checkHealth(): Promise<AIProviderHealth> {
    const key = this.getApiKey();
    const model = this.getModelName();

    if (!key) {
      return {
        isAvailable: false,
        status: 'unconfigured',
        message: 'OpenAI API anahtarı (OPENAI_API_KEY) tanımlanmamış.',
        providerId: this.id,
        providerName: this.name,
        activeModel: model,
      };
    }

    return {
      isAvailable: true,
      status: 'online',
      message: `OpenAI API anahtarı yapılandırılmış. Model: ${model}`,
      providerId: this.id,
      providerName: this.name,
      activeModel: model,
    };
  }

  async generateChat(request: AIChatRequest): Promise<AIChatResponse> {
    const key = this.getApiKey();
    const model = this.getModelName();

    if (!key) {
      return {
        providerId: this.id,
        providerName: this.name,
        model,
        content:
          'OpenAI API anahtarı tanımlanmamış. .env.local dosyasına OPENAI_API_KEY ekleyebilir veya AI_PROVIDER=ollama ile yerel modele geçebilirsiniz.',
        status: 'unconfigured',
        error: 'OPENAI_API_KEY_MISSING',
      };
    }

    const scopes = request.permissionScopes || [];
    const responseLanguage = SUPPORTED_LANGUAGES.find(language => language.code === request.contextData?.locale)?.name ?? 'Turkish';
    const systemPrompt = `Sen LifeOS Asistanısın. Nazik, net ve güvenilir bir kişisel asistan modelisin. Yanıtlarını ${responseLanguage} dilinde ver.
Kullanıcının verilerine yalnızca şu izinli kapsamlarda erişebilirsin: [${scopes.join(', ')}].
Herhangi bir işlem yapmadan önce kullanıcıdan açık onay istemelisin. Asla sahte veri uydurma.`;

    const recentMessages = (request.messages || []).slice(-10);
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : m.role === 'user' ? 'user' : 'system',
        content: m.content || '',
      })),
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return {
          providerId: this.id,
          providerName: this.name,
          model,
          content: `OpenAI hatası: ${errData.error?.message || 'Yanıt alınamadı.'}`,
          status: 'error',
          error: 'OPENAI_API_ERROR',
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || 'Yanıt oluşturulamadı.';

      return {
        providerId: this.id,
        providerName: this.name,
        model,
        content,
        status: 'success',
      };
    } catch (err: any) {
      return {
        providerId: this.id,
        providerName: this.name,
        model,
        content: `OpenAI bağlantı hatası: ${err?.message || 'Bilinmeyen hata'}`,
        status: 'error',
        error: 'CONNECTION_ERROR',
      };
    }
  }
}
