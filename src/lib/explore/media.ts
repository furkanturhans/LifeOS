export const MAX_MEDIA_BYTES = 50 * 1024 * 1024;
export function mediaFormat(bytes: Buffer): { extension: string; mime: string } | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return { extension: 'jpg', mime: 'image/jpeg' };
  if (bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return { extension: 'png', mime: 'image/png' };
  if (bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP') return { extension: 'webp', mime: 'image/webp' };
  if (bytes.toString('ascii',4,8) === 'ftyp' && /^(isom|iso[2-9]|mp4[12]|avc1|M4V |MSNV|dash)/.test(bytes.toString('ascii',8,12))) return { extension: 'mp4', mime: 'video/mp4' };
  if (bytes.subarray(0,4).equals(Buffer.from([26,69,223,163]))) return { extension: 'webm', mime: 'video/webm' };
  return null;
}
/** Enforces a real streamed limit even when Content-Length is absent or forged. */
export async function boundedFormData(request: Request): Promise<FormData> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('EMPTY_POST');
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_MEDIA_BYTES + 1024 * 1024) { await reader.cancel(); throw new Error('FILE_TOO_LARGE'); }
    chunks.push(value);
  }
  return new Response(Buffer.concat(chunks), { headers: { 'content-type': request.headers.get('content-type') ?? '' } }).formData();
}
