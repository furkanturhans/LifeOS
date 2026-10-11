import { prisma } from '@/lib/prisma';
import { academySession, academyFailure, academyBody, academyText, academyInteger, AcademyError } from '@/lib/education/academy-server';
import { platformJson, requireProfession } from '@/lib/platform/server';
import { travelSplit } from '@/lib/platform/rules';
export const runtime='nodejs';
export async function GET(request:Request) {
  try {
    const {owner}=await academySession(request);const query=new URL(request.url).searchParams;
    if(query.get('view')==='company'){
      await requireProfession(owner.id,'travel','bus');
      return platformJson({companies:await prisma.travelCompany.findMany({where:{ownerId:owner.id},include:{trips:{orderBy:{departureAt:'asc'},take:100,include:{reservations:{where:{status:'paid'},select:{id:true,seat:true,passengerName:true,totalKurus:true,commissionKurus:true,companyKurus:true}}}}}})});
    }
    if(query.get('view')==='tickets')return platformJson({items:await prisma.travelReservation.findMany({where:{userId:owner.id},include:{departure:{include:{company:{select:{name:true}}}}},orderBy:{createdAt:'desc'},take:100})});
    const origin=query.get('origin')??'',destination=query.get('destination')??'',day=query.get('day');
    const from=day?new Date(`${day}T00:00:00+03:00`):new Date();
    if(!Number.isFinite(from.getTime())||origin.length>120||destination.length>120)throw new AcademyError(400,'INVALID_TEXT');
    const trips=await prisma.travelDeparture.findMany({where:{published:true,departureAt:{gte:from,...(day?{lt:new Date(from.getTime()+86400000)}:{})},origin:{contains:origin,mode:'insensitive'},destination:{contains:destination,mode:'insensitive'}},include:{company:{select:{name:true,ownerId:true}},reservations:{where:{OR:[{status:'paid'},{status:'held',expiresAt:{gt:new Date()}}]},select:{seat:true}}},orderBy:{departureAt:'asc'},take:100});
    const items=[];
    for(const trip of trips){
      const valid=await prisma.professionApplication.findFirst({where:{userId:trip.company.ownerId,profession:'travel',status:'approved',OR:[{validUntil:null},{validUntil:{gt:new Date()}}]}});
      if(valid&&trip.departureAt>new Date())items.push({...trip,company:{name:trip.company.name},reservations:undefined,occupiedSeats:trip.reservations.map(reservation=>reservation.seat)});
    }
    return platformJson({items,checkoutAvailable:false});
  }catch(error){return academyFailure(error);}
}
export async function POST(request:Request) {
  try {
    const {owner}=await academySession(request);const body=await academyBody(request);
    if(body.action==='hold') {
      // Paid ticketing is deliberately unavailable until a verified marketplace gateway is configured.
      // Merely possessing API keys does not establish a working payment integration.
      throw new AcademyError(503,'GATEWAY_NOT_CONFIGURED');
    }
    await requireProfession(owner.id,'travel','bus');
    if(body.action==='company') {
      if(await prisma.travelCompany.count({where:{ownerId:owner.id}})>=10)throw new AcademyError(409,'CONFLICT');
      return platformJson({item:await prisma.travelCompany.create({data:{ownerId:owner.id,name:academyText(body.name,120)}})});
    }
    if(body.action==='departure') {
      const company=await prisma.travelCompany.findUnique({where:{id:academyText(body.companyId,100)}});
      if(!company||company.ownerId!==owner.id)throw new AcademyError(403,'FORBIDDEN');
      const departureAt=new Date(String(body.departureAt));if(!Number.isFinite(departureAt.getTime())||departureAt<=new Date())throw new AcademyError(400,'INVALID_DATE');
      const priceKurus=academyInteger(body.priceKurus,1,100_000_000);travelSplit(priceKurus);
      return platformJson({item:await prisma.travelDeparture.create({data:{companyId:company.id,origin:academyText(body.origin,120),destination:academyText(body.destination,120),departureAt,capacity:academyInteger(body.capacity,1,100),priceKurus,cancellationHours:academyInteger(body.cancellationHours,0,168)}})});
    }
    if(body.action==='publish') {
      const id=academyText(body.id,100);if(typeof body.published!=='boolean')throw new AcademyError(400,'INVALID_TEXT');
      const trip=await prisma.travelDeparture.findUnique({where:{id},include:{company:true}});
      if(!trip||trip.company.ownerId!==owner.id)throw new AcademyError(403,'FORBIDDEN');
      if(body.published&&trip.departureAt<=new Date())throw new AcademyError(400,'INVALID_DATE');
      return platformJson({item:await prisma.travelDeparture.update({where:{id},data:{published:body.published}})});
    }
    throw new AcademyError(400,'INVALID_TEXT');
  }catch(error){return academyFailure(error);}
}
