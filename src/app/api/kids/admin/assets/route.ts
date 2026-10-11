import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { isKidsAdmin, sameOrigin } from '@/lib/kids/access';
import { dataDirectory } from '@/lib/kids/repository';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  if (!sameOrigin(request) || !await isKidsAdmin()) return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  if (Number(request.headers.get('content-length')) > 6000000) return NextResponse.json({ error: 'Dosya en fazla 5 MB olabilir.' }, { status: 413 });
  try {
    const form = await request.formData(); const file = form.get('file');
    if (!(file instanceof File) || !file.size || file.size > 5000000) return NextResponse.json({ error: 'Geçerli bir dosya seçin; en fazla 5 MB.' }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer()); const id = randomUUID();
    const kind = file.name.toLowerCase().split('.').at(-1);
    let extension: string;
    if (kind === 'html') {
      const html = bytes.toString('utf8');
      if (!/<html|<!doctype html/i.test(html) || /<iframe|<object|<embed|<script[^>]+src=|<form|fetch\s*\(|XMLHttpRequest|WebSocket|\blocalStorage\b|\bsessionStorage\b|https?:\/\/|navigator\.(?:mediaDevices|geolocation)/i.test(html)) return NextResponse.json({ error: 'Oyun tek yerel HTML dosyası olmalı; dış bağlantı, hesap, depolama veya ağ isteği kullanamaz.' }, { status: 400 });
      const directory = path.join(dataDirectory(), 'games'); await fs.mkdir(directory, { recursive: true }); await fs.writeFile(path.join(directory, id + '.html'), bytes, { flag: 'wx', mode: 0o600 });
      return NextResponse.json({ url: '/api/kids/play/' + id });
    }
    if (kind === 'png' && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) extension = 'png';
    else if (['jpg','jpeg'].includes(kind ?? '') && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) extension = 'jpg';
    else if (kind === 'webp' && bytes.subarray(0,4).toString() === 'RIFF' && bytes.subarray(8,12).toString() === 'WEBP') extension = 'webp';
    else if (kind === 'svg') {
      const svg = bytes.toString('utf8');
      if (!/^\s*(?:<\?xml[^>]*>\s*)?<svg\b/i.test(svg) || /<script|<foreignObject|<!DOCTYPE|<!ENTITY|\bon\w+\s*=|\b(?:href|src)\s*=|@import|url\(\s*["']?(?!#)/i.test(svg)) return NextResponse.json({ error: 'SVG yalnızca yerel çizim şekilleri içerebilir.' }, { status: 400 });
      extension = 'svg';
    } else return NextResponse.json({ error: 'PNG, JPEG, WebP, güvenli SVG veya yerel HTML seçin.' }, { status: 400 });
    const directory = path.join(dataDirectory(), 'assets'); await fs.mkdir(directory, { recursive: true }); await fs.writeFile(path.join(directory, `${id}.${extension}`), bytes, { flag: 'wx', mode: 0o600 });
    return NextResponse.json({ url: `/api/kids/assets/${id}.${extension}` });
  } catch { return NextResponse.json({ error: 'Dosya yüklenemedi.' }, { status: 503 }); }
}
