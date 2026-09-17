'use client';

import React from 'react';
import { ShieldCheck, Sparkles, Heart, Award, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface KidsGameCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KidsGameCreditsModal({ isOpen, onClose }: KidsGameCreditsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Oyun Kredileri & Lisans Bilgisi"
      description="LifeOS Çocuk Oyunları Güvenlik, Gizlilik ve Açık Kaynak Lisans Beyanı"
      size="md"
    >
      <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
        {/* Child Safety & Privacy Badge */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-800 dark:text-emerald-300">
          <div className="font-bold flex items-center gap-1.5 text-xs mb-1">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>%100 Güvenli & Çocuk Dostu Deneyim</span>
          </div>
          <p className="text-[11px] leading-snug">
            Bu alanda hiçbir reklam, haricî takip kodu (tracker), oyun içi satın alma, sohbet veya kişisel veri toplama mekanizması bulunmaz. Tüm oyunlar cihazınızda yerel ve çevrimdışı çalışır.
          </p>
        </div>

        {/* Game Concepts & Attributions */}
        <div>
          <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2">
            Oyun Tasarımı & Bilişsel Mekanikler
          </h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Hafıza Eşleştirme (Memory Match):</strong> Klasik kart eşleştirme ve uzamsal bellek geliştirme prensipleriyle LifeOS tasarım sistemine özgün olarak kodlanmıştır.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Şekil Sayma (Shape Counter):</strong> Erken çocukluk dönemi nesne sayma, görsel ayırt etme ve temel matematiksel kavrayış mekanikleri referans alınarak üretilmiştir.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Renk & Desen (Color Pattern):</strong> Sıralı bellek ve görsel desen tamamlama algoritmalarından ilham alarak geliştirilmiştir.
              </span>
            </li>
          </ul>
        </div>

        {/* Audio Synthesis Info */}
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <h5 className="font-bold text-foreground text-[11px] mb-0.5">
            Sesler & Web Audio API
          </h5>
          <p className="text-[11px]">
            Oyunlardaki tüm ses efektleri harici ses dosyası indirilmeden tarayıcının standart Web Audio API sentezleyicisi ile anlık olarak üretilir. Sesler varsayılan olarak kapalıdır.
          </p>
        </div>

        {/* License & Terms */}
        <div className="pt-2 border-t border-border/60 text-[11px]">
          <p>
            LifeOS Çocuk Oyunları, açık kaynak eğitim prensiplerine ve MIT Lisansı uyumluluğuna sadık kalınarak LifeOS kullanıcıları için bağımsız olarak hazırlanmıştır.
          </p>
        </div>

        <div className="pt-3 border-t border-border/60 flex justify-end">
          <Button onClick={onClose} variant="primary" size="sm">
            <Check className="h-3.5 w-3.5 mr-1" />
            Anladım & Kapat
          </Button>
        </div>
      </div>
    </Modal>
  );
}
