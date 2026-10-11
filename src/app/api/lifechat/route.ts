import { prisma } from '@/lib/prisma';
import { AcademyError, academyBody, academyFailure, academySession, academyText, classroomAccess } from '@/lib/education/academy-server';
import { platformJson, publicPerson, requireProfession, threadAccess } from '@/lib/platform/server';
export const runtime='nodejs';
export async function GET(request:Request) {
  try {
    const {owner}=await academySession(request);const query=new URL(request.url).searchParams;
    const id=query.get('thread');
    if(id) {
      const thread=await threadAccess(id,owner.id);
      const before=query.get('before');const date=before?new Date(before):null;
      if(date&&!Number.isFinite(date.getTime()))throw new AcademyError(400,'INVALID_DATE');
      const messages=await prisma.lifechatMessage.findMany({where:{threadId:id,...(date?{createdAt:{lt:date}}:{})},include:{sender:{select:publicPerson}},orderBy:[{createdAt:'desc'},{id:'desc'}],take:50});
      // Read acknowledgement is bounded by the newest fetched message, not a future concurrent send.
      await prisma.lifechatMember.update({where:{threadId_userId:{threadId:id,userId:owner.id}},data:{readAt:messages[0]?.createdAt??new Date()}});
      const people=await prisma.lifechatMember.findMany({where:{threadId:id},select:{user:{select:publicPerson}}});
      const reference=thread.kind==='class'?{href:`/courses?class=${encodeURIComponent(thread.referenceId??'')}`}:
        ['moving','craftsman','taxi'].includes(thread.kind)?{href:`/services/${thread.kind==='moving'?'moving':thread.kind}?request=${encodeURIComponent((await prisma.serviceUnlock.findUnique({where:{id:thread.referenceId??''}}))?.requestId??'')}`} : null;
      return platformJson({thread,messages:messages.reverse(),people,userId:owner.id,reference,hasMore:messages.length===50});
    }
    const memberships=await prisma.lifechatMember.findMany({where:{userId:owner.id},include:{thread:{include:{messages:{orderBy:{createdAt:'desc'},take:1,include:{sender:{select:publicPerson}}},members:{select:{user:{select:publicPerson}}}}}},orderBy:{thread:{updatedAt:'desc'}},take:100});
    const items=[];
    for(const membership of memberships) {
      try{await threadAccess(membership.threadId,owner.id);}catch(error){if(error instanceof AcademyError&&error.status===403)continue;throw error;}
      const last=membership.thread.messages[0];
      items.push({...membership.thread,muted:membership.muted,archived:membership.archived,unread:Boolean(last&&last.senderId!==owner.id&&last.createdAt>membership.readAt)});
    }
    return platformJson({items,userId:owner.id});
  }catch(error){return academyFailure(error);}
}
export async function POST(request:Request) {
  try {
    const {owner}=await academySession(request);const body=await academyBody(request);
    if(body.action==='service') {
      const unlock=await prisma.serviceUnlock.findUnique({where:{id:academyText(body.unlockId,100)},include:{request:true}});
      if(!unlock||![unlock.providerId,unlock.request.ownerId].includes(owner.id))throw new AcademyError(403,'FORBIDDEN');
      const thread=await prisma.lifechatThread.findUnique({where:{key:`service:${unlock.id}`}});
      if(!thread)throw new AcademyError(404,'NOT_FOUND');await threadAccess(thread.id,owner.id);
      return platformJson({thread});
    }
    if(body.action==='class') {
      const classId=academyText(body.classId,100);const classroom=await classroomAccess(classId,owner.id);
      await requireProfession(classroom.ownerId,'teacher');
      const thread=await prisma.$transaction(async tx=>{
        const group=await tx.lifechatThread.upsert({where:{key:`class:${classId}`},create:{key:`class:${classId}`,kind:'class',referenceId:classId,title:classroom.title},update:{title:classroom.title}});
        const members=await tx.academyMember.findMany({where:{classId,expiresAt:{gt:new Date()}},select:{userId:true}});
        await tx.lifechatMember.createMany({data:[{threadId:group.id,userId:classroom.ownerId},...members.map(member=>({threadId:group.id,userId:member.userId}))],skipDuplicates:true});
        return group;
      });
      return platformJson({thread});
    }
    if(body.action==='personal') {
      const username=academyText(body.username,80).replace(/^@/,'');
      const target=await prisma.user.findFirst({where:{lifeosId:{equals:username,mode:'insensitive'}},select:publicPerson});
      if(!target||target.id===owner.id)throw new AcademyError(404,'NOT_FOUND');
      const key=`personal:${[owner.id,target.id].sort().join(':')}`;
      const thread=await prisma.lifechatThread.upsert({where:{key},create:{key,kind:'personal',title:'Lifechat',members:{create:[{userId:owner.id},{userId:target.id}]}},update:{}});
      return platformJson({thread});
    }
    const id=academyText(body.threadId,100);await threadAccess(id,owner.id);
    if(body.action==='preferences') {
      if(typeof body.muted!=='boolean'||typeof body.archived!=='boolean')throw new AcademyError(400,'INVALID_TEXT');
      await prisma.lifechatMember.update({where:{threadId_userId:{threadId:id,userId:owner.id}},data:{muted:body.muted,archived:body.archived}});return platformJson({ok:true});
    }
    if(body.action==='send') {
      const text=academyText(body.text,4000),clientKey=academyText(body.clientKey,100);
      const existing=await prisma.lifechatMessage.findUnique({where:{senderId_clientKey:{senderId:owner.id,clientKey}}});
      if(existing){if(existing.threadId!==id||existing.text!==text)throw new AcademyError(409,'CONFLICT');return platformJson({message:existing});}
      if(await prisma.lifechatMessage.count({where:{senderId:owner.id,createdAt:{gt:new Date(Date.now()-60000)}}})>=30)throw new AcademyError(429,'RATE_LIMIT');
      const message=await prisma.$transaction(async tx=>{
        const record=await tx.lifechatMessage.create({data:{threadId:id,senderId:owner.id,text,clientKey}});
        await tx.lifechatThread.update({where:{id},data:{updatedAt:new Date()}});return record;
      });
      return platformJson({message});
    }
    throw new AcademyError(400,'INVALID_TEXT');
  }catch(error){return academyFailure(error);}
}
