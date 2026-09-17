import type {
  FinancialTransaction,
  FinanceSourceModule,
  TransactionStatus,
  PayoutRecord,
  PayoutStatus,
  CommissionRule,
  FinanceOverviewMetrics,
  TimeFilterOption,
  SubscriptionMetricsSummary,
  DigitalProductSalesSummary,
} from '@/types/finance';
import type { AuditLogEntry } from '@/types/admin';

// -----------------------------------------------------------------------------
// Sürümlü Komisyon Kuralları (Commission Rules Engine)
// -----------------------------------------------------------------------------
const COMMISSION_RULES: CommissionRule[] = [
  {
    id: 'comm-edu-course',
    moduleKey: 'education_course',
    titleTr: 'Online Kurs Satış Komisyonu',
    commissionRatePercent: 30, // %30 LifeOS, %70 Eğitmen
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    descriptionTr: 'Yayınlanan video kursların her satışından alınan platform payı.',
    updatedByAdminId: 'admin_master',
  },
  {
    id: 'comm-edu-live',
    moduleKey: 'education_live',
    titleTr: 'Canlı Ders Katılım Payı',
    commissionRatePercent: 30, // %30 LifeOS, %70 Eğitmen (50 kredilik ders için 15 TL platform payı)
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    descriptionTr: 'BigBlueButton destekli canlı ders katılım ücreti platform kesintisi.',
    updatedByAdminId: 'admin_master',
  },
  {
    id: 'comm-edu-book',
    moduleKey: 'education_book',
    titleTr: 'Kitap ve Dijital Ürün Komisyonu',
    commissionRatePercent: 20, // %20 LifeOS, %80 Yazar/Eğitmen
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    descriptionTr: 'E-kitap ve dijital kaynak satış komisyonu.',
    updatedByAdminId: 'admin_master',
  },
  {
    id: 'comm-srv-moving',
    moduleKey: 'service_moving',
    titleTr: 'Nakliye Hizmeti Teklif Kredisi',
    commissionRatePercent: 10,
    fixedFeeKurus: 8000, // 80 TL sabit teklif katılım bedeli
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    descriptionTr: 'Taşıma ilanlarına verilen tekliflerden tahsil edilen platform bedeli.',
    updatedByAdminId: 'admin_master',
  },
  {
    id: 'comm-srv-taxi',
    moduleKey: 'service_taxi',
    titleTr: 'Taksi Hizmet Komisyonu',
    commissionRatePercent: 12,
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    descriptionTr: 'Şehir içi taksi yolculuklarından alınan platform komisyonu.',
    updatedByAdminId: 'admin_master',
  },
  {
    id: 'comm-srv-craftsman',
    moduleKey: 'service_craftsman',
    titleTr: 'Usta & Tamirat Komisyonu',
    commissionRatePercent: 15,
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    descriptionTr: 'Usta eşleşmesi ve tamamlanan işlerden alınan hizmet bedeli.',
    updatedByAdminId: 'admin_master',
  },
  {
    id: 'comm-srv-travel',
    moduleKey: 'service_travel',
    titleTr: 'Seyahat & Biletleme Komisyonu',
    commissionRatePercent: 10,
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    descriptionTr: 'Otobüs ve seyahat rezervasyon komisyonu.',
    updatedByAdminId: 'admin_master',
  },
  {
    id: 'comm-subscription',
    moduleKey: 'subscription',
    titleTr: 'LifeOS Plus / Premium Üyelik',
    commissionRatePercent: 100, // %100 LifeOS geliri
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    descriptionTr: 'Aylık ve yıllık LifeOS ekosistem abonelik gelirleri.',
    updatedByAdminId: 'admin_master',
  },
];

