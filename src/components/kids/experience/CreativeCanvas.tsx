'use client';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Download, Eraser, PaintBucket, Paintbrush, Redo2, RotateCcw, Undo2 } from 'lucide-react';
import { useLocaleRender } from '@/lib/i18n/runtime';

const palette = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#92400e', '#111827', '#ffffff'];
const names = ['Kırmızı', 'Turuncu', 'Sarı', 'Yeşil', 'Mavi', 'Mor', 'Pembe', 'Kahverengi', 'Siyah', 'Beyaz'];
const button = 'flex min-h-12 min-w-12 items-center justify-center rounded-2xl border border-border bg-card p-3 disabled:opacity-30';
export function CreativeCanvas({ id, image, tracing = false }: { id: string; image?: string | null; tracing?: boolean }) {
  const t = useLocaleRender();
  const canvas = useRef<HTMLCanvasElement>(null);
  const worker = useRef<Worker | null>(null);
  const active = useRef<number | null>(null);
  const history = useRef<ImageData[]>([]);
  const future = useRef<ImageData[]>([]);
  const base = useRef<ImageData | null>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [revision, setRevision] = useState(0);
  const [controls, setControls] = useState({ past: 0, future: 0, ready: false });
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [color, setColor] = useState(palette[0]);
  const [mode, setMode] = useState<'brush' | 'fill' | 'erase'>(tracing || !image ? 'brush' : 'fill');
  const [size, setSize] = useState(8);
  useEffect(() => {
    let alive = true;
    const context = canvas.current?.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    const finish = () => { if (alive) { base.current = context.getImageData(0, 0, 600, 600); history.current = []; future.current = []; setControls({ past: 0, future: 0, ready: true }); setBusy(false); } };
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, 600, 600);
    const load = new Image();
    if (image) { load.onload = () => { if (alive) { context.drawImage(load, 0, 0, 600, 600); finish(); } }; load.onerror = () => { if (alive) { setError('Çizim yüklenemedi. Yeniden açmayı deneyin.'); setBusy(false); } }; load.src = image; }
    else finish();
    const fillWorker = new Worker(new URL('./fill.worker.ts', import.meta.url));
    worker.current = fillWorker;
    fillWorker.onmessage = (event: MessageEvent<{ pixels: ArrayBuffer }>) => {
      if (!alive) return;
      context.putImageData(new ImageData(new Uint8ClampedArray(event.data.pixels), 600, 600), 0, 0);
      setBusy(false); setRevision(r => r + 1);
    };
    fillWorker.onerror = () => { if (alive) { setError('Boyama işlemi tamamlanamadı. Fırçayı kullanabilirsiniz.'); setBusy(false); } };
    return () => { alive = false; fillWorker.terminate(); worker.current = null; load.onload = null; load.onerror = null; };
  }, [id, image]);
  const remember = () => {
    const context = canvas.current?.getContext('2d'); if (!context) return;
    history.current.push(context.getImageData(0, 0, 600, 600)); if (history.current.length > 20) history.current.shift();
    future.current = []; setControls({ past: history.current.length, future: 0, ready: true }); setRevision(r => r + 1);
  };
  const point = (event: PointerEvent<HTMLCanvasElement>) => { const bounds = event.currentTarget.getBoundingClientRect(); return { x: Math.max(0, Math.min(599, Math.floor((event.clientX - bounds.left) / bounds.width * 600))), y: Math.max(0, Math.min(599, Math.floor((event.clientY - bounds.top) / bounds.height * 600))) }; };
  const down = (event: PointerEvent<HTMLCanvasElement>) => {
    if (busy || error || event.button !== 0 || active.current !== null) return;
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
    const position = point(event); const context = canvas.current?.getContext('2d'); if (!context) return;
    remember();
    if (mode === 'fill') {
      const pixels = context.getImageData(0, 0, 600, 600).data.buffer;
      const rgb: [number, number, number] = [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16)];
      setBusy(true); worker.current?.postMessage({ pixels, width: 600, height: 600, ...position, color: rgb }, [pixels]); return;
    }
    active.current = event.pointerId; last.current = position;
    context.fillStyle = mode === 'erase' ? '#ffffff' : color; context.beginPath(); context.arc(position.x, position.y, size / 2, 0, Math.PI * 2); context.fill();
  };
  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (active.current !== event.pointerId || busy || !last.current) return;
    const context = canvas.current?.getContext('2d'); if (!context) return;
    const position = point(event); context.beginPath(); context.moveTo(last.current.x, last.current.y); context.lineTo(position.x, position.y); context.strokeStyle = mode === 'erase' ? '#ffffff' : color; context.lineWidth = size; context.lineCap = 'round'; context.lineJoin = 'round'; context.stroke(); last.current = position;
  };
  const end = (event: PointerEvent<HTMLCanvasElement>) => { if (active.current === event.pointerId) { active.current = null; last.current = null; } };
  const undo = (redo = false) => {
    const context = canvas.current?.getContext('2d'); if (!context || busy) return;
    const from = redo ? future.current : history.current; const to = redo ? history.current : future.current;
    const previous = from.pop(); if (!previous) return; to.push(context.getImageData(0, 0, 600, 600)); context.putImageData(previous, 0, 0); setControls({ past: history.current.length, future: future.current.length, ready: true }); setRevision(r => r + 1);
  };
  const download = () => { canvas.current?.toBlob(blob => { if (!blob) return; const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `lifeos-${id}.png`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1500); }, 'image/png'); };
  return <div data-revision={revision}>
    <p className="mb-3 text-sm text-muted-foreground">{t(tracing ? 'Kesik çizgilerin üzerinden fırçayla geç. Kendi hızında dene.' : 'Renk seç; alanları doldur veya fırçayla özgürce çiz.')}</p>
    <div className="relative overflow-hidden rounded-3xl border border-border bg-white"><canvas ref={canvas} width={600} height={600} className="aspect-square w-full touch-none" aria-label={t('Çizim tuvali')} onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} />{busy && <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-slate-900" role="status">{t('Hazırlanıyor...')}</div>}</div>
    {error && <p role="alert" className="mt-2 text-sm text-red-500">{t(error)}</p>}
    <div className="mt-4 grid grid-cols-5 gap-3">{palette.map((value, i) => <button key={value} disabled={busy} aria-label={t(names[i])} aria-pressed={color === value} onClick={() => setColor(value)} className={`h-12 rounded-2xl border ${color === value ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`} style={{ backgroundColor: value }} />)}</div>
    <div className="mt-4 flex flex-wrap justify-between gap-2">{([{ id: 'fill', label: 'Alan doldur', icon: PaintBucket }, { id: 'brush', label: 'Fırça', icon: Paintbrush }, { id: 'erase', label: 'Silgi', icon: Eraser }] as const).map(tool => <button key={tool.id} disabled={busy || (tracing && tool.id === 'fill')} className={`${button} ${mode === tool.id ? 'ring-2 ring-blue-500' : ''}`} aria-label={t(tool.label)} aria-pressed={mode === tool.id} onClick={() => setMode(tool.id)}><tool.icon size={20} /></button>)}<button disabled={busy || !controls.past} className={button} aria-label={t('Geri al')} onClick={() => undo()}><Undo2 size={20} /></button><button disabled={busy || !controls.future} className={button} aria-label={t('Yinele')} onClick={() => undo(true)}><Redo2 size={20} /></button><button disabled={busy || !controls.ready} className={button} aria-label={t('Temizle')} onClick={() => { const context = canvas.current?.getContext('2d'); if (context && base.current) { remember(); context.putImageData(base.current, 0, 0); } }}><RotateCcw size={20} /></button><button disabled={busy || !!error} className={button} aria-label={t('İndir')} onClick={download}><Download size={20} /></button></div>
    <label className="mt-4 flex items-center gap-3 text-sm">{t('Fırça boyutu')}<input type="range" min="2" max="32" value={size} disabled={busy} onChange={event => setSize(Number(event.target.value))} className="min-h-12 flex-1" /></label>
  </div>;
}
