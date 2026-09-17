'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function SeatPlansSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Koltuk Planları & Şablonlar</h3>
          <p className="text-xs text-muted-foreground">
            Araç tiplerine göre 2+1 ve 2+2 koltuk yerleşim şablonları
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px] py-0 px-2">
          Altyapı Hazır
        </Badge>
      </div>

      {/* Professional Empty State with Layout Previews */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 text-center"
      >
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
          <LayoutGrid className="h-7 w-7" />
        </div>

        <h4 className="text-base font-bold text-foreground">
          Koltuk Planı ve Şablon Yönetimi
        </h4>

        <p className="mx-auto mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
          Koltuk planı ve şablon oluşturma altyapısı hazırlanmıştır. Görsel koltuk seçimi, tekli/çiftli koltuk fiyatlandırma ve cinsiyet kuralı özellikleri bir sonraki sürümde aktif olacaktır.
        </p>

        {/* Supported Layouts Info */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5">
            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
              <span>💺 2+1 Rahat Hat Düzeni</span>
              <Badge variant="success" className="text-[9px] py-0 px-1">
                Destekleniyor
              </Badge>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
              Sol tekli koltuklar, sağ çiftli koltuklar. Toplam 38 koltuk şablonu.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5">
            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
              <span>🚌 2+2 Standart Düzen</span>
              <Badge variant="success" className="text-[9px] py-0 px-1">
                Destekleniyor
              </Badge>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
              Sol çiftli ve sağ çiftli standart koridor yerleşimi. 46-54 koltuk şablonu.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
