import type {
  WalletAccount,
  CreditLedgerEntry,
  PaymentIntentDraft,
  PaymentMethodType,
  ProviderEarningsSummary,
  CreditRefundRequest,
  ServiceCreditUsageRule,
  ParentalCreditControl,
  CreditOverviewMetrics,
} from '@/types/payment';
import { LIFEOS_CREDIT_RATE_KURUS, LIFEOS_CREDIT_RATE_TL } from '@/types/payment';
import type { FinanceSourceModule, TimeFilterOption } from '@/types/finance';
import { FinanceRegistry } from '@/lib/admin/FinanceRegistry';
import { getPaymentProvider } from './PaymentProviderAdapter';

// In-Memory Unified Wallets Database
const WALLETS: Record<string, WalletAccount> = {
  user_local: {
    userId: 'user_local',
    creditBalance: 150, // 150 LifeOS Credits
    purchasedCredits: 100, // 100 Purchased Credits
    promoCredits: 50, // 50 Welcome/Bonus Credits (non-refundable)
    spentCredits: 0,
    refundedCredits: 0,
    pendingRefundCredits: 0,
    // Compatibility fields
    educationCreditBalance: 150,
    cashBalanceKurus: 0,
    pendingBalanceKurus: 0,
    currency: 'LifeOS Credit',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

let CREDIT_LEDGER: CreditLedgerEntry[] = [
  {
    id: 'CLEDGER-INIT-01',
    userId: 'user_local',
    type: 'purchased',
    creditAmount: 100,
    creditBalanceAfter: 100,
    unitPriceKurus: LIFEOS_CREDIT_RATE_KURUS,
    totalAmountKurus: 100 * LIFEOS_CREDIT_RATE_KURUS,
    title: 'LifeOS Kredisi Yükleme',
    description: '100 Adet LifeOS Kredisi (Kredi Kartı ile)',
    sourceModule: 'subscription',
    status: 'succeeded',
    originalPaymentMethod: 'Kredi Kartı (**** 4242)',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'CLEDGER-INIT-02',
    userId: 'user_local',
    type: 'promo',
    creditAmount: 50,
    creditBalanceAfter: 150,
    unitPriceKurus: LIFEOS_CREDIT_RATE_KURUS,
    totalAmountKurus: 50 * LIFEOS_CREDIT_RATE_KURUS,
    title: 'Hoş Geldin Promosyon Kredisi',
    description: '50 Adet LifeOS Kullanım Promosyon Kredisi (İade edilemez)',
    sourceModule: 'subscription',
    status: 'succeeded',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];

let REFUND_REQUESTS: CreditRefundRequest[] = [
  {
    id: 'REFUND-REQ-DEMO-01',
    userId: 'usr-student-demo',
    creditAmount: 20,
    refundAmountKurus: 20 * LIFEOS_CREDIT_RATE_KURUS, // 27.00 TL
    unitPriceKurus: LIFEOS_CREDIT_RATE_KURUS,
    originalTransactionId: 'TX-TOPUP-DEMO-99',
    originalPaymentMethod: 'Kredi Kartı (**** 5812)',
    reason: 'Yanlışlıkla fazla kredi yüklendi, hiç kullanılmadı.',
    status: 'pending_review',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

let SERVICE_CREDIT_RULES: ServiceCreditUsageRule[] = [
  {
    module: 'service_taxi',
    nameTr: 'Taksi Hizmeti Platform Kullanım Bedeli',
    creditsRequired: 10, // 10 LifeOS Credits = 13.50 TL per completed trip
    version: 1,
    descriptionTr: 'Yolcu nakit/harici öder. Taksici tamamlanan her müşteri için 10 LifeOS Kredisi harcar.',
    updatedAt: new Date().toISOString(),
  },
  {
    module: 'service_moving',
    nameTr: 'Evden Eve Nakliye Platform Kullanım Bedeli',
    creditsRequired: 50, // 50 LifeOS Credits = 67.50 TL per completed job
    version: 1,
    descriptionTr: 'Nakliye firması tamamlanan taşınma işi başına 50 LifeOS Kredisi harcar.',
    updatedAt: new Date().toISOString(),
  },
  {
    module: 'service_craftsman',
    nameTr: 'Usta / Tamirat Platform Kullanım Bedeli',
    creditsRequired: 25, // 25 LifeOS Credits = 33.75 TL per completed job
    version: 1,
    descriptionTr: 'Usta tamamlanan iş veya başarılı randevu eşleşmesi başına 25 LifeOS Kredisi harcar.',
    updatedAt: new Date().toISOString(),
  },
  {
    module: 'arcade_game',
    nameTr: 'Arcade & Oyun İçi Ürün Bedeli',
    creditsRequired: 5,
    version: 1,
    descriptionTr: 'Oyun içi ek can, tema veya güçlendirme ürünleri.',
    updatedAt: new Date().toISOString(),
  },
];

const PARENTAL_CONTROLS: Record<string, ParentalCreditControl> = {
  user_local: {
    isKidsAccount: false,
    requireParentalApproval: false,
    dailyCreditLimit: 50,
    todayCreditsSpent: 0,
    parentalPin: '1234',
  },
};

let PAYMENT_INTENTS: PaymentIntentDraft[] = [];
const IDEMPOTENCY_STORE = new Map<string, { response: any; timestamp: number }>();

export class PaymentEngine {
  /**
   * Get Active Credit Rate (1 LifeOS Kredisi = 1.35 TL)
   */
  public static getCreditRate(): { kurusPerCredit: number; tlPerCredit: number; label: string } {
    return {
      kurusPerCredit: LIFEOS_CREDIT_RATE_KURUS,
      tlPerCredit: LIFEOS_CREDIT_RATE_TL,
      label: `1 LifeOS Kredisi = ${(LIFEOS_CREDIT_RATE_KURUS / 100).toFixed(2)} TL`,
    };
  }

  /**
   * Get User Wallet
   */
  public static getWallet(userId: string = 'user_local'): WalletAccount {
    if (!WALLETS[userId]) {
      WALLETS[userId] = {
        userId,
        creditBalance: 0,
        purchasedCredits: 0,
        promoCredits: 0,
        spentCredits: 0,
        refundedCredits: 0,
        pendingRefundCredits: 0,
        educationCreditBalance: 0,
        cashBalanceKurus: 0,
        pendingBalanceKurus: 0,
        currency: 'LifeOS Credit',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    // Sync compatibility aliases
    const w = WALLETS[userId];
    w.educationCreditBalance = w.creditBalance;
    w.cashBalanceKurus = 0;
    return w;
  }

  /**
   * Get User Credit Ledger Entries
   */
  public static getLedger(userId: string = 'user_local'): CreditLedgerEntry[] {
    return CREDIT_LEDGER.filter((l) => l.userId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get Refund Requests (Filtered by user or all for admin)
   */
  public static getRefundRequests(userId?: string): CreditRefundRequest[] {
    if (userId) {
      return REFUND_REQUESTS.filter((r) => r.userId === userId).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return [...REFUND_REQUESTS].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get Service Platform Credit Usage Rules
   */
  public static getServiceCreditRules(): ServiceCreditUsageRule[] {
    return [...SERVICE_CREDIT_RULES];
  }

  /**
   * Update Service Credit Usage Rule (Admin)
   */
  public static updateServiceCreditRule(
    module: FinanceSourceModule,
    creditsRequired: number
  ): ServiceCreditUsageRule {
    let rule = SERVICE_CREDIT_RULES.find((r) => r.module === module);
    if (!rule) {
      rule = {
        module,
        nameTr: `${module} Kredi Kuralı`,
        creditsRequired,
        version: 1,
        descriptionTr: 'Platform hizmet kullanım bedeli',
        updatedAt: new Date().toISOString(),
      };
      SERVICE_CREDIT_RULES.push(rule);
    } else {
      rule.creditsRequired = creditsRequired;
      rule.version += 1;
      rule.updatedAt = new Date().toISOString();
    }
    return rule;
  }

  /**
   * Get Parental Control Settings for User
   */
  public static getParentalControl(userId: string = 'user_local'): ParentalCreditControl {
    if (!PARENTAL_CONTROLS[userId]) {
      PARENTAL_CONTROLS[userId] = {
        isKidsAccount: false,
        requireParentalApproval: false,
        dailyCreditLimit: 50,
        todayCreditsSpent: 0,
        parentalPin: '1234',
      };
    }
    return PARENTAL_CONTROLS[userId];
  }

  /**
   * Update Parental Control Settings
   */
  public static updateParentalControl(
    userId: string = 'user_local',
    config: Partial<ParentalCreditControl>
  ): ParentalCreditControl {
    const existing = this.getParentalControl(userId);
    PARENTAL_CONTROLS[userId] = { ...existing, ...config };
    return PARENTAL_CONTROLS[userId];
  }

  /**
   * Purchase LifeOS Credits with TL
   * Rate: 1 LifeOS Kredisi = 1.35 TL
   */
  public static async purchaseCredits(params: {
    userId: string;
    creditCount: number;
    paymentMethod?: PaymentMethodType;
    gatewayReference?: string;
    idempotencyKey?: string;
    description?: string;
  }): Promise<{ success: boolean; error?: string; wallet: WalletAccount; ledgerEntry?: CreditLedgerEntry }> {
    if (params.creditCount <= 0 || !Number.isInteger(params.creditCount)) {
      return { success: false, error: 'Kredi miktarı pozitif bir tam sayı olmalıdır.', wallet: this.getWallet(params.userId) };
    }

    if (params.idempotencyKey && IDEMPOTENCY_STORE.has(params.idempotencyKey)) {
      return IDEMPOTENCY_STORE.get(params.idempotencyKey)!.response;
    }

    const totalKurus = params.creditCount * LIFEOS_CREDIT_RATE_KURUS;

    // Payment Gateway verification check (if gateway_card and no reference provided yet)
    if (params.paymentMethod === 'gateway_card' && !params.gatewayReference) {
      const provider = getPaymentProvider();
      if (provider.getConfig().provider === 'disabled') {
        return {
          success: false,
          error:
            'Kredi kartı altyapısı henüz yapılandırılmadı. Lütfen ödeme sağlayıcı anahtarlarını yapılandırınız veya yetkili ödeme kanalını kullanınız.',
          wallet: this.getWallet(params.userId),
        };
      }
    }

    const wallet = this.getWallet(params.userId);
    wallet.creditBalance += params.creditCount;
    wallet.purchasedCredits += params.creditCount;
    wallet.educationCreditBalance = wallet.creditBalance;
    wallet.updatedAt = new Date().toISOString();

    const ledgerEntry: CreditLedgerEntry = {
      id: `CLEDGER-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      type: 'purchased',
      creditAmount: params.creditCount,
      creditBalanceAfter: wallet.creditBalance,
      unitPriceKurus: LIFEOS_CREDIT_RATE_KURUS,
      totalAmountKurus: totalKurus,
      title: `${params.creditCount} LifeOS Kredisi Satın Alımı`,
      description: params.description || `${params.creditCount} Kredi (${(totalKurus / 100).toFixed(2)} TL) satın alındı.`,
      sourceModule: 'subscription',
      status: 'succeeded',
      gatewayTransactionId: params.gatewayReference,
      originalPaymentMethod: params.paymentMethod === 'gateway_card' ? 'Kredi Kartı' : 'Banka / Kart',
      createdAt: new Date().toISOString(),
    };

    CREDIT_LEDGER.unshift(ledgerEntry);

    const result = { success: true, wallet, ledgerEntry };
    if (params.idempotencyKey) {
      IDEMPOTENCY_STORE.set(params.idempotencyKey, { response: result, timestamp: Date.now() });
    }
    return result;
  }

  /**
   * Top-up Wallet Cash (Backwards compatibility wrapper -> purchases credits or tops up)
   */
  public static topupWalletCash(params: {
    userId: string;
    amountKurus: number;
    idempotencyKey?: string;
    description?: string;
  }): { success: boolean; wallet: WalletAccount; ledgerEntry: CreditLedgerEntry } {
    // Converts kuruş directly into proportional LifeOS Credits
    const credits = Math.floor(params.amountKurus / LIFEOS_CREDIT_RATE_KURUS) || 1;
    const wallet = this.getWallet(params.userId);
    wallet.creditBalance += credits;
    wallet.purchasedCredits += credits;
    wallet.educationCreditBalance = wallet.creditBalance;
    wallet.updatedAt = new Date().toISOString();

    const ledgerEntry: CreditLedgerEntry = {
      id: `CLEDGER-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      type: 'purchased',
      creditAmount: credits,
      creditBalanceAfter: wallet.creditBalance,
      unitPriceKurus: LIFEOS_CREDIT_RATE_KURUS,
      totalAmountKurus: credits * LIFEOS_CREDIT_RATE_KURUS,
      title: 'LifeOS Kredisi Yükleme',
      description: params.description || `${credits} LifeOS Kredisi yüklendi.`,
      sourceModule: 'subscription',
      status: 'succeeded',
      amountKurus: params.amountKurus,
      cashBalanceAfterKurus: 0,
      createdAt: new Date().toISOString(),
    };

    CREDIT_LEDGER.unshift(ledgerEntry);
    return { success: true, wallet, ledgerEntry };
  }

  /**
   * Top-up Education Credits (Backwards compatibility wrapper -> adds to LifeOS Kredisi)
   */
  public static topupEducationCredits(params: {
    userId: string;
    credits: number;
    amountKurus?: number;
    idempotencyKey?: string;
    description?: string;
  }): { success: boolean; wallet: WalletAccount; ledgerEntry: CreditLedgerEntry } {
    const wallet = this.getWallet(params.userId);
    wallet.creditBalance += params.credits;
    wallet.purchasedCredits += params.credits;
    wallet.educationCreditBalance = wallet.creditBalance;
    wallet.updatedAt = new Date().toISOString();

    const ledgerEntry: CreditLedgerEntry = {
      id: `CLEDGER-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      type: 'purchased',
      creditAmount: params.credits,
      creditBalanceAfter: wallet.creditBalance,
      unitPriceKurus: LIFEOS_CREDIT_RATE_KURUS,
      totalAmountKurus: params.credits * LIFEOS_CREDIT_RATE_KURUS,
      title: `${params.credits} LifeOS Kredisi Yükleme`,
      description: params.description || `+${params.credits} LifeOS Kredisi hesaba tanımlandı.`,
      sourceModule: 'subscription',
      status: 'succeeded',
      createdAt: new Date().toISOString(),
    };

    CREDIT_LEDGER.unshift(ledgerEntry);
    return { success: true, wallet, ledgerEntry };
  }

  /**
   * Request Refund for Unused Purchased Credits to Original Payment Method
   */
  public static requestCreditRefund(params: {
    userId: string;
    creditCount: number;
    reason: string;
    originalPaymentMethod?: string;
  }): { success: boolean; message: string; request?: CreditRefundRequest } {
    if (params.creditCount <= 0 || !Number.isInteger(params.creditCount)) {
      return { success: false, message: 'İade edilecek kredi adedi pozitif bir tam sayı olmalıdır.' };
    }

    const wallet = this.getWallet(params.userId);
    const availablePurchasedUnused = Math.max(
      0,
      wallet.purchasedCredits - wallet.spentCredits - wallet.refundedCredits - wallet.pendingRefundCredits
    );

    if (params.creditCount > availablePurchasedUnused) {
      return {
        success: false,
        message: `Yalnızca kullanılmamış ve satın alınmış krediler için iade talebinde bulunabilirsiniz. Harcanmış, promosyon veya bonus krediler iade edilemez. İade edilebilir maksimum kredi: ${availablePurchasedUnused}`,
      };
    }

    // Reserve credits in pendingRefundCredits
    wallet.pendingRefundCredits += params.creditCount;
    wallet.updatedAt = new Date().toISOString();

    const refundRequest: CreditRefundRequest = {
      id: `REFUND-REQ-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      creditAmount: params.creditCount,
      refundAmountKurus: params.creditCount * LIFEOS_CREDIT_RATE_KURUS,
      unitPriceKurus: LIFEOS_CREDIT_RATE_KURUS,
      originalPaymentMethod: params.originalPaymentMethod || 'Orijinal Kredi/Banka Kartı',
      reason: params.reason,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
    };

    REFUND_REQUESTS.unshift(refundRequest);

    return {
      success: true,
      message: 'Kredi iadesi talebiniz incelemeye alındı. Onaylandığında tutar orijinal ödeme yönteminize aktarılacaktır.',
      request: refundRequest,
    };
  }

  /**
   * Admin Approve/Reject Credit Refund Request
   */
  public static adminReviewRefund(params: {
    requestId: string;
    adminId: string;
    action: 'approve' | 'reject';
    decisionNote?: string;
  }): { success: boolean; message: string; request?: CreditRefundRequest } {
    const request = REFUND_REQUESTS.find((r) => r.id === params.requestId);
    if (!request) {
      return { success: false, message: 'İade talebi bulunamadı.' };
    }

    if (request.status !== 'pending_review') {
      return { success: false, message: 'Bu talep daha önce sonuçlandırılmıştır.' };
    }

    const wallet = this.getWallet(request.userId);

    if (params.action === 'approve') {
      wallet.pendingRefundCredits = Math.max(0, wallet.pendingRefundCredits - request.creditAmount);
      wallet.refundedCredits += request.creditAmount;
      wallet.purchasedCredits = Math.max(0, wallet.purchasedCredits - request.creditAmount);
      wallet.creditBalance = Math.max(0, wallet.creditBalance - request.creditAmount);
      wallet.educationCreditBalance = wallet.creditBalance;
      wallet.updatedAt = new Date().toISOString();

      // Atomic Reverse Ledger Entry
      const ledgerEntry: CreditLedgerEntry = {
        id: `CLEDGER-REFUND-${Date.now()}`,
        userId: request.userId,
        type: 'refund',
        creditAmount: -request.creditAmount,
        creditBalanceAfter: wallet.creditBalance,
        unitPriceKurus: request.unitPriceKurus,
        totalAmountKurus: -request.refundAmountKurus,
        title: 'Kredi İadesi (Orijinal Ödeme Yöntemine)',
        description: `${request.creditAmount} Kredi (${(request.refundAmountKurus / 100).toFixed(2)} TL) orijinal ödeme yöntemine iade edildi.`,
        sourceModule: 'adjustment',
        status: 'succeeded',
        originalPaymentMethod: request.originalPaymentMethod,
        auditNote: `Yönetici Onayı: ${params.adminId} - ${params.decisionNote || 'Onaylandı'}`,
        createdAt: new Date().toISOString(),
      };
      CREDIT_LEDGER.unshift(ledgerEntry);

      request.status = 'approved';
      request.adminDecisionNote = params.decisionNote || 'Yönetici tarafından onaylandı ve orijinal ödeme kanalına iade gönderildi.';
      request.reviewedByAdminId = params.adminId;
      request.reviewedAt = new Date().toISOString();

      return { success: true, message: 'İade onaylandı ve cüzdan bakiyesinden atomik olarak düşüldü.', request };
    } else {
      // Rejection: Release reserved pending credits back
      wallet.pendingRefundCredits = Math.max(0, wallet.pendingRefundCredits - request.creditAmount);
      wallet.updatedAt = new Date().toISOString();

      request.status = 'rejected';
      request.rejectionReason = params.decisionNote || 'İade kriterlerini karşılamaması nedeniyle reddedildi.';
      request.reviewedByAdminId = params.adminId;
      request.reviewedAt = new Date().toISOString();

      return { success: true, message: 'İade talebi reddedildi, bloke kredi bakiyesi serbest bırakıldı.', request };
    }
  }

  /**
   * Spend Credits for Taxi / Moving / Craftsman Platform Service Fee
   * Taxi: Passenger pays cash to driver; Driver spends 10 LifeOS Credits to platform per completed trip.
   */
  public static spendCreditsForService(params: {
    providerId: string;
    serviceModule: 'service_taxi' | 'service_moving' | 'service_craftsman';
    referenceId: string;
    referenceTitle: string;
    idempotencyKey?: string;
  }): { success: boolean; error?: string; receipt?: CreditLedgerEntry } {
    if (params.idempotencyKey && IDEMPOTENCY_STORE.has(params.idempotencyKey)) {
      return IDEMPOTENCY_STORE.get(params.idempotencyKey)!.response;
    }

    const rule = SERVICE_CREDIT_RULES.find((r) => r.module === params.serviceModule) || {
      creditsRequired: params.serviceModule === 'service_taxi' ? 10 : 25,
      nameTr: 'Platform Hizmet Kullanım Bedeli',
    };

    const creditsNeeded = rule.creditsRequired;
    const wallet = this.getWallet(params.providerId);

    if (wallet.creditBalance < creditsNeeded) {
      return {
        success: false,
        error: `Yetersiz LifeOS Kredisi. Bu işlemi tamamlamak için ${creditsNeeded} krediniz olmalıdır. Mevcut bakiye: ${wallet.creditBalance} Kredi.`,
      };
    }

    wallet.creditBalance -= creditsNeeded;
    wallet.spentCredits += creditsNeeded;
    wallet.educationCreditBalance = wallet.creditBalance;
    wallet.updatedAt = new Date().toISOString();

    const totalKurus = creditsNeeded * LIFEOS_CREDIT_RATE_KURUS;
    const ledgerEntry: CreditLedgerEntry = {
      id: `CLEDGER-SVC-${Date.now()}`,
      userId: params.providerId,
      type: 'spent',
      creditAmount: -creditsNeeded,
      creditBalanceAfter: wallet.creditBalance,
      unitPriceKurus: LIFEOS_CREDIT_RATE_KURUS,
      totalAmountKurus: -totalKurus,
      title: `${rule.nameTr}`,
      description: `${params.referenceTitle} için platform kullanım bedeli (${creditsNeeded} Kredi)`,
      sourceModule: params.serviceModule,
      referenceId: params.referenceId,
      referenceTitle: params.referenceTitle,
      status: 'succeeded',
      auditNote: 'Yolcu/Müşteri nakit veya harici ödedi; sağlayıcı platform kullanım kredisi harcadı.',
      createdAt: new Date().toISOString(),
    };

    CREDIT_LEDGER.unshift(ledgerEntry);

    const response = { success: true, receipt: ledgerEntry };
    if (params.idempotencyKey) {
      IDEMPOTENCY_STORE.set(params.idempotencyKey, { response, timestamp: Date.now() });
    }
    return response;
  }

  /**
   * Refund/Reverse Service Credit Fee on Cancellation or Dispute
   */
  public static refundServiceCreditFee(params: {
    providerId: string;
    serviceModule: 'service_taxi' | 'service_moving' | 'service_craftsman';
    referenceId: string;
    reason: string;
  }): { success: boolean; message: string; refundedCredits: number } {
    const existingSpend = CREDIT_LEDGER.find(
      (l) => l.userId === params.providerId && l.referenceId === params.referenceId && l.type === 'spent'
    );

    if (!existingSpend) {
      return { success: false, message: 'İptal edilecek servis kredi harcaması bulunamadı.', refundedCredits: 0 };
    }

    const creditsToRefund = Math.abs(existingSpend.creditAmount);
    const wallet = this.getWallet(params.providerId);
    wallet.creditBalance += creditsToRefund;
    wallet.spentCredits = Math.max(0, wallet.spentCredits - creditsToRefund);
    wallet.educationCreditBalance = wallet.creditBalance;
    wallet.updatedAt = new Date().toISOString();

    const ledgerEntry: CreditLedgerEntry = {
      id: `CLEDGER-SVC-REFUND-${Date.now()}`,
      userId: params.providerId,
      type: 'admin_adjustment',
      creditAmount: creditsToRefund,
      creditBalanceAfter: wallet.creditBalance,
      unitPriceKurus: LIFEOS_CREDIT_RATE_KURUS,
      totalAmountKurus: creditsToRefund * LIFEOS_CREDIT_RATE_KURUS,
      title: 'İptal Edilen Yolculuk/Hizmet Kredi İadesi',
      description: `${params.reason} (${creditsToRefund} Kredi iade edildi)`,
      sourceModule: params.serviceModule,
      referenceId: params.referenceId,
      status: 'succeeded',
      createdAt: new Date().toISOString(),
    };

    CREDIT_LEDGER.unshift(ledgerEntry);
    return { success: true, message: `${creditsToRefund} LifeOS Kredisi hesaba iade edildi.`, refundedCredits: creditsToRefund };
  }

  /**
   * Process Arcade Game In-App Purchase with Parental Control Checks
   */
  public static processArcadePurchase(params: {
    userId: string;
    itemId: string;
    itemTitle: string;
    creditsRequired: number;
    parentalPin?: string;
    idempotencyKey?: string;
  }): { success: boolean; error?: string; receipt?: CreditLedgerEntry } {
    if (params.idempotencyKey && IDEMPOTENCY_STORE.has(params.idempotencyKey)) {
      return IDEMPOTENCY_STORE.get(params.idempotencyKey)!.response;
    }

    const parental = this.getParentalControl(params.userId);

    // Check Kids Account Parental Consent
    if (parental.isKidsAccount && parental.requireParentalApproval) {
      if (!params.parentalPin || params.parentalPin !== parental.parentalPin) {
        return { success: false, error: 'Çocuk hesabında oyun içi harcama için geçerli ebeveyn PIN onayı zorunludur.' };
      }

      if (parental.todayCreditsSpent + params.creditsRequired > parental.dailyCreditLimit) {
        return {
          success: false,
          error: `Günlük ebeveyn harcama limiti aşıldı. Günlük limit: ${parental.dailyCreditLimit} Kredi, Kalan: ${Math.max(0, parental.dailyCreditLimit - parental.todayCreditsSpent)} Kredi.`,
        };
      }
    }

    const wallet = this.getWallet(params.userId);
    if (wallet.creditBalance < params.creditsRequired) {
      return { success: false, error: `Yetersiz LifeOS Kredisi. Gerekli: ${params.creditsRequired}, Mevcut: ${wallet.creditBalance}.` };
    }

    wallet.creditBalance -= params.creditsRequired;
    wallet.spentCredits += params.creditsRequired;
    wallet.educationCreditBalance = wallet.creditBalance;
    wallet.updatedAt = new Date().toISOString();

    if (parental.isKidsAccount) {
      parental.todayCreditsSpent += params.creditsRequired;
    }

    const totalKurus = params.creditsRequired * LIFEOS_CREDIT_RATE_KURUS;
    const ledgerEntry: CreditLedgerEntry = {
      id: `CLEDGER-ARCADE-${Date.now()}`,
      userId: params.userId,
      type: 'spent',
      creditAmount: -params.creditsRequired,
      creditBalanceAfter: wallet.creditBalance,
      unitPriceKurus: LIFEOS_CREDIT_RATE_KURUS,
      totalAmountKurus: -totalKurus,
      title: params.itemTitle,
      description: `Arcade oyun içi dijital ürün alımı (${params.creditsRequired} Kredi)`,
      sourceModule: 'arcade_game',
      referenceId: params.itemId,
      referenceTitle: params.itemTitle,
      status: 'succeeded',
      auditNote: 'Oyun içi dijital içerik. Nakde dönüştürülemez ve kullanıcılar arası transfer edilemez.',
      createdAt: new Date().toISOString(),
    };

    CREDIT_LEDGER.unshift(ledgerEntry);

    const response = { success: true, receipt: ledgerEntry };
    if (params.idempotencyKey) {
      IDEMPOTENCY_STORE.set(params.idempotencyKey, { response, timestamp: Date.now() });
    }
    return response;
  }

  /**
   * Create Payment Intent Draft
   */
  public static createPaymentIntent(params: {
    userId: string;
    sourceModule: FinanceSourceModule;
    referenceItemId: string;
    referenceItemTitle: string;
    sellerId?: string;
    sellerName?: string;
    creditsRequired?: number;
    grossAmountKurus?: number;
    discountKurus?: number;
    educationCreditsCost?: number; // Compatibility
    idempotencyKey?: string;
    metadata?: Record<string, unknown>;
  }): PaymentIntentDraft {
    const idKey = params.idempotencyKey || `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const credits = params.creditsRequired || params.educationCreditsCost || Math.ceil((params.grossAmountKurus || 0) / LIFEOS_CREDIT_RATE_KURUS);
    const grossKurus = params.grossAmountKurus || credits * LIFEOS_CREDIT_RATE_KURUS;
    const discount = params.discountKurus || 0;
    const payableAmountKurus = Math.max(0, grossKurus - discount);

    const intent: PaymentIntentDraft = {
      id: `INTENT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      idempotencyKey: idKey,
      userId: params.userId,
      sourceModule: params.sourceModule,
      referenceItemId: params.referenceItemId,
      referenceItemTitle: params.referenceItemTitle,
      sellerId: params.sellerId,
      sellerName: params.sellerName,
      creditsRequired: credits,
      grossAmountKurus: grossKurus,
      discountKurus: discount,
      payableAmountKurus,
      educationCreditsCost: credits,
      paymentMethod: 'lifeos_credits',
      status: 'draft',
      metadata: params.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    PAYMENT_INTENTS.unshift(intent);
    return intent;
  }

  /**
   * Atomic & Idempotent Checkout Process with LifeOS Credits
   */
  public static async processCheckout(params: {
    intentId: string;
    paymentMethod: PaymentMethodType;
    idempotencyKey: string;
    userId?: string;
  }): Promise<{
    success: boolean;
    error?: string;
    receipt?: {
      transactionId: string;
      itemTitle: string;
      creditsPaid: number;
      amountPaidKurus: number;
      paymentMethod: PaymentMethodType;
      paidAt: string;
      newCreditBalance: number;
    };
    redirectUrl?: string;
  }> {
    const userId = params.userId || 'user_local';

    if (params.idempotencyKey && IDEMPOTENCY_STORE.has(params.idempotencyKey)) {
      return IDEMPOTENCY_STORE.get(params.idempotencyKey)!.response;
    }

    const intent = PAYMENT_INTENTS.find((i) => i.id === params.intentId);
    if (!intent) {
      return { success: false, error: 'Ödeme taslağı bulunamadı veya süresi doldu.' };
    }

    if (intent.status === 'succeeded') {
      return { success: false, error: 'Bu işlem daha önce başarıyla tamamlanmıştır.' };
    }

    // Provider / Instructor cannot buy their own item
    if (intent.sellerId && intent.sellerId === userId) {
      return { success: false, error: 'Eğitmen veya hizmet sağlayıcı kendi içerik veya hizmetini satın alamaz.' };
    }

    const creditsNeeded = intent.creditsRequired;
    const wallet = this.getWallet(userId);

    if (wallet.creditBalance < creditsNeeded) {
      return {
        success: false,
        error: `Yetersiz LifeOS Kredisi! Gerekli: ${creditsNeeded} Kredi, Cüzdanınızdaki: ${wallet.creditBalance} Kredi. Lütfen kredi yükleyiniz.`,
      };
    }

    // Atomic credit deduction
    wallet.creditBalance -= creditsNeeded;
    wallet.spentCredits += creditsNeeded;
    wallet.educationCreditBalance = wallet.creditBalance;
    wallet.updatedAt = new Date().toISOString();

    const txId = `TX-LIFEOS-${Date.now()}`;
    const ledgerEntry: CreditLedgerEntry = {
      id: `CLEDGER-${Date.now()}`,
      userId,
      type: 'spent',
      creditAmount: -creditsNeeded,
      creditBalanceAfter: wallet.creditBalance,
      unitPriceKurus: LIFEOS_CREDIT_RATE_KURUS,
      totalAmountKurus: -(creditsNeeded * LIFEOS_CREDIT_RATE_KURUS),
      title: intent.referenceItemTitle,
      description: `LifeOS Kredisi ile satın alma (${creditsNeeded} Kredi)`,
      referenceId: intent.referenceItemId,
      referenceTitle: intent.referenceItemTitle,
      sourceModule: intent.sourceModule,
      status: 'succeeded',
      createdAt: new Date().toISOString(),
    };
    CREDIT_LEDGER.unshift(ledgerEntry);

    intent.status = 'succeeded';
    intent.paymentMethod = 'lifeos_credits';
    intent.updatedAt = new Date().toISOString();

    // Ingest into FinanceRegistry for instructor / provider earnings in TL
    if (intent.sellerId) {
      FinanceRegistry.ingestPaymentWebhook({
        idempotencyKey: params.idempotencyKey,
        sourceModule: intent.sourceModule,
        grossAmountKurus: creditsNeeded * LIFEOS_CREDIT_RATE_KURUS,
        sellerId: intent.sellerId,
        sellerName: intent.sellerName,
        buyerMaskedId: `${userId.slice(0, 3)}***${userId.slice(-1)}`,
        buyerName: 'Öğrenci / Müşteri (LifeOS Kredisi)',
        referenceItemId: intent.referenceItemId,
        referenceItemTitle: intent.referenceItemTitle,
      });
    }

    const response = {
      success: true,
      receipt: {
        transactionId: txId,
        itemTitle: intent.referenceItemTitle,
        creditsPaid: creditsNeeded,
        amountPaidKurus: creditsNeeded * LIFEOS_CREDIT_RATE_KURUS,
        paymentMethod: 'lifeos_credits' as PaymentMethodType,
        paidAt: new Date().toISOString(),
        newCreditBalance: wallet.creditBalance,
      },
    };

    IDEMPOTENCY_STORE.set(params.idempotencyKey, { response, timestamp: Date.now() });
    return response;
  }

  /**
   * Refund Transaction & Restore Credit Balance (e.g. cancelled live session)
   */
  public static refundTransaction(params: {
    transactionId: string;
    reason: string;
    adminId?: string;
  }): { success: boolean; message: string; refundedCredits?: number } {
    const ledgerItem = CREDIT_LEDGER.find(
      (l) => (l.id === params.transactionId || l.referenceId === params.transactionId) && l.type === 'spent'
    );

    if (!ledgerItem) {
      return { success: false, message: 'İade edilecek kredi harcaması bulunamadı.' };
    }

    if (ledgerItem.status === 'refunded') {
      return { success: false, message: 'Bu işlem daha önce iade edilmiştir.' };
    }

    const wallet = this.getWallet(ledgerItem.userId);
    const creditsToRestore = Math.abs(ledgerItem.creditAmount);

    wallet.creditBalance += creditsToRestore;
    wallet.spentCredits = Math.max(0, wallet.spentCredits - creditsToRestore);
    wallet.educationCreditBalance = wallet.creditBalance;
    wallet.updatedAt = new Date().toISOString();

    const reverseEntry: CreditLedgerEntry = {
      id: `CLEDGER-REV-${Date.now()}`,
      userId: ledgerItem.userId,
      type: 'admin_adjustment',
      creditAmount: creditsToRestore,
      creditBalanceAfter: wallet.creditBalance,
      unitPriceKurus: ledgerItem.unitPriceKurus,
      totalAmountKurus: creditsToRestore * ledgerItem.unitPriceKurus,
      title: `İptal & İade: ${ledgerItem.title}`,
      description: `${params.reason} (+${creditsToRestore} Kredi iade edildi)`,
      referenceId: ledgerItem.referenceId,
      referenceTitle: ledgerItem.referenceTitle,
      sourceModule: ledgerItem.sourceModule,
      status: 'succeeded',
      auditNote: `Ters kayıt ile kredi iadesi yapıldı. Orijinal İşlem: ${ledgerItem.id}`,
      createdAt: new Date().toISOString(),
    };

    CREDIT_LEDGER.unshift(reverseEntry);
    ledgerItem.status = 'refunded';

    return {
      success: true,
      message: 'Ders/Hizmet iptali nedeniyle krediler hesaba iade edildi.',
      refundedCredits: creditsToRestore,
    };
  }

  /**
   * Provider / Instructor Earnings Dashboard
   */
  public static getProviderEarnings(providerId: string): ProviderEarningsSummary {
    const allTxs = FinanceRegistry.listTransactions();
    const providerTxs = allTxs.filter((t) => t.sellerId === providerId);

    let totalGrossKurus = 0;
    let platformCommissionKurus = 0;
    let pendingPayoutKurus = 0;
    let paidKurus = 0;
    let readyToPayKurus = 0;
    let refundsAndDeductionsKurus = 0;

    for (const tx of providerTxs) {
      if (tx.status === 'succeeded') {
        totalGrossKurus += tx.grossAmountKurus;
        platformCommissionKurus += tx.platformCommissionKurus;
        readyToPayKurus += tx.sellerNetKurus;
      } else if (tx.status === 'refunded' || tx.status === 'partially_refunded') {
        refundsAndDeductionsKurus += Math.abs(tx.sellerNetKurus);
      }
    }

    const payouts = FinanceRegistry.listPayouts().filter((p) => p.recipientId === providerId);
    for (const po of payouts) {
      if (po.status === 'paid' || po.status === 'reconciled') {
        paidKurus += po.netPayoutKurus;
      } else {
        pendingPayoutKurus += po.netPayoutKurus;
      }
    }

    const recentTransactions = providerTxs.map((t) => ({
      id: t.id,
      date: t.timestamp,
      itemTitle: t.referenceItemTitle,
      customerMaskedId: t.buyerMaskedId,
      grossKurus: t.grossAmountKurus,
      commissionKurus: t.platformCommissionKurus,
      netEarningsKurus: t.sellerNetKurus,
      status: t.status,
    }));

    return {
      providerId,
      providerName: providerTxs[0]?.sellerName || 'Doğrulanmış Sağlayıcı',
      providerType: providerId.includes('instructor') ? 'instructor' : 'provider',
      totalGrossKurus,
      platformCommissionKurus,
      pendingPayoutKurus,
      readyToPayKurus,
      paidKurus,
      refundsAndDeductionsKurus,
      recentTransactions,
    };
  }

  /**
   * Comprehensive Credit Overview Metrics for Admin & Finance
   */
  public static getCreditOverviewMetrics(timeFilter: TimeFilterOption = 'this_month'): CreditOverviewMetrics {
    let totalSoldCredits = 0;
    let totalSpentCredits = 0;
    let totalPromoCredits = 0;
    let totalRefundedCredits = 0;

    for (const entry of CREDIT_LEDGER) {
      if (entry.status === 'succeeded') {
        if (entry.type === 'purchased') {
          totalSoldCredits += entry.creditAmount;
        } else if (entry.type === 'promo') {
          totalPromoCredits += entry.creditAmount;
        } else if (entry.type === 'spent') {
          totalSpentCredits += Math.abs(entry.creditAmount);
        } else if (entry.type === 'refund') {
          totalRefundedCredits += Math.abs(entry.creditAmount);
        }
      }
    }

    let totalActiveUserCredits = 0;
    let totalPendingRefundCredits = 0;
    for (const w of Object.values(WALLETS)) {
      totalActiveUserCredits += w.creditBalance;
      totalPendingRefundCredits += w.pendingRefundCredits;
    }

    // Unearned Credit Liability (Kullanılmamış Kredi Yükümlülüğü):
    // Unused purchased credits that the platform still holds as service liability
    const unearnedPurchasedCredits = Math.max(0, totalSoldCredits - totalSpentCredits - totalRefundedCredits);
    const unearnedCreditLiabilityKurus = unearnedPurchasedCredits * LIFEOS_CREDIT_RATE_KURUS;

    const moduleCounts: Record<string, { credits: number; count: number; label: string }> = {
      education_live: { credits: 0, count: 0, label: 'Canlı Dersler' },
      education_course: { credits: 0, count: 0, label: 'Kurs Kayıtları' },
      education_book: { credits: 0, count: 0, label: 'Kitap & Dijital İçerik' },
      service_taxi: { credits: 0, count: 0, label: 'Taksi Platform Kullanımı' },
      service_moving: { credits: 0, count: 0, label: 'Nakliye Hizmetleri' },
      service_craftsman: { credits: 0, count: 0, label: 'Usta Hizmetleri' },
      arcade_game: { credits: 0, count: 0, label: 'Arcade & Oyunlar' },
      subscription: { credits: 0, count: 0, label: 'Üyelik & Kredi Paketleri' },
    };

    for (const entry of CREDIT_LEDGER) {
      if (entry.type === 'spent' && entry.sourceModule && moduleCounts[entry.sourceModule]) {
        moduleCounts[entry.sourceModule].credits += Math.abs(entry.creditAmount);
        moduleCounts[entry.sourceModule].count += 1;
      }
    }

    const moduleBreakdown = Object.entries(moduleCounts).map(([mod, data]) => ({
      module: mod as FinanceSourceModule,
      labelTr: data.label,
      creditsSpent: data.credits,
      transactionsCount: data.count,
    }));

    return {
      totalSoldCredits,
      totalSoldKurus: totalSoldCredits * LIFEOS_CREDIT_RATE_KURUS,
      totalActiveUserCredits,
      totalSpentCredits,
      totalPromoCredits,
      totalPendingRefundCredits,
      totalRefundedCredits,
      totalRefundedKurus: totalRefundedCredits * LIFEOS_CREDIT_RATE_KURUS,
      unearnedCreditLiabilityKurus,
      moduleBreakdown,
    };
  }
}
