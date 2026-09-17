import type {
  AIChatProvider,
  AIChatRequest,
  AIChatResponse,
  AIProviderHealth,
  AIChatMessage,
} from './types';
import type { AssistantToolCall, AssistantPermissionScopeKey } from '@/types/assistant';

export class OllamaProvider implements AIChatProvider {
  readonly id = 'ollama' as const;
  readonly name = 'Ollama Yerel AI';

  private getBaseUrl(): string {
    const raw = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
    return raw.replace(/\/+$/, '');
  }

  private getModelName(): string {
    return process.env.OLLAMA_MODEL || 'llama3.2';
  }

  /**
   * Health & Model Check (Server-Side Only)
   */
  async checkHealth(): Promise<AIProviderHealth> {
    const baseUrl = this.getBaseUrl();
    const modelName = this.getModelName();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          isAvailable: false,
          status: 'offline',
          message: `Ollama sunucusu yanıt vermedi (${response.status}). Sunucunun çalıştığından emin olun.`,
          providerId: this.id,
          providerName: this.name,
          activeModel: modelName,
        };
      }

      const data = await response.json();
      const models: string[] = (data.models || []).map((m: any) => m.name || m.model || '');
      const modelExists = models.some(
        (m) => m === modelName || m.startsWith(`${modelName}:`) || m.startsWith(modelName)
      );

      if (!modelExists && models.length > 0) {
        return {
          isAvailable: true, // Server is up, but model needs pulling or alias
          status: 'online',
          message: `Ollama çalışıyor. Ancak "${modelName}" modeli bulunamadı. Kullanılabilir modeller: ${models.slice(0, 3).join(', ')}. Terminalden "ollama pull ${modelName}" çalıştırabilirsiniz.`,
          providerId: this.id,
          providerName: this.name,
          activeModel: models[0] || modelName,
          availableModels: models,
        };
      }

      return {
        isAvailable: true,
        status: 'online',
        message: `Ollama bağlantısı aktif. Model: ${modelName}`,
        providerId: this.id,
        providerName: this.name,
        activeModel: modelName,
        availableModels: models,
      };
    } catch (err: any) {
      return {
        isAvailable: false,
        status: 'offline',
        message:
          'Ollama yerel sunucusuna (http://localhost:11434) bağlanılamadı. Terminalde "ollama serve" veya "ollama run ' +
          modelName +
          '" komutuyla Ollama\'yı başlatabilirsiniz.',
        providerId: this.id,
        providerName: this.name,
        activeModel: modelName,
      };
    }
  }

  /**
   * Generates AI Chat Response via Ollama (Server-Side Only)
   */
  async generateChat(request: AIChatRequest): Promise<AIChatResponse> {
    const baseUrl = this.getBaseUrl();
    const modelName = this.getModelName();

    // 1. Health check
    const health = await this.checkHealth();
    if (!health.isAvailable) {
      return {
        providerId: this.id,
        providerName: this.name,
        model: modelName,
        content: health.message,
        status: 'offline',
        error: 'OLLAMA_OFFLINE',
        errorMessage: health.message,
      };
    }

    // 2. Build privacy-centric system prompt & context
    const effectiveModel = health.activeModel || modelName;
    const systemPrompt = this.buildSystemPrompt(request);

    // 3. Prune history: keep only last 10 messages (5 turns) to conserve context and prevent leakage
    const recentMessages = (request.messages || []).slice(-10);
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : m.role === 'user' ? 'user' : 'system',
        content: m.content || '',
      })),
    ];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for local LLM inference

      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: effectiveModel,
          messages: apiMessages,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        return {
          providerId: this.id,
          providerName: this.name,
          model: effectiveModel,
          content: `Ollama hatası (${response.status}): ${errText || 'Model yanıt oluşturamadı.'}`,
          status: 'error',
          error: 'OLLAMA_API_ERROR',
          errorMessage: errText,
        };
      }

      const data = await response.json();
      const content = data.message?.content || 'Yanıt alınamadı.';

      // 4. Inspect content and user prompt for tool calls with explicit approval gate
      const suggestedToolCalls = this.detectToolIntents(request, content);

      return {
        providerId: this.id,
        providerName: this.name,
        model: effectiveModel,
        content,
        status: 'success',
        suggestedToolCalls: suggestedToolCalls.length > 0 ? suggestedToolCalls : undefined,
      };
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError';
      const errMsg = isTimeout
        ? 'Ollama model yanıt süresi zaman aşımına uğradı (45s). Yerel model yükünüzü veya donanım kullanımını kontrol edin.'
        : `Ollama ile iletişim hatası: ${err?.message || 'Bilinmeyen hata'}`;

      return {
        providerId: this.id,
        providerName: this.name,
        model: effectiveModel,
        content: errMsg,
        status: 'error',
        error: isTimeout ? 'TIMEOUT' : 'CONNECTION_ERROR',
        errorMessage: errMsg,
      };
    }
  }

  /**
   * Builds strict context string respecting user permission scopes
   */
  private buildSystemPrompt(request: AIChatRequest): string {
    const scopes = request.permissionScopes || [];

    let contextSection = '';

    // Finance scope check
    if (scopes.includes('finance')) {
      contextSection += `\n- Finans Özeti (İzinli): ${request.contextData?.allowedFinanceSummary?.thisMonthTotal || 'Bu ayki harcama verilerine erişim açık.'}`;
    } else {
      contextSection += '\n- Finans Verileri: Erişim izni YOK. Kullanıcı izin vermeden finansal detayları tahmin etme/uydurma.';
    }

    // Family scope check
    if (scopes.includes('family')) {
      contextSection += `\n- Aile Alanı (İzinli): Aile etkinlikleri ve ortak planlara erişim açık.`;
    } else {
      contextSection += '\n- Aile Verileri: Erişim izni YOK.';
    }

    // Services scope check
    if (scopes.includes('services')) {
      contextSection += '\n- Hizmetler (Taksi/Nakliye/Usta/Seyahat): Talep ve rezervasyon durumlarını sorgulama izni açık.';
    } else {
      contextSection += '\n- Hizmet Talepleri: Erişim izni YOK.';
    }

    // Photo scope check
    if (scopes.includes('photos') && request.attachedPhoto) {
      contextSection += `\n- Fotoğraf Eki (Kullanıcı Tarafından Onaylandı): "${request.attachedPhoto.fileName}" (Amaç: ${request.attachedPhoto.analysisPurpose}, EXIF/GPS arındırıldı).`;
    } else {
      contextSection += '\n- Fotoğraf Galerisi: Otomatik veya arkaplan erişimi YOK.';
    }

    // Tasks scope check
    if (scopes.includes('tasks')) {
      contextSection += '\n- LifeOS Görevleri: Görev listesini inceleme ve yeni görev planlama yetkisi açık.';
    }

    return `Sen LifeOS Asistanısın. Türkçe konuşan, nazik, son derece güvenilir, saygılı ve net bir kişisel yaşam işletim sistemi yapay zekâsısın.

GÜVENLİK VE GİZLİLİK KURALLARI:
1. Kullanıcının cihazındaki veya buluttaki kişisel verilerine yalnızca açıkça izin verilen kapsamlarda erişebilirsin.
2. Şu anki oturumda izin verilen kapsamlar: [${scopes.join(', ') || 'Hiçbiri'}]
3. Kapsam izinleri:${contextSection}
4. ASLA sahte finansal sayı, takvim randevusu veya kişi bilgisi uydurma. Veri izni yoksa nazikçe kullanıcıdan izin istemesi gerektiğini belirt.
5. Kullanıcı adına dış dünyaya mesaj gönderme, ödeme yapma, rezervasyon tamamlama veya veri silme gibi eylemleri ASLA tek başına yapma; kullanıcıdan açık onay iste.
6. Yanıtların Türkçe, net, profesyonel ve düzenli olsun. Gerekirse maddeler halinde yaz.`;
  }

  /**
   * Identifies if a read/write tool call is needed and wraps it in dual-layer confirmation
   */
  private detectToolIntents(request: AIChatRequest, assistantReply: string): AssistantToolCall[] {
    const lastUserMsg = [...(request.messages || [])].reverse().find((m) => m.role === 'user');
    const prompt = (lastUserMsg?.content || '').toLowerCase();
    const reply = assistantReply.toLowerCase();
    const scopes = request.permissionScopes || [];

    const toolCalls: AssistantToolCall[] = [];

    // 1. Finance inspection request
    if (prompt.includes('bütçe') || prompt.includes('harcama') || prompt.includes('finans') || prompt.includes('fatura')) {
      const hasScope = scopes.includes('finance');
      toolCalls.push({
        id: `tool_${Date.now()}_fin`,
        name: 'read_finance_summary',
        labelTr: 'Finansal Harcama Özeti Okuma',
        isWriteAction: false,
        requiredScope: 'finance',
        arguments: { period: 'current_month' },
        status: hasScope ? 'executed' : 'requires_permission',
        permissionReason: 'Bütçe analizi yapabilmek için bu ayki harcama kategorilerine erişim izni gerekiyor.',
      });
    }

    // 2. Family schedule request
    if (prompt.includes('aile') || prompt.includes('çocuk') || prompt.includes('etkinlik planı')) {
      const hasScope = scopes.includes('family');
      toolCalls.push({
        id: `tool_${Date.now()}_fam`,
        name: 'read_family_events',
        labelTr: 'Aile Çemberi ve Takvim Verisi Okuma',
        isWriteAction: false,
        requiredScope: 'family',
        arguments: { scope: 'upcoming' },
        status: hasScope ? 'executed' : 'requires_permission',
        permissionReason: 'Aile etkinlik planı oluşturmak için aile takvimine erişim izni gerekiyor.',
      });
    }

    // 3. Task Creation intent
    if (
      prompt.includes('görev oluştur') ||
      prompt.includes('hatırlatıcı kur') ||
      prompt.includes('göreve ekle') ||
      reply.includes('görev olarak eklendi') ||
      reply.includes('görev oluşturuldu')
    ) {
      toolCalls.push({
        id: `tool_${Date.now()}_task`,
        name: 'create_lifeos_task',
        labelTr: 'LifeOS Görev Listesine Ekleme',
        isWriteAction: true,
        requiredScope: 'tasks',
        arguments: { title: lastUserMsg?.content?.slice(0, 50) || 'Yeni Görev' },
        status: 'requires_user_approval',
        permissionReason: 'Görev listesine yeni bir kayıt eklemek için kullanıcı onayı istenir.',
      });
    }

    return toolCalls;
  }
}
