import { FinanceRegistry } from '../src/lib/admin/FinanceRegistry';
import { AdminRegistry } from '../src/lib/admin/AdminRegistry';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('=== Starting LifeOS Finance Engine Verification ===\n');

// 1. Overview Metrics Test
const overview = FinanceRegistry.getOverviewMetrics('this_month');
console.log('Overview metrics gross volume (TL):', (overview.totalGrossVolumeKurus / 100).toFixed(2));
console.log('Platform Net Revenue (TL):', (overview.platformNetRevenueKurus / 100).toFixed(2));
assert(overview.totalGrossVolumeKurus > 0, 'Total gross volume must be positive');
assert(overview.platformNetRevenueKurus > 0, 'Platform net revenue must be positive');
assert(overview.sourceBreakdown.length > 0, 'Source breakdown must contain entries');

// 2. Commission Rules Test
const rules = FinanceRegistry.listCommissionRules();
assert(rules.length >= 8, 'Must have at least 8 commission rules for all ecosystem modules');
const courseRule = rules.find((r) => r.moduleKey === 'education_course');
assert(courseRule?.commissionRatePercent === 30, 'Course commission rate must be 30%');
const liveRule = rules.find((r) => r.moduleKey === 'education_live');
assert(liveRule?.commissionRatePercent === 30, 'Live session commission rate must be 30%');
const bookRule = rules.find((r) => r.moduleKey === 'education_book');
assert(bookRule?.commissionRatePercent === 20, 'Book commission rate must be 20%');

// 3. Transactions Filtering & Integer Precision Test
const txs = FinanceRegistry.listTransactions();
assert(txs.length >= 8, 'Must contain seed financial ledger transactions');

for (const tx of txs) {
  if (tx.status === 'succeeded' && tx.type === 'sale') {
    const expectedPlatformKurus = Math.round((tx.grossAmountKurus * tx.platformCommissionRatePercent) / 100);
    assert(
      tx.platformCommissionKurus === expectedPlatformKurus,
      `Transaction ${tx.id} platformCommissionKurus matches exact integer percent (${tx.platformCommissionKurus} == ${expectedPlatformKurus})`
    );
    assert(
      tx.sellerNetKurus + tx.platformCommissionKurus === tx.grossAmountKurus,
      `Transaction ${tx.id} integer sum equals gross (${tx.sellerNetKurus} + ${tx.platformCommissionKurus} == ${tx.grossAmountKurus})`
    );
  }
}

// 4. Payouts Lifecycle Test
const initialPayouts = FinanceRegistry.listPayouts();
assert(initialPayouts.length >= 2, 'Initial payouts list must have records');
const testPayoutId = initialPayouts[0].id;
const updateResult = FinanceRegistry.updatePayoutStatus({
  payoutId: testPayoutId,
  newStatus: 'reconciled',
  adminId: 'admin_master',
  adminDisplayName: 'Sistem Yöneticisi',
  paymentReference: 'EFT-TEST-2026-001',
  adminNotes: 'Banka mutabakatı onaylandı.',
});
assert(updateResult.success === true, 'Payout status update must succeed');
assert(updateResult.payout?.status === 'reconciled', 'Payout status must be updated to reconciled');

// 5. CSV Export Generation Test
const csv = FinanceRegistry.generateExportCsv('this_month');
assert(csv.includes('Islem Kimligi'), 'CSV must contain standard headers');
assert(csv.includes('TX-LIVE-8801'), 'CSV must contain transaction IDs');
assert(!csv.includes('secret_credit_card'), 'CSV must not leak sensitive card numbers');

// 6. Webhook Idempotency Test
const webhookPayload = {
  idempotencyKey: 'idemp-test-unique-999',
  sourceModule: 'education_course' as const,
  grossAmountKurus: 30000, // 300.00 TL
  sellerId: 'usr-instructor-ahmet',
  sellerName: 'Prof. Dr. Ahmet Yılmaz',
  buyerMaskedId: 'usr-std-***5',
  buyerName: 'Caner B.',
  referenceItemId: 'course_ai_advanced',
  referenceItemTitle: 'İleri Seviye Yapay Zeka Kursu',
};

const webhookRes1 = FinanceRegistry.ingestPaymentWebhook(webhookPayload);
assert(webhookRes1.success && !webhookRes1.isDuplicate, 'First webhook ingestion must succeed as new transaction');
assert(webhookRes1.transaction.platformCommissionKurus === 9000, '30% of 30000 kurus must equal 9000 kurus');
assert(webhookRes1.transaction.sellerNetKurus === 21000, 'Seller net must equal 21000 kurus (210 TL)');

// Duplicate webhook execution
const webhookRes2 = FinanceRegistry.ingestPaymentWebhook(webhookPayload);
assert(webhookRes2.success && webhookRes2.isDuplicate, 'Second webhook ingestion with same idempotencyKey must be marked as duplicate and not re-charged');

console.log('\n✨ ALL FINANCE ENGINE TESTS PASSED SUCCESSFULLY! ✨');
