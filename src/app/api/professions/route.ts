import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { academySession, academyFailure, academyBody, academyText, AcademyError } from '@/lib/education/academy-server';
import { platformJson, requireReviewer, publicPerson } from '@/lib/platform/server';
import { validSpecialty } from '@/lib/platform/rules';
export const runtime='nodejs';

export async function GET(request:Request) {
  try {
    const {owner}=await academySession(request);
    const query=new URL(request.url).searchParams;
    if(query.get('review')==='1') {
      await requireReviewer(owner.id);
      const id=query.get('document');
      if(id) {
        const record=await prisma.professionApplication.findUnique({where:{id}});
        const index=Number(query.get('index'));
        if(!record||!Number.isInteger(index)||!record.documentPaths[index])throw new AcademyError(404,'NOT_FOUND');
        const supabase=await createClient();
        const {data,error}=await supabase.storage.from('profession-documents').createSignedUrl(record.documentPaths[index],60);
        if(error||!data)throw new AcademyError(503,'UNAVAILABLE');
        return platformJson({url:data.signedUrl});
      }
      return platformJson({items:await prisma.professionApplication.findMany({include:{user:{select:publicPerson}},orderBy:{updatedAt:'desc'},take:100})});
    }
    const reviewer=await prisma.userPermission.findUnique({where:{userId_moduleId_resource:{userId:owner.id,moduleId:'platform',resource:'profession-review'}}});
    return platformJson({canReview:reviewer?.granted??false,items:await prisma.professionApplication.findMany({where:{userId:owner.id},orderBy:{updatedAt:'desc'}})});
  }catch(error){return academyFailure(error);}
}
export async function POST(request:Request) {
  try {
    const {owner}=await academySession(request);
    const body=await academyBody(request);
    if(body.action==='review') {
      await requireReviewer(owner.id);
      const id=academyText(body.id,100),note=academyText(body.note,1000);
      if(!['approved','rejected','suspended'].includes(String(body.status)))throw new AcademyError(400,'INVALID_TEXT');
      const validUntil=body.validUntil?new Date(String(body.validUntil)):null;
      if(validUntil&&(!Number.isFinite(validUntil.getTime())||validUntil<=new Date()))throw new AcademyError(400,'INVALID_TEXT');
      const existing=await prisma.professionApplication.findUnique({where:{id}});
      if(!existing)throw new AcademyError(404,'NOT_FOUND');
      if(existing.userId===owner.id)throw new AcademyError(403,'FORBIDDEN');
      const item=await prisma.$transaction(async tx=>{
        const application=await tx.professionApplication.update({where:{id},data:{status:String(body.status),validUntil,reviewNote:note,reviewedAt:new Date(),reviewedBy:owner.id}});
        await tx.auditLog.create({data:{userId:owner.id,action:'profession-review',resource:id,metadata:{status:String(body.status),note}}});
        return application;
      });
      return platformJson({item});
    }
    const profession=academyText(body.profession,30),specialty=academyText(body.specialty,40);
    if(!validSpecialty(profession,specialty))throw new AcademyError(400,'INVALID_TEXT');
    const documents=body.documents;
    if(!Array.isArray(documents)||documents.length<1||documents.length>5||documents.some(path=>typeof path!=='string'||!path.startsWith(`${owner.id}/`)||path.includes('..')))throw new AcademyError(400,'INVALID_TEXT');
    // Paths must have been uploaded by this authenticated account to the private bucket.
    const supabase=await createClient();
    for(const path of documents as string[]) {
      const name=path.slice(owner.id.length+1);
      if(!/^[a-f0-9-]+\.(pdf|jpg|png)$/.test(name))throw new AcademyError(400,'INVALID_TEXT');
      const {data,error}=await supabase.storage.from('profession-documents').list(owner.id,{search:name,limit:10});
      if(error||!data?.some(file=>file.name===name))throw new AcademyError(400,'DOCUMENT_REQUIRED');
    }
    const item=await prisma.$transaction(async tx=>{
      const existing=await tx.professionApplication.findUnique({where:{userId_profession_specialty:{userId:owner.id,profession,specialty}}});
      if(existing&&(existing.status==='pending'||existing.status==='suspended'||(existing.status==='approved'&&(!existing.validUntil||existing.validUntil>new Date()))))throw new AcademyError(409,'CONFLICT');
      const data={legalName:academyText(body.legalName,120),region:academyText(body.region,120),vehiclePlate:profession==='taxi'?academyText(body.vehiclePlate,30):null,vehicleModel:profession==='taxi'?academyText(body.vehicleModel,120):null,documentPaths:documents as string[],status:'pending',reviewNote:null,reviewedAt:null,reviewedBy:null,validUntil:null};
      return tx.professionApplication.upsert({where:{userId_profession_specialty:{userId:owner.id,profession,specialty}},create:{userId:owner.id,profession,specialty,...data},update:data});
    },{isolationLevel:'Serializable'});
    return platformJson({item});
  }catch(error){return academyFailure(error);}
}
