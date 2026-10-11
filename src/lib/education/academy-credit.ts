import { prisma } from '@/lib/prisma';
import { AcademyError } from './academy-server';
import { purchaseQuote } from './academy-rules';

export async function prepareCreditPurchase(userId: string, credits: number) {
  return prisma.creditPurchase.create({ data: { userId, ...purchaseQuote(credits) } });
}

/** Server-only integration point. The caller must verify the real gateway payment
 * signature AND reconcile its amount, currency and transaction with the provider.
 * Intentionally has no HTTP endpoint until a real gateway adapter is implemented. */
export async function settleVerifiedCreditPurchase(purchaseId: string, payment: {
  reference: string; totalKurus: number; currency: 'TRY';
}) {
  if (!payment.reference || payment.reference.length > 150 || payment.currency !== 'TRY') throw new AcademyError(400,'INVALID_PAYMENT');
  return prisma.$transaction(async tx => {
    const purchase = await tx.creditPurchase.findUnique({ where: { id: purchaseId } });
    if (!purchase || purchase.totalKurus !== payment.totalKurus) throw new AcademyError(409,'PAYMENT_MISMATCH');
    if (purchase.status === 'paid') {
      if (purchase.providerReference !== payment.reference) throw new AcademyError(409,'PAYMENT_MISMATCH');
      return purchase;
    }
    if (purchase.status !== 'pending') throw new AcademyError(409,'PAYMENT_MISMATCH');
    await tx.creditAccount.upsert({ where: { userId: purchase.userId },
      create: { userId: purchase.userId, balanceMilli: purchase.credits * 1000 },
      update: { balanceMilli: { increment: purchase.credits * 1000 } } });
    await tx.creditEntry.create({data:{userId:purchase.userId,key:`purchase:${purchaseId}`,amountMilli:BigInt(purchase.credits*1000),kind:'purchase',referenceId:purchaseId}});
    return tx.creditPurchase.update({ where: { id: purchaseId }, data: { status:'paid',providerReference:payment.reference } });
  },{ isolationLevel:'Serializable' });
}
