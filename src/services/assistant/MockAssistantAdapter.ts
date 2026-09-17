import type {
  AssistantTask,
  AssistantTaskStep,
  ParsedAssistantCommand,
  AssistantTaskType,
  AssistantPermissionScope,
} from '@/types/assistant';
import type { AssistantProviderAdapter, StepExecutionResult } from './AssistantAdapter';

export class LocalDeterministicAssistantAdapter implements AssistantProviderAdapter {
  id = 'local-deterministic-v1';
  name = 'LifeOS Güvenli Yerel Asistan Motoru';
  version = '1.0.0';
  isLocal = true;

  async parseCommand(prompt: string, context?: { locale: string }): Promise<ParsedAssistantCommand> {
    const p = prompt.toLowerCase().trim();

    // 1. Content / Video Assistant Tasks
    if (
      p.includes('video') ||
      p.includes('kurgu') ||
      p.includes('shorts') ||
      p.includes('reels') ||
      p.includes('içerik') ||
      p.includes('altyazı') ||
      p.includes('kapak')
    ) {
      return {
        title: prompt.length > 50 ? `${prompt.slice(0, 47)}...` : prompt,
        description: 'Doğal dil komutuna göre içerik ve video kurgu planlama görevi.',
        type: 'content',
        requiresApproval: true,
        approvalDescription: 'Planlanan video kurgu parametreleri ve taslak akışının onaylanması gerekmektedir.',
        requiredScopes: ['files'],
        contentDetails: {
          contentType: p.includes('shorts') || p.includes('reels') ? 'video_short' : 'video_clip',
          targetPlatform: p.includes('shorts') ? 'youtube_shorts' : p.includes('reels') ? 'instagram_reels' : 'tiktok',
          videoSpecs: {
            autoCaptions: true,
            cleanAudio: true,
            aspect: '9:16',
            targetDurationSec: 45,
          },
        },
        steps: [
          { id: 'c1', title: 'İçerik Teması ve Kurgu Taslağı Çıkarma', details: 'Ana vurgular ve zaman çizelgesi belirleniyor.' },
          { id: 'c2', title: 'Dikey Format & Altyazı Düzeni Planlama', details: '9:16 yerleşim ve otomatik senkron altyazı kuralı.' },
          { id: 'c3', title: 'Ses Netleştirme ve Arka Plan Planı', details: 'Ortam gürültüsü filtreleme parametreleri hazırlanıyor.' },
          { id: 'c4', title: 'Kullanıcı Onayı & Nihai Taslak Sunumu', details: 'Kurgu taslağı kullanıcı onayına sunulacak.' },
        ],
      };
    }

    // 2. Finance / Budget Tasks
    if (
      p.includes('bütçe') ||
      p.includes('finans') ||
      p.includes('harcama') ||
      p.includes('para') ||
      p.includes('fatura') ||
      p.includes('tasarruf')
    ) {
      return {
        title: prompt.length > 50 ? `${prompt.slice(0, 47)}...` : prompt,
        description: 'Finansal analiz ve bütçe optimizasyon planı.',
        type: 'finance',
        requiresApproval: true,
        approvalDescription: 'Bütçe hedefleri ve harcama kısıtlamalarının aktifleşmesi için onayınız istenir.',
        requiredScopes: ['finance'],
        steps: [
          { id: 'f1', title: 'Harcama Kategorilerinin İncelenmesi', details: 'Mevcut cüzdan kategorileri analiz edilir.' },
          { id: 'f2', title: 'Aylık Tasarruf ve Limit Modellemesi', details: 'Harcama tavanları hesaplanır.' },
          { id: 'f3', title: 'Bütçe Planı Onay Adımı', details: 'Kullanıcı onayı sonrası hedef kuralı tanımlanır.' },
        ],
      };
    }

    // 3. Family / Household Tasks
    if (
      p.includes('aile') ||
      p.includes('çocuk') ||
      p.includes('etkinlik') ||
      p.includes('yemek') ||
      p.includes('ortak')
    ) {
      return {
        title: prompt.length > 50 ? `${prompt.slice(0, 47)}...` : prompt,
        description: 'Aile çemberi için ortak etkinlik ve görev planlaması.',
        type: 'family',
        requiresApproval: false,
        requiredScopes: ['family', 'calendar'],
        steps: [
          { id: 'fa1', title: 'Aile Takvimi Müsaitlik Kontrolü', details: 'Ortak boş zaman dilimleri taranır.' },
          { id: 'fa2', title: 'Etkinlik ve İhtiyaç Listesi Hazırlama', details: 'Gerekli malzemeler listelenir.' },
          { id: 'fa3', title: 'Ortak Yaşam Alanına Görev Kartı Ekleme', details: 'Aile bireylerine görünür plan sunulur.' },
        ],
      };
    }

    // 4. Services / Moving / Taxi / Craftsman Tasks
    if (
      p.includes('taksi') ||
      p.includes('nakliye') ||
      p.includes('usta') ||
      p.includes('seyahat') ||
      p.includes('otobüs') ||
      p.includes('hizmet')
    ) {
      return {
        title: prompt.length > 50 ? `${prompt.slice(0, 47)}...` : prompt,
        description: 'Hizmetler ekosisteminde talep ve teklif hazırlığı.',
        type: 'services',
        requiresApproval: true,
        approvalDescription: 'Dış teklif veya talep yayınlanmadan önce tam onayınız zorunludur.',
        requiredScopes: ['services'],
        steps: [
          { id: 's1', title: 'Hizmet İhtiyaç Kapsamının Belirlenmesi', details: 'Konum ve detay parametreleri yapılandırılır.' },
          { id: 's2', title: 'Güvenli Talep Taslağının Oluşturulması', details: 'Kişisel veri arındırması yapılır.' },
          { id: 's3', title: 'Talep Yayınlama Onay Adımı', details: 'Kullanıcı onayı olmadan talep pazara açılmaz.' },
        ],
      };
    }

    // 5. Research / Summary Tasks
    if (
      p.includes('araştır') ||
      p.includes('özetle') ||
      p.includes('incele') ||
      p.includes('nedir') ||
      p.includes('bul')
    ) {
      return {
        title: prompt.length > 50 ? `${prompt.slice(0, 47)}...` : prompt,
        description: 'Belirtilen konu hakkında yapılandırılmış bilgi araştırması.',
        type: 'research',
        requiresApproval: false,
        requiredScopes: ['tasks'],
        steps: [
          { id: 'r1', title: 'Kaynak ve Başlıkların Taranması', details: 'Güvenilir referanslar belirlenir.' },
          { id: 'r2', title: 'Temel Bulguların Özetlenmesi', details: 'Önemli maddeler ve çıkarımlar derlenir.' },
          { id: 'r3', title: 'Rapor Formatında Düzenleme', details: 'Maddeli ve net özet sunulur.' },
        ],
      };
    }

    // 6. Generic Planning
    return {
      title: prompt.length > 50 ? `${prompt.slice(0, 47)}...` : prompt,
      description: 'Kişisel yaşam akışına uygun yapılandırılmış görev planı.',
      type: 'planning',
      requiresApproval: false,
      requiredScopes: ['calendar'],
      steps: [
        { id: 'p1', title: 'Hedef ve Öncelik Sıralaması', details: 'Adımlar mantıksal sıraya dizilir.' },
        { id: 'p2', title: 'Zaman ve Kaynak Dağılımı', details: 'Tahmini tamamlanma süreleri atanır.' },
        { id: 'p3', title: 'Takip Çizelgesine Kayıt', details: 'LifeOS görev listenize eklenir.' },
      ],
    };
  }

  async generateTaskPlan(task: AssistantTask): Promise<AssistantTaskStep[]> {
    return task.steps;
  }

  async executeStep(task: AssistantTask, step: AssistantTaskStep): Promise<StepExecutionResult> {
    // Deterministic simulation
    return {
      success: true,
      logMessage: `[${new Date().toLocaleTimeString('tr-TR')}] "${step.title}" adımı kontrollü ortamda tamamlandı.`,
      updatedDetails: 'İşlem başarıyla doğrulandı.',
      resultSummary: `"${task.title}" görevi için "${step.title}" adımı tamamlandı.`,
    };
  }
}
