import { create } from 'zustand';
import type { PaymentIntentDraft, PaymentMethodType } from '@/types/payment';
import type { FinanceSourceModule } from '@/types/finance';
import { useWalletStore } from './useWalletStore';

export interface CheckoutItemConfig {
  sourceModule: FinanceSourceModule;
  referenceItemId: string;
  referenceItemTitle: string;
  sellerId?: string;
  sellerName?: string;
  grossAmountKurus: number;
  discountKurus?: number;
  educationCreditsCost?: number;
  metadata?: Record<string, unknown>;
  onSuccess?: () => void;
}

interface CheckoutState {
  isOpen: boolean;
  intent: PaymentIntentDraft | null;
  selectedPaymentMethod: PaymentMethodType;
  isCreatingIntent: boolean;
  isProcessing: boolean;
  error: string | null;
  receipt: {
    transactionId: string;
    itemTitle: string;
    amountPaidKurus: number;
    creditsPaid?: number;
    paymentMethod: PaymentMethodType;
    paidAt: string;
    newCashBalanceKurus: number;
    newCreditBalance: number;
  } | null;
  onSuccessCallback?: () => void;

  openCheckout: (config: CheckoutItemConfig) => Promise<void>;
  closeCheckout: () => void;
  setSelectedPaymentMethod: (method: PaymentMethodType) => void;
  processPayment: () => Promise<boolean>;
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  isOpen: false,
  intent: null,
  selectedPaymentMethod: 'wallet_cash',
  isCreatingIntent: false,
  isProcessing: false,
  error: null,
  receipt: null,
  onSuccessCallback: undefined,

  openCheckout: async (config: CheckoutItemConfig) => {
    // Refresh user wallet immediately
    useWalletStore.getState().fetchWallet();

    set({
      isOpen: true,
      intent: null,
      error: null,
      receipt: null,
      isCreatingIntent: true,
      selectedPaymentMethod: config.educationCreditsCost ? 'education_credits' : 'wallet_cash',
      onSuccessCallback: config.onSuccess,
    });

    try {
      const idempotencyKey = `intent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const res = await fetch('/api/payment/checkout/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.intent) {
        set({
          intent: data.intent,
          isCreatingIntent: false,
          selectedPaymentMethod: config.educationCreditsCost ? 'education_credits' : 'wallet_cash',
        });
      } else {
        set({
          error: data.error || 'Ödeme taslağı oluşturulamadı.',
          isCreatingIntent: false,
        });
      }
    } catch {
      set({
        error: 'Sunucuya bağlanılamadı.',
        isCreatingIntent: false,
      });
    }
  },

  closeCheckout: () => {
    set({
      isOpen: false,
      intent: null,
      error: null,
      receipt: null,
      isProcessing: false,
      onSuccessCallback: undefined,
    });
  },

  setSelectedPaymentMethod: (selectedPaymentMethod) => set({ selectedPaymentMethod }),

  processPayment: async () => {
    const { intent, selectedPaymentMethod, onSuccessCallback } = get();
    if (!intent) return false;

    set({ isProcessing: true, error: null });

    try {
      const idempotencyKey = `pay_${intent.id}_${selectedPaymentMethod}`;
      const res = await fetch('/api/payment/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intentId: intent.id,
          paymentMethod: selectedPaymentMethod,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      set({ isProcessing: false });

      if (data.success && data.receipt) {
        set({ receipt: data.receipt });
        // Refresh local wallet immediately
        useWalletStore.getState().fetchWallet();

        if (onSuccessCallback) {
          onSuccessCallback();
        }
        return true;
      } else if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return true;
      } else {
        set({ error: data.error || 'Ödeme tamamlanamadı.' });
        return false;
      }
    } catch {
      set({
        isProcessing: false,
        error: 'Sunucuyla iletişim kurulamadı.',
      });
      return false;
    }
  },
}));
