'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Video,
  FileText,
  Book,
  FileDown,
  ClipboardList,
  FileCheck,
  Save,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useEducationStore } from '@/stores/useEducationStore';
import type {
  CourseDraft,
  CourseSection,
  LessonDraft,
  LessonContent,
  AgeGroup,
  CourseLevel,
  LessonContentType,
} from '@/types/education';
import { cn } from '@/lib/utils';

interface CourseDraftBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  initialDraft?: CourseDraft | null;
}

const AGE_GROUPS: { id: AgeGroup; label: string; age: string }[] = [
  { id: 'preschool', label: 'Okul Öncesi', age: '3-6 Yaş' },
  { id: 'child', label: 'Çocuk', age: '7-12 Yaş' },
  { id: 'youth', label: 'Genç', age: '13-18 Yaş' },
  { id: 'adult', label: 'Yetişkin', age: '19-64 Yaş' },
  { id: 'senior', label: 'Kıdemli (65+)', age: '65+ Yaş' },
];

const COURSE_LEVELS: { id: CourseLevel; label: string }[] = [
  { id: 'beginner', label: 'Başlangıç' },
  { id: 'intermediate', label: 'Orta Seviye' },
  { id: 'advanced', label: 'İleri Seviye' },
  { id: 'all_levels', label: 'Tüm Seviyeler' },
];

const CONTENT_TYPE_OPTIONS: { id: LessonContentType; label: string; icon: string }[] = [
  { id: 'video', label: 'Video Ders', icon: '🎥' },
  { id: 'live_session', label: 'Canlı Ders', icon: '🔴' },
  { id: 'article', label: 'Makale / Okuma', icon: '📄' },
  { id: 'digital_book', label: 'Dijital Kitap', icon: '📖' },
  { id: 'resource_file', label: 'Ek Kaynak / Dosya', icon: '📁' },
  { id: 'assignment', label: 'Ödev / Görev', icon: '✍️' },
  { id: 'exam', label: 'Sınav / Quiz', icon: '📝' },
];

