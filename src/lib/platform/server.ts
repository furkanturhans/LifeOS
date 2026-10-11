import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AcademyError } from '@/lib/education/academy-server';
import type { Prisma } from '@/generated/prisma/client';

export const publicPerson = { id:true, displayName:true, lifeosId:true } as const;
export const platformJson = (value: unknown) => NextResponse.json(JSON.parse(JSON.stringify(value, (_key, item) => {
  if (typeof item !== 'bigint') return item;
  const number=Number(item); if(!Number.isSafeInteger(number)) throw new AcademyError(400,'INVALID_AMOUNT'); return number;
})), { headers: { 'Cache-Control':'no-store' } });
export async function requireProfession(userId:string, profession:string, specialty?:string) {
  const application=await prisma.professionApplication.findFirst({where:{userId,profession,status:'approved',...(specialty?{specialty}:{}),OR:[{validUntil:null},{validUntil:{gt:new Date()}}]}});
  if(!application)throw new AcademyError(403,'PROFESSION_REQUIRED');
  return application;
}
export async function requireReviewer(userId:string) {
  const permission=await prisma.userPermission.findUnique({where:{userId_moduleId_resource:{userId,moduleId:'platform',resource:'profession-review'}}});
  if(!permission?.granted)throw new AcademyError(403,'FORBIDDEN');
}
export async function debit(tx:Prisma.TransactionClient,userId:string,amountMilli:number,key:string,kind:string,referenceId:string) {
  const changed=await tx.creditAccount.updateMany({where:{userId,balanceMilli:{gte:amountMilli}},data:{balanceMilli:{decrement:amountMilli}}});
  if(!changed.count)throw new AcademyError(402,'INSUFFICIENT_CREDITS');
  await tx.creditEntry.create({data:{userId,key,amountMilli:-BigInt(amountMilli),kind,referenceId}});
}
export async function threadAccess(threadId:string,userId:string) {
  const member=await prisma.lifechatMember.findUnique({where:{threadId_userId:{threadId,userId}},include:{thread:true}});
  if(!member)throw new AcademyError(403,'FORBIDDEN');
  const thread=member.thread;
  if(thread.kind==='class') {
    const classroom=await prisma.academyClass.findUnique({where:{id:thread.referenceId??''}});
    if(!classroom||classroom.archived)throw new AcademyError(403,'FORBIDDEN');
    if(classroom.ownerId===userId)await requireProfession(userId,'teacher');
    else {
      const enrollment=await prisma.academyMember.findUnique({where:{classId_userId:{classId:classroom.id,userId}}});
      if(!enrollment||enrollment.expiresAt<=new Date())throw new AcademyError(403,'ENROLL_REQUIRED');
    }
  }
  if(thread.kind==='moving'||thread.kind==='craftsman'||thread.kind==='taxi') {
    const unlock=await prisma.serviceUnlock.findUnique({where:{id:thread.referenceId??''},include:{request:true}});
    if(!unlock||![unlock.providerId,unlock.request.ownerId].includes(userId))throw new AcademyError(403,'FORBIDDEN');
    if(unlock.providerId===userId)await requireProfession(userId,unlock.request.kind,unlock.request.specialty);
  }
  return thread;
}
