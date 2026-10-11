import { prisma } from '@/lib/prisma';
import { academySession, academyFailure, AcademyError } from '@/lib/education/academy-server';
import { platformJson } from '@/lib/platform/server';
export async function GET(request:Request) {
 try {
  const {owner}=await academySession(request);
  const account=await prisma.creditAccount.findUnique({where:{userId:owner.id}});
  const balance=Number(account?.balanceMilli??0)/1000;
  const purchases=await prisma.creditPurchase.aggregate({where:{userId:owner.id,status:'paid'},_sum:{credits:true}});
  return platformJson({success:true,wallet:{userId:owner.id,creditBalance:balance,educationCreditBalance:balance,purchasedCredits:purchases._sum.credits??0,promoCredits:0,spentCredits:0,refundedCredits:0,pendingRefundCredits:0,cashBalanceKurus:0,pendingBalanceKurus:0,currency:'TRY',createdAt:owner.createdAt,updatedAt:account?.updatedAt??owner.updatedAt},ledger:[],refundRequests:[],creditRate:{kurusPerCredit:200,tlPerCredit:2,label:'1 LifeOS Kredisi = 2 TL'},serviceRules:[],parental:null});
 }catch(error){return academyFailure(error);}
}
export async function POST(request:Request){try{await academySession(request);throw new AcademyError(503,'GATEWAY_NOT_CONFIGURED');}catch(error){return academyFailure(error);}}
