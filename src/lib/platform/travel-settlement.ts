import { prisma } from '@/lib/prisma';
import { AcademyError } from '@/lib/education/academy-server';
import { travelSplit } from './rules';
export async function reserveTravelSeat(departureId:string,userId:string,seat:number,passengerName:string) {
  if(!Number.isInteger(seat)||seat<1||typeof passengerName!=='string'||!passengerName.trim()||passengerName.trim().length>120)throw new AcademyError(400,'INVALID_TEXT');
  return prisma.$transaction(async tx=>{
    const trip=await tx.travelDeparture.findUnique({where:{id:departureId},include:{company:true}});
    if(!trip||!trip.published||trip.departureAt<=new Date()||seat>trip.capacity)throw new AcademyError(409,'NOT_AVAILABLE');
    const approved=await tx.professionApplication.findFirst({where:{userId:trip.company.ownerId,profession:'travel',specialty:'bus',status:'approved',OR:[{validUntil:null},{validUntil:{gt:new Date()}}]}});
    if(!approved)throw new AcademyError(403,'PROFESSION_REQUIRED');
    const active=await tx.travelReservation.findFirst({where:{departureId,seat,OR:[{status:'paid'},{status:'held',expiresAt:{gt:new Date()}}]}});
    if(active){if(active.userId===userId&&active.status==='held'&&active.passengerName===passengerName.trim())return active;throw new AcademyError(409,'SEAT_TAKEN');}
    return tx.travelReservation.create({data:{departureId,userId,seat,passengerName:passengerName.trim(),expiresAt:new Date(Math.min(Date.now()+10*60000,trip.departureAt.getTime())),...travelSplit(trip.priceKurus)}});
  },{isolationLevel:'Serializable'});
}
// Called ONLY after the real payment provider has verified the signature, transaction and amount.
// No client-facing endpoint can issue a paid ticket.
export async function settleVerifiedTicket(id:string,payment:{reference:string;totalKurus:number;currency:string}) {
    if(!payment.reference||payment.reference.length>150||payment.currency!=='TRY')throw new AcademyError(400,'INVALID_AMOUNT');
  return prisma.$transaction(async tx=>{
    const ticket=await tx.travelReservation.findUnique({where:{id}});
    if(!ticket||ticket.totalKurus!==payment.totalKurus)throw new AcademyError(400,'INVALID_AMOUNT');
    if(ticket.status==='paid'){
      if(ticket.providerReference!==payment.reference)throw new AcademyError(409,'CONFLICT');return ticket;
    }
    if(ticket.status!=='held'||ticket.expiresAt<=new Date())throw new AcademyError(409,'HOLD_EXPIRED');
    const occupied=await tx.travelReservation.count({where:{departureId:ticket.departureId,seat:ticket.seat,status:'paid',id:{not:id}}});
    if(occupied)throw new AcademyError(409,'CONFLICT');
    return tx.travelReservation.update({where:{id},data:{status:'paid',providerReference:payment.reference,...travelSplit(ticket.totalKurus)}});
  },{isolationLevel:'Serializable'});
}
