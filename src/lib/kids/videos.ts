import 'server-only';
import reviewed from '@/components/kids/experience/catalog/videos-reviewed.json';
import candidates from '@/components/kids/experience/catalog/videos-candidates.json';
import { readDatabase } from './repository';
import { videoSchema } from './video-schema';
export async function allVideos() {
  const database=await readDatabase();
  const entries=new Map(candidates.map(item=>{const video=videoSchema.parse(item);return [video.id,video] as const;}));
  for(const item of reviewed) { const video=videoSchema.parse(item);entries.set(video.id,video); }
  for(const item of database.videos??[]) {const video=videoSchema.parse(item);entries.set(video.id,video);}
  return [...entries.values()];
}
