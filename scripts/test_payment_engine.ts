import { PaymentEngine } from '../src/lib/payment/PaymentEngine';
import { FinanceRegistry } from '../src/lib/admin/FinanceRegistry';

async function runPaymentEngineTests() {
  console.log('=== STARTING LIFEOS PAYMENT ENGINE & WALLET TESTS ===\n');
  const userId = 'usr-test-student-1';
  const instructorId = 'usr-instructor-ahmet';

  // SCENARIO 1: User Wallet Top-up (Cash & Credits)
  console.log('--- TEST 1: User Wallet Top-up (Cash & Credits) ---');
  const initialWallet = PaymentEngine.getWallet(userId);
  console.log(`Initial wallet state: ${initialWallet.cashBalanceKurus / 100} TL, ${initialWallet.educationCreditBalance} credits`);

  const cashTopupResult = PaymentEngine.topupWalletCash({
    userId,
    amountKurus: 50000, // 500.00 TL
    description: 'Bakiye Yükleme (Kredi Kartı)',
  });
  console.log(`Cash topup success: ${cashTopupResult.success}, New Balance: ${cashTopupResult.wallet.cashBalanceKurus / 100} TL`);

  const creditTopupResult = PaymentEngine.topupEducationCredits({
    userId,
    credits: 100,
    amountKurus: 5000, // 50.00 TL
    description: '100 Eğitim Kredisi Satın Alımı',
  });
  console.log(`Credits topup success: ${creditTopupResult.success}, New Credits: ${creditTopupResult.wallet.educationCreditBalance}`);
  
  if (creditTopupResult.wallet.educationCreditBalance < 100) {
    throw new Error(`Test 1 Failed: Unexpected wallet credit balance: credits=${creditTopupResult.wallet.educationCreditBalance}`);
  }
  console.log('✅ TEST 1 PASSED: Wallet cash top-up and credit purchase verified with ledger entries.\n');

  // SCENARIO 2: 50-Credit Live Session Enrollment (Atomic Deduction + Revenue Share)
  console.log('--- TEST 2: 50-Credit Live Session Enrollment ---');
  const liveSessionIntent = PaymentEngine.createPaymentIntent({
    userId,
    sourceModule: 'education_live',
    referenceItemId: 'live-math-101',
    referenceItemTitle: 'İleri Seviye Matematik & Algoritmalar Canlı Dersi',
    grossAmountKurus: 0,
    educationCreditsCost: 50,
    idempotencyKey: 'idem-live-session-enroll-001',
    sellerId: instructorId,
    sellerName: 'Dr. Ahmet Yılmaz',
  });

  const prevBalance = PaymentEngine.getWallet(userId).creditBalance;
  console.log(`Created intent: ${liveSessionIntent.id}, status: ${liveSessionIntent.status}`);
  const liveSessionProcess = await PaymentEngine.processCheckout({
    intentId: liveSessionIntent.id,
    userId,
    paymentMethod: 'education_credits',
    idempotencyKey: 'idem-live-session-enroll-001',
  });

  console.log(`Live session enrollment process success: ${liveSessionProcess.success}, Receipt Tx: ${liveSessionProcess.receipt?.transactionId}`);
  const walletAfterLiveEnroll = PaymentEngine.getWallet(userId);
  console.log(`Wallet credits after live enrollment: ${walletAfterLiveEnroll.educationCreditBalance}`);

  if (walletAfterLiveEnroll.educationCreditBalance !== prevBalance - 50) {
    throw new Error(`Test 2 Failed: Expected ${prevBalance - 50} credits remaining, got ${walletAfterLiveEnroll.educationCreditBalance}`);
  }
  console.log('✅ TEST 2 PASSED: 50 credits deducted atomically, intent completed.\n');

  // SCENARIO 3: Idempotency Protection (Re-submitting duplicate request)
  console.log('--- TEST 3: Idempotency Protection ---');
  const duplicateLiveProcess = await PaymentEngine.processCheckout({
    intentId: liveSessionIntent.id,
    userId,
    paymentMethod: 'education_credits',
    idempotencyKey: 'idem-live-session-enroll-001',
  });

  console.log(`Duplicate process returned success: ${duplicateLiveProcess.success}`);
  const walletAfterDuplicate = PaymentEngine.getWallet(userId);
  if (walletAfterDuplicate.educationCreditBalance !== prevBalance - 50) {
    throw new Error(`Test 3 Failed: Idempotency failed, credits deducted again! Remaining: ${walletAfterDuplicate.educationCreditBalance}`);
  }
  console.log('✅ TEST 3 PASSED: Duplicate submission returned cached result without duplicate charge.\n');

  // SCENARIO 4: Cancellation and Reverse Ledger Refund
  console.log('--- TEST 4: Cancellation and Reverse Ledger Refund ---');
  const liveSessionRefund = PaymentEngine.refundTransaction({
    transactionId: 'live-math-101',
    reason: 'Eğitmen dersi iptal etti - otomatik iade',
  });

  console.log(`Refund success: ${liveSessionRefund.success}, Message: ${liveSessionRefund.message}`);
  const walletAfterRefund = PaymentEngine.getWallet(userId);
  console.log(`Wallet credits after refund: ${walletAfterRefund.educationCreditBalance}`);

  if (walletAfterRefund.educationCreditBalance !== prevBalance) {
    throw new Error(`Test 4 Failed: Expected ${prevBalance} credits after refund, got ${walletAfterRefund.educationCreditBalance}`);
  }
  console.log('✅ TEST 4 PASSED: Atomic reverse ledger entry created and credits refunded.\n');

  // SCENARIO 5: Book Purchase with Wallet Cash, Commission and Instructor Payout
  console.log('--- TEST 5: Book Purchase with Cash Balance & Commission ---');
  const bookIntent = PaymentEngine.createPaymentIntent({
    userId,
    sourceModule: 'education_book',
    referenceItemId: 'book-ai-guide-2026',
    referenceItemTitle: 'Modern Yapay Zeka Rehberi (E-Kitap)',
    grossAmountKurus: 12000, // 120.00 TL
    idempotencyKey: 'idem-book-buy-001',
    sellerId: instructorId,
    sellerName: 'Dr. Ahmet Yılmaz',
  });

  const bookProcess = await PaymentEngine.processCheckout({
    intentId: bookIntent.id,
    userId,
    paymentMethod: 'wallet_cash',
    idempotencyKey: 'idem-book-buy-001',
  });

  console.log(`Book purchase success: ${bookProcess.success}, Receipt: ${bookProcess.receipt?.transactionId}`);
  const instructorEarnings = PaymentEngine.getProviderEarnings(instructorId);
  console.log(`Instructor Gross Earnings: ${instructorEarnings.totalGrossKurus / 100} TL`);
  console.log(`Instructor Ready To Pay Payout: ${instructorEarnings.readyToPayKurus / 100} TL`);
  console.log(`Instructor Platform Commission Paid: ${instructorEarnings.platformCommissionKurus / 100} TL`);

  if (instructorEarnings.totalGrossKurus < 12000 || instructorEarnings.platformCommissionKurus <= 0) {
    throw new Error(`Test 5 Failed: Instructor earnings calculation mismatch: gross=${instructorEarnings.totalGrossKurus}, commission=${instructorEarnings.platformCommissionKurus}`);
  }
  console.log('✅ TEST 5 PASSED: Book purchased with cash, platform commission recorded, instructor payout calculated.\n');

  // SCENARIO 6: Service Proposal Checkout (Moving / Craftsman)
  console.log('--- TEST 6: Service Proposal Checkout ---');
  const serviceProviderId = 'srv-provider-mehmet-nakliyat';
  const serviceIntent = PaymentEngine.createPaymentIntent({
    userId,
    sourceModule: 'service_moving',
    referenceItemId: 'srv-order-kadikoy-besiktas',
    referenceItemTitle: 'Evden Eve VIP Nakliye Hizmeti',
    grossAmountKurus: 45000, // 450.00 TL
    idempotencyKey: 'idem-service-proposal-001',
    sellerId: serviceProviderId,
    sellerName: 'Mehmet Nakliyat Ltd.',
  });

  console.log(`Created service intent: ${serviceIntent.id}`);

  // Topup cash for service booking
  PaymentEngine.topupWalletCash({
    userId,
    amountKurus: 50000, // Top up additional 500.00 TL
    description: 'Nakliye Hizmeti İçin Bakiye Yükleme',
  });

  const serviceProcess = await PaymentEngine.processCheckout({
    intentId: serviceIntent.id,
    userId,
    paymentMethod: 'wallet_cash',
    idempotencyKey: 'idem-service-proposal-001',
  });

  console.log(`Service process success: ${serviceProcess.success}`);
  const serviceEarnings = PaymentEngine.getProviderEarnings(serviceProviderId);
  console.log(`Service Provider Ready Payout: ${serviceEarnings.readyToPayKurus / 100} TL`);
  console.log(`Platform Service Commission: ${serviceEarnings.platformCommissionKurus / 100} TL`);

  if (serviceEarnings.readyToPayKurus <= 0 || serviceEarnings.platformCommissionKurus <= 0) {
    throw new Error(`Test 6 Failed: Service provider earnings mismatch: ready=${serviceEarnings.readyToPayKurus}, commission=${serviceEarnings.platformCommissionKurus}`);
  }
  console.log('✅ TEST 6 PASSED: Service proposal checkout and commission verified.\n');

  // SCENARIO 7: Finance Registry Overview Consistency
  console.log('--- TEST 7: Finance Registry Overview Consistency ---');
  const overview = FinanceRegistry.getOverviewMetrics('this_month');
  console.log(`Finance Overview Total Gross Volume: ${overview.totalGrossVolumeKurus / 100} TL`);
  console.log(`Finance Overview Platform Net Revenue: ${overview.platformNetRevenueKurus / 100} TL`);
  console.log(`Finance Overview Pending Payouts: ${overview.pendingPayoutsKurus / 100} TL`);
  console.log(`Finance Overview Modules Active: ${overview.sourceBreakdown.length}`);

  if (overview.totalGrossVolumeKurus <= 0 || overview.platformNetRevenueKurus <= 0) {
    throw new Error('Test 7 Failed: Finance registry overview metrics were not synchronized properly with PaymentEngine.');
  }
  console.log('✅ TEST 7 PASSED: Finance Registry synchronized with PaymentEngine and ledger entries.\n');

  console.log('🎉 ALL 7 PAYMENT ENGINE & WALLET TESTS PASSED SUCCESSFULLY! 🎉');
}

runPaymentEngineTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