// -----------------------------------------------------------------------------
// Değiştirilemez Finansal İşlem Defteri (Immutable Financial Ledger)
// Kurus bazlı saklanır (100 Kuruş = 1.00 TL)
// -----------------------------------------------------------------------------
let TRANSACTIONS: FinancialTransaction[] = [
  // 1. Canlı Ders Katılımı (50 TL / 5000 kuruş -> %30 = 1500 kuruş LifeOS, 3500 kuruş Eğitmen)
  {
    id: 'TX-LIVE-8801',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'sale',
    sourceModule: 'education_live',
    sellerId: 'usr-instructor-ahmet',
    sellerName: 'Prof. Dr. Ahmet Yılmaz',
    buyerMaskedId: 'usr-std-***4',
    buyerName: 'Zeynep K.',
    referenceItemId: 'session_ai_101',
    referenceItemTitle: 'Canlı Uygulama: İlk AI Modelimizi Eğitiyoruz',
    grossAmountKurus: 5000, // 50.00 TL
    discountKurus: 0,
    refundAmountKurus: 0,
    gatewayFeeKurus: 125, // 1.25 TL banka komisyonu
    platformCommissionRatePercent: 30,
    platformCommissionKurus: 1500, // 15.00 TL LifeOS Payı
    sellerNetKurus: 3500, // 35.00 TL Eğitmen Payı
    platformNetKurus: 1375, // 1500 - 125 = 13.75 TL Net Platform Karı
    currency: 'TRY',
    status: 'succeeded',
    paymentMethod: 'Kredi Bakiyesi / Kart',
    auditNote: 'Canlı ders katılım rezervasyonu tamamlandı.',
    idempotencyKey: 'idemp-live-8801',
  },
  // 2. Kurs Satışı (240 TL / 24000 kuruş -> %30 = 7200 kuruş LifeOS, 16800 kuruş Eğitmen)
  {
    id: 'TX-CRS-8802',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    type: 'sale',
    sourceModule: 'education_course',
    sellerId: 'usr-instructor-ahmet',
    sellerName: 'Prof. Dr. Ahmet Yılmaz',
    buyerMaskedId: 'usr-std-***9',
    buyerName: 'Mert D.',
    referenceItemId: 'draft_sample_1',
    referenceItemTitle: 'Yapay Zeka ve Python Temelleri',
    grossAmountKurus: 24000, // 240.00 TL
    discountKurus: 0,
    refundAmountKurus: 0,
    gatewayFeeKurus: 600,
    platformCommissionRatePercent: 30,
    platformCommissionKurus: 7200,
    sellerNetKurus: 16800,
    platformNetKurus: 6600,
    currency: 'TRY',
    status: 'succeeded',
    paymentMethod: 'Kredi Kartı',
    auditNote: 'Online kurs tam erişim satışı.',
    idempotencyKey: 'idemp-crs-8802',
  },
  // 3. Kitap / Dijital Ürün Satışı (120 TL / 12000 kuruş -> %20 = 2400 kuruş LifeOS, 9600 kuruş Eğitmen)
  {
    id: 'TX-BOK-8803',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    type: 'sale',
    sourceModule: 'education_book',
    sellerId: 'usr-instructor-ahmet',
    sellerName: 'Prof. Dr. Ahmet Yılmaz',
    buyerMaskedId: 'usr-std-***2',
    buyerName: 'Elif Ş.',
    referenceItemId: 'bk-ai-guide',
    referenceItemTitle: 'Pratik Python & Derin Öğrenme El Kitabı (E-Kitap)',
    grossAmountKurus: 12000, // 120.00 TL
    discountKurus: 0,
    refundAmountKurus: 0,
    gatewayFeeKurus: 300,
    platformCommissionRatePercent: 20,
    platformCommissionKurus: 2400,
    sellerNetKurus: 9600,
    platformNetKurus: 2100,
    currency: 'TRY',
    status: 'succeeded',
    paymentMethod: 'Kredi Kartı',
    auditNote: 'Dijital ürün satışı ve lisans teslimi.',
    idempotencyKey: 'idemp-bok-8803',
  },
  // 4. Nakliye Hizmet Teklifi Komisyonu (80 TL / 8000 kuruş sabit teklif bedeli)
  {
    id: 'TX-MOV-8804',
    timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    type: 'commission',
    sourceModule: 'service_moving',
    sellerId: 'usr-provider-celik',
    sellerName: 'Çelik Nakliyat',
    buyerMaskedId: 'usr-cust-***7',
    buyerName: 'Hakan T.',
    referenceItemId: 'TR-seed-01',
    referenceItemTitle: 'Kadıköy -> Karşıyaka Evden Eve Taşıma Teklifi',
    grossAmountKurus: 8000, // 80.00 TL
    discountKurus: 0,
    refundAmountKurus: 0,
    gatewayFeeKurus: 200,
    platformCommissionRatePercent: 100,
    platformCommissionKurus: 8000,
    sellerNetKurus: 0,
    platformNetKurus: 7800,
    currency: 'TRY',
    status: 'succeeded',
    paymentMethod: 'Hizmet Kredisi',
    auditNote: 'Nakliye ilanına teklif verme işlem bedeli.',
    idempotencyKey: 'idemp-mov-8804',
  },
  // 5. Taksi Hizmet Komisyonu (350 TL / 35000 kuruş -> %12 = 4200 kuruş LifeOS, 30800 kuruş Şoför)
  {
    id: 'TX-TAX-8805',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    type: 'sale',
    sourceModule: 'service_taxi',
    sellerId: 'usr-driver-hasan',
    sellerName: 'Hasan Yılmaz (Sarı Taksi)',
    buyerMaskedId: 'usr-cust-***1',
    buyerName: 'Burak V.',
    referenceItemId: 'ride-9921',
    referenceItemTitle: 'Kadıköy -> Beşiktaş Şehir İçi Yolculuk',
    grossAmountKurus: 35000, // 350.00 TL
    discountKurus: 0,
    refundAmountKurus: 0,
    gatewayFeeKurus: 750,
    platformCommissionRatePercent: 12,
    platformCommissionKurus: 4200,
    sellerNetKurus: 30800,
    platformNetKurus: 3450,
    currency: 'TRY',
    status: 'succeeded',
    paymentMethod: 'Kart / Sabit Tarife',
    auditNote: 'Taksi yolculuk tamamlandı ve komisyon kesildi.',
    idempotencyKey: 'idemp-tax-8805',
  },
  // 6. Usta Hizmet Komisyonu (600 TL / 60000 kuruş -> %15 = 9000 kuruş LifeOS, 51000 kuruş Usta)
  {
    id: 'TX-CRF-8806',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    type: 'sale',
    sourceModule: 'service_craftsman',
    sellerId: 'usr-craft-ustam',
    sellerName: 'Murat Usta',
    buyerMaskedId: 'usr-cust-***6',
    buyerName: 'Seda A.',
    referenceItemId: 'job-craft-104',
    referenceItemTitle: 'Elektrik Panosu & Kaçak Akım Rölesi Montajı',
    grossAmountKurus: 60000, // 600.00 TL
    discountKurus: 0,
    refundAmountKurus: 0,
    gatewayFeeKurus: 1200,
    platformCommissionRatePercent: 15,
    platformCommissionKurus: 9000,
    sellerNetKurus: 51000,
    platformNetKurus: 7800,
    currency: 'TRY',
    status: 'succeeded',
    paymentMethod: 'Güvenli Hizmet Ödemesi',
    auditNote: 'Usta iş onayından sonra hakediş ayrıldı.',
    idempotencyKey: 'idemp-crf-8806',
  },
  // 7. LifeOS Plus Aylık Abonelik (199 TL / 19900 kuruş -> %100 LifeOS)
  {
    id: 'TX-SUB-8807',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    type: 'sale',
    sourceModule: 'subscription',
    sellerId: 'lifeos_platform',
    sellerName: 'LifeOS Dijital Ekosistem',
    buyerMaskedId: 'usr-mem-***3',
    buyerName: 'Furkan T.',
    referenceItemId: 'plan_plus_monthly',
    referenceItemTitle: 'LifeOS Plus Aylık Aile & Asistan Üyeliği',
    grossAmountKurus: 19900, // 199.00 TL
    discountKurus: 0,
    refundAmountKurus: 0,
    gatewayFeeKurus: 450,
    platformCommissionRatePercent: 100,
    platformCommissionKurus: 19900,
    sellerNetKurus: 0,
    platformNetKurus: 19450,
    currency: 'TRY',
    status: 'succeeded',
    paymentMethod: 'Otomatik Kart Tahsilatı',
    auditNote: 'Aylık abonelik yenileme tahsilatı.',
    idempotencyKey: 'idemp-sub-8807',
  },
  // 8. İade Kaydı (Canlı ders iptali iadesi: 50 TL / 5000 kuruş ters kayıt)
  {
    id: 'TX-REF-8808',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    type: 'refund',
    sourceModule: 'education_live',
    sellerId: 'usr-instructor-ahmet',
    sellerName: 'Prof. Dr. Ahmet Yılmaz',
    buyerMaskedId: 'usr-std-***8',
    buyerName: 'Ali G.',
    referenceItemId: 'session_cancelled_99',
    referenceItemTitle: 'İptal Edilen Matematik Canlı Dersi',
    grossAmountKurus: 0,
    discountKurus: 0,
    refundAmountKurus: 5000, // 50.00 TL tam iade
    gatewayFeeKurus: 0,
    platformCommissionRatePercent: 30,
    platformCommissionKurus: -1500,
    sellerNetKurus: -3500,
    platformNetKurus: -1500,
    currency: 'TRY',
    status: 'refunded',
    paymentMethod: 'Kredi İadesi',
    auditNote: 'Canlı ders eğitmen tarafından iptal edildiği için tam iade uygulandı.',
    idempotencyKey: 'idemp-ref-8808',
  },
];

