import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { AcademyError, academySession, academyFailure, academyText, academyInteger, classroomAccess, academyBody, finalizeExpiredExams } from '@/lib/education/academy-server';
import { purchaseQuote, tuitionSplit, accessExpiry, validateQuestions, gradeAnswers, type AcademyQuestion } from '@/lib/education/academy-rules';
import { BigBlueButtonProvider } from '@/lib/education/BigBlueButtonProvider';
import { requireProfession } from '@/lib/platform/server';

export const runtime = 'nodejs';
const person = { select: { id:true, displayName:true, lifeosId:true } };
const json = (data: unknown) => NextResponse.json(JSON.parse(JSON.stringify(data,(_key,value)=>{
  if(typeof value!=='bigint')return value;
  const amount=Number(value);if(!Number.isSafeInteger(amount))throw new AcademyError(400,'INVALID_AMOUNT');return amount;
})),{headers:{'Cache-Control':'no-store'}});

export async function GET(request: Request) {
  try {
    const { owner, canTeach } = await academySession(request);
    const params = new URL(request.url).searchParams;
    const view = params.get('view') || 'classes';
    const classId = params.get('classId');
    if (classId) await classroomAccess(classId,owner.id);
    if (view === 'classes') {
      const classes = await prisma.academyClass.findMany({ where:{archived:false}, take:100, orderBy:{createdAt:'desc'},
        select:{id:true,ownerId:true,title:true,subject:true,description:true,mode:true,location:true,capacity:true,dailyMilli:true,monthlyMilli:true,owner:person,
          members:{where:{expiresAt:{gt:new Date()}},select:{userId:true,seat:true,expiresAt:true,plan:true}},_count:{select:{exams:true}}} });
      const wallet = await prisma.creditAccount.findUnique({where:{userId:owner.id}});
      const approved=await prisma.professionApplication.findMany({where:{userId:{in:classes.map(c=>c.ownerId)},profession:'teacher',status:'approved',OR:[{validUntil:null},{validUntil:{gt:new Date()}}]},select:{userId:true,legalName:true}});
      // Public seat map reveals occupancy, never the identities of other students.
      return json({canTeach,userId:owner.id,balanceMilli:wallet?.balanceMilli ?? 0,items:classes.filter(c=>approved.some(a=>a.userId===c.ownerId)).map(c=>({...c,owner:{...c.owner,displayName:approved.find(a=>a.userId===c.ownerId)!.legalName},members:undefined,
        occupiedSeats:c.members.flatMap(m=>m.seat ? [m.seat] : []),member:c.members.find(m=>m.userId===owner.id) ?? null}))});
    }
    if (view === 'notes') return json({items:await prisma.academyNote.findMany({where:{userId:owner.id,...(classId?{classId}:{})},orderBy:{updatedAt:'desc'},take:100})});
    if (view === 'posts') return json({items:await prisma.academyPost.findMany({where:{classId:classId ?? null,kind:params.get('kind')==='article'?'article':'discussion',...(canTeach?{}:{audience:{not:'teachers'}})},include:{author:person,_count:{select:{replies:true}}},orderBy:{createdAt:'desc'},take:100})});
    if (view === 'replies') {
      const post = await prisma.academyPost.findUnique({where:{id:params.get('postId') ?? ''}});
      if (!post) throw new AcademyError(404,'NOT_FOUND');
      if (post.classId) await classroomAccess(post.classId,owner.id);
      if (post.audience==='teachers'&&!canTeach) throw new AcademyError(403,'TEACHER_REQUIRED');
      return json({items:await prisma.academyReply.findMany({where:{postId:post.id},include:{author:person},orderBy:{createdAt:'asc'},take:100})});
    }
    if (view === 'members') {
      if (!classId) throw new AcademyError(400,'NOT_FOUND');
      const classroom=await classroomAccess(classId,owner.id);
      if(classroom.ownerId!==owner.id) throw new AcademyError(403,'FORBIDDEN');
      return json({items:await prisma.academyMember.findMany({where:{classId},include:{user:person},orderBy:{createdAt:'desc'},take:100})});
    }
    if (view === 'exams') {
      await finalizeExpiredExams({userId:owner.id});
      const ids = classId ? [classId] : (await prisma.academyClass.findMany({where:{archived:false,OR:[{ownerId:owner.id},{members:{some:{userId:owner.id}}}]},select:{id:true}})).map(c=>c.id);
      const exams=await prisma.academyExam.findMany({where:{classId:{in:ids}},include:{classroom:{select:{title:true,ownerId:true}},attempts:{where:{userId:owner.id},select:{id:true,score:true,deadline:true,submittedAt:true}}},orderBy:{opensAt:'desc'},take:100});
      return json({items:exams.map(({questions,...exam})=>({...exam,available:exam.opensAt<=new Date()&&exam.closesAt>new Date(),questionCount:Array.isArray(questions)?questions.length:0}))});
    }
    if(view==='results') {
      if(!classId) throw new AcademyError(400,'NOT_FOUND');
      const classroom=await classroomAccess(classId,owner.id);
      if(classroom.ownerId!==owner.id) throw new AcademyError(403,'FORBIDDEN');
      await finalizeExpiredExams({exam:{classId}});
      return json({items:await prisma.academyAttempt.findMany({where:{exam:{classId}},select:{id:true,score:true,submittedAt:true,deadline:true,user:person,exam:{select:{title:true}}},take:100,orderBy:{startedAt:'desc'}})});
    }
    if(view==='wallet') return json({userId:owner.id,balanceMilli:(await prisma.creditAccount.findUnique({where:{userId:owner.id}}))?.balanceMilli ?? 0,
      entries:await prisma.creditEntry.findMany({where:{userId:owner.id},orderBy:{createdAt:'desc'},take:100}),charges:await prisma.academyCharge.findMany({where:{OR:[{studentId:owner.id},{teacherId:owner.id}]},include:{classroom:{select:{title:true}}},orderBy:{createdAt:'desc'},take:50}),purchases:await prisma.creditPurchase.findMany({where:{userId:owner.id},orderBy:{createdAt:'desc'},take:50})});
    throw new AcademyError(400,'INVALID_ACTION');
  } catch(error) { return academyFailure(error); }
}

