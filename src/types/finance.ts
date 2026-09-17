export type FinanceSectionKey =
  | 'overview'
  | 'expenses'
  | 'budget'
  | 'goals'
  | 'subscriptions';

export interface FinancialSecurityConfig {
  isBiometricRequired: boolean;
  isPrivacyModeActive: boolean;
  dataEncryption: 'e2ee' | 'standard';
}

export type FinanceSourceModule =
  | 'education_live'
  | 'education_course'
  | 'education_book'
  | 'service_taxi'
  | 'service_moving'
  | 'service_craftsman'
  | 'service_travel'
  | 'arcade_game'
  | 'digital_product'
  | 'subscription'
  | 'adjustment';

export type TransactionType =
  | 'sale'
  | 'commission'
  | 'payout'
  | 'refund'
  | 'partial_refund'
  | 'chargeback'
  | 'adjustment';

export type TransactionStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'
  | 'payout_pending';

export type PayoutStatus =
  | 'calculated'
  | 'under_review'
  | 'payout_scheduled'
  | 'paid'
  | 'reconciled';

export type TimeFilterOption =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'last_month'
  | 'custom';

export type FinanceTabKey =
  | 'overview'
  | 'stream'
  | 'history'
  | 'commissions'
  | 'subscriptions'
  | 'instructor_earnings'
  | 'provider_earnings'
  | 'digital_products'
  | 'refunds'
  | 'payouts'
  | 'reports';

export interface FinancialTransaction {
  id: string;
  timestamp: string; // ISO String
  type: TransactionType;
  sourceModule: FinanceSourceModule;
  sellerId?: string;
  sellerName?: string;
  buyerMaskedId: string;
  buyerName: string;
  referenceItemId: string;
  referenceItemTitle: string;
  grossAmountKurus: number; // Stored in Kurus (100 Kurus = 1 TL)
  discountKurus: number;
  refundAmountKurus: number;
  gatewayFeeKurus: number;
  platformCommissionRatePercent: number; // e.g. 30 for 30%
  platformCommissionKurus: number;
  sellerNetKurus: number;
  platformNetKurus: number;
  currency: string; // e.g. 'TRY'
  status: TransactionStatus;
  paymentMethod?: string;
  auditNote?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

export interface CommissionRule {
  id: string;
  moduleKey: FinanceSourceModule;
  titleTr: string;
  commissionRatePercent: number;
  fixedFeeKurus?: number;
  version: number;
  effectiveFrom: string;
  descriptionTr: string;
  updatedByAdminId: string;
}

export interface PayoutRecord {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientType: 'instructor' | 'provider';
  serviceModule?: FinanceSourceModule;
  periodStart: string;
  periodEnd: string;
  totalGrossKurus: number;
  totalCommissionKurus: number;
  netPayoutKurus: number;
  status: PayoutStatus;
  scheduledPayoutDate?: string;
  paidAt?: string;
  paymentReference?: string;
  adminNotes?: string;
  isManualRecord: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceOverviewMetrics {
  totalGrossVolumeKurus: number;
  platformNetRevenueKurus: number;
  pendingReceivablesKurus: number;
  pendingPayoutsKurus: number;
  completedRefundsKurus: number;
  activeSubscriptionMrrKurus: number;
  todayRevenueKurus: number;
  thisMonthRevenueKurus: number;
  currency: string;
  sourceBreakdown: Array<{
    source: FinanceSourceModule;
    labelTr: string;
    grossKurus: number;
    platformNetKurus: number;
    transactionCount: number;
  }>;
  hourlyRevenueToday: Array<{
    hour: string;
    grossKurus: number;
    platformNetKurus: number;
  }>;
  last12MonthsTrend: Array<{
    month: string;
    grossKurus: number;
    commissionKurus: number;
    platformNetKurus: number;
    refundKurus: number;
  }>;
  topInstructors: Array<{
    id: string;
    name: string;
    salesCount: number;
    grossKurus: number;
    platformCommissionKurus: number;
  }>;
  topProviders: Array<{
    id: string;
    name: string;
    serviceType: string;
    jobsCount: number;
    grossKurus: number;
    commissionKurus: number;
  }>;
}

export interface SubscriptionPlanMetric {
  planId: string;
  planName: string;
  activeCount: number;
  monthlyPriceKurus: number;
  mrrKurus: number;
  churnRatePercent: number;
}

export interface SubscriptionMetricsSummary {
  activeSubscriptionsCount: number;
  newSubscriptionsThisMonth: number;
  cancelledThisMonth: number;
  renewedThisMonth: number;
  totalMrrKurus: number;
  trialConversionRatePercent: number;
  failedCollectionsCount: number;
  plans: SubscriptionPlanMetric[];
}

export interface DigitalProductSalesSummary {
  productId: string;
  title: string;
  authorName: string;
  category: string;
  salesCount: number;
  grossRevenueKurus: number;
  platformCommissionKurus: number;
  authorNetKurus: number;
  refundsCount: number;
}
