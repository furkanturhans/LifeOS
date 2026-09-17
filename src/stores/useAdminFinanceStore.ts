import { create } from 'zustand';
import type {
  FinanceTabKey,
  TimeFilterOption,
  FinanceSourceModule,
  TransactionStatus,
  FinancialTransaction,
  CommissionRule,
  PayoutRecord,
  FinanceOverviewMetrics,
  SubscriptionMetricsSummary,
  DigitalProductSalesSummary,
  PayoutStatus,
} from '@/types/finance';

interface AdminFinanceState {
  // Navigation
  activeFinanceTab: FinanceTabKey;
  setActiveFinanceTab: (tab: FinanceTabKey) => void;

  // Time Filter
  timeFilter: TimeFilterOption;
  setTimeFilter: (filter: TimeFilterOption) => void;

  // Transaction Filters
  sourceFilter: FinanceSourceModule | 'all';
  statusFilter: TransactionStatus | 'all';
  searchQuery: string;
  setSourceFilter: (source: FinanceSourceModule | 'all') => void;
  setStatusFilter: (status: TransactionStatus | 'all') => void;
  setSearchQuery: (query: string) => void;

  // Data
  metrics: FinanceOverviewMetrics | null;
  transactions: FinancialTransaction[];
  selectedTransaction: FinancialTransaction | null;
  commissionRules: CommissionRule[];
  payouts: PayoutRecord[];
  subscriptionMetrics: SubscriptionMetricsSummary | null;
  digitalProducts: DigitalProductSalesSummary[];

  // Loading & Action State
  isLoading: boolean;
  isUpdatingPayout: boolean;
  error: string | null;

  // Actions
  setSelectedTransaction: (tx: FinancialTransaction | null) => void;
  fetchOverview: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchPayouts: (recipientType?: 'instructor' | 'provider') => Promise<void>;
  fetchCommissions: () => Promise<void>;
  updatePayoutStatus: (params: {
    payoutId: string;
    newStatus: PayoutStatus;
    paymentReference?: string;
    adminNotes?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  downloadCsvExport: () => void;
}

export const useAdminFinanceStore = create<AdminFinanceState>((set, get) => ({
  activeFinanceTab: 'overview',
  setActiveFinanceTab: (activeFinanceTab) => set({ activeFinanceTab }),

  timeFilter: 'this_month',
  setTimeFilter: (timeFilter) => {
    set({ timeFilter });
    get().fetchOverview();
    get().fetchTransactions();
  },

  sourceFilter: 'all',
  statusFilter: 'all',
  searchQuery: '',

  setSourceFilter: (sourceFilter) => {
    set({ sourceFilter });
    get().fetchTransactions();
  },

  setStatusFilter: (statusFilter) => {
    set({ statusFilter });
    get().fetchTransactions();
  },

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().fetchTransactions();
  },

  metrics: null,
  transactions: [],
  selectedTransaction: null,
  commissionRules: [],
  payouts: [],
  subscriptionMetrics: null,
  digitalProducts: [],

  isLoading: false,
  isUpdatingPayout: false,
  error: null,

  setSelectedTransaction: (selectedTransaction) => set({ selectedTransaction }),

  fetchOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const { timeFilter } = get();
      const res = await fetch(`/api/admin/finance/overview?timeFilter=${timeFilter}`);
      const data = await res.json();
      if (data.success) {
        set({
          metrics: data.metrics,
          subscriptionMetrics: data.subscriptionMetrics,
          digitalProducts: data.digitalProducts,
          isLoading: false,
        });
      } else {
        set({ error: data.error || 'Finans verileri yüklenemedi.', isLoading: false });
      }
    } catch {
      set({ error: 'Sunucu bağlantısı kurulamadı.', isLoading: false });
    }
  },

  fetchTransactions: async () => {
    try {
      const { timeFilter, sourceFilter, statusFilter, searchQuery } = get();
      const params = new URLSearchParams();
      if (timeFilter) params.set('timeFilter', timeFilter);
      if (sourceFilter !== 'all') params.set('sourceModule', sourceFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/finance/transactions?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        set({ transactions: data.transactions });
      }
    } catch {}
  },

  fetchPayouts: async (recipientType) => {
    try {
      const url = recipientType
        ? `/api/admin/finance/payouts?recipientType=${recipientType}`
        : '/api/admin/finance/payouts';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.payouts)) {
        set({ payouts: data.payouts });
      }
    } catch {}
  },

  fetchCommissions: async () => {
    try {
      const res = await fetch('/api/admin/finance/commissions');
      const data = await res.json();
      if (data.success && Array.isArray(data.commissionRules)) {
        set({ commissionRules: data.commissionRules });
      }
    } catch {}
  },

  updatePayoutStatus: async (params) => {
    set({ isUpdatingPayout: true });
    try {
      const res = await fetch('/api/admin/finance/payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      set({ isUpdatingPayout: false });
      if (data.success) {
        await get().fetchPayouts();
        await get().fetchOverview();
        return { success: true, message: 'Hakediş durumu başarıyla güncellendi.' };
      }
      return { success: false, message: data.error || 'İşlem başarısız oldu.' };
    } catch {
      set({ isUpdatingPayout: false });
      return { success: false, message: 'Sunucuya bağlanılamadı.' };
    }
  },

  downloadCsvExport: () => {
    const { timeFilter } = get();
    const url = `/api/admin/finance/reports?format=csv&timeFilter=${timeFilter}`;
    window.open(url, '_blank');
  },
}));
