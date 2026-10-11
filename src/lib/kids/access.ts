import 'server-only';
import { cookies } from 'next/headers';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@/lib/supabase/server';
import { dataDirectory } from './repository';

export function sameOrigin(request: Request) { return request.headers.get('origin') === new URL(request.url).origin; }
export async function adminKey() {
  if (process.env.KIDS_ADMIN_KEY && process.env.KIDS_ADMIN_KEY.length >= 32) return process.env.KIDS_ADMIN_KEY;
  if (process.env.NODE_ENV === 'production') return null;
  const directory = dataDirectory(); await fs.mkdir(directory, { recursive: true });
  const file = path.join(directory, 'admin-key.txt');
  try { return (await fs.readFile(file, 'utf8')).trim(); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    const generated = randomBytes(32).toString('hex');
    try { await fs.writeFile(file, generated + '\n', { flag: 'wx', mode: 0o600 }); return generated; }
    catch (writeError) { if ((writeError as NodeJS.ErrnoException).code === 'EEXIST') return (await fs.readFile(file, 'utf8')).trim(); throw writeError; }
  }
}
function equal(first: string, second: string) { const a = Buffer.from(first); const b = Buffer.from(second); return a.length === b.length && timingSafeEqual(a, b); }
export async function validKey(value: string) { const key = await adminKey(); return !!key && equal(value, key); }
export async function createAdminSession() {
  const key = await adminKey(); if (!key) throw new Error('KIDS_ADMIN_NOT_CONFIGURED');
  const expiry = String(Date.now() + 2 * 60 * 60 * 1000);
  return expiry + '.' + createHmac('sha256', key).update('kids-owner:' + expiry).digest('hex');
}
export async function isKidsAdmin() {
  const key = await adminKey(); const session = (await cookies()).get('lifeos-kids-admin')?.value;
  if (!key || !session) return false;
  const [expiry, signature, extra] = session.split('.');
  if (extra || !/^\d+$/.test(expiry) || Number(expiry) <= Date.now() || Number(expiry) > Date.now() + 2 * 60 * 60 * 1000) return false;
  return equal(signature ?? '', createHmac('sha256', key).update('kids-owner:' + expiry).digest('hex'));
}
export async function signedInUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  try { const supabase = await createClient(); const { data, error } = await supabase.auth.getUser(); return error ? null : data.user; }
  catch { return null; }
}
