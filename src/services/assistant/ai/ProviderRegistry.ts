import type { AIChatProvider, AIProviderType } from './types';
import { OllamaProvider } from './OllamaProvider';
import { OpenAIProvider } from './OpenAIProvider';

class ProviderRegistry {
  private providers: Map<string, AIChatProvider> = new Map();

  constructor() {
    this.register(new OllamaProvider());
    this.register(new OpenAIProvider());
  }

  register(provider: AIChatProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): AIChatProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      // Default fallback to Ollama
      return this.providers.get('ollama')!;
    }
    return provider;
  }

  getActiveProvider(): AIChatProvider {
    const activeId = (process.env.AI_PROVIDER || 'ollama').toLowerCase();
    return this.getProvider(activeId);
  }
}

export const providerRegistry = new ProviderRegistry();
