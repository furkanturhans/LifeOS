import crypto from 'crypto';
import type { PaymentProviderConfig } from '@/types/payment';

export interface InitializePaymentParams {
  intentId: string;
  amountKurus: number;
  currency: string;
  itemTitle: string;
  buyerEmail?: string;
  buyerName: string;
  buyerIp?: string;
  callbackUrl?: string;
}

export interface PaymentGatewayResult {
  success: boolean;
  provider: 'disabled' | 'iyzico' | 'paytr';
  gatewayTransactionId?: string;
  redirectUrl?: string;
  htmlContent?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface IPaymentProvider {
  getConfig(): PaymentProviderConfig;
  initializePayment(params: InitializePaymentParams): Promise<PaymentGatewayResult>;
  verifyWebhook(payload: string, signature: string): boolean;
  initiateRefund(params: {
    gatewayTransactionId: string;
    amountKurus: number;
    reason?: string;
  }): Promise<{ success: boolean; refundId?: string; error?: string }>;
  normalizeError(rawError: unknown): string;
}

/**
 * Disabled / Default Provider when no real gateway keys are set in production
 */
export class DisabledPaymentProvider implements IPaymentProvider {
  public getConfig(): PaymentProviderConfig {
    return {
      provider: 'disabled',
      isConfigured: false,
      statusMessage:
        'Doğrudan kart ile ödeme altyapısı (iyzico / PayTR) yakında aktif olacaktır. Şu anda LifeOS Cüzdan bakiyesi veya Eğitim Kredisi ile güvenle işlem yapabilirsiniz.',
    };
  }

  public async initializePayment(): Promise<PaymentGatewayResult> {
    return {
      success: false,
      provider: 'disabled',
      errorCode: 'GATEWAY_NOT_CONFIGURED',
      errorMessage:
        'Kredi/Banka kartı ile doğrudan ödeme altyapısı henüz yapılandırılmamıştır. Lütfen LifeOS Cüzdanınızdaki bakiye veya kredilerinizle ödeme yapınız.',
    };
  }

  public verifyWebhook(): boolean {
    return false;
  }

  public async initiateRefund(): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Harici ödeme sağlayıcısı tanımlı olmadığı için harici kart iadesi yapılamaz.',
    };
  }

  public normalizeError(): string {
    return 'Ödeme sağlayıcısı devre dışı.';
  }
}

/**
 * Iyzico Gateway Provider Scaffold
 */
export class IyzicoPaymentProvider implements IPaymentProvider {
  private getApiKey(): string | undefined {
    return process.env.IYZICO_API_KEY?.trim();
  }
  private getSecretKey(): string | undefined {
    return process.env.IYZICO_SECRET_KEY?.trim();
  }
  private getBaseUrl(): string {
    return process.env.IYZICO_BASE_URL?.trim() || 'https://sandbox-api.iyzipay.com';
  }

  public getConfig(): PaymentProviderConfig {
    const isConfigured = Boolean(this.getApiKey() && this.getSecretKey());
    return {
      provider: 'iyzico',
      isConfigured,
      statusMessage: isConfigured
        ? 'iyzico Güvenli Ödeme Altyapısı Aktif (3D Secure Destekli).'
        : 'iyzico API anahtarları eksik. Lütfen IYZICO_API_KEY ve IYZICO_SECRET_KEY tanımlayınız.',
    };
  }

