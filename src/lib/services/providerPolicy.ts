import type {
  ProviderUserStatus,
  ServiceCategoryKey,
  ServiceSpecificProviderProfile,
} from '@/types/providerAuth';

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  statusCode:
    | 'AUTHORIZED'
    | 'SELF_BID_PROHIBITED'
    | 'UNVERIFIED_STATUS'
    | 'CATEGORY_MISMATCH'
    | 'SUSPENDED';
}

/**
 * Hizmet Bazlı Bağımsız Hizmet Veren Güvenlik ve Yetkilendirme Motoru
 */
export const ProviderPolicy = {
  /**
   * Belirli bir hizmet alanında kullanıcının teklif verme yetkisini denetler.
   */
  canSubmitBid(params: {
    serviceType: ServiceCategoryKey;
    profile: ServiceSpecificProviderProfile | undefined;
    requestCreatorId: string;
    currentUserId: string;
  }): AuthorizationResult {
    const { serviceType, profile, requestCreatorId, currentUserId } = params;

    // 1. Kendi oluşturduğu talebe teklif verme yasağı (Tüm hizmetlerde mutlak kural)
    if (requestCreatorId && requestCreatorId === currentUserId) {
      return {
        allowed: false,
        reason: 'Kendi oluşturduğunuz talebe hizmet veren olarak teklif veremezsiniz.',
        statusCode: 'SELF_BID_PROHIBITED',
      };
    }

    // 2. Profil yoksa veya müşteri modundaysa
    if (!profile || profile.status === 'customer') {
      return {
        allowed: false,
        reason: `Bu hizmet alanında teklif verebilmek için önce ilgili hizmet veren başvurusunu tamamlamanız ve onay almanız gerekir.`,
        statusCode: 'UNVERIFIED_STATUS',
      };
    }

    // 3. İnceleme aşamasındaysa
    if (profile.status === 'provider_applicant') {
      return {
        allowed: false,
        reason: `Bu hizmet alanındaki başvurunuz inceleme aşamasındadır. Onaylandıktan sonra teklif verebilirsiniz.`,
        statusCode: 'UNVERIFIED_STATUS',
      };
    }

    // 4. Askıya alınmışsa
    if (profile.status === 'provider_suspended') {
      return {
        allowed: false,
        reason: `Bu hizmet alanındaki hizmet veren hesabınız askıya alınmıştır.`,
        statusCode: 'SUSPENDED',
      };
    }

    // 5. Kategori eşleşmesi
    if (profile.serviceType !== serviceType) {
      return {
        allowed: false,
        reason: `Bu hizmet kategorisi için yetkilendirilmiş profiliniz bulunmamaktadır.`,
        statusCode: 'CATEGORY_MISMATCH',
      };
    }

    // 6. Onaylı profil
    if (profile.status === 'provider_verified') {
      return {
        allowed: true,
        statusCode: 'AUTHORIZED',
      };
    }

    return {
      allowed: false,
      reason: 'Yetkilendirme doğrulanamadı.',
      statusCode: 'UNVERIFIED_STATUS',
    };
  },

  /**
   * Pazar yerindeki açık talepleri filtreler.
   * Kullanıcının KENDİ oluşturduğu talepleri pazar yerinden kesinlikle çıkarır.
   */
  filterMarketplaceRequests<T extends { creatorId: string }>(
    requests: T[],
    currentUserId: string
  ): T[] {
    if (!currentUserId) return requests;
    return requests.filter((req) => req.creatorId !== currentUserId);
  },
};
