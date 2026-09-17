'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileCheck,
  Award,
  BookOpen,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface MyExamsViewProps {
  onBackToHub: () => void;
}

export function MyExamsView({ onBackToHub }: MyExamsViewProps) {
  return (
    <div className="flex flex-col h-full bg-background select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/70 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToHub}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
            aria-label="Dersler Merkezine Dön"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-xs text-lg">
            📝
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Sınavlarım & Sertifikalar
              </h1>
              <StatusBadge status="active" label="Sınav Merkezi" size="sm" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Deneme sınavları, quizler ve başarı sertifikaları
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full">
        {/* Certificate Eligibility Overview */}
        <Card className="p-4 border-border bg-gradient-to-br from-purple-500/10 via-card to-card shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-500 font-bold">
              <Award className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">
                Sertifikasyon & Başarı Ölçümü
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Kursları tamamlayan öğrenciler, soru bankasından derlenen bitirme sınavlarında %70 üzeri başarı gösterdiklerinde doğrulanabilir dijital sertifika almaya hak kazanır.
              </p>
            </div>
          </div>
        </Card>

        {/* Empty State */}
        <div className="py-12 px-4 text-center">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl border border-border bg-muted/40 text-2xl shadow-xs">
            📑
          </div>
          <h3 className="mt-3 text-sm font-bold text-foreground">
            Aktif Sınav Girişimi Yok
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Kayıt olduğunuz kursların modül sonu değerlendirme ve seviye belirleme sınavları burada görüntülenecektir.
          </p>
        </div>
      </div>
    </div>
  );
}
