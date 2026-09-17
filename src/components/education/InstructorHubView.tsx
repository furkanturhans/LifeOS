'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  Layers,
  Coins,
  FileCheck,
  UserCheck,
  Video,
  Users,
  Calendar,
  AlertCircle,
  ExternalLink,
  X,
  Power,
  Play,
  Check,
  MessageSquare,
  User,
  Radio,
  FileText,
  DollarSign,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CourseDraftBuilder } from './CourseDraftBuilder';
import { LiveSessionSchedulerModal } from './LiveSessionSchedulerModal';
import { ExamCreateModal } from './ExamCreateModal';
import { InstructorExamResultsModal } from './InstructorExamResultsModal';
import { InstructorEarningsTab } from './InstructorEarningsTab';
import { useEducationStore } from '@/stores/useEducationStore';
import type { CourseDraft, LiveSession, BigBlueButtonJoinResult, Exam, ClassroomQA } from '@/types/education';
import { cn } from '@/lib/utils';

interface InstructorHubViewProps {
  onBackToHub: () => void;
}

const CATEGORY_CHOICES = [
  'Yazılım & Yapay Zeka',
  'Yabancı Dil & İletişim',
  'Matematik & Fen Bilimleri',
  'Görsel Sanatlar & Tasarım',
  'Müzik & Enstrüman',
  'Kişisel Gelişim & Liderlik',
  'Sınavlara Hazırlık',
];

