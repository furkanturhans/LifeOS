import { NextResponse } from 'next/server';
import { allVideos } from '@/lib/kids/videos';
export const runtime='nodejs';
export async function GET() {
  try{return NextResponse.json({videos:(await allVideos()).filter(video=>video.status==='published'&&video.reviewed&&video.languageChecked)},{headers:{'Cache-Control':'no-store'}});}
  catch{return NextResponse.json({error:'Videolar şu anda yüklenemiyor.'},{status:503});}
}
