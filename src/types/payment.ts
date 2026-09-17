import type { FinanceSourceModule, TransactionStatus } from './finance';

export const LIFEOS_CREDIT_RATE_KURUS = 135; // 1 LifeOS Kredisi = 1.35 TL = 135 Kuruş
export const LIFEOS_CREDIT_RATE_TL = 1.35;

export type CreditTransactionType =
  | 'purchased'
  | 'promo'
  | 'spent'
  | 'refund'
  | 'admin_adjustment';

export type PaymentMethodType =
  | 'lifeos_credits'
  | 'gateway_card'
  | 'bank_transfer'
  | 'wallet_cash' // Backwards-compatible alias
  | 'education_credits'; // Backwards-compatible alias

export type PaymentIntentStatus =
  | 'draft'
  | 'awaiting_payment'
  | 'payment_initiated'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refund_pending'
  | 'refunded'
  | 'partially_refunded'
  | 'awaiting_reconciliation';

export interface WalletAccount {
  userId: string;
  creditBalance: number; // Integer LifeOS Credits currently available
  purchasedCredits: number; // Total credits bought with TL
  promoCredits: number; // Non-refundable promotional/bonus credits
  spentCredits: number; // Total credits spent
  refundedCredits: number; // Total credits refunded to original payment method
  pendingRefundCredits: number; // Credits currently reserved under refund review
  // Backwards compatibility aliases:
  educationCreditBalance: number;
  cashBalanceKurus: number;
  pendingBalanceKurus: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditLedgerEntry {
  id: string;
  userId: string;
  type: CreditTransactionType;
  creditAmount: number; // Positive for additions (purchase/promo), negative for spend/refund
  creditBalanceAfter: number;
  unitPriceKurus: number; // Price per credit at transaction time (e.g. 135)
  totalAmountKurus: number; // Total TL equivalent in kuruş
  title: string;
  description: string;
  sourceModule: FinanceSourceModule;
  referenceId?: string;
  referenceTitle?: string;
  status: 'succeeded' | 'pending' | 'refunded' | 'cancelled';
  gatewayTransactionId?: string;
  originalPaymentMethod?: string;
  auditNote?: string;
  createdAt: string;
  // Compatibility fields
  amountKurus?: number;
  cashBalanceAfterKurus?: number;
}

// Backwards-compatible alias for existing code
export type WalletLedgerEntry = CreditLedgerEntry;

export interface CreditRefundRequest {
  id: string;
  userId: string;
  creditAmount: number; // Unused purchased credits requested for refund
  refundAmountKurus: number; // Total TL in kuruş (creditAmount * 135)
  unitPriceKurus: number;
  originalTransactionId?: string;
  originalPaymentMethod: string; // e.g. 'card_ending_4242'
  reason: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'processed';
  rejectionReason?: string;
  adminDecisionNote?: string;
  reviewedByAdminId?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ServiceCreditUsageRule {
  module: FinanceSourceModule;
  nameTr: string;
  creditsRequired: number; // e.g. Taxi: 10, Moving: 50, Craftsman: 25
  version: number;
  descriptionTr: string;
  updatedAt: string;
}

export interface ParentalCreditControl {
  isKidsAccount: boolean;
  requireParentalApproval: boolean;
  dailyCreditLimit: number;
  todayCreditsSpent: number;
  parentalPin: string;
}

export interface CreditOverviewMetrics {
  totalSoldCredits: number;
  totalSoldKurus: number;
  totalActiveUserCredits: number;
  totalSpentCredits: number;
  totalPromoCredits: number;
  totalPendingRefundCredits: number;
  totalRefundedCredits: number;
  totalRefundedKurus: number;
  unearnedCreditLiabilityKurus: number; // Unused purchased credits liability (purchased - spent - refunded) * 135
  moduleBreakdown: Array<{
    module: FinanceSourceModule;
    labelTr: string;
    creditsSpent: number;
    transactionsCount: number;
  }>;
}

export interface PaymentIntentDraft {
  id: string;
  idempotencyKey: string;
  userId: string;
  sourceModule: FinanceSourceModule;
  referenceItemId: string;
  referenceItemTitle: string;
  sellerId?: string;
  sellerName?: string;
  creditsRequired: number;
  grossAmountKurus: number;
  discountKurus: number;
  payableAmountKurus: number;
  educationCreditsCost?: number; // Compatibility
  paymentMethod: PaymentMethodType;
  status: PaymentIntentStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProviderConfig {
  provider: 'disabled' | 'iyzico' | 'paytr';
  isConfigured: boolean;
  statusMessage: string;
}

export interface ProviderEarningsSummary {
  providerId: string;
  providerName: string;
  providerType: 'instructor' | 'provider';
  serviceModule?: FinanceSourceModule;
  totalGrossKurus: number;
  platformCommissionKurus: number;
  pendingPayoutKurus: number;
  readyToPayKurus: number;
  paidKurus: number;
  refundsAndDeductionsKurus: number;
  recentTransactions: Array<{
    id: string;
    date: string;
    itemTitle: string;
    customerMaskedId: string;
    grossKurus: number;
    commissionKurus: number;
    netEarningsKurus: number;
    status: string;
  }>;
}
