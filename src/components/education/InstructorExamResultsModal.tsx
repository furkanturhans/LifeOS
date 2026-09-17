'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Calendar,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Exam, ExamAttempt } from '@/types/education';
import { cn } from '@/lib/utils';

interface InstructorExamResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  instructorId: string;
}

export function InstructorExamResultsModal({
  isOpen,
  onClose,
  exam,
  instructorId,
}: InstructorExamResultsModalProps) {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && exam && instructorId) {
      setIsLoading(true);
      fetch(`/api/education/exams/results?instructorId=${encodeURIComponent(instructorId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.results)) {
            const currentExamEntry = data.results.find((r: { exam: Exam }) => r.exam.id === exam.id);
            setAttempts(currentExamEntry?.attempts || []);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, exam, instructorId]);

  if (!isOpen || !exam) return null;

  const totalAttempts = attempts.length;
  const passedCount = attempts.filter((a) => a.isPassed).length;
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.scorePercent || 0), 0) / totalAttempts)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-500 font-bold text-xl">
              📊
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Sınav Sonuçları ve Öğrenci Katılımları
              </h2>
              <p className="text-xs text-muted-foreground">
                {exam.title} ({exam.courseTitle})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl border border-border bg-muted/30">
              <span className="text-[11px] text-muted-foreground block font-semibold">
                Teslim Edilen
              </span>
              <span className="text-lg font-extrabold text-foreground">
                {totalAttempts} Öğrenci
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-border bg-muted/30">
              <span className="text-[11px] text-muted-foreground block font-semibold">
                Başarı Oranı
              </span>
              <span className="text-lg font-extrabold text-emerald-500">
                {totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0}%
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-border bg-muted/30">
              <span className="text-[11px] text-muted-foreground block font-semibold">
                Ortalama Not
              </span>
              <span className="text-lg font-extrabold text-foreground">
                %{avgScore}
              </span>
            </div>
          </div>

          {/* Submissions List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Öğrenci Denemeleri ({attempts.length})
            </h3>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Sonuçlar yükleniyor...
              </div>
            ) : attempts.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                Bu sınava henüz öğrenci teslimatı yapılmadı.
              </div>
            ) : (
              <div className="space-y-2">
                {attempts.map((attempt) => (
                  <Card key={attempt.id} className="p-3.5 border-border bg-card shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-bold">
                        {attempt.learnerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">
                          {attempt.learnerName}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleTimeString('tr-TR') : 'Sürüyor'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="text-xs font-extrabold text-foreground block">
                          %{attempt.scorePercent ?? 0}
                        </span>
                        <span className={cn(
                          'text-[10px] font-semibold',
                          attempt.isPassed ? 'text-emerald-500' : 'text-amber-500'
                        )}>
                          {attempt.isPassed ? 'Başarılı' : 'Kaldı'}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-card/60 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-semibold">
            Kapat
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