export function InstructorHubView({ onBackToHub }: InstructorHubViewProps) {
  const {
    role,
    instructorApplication,
    instructorProfile,
    submitInstructorApplication,
    verifyInstructorDemo,
    activeInstructorTab,
    setActiveInstructorTab,
    fetchInstructorStatus,
    courseDrafts,
    deleteCourseDraft,
    liveSessions,
    cancelLiveSession,
    startLiveSession,
    endLiveSession,
    joinLiveSession,
    liveClassHealth,
    checkLiveClassHealth,
    exams,
    fetchExams,
    instructorStudents,
    fetchInstructorStudents,
    instructorClassrooms,
    fetchInstructorClassrooms,
  } = useEducationStore();

  useEffect(() => {
    fetchInstructorStatus();
    checkLiveClassHealth();
    fetchExams();
    fetchInstructorStudents();
    fetchInstructorClassrooms();
  }, [
    fetchInstructorStatus,
    checkLiveClassHealth,
    fetchExams,
    fetchInstructorStudents,
    fetchInstructorClassrooms,
  ]);

  // Form State
  const [fullName, setFullName] = useState('');
  const [expertiseArea, setExpertiseArea] = useState('');
  const [educationLevel, setEducationLevel] = useState<
    'high_school' | 'bachelor' | 'master' | 'doctorate' | 'certified_expert'
  >('bachelor');
  const [bio, setBio] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Yazılım & Yapay Zeka',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<CourseDraft | null>(null);
  const [isLiveSchedulerOpen, setIsLiveSchedulerOpen] = useState(false);
  const [isExamCreateOpen, setIsExamCreateOpen] = useState(false);
  const [viewingExamResults, setViewingExamResults] = useState<Exam | null>(null);

  // Cancellation Modal
  const [cancellingSession, setCancellingSession] = useState<LiveSession | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  // BBB Join Modal
  const [bbbModalData, setBbbModalData] = useState<{
    isOpen: boolean;
    session: LiveSession | null;
    result: BigBlueButtonJoinResult | null;
    loading: boolean;
  }>({
    isOpen: false,
    session: null,
    result: null,
    loading: false,
  });

  const handleToggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !expertiseArea.trim() || !bio.trim()) return;

    setIsSubmitting(true);
    await submitInstructorApplication({
      applicantLifeosId: 'user_local',
      fullName: fullName.trim(),
      expertiseArea: expertiseArea.trim(),
      educationLevel,
      bio: bio.trim(),
      teachingCategories: selectedCategories,
    });
    setIsSubmitting(false);
  };

  const handleConfirmCancelSession = async () => {
    if (!cancellingSession) return;
    setIsCancelling(true);
    const res = await cancelLiveSession(cancellingSession.id);
    setIsCancelling(false);
    if (res.success) {
      setCancelMessage(res.message || 'Canlı ders iptal edildi ve ücretler iade edildi.');
      setTimeout(() => {
        setCancellingSession(null);
        setCancelMessage(null);
      }, 1500);
    }
  };

  const handleStartSession = async (session: LiveSession) => {
    setBbbModalData({
      isOpen: true,
      session,
      result: null,
      loading: true,
    });

    const startRes = await startLiveSession(session.id);
    if (!startRes.success) {
      setBbbModalData({
        isOpen: true,
        session,
        result: {
          success: false,
          isConfigured: liveClassHealth?.isConfigured ?? false,
          meetingId: session.bbbMeetingId || session.id,
          message: startRes.message || 'Canlı ders başlatılamadı. Sunucu ortam değişkenlerini kontrol ediniz.',
        },
        loading: false,
      });
      return;
    }

    const joinResult = await joinLiveSession(session.id);
    setBbbModalData((prev) => ({
      ...prev,
      result: joinResult,
      loading: false,
    }));
  };

  // ---------------------------------------------------------------------------
  // 1. STATE: INSTRUCTOR VERIFIED (6-TAB ADVANCED STUDIO VIEW)
  // ---------------------------------------------------------------------------
  if (role === 'instructor_verified') {
    const tabs: {
      id: 'courses' | 'live_sessions' | 'exams' | 'students' | 'classrooms' | 'earnings' | 'profile';
      label: string;
      icon: React.ElementType;
      badge?: number;
    }[] = [
      { id: 'courses', label: 'Kurslarım', icon: BookOpen, badge: courseDrafts.length },
      { id: 'live_sessions', label: 'Canlı Derslerim', icon: Video, badge: liveSessions.length },
      { id: 'exams', label: 'Sınavlarım', icon: FileCheck, badge: exams.length },
      { id: 'students', label: 'Öğrencilerim', icon: Users, badge: instructorStudents.length },
      { id: 'classrooms', label: 'Sınıf Alanlarım', icon: MessageSquare, badge: instructorClassrooms.length },
      { id: 'earnings', label: 'Kazançlarım & Hakediş', icon: DollarSign },
      { id: 'profile', label: 'Eğitmen Profili', icon: User },
    ];

    return (
      <div className="flex flex-col h-full bg-background select-none">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBackToHub}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
              aria-label="Dersler Merkezine Dön"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-xs text-lg font-bold">
              🎓
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold text-foreground">
                  Eğitmen Paneli
                </h1>
                <StatusBadge status="verified" label="Doğrulanmış Eğitmen" size="sm" />
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {instructorProfile?.displayName || 'Eğitmen Stüdyosu'} • %70 Gelir Paylaşımı
              </p>
            </div>
          </div>

          {/* Quick Action Trigger based on current tab */}
          <div className="flex items-center gap-2">
            {activeInstructorTab === 'courses' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingDraft(null);
                  setIsBuilderOpen(true);
                }}
                className="font-bold text-xs h-8 px-3.5 shadow-xs"
              >
                <Plus className="h-4 w-4 mr-1" />
                Yeni Kurs Taslağı
              </Button>
            )}

            {activeInstructorTab === 'live_sessions' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsLiveSchedulerOpen(true)}
                className="font-bold text-xs h-8 px-3.5 bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                <Video className="h-3.5 w-3.5 mr-1" />
                Canlı Ders Planla
              </Button>
            )}

            {activeInstructorTab === 'exams' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsExamCreateOpen(true)}
                className="font-bold text-xs h-8 px-3.5 bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Sınav Oluştur
              </Button>
            )}
          </div>
        </div>

        {/* 6 Tabs Navigation Bar */}
        <div className="border-b border-border bg-muted/40 px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeInstructorTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveInstructorTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                    isActive
                      ? 'bg-card text-foreground border border-border shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={cn(
                      'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                      isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                    )}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
          {/* TAB 1: COURSES */}
          {activeInstructorTab === 'courses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground">Kurslarım ({courseDrafts.length})</h2>
                  <p className="text-xs text-muted-foreground">Oluşturduğunuz taslak kurslar ve ders içerikleri</p>
                </div>
              </div>

              {courseDrafts.length > 0 ? (
                courseDrafts.map((draft) => (
                  <Card key={draft.id} className="p-4 border-border bg-card shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/60 text-2xl">
                          {draft.coverEmoji}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-foreground truncate">{draft.title}</h3>
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{draft.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingDraft(draft);
                            setIsBuilderOpen(true);
                          }}
                          className="h-8 w-8 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground"
                          title="Düzenle"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteCourseDraft(draft.id)}
                          className="h-8 w-8 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-destructive"
                          title="Sil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{draft.sections.length} Bölüm • {draft.sections.reduce((acc, s) => acc + s.lessons.length, 0)} Ders</span>
                      <StatusBadge status="draft" label="Taslak" size="sm" />
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                  Henüz kurs taslağınız yok. &ldquo;Yeni Kurs Taslağı&rdquo; butonuna basarak ilk kursunuzu oluşturun.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE SESSIONS */}
          {activeInstructorTab === 'live_sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground">Canlı Derslerim ({liveSessions.length})</h2>
                  <p className="text-xs text-muted-foreground">Maks 70 kişi kapasiteli ve 50 kredi ücretli oturumlar</p>
                </div>
              </div>

              {liveSessions.length > 0 ? (
                liveSessions.map((session) => (
                  <Card key={session.id} className="p-4 border-border bg-card shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-lg font-bold">
                          🎥
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-foreground truncate">{session.title}</h3>
                          <p className="text-xs text-muted-foreground">{session.description}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-rose-500">{session.creditsRequired || 50} Kredi</span>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span>{new Date(session.scheduledAt).toLocaleString('tr-TR')}</span>
                        <span className="font-semibold text-foreground">{session.currentParticipantCount} / {session.maxParticipants} Kayıtlı</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {session.status !== 'cancelled' && session.status !== 'completed' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCancellingSession(session)}
                              className="h-7 text-[11px] text-destructive hover:bg-destructive/10"
                            >
                              İptal & İade
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleStartSession(session)}
                              className="h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Dersi Başlat (BBB)
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                  Henüz planlanmış canlı dersiniz bulunmuyor.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXAMS */}
          {activeInstructorTab === 'exams' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground">Sınavlarım ({exams.length})</h2>
                  <p className="text-xs text-muted-foreground">Çoktan seçmeli süreli sınavlar ve değerlendirme sonuçları</p>
                </div>
              </div>

              {exams.length > 0 ? (
                exams.map((exam) => (
                  <Card key={exam.id} className="p-4 border-border bg-card shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-500 font-bold text-lg">
                          📝
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-foreground truncate">{exam.title}</h3>
                          <p className="text-xs text-muted-foreground">{exam.courseTitle} • {exam.questionsCount} Soru • {exam.durationMinutes} Dk</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-purple-500">Geçme: %{exam.passScorePercent}</span>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-muted-foreground">Sunucu Zamanlı Tek Deneme</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingExamResults(exam)}
                        className="text-xs font-bold h-7 px-3 border-border hover:bg-muted"
                      >
                        <Users className="h-3.5 w-3.5 mr-1 text-purple-500" />
                        Sonuçları Gör
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                  Henüz sınav oluşturmadınız.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: STUDENTS */}
          {activeInstructorTab === 'students' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-foreground">Öğrencilerim ({instructorStudents.length})</h2>
                <p className="text-xs text-muted-foreground">Kurslarınıza ve canlı derslerinize kayıtlı aktif öğrenciler</p>
              </div>

              <div className="space-y-2">
                {instructorStudents.map((std) => (
                  <Card key={std.id} className="p-3.5 border-border bg-card shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 font-bold text-xs">
                        {std.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{std.name}</h4>
                        <p className="text-[11px] text-muted-foreground">
                          {std.enrolledCoursesCount} Kurs Kaydı • {std.liveSessionsAttended} Canlı Derse Katılım
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Aktif Öğrenci
                    </span>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CLASSROOMS */}
          {activeInstructorTab === 'classrooms' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-foreground">Sınıf Alanlarım ({instructorClassrooms.length})</h2>
                <p className="text-xs text-muted-foreground">Kurs duyuruları, soru-cevap akışları ve LifeOS Connect sınıf kanalları</p>
              </div>

              {instructorClassrooms.map((grp) => (
                <Card key={grp.id} className="p-4 border-border bg-card shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                    <h3 className="text-xs font-bold text-foreground">{grp.name}</h3>
                    <span className="text-[10px] text-primary font-semibold">Sınıf Alanı</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-muted-foreground block">Son Soru-Cevap:</span>
                    {grp.qaThreads.map((qa: ClassroomQA) => (
                      <div key={qa.id} className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{qa.studentName}:</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(qa.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <p className="text-muted-foreground italic">&ldquo;{qa.question}&rdquo;</p>
                        {qa.answer && (
                          <div className="pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <strong>Eğitmen Cevabı:</strong> {qa.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* TAB 6: EARNINGS */}
          {activeInstructorTab === 'earnings' && (
            <InstructorEarningsTab instructorId={instructorProfile?.id || 'usr-instructor-ahmet'} />
          )}

          {/* TAB 7: PROFILE */}
          {activeInstructorTab === 'profile' && (
            <div className="space-y-4">
              <Card className="p-6 border-border bg-card shadow-xs space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/15 text-3xl font-bold border border-amber-500/30">
                    👨‍🏫
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{instructorProfile?.displayName}</h3>
                    <p className="text-xs text-muted-foreground">{instructorProfile?.expertiseArea}</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="h-3 w-3" /> Doğrulanmış Akademi Eğitmeni
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30">
                    <span className="text-muted-foreground">Eğitim Düzeyi:</span>
                    <span className="font-semibold text-foreground">{instructorProfile?.educationLevel}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30">
                    <span className="text-muted-foreground">Gelir Paylaşım Oranı:</span>
                    <span className="font-bold text-emerald-500">%{instructorProfile?.revenueSharePercent || 70} Eğitmen Payı</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 space-y-1">
                    <span className="text-muted-foreground block font-semibold">Biyografi:</span>
                    <p className="text-foreground leading-relaxed">{instructorProfile?.bio}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Modals */}
        <CourseDraftBuilder
          isOpen={isBuilderOpen}
          onClose={() => {
            setIsBuilderOpen(false);
            setEditingDraft(null);
          }}
          initialDraft={editingDraft}
        />

        <LiveSessionSchedulerModal
          isOpen={isLiveSchedulerOpen}
          onClose={() => setIsLiveSchedulerOpen(false)}
          courseDrafts={courseDrafts}
        />

        <ExamCreateModal
          isOpen={isExamCreateOpen}
          onClose={() => setIsExamCreateOpen(false)}
          courseDrafts={courseDrafts}
        />

        <InstructorExamResultsModal
          isOpen={Boolean(viewingExamResults)}
          onClose={() => setViewingExamResults(null)}
          exam={viewingExamResults}
          instructorId={instructorProfile?.id || 'usr-instructor-ahmet'}
        />

        {/* Live session Cancel confirmation modal */}
        <AnimatePresence>
          {cancellingSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-destructive font-bold text-sm">Canlı Dersi İptal Et</span>
                  <button onClick={() => setCancellingSession(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-foreground">
                  &ldquo;{cancellingSession.title}&rdquo; dersini iptal ettiğinizde kayıtlı öğrencilere 50 kredi otomatik iade edilir.
                </p>
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="ghost" size="sm" onClick={() => setCancellingSession(null)} className="text-xs">Vazgeç</Button>
                  <Button variant="destructive" size="sm" onClick={handleConfirmCancelSession} disabled={isCancelling} className="text-xs font-bold">
                    {isCancelling ? 'İptal Ediliyor...' : 'İptal Et & İade Yap'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. STATE: INSTRUCTOR APPLICANT (APPLICATION UNDER REVIEW - NO TOOLS OPEN)
  // ---------------------------------------------------------------------------
  if (role === 'instructor_applicant') {
    return (
      <div className="flex flex-col h-full bg-background select-none">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/70 bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBackToHub}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 text-lg">
              ⏳
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">Başvuru Durumu</h1>
              <p className="text-xs text-muted-foreground">Eğitmenlik başvurunuz değerlendirme aşamasında</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-xl mx-auto w-full">
          <Card className="p-5 border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 font-bold text-2xl">
                📋
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Başvurunuz İnceleniyor</h3>
                <p className="text-xs text-muted-foreground">
                  Gönderim Tarihi: {instructorApplication?.submittedAt ? new Date(instructorApplication.submittedAt).toLocaleDateString('tr-TR') : 'Bugün'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40">
                <span className="text-muted-foreground">Başvuru Sahibi:</span>
                <span className="font-bold text-foreground">{instructorApplication?.fullName || 'Ad Soyad'}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40">
                <span className="text-muted-foreground">Uzmanlık Alanı:</span>
                <span className="font-bold text-foreground">{instructorApplication?.expertiseArea || 'Uzmanlık'}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <span className="font-bold text-muted-foreground block">Değerlendirme Adımları:</span>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> <span>Başvuru formu eksiksiz teslim edildi</span>
              </div>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" /> <span>Pedagojik ve konu uzmanlığı ön incelemesi</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4" /> <span>Eğitmen yetkilendirme ve stüdyo erişimi onayı</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. STATE: LEARNER (APPLICATION FORM VIEW)
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col h-full bg-background select-none">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/70 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToHub}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 text-lg">
            🎓
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">Eğitmenlik Başvurusu</h1>
            <p className="text-xs text-muted-foreground">Bilgi birikiminizi paylaşın ve eğitimler verin</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-xl mx-auto w-full">
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-800 dark:text-amber-300">
          <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0" />
          <span className="leading-snug font-medium">
            Eğitmenlik başvuruları eğitim komisyonu tarafından incelenir. Onaylanan eğitmenler %70 gelir paylaşımı ile kurs, canlı ders ve sınav açabilir.
          </span>
        </div>

        <form onSubmit={handleApplySubmit}>
          <Card className="p-5 border-border bg-card shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Adınız Soyadınız *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Örn: Dr. Ahmet Yılmaz"
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Uzmanlık Alanı *</label>
                <input
                  type="text"
                  required
                  value={expertiseArea}
                  onChange={(e) => setExpertiseArea(e.target.value)}
                  placeholder="Örn: Yapay Zeka, Matematik"
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Eğitim Düzeyi</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value as any)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="high_school">Lise</option>
                  <option value="bachelor">Lisans / Üniversite</option>
                  <option value="master">Yüksek Lisans</option>
                  <option value="doctorate">Doktora</option>
                  <option value="certified_expert">Sertifikalı Alan Uzmanı</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Kısa Eğitmen Biyografisi *</label>
              <textarea
                required
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Eğitim geçmişiniz ve tecrübeleriniz..."
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-2">Ders Vermek İstediğiniz Kategoriler</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORY_CHOICES.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      onClick={() => handleToggleCategory(cat)}
                      className={cn(
                        'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all',
                        isChecked
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <input type="checkbox" checked={isChecked} onChange={() => {}} className="rounded border-border text-primary focus:ring-0" />
                      <span>{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !fullName.trim() || !expertiseArea.trim() || !bio.trim()}
                className="w-full h-11 text-xs font-bold shadow-xs"
              >
                {isSubmitting ? 'Başvuru İletiliyor...' : 'Eğitmenlik Başvurusunu Gönder'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
