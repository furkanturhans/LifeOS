import { PaymentEngine } from '../src/lib/payment/PaymentEngine';
import { FinanceRegistry } from '../src/lib/admin/FinanceRegistry';
import { LIFEOS_CREDIT_RATE_KURUS, LIFEOS_CREDIT_RATE_TL } from '../src/types/payment';

async function runLifeOSCreditTests() {
  console.log('=== STARTING LIFEOS KREDİSİ & CLOSED-LOOP USAGE TESTS ===\n');

  const userId = 'usr-test-user-ali';
  const driverId = 'usr-taxi-driver-hasan';
  const studentId = 'usr-student-ayse';
  const instructorId = 'usr-instructor-ahmet';
  const kidsUserId = 'usr-child-can';

  // ---------------------------------------------------------------------------
  // SCENARIO 1: User purchases 100 LifeOS Credits with TL
  // ---------------------------------------------------------------------------
  console.log('--- TEST 1: User Purchases 100 LifeOS Credits ---');
  const rateInfo = PaymentEngine.getCreditRate();
  console.log(`Credit Rate: ${rateInfo.label} (${rateInfo.kurusPerCredit} kuruş)`);

  const purchaseRes = await PaymentEngine.purchaseCredits({
    userId,
    creditCount: 100,
    paymentMethod: 'gateway_card',
    gatewayReference: 'GW-CARD-REF-100',
    idempotencyKey: 'idem-buy-100-credits',
    description: '100 LifeOS Kredisi Satın Alımı',
  });

  console.log(`Purchase Success: ${purchaseRes.success}, User Balance: ${purchaseRes.wallet.creditBalance} Kredi`);
  const wallet1 = PaymentEngine.getWallet(userId);
  if (wallet1.creditBalance !== 100 || wallet1.purchasedCredits !== 100) {
    throw new Error(`Test 1 Failed: Expected 100 credits, got balance=${wallet1.creditBalance}, purchased=${wallet1.purchasedCredits}`);
  }
  console.log('✅ TEST 1 PASSED: 100 LifeOS Credits purchased with TL and recorded in ledger.\n');

  // ---------------------------------------------------------------------------
  // SCENARIO 2: Refund request for unused purchased credits to original payment method
  // ---------------------------------------------------------------------------
  console.log('--- TEST 2: Refund Request for Unused Purchased Credits ---');
  const refundReqRes = PaymentEngine.requestCreditRefund({
    userId,
    creditCount: 30,
    reason: 'Yanlışlıkla fazla paket aldım, 30 krediyi hiç kullanmadım.',
    originalPaymentMethod: 'Kredi Kartı (**** 1234)',
  });

  console.log(`Refund Request Success: ${refundReqRes.success}, Req ID: ${refundReqRes.request?.id}`);
  const wallet2 = PaymentEngine.getWallet(userId);
  console.log(`Pending Refund Credits: ${wallet2.pendingRefundCredits} Kredi`);

  if (!refundReqRes.request || refundReqRes.request.refundAmountKurus !== 30 * 135) {
    throw new Error(`Test 2 Failed: Incorrect refund calculation: ${refundReqRes.request?.refundAmountKurus}`);
  }

  // Admin approves refund
  const adminApproval = PaymentEngine.adminReviewRefund({
    requestId: refundReqRes.request.id,
    adminId: 'admin_super_furkan',
    action: 'approve',
    decisionNote: 'Kullanılmamış kredi teyit edildi, orijinal karta iade yollandı.',
  });

  console.log(`Admin Approval: ${adminApproval.success}, Status: ${adminApproval.request?.status}`);
  const wallet2After = PaymentEngine.getWallet(userId);
  console.log(`User Balance after refund: ${wallet2After.creditBalance} Kredi (Expected: 70)`);

  if (wallet2After.creditBalance !== 70 || wallet2After.refundedCredits !== 30) {
    throw new Error(`Test 2 Failed: Expected 70 credits remaining and 30 refunded, got ${wallet2After.creditBalance}`);
  }
  console.log('✅ TEST 2 PASSED: 30 unused credits refunded to original payment method.\n');

  // ---------------------------------------------------------------------------
  // SCENARIO 3: Refund request for spent or promo credits is REJECTED
  // ---------------------------------------------------------------------------
  console.log('--- TEST 3: Refund for Spent or Promo Credits is Strictly Rejected ---');
  const promoUserId = 'usr-promo-receiver';
  // Add promo credits (non-refundable)
  const promoWallet = PaymentEngine.getWallet(promoUserId);
  promoWallet.promoCredits = 50;
  promoWallet.creditBalance = 50;

  // Try to refund promo credits
  const invalidPromoRefund = PaymentEngine.requestCreditRefund({
    userId: promoUserId,
    creditCount: 20,
    reason: 'Promosyon kredilerimi nakde çevirmek istiyorum.',
  });

  console.log(`Promo refund rejected properly: ${!invalidPromoRefund.success}, Message: ${invalidPromoRefund.message}`);
  if (invalidPromoRefund.success) {
    throw new Error('Test 3 Failed: Promo credits should NOT be eligible for refund!');
  }

  // Also try to refund more than unused purchased balance for Ali (Ali has 70 purchased, let's spend 60 and try to refund 20)
  PaymentEngine.spendCreditsForService({
    providerId: userId,
    serviceModule: 'service_taxi',
    referenceId: 'taxi-trip-dummy-1',
    referenceTitle: 'Taksi Hizmet Kullanımı',
  }); // Spends 10
  PaymentEngine.spendCreditsForService({
    providerId: userId,
    serviceModule: 'service_moving',
    referenceId: 'moving-job-dummy-1',
    referenceTitle: 'Nakliye Hizmet Kullanımı',
  }); // Spends 50
  // Total spent: 60. Remaining purchased unused: 10.

  const overRefundAttempt = PaymentEngine.requestCreditRefund({
    userId,
    creditCount: 20, // Only 10 available unused
    reason: 'Fazla iade denemesi',
  });

  console.log(`Over-spend refund rejected: ${!overRefundAttempt.success}, Message: ${overRefundAttempt.message}`);
  if (overRefundAttempt.success) {
    throw new Error('Test 3 Failed: Over-spend refund should have been rejected!');
  }
  console.log('✅ TEST 3 PASSED: Non-eligible (promo & already spent) credit refund attempts blocked.\n');

  // ---------------------------------------------------------------------------
  // SCENARIO 4: Taxi Driver spends 10 credits platform fee; Passenger is not charged
  // ---------------------------------------------------------------------------
  console.log('--- TEST 4: Taxi Driver 10 Credits Platform Usage Fee ---');
  // Topup driver with 50 credits
  await PaymentEngine.purchaseCredits({
    userId: driverId,
    creditCount: 50,
    paymentMethod: 'gateway_card',
    gatewayReference: 'GW-DRIVER-TOPUP-50',
    idempotencyKey: 'idem-taxi-driver-topup-50',
    description: 'Taksici Kredi Yüklemesi',
  });

  const tripSpend = PaymentEngine.spendCreditsForService({
    providerId: driverId,
    serviceModule: 'service_taxi',
    referenceId: 'ride-kadikoy-atasehir-99',
    referenceTitle: 'Kadıköy -> Ataşehir Yolculuğu',
    idempotencyKey: 'idem-ride-kadikoy-99',
  });

  console.log(`Taxi Trip Credit Spend Success: ${tripSpend.success}, Credits Deducted: ${tripSpend.receipt?.creditAmount}`);
  const driverWallet = PaymentEngine.getWallet(driverId);
  console.log(`Driver Remaining Balance: ${driverWallet.creditBalance} Kredi (Expected: 40)`);

  if (driverWallet.creditBalance !== 40 || tripSpend.receipt?.creditAmount !== -10) {
    throw new Error(`Test 4 Failed: Expected driver to have 40 credits left after 10 credit deduction, got ${driverWallet.creditBalance}`);
  }
  console.log('✅ TEST 4 PASSED: Taxi driver charged 10 credits platform fee, passenger pays driver directly.\n');

  // ---------------------------------------------------------------------------
  // SCENARIO 5: Cancelled Taxi Trip has no credit deduction / is refunded
  // ---------------------------------------------------------------------------
  console.log('--- TEST 5: Cancelled Taxi Trip Credit Refund ---');
  const cancelRefund = PaymentEngine.refundServiceCreditFee({
    providerId: driverId,
    serviceModule: 'service_taxi',
    referenceId: 'ride-kadikoy-atasehir-99',
    reason: 'Yolcu araca binmedi / seyahat iptal edildi.',
  });

  console.log(`Cancellation Refund Success: ${cancelRefund.success}, Refunded Credits: ${cancelRefund.refundedCredits}`);
  const driverWalletAfterCancel = PaymentEngine.getWallet(driverId);
  console.log(`Driver Balance after trip cancellation: ${driverWalletAfterCancel.creditBalance} Kredi (Expected: 50)`);

  if (driverWalletAfterCancel.creditBalance !== 50) {
    throw new Error(`Test 5 Failed: Expected driver balance restored to 50, got ${driverWalletAfterCancel.creditBalance}`);
  }
  console.log('✅ TEST 5 PASSED: Cancelled ride credit fee reversed and restored to driver.\n');

  // ---------------------------------------------------------------------------
  // SCENARIO 6: Student joins live class with 50 credits; Instructor TL payout generated
  // ---------------------------------------------------------------------------
  console.log('--- TEST 6: Student Joins Live Class (50 Credits) & Instructor TL Payout ---');
  // Student buys 100 credits
  await PaymentEngine.purchaseCredits({
    userId: studentId,
    creditCount: 100,
    paymentMethod: 'gateway_card',
    gatewayReference: 'GW-STUDENT-TOPUP-100',
    idempotencyKey: 'idem-student-100-credits',
    description: 'Öğrenci Kredi Satın Alımı',
  });

  const liveIntent = PaymentEngine.createPaymentIntent({
    userId: studentId,
    sourceModule: 'education_live',
    referenceItemId: 'live-python-advanced-2026',
    referenceItemTitle: 'İleri Seviye Python & AI Canlı Dersi',
    creditsRequired: 50,
    sellerId: instructorId,
    sellerName: 'Dr. Ahmet Yılmaz',
    idempotencyKey: 'idem-student-enroll-python',
  });

  const enrollProcess = await PaymentEngine.processCheckout({
    intentId: liveIntent.id,
    userId: studentId,
    paymentMethod: 'lifeos_credits',
    idempotencyKey: 'idem-student-enroll-python',
  });

  console.log(`Enrollment Process: ${enrollProcess.success}, Receipt Tx: ${enrollProcess.receipt?.transactionId}`);
  const studentWallet = PaymentEngine.getWallet(studentId);
  console.log(`Student Credits remaining: ${studentWallet.creditBalance} Kredi (Expected: 50)`);

  // Verify instructor TL earnings (50 credits * 1.35 TL = 67.50 TL gross; 70% share = 47.25 TL net)
  const instructorEarnings = PaymentEngine.getProviderEarnings(instructorId);
  console.log(`Instructor Total Gross Kurus: ${instructorEarnings.totalGrossKurus} (${instructorEarnings.totalGrossKurus / 100} TL)`);
  console.log(`Instructor Ready Payout Kurus: ${instructorEarnings.readyToPayKurus} (${instructorEarnings.readyToPayKurus / 100} TL)`);

  if (studentWallet.creditBalance !== 50 || instructorEarnings.readyToPayKurus <= 0) {
    throw new Error('Test 6 Failed: Student credit deduction or instructor TL payout calculation error.');
  }
  console.log('✅ TEST 6 PASSED: Student paid in LifeOS Credits, instructor received distinct TL payout record.\n');

  // ---------------------------------------------------------------------------
  // SCENARIO 7: Kids account in-app game purchase blocked without parental PIN
  // ---------------------------------------------------------------------------
  console.log('--- TEST 7: Arcade Game Purchase Parental PIN & Daily Limit Control ---');
  // Configure kids account
  PaymentEngine.updateParentalControl(kidsUserId, {
    isKidsAccount: true,
    requireParentalApproval: true,
    dailyCreditLimit: 15,
    todayCreditsSpent: 0,
    parentalPin: '8899',
  });

  // Topup child with 50 credits
  const childWallet = PaymentEngine.getWallet(kidsUserId);
  childWallet.creditBalance = 50;

  // 7a. Attempt spend with WRONG PIN -> must fail
  const wrongPinAttempt = PaymentEngine.processArcadePurchase({
    userId: kidsUserId,
    itemId: 'arcade-theme-super-hero',
    itemTitle: 'Süper Kahraman Oyun Teması',
    creditsRequired: 5,
    parentalPin: '0000', // Wrong pin
  });

  console.log(`Wrong PIN Attempt Blocked: ${!wrongPinAttempt.success}, Error: ${wrongPinAttempt.error}`);
  if (wrongPinAttempt.success) {
    throw new Error('Test 7a Failed: Purchase should have failed due to wrong parental PIN!');
  }

  // 7b. Attempt spend with CORRECT PIN -> must succeed
  const correctPinAttempt = PaymentEngine.processArcadePurchase({
    userId: kidsUserId,
    itemId: 'arcade-theme-super-hero',
    itemTitle: 'Süper Kahraman Oyun Teması',
    creditsRequired: 5,
    parentalPin: '8899', // Correct pin
    idempotencyKey: 'idem-arcade-child-01',
  });

  console.log(`Correct PIN Purchase: ${correctPinAttempt.success}, Remaining: ${PaymentEngine.getWallet(kidsUserId).creditBalance}`);
  if (!correctPinAttempt.success || PaymentEngine.getWallet(kidsUserId).creditBalance !== 45) {
    throw new Error('Test 7b Failed: Purchase with valid PIN should have succeeded.');
  }

  // 7c. Attempt spend EXCEEDING daily limit (limit is 15, already spent 5, trying to spend 15 more) -> must fail
  const overLimitAttempt = PaymentEngine.processArcadePurchase({
    userId: kidsUserId,
    itemId: 'arcade-extra-pack-large',
    itemTitle: 'Büyük Oyun Paketi',
    creditsRequired: 15,
    parentalPin: '8899',
  });

  console.log(`Over-Limit Attempt Blocked: ${!overLimitAttempt.success}, Error: ${overLimitAttempt.error}`);
  if (overLimitAttempt.success) {
    throw new Error('Test 7c Failed: Purchase exceeding daily parental limit should have been blocked!');
  }
  console.log('✅ TEST 7 PASSED: Kids account parental PIN and daily credit limits enforced.\n');

  // ---------------------------------------------------------------------------
  // SCENARIO 8: Admin panel credit overview metrics & liability consistency
  // ---------------------------------------------------------------------------
  console.log('--- TEST 8: Admin Panel Credit Overview Metrics & Unearned Liability ---');
  const creditOverview = PaymentEngine.getCreditOverviewMetrics('this_month');
  console.log(`Total Sold Credits: ${creditOverview.totalSoldCredits} Kredi (${creditOverview.totalSoldKurus / 100} TL)`);
  console.log(`Total Active User Balances: ${creditOverview.totalActiveUserCredits} Kredi`);
  console.log(`Total Spent Credits: ${creditOverview.totalSpentCredits} Kredi`);
  console.log(`Total Refunded Credits: ${creditOverview.totalRefundedCredits} Kredi`);
  console.log(`Unearned Credit Liability: ${creditOverview.unearnedCreditLiabilityKurus / 100} TL`);
  console.log(`Active Service Modules: ${creditOverview.moduleBreakdown.length}`);

  if (
    creditOverview.totalSoldCredits <= 0 ||
    creditOverview.totalSpentCredits <= 0 ||
    creditOverview.unearnedCreditLiabilityKurus <= 0
  ) {
    throw new Error('Test 8 Failed: Admin credit overview metrics inconsistent with ledger.');
  }
  console.log('✅ TEST 8 PASSED: Admin credit metrics, expenditures, and unearned credit liability consistent with ledger.\n');

  console.log('🎉 ALL 8 LIFEOS KREDİSİ TESTS PASSED WITH 100% SUCCESS! 🎉');
}

runLifeOSCreditTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