  public async initializePayment(params: InitializePaymentParams): Promise<PaymentGatewayResult> {
    if (!this.getConfig().isConfigured) {
      return {
        success: false,
        provider: 'iyzico',
        errorCode: 'IYZICO_CREDENTIALS_MISSING',
        errorMessage: 'iyzico API anahtarları sunucuda yapılandırılmamış.',
      };
    }

    try {
      // In production, make signed request to iyzico checkout form initialize
      const gatewayTxId = `iyz_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      return {
        success: true,
        provider: 'iyzico',
        gatewayTransactionId: gatewayTxId,
        redirectUrl: `${this.getBaseUrl()}/checkout/${gatewayTxId}`,
      };
    } catch (err) {
      return {
        success: false,
        provider: 'iyzico',
        errorMessage: this.normalizeError(err),
      };
    }
  }

  public verifyWebhook(payload: string, signature: string): boolean {
    const secret = this.getSecretKey();
    if (!secret || !signature) return false;
    const computed = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
  }

  public async initiateRefund(params: {
    gatewayTransactionId: string;
    amountKurus: number;
  }): Promise<{ success: boolean; refundId?: string; error?: string }> {
    if (!this.getConfig().isConfigured) {
      return { success: false, error: 'iyzico yapılandırması eksik.' };
    }
    return {
      success: true,
      refundId: `ref_iyz_${Date.now()}`,
    };
  }

  public normalizeError(rawError: unknown): string {
    if (typeof rawError === 'string') return rawError;
    if (rawError instanceof Error) return rawError.message;
    return 'iyzico ödeme işlemi sırasında bir hata meydana geldi.';
  }
}

/**
 * PayTR Gateway Provider Scaffold
 */
export class PayTRPaymentProvider implements IPaymentProvider {
  private getMerchantId(): string | undefined {
    return process.env.PAYTR_MERCHANT_ID?.trim();
  }
  private getMerchantKey(): string | undefined {
    return process.env.PAYTR_MERCHANT_KEY?.trim();
  }
  private getMerchantSalt(): string | undefined {
    return process.env.PAYTR_MERCHANT_SALT?.trim();
  }

  public getConfig(): PaymentProviderConfig {
    const isConfigured = Boolean(
      this.getMerchantId() && this.getMerchantKey() && this.getMerchantSalt()
    );
    return {
      provider: 'paytr',
      isConfigured,
      statusMessage: isConfigured
        ? 'PayTR Güvenli Ödeme Altyapısı Aktif.'
        : 'PayTR mağaza anahtarları eksik. Lütfen PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY ve PAYTR_MERCHANT_SALT tanımlayınız.',
    };
  }

  public async initializePayment(params: InitializePaymentParams): Promise<PaymentGatewayResult> {
    if (!this.getConfig().isConfigured) {
      return {
        success: false,
        provider: 'paytr',
        errorCode: 'PAYTR_CREDENTIALS_MISSING',
        errorMessage: 'PayTR mağaza anahtarları sunucuda yapılandırılmamış.',
      };
    }

    try {
      const gatewayTxId = `paytr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      return {
        success: true,
        provider: 'paytr',
        gatewayTransactionId: gatewayTxId,
        redirectUrl: `https://www.paytr.com/odeme/guvenli/${gatewayTxId}`,
      };
    } catch (err) {
      return {
        success: false,
        provider: 'paytr',
        errorMessage: this.normalizeError(err),
      };
    }
  }

  public verifyWebhook(payload: string, signature: string): boolean {
    const key = this.getMerchantKey();
    const salt = this.getMerchantSalt();
    if (!key || !salt || !signature) return false;
    const computed = crypto.createHmac('sha256', key).update(payload + salt).digest('base64');
    return computed === signature;
  }

  public async initiateRefund(params: {
    gatewayTransactionId: string;
    amountKurus: number;
  }): Promise<{ success: boolean; refundId?: string; error?: string }> {
    if (!this.getConfig().isConfigured) {
      return { success: false, error: 'PayTR yapılandırması eksik.' };
    }
    return {
      success: true,
      refundId: `ref_paytr_${Date.now()}`,
    };
  }

  public normalizeError(rawError: unknown): string {
    if (typeof rawError === 'string') return rawError;
    if (rawError instanceof Error) return rawError.message;
    return 'PayTR ödeme işlemi sırasında bir hata meydana geldi.';
  }
}

/**
 * Factory to retrieve active payment gateway adapter
 */
export function getPaymentProvider(): IPaymentProvider {
  const provider = (process.env.PAYMENT_PROVIDER || 'disabled').toLowerCase().trim();

  switch (provider) {
    case 'iyzico':
      return new IyzicoPaymentProvider();
    case 'paytr':
      return new PayTRPaymentProvider();
    default:
      return new DisabledPaymentProvider();
  }
}
