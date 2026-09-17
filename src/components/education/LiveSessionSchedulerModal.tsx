'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  Users,
  Coins,
  ShieldCheck,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useEducationStore } from '@/stores/useEducationStore';
import type { AgeGroup, CourseDraft } from '@/types/education';
import { cn } from '@/lib/utils';

interface LiveSessionSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseDrafts?: CourseDraft[];
}

export function LiveSessionSchedulerModal({
  isOpen,
  onClose,
  courseDrafts = [],
}: LiveSessionSchedulerModalProps) {
  const { createLiveSession } = useEducationStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(20, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16); // format: YYYY-MM-DDTHH:MM
  });
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('youth');
  const [creditsRequired, setCreditsRequired] = useState<number>(50);
  const [maxParticipants, setMaxParticipants] = useState<number>(70);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Lütfen canlı ders başlığı giriniz.');
      return;
    }

    if (!scheduledDate) {
      setErrorMsg('Lütfen canlı ders tarihi ve saatini belirleyiniz.');
      return;
    }

    // Enforce 70 participants cap
    const safeMax = Math.min(70, Math.max(5, maxParticipants));

    setIsSubmitting(true);
    try {
      const selectedCourse = courseDrafts.find((c) => c.id === selectedCourseId);
      const res = await createLiveSession({
        courseId: selectedCourse?.id,
        courseTitle: selectedCourse?.title,
        title: title.trim(),
        description: description.trim(),
        scheduledAt: new Date(scheduledDate).toISOString(),
        durationMinutes,
        ageGroup,
        creditsRequired: creditsRequired || 50,
        maxParticipants: safeMax,
      });

      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.message || 'Ders oluşturulamadı.');
      }
    } catch (error) {
      setErrorMsg('Bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500 font-bold text-lg">
                🎥
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Canlı Ders Oturumu Planla
                </h3>
                <p className="text-xs text-muted-foreground">
                  Eğitmen stüdyosunda yeni canlı eğitim oluşturun
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Live Session Guidelines Banner */}
            <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-muted-foreground leading-relaxed">
                Canlı dersler için varsayılan katılım bedeli <strong className="text-foreground">50 Kredi</strong> ve maksimum kontenjan sınırı <strong className="text-foreground">70 Öğrenci</strong>dir. Oturum BigBlueButton güvenli video altyapısına otomatik bağlanır.
              </div>
            </div>

            {/* Course Link (Optional) */}
            {courseDrafts.length > 0 && (
              <div>
                <label className="block font-bold text-foreground mb-1">
                  Bağlı Kurs Taslağı (İsteğe Bağlı)
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    const course = courseDrafts.find((c) => c.id === e.target.value);
                    if (course && !title) {
                      setTitle(`Canlı Uygulama: ${course.title}`);
                    }
                  }}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Bağımsız Canlı Ders (Kurs Dışı)</option>
                  {courseDrafts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.coverEmoji} {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block font-bold text-foreground mb-1">
                Ders Başlığı *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Canlı Kodlama: İlk Yapay Zeka Modelimiz"
                className="w-full h-10 rounded-xl border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-foreground mb-1">
                Ders Açıklaması ve İçerik Özeti
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Öğrencilerin bu canlı derste öğreneceği temel konular..."
                className="w-full rounded-xl border border-border bg-background p-2.5 text-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>

            {/* Date & Time and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Planlanan Tarih ve Saat *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  Ders Süresi
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none"
                >
                  <option value={30}>30 Dakika</option>
                  <option value={45}>45 Dakika</option>
                  <option value={60}>60 Dakika (1 Saat)</option>
                  <option value={90}>90 Dakika</option>
                </select>
              </div>
            </div>

            {/* Age Group & Credits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-foreground mb-1">
                  Hedef Yaş Grubu
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-2.5 font-semibold text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="preschool">Okul Öncesi (3-6)</option>
                  <option value="child">Çocuk (7-12)</option>
                  <option value="youth">Genç (13-18)</option>
                  <option value="adult">Yetişkin (19-64)</option>
                  <option value="senior">65+ Yaş</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1 flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-rose-500" />
                  Katılım Bedeli
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={creditsRequired}
                    onChange={(e) => setCreditsRequired(Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-border bg-background pl-3 pr-12 font-bold text-foreground focus:border-primary focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-bold text-muted-foreground">
                    Kredi
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-blue-500" />
                  Kontenjan (Maks 70)
                </label>
                <input
                  type="number"
                  min={5}
                  max={70}
                  value={maxParticipants}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMaxParticipants(Math.min(70, Math.max(5, val)));
                  }}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Estimated revenue summary */}
            <div className="p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-muted-foreground text-[11px]">Eğitmen Hakedişi (%70 Pay):</span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(creditsRequired * 0.70)} Kredi / Öğrenci Başı
              </span>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="ghost"
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
                disabled={isSubmitting || !title.trim() || !scheduledDate}
                className="font-bold text-xs px-4 h-9 shadow-xs"
              >
                {isSubmitting ? 'Planlanıyor...' : 'Canlı Dersi Yayınla'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
