'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  FileCheck,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useEducationStore } from '@/stores/useEducationStore';
import type { CourseDraft } from '@/types/education';
import { cn } from '@/lib/utils';

interface ExamCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseDrafts: CourseDraft[];
}

interface QuestionDraft {
  id: string;
  questionText: string;
  options: Array<{ id: string; text: string }>;
  correctOptionIndex: number;
  points: number;
  explanation?: string;
}

export function ExamCreateModal({
  isOpen,
  onClose,
  courseDrafts,
}: ExamCreateModalProps) {
  const { createExam, fetchExams } = useEducationStore();

  const [courseId, setCourseId] = useState(courseDrafts[0]?.id || 'crs-math-101');
  const [courseTitle, setCourseTitle] = useState(courseDrafts[0]?.title || 'İleri Matematik 101');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(40);
  const [passScorePercent, setPassScorePercent] = useState(70);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: 'q-init-1',
      questionText: '',
      options: [
        { id: 'opt-1', text: '' },
        { id: 'opt-2', text: '' },
        { id: 'opt-3', text: '' },
        { id: 'opt-4', text: '' },
      ],
      correctOptionIndex: 0,
      points: 25,
    },
  ]);

  if (!isOpen) return null;

  const handleCourseChange = (id: string) => {
    setCourseId(id);
    const selected = courseDrafts.find((c) => c.id === id);
    if (selected) {
      setCourseTitle(selected.title);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        questionText: '',
        options: [
          { id: `opt-${Date.now()}-1`, text: '' },
          { id: `opt-${Date.now()}-2`, text: '' },
          { id: `opt-${Date.now()}-3`, text: '' },
          { id: `opt-${Date.now()}-4`, text: '' },
        ],
        correctOptionIndex: 0,
        points: 25,
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    const updated = [...questions];
    updated[idx].questionText = text;
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx].text = text;
    setQuestions(updated);
  };

  const handleCorrectOptionChange = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].correctOptionIndex = optIdx;
    setQuestions(updated);
  };

  const handlePointsChange = (qIdx: number, pts: number) => {
    const updated = [...questions];
    updated[qIdx].points = Math.max(1, pts);
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Lütfen sınav başlığı giriniz.');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setErrorMessage(`Lütfen ${i + 1}. sorunun metnini yazınız.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          setErrorMessage(`Lütfen ${i + 1}. sorunun ${String.fromCharCode(65 + j)} şıkkını doldurunuz.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    const res = await createExam({
      courseId,
      courseTitle,
      title: title.trim(),
      description: description.trim(),
      scheduledAt: scheduledAt || new Date().toISOString(),
      durationMinutes: Number(durationMinutes) || 40,
      passScorePercent: Number(passScorePercent) || 70,
      questions: questions.map((q) => ({
        questionText: q.questionText.trim(),
        options: q.options.map((o) => ({ id: o.id, text: o.text.trim() })),
        correctOptionIndex: q.correctOptionIndex,
        points: q.points,
        explanation: q.explanation,
      })),
    });

    setIsSubmitting(false);

    if (res.success) {
      await fetchExams();
      onClose();
    } else {
      setErrorMessage(res.message || 'Sınav oluşturulurken bir hata oluştu.');
    }
  };

  const totalExamPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative flex flex-col w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-500 text-xl font-bold">
              📝
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Yeni Sınav Oluştur</h2>
              <p className="text-xs text-muted-foreground">
                Çoktan seçmeli süreli sınav ve soru bankası tanımlayın
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: General Exam Settings */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Genel Sınav Bilgileri
            </h3>

            {/* Course Picker */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Bağlı Kurs *
              </label>
              <select
                value={courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
              >
                {courseDrafts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
                <option value="crs-math-101">İleri Matematik 101</option>
                <option value="crs-ai-foundations">Yapay Zeka Temelleri</option>
              </select>
            </div>

            {/* Exam Title */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Sınav Başlığı *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: 1. Dönem Değerlendirme Sınavı"
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Sınav Açıklaması ve Yönergeler
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Öğrenciler için sınav kuralları ve kapsam bilgisi..."
                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>

            {/* Configurable Duration & Passing Score Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Süre (Dakika) *
                </label>
                <input
                  type="number"
                  min={5}
                  max={240}
                  required
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Geçme Notu (%) *
                </label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  required
                  value={passScorePercent}
                  onChange={(e) => setPassScorePercent(Number(e.target.value))}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Toplam Puan
                </label>
                <div className="w-full h-10 rounded-xl border border-border bg-muted/40 px-3 flex items-center text-xs font-bold text-foreground">
                  {totalExamPoints} Puan
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Question Builder */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Soru Listesi ({questions.length} Soru)
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Doğru seçeneği daireye tıklayarak belirleyin.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
                className="text-xs font-bold h-8 px-3 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Soru Ekle
              </Button>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <Card key={q.id} className="p-4 border-border bg-card/60 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-foreground">
                      Soru {qIdx + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground text-[11px]">Puan:</span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={q.points}
                          onChange={(e) => handlePointsChange(qIdx, Number(e.target.value))}
                          className="w-14 h-7 rounded-lg border border-border bg-background px-1.5 text-xs text-center font-bold text-foreground"
                        />
                      </div>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive flex items-center justify-center hover:bg-muted"
                          title="Soruyu Sil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <textarea
                    rows={2}
                    required
                    value={q.questionText}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    placeholder={`${qIdx + 1}. Sorunun metnini yazınız...`}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                  />

                  {/* Options (A, B, C, D) */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = q.correctOptionIndex === optIdx;
                      const letter = String.fromCharCode(65 + optIdx);

                      return (
                        <div key={opt.id} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCorrectOptionChange(qIdx, optIdx)}
                            className={cn(
                              'h-8 w-8 shrink-0 rounded-xl border flex items-center justify-center text-xs font-bold transition-all',
                              isCorrect
                                ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                                : 'border-border bg-muted/40 text-muted-foreground hover:border-border/80'
                            )}
                            title={isCorrect ? 'Doğru Cevap' : 'Doğru Cevap Olarak Seç'}
                          >
                            {isCorrect ? <Check className="h-4 w-4" /> : letter}
                          </button>

                          <input
                            type="text"
                            required
                            value={opt.text}
                            onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                            placeholder={`${letter} Seçeneği metni...`}
                            className={cn(
                              'flex-1 h-9 rounded-xl border bg-background px-3 text-xs font-medium text-foreground focus:outline-none',
                              isCorrect ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border'
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer Submit Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="font-bold text-xs px-5 h-10 shadow-xs"
            >
              {isSubmitting ? 'Sınav Kaydediliyor...' : 'Sınavı Yayınla & Planla'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
