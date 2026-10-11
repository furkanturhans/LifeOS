import { randomUUID } from 'node:crypto';
import { academySession, academyFailure, AcademyError } from '@/lib/education/academy-server';
import { createClient } from '@/lib/supabase/server';
import { platformJson } from '@/lib/platform/server';
export const runtime='nodejs';
export async function POST(request:Request) {
  try {
    const {owner}=await academySession(request);
    const reader=request.body?.getReader();if(!reader)throw new AcademyError(400,'DOCUMENT_REQUIRED');
    const chunks:Uint8Array[]=[];let size=0;
    try{while(true){const result=await reader.read();if(result.done)break;size+=result.value.byteLength;if(size>5*1024*1024){await reader.cancel();throw new AcademyError(413,'FILE_TOO_LARGE');}chunks.push(result.value);}}finally{reader.releaseLock();}
    const buffer=Buffer.concat(chunks);
    const pdf=buffer.subarray(0,5).toString()==='%PDF-';
    const jpg=buffer[0]===255&&buffer[1]===216&&buffer[2]===255;
    const png=buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    if(!size||(!pdf&&!jpg&&!png))throw new AcademyError(400,'INVALID_FILE');
    const supabase=await createClient();
    // Limit repeated uploads before review; prevent unbounded storage consumption.
    const {data:existing,error:listError}=await supabase.storage.from('profession-documents').list(owner.id,{limit:100});
    if(listError)throw new AcademyError(503,'UNAVAILABLE');
    if((existing?.length??0)>=30)throw new AcademyError(429,'UPLOAD_LIMIT');
    const path=`${owner.id}/${randomUUID()}.${pdf?'pdf':jpg?'jpg':'png'}`;
    const {error}=await supabase.storage.from('profession-documents').upload(path,buffer,{contentType:pdf?'application/pdf':jpg?'image/jpeg':'image/png',upsert:false});
    if(error)throw new AcademyError(503,'UNAVAILABLE');
    return platformJson({path});
  }catch(error){return academyFailure(error);}
}
