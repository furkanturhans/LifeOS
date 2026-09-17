'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileCheck,
  Award,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  Play,
  Check,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useEducationStore } from '@/stores/useEducationStore';
import type { Exam, ExamAttempt } from '@/types/education';
import { cn } from '@/lib/utils';

interface MyExamsViewProps {
  onBackToHub: () => void;
}

export function MyExamsView({ onBackToHub }: MyExamsViewProps) {
  const { exams, fetchExams, startExamAttempt } = useEducationStore();
  const [learnerAttempts, setLearnerAttempts] = useState<ExamAttempt[]>([]);
  const [isStarting, setIsStarting] = useState<string | null>(null);

  useEffect(() => {
    fetchExams();
    fetch('/api/education/exams/results?learnerId=user_local')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.attempts)) {
          setLearnerAttempts(data.attempts);
        }
      })
      .catch(() => {});
  }, [fetchExams]);

  const handleStart = async (examId: string) => {
    setIsStarting(examId);
    await startExamAttempt(examId);
    setIsStarting(null);
  };

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
              Süreli deneme sınavları, değerlendirmeler ve başarı belgeleri
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-3xl mx-auto w-full">
        {/* Certificate Eligibility Overview */}
        <Card className="p-4 border-border bg-gradient-to-br from-purple-500/10 via-card to-card shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-500 font-bold">
              <Award className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">
                Süreli Sınav & Sertifikasyon Güvencesi
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Sınavlar sunucu saatine göre senkronize çalışır. İnternet kesintisinde süreniz sunucuda akmaya devam eder; süreniz bitmeden sınava geri dönebilirsiniz. %70 üzeri başarı gösteren öğrenciler başarı sertifikası kazanır.
              </p>
            </div>
          </div>
        </Card>

        {/* SECTION 1: AVAILABLE EXAMS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Aktif ve Yaklaşan Sınavlarım ({exams.length})
            </h2>
          </div>

          {exams.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
              Kayıtlı olduğunuz kurslar için henüz bir sınav planlanmadı.
            </div>
          ) : (
            exams.map((exam) => {
              const attempt = learnerAttempts.find((a) => a.examId === exam.id);
              const isCompleted = attempt?.status === 'submitted' || attempt?.status === 'expired' || attempt?.status === 'graded';
              const isInProgress = attempt?.status === 'in_progress';

              return (
                <Card key={exam.id} className="p-4 border-border bg-card shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-500 font-bold text-lg">
                        📝
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-foreground truncate">
                            {exam.title}
                          </h3>
                          {isCompleted ? (
                            <StatusBadge status="completed" label="Teslim Edildi" size="sm" />
                          ) : isInProgress ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 animate-pulse">
                              <Clock className="h-3 w-3" /> Devam Ediyor
                            </span>
                          ) : (
                            <StatusBadge status="active" label="Sınava Açık" size="sm" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {exam.courseTitle} • Eğitmen: {exam.instructorName}
                        </p>
                        {exam.description && (
                          <p className="mt-1 text-xs text-muted-foreground/80 line-clamp-1">
                            {exam.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-purple-500 block">
                        {exam.durationMinutes} Dakika
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Geçme Notu: %{exam.passScorePercent}
                      </span>
                    </div>
                  </div>

                  {/* Meta Bar & Start Button */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                      <span>{exam.questionsCount || 0} Soru</span>
                      <span>•</span>
                      <span>Tek Deneme Hakkı</span>
                    </div>

                    <div>
                      {isCompleted ? (
                        <div className="flex items-center gap-2">
                          {attempt?.scorePercent !== undefined && (
                            <span className="text-xs font-bold text-foreground">
                              Notunuz: %{attempt.scorePercent}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Teslim Edildi
                          </span>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isStarting === exam.id}
                          onClick={() => handleStart(exam.id)}
                          className="font-bold text-xs h-8 px-3.5 bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          {isInProgress ? 'Sınava Devam Et' : 'Sınavı Başlat'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