// -----------------------------------------------------------------------------
// Eğitmen ve Hizmet Sağlayıcı Hakediş / Ödeme Kayıtları (Payouts)
// -----------------------------------------------------------------------------
let PAYOUTS: PayoutRecord[] = [
  {
    id: 'PO-INST-2026-09-01',
    recipientId: 'usr-instructor-ahmet',
    recipientName: 'Prof. Dr. Ahmet Yılmaz',
    recipientType: 'instructor',
    serviceModule: 'education_course',
    periodStart: '2026-09-01T00:00:00.000Z',
    periodEnd: '2026-09-15T23:59:59.000Z',
    totalGrossKurus: 41000, // 410.00 TL toplam satış
    totalCommissionKurus: 11100, // 111.00 TL LifeOS kesintisi
    netPayoutKurus: 29900, // 299.00 TL net ödenecek hakediş
    status: 'payout_scheduled',
    scheduledPayoutDate: '2026-09-20',
    adminNotes: 'Eylül 1. dönem canlı ders ve kurs hakedişi hesaplandı.',
    isManualRecord: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'PO-PROV-2026-09-02',
    recipientId: 'usr-craft-ustam',
    recipientName: 'Murat Usta',
    recipientType: 'provider',
    serviceModule: 'service_craftsman',
    periodStart: '2026-09-01T00:00:00.000Z',
    periodEnd: '2026-09-15T23:59:59.000Z',
    totalGrossKurus: 60000,
    totalCommissionKurus: 9000,
    netPayoutKurus: 51000,
    status: 'paid',
    scheduledPayoutDate: '2026-09-16',
    paidAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    paymentReference: 'EFT-TR9928172601',
    adminNotes: 'Banka transferi tamamlandı ve mutabakat sağlandı.',
    isManualRecord: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export class FinanceRegistry {
  /**
   * Helper: Filter transactions based on date criteria
   */
  private static filterByTime(transactions: FinancialTransaction[], filter: TimeFilterOption): FinancialTransaction[] {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOf7Days = now.getTime() - 86400000 * 7;
    const startOf30Days = now.getTime() - 86400000 * 30;
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const endOfLastMonth = startOfThisMonth - 1;

    return transactions.filter((tx) => {
      const txTime = new Date(tx.timestamp).getTime();
      switch (filter) {
        case 'today':
          return txTime >= startOfToday;
        case 'yesterday':
          return txTime >= startOfYesterday && txTime < startOfToday;
        case 'last_7_days':
          return txTime >= startOf7Days;
        case 'last_30_days':
          return txTime >= startOf30Days;
        case 'this_month':
          return txTime >= startOfThisMonth;
        case 'last_month':
          return txTime >= startOfLastMonth && txTime <= endOfLastMonth;
        default:
          return true;
      }
    });
  }

  /**
   * Calculate exact integer-currency metrics for top cards & charts
   */
  public static getOverviewMetrics(timeFilter: TimeFilterOption = 'this_month'): FinanceOverviewMetrics {
    const filteredTx = this.filterByTime(TRANSACTIONS, timeFilter);

    let totalGrossVolumeKurus = 0;
    let platformNetRevenueKurus = 0;
    let completedRefundsKurus = 0;
    let pendingReceivablesKurus = 0;

    const sourceMap = new Map<FinanceSourceModule, { grossKurus: number; platformNetKurus: number; count: number }>();

    for (const tx of filteredTx) {
      if (tx.status === 'succeeded') {
        totalGrossVolumeKurus += tx.grossAmountKurus;
        platformNetRevenueKurus += tx.platformNetKurus;
      } else if (tx.status === 'refunded' || tx.status === 'partially_refunded') {
        completedRefundsKurus += tx.refundAmountKurus;
        platformNetRevenueKurus += tx.platformNetKurus; // includes negative refund effect
      } else if (tx.status === 'pending') {
        pendingReceivablesKurus += tx.grossAmountKurus;
      }

      const existingSource = sourceMap.get(tx.sourceModule) || { grossKurus: 0, platformNetKurus: 0, count: 0 };
      existingSource.grossKurus += tx.grossAmountKurus;
      existingSource.platformNetKurus += tx.platformNetKurus;
      existingSource.count += 1;
      sourceMap.set(tx.sourceModule, existingSource);
    }

    // Pending Payouts to Instructors & Providers
    let pendingPayoutsKurus = 0;
    for (const po of PAYOUTS) {
      if (po.status === 'calculated' || po.status === 'under_review' || po.status === 'payout_scheduled') {
        pendingPayoutsKurus += po.netPayoutKurus;
      }
    }

    // Today & This Month Revenue
    const todayTx = this.filterByTime(TRANSACTIONS, 'today');
    const todayRevenueKurus = todayTx.reduce((acc, t) => (t.status === 'succeeded' ? acc + t.platformNetKurus : acc), 0);

    const thisMonthTx = this.filterByTime(TRANSACTIONS, 'this_month');
    const thisMonthRevenueKurus = thisMonthTx.reduce((acc, t) => (t.status === 'succeeded' ? acc + t.platformNetKurus : acc), 0);

    // Source Breakdown Array with Clean Turkish Labels
    const labelMap: Record<FinanceSourceModule, string> = {
      education_live: 'Canlı Dersler (BBB)',
      education_course: 'Online Kurslar',
      education_book: 'Kitap & Dijital Ürün',
      service_moving: 'Nakliye Komisyonları',
      service_taxi: 'Taksi Komisyonları',
      service_craftsman: 'Usta & Tamirat',
      service_travel: 'Seyahat Biletleme',
      arcade_game: 'Arcade & Oyun İçi Ürünler',
      digital_product: 'Dijital Ürünler',
      subscription: 'Üyelik ve Abonelikler',
      adjustment: 'Düzeltmeler',
    };

    const sourceBreakdown = Array.from(sourceMap.entries()).map(([source, val]) => ({
      source,
      labelTr: labelMap[source] || source,
      grossKurus: val.grossKurus,
      platformNetKurus: val.platformNetKurus,
      transactionCount: val.count,
    }));

    // Hourly Breakdown for Today (00:00 - 23:00)
    const hourlyRevenueToday: Array<{ hour: string; grossKurus: number; platformNetKurus: number }> = [
      { hour: '08:00', grossKurus: 5000, platformNetKurus: 1500 },
      { hour: '10:00', grossKurus: 24000, platformNetKurus: 7200 },
      { hour: '12:00', grossKurus: 12000, platformNetKurus: 2400 },
      { hour: '14:00', grossKurus: 35000, platformNetKurus: 4200 },
      { hour: '16:00', grossKurus: 8000, platformNetKurus: 8000 },
      { hour: '18:00', grossKurus: 19900, platformNetKurus: 19900 },
      { hour: '20:00', grossKurus: 60000, platformNetKurus: 9000 },
    ];

    // Last 12 Months Trend
    const last12MonthsTrend = [
      { month: 'Ekim', grossKurus: 450000, commissionKurus: 110000, platformNetKurus: 105000, refundKurus: 5000 },
      { month: 'Kasım', grossKurus: 520000, commissionKurus: 130000, platformNetKurus: 124000, refundKurus: 6000 },
      { month: 'Aralık', grossKurus: 680000, commissionKurus: 175000, platformNetKurus: 168000, refundKurus: 8000 },
      { month: 'Ocak', grossKurus: 710000, commissionKurus: 182000, platformNetKurus: 175000, refundKurus: 7000 },
      { month: 'Şubat', grossKurus: 840000, commissionKurus: 215000, platformNetKurus: 206000, refundKurus: 9000 },
      { month: 'Eylül (Bu Ay)', grossKurus: totalGrossVolumeKurus, commissionKurus: platformNetRevenueKurus, platformNetKurus: platformNetRevenueKurus, refundKurus: completedRefundsKurus },
    ];

    return {
      totalGrossVolumeKurus,
      platformNetRevenueKurus,
      pendingReceivablesKurus,
      pendingPayoutsKurus,
      completedRefundsKurus,
      activeSubscriptionMrrKurus: 19900, // 199 TL MRR
      todayRevenueKurus,
      thisMonthRevenueKurus,
      currency: 'TRY',
      sourceBreakdown,
      hourlyRevenueToday,
      last12MonthsTrend,
      topInstructors: [
        {
          id: 'usr-instructor-ahmet',
          name: 'Prof. Dr. Ahmet Yılmaz',
          salesCount: 3,
          grossKurus: 41000, // 410.00 TL
          platformCommissionKurus: 11100, // 111.00 TL
        },
      ],
      topProviders: [
        {
          id: 'usr-craft-ustam',
          name: 'Murat Usta',
          serviceType: 'Usta & Elektrik',
          jobsCount: 1,
          grossKurus: 60000,
          commissionKurus: 9000,
        },
        {
          id: 'usr-driver-hasan',
          name: 'Hasan Yılmaz',
          serviceType: 'Taksi',
          jobsCount: 1,
          grossKurus: 35000,
          commissionKurus: 4200,
        },
        {
          id: 'usr-provider-celik',
          name: 'Çelik Nakliyat',
          serviceType: 'Nakliye',
          jobsCount: 1,
          grossKurus: 8000,
          commissionKurus: 8000,
        },
      ],
    };
  }

  /**
   * List all financial transactions with rich filtering
   */
  public static listTransactions(filters?: {
    sourceModule?: FinanceSourceModule;
    status?: TransactionStatus;
    search?: string;
    timeFilter?: TimeFilterOption;
  }): FinancialTransaction[] {
    let result = TRANSACTIONS;

    if (filters?.timeFilter) {
      result = this.filterByTime(result, filters.timeFilter);
    }

    if (filters?.sourceModule) {
      result = result.filter((t) => t.sourceModule === filters.sourceModule);
    }

    if (filters?.status) {
      result = result.filter((t) => t.status === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.referenceItemTitle.toLowerCase().includes(q) ||
          t.sellerName?.toLowerCase().includes(q) ||
          t.buyerName.toLowerCase().includes(q)
      );
    }

    return result;
  }

  /**
   * Get single transaction by ID
   */
  public static getTransactionById(id: string): FinancialTransaction | undefined {
    return TRANSACTIONS.find((t) => t.id === id);
  }

  /**
   * List Commission Rules
   */
  public static listCommissionRules(): CommissionRule[] {
    return COMMISSION_RULES;
  }

  /**
   * List Payout Records
   */
  public static listPayouts(recipientType?: 'instructor' | 'provider'): PayoutRecord[] {
    if (!recipientType) return PAYOUTS;
    return PAYOUTS.filter((p) => p.recipientType === recipientType);
  }

  /**
   * Update Payout Status (calculated -> under_review -> payout_scheduled -> paid -> reconciled)
   */
  public static updatePayoutStatus(params: {
    payoutId: string;
    newStatus: PayoutStatus;
    adminId: string;
    adminDisplayName: string;
    paymentReference?: string;
    adminNotes?: string;
  }): { success: boolean; payout?: PayoutRecord; error?: string } {
    const payout = PAYOUTS.find((p) => p.id === params.payoutId);
    if (!payout) return { success: false, error: 'Hakediş kaydı bulunamadı.' };

    payout.status = params.newStatus;
    payout.updatedAt = new Date().toISOString();
    if (params.paymentReference) payout.paymentReference = params.paymentReference;
    if (params.adminNotes) payout.adminNotes = params.adminNotes;
    if (params.newStatus === 'paid') payout.paidAt = new Date().toISOString();

    return { success: true, payout };
  }

  /**
   * Subscription Metrics Summary
   */
  public static getSubscriptionMetrics(): SubscriptionMetricsSummary {
    return {
      activeSubscriptionsCount: 142,
      newSubscriptionsThisMonth: 28,
      cancelledThisMonth: 3,
      renewedThisMonth: 111,
      totalMrrKurus: 2825800, // 28,258.00 TL MRR
      trialConversionRatePercent: 84.5,
      failedCollectionsCount: 2,
      plans: [
        {
          planId: 'plan_individual_plus',
          planName: 'LifeOS Bireysel Plus',
          activeCount: 94,
          monthlyPriceKurus: 14900,
          mrrKurus: 1400600,
          churnRatePercent: 1.8,
        },
        {
          planId: 'plan_family_pro',
          planName: 'LifeOS Aile & Ekosistem Pro',
          activeCount: 48,
          monthlyPriceKurus: 29900,
          mrrKurus: 1435200,
          churnRatePercent: 1.2,
        },
      ],
    };
  }

  /**
   * Digital Products & E-Books Sales Summary
   */
  public static getDigitalProductsSummary(): DigitalProductSalesSummary[] {
    return [
      {
        productId: 'bk-ai-guide',
        title: 'Pratik Python & Derin Öğrenme El Kitabı',
        authorName: 'Prof. Dr. Ahmet Yılmaz',
        category: 'Yazılım & AI',
        salesCount: 18,
        grossRevenueKurus: 216000, // 2,160.00 TL
        platformCommissionKurus: 43200, // 432.00 TL
        authorNetKurus: 172800, // 1,728.00 TL
        refundsCount: 0,
      },
    ];
  }

  /**
   * Generate Privacy-Safe CSV Export Data
   */
  public static generateExportCsv(timeFilter: TimeFilterOption = 'this_month'): string {
    const transactions = this.filterByTime(TRANSACTIONS, timeFilter);
    const headers = [
      'Islem Kimligi',
      'Tarih Saat',
      'Modul',
      'Islem Turu',
      'Satici / Egitmen / Saglayici',
      'Musteri (Maskeli)',
      'Referans Urun / Hizmet',
      'Brut Tutar (TL)',
      'Komisyon Orani (%)',
      'LifeOS Komisyon (TL)',
      'Saglayici Neti (TL)',
      'Platform Neti (TL)',
      'Durum',
    ];

    const rows = transactions.map((t) => [
      t.id,
      new Date(t.timestamp).toLocaleString('tr-TR'),
      t.sourceModule,
      t.type,
      `"${t.sellerName || 'LifeOS'}"`,
      `"${t.buyerMaskedId}"`,
      `"${t.referenceItemTitle.replace(/"/g, '""')}"`,
      (t.grossAmountKurus / 100).toFixed(2),
      t.platformCommissionRatePercent,
      (t.platformCommissionKurus / 100).toFixed(2),
      (t.sellerNetKurus / 100).toFixed(2),
      (t.platformNetKurus / 100).toFixed(2),
      t.status,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Webhook Idempotent Ingestion for Real Payment Providers (Iyzico / Stripe / PayTR)
   */
  public static ingestPaymentWebhook(payload: {
    idempotencyKey: string;
    sourceModule: FinanceSourceModule;
    grossAmountKurus: number;
    sellerId?: string;
    sellerName?: string;
    buyerMaskedId: string;
    buyerName: string;
    referenceItemId: string;
    referenceItemTitle: string;
  }): { success: boolean; transaction: FinancialTransaction; isDuplicate: boolean } {
    // Check for double webhook execution
    const existing = TRANSACTIONS.find((t) => t.idempotencyKey === payload.idempotencyKey);
    if (existing) {
      return { success: true, transaction: existing, isDuplicate: true };
    }

    const rule = COMMISSION_RULES.find((r) => r.moduleKey === payload.sourceModule);
    const rate = rule?.commissionRatePercent || 20;
    const commissionKurus = Math.round((payload.grossAmountKurus * rate) / 100);
    const sellerNetKurus = payload.grossAmountKurus - commissionKurus;
    const gatewayFeeKurus = Math.round(payload.grossAmountKurus * 0.025); // Estimated 2.5% gateway fee
    const platformNetKurus = commissionKurus - gatewayFeeKurus;

    const newTx: FinancialTransaction = {
      id: `TX-WH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: 'sale',
      sourceModule: payload.sourceModule,
      sellerId: payload.sellerId,
      sellerName: payload.sellerName,
      buyerMaskedId: payload.buyerMaskedId,
      buyerName: payload.buyerName,
      referenceItemId: payload.referenceItemId,
      referenceItemTitle: payload.referenceItemTitle,
      grossAmountKurus: payload.grossAmountKurus,
      discountKurus: 0,
      refundAmountKurus: 0,
      gatewayFeeKurus,
      platformCommissionRatePercent: rate,
      platformCommissionKurus: commissionKurus,
      sellerNetKurus,
      platformNetKurus,
      currency: 'TRY',
      status: 'succeeded',
      idempotencyKey: payload.idempotencyKey,
      auditNote: 'Ödeme sağlayıcısı webhook bildirimi ile otomatik kaydoldu.',
    };

    TRANSACTIONS.unshift(newTx);

    return { success: true, transaction: newTx, isDuplicate: false };
  }
}
