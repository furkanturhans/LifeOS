import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { contentSchema, type KidsContent, type KidsContest } from './schema';
import type { KidsVideo } from './video-schema';
import games from '@/components/kids/experience/catalog/games.json';
import education from '@/components/kids/experience/catalog/education.json';
import stories from '@/components/kids/experience/catalog/stories.json';
import drawings from '@/components/kids/experience/catalog/drawings.json';

export type KidsSubmission = { id: string; userId: string; category: string; title: string; description: string; source: string; licenseNote: string; guardianConsent: true; createdAt: string; status: 'pending' | 'accepted' | 'rejected' };
export type ContestEntry = { id: string; contestId: string; userId: string; alias: string; image: string; guardianConsent: true; createdAt: string; status: 'pending' | 'accepted' | 'rejected' | 'winner' };
type Database = { videos?: KidsVideo[]; version: 1; content: KidsContent[]; submissions: KidsSubmission[]; contests: KidsContest[]; entries: ContestEntry[]; audit: { at: string; action: string; item: string }[] };
export function dataDirectory() {
  if (process.env.NODE_ENV === 'production' && !process.env.KIDS_DATA_DIR) throw new Error('KIDS_STORAGE_NOT_CONFIGURED');
  return process.env.KIDS_DATA_DIR ?? path.join(process.cwd(), '.next/cache/kids-content');
}
const empty = (): Database => ({ version: 1, content: [], submissions: [], contests: [], entries: [], audit: [] });
export async function readDatabase(): Promise<Database> {
  try { const parsed = JSON.parse(await fs.readFile(path.join(dataDirectory(), 'content.json'), 'utf8')); if (parsed.version !== 1) throw new Error('KIDS_STORAGE_VERSION'); return parsed; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return empty(); throw error; }
}
export async function updateDatabase<T>(operation: (database: Database) => T): Promise<T> {
  const directory = dataDirectory(); await fs.mkdir(directory, { recursive: true });
  const lock = path.join(directory, 'write.lock');
  const handle = await fs.open(lock, 'wx');
  const temporary = path.join(directory, randomUUID() + '.tmp');
  try {
    const database = await readDatabase(); const result = operation(database);
    database.audit = database.audit.slice(-2000);
    await fs.writeFile(temporary, JSON.stringify(database), { encoding: 'utf8', mode: 0o600 });
    await fs.rename(temporary, path.join(directory, 'content.json')); return result;
  } finally { await handle.close(); await fs.unlink(lock); await fs.unlink(temporary).catch(() => {}); }
}
export async function seedContent(): Promise<KidsContent[]> {
  return [...games, ...education, ...stories, ...drawings].map(entry => contentSchema.parse(entry));
}
export async function allContent() {
  const [seed, database] = await Promise.all([seedContent(), readDatabase()]);
  const entries = new Map(seed.map(item => [item.id, item]));
  for (const item of database.content) entries.set(item.id, contentSchema.parse(item));
  return { content: [...entries.values()], database };
}
