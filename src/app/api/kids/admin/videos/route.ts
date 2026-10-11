import { NextResponse } from 'next/server';
import { isKidsAdmin, sameOrigin } from '@/lib/kids/access';
import { allVideos } from '@/lib/kids/videos';
import { providerStatus, searchVideos } from '@/lib/kids/video-providers';
import { videoSchema, videoTopics } from '@/lib/kids/video-schema';
import { updateDatabase } from '@/lib/kids/repository';
export const runtime='nodejs';
export async function GET(request:Request) {
  if(!await isKidsAdmin())return NextResponse.json({error:'Yönetici yetkisi gerekiyor.'},{status:403});
  try {
    const query=new URL(request.url).searchParams;
    if(query.has('provider')) {
      const term=query.get('q')?.trim()??'';
      if(term.length<2||term.length>120)return NextResponse.json({error:'Arama 2–120 karakter olmalı.'},{status:400});
      const topic=query.get('topic')??'nature';if(!videoTopics.includes(topic as typeof videoTopics[number]))return NextResponse.json({error:'Geçersiz konu.'},{status:400});
      try {
        return NextResponse.json({videos:await searchVideos(query.get('provider')!,term,topic as typeof videoTopics[number]),sourceMode:'live'},{headers:{'Cache-Control':'no-store'}});
      } catch {
        const words=term.toLocaleLowerCase('en').split(/\s+/);
        const cached=(await allVideos()).filter(video=>video.provider===query.get('provider') && words.every(word=>(video.title+' '+video.description).toLocaleLowerCase('en').includes(word))).map(video=>({...video,status:'draft' as const,reviewed:false,languageChecked:false,reviewNote:''}));
        if(cached.length)return NextResponse.json({videos:cached,sourceMode:'cached',warning:'Canlı API erişimi yok; önceden alınmış katalog adayları gösteriliyor.'},{headers:{'Cache-Control':'no-store'}});
        throw Error('PROVIDER_UNAVAILABLE');
      }
    }
    return NextResponse.json({videos:await allVideos(),providers:providerStatus()},{headers:{'Cache-Control':'no-store'}});
  } catch {return NextResponse.json({error:'Kaynak şu anda erişilebilir değil veya API anahtarı kurulmamış. Anahtarları sunucuda yapılandırın.'},{status:503});}
}
export async function POST(request:Request) {
  if(!sameOrigin(request)||!await isKidsAdmin())return NextResponse.json({error:'Yönetici yetkisi gerekiyor.'},{status:403});
  if(Number(request.headers.get('content-length'))>50000)return NextResponse.json({error:'İstek çok büyük.'},{status:413});
  try {
    const parsed=videoSchema.safeParse(await request.json());
    if(!parsed.success)return NextResponse.json({error:parsed.error.issues.map(issue=>issue.message).join(' ')},{status:400});
    await updateDatabase(database=>{database.videos=[...(database.videos??[]).filter(video=>video.id!==parsed.data.id),parsed.data];database.audit.push({at:new Date().toISOString(),action:'video-'+parsed.data.status,item:parsed.data.id});});
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:'Video kaydedilemedi.'},{status:503});}
}