export async function POST(request: Request) {
  try {
    const {owner,canTeach}=await academySession(request);
    if(Number(request.headers.get('content-length') ?? 0)>150000) throw new AcademyError(413,'INVALID_TEXT');
    const body=await academyBody(request);
    const classId=typeof body.classId==='string'?body.classId:'';
    if(body.action==='create-class') {
      if(!canTeach) throw new AcademyError(403,'TEACHER_REQUIRED');
      if(typeof body.mode!=='string'||!['online','physical','hybrid'].includes(body.mode)) throw new AcademyError(400,'INVALID_ACTION');
      const item=await prisma.academyClass.create({data:{ownerId:owner.id,title:academyText(body.title,120),subject:academyText(body.subject,80),description:academyText(body.description ?? '',2000,false),mode:body.mode,location:academyText(body.location ?? '',250,body.mode!=='online'),capacity:academyInteger(body.capacity,1,body.mode==='physical'?70:69),dailyMilli:academyInteger(body.daily,0,100000)*1000,monthlyMilli:academyInteger(body.monthly,0,100000)*1000}});
      return json({item});
    }
    if(body.action==='enroll') {
      const seat=academyInteger(body.seat,1,70);
      if(body.plan!=='daily'&&body.plan!=='monthly') throw new AcademyError(400,'INVALID_ACTION');
      const key=academyText(body.key,80);
      const receipt=await prisma.academyCharge.findUnique({where:{key}});
      if(receipt) {
        if(receipt.studentId!==owner.id||receipt.classId!==classId||receipt.plan!==body.plan)throw new AcademyError(409,'CONFLICT');
        return json({item:await prisma.academyMember.findUnique({where:{classId_userId:{classId,userId:owner.id}}})});
      }
      const preflight=await prisma.academyClass.findUnique({where:{id:classId}});
      if(!preflight||preflight.archived)throw new AcademyError(404,'NOT_FOUND');
      await requireProfession(preflight.ownerId,'teacher');
      if(preflight.mode!=='physical') {
        const bbb=new BigBlueButtonProvider();
        if(!bbb.isConfigured())throw new AcademyError(503,'LIVE_NOT_CONFIGURED');
        if(body.plan==='daily'&&(!preflight.meetingId||!await bbb.isMeetingRunning(preflight.meetingId)))throw new AcademyError(409,'TEACHER_NOT_STARTED');
      }
      const item=await prisma.$transaction(async tx=>{
        const classroom=await tx.academyClass.findUnique({where:{id:classId}});
        if(!classroom||classroom.archived) throw new AcademyError(404,'NOT_FOUND');
        if(classroom.ownerId===owner.id) throw new AcademyError(400,'FORBIDDEN');
        if(seat>classroom.capacity) throw new AcademyError(400,'INVALID_SEAT');
        const previousCharge=await tx.academyCharge.findUnique({where:{key}});
        if(previousCharge) {
          if(previousCharge.studentId!==owner.id||previousCharge.classId!==classId||previousCharge.plan!==body.plan) throw new AcademyError(409,'CONFLICT');
          return tx.academyMember.findUnique({where:{classId_userId:{classId,userId:owner.id}}});
        }
        const current=await tx.academyMember.findUnique({where:{classId_userId:{classId,userId:owner.id}}});
        if(current&&current.expiresAt>new Date()) return current;
        await tx.academyMember.updateMany({where:{classId,expiresAt:{lte:new Date()}},data:{seat:null}});
        const occupied=await tx.academyMember.findFirst({where:{classId,seat}});
        if(occupied) throw new AcademyError(409,'SEAT_TAKEN');
        const split=tuitionSplit(body.plan==='monthly'?classroom.monthlyMilli:classroom.dailyMilli);
        if(split.grossMilli>0) {
          const debit=await tx.creditAccount.updateMany({where:{userId:owner.id,balanceMilli:{gte:split.grossMilli}},data:{balanceMilli:{decrement:split.grossMilli}}});
          if(debit.count!==1) throw new AcademyError(402,'INSUFFICIENT_CREDITS');
          await tx.creditAccount.upsert({where:{userId:classroom.ownerId},create:{userId:classroom.ownerId,balanceMilli:split.teacherMilli},update:{balanceMilli:{increment:split.teacherMilli}}});
          await tx.creditEntry.createMany({data:[{userId:owner.id,key:`class:${key}:student`,amountMilli:-BigInt(split.grossMilli),kind:'class-payment',referenceId:classId},{userId:classroom.ownerId,key:`class:${key}:teacher`,amountMilli:BigInt(split.teacherMilli),kind:'class-income',referenceId:classId}]});
        }
        await tx.academyCharge.create({data:{key,classId,studentId:owner.id,teacherId:classroom.ownerId,...split,plan:body.plan as string}});
        const expiresAt=accessExpiry(body.plan as 'daily'|'monthly');
        return tx.academyMember.upsert({where:{classId_userId:{classId,userId:owner.id}},create:{classId,userId:owner.id,seat,plan:body.plan as string,expiresAt},update:{seat,plan:body.plan as string,expiresAt,physicalRegistration:false}});
      },{isolationLevel:'Serializable'});
      return json({item});
    }
    if(body.action==='register-student') {
      const classroom=await classroomAccess(classId,owner.id);
      if(!canTeach||classroom.ownerId!==owner.id||classroom.mode==='online') throw new AcademyError(403,'FORBIDDEN');
      const student=await prisma.user.findUnique({where:{lifeosId:academyText(body.username,80).replace(/^@/,'')}});
      if(!student||student.id===owner.id) throw new AcademyError(404,'PROFILE_REQUIRED');
      const days=academyInteger(body.days,1,365);
      await prisma.$transaction(async tx=>{
        const now=new Date();
        const existing=await tx.academyMember.findUnique({where:{classId_userId:{classId,userId:student.id}}});
        if(existing&&existing.expiresAt>now)throw new AcademyError(409,'CONFLICT');
        await tx.academyMember.updateMany({where:{classId,expiresAt:{lte:now}},data:{seat:null}});
        const occupied=await tx.academyMember.findMany({where:{classId,expiresAt:{gt:now}},select:{seat:true}});
        const seat=Array.from({length:classroom.capacity},(_,i)=>i+1).find(value=>!occupied.some(member=>member.seat===value));
        if(!seat||occupied.length>=classroom.capacity)throw new AcademyError(409,'SEAT_TAKEN');
        const expiresAt=new Date(now.getTime()+days*86400000);
        await tx.academyMember.upsert({where:{classId_userId:{classId,userId:student.id}},create:{classId,userId:student.id,seat,plan:'physical',physicalRegistration:true,expiresAt},update:{seat,expiresAt,plan:'physical',physicalRegistration:true}});
      },{isolationLevel:'Serializable'});
      return json({ok:true});
    }
    if(body.action==='note') {
      const previous=body.id?await prisma.academyNote.findFirst({where:{id:academyText(body.id,80),userId:owner.id}}):null;
      if(body.id&&!previous)throw new AcademyError(404,'NOT_FOUND');
      if(classId&&previous?.classId!==classId) await classroomAccess(classId,owner.id);
      const data={title:academyText(body.title,120),content:academyText(body.content,20000,false),classId:classId||null};
      if(body.id) { const result=await prisma.academyNote.updateMany({where:{id:academyText(body.id,80),userId:owner.id},data});if(!result.count)throw new AcademyError(404,'NOT_FOUND'); }
      else await prisma.academyNote.create({data:{...data,userId:owner.id}});
      return json({ok:true});
    }
    if(body.action==='post') {
      if(classId) await classroomAccess(classId,owner.id);
      if(typeof body.kind!=='string'||typeof body.audience!=='string'||!['discussion','article'].includes(body.kind)||!['all','students','teachers'].includes(body.audience)) throw new AcademyError(400,'INVALID_ACTION');
      if(body.audience==='teachers'&&!canTeach) throw new AcademyError(403,'TEACHER_REQUIRED');
      const recent=await prisma.academyPost.count({where:{authorId:owner.id,createdAt:{gt:new Date(Date.now()-60000)}}});
      if(recent>=5) throw new AcademyError(429,'RATE_LIMIT');
      await prisma.academyPost.create({data:{authorId:owner.id,classId:classId||null,kind:body.kind,audience:body.audience,title:academyText(body.title,120),content:academyText(body.content,20000)}});
      return json({ok:true});
    }
    if(body.action==='reply') {
      const post=await prisma.academyPost.findUnique({where:{id:academyText(body.postId,80)}});
      if(!post) throw new AcademyError(404,'NOT_FOUND');
      if(post.classId)await classroomAccess(post.classId,owner.id);
      if(post.audience==='teachers'&&!canTeach) throw new AcademyError(403,'TEACHER_REQUIRED');
      const recent=await prisma.academyReply.count({where:{authorId:owner.id,createdAt:{gt:new Date(Date.now()-60000)}}});
      if(recent>=10)throw new AcademyError(429,'RATE_LIMIT');
      await prisma.academyReply.create({data:{authorId:owner.id,postId:post.id,content:academyText(body.content,4000)}});
      return json({ok:true});
    }
    if(body.action==='create-exam') {
      const classroom=await classroomAccess(classId,owner.id);
      if(!canTeach||classroom.ownerId!==owner.id) throw new AcademyError(403,'TEACHER_REQUIRED');
      const opensAt=new Date(String(body.opensAt)),closesAt=new Date(String(body.closesAt));
      if(!Number.isFinite(opensAt.getTime())||!Number.isFinite(closesAt.getTime())||closesAt<=opensAt)throw new AcademyError(400,'INVALID_EXAM');
      let questions;try{questions=validateQuestions(body.questions);}catch{throw new AcademyError(400,'INVALID_EXAM');}
      await prisma.academyExam.create({data:{classId,title:academyText(body.title,120),durationMinutes:academyInteger(body.duration,1,180),opensAt,closesAt,questions}});
      return json({ok:true});
    }
    if(body.action==='start-exam') {
      const exam=await prisma.academyExam.findUnique({where:{id:academyText(body.examId,80)}});
      if(!exam)throw new AcademyError(404,'NOT_FOUND');
      await classroomAccess(exam.classId,owner.id);
      const now=new Date();if(now<exam.opensAt||now>=exam.closesAt)throw new AcademyError(409,'EXAM_CLOSED');
      const attempt=await prisma.academyAttempt.upsert({where:{examId_userId:{examId:exam.id,userId:owner.id}},create:{examId:exam.id,userId:owner.id,deadline:new Date(Math.min(now.getTime()+exam.durationMinutes*60000,exam.closesAt.getTime()))},update:{}});
      if(attempt.submittedAt||attempt.deadline<=now)throw new AcademyError(409,'EXAM_CLOSED');
      const questions=exam.questions as AcademyQuestion[];
      return json({attempt,remainingSeconds:Math.max(0,Math.ceil((attempt.deadline.getTime()-Date.now())/1000)),questions:questions.map(({text,options})=>({text,options})),title:exam.title});
    }
    if(body.action==='save-answers'||body.action==='submit-exam') {
      const id=academyText(body.attemptId,80);
      const item=await prisma.$transaction(async tx=>{
        const attempt=await tx.academyAttempt.findFirst({where:{id,userId:owner.id},include:{exam:true}});
        if(!attempt)throw new AcademyError(404,'NOT_FOUND');
        if(attempt.submittedAt)return {score:attempt.score,submittedAt:attempt.submittedAt};
        const questions=attempt.exam.questions as AcademyQuestion[];
        if(!body.answers||typeof body.answers!=='object'||Array.isArray(body.answers))throw new AcademyError(400,'INVALID_EXAM');
        const answers:Record<string,number>={};
        for(const [key,value]of Object.entries(body.answers)) {
          if(!/^\d+$/.test(key)||!questions[Number(key)]||typeof value!=='number'||!Number.isInteger(value)||value<0||value>=questions[Number(key)].options.length)throw new AcademyError(400,'INVALID_EXAM');
          answers[key]=value;
        }
        const expired=new Date()>=attempt.deadline;
        const accepted=expired ? attempt.answers as Record<string,number> : answers;
        const submit=expired||body.action==='submit-exam';
        return tx.academyAttempt.update({where:{id},data:{answers:accepted,...(submit?{score:gradeAnswers(questions,accepted),submittedAt:new Date()}:{})},select:{score:true,submittedAt:true}});
      },{isolationLevel:'Serializable'});
      return json({item});
    }
    if(body.action==='join') {
      const classroom=await classroomAccess(classId,owner.id);
      if(classroom.mode==='physical')throw new AcademyError(409,'PHYSICAL_CLASS');
      const bbb=new BigBlueButtonProvider();if(!bbb.isConfigured())throw new AcademyError(503,'LIVE_NOT_CONFIGURED');
      const moderator=classroom.ownerId===owner.id;
      if(moderator&&!canTeach)throw new AcademyError(403,'TEACHER_REQUIRED');
      if(!moderator&&(!classroom.meetingId||!await bbb.isMeetingRunning(classroom.meetingId)))throw new AcademyError(409,'TEACHER_NOT_STARTED');
      let meeting=classroom;
      if(!meeting.meetingId) {
        if(!moderator)throw new AcademyError(409,'TEACHER_NOT_STARTED');
        const id=`academy-${classId}`;
        await prisma.academyClass.updateMany({where:{id:classId,meetingId:null},data:{meetingId:id,attendeePassword:randomUUID(),moderatorPassword:randomUUID()}});
        meeting=(await prisma.academyClass.findUnique({where:{id:classId}}))!;
      }
      if(moderator){const result=await bbb.createMeeting({meetingId:meeting.meetingId!,meetingName:meeting.title,attendeePW:meeting.attendeePassword!,moderatorPW:meeting.moderatorPassword!,maxParticipants:meeting.capacity+1,logoutUrl:new URL('/courses',request.url).href});if(!result.success)throw new AcademyError(503,'LIVE_NOT_CONFIGURED');}
      const verifiedName=moderator?(await requireProfession(owner.id,'teacher')).legalName:owner.displayName;
      const result=bbb.getJoinUrl({meetingId:meeting.meetingId!,userId:owner.id,fullName:verifiedName,isModerator:moderator,password:moderator?meeting.moderatorPassword!:meeting.attendeePassword!});
      if(!result.success)throw new AcademyError(503,'LIVE_NOT_CONFIGURED');
      return json({joinUrl:result.joinUrl});
    }
    if(body.action==='end-class') {
      const classroom=await classroomAccess(classId,owner.id);
      if(!canTeach||classroom.ownerId!==owner.id)throw new AcademyError(403,'TEACHER_REQUIRED');
      if(!classroom.meetingId)return json({ok:true});
      const bbb=new BigBlueButtonProvider();
      const result=await bbb.endMeeting({meetingId:classroom.meetingId,moderatorPW:classroom.moderatorPassword!});
      if(!result.success)throw new AcademyError(503,'LIVE_NOT_CONFIGURED');
      return json({ok:true});
    }
    if(body.action==='purchase-quote') return json({quote:purchaseQuote(academyInteger(body.credits,1,100000)),checkoutAvailable:false});
    // Gateway adapters in this repository are scaffolds, not real payment integrations.
    // Do not grant credit for a client-supplied payment reference or simulated approval.
    throw new AcademyError(400,'INVALID_ACTION');
  } catch(error) {return academyFailure(error);}
}
