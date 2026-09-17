'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  ArrowLeft,
  ArrowRight,
  Check,
  Award,
  BookOpen,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useEducationStore } from '@/stores/useEducationStore';
import { cn } from '@/lib/utils';

export function ExamTakerScreen() {
  const {
    activeExam,
    activeAttempt,
    saveExamAnswer,
    submitExamAttempt,
    closeExamTaker,
  } = useEducationStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoSubmittedRef = useRef(false);

  // Initialize and run server-synchronized countdown timer
  useEffect(() => {
    if (!activeAttempt) return;

    function updateRemaining() {
      if (!activeAttempt) return;
      const expiry = new Date(activeAttempt.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setRemainingSeconds(diff);

      // Auto-submit when timer hits 0
      if (diff <= 0 && activeAttempt.status === 'in_progress' && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        submitExamAttempt(true);
      }
    }

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [activeAttempt, submitExamAttempt]);

  if (!activeExam || !activeAttempt) return null;

  const questions = activeExam.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLocked = activeAttempt.status !== 'in_progress' || remainingSeconds <= 0;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = async (optionIndex: number) => {
    if (isLocked || !currentQuestion) return;

    setSaveStatus('saving');
    const res = await saveExamAnswer(currentQuestion.id, optionIndex);
    if (res.success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1200);
    } else {
      setSaveStatus('error');
    }
  };

  const handleManualSubmit = async () => {
    setIsSubmitting(true);
    await submitExamAttempt(false);
    setIsSubmitting(false);
    setIsSubmitModalOpen(false);
  };

  const answeredCount = Object.keys(activeAttempt.answers || {}).length;

  // ---------------------------------------------------------------------------
  // SUBMITTED / COMPLETED SCREEN
  // ---------------------------------------------------------------------------
  if (activeAttempt.status === 'submitted' || activeAttempt.status === 'expired' || activeAttempt.status === 'graded') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl text-center space-y-6"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-500 text-3xl font-bold shadow-xs">
            🎉
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-foreground">
              Sınavınız Öğretmeninize Teslim Edildi
            </h2>
            <p className="text-xs text-muted-foreground">
              {activeExam.title} • {activeExam.courseTitle}
            </p>
          </div>

          {/* Submission Stats */}
          <div className="p-4 rounded-2xl border border-border bg-muted/30 grid grid-cols-2 gap-3 text-left">
            <div>
              <span className="text-[11px] text-muted-foreground block">Cevaplanan Soru</span>
              <span className="text-sm font-bold text-foreground">
                {answeredCount} / {questions.length}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Durum</span>
              <span className="text-xs font-semibold text-emerald-500 inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Teslim Edildi
              </span>
            </div>
            {activeAttempt.scorePercent !== undefined && (
              <>
                <div className="pt-2 border-t border-border/50">
                  <span className="text-[11px] text-muted-foreground block">Başarı Notu</span>
                  <span className="text-base font-extrabold text-foreground">
                    %{activeAttempt.scorePercent}
                  </span>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <span className="text-[11px] text-muted-foreground block">Sonuç</span>
                  <span className={cn(
                    'text-xs font-bold inline-flex items-center gap-1',
                    activeAttempt.isPassed ? 'text-emerald-500' : 'text-amber-500'
                  )}>
                    {activeAttempt.isPassed ? '✅ Başarılı (Geçti)' : '⏳ İncelemede'}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="p-3 rounded-xl border border-border bg-background text-[11px] text-muted-foreground text-left">
            <span className="font-semibold text-foreground">Güvenlik Notu:</span> Cevaplarınız sunucuda kilitlendi ve denetim kaydı oluşturuldu. Detaylı soru analizleri eğitmeniniz değerlendirmeyi yayınladığında açılacaktır.
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={closeExamTaker}
            className="w-full font-bold text-xs h-11 shadow-xs"
          >
            Sınav Merkezine Dön
          </Button>
        </motion.div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // ACTIVE TIMED EXAM INTERFACE
  // ---------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background select-none">
      {/* Top Header Bar with Server-Authoritative Timer */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-base">
            📝
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-bold text-foreground truncate">
              {activeExam.title}
            </h1>
            <p className="text-[11px] text-muted-foreground truncate">
              {activeExam.courseTitle} • Eğitmen: {activeExam.instructorName}
            </p>
          </div>
        </div>

        {/* Center/Right Timer & Status */}
        <div className="flex items-center gap-3">
          {/* Auto-save Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
            {saveStatus === 'saving' && (
              <span className="text-muted-foreground animate-pulse flex items-center gap-1">
                <Clock className="h-3 w-3" /> Kaydediliyor...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-emerald-500 font-medium flex items-center gap-1">
                <Check className="h-3 w-3" /> Kaydedildi
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-400 font-medium">Kayıt hatası</span>
            )}
          </div>

          {/* Server Timer Badge */}
          <div
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border font-mono font-bold text-xs shadow-xs',
              remainingSeconds < 300
                ? 'border-rose-500 bg-rose-500/10 text-rose-500 animate-pulse'
                : 'border-border bg-card text-foreground'
            )}
          >
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{formatTimer(remainingSeconds)}</span>
          </div>

          {/* Submit Action Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSubmitModalOpen(true)}
            className="font-bold text-xs h-8 px-3 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Send className="h-3 w-3 mr-1" />
            Sınavı Bitir
          </Button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-5xl mx-auto w-full p-4 sm:p-6 gap-6">
        {/* Left / Center: Question Card */}
        <main className="flex-1 flex flex-col min-w-0">
          {currentQuestion ? (
            <Card className="flex-1 flex flex-col p-6 border-border bg-card shadow-xs space-y-5 overflow-y-auto">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-500 bg-purple-500/10 px-2.5 py-0.5 rounded-lg">
                    Soru {currentQuestionIndex + 1} / {questions.length}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({currentQuestion.points} Puan)
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Otomatik Kaydediliyor</span>
                </div>
              </div>

              {/* Question Content */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground leading-relaxed">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2 flex-1">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = activeAttempt.answers[currentQuestion.id] === optIdx;
                  const letter = String.fromCharCode(65 + optIdx);

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isLocked}
                      onClick={() => handleSelectOption(optIdx)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all',
                        isSelected
                          ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/40 shadow-xs'
                          : 'border-border bg-background/50 hover:bg-muted/40 text-foreground/90'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition-all',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-muted/60 text-muted-foreground'
                        )}
                      >
                        {letter}
                      </div>
                      <span className="text-xs font-medium leading-normal">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Nav Prev/Next */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="text-xs font-semibold h-9"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Önceki Soru
                </Button>

                <span className="text-xs text-muted-foreground font-semibold">
                  {answeredCount} / {questions.length} Cevaplandı
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQuestionIndex === questions.length - 1}
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="text-xs font-semibold h-9"
                >
                  Sonraki Soru
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </Card>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
              Soru yüklenemedi.
            </div>
          )}
        </main>

        {/* Right / Side: Question Palette */}
        <aside className="w-full md:w-64 flex flex-col gap-4">
          <Card className="p-4 border-border bg-card shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Soru Gezintisi
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = activeAttempt.answers[q.id] !== undefined;
                const isCurrent = currentQuestionIndex === idx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={cn(
                      'h-9 rounded-xl border text-xs font-bold transition-all flex items-center justify-center',
                      isCurrent && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                      isAnswered
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border text-[11px] text-muted-foreground space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-emerald-500/20 border border-emerald-500/40" />
                <span>Cevaplandı ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-background border border-border" />
                <span>Boş ({questions.length - answeredCount})</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>

      {/* Manual Submit Confirmation Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-foreground font-bold text-sm">
                <Send className="h-5 w-5 text-emerald-500" />
                <span>Sınavı Teslim Et</span>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>
                  Toplam <strong>{questions.length}</strong> sorudan <strong>{answeredCount}</strong> tanesini cevapladınız.
                </p>
                {questions.length > answeredCount && (
                  <p className="text-amber-500 font-semibold">
                    ⚠️ {questions.length - answeredCount} soruyu henüz cevaplamadınız.
                  </p>
                )}
                <p>
                  Teslim ettikten sonra cevaplarınızı değiştiremez veya sınava yeniden başlayamazsınız.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSubmitModalOpen(false)}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Sorulara Dön
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleManualSubmit}
                  disabled={isSubmitting}
                  className="font-bold text-xs px-4 h-9 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? 'Teslim Ediliyor...' : 'Evet, Sınavı Teslim Et'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
