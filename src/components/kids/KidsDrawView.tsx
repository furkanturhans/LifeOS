'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowLeft,
  Paintbrush,
  Eraser,
  RotateCcw,
  Download,
  Sparkles,
  Palette,
  Smile,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { kidsSpeech } from '@/services/kidsSpeechService';
import { cn } from '@/lib/utils';

const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#1e293b', // Dark Slate
];

const STICKERS = ['⭐', '🐱', '🚀', '🌈', '👑', '🎈', '🌸', '🦖', '⚽'];

export function KidsDrawView({ onBackToKids }: { onBackToKids: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(6);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    if (selectedSticker) {
      // Stamp sticker
      ctx.font = '36px sans-serif';
      ctx.fillText(selectedSticker, x - 18, y + 18);
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = brushSize;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedSticker) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'resmim-lifeos-kids.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-background select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/70 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToKids}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
            aria-label="Kids Hub'a Dön"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-teal-500/10 text-teal-500 shadow-xs text-lg">
            🎨
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Çizim & Yaratıcılık
              </h1>
              <StatusBadge status="verified" label="Resim Defteri" size="sm" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Renkli fırçalar, eğlenceli çıkartmalar ve sınırsız tuval
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              kidsSpeech.speak(
                'Renkli fırçalarla hayalindeki resmi çiz veya alt taraftan sevimli çıkartmalar ekle!'
              )
            }
            className="h-8 text-xs font-semibold px-2.5 border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-500/10 hover:bg-teal-500/20"
            title="Sesli Rehber"
          >
            <Volume2 className="h-3.5 w-3.5 mr-1" /> Dinle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            className="h-8 text-xs font-semibold px-2.5"
            title="Tuvali Temizle"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Temizle
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={downloadCanvas}
            className="h-8 text-xs font-bold px-3 bg-teal-500 hover:bg-teal-600 border-none text-white shadow-xs"
            title="Resmi Kaydet"
          >
            <Download className="h-3.5 w-3.5 mr-1" /> Kaydet
          </Button>
        </div>
      </div>

      {/* Main Drawing Area */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 gap-3 max-w-3xl mx-auto w-full overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 w-full rounded-3xl border-4 border-teal-500/30 bg-white shadow-2xl overflow-hidden relative touch-none">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair block"
          />
        </div>

        {/* Toolbar & Palettes */}
        <Card className="p-3 border-border bg-card shadow-lg space-y-2.5 shrink-0">
          {/* Colors and Eraser */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setIsEraser(false);
                    setSelectedSticker(null);
                  }}
                  style={{ backgroundColor: c }}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-transform shadow-2xs',
                    color === c && !isEraser && !selectedSticker
                      ? 'scale-125 border-foreground ring-2 ring-primary/40'
                      : 'border-white/40'
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5 border-l border-border pl-2">
              <button
                onClick={() => {
                  setIsEraser(!isEraser);
                  setSelectedSticker(null);
                }}
                className={cn(
                  'h-8 px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all',
                  isEraser
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border'
                )}
              >
                <Eraser className="h-3.5 w-3.5" /> Silgi
              </button>

              {/* Brush size buttons */}
              {[4, 8, 16].map((size) => (
                <button
                  key={size}
                  onClick={() => setBrushSize(size)}
                  className={cn(
                    'w-8 h-8 rounded-xl border flex items-center justify-center transition-all',
                    brushSize === size
                      ? 'bg-teal-500/20 border-teal-500 text-teal-600 dark:text-teal-400 font-bold'
                      : 'bg-muted border-border text-muted-foreground'
                  )}
                >
                  <div
                    style={{ width: size, height: size }}
                    className="rounded-full bg-current"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Stickers Row */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-border/40 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 shrink-0 mr-1">
              <Smile className="h-3.5 w-3.5 text-teal-500" /> Çıkartmalar:
            </span>
            {STICKERS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSelectedSticker(selectedSticker === s ? null : s);
                  setIsEraser(false);
                }}
                className={cn(
                  'h-8 w-8 rounded-xl border text-base flex items-center justify-center transition-all',
                  selectedSticker === s
                    ? 'bg-teal-500/20 border-teal-500 scale-110 shadow-xs'
                    : 'bg-muted/40 border-border hover:bg-muted'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
