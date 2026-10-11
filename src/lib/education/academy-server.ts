import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export class AcademyError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}
export async function academySession(request: Request) {
  const origin = request.headers.get('origin');
  if (request.method !== 'GET' && origin && origin !== new URL(request.url).origin) throw new AcademyError(403,'FORBIDDEN');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || /placeholder|your[_-]/.test(url)) throw new AcademyError(503,'SETUP_REQUIRED');
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new AcademyError(401,'SIGN_IN');
  const owner = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!owner) throw new AcademyError(409,'PROFILE_REQUIRED');
  const profession = await prisma.professionApplication.findFirst({ where: { userId: owner.id, profession:'teacher', status:'approved', OR:[{validUntil:null},{validUntil:{gt:new Date()}}] } });
  return { owner, canTeach: Boolean(profession) };
}
export function academyFailure(error: unknown) {
  if (error instanceof AcademyError) return NextResponse.json({ error: error.code },{ status: error.status });
  const code = error && typeof error === 'object' && 'code' in error ? error.code : '';
  if (code === 'P2002' || code === 'P2034') return NextResponse.json({ error:'CONFLICT' },{ status:409 });
  return NextResponse.json({ error:'UNAVAILABLE' },{ status:503 });
}
export function academyText(value: unknown, max: number, required = true) {
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) throw new AcademyError(400,'INVALID_TEXT');
  return value.trim();
}
export function academyInteger(value: unknown, min: number, max: number) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) throw new AcademyError(400,'INVALID_AMOUNT');
  return value;
}
export async function academyBody(request: Request): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader();
  if (!reader) throw new AcademyError(400,'INVALID_TEXT');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 150000) { await reader.cancel(); throw new AcademyError(413,'INVALID_TEXT'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body;
  } catch { throw new AcademyError(400,'INVALID_TEXT'); }
}
export async function finalizeExpiredExams(filter: { userId?: string; exam?: { classId: string } }) {
  const expired = await prisma.academyAttempt.findMany({
    where: { ...filter, submittedAt:null, deadline:{lte:new Date()} }, include: {exam:true}, take:100,
  });
  // Do not overwrite an attempt submitted concurrently by the student.
  const { gradeAnswers } = await import('./academy-rules');
  for (const candidate of expired) {
    await prisma.$transaction(async tx=>{
      const attempt=await tx.academyAttempt.findFirst({where:{id:candidate.id,submittedAt:null,deadline:{lte:new Date()}},include:{exam:true}});
      if(!attempt)return;
      await tx.academyAttempt.updateMany({where:{id:attempt.id,submittedAt:null},data:{
        submittedAt:attempt.deadline,score:gradeAnswers(attempt.exam.questions as import('./academy-rules').AcademyQuestion[],attempt.answers as Record<string,number>),
      }});
    },{isolationLevel:'Serializable'});
  }
}
export async function classroomAccess(classId: string, userId: string) {
  const classroom = await prisma.academyClass.findUnique({ where:{ id:classId } });
  if (!classroom || classroom.archived) throw new AcademyError(404,'NOT_FOUND');
  if (classroom.ownerId !== userId) {
    const member = await prisma.academyMember.findUnique({ where: { classId_userId:{classId,userId} } });
    if (!member || member.expiresAt <= new Date()) throw new AcademyError(403,'ENROLL_REQUIRED');
  }
  return classroom;
}
