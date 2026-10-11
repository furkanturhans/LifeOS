import { prisma } from '@/lib/prisma';
import { AcademyError, academyBody, academyFailure, academyInteger, academySession, academyText } from '@/lib/education/academy-server';
import { debit, platformJson, publicPerson, requireProfession } from '@/lib/platform/server';
import { containsContact, coordinates, distanceKm, SERVICE_FEE_MILLI, TAXI_PASS_MILLI, validSpecialty } from '@/lib/platform/rules';
export const runtime='nodejs';
const safeFields={id:true,kind:true,specialty:true,title:true,description:true,region:true,scheduledAt:true,status:true,createdAt:true} as const;
export async function GET(request:Request) {
  try{
    const {owner}=await academySession(request);const query=new URL(request.url).searchParams;
    const kind=query.get('kind')??'moving';if(!['moving','craftsman','taxi'].includes(kind))throw new AcademyError(400,'INVALID_TEXT');
    const id=query.get('id');
    if(id) {
      const item=await prisma.serviceRequest.findUnique({where:{id},include:{unlocks:{include:{provider:{select:publicPerson}}}}});
      if(!item)throw new AcademyError(404,'NOT_FOUND');
      if(item.ownerId===owner.id){
        const drivers=item.kind==='taxi'&&item.acceptedUnlockId?await prisma.professionApplication.findMany({where:{userId:{in:item.unlocks.map(unlock=>unlock.providerId)},profession:'taxi',status:'approved'},select:{userId:true,legalName:true,vehiclePlate:true,vehicleModel:true}}):[];
        const location=item.kind==='taxi'&&item.acceptedUnlockId?await prisma.taxiLocation.findUnique({where:{userId:item.unlocks.find(unlock=>unlock.id===item.acceptedUnlockId)?.providerId??''},select:{latitude:true,longitude:true,updatedAt:true}}):null;
        return platformJson({item:{...item,drivers,location:location&&location.updatedAt>new Date(Date.now()-120000)?location:null}});
      }
      const unlock=item.unlocks.find(entry=>entry.providerId===owner.id);
      if(!unlock)throw new AcademyError(403,'PAYMENT_REQUIRED');
      await requireProfession(owner.id,item.kind,item.specialty);
      const customer=await prisma.user.findUnique({where:{id:item.ownerId},select:publicPerson});
      const thread=await prisma.lifechatThread.findUnique({where:{key:`service:${unlock.id}`},select:{id:true}});
      return platformJson({item:{...Object.fromEntries(Object.keys(safeFields).map(key=>[key,item[key as keyof typeof safeFields]])),address:item.address,destination:item.destination,phone:item.phone,customer,unlock,threadId:thread?.id}});
    }
    const own=query.get('view')==='mine',unlocked=query.get('view')==='unlocked';
    const where=own?{ownerId:owner.id,kind}:unlocked?{kind,unlocks:{some:{providerId:owner.id}}}:{kind,status:'open',ownerId:{not:owner.id}};
    const items=await prisma.serviceRequest.findMany({where,select:{...safeFields,latitude:true,longitude:true,unlocks:{where:{providerId:owner.id},select:{id:true}}},orderBy:{createdAt:'desc'},take:100});
    const applications=await prisma.professionApplication.findMany({where:{userId:owner.id,profession:kind,status:'approved',OR:[{validUntil:null},{validUntil:{gt:new Date()}}]},select:{specialty:true,legalName:true}});
    const pass=kind==='taxi'?await prisma.taxiPass.findFirst({where:{userId:owner.id,expiresAt:{gt:new Date()}},orderBy:{expiresAt:'desc'}}):null;
    const location=kind==='taxi'?await prisma.taxiLocation.findUnique({where:{userId:owner.id}}):null;
    const market=kind==='taxi'&&!own&&!unlocked;
    const visible=market&&(!pass||!location?.online||location.updatedAt<new Date(Date.now()-120000))?[]:items;
    const publicItems=visible.map(item=>{const {latitude,longitude,...safe}=item;return {...safe,distanceKm:market&&location&&latitude!==null&&longitude!==null?Math.round(distanceKm(location,{latitude,longitude})*10)/10:null};});
    if(market)publicItems.sort((a,b)=>(a.distanceKm??Infinity)-(b.distanceKm??Infinity));
    return platformJson({items:publicItems,applications,pass,online:location?.online??false,balanceMilli:(await prisma.creditAccount.findUnique({where:{userId:owner.id}}))?.balanceMilli??0,feeMilli:SERVICE_FEE_MILLI});
  }catch(error){return academyFailure(error);}
}
export async function POST(request:Request) {
  try{
    const {owner}=await academySession(request);const body=await academyBody(request);
    if(body.action==='location') {
      await requireProfession(owner.id,'taxi','driver');
      if(typeof body.online!=='boolean')throw new AcademyError(400,'INVALID_TEXT');
      if(!body.online){await prisma.taxiLocation.updateMany({where:{userId:owner.id},data:{online:false}});return platformJson({ok:true});}
      const pass=await prisma.taxiPass.findFirst({where:{userId:owner.id,expiresAt:{gt:new Date()}}});if(!pass)throw new AcademyError(402,'TAXI_PASS_REQUIRED');
      let point;try{point=coordinates(body.latitude,body.longitude);}catch{throw new AcademyError(400,'INVALID_LOCATION');}
      await prisma.taxiLocation.upsert({where:{userId:owner.id},create:{userId:owner.id,...point,online:true},update:{...point,online:true}});return platformJson({ok:true});
    }
    if(body.action==='create') {
      const kind=academyText(body.kind,30),specialty=academyText(body.specialty,40);
      if(!['moving','craftsman','taxi'].includes(kind)||!validSpecialty(kind,specialty))throw new AcademyError(400,'INVALID_TEXT');
      const title=academyText(body.title,120),description=academyText(body.description,4000),region=academyText(body.region,120);
      if([title,description,region].some(containsContact))throw new AcademyError(400,'CONTACT_IN_DESCRIPTION');
      const scheduledAt=new Date(String(body.scheduledAt));if(!Number.isFinite(scheduledAt.getTime())||scheduledAt<new Date())throw new AcademyError(400,'INVALID_DATE');
      const phone=academyText(body.phone??'',30,false);
      if(phone&&!/^\+?[\d ()-]{10,25}$/.test(phone))throw new AcademyError(400,'INVALID_PHONE');
      if(await prisma.serviceRequest.count({where:{ownerId:owner.id,status:'open'}})>=20)throw new AcademyError(429,'REQUEST_LIMIT');
      let point:{latitude:number;longitude:number}|undefined;
      if(kind==='taxi'){try{point=coordinates(body.latitude,body.longitude);}catch{throw new AcademyError(400,'INVALID_LOCATION');}}
      const item=await prisma.serviceRequest.create({data:{ownerId:owner.id,kind,specialty,title,description,region,scheduledAt,address:academyText(body.address,500),destination:academyText(body.destination??'',500,false)||null,phone:phone||null,...point}});
      return platformJson({item:{id:item.id}});
    }
    if(body.action==='taxi-pass') {
      await requireProfession(owner.id,'taxi','driver');
      const key=academyText(body.key,100);
      const pass=await prisma.$transaction(async tx=>{
        const verified=await tx.professionApplication.findFirst({where:{userId:owner.id,profession:'taxi',specialty:'driver',status:'approved',OR:[{validUntil:null},{validUntil:{gt:new Date()}}]}});if(!verified)throw new AcademyError(403,'PROFESSION_REQUIRED');
        const existing=await tx.taxiPass.findFirst({where:{userId:owner.id,expiresAt:{gt:new Date()}},orderBy:{expiresAt:'desc'}});if(existing)return existing;
        const receipt=await tx.creditEntry.findUnique({where:{key:`taxi:${owner.id}:${key}`}});
        if(receipt)throw new AcademyError(409,'CONFLICT');
        const created=await tx.taxiPass.create({data:{userId:owner.id,expiresAt:new Date(Date.now()+86400000)}});
        await debit(tx,owner.id,TAXI_PASS_MILLI,`taxi:${owner.id}:${key}`,'taxi-pass',created.id);return created;
      },{isolationLevel:'Serializable'});
      return platformJson({pass});
    }
    if(body.action==='unlock') {
      const id=academyText(body.id,100);const initial=await prisma.serviceRequest.findUnique({where:{id}});
      if(!initial)throw new AcademyError(404,'NOT_FOUND');
      await requireProfession(owner.id,initial.kind,initial.specialty);
      const item=await prisma.$transaction(async tx=>{
        const job=await tx.serviceRequest.findUnique({where:{id}});
        if(!job||job.ownerId===owner.id)throw new AcademyError(403,'FORBIDDEN');
        const existing=await tx.serviceUnlock.findUnique({where:{requestId_providerId:{requestId:id,providerId:owner.id}}});
        if(existing)return existing;
        if(job.status!=='open')throw new AcademyError(409,'REQUEST_CLOSED');
        // Approval is checked again inside the transaction, so suspension cannot race the debit.
        const approved=await tx.professionApplication.findFirst({where:{userId:owner.id,profession:job.kind,specialty:job.specialty,status:'approved',OR:[{validUntil:null},{validUntil:{gt:new Date()}}]}});
        if(!approved)throw new AcademyError(403,'PROFESSION_REQUIRED');
        if(job.kind==='taxi') {
          const active=await tx.taxiPass.findFirst({where:{userId:owner.id,expiresAt:{gt:new Date()}}});
          if(!active)throw new AcademyError(402,'TAXI_PASS_REQUIRED');
          if(await tx.serviceUnlock.count({where:{requestId:id}}))throw new AcademyError(409,'CONFLICT');
        }
        const fee=job.kind==='taxi'?0:SERVICE_FEE_MILLI;
        const unlock=await tx.serviceUnlock.create({data:{requestId:id,providerId:owner.id,feeMilli:fee,offerKurus:academyInteger(body.offerKurus,0,100_000_000),note:academyText(body.note??'',2000,false)}});
        if(fee)await debit(tx,owner.id,fee,`service:${unlock.id}`,'service-access',id);
        await tx.lifechatThread.create({data:{key:`service:${unlock.id}`,kind:job.kind,referenceId:unlock.id,title:job.title,members:{create:[{userId:job.ownerId},{userId:owner.id}]}}});
        if(job.kind==='taxi')await tx.serviceRequest.update({where:{id},data:{status:'accepted',acceptedUnlockId:unlock.id}});
        return unlock;
      },{isolationLevel:'Serializable'});
      return platformJson({item});
    }
    if(body.action==='offer') {
      const id=academyText(body.id,100);
      const initial=await prisma.serviceRequest.findUnique({where:{id}});if(!initial)throw new AcademyError(404,'NOT_FOUND');
      await requireProfession(owner.id,initial.kind,initial.specialty);
      const item=await prisma.$transaction(async tx=>{
        const job=await tx.serviceRequest.findUnique({where:{id}});if(!job||job.status!=='open')throw new AcademyError(409,'REQUEST_CLOSED');
        const unlock=await tx.serviceUnlock.findUnique({where:{requestId_providerId:{requestId:id,providerId:owner.id}}});
        if(!unlock)throw new AcademyError(403,'PAYMENT_REQUIRED');
        return tx.serviceUnlock.update({where:{id:unlock.id},data:{offerKurus:academyInteger(body.offerKurus,0,100_000_000),note:academyText(body.note??'',2000,false)}});
      },{isolationLevel:'Serializable'});
      return platformJson({item});
    }
    if(body.action==='status') {
      const id=academyText(body.id,100);const status=String(body.status);
      if(!['accepted','completed','cancelled'].includes(status))throw new AcademyError(400,'INVALID_TEXT');
      const item=await prisma.$transaction(async tx=>{
        const job=await tx.serviceRequest.findUnique({where:{id}});if(!job||job.ownerId!==owner.id)throw new AcademyError(403,'FORBIDDEN');
        if(['completed','cancelled'].includes(job.status))throw new AcademyError(409,'REQUEST_CLOSED');
        let acceptedUnlockId=job.acceptedUnlockId;
        if(status==='accepted'){
          if(job.status!=='open')throw new AcademyError(409,'CONFLICT');
          const chosen=await tx.serviceUnlock.findUnique({where:{id:academyText(body.unlockId,100)}});
          if(!chosen||chosen.requestId!==id)throw new AcademyError(400,'NOT_FOUND');acceptedUnlockId=chosen.id;
        }
        if(status==='completed'&&!acceptedUnlockId)throw new AcademyError(409,'CONFLICT');
        return tx.serviceRequest.update({where:{id},data:{status,acceptedUnlockId}});
      },{isolationLevel:'Serializable'});
      return platformJson({item:{id:item.id,status:item.status}});
    }
    throw new AcademyError(400,'INVALID_TEXT');
  }catch(error){return academyFailure(error);}
}