export function CourseDraftBuilder({
  isOpen,
  onClose,
  initialDraft,
}: CourseDraftBuilderProps) {
  const { saveCourseDraft, instructorProfile } = useEducationStore();

  const [title, setTitle] = useState(initialDraft?.title || '');
  const [description, setDescription] = useState(initialDraft?.description || '');
  const [category, setCategory] = useState(initialDraft?.category || 'Yazılım & Teknoloji');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(initialDraft?.ageGroup || 'youth');
  const [level, setLevel] = useState<CourseLevel>(initialDraft?.level || 'beginner');
  const [coverEmoji, setCoverEmoji] = useState(initialDraft?.coverEmoji || '📘');
  const [learningGoals, setLearningGoals] = useState<string[]>(
    initialDraft?.learningGoals || ['Temel kavramları öğrenmek', 'Uygulamalı proje yapmak']
  );
  const [newGoalInput, setNewGoalInput] = useState('');

  const [sections, setSections] = useState<CourseSection[]>(
    initialDraft?.sections || [
      {
        id: `sec_${Date.now()}`,
        title: 'Bölüm 1: Giriş ve Temel Kavramlar',
        order: 1,
        lessons: [
          {
            id: `les_${Date.now()}`,
            title: 'Ders 1: Hoş Geldiniz ve Ders İzlencesi',
            order: 1,
            isDraft: true,
            contents: [
              {
                id: `cnt_${Date.now()}`,
                type: 'video',
                title: 'Giriş Videosu Taslağı',
                durationMinutes: 10,
                isDraft: true,
              },
            ],
          },
        ],
      },
    ]
  );

  const [saveSuccess, setSaveSuccess] = useState(false);

  function handleAddGoal() {
    if (!newGoalInput.trim()) return;
    setLearningGoals([...learningGoals, newGoalInput.trim()]);
    setNewGoalInput('');
  }

  function handleRemoveGoal(index: number) {
    setLearningGoals(learningGoals.filter((_, i) => i !== index));
  }

  function handleAddSection() {
    const newSection: CourseSection = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      title: `Bölüm ${sections.length + 1}: Yeni Konu Başlığı`,
      order: sections.length + 1,
      lessons: [],
    };
    setSections([...sections, newSection]);
  }

  function handleAddLesson(sectionId: string) {
    setSections(
      sections.map((sec) => {
        if (sec.id === sectionId) {
          const newLesson: LessonDraft = {
            id: `les_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            title: `Ders ${sec.lessons.length + 1}: Yeni Ders Taslağı`,
            order: sec.lessons.length + 1,
            isDraft: true,
            contents: [],
          };
          return { ...sec, lessons: [...sec.lessons, newLesson] };
        }
        return sec;
      })
    );
  }

  function handleAddContent(sectionId: string, lessonId: string, type: LessonContentType) {
    const typeLabel = CONTENT_TYPE_OPTIONS.find((t) => t.id === type)?.label || 'İçerik';
    const newContent: LessonContent = {
      id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      type,
      title: `${typeLabel} Taslağı`,
      durationMinutes: type === 'video' || type === 'live_session' ? 15 : undefined,
      isDraft: true,
    };

    setSections(
      sections.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            lessons: sec.lessons.map((les) => {
              if (les.id === lessonId) {
                return { ...les, contents: [...les.contents, newContent] };
              }
              return les;
            }),
          };
        }
        return sec;
      })
    );
  }

  function handleSave() {
    if (!title.trim()) return;

    const draft: CourseDraft = {
      id: initialDraft?.id || `course_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      instructorId: instructorProfile?.id || 'inst_verified_1',
      instructorName: instructorProfile?.displayName || 'Doğrulanmış Eğitmen',
      title: title.trim(),
      description: description.trim(),
      category,
      ageGroup,
      level,
      learningGoals,
      coverEmoji,
      sections,
      createdAt: initialDraft?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDraft: true,
      isPublished: false,
    };

    saveCourseDraft(draft);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialDraft ? 'Kurs Taslağını Düzenle' : 'Yeni Kurs Taslağı Oluştur'}
      description="Kurs yapısını, hedef yaş grubunu ve ders içerik taslaklarını belirleyin."
      size="lg"
    >
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Basic Info Section */}
        <div className="space-y-3 p-4 rounded-2xl border border-border bg-card/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Temel Kurs Bilgileri
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                Kapak Simgesi
              </label>
              <input
                type="text"
                value={coverEmoji}
                onChange={(e) => setCoverEmoji(e.target.value)}
                maxLength={4}
                className="w-full h-10 rounded-xl border border-border bg-background text-center text-xl focus:border-primary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                Kurs Başlığı
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Sıfırdan Web Geliştirme Temelleri"
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground mb-1">
              Kurs Açıklaması
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Bu eğitimde öğrencilerin neler öğreneceğini özetleyin..."
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {/* Age Group & Level Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                Hedef Yaş Grubu
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
              >
                {AGE_GROUPS.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.label} ({ag.age})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                Zorluk Seviyesi
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CourseLevel)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
              >
                {COURSE_LEVELS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Learning Goals */}
        <div className="space-y-3 p-4 rounded-2xl border border-border bg-card/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Kazanımlar ve Hedefler
          </h4>

          <div className="flex gap-2">
            <input
              type="text"
              value={newGoalInput}
              onChange={(e) => setNewGoalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGoal())}
              placeholder="Yeni öğrenim hedefi ekleyin..."
              className="flex-1 h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
            />
            <Button size="sm" variant="outline" onClick={handleAddGoal} className="h-9 px-3 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" /> Ekle
            </Button>
          </div>

          <div className="space-y-1.5">
            {learningGoals.map((goal, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-background border border-border/70 text-xs"
              >
                <span className="text-foreground font-medium">✓ {goal}</span>
                <button
                  onClick={() => handleRemoveGoal(idx)}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Curriculum: Sections & Lessons & Content Types */}
        <div className="space-y-3 p-4 rounded-2xl border border-border bg-card/60">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" /> Ders İzlencesi (Müfredat)
            </h4>
            <Button size="sm" variant="outline" onClick={handleAddSection} className="h-7 text-[11px] px-2.5">
              <Plus className="h-3 w-3 mr-1" /> Bölüm Ekle
            </Button>
          </div>

          <div className="space-y-3">
            {sections.map((section, secIdx) => (
              <div key={section.id} className="p-3 rounded-2xl border border-border bg-background space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setSections(
                        sections.map((s) => (s.id === section.id ? { ...s, title: newTitle } : s))
                      );
                    }}
                    className="flex-1 font-bold text-xs bg-transparent border-b border-border/50 focus:border-primary focus:outline-none pb-0.5"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddLesson(section.id)}
                    className="h-6 text-[10px] px-2"
                  >
                    + Ders Ekle
                  </Button>
                </div>

                {/* Lessons inside Section */}
                <div className="space-y-2 pl-2 border-l-2 border-primary/20">
                  {section.lessons.map((lesson) => (
                    <div key={lesson.id} className="p-2.5 rounded-xl border border-border/70 bg-card/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground truncate">
                          {lesson.title}
                        </span>
                        <StatusBadge status="draft" label="Taslak Ders" size="sm" />
                      </div>

                      {/* Content Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {lesson.contents.map((cnt) => (
                          <span
                            key={cnt.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground border border-border/60"
                          >
                            <span>
                              {CONTENT_TYPE_OPTIONS.find((t) => t.id === cnt.type)?.icon}
                            </span>
                            <span>{cnt.title}</span>
                          </span>
                        ))}
                      </div>

                      {/* Add Content Type Action Pills */}
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
                        <span className="text-[10px] text-muted-foreground font-bold mr-1 shrink-0">
                          İçerik Ekle:
                        </span>
                        {CONTENT_TYPE_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleAddContent(section.id, lesson.id, opt.id)}
                            className="px-2 py-0.5 rounded-lg border border-border hover:border-primary bg-background text-[10px] font-semibold text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                          >
                            {opt.icon} {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose} className="text-xs font-semibold">
            Vazgeç
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!title.trim()}
            className="text-xs font-bold"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1 text-white animate-bounce" />
                Kaydedildi!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Taslağı Kaydet
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
