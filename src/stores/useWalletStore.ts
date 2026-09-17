import { create } from 'zustand';
import type {
  WalletAccount,
  CreditLedgerEntry,
  CreditRefundRequest,
  ServiceCreditUsageRule,
  ParentalCreditControl,
} from '@/types/payment';

interface WalletState {
  wallet: WalletAccount | null;
  ledger: CreditLedgerEntry[];
  refundRequests: CreditRefundRequest[];
  creditRate: { kurusPerCredit: number; tlPerCredit: number; label: string };
  serviceRules: ServiceCreditUsageRule[];
  parental: ParentalCreditControl | null;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;

  fetchWallet: (userId?: string) => Promise<void>;
  purchaseCredits: (
    creditCount: number,
    paymentMethod?: string,
    description?: string
  ) => Promise<{ success: boolean; message?: string }>;
  requestRefund: (
    creditCount: number,
    reason: string,
    originalPaymentMethod?: string
  ) => Promise<{ success: boolean; message?: string }>;
  // Compatibility methods
  topupCash: (amountKurus: number, description?: string) => Promise<{ success: boolean; message?: string }>;
  topupCredits: (credits: number, description?: string) => Promise<{ success: boolean; message?: string }>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  ledger: [],
  refundRequests: [],
  creditRate: { kurusPerCredit: 135, tlPerCredit: 1.35, label: '1 LifeOS Kredisi = 1,35 TL' },
  serviceRules: [],
  parental: null,
  isLoading: false,
  isActionLoading: false,
  error: null,

  fetchWallet: async (userId = 'user_local') => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/wallet?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        set({
          wallet: data.wallet,
          ledger: data.ledger || [],
          refundRequests: data.refundRequests || [],
          creditRate: data.creditRate || { kurusPerCredit: 135, tlPerCredit: 1.35, label: '1 LifeOS Kredisi = 1,35 TL' },
          serviceRules: data.serviceRules || [],
          parental: data.parental || null,
          isLoading: false,
        });
      } else {
        set({ error: data.error || 'Cüzdan yüklenemedi.', isLoading: false });
      }
    } catch {
      set({ error: 'Sunucuya bağlanılamadı.', isLoading: false });
    }
  },

  purchaseCredits: async (creditCount: number, paymentMethod = 'gateway_card', description?: string) => {
    set({ isActionLoading: true });
    try {
      const idempotencyKey = `buy_cred_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'purchase_credits',
          creditCount,
          paymentMethod,
          idempotencyKey,
          description,
        }),
      });
      const data = await res.json();
      set({ isActionLoading: false });
      if (data.success) {
        await get().fetchWallet();
        return { success: true, message: `${creditCount} LifeOS Kredisi hesabınıza başarıyla tanımlandı.` };
      }
      return { success: false, message: data.error || 'Kredi satın alınamadı.' };
    } catch {
      set({ isActionLoading: false });
      return { success: false, message: 'Sunucuya bağlanılamadı.' };
    }
  },

  requestRefund: async (creditCount: number, reason: string, originalPaymentMethod?: string) => {
    set({ isActionLoading: true });
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_refund',
          creditCount,
          reason,
          originalPaymentMethod,
        }),
      });
      const data = await res.json();
      set({ isActionLoading: false });
      if (data.success) {
        await get().fetchWallet();
        return { success: true, message: data.message || 'İade talebiniz başarıyla oluşturuldu.' };
      }
      return { success: false, message: data.message || data.error || 'İade talebi oluşturulamadı.' };
    } catch {
      set({ isActionLoading: false });
      return { success: false, message: 'Sunucuya bağlanılamadı.' };
    }
  },

  topupCash: async (amountKurus: number, description?: string) => {
    const credits = Math.floor(amountKurus / 135) || 10;
    return get().purchaseCredits(credits, 'gateway_card', description);
  },

  topupCredits: async (credits: number, description?: string) => {
    return get().purchaseCredits(credits, 'gateway_card', description);
  },
}));
