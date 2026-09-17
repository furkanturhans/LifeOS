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
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CourseDraftBuilder } from './CourseDraftBuilder';
import { LiveSessionSchedulerModal } from './LiveSessionSchedulerModal';
import { useEducationStore } from '@/stores/useEducationStore';
import type { CourseDraft, LiveSession, BigBlueButtonJoinResult } from '@/types/education';
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
    revertToLearnerDemo,
    courseDrafts,
    deleteCourseDraft,
    liveSessions,
    cancelLiveSession,
    startLiveSession,
    endLiveSession,
    joinLiveSession,
    liveClassHealth,
    checkLiveClassHealth,
  } = useEducationStore();

  useEffect(() => {
    checkLiveClassHealth();
  }, [checkLiveClassHealth]);

  // Application Form States
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

  // Builder Modal States
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<CourseDraft | null>(null);

  // Live Session Scheduler Modal
  const [isLiveSchedulerOpen, setIsLiveSchedulerOpen] = useState(false);

  // Cancellation Confirm Modal
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

  function handleToggleCategory(cat: string) {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  }

  async function handleApplySubmit(e: React.FormEvent) {
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
  }

  async function handleConfirmCancelSession() {
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
  }

  async function handleStartSession(session: LiveSession) {
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
  }

  async function handleEndSession(session: LiveSession) {
    await endLiveSession(session.id);
  }

  async function handleLaunchModeratorBBB(session: LiveSession) {
    setBbbModalData({
      isOpen: true,
      session,
      result: null,
      loading: true,
    });

    const result = await joinLiveSession(session.id);

    setBbbModalData((prev) => ({
      ...prev,
      result,
      loading: false,
    }));
  }

  // ---------------------------------------------------------------------------
  // 1. STATE: INSTRUCTOR VERIFIED (STUDIO VIEW)
  // ---------------------------------------------------------------------------
  if (role === 'instructor_verified') {
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

            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-amber-500/10 text-amber-500 shadow-xs text-lg">
              🎓
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold text-foreground">
                  Eğitmen Stüdyosu
                </h1>
                <StatusBadge status="verified" label="Doğrulanmış Eğitmen" size="sm" />
              </div>
              <p className="truncate text-xs text-muted-foreground">
                Kurs taslakları, canlı ders planları ve içerik yönetimi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLiveSchedulerOpen(true)}
              className="font-bold text-xs h-9 px-3 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 shadow-xs"
            >
              <Video className="h-3.5 w-3.5 mr-1 text-rose-500" />
              Canlı Ders Planla
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingDraft(null);
                setIsBuilderOpen(true);
              }}
              className="font-bold text-xs h-9 px-3.5 shadow-xs"
            >
              <Plus className="h-4 w-4 mr-1" />
              Yeni Kurs Taslağı
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-3xl mx-auto w-full">
          {/* BigBlueButton Server Health Status Banner for Instructors */}
          <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={cn(
                'h-3 w-3 rounded-full shrink-0',
                liveClassHealth?.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              )} />
              <div className="min-w-0">
                <div className="font-bold text-foreground truncate">
                  Canlı Sınıf Altyapısı: {liveClassHealth?.isConfigured ? 'BigBlueButton Aktif' : 'BigBlueButton Yapılandırılmadı'}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {liveClassHealth?.isConfigured
                    ? (liveClassHealth?.message || 'BigBlueButton sunucu bağlantısı aktif.')
                    : 'Sunucu ortam değişkenlerinde BBB_BASE_URL ve BBB_SECRET tanımlanmalıdır.'}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => checkLiveClassHealth()}
              className="text-[11px] h-7 px-2 font-semibold text-muted-foreground hover:text-foreground shrink-0"
            >
              Yenile
            </Button>
          </div>

          {/* Instructor Stats Card */}
          <Card className="p-4 border-border bg-gradient-to-br from-amber-500/10 via-card to-card shadow-2xs">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-2xl">
                  👨‍🏫
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate">
                    {instructorProfile?.displayName || 'Doğrulanmış Eğitmen'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Uzmanlık: {instructorProfile?.expertiseArea || 'Yazılım ve Teknoloji'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-muted-foreground block">Gelir Paylaşımı</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  %{instructorProfile?.revenueSharePercent || 70} Eğitmen Payı
                </span>
              </div>
            </div>
          </Card>

          {/* SECTION 1: LIVE SESSIONS MANAGEMENT */}
          <div className="space-y-3">
            <div className="px-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Canlı Ders Oturumlarım
                </h2>
                <span className="text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
                  Maks 70 Kişi / 50 Kredi
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiveSchedulerOpen(true)}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 h-7 px-2"
              >
                + Yeni Oturum
              </Button>
            </div>

            {liveSessions.length > 0 ? (
              liveSessions.map((session) => {
                const isCancelled = session.status === 'cancelled';
                const isCompleted = session.status === 'completed';
                const isLive = session.status === 'live';

                return (
                  <Card
                    key={session.id}
                    className={cn(
                      'p-4 border-border bg-card shadow-2xs space-y-3',
                      isCancelled && 'opacity-60 bg-muted/30',
                      isLive && 'border-rose-500/50 bg-rose-500/5'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg font-bold',
                          isLive
                            ? 'border-rose-500/30 bg-rose-500/20 text-rose-500 animate-pulse'
                            : 'border-rose-500/20 bg-rose-500/10 text-rose-500'
                        )}>
                          🎥
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-foreground truncate">
                              {session.title}
                            </h3>
                            {isCancelled ? (
                              <StatusBadge status="cancelled" label="İptal Edildi" size="sm" />
                            ) : isCompleted ? (
                              <StatusBadge status="completed" label="Tamamlandı" size="sm" />
                            ) : isLive ? (
                              <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full text-[11px] bg-rose-500 text-white animate-pulse">
                                <span className="h-2 w-2 rounded-full bg-white" />
                                Canlı Yayında
                              </span>
                            ) : !liveClassHealth?.isConfigured ? (
                              <StatusBadge status="pending" label="Altyapı Bekleniyor" size="sm" />
                            ) : (
                              <StatusBadge status="active" label="Planlandı" size="sm" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {session.description || 'Açıklama belirtilmemiş.'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-rose-500 block">
                          {session.creditsRequired || 50} Kredi
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Eğitmen: %70
                        </span>
                      </div>
                    </div>

                    {/* Meta row & actions */}
                    <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(session.scheduledAt).toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-foreground">
                          <Users className="h-3.5 w-3.5 text-blue-500" />
                          <span>{session.currentParticipantCount} / {session.maxParticipants} Kayıtlı</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isCancelled && !isCompleted && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCancellingSession(session)}
                              className="h-7 text-[11px] text-destructive hover:bg-destructive/10 border-destructive/30 font-semibold"
                            >
                              İptal & İade Et
                            </Button>

                            {isLive ? (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleLaunchModeratorBBB(session)}
                                  className="h-7 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                                >
                                  <Video className="h-3 w-3 mr-1" />
                                  Sınıfa Gir (BBB)
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEndSession(session)}
                                  className="h-7 text-[11px] font-bold text-foreground border-border hover:bg-muted"
                                >
                                  <Power className="h-3 w-3 mr-1 text-muted-foreground" />
                                  Dersi Bitir
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleStartSession(session)}
                                className="h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Dersi Başlat (BBB)
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                Henüz planlanmış canlı dersiniz yok.
              </div>
            )}
          </div>

          {/* SECTION 2: DRAFT COURSES */}
          <div className="space-y-3">
            <div className="px-1 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Kurs Taslaklarım ({courseDrafts.length})
              </h2>
            </div>

            {courseDrafts.length > 0 ? (
              courseDrafts.map((draft) => (
                <Card key={draft.id} className="p-4 border-border bg-card shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/60 text-2xl">
                        {draft.coverEmoji}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-foreground truncate">
                            {draft.title}
                          </h3>
                          <StatusBadge status="draft" label="Taslak Kurs" size="sm" />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {draft.description || 'Açıklama girilmemiş.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingDraft(draft);
                          setIsBuilderOpen(true);
                        }}
                        className="h-8 w-8 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Taslağı Düzenle"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCourseDraft(draft.id)}
                        className="h-8 w-8 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted"
                        title="Taslağı Sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Section / Lesson Summary */}
                  <div className="pt-2.5 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{draft.sections.length} Bölüm</span>
                      <span>•</span>
                      <span>
                        {draft.sections.reduce((acc, s) => acc + s.lessons.length, 0)} Ders İçeriği
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      Yayın Öncesi Taslak
                    </span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="py-10 text-center text-muted-foreground text-xs">
                Henüz bir kurs taslağınız yok. &ldquo;Yeni Kurs Taslağı&rdquo; butonuna tıklayarak ilk eğitiminizi hazırlayın.
              </div>
            )}
          </div>
        </div>

        {/* Course Draft Builder Modal */}
        <CourseDraftBuilder
          isOpen={isBuilderOpen}
          onClose={() => {
            setIsBuilderOpen(false);
            setEditingDraft(null);
          }}
          initialDraft={editingDraft}
        />

        {/* Live Session Scheduler Modal */}
        <LiveSessionSchedulerModal
          isOpen={isLiveSchedulerOpen}
          onClose={() => setIsLiveSchedulerOpen(false)}
          courseDrafts={courseDrafts}
        />

        {/* CANCEL SESSION CONFIRMATION MODAL (AUTO-REFUND) */}
        <AnimatePresence>
          {cancellingSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                    <AlertCircle className="h-5 w-5" />
                    <span>Canlı Dersi İptal Et</span>
                  </div>
                  <button
                    onClick={() => setCancellingSession(null)}
                    className="h-7 w-7 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {cancelMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{cancelMessage}</span>
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <p className="text-foreground font-semibold">
                    &ldquo;{cancellingSession.title}&rdquo; dersini iptal etmek üzeresiniz.
                  </p>

                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 space-y-1 text-[11px] leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-amber-500" />
                      Otomatik Kredi İade Garantisi:
                    </p>
                    <p>
                      Dersi iptal ettiğinizde, bu oturuma kayıt olmuş {cancellingSession.currentParticipantCount} öğrencinin ödediği 50 kredi hesaplarına anında ve kesintisiz iade edilecektir.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCancellingSession(null)}
                    disabled={isCancelling}
                    className="text-xs"
                  >
                    Vazgeç
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleConfirmCancelSession}
                    disabled={isCancelling}
                    className="font-bold text-xs px-4 h-9 shadow-xs"
                  >
                    {isCancelling ? 'İptal Ediliyor...' : 'İptal Et ve Kredileri İade Et'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* BBB MODERATOR LAUNCH MODAL (INSTRUCTOR SPECIFIC NOTICE) */}
        <AnimatePresence>
          {bbbModalData.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center text-sm">
                      🎓
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      Eğitmen Canlı Sınıfı (Moderator)
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      setBbbModalData({ isOpen: false, session: null, result: null, loading: false })
                    }
                    className="h-7 w-7 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {bbbModalData.loading ? (
                  <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                    <p>Yönetici oturumu başlatılıyor...</p>
                  </div>
                ) : bbbModalData.result?.isConfigured && bbbModalData.result?.joinUrl ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Eğitmen sınıf oturumu hazır.</span>
                    </div>

                    <a
                      href={bbbModalData.result.joinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-xs hover:opacity-90 transition-all"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Sınıfı Yönetici Olarak Başlat
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>BigBlueButton Yapılandırılmadı</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        {bbbModalData.result?.message ||
                          'Sunucu üzerinde BBB_BASE_URL ve BBB_SECRET ortam değişkenlerini tanımlayınız. Gerçek BigBlueButton sunucusu bağlandığında canlı ders bu alandan başlayacaktır.'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-border bg-muted/30 text-[11px] text-muted-foreground space-y-1">
                      <span className="font-bold text-foreground block">Gereksinim:</span>
                      <span>
                        <code>.env.local</code> içine <code>BBB_BASE_URL</code> ve <code>BBB_SECRET</code> ekleyiniz.
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setBbbModalData({ isOpen: false, session: null, result: null, loading: false })
                    }
                    className="text-xs font-semibold"
                  >
                    Kapat
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
  // 2. STATE: INSTRUCTOR APPLICANT (PENDING REVIEW)
  // ---------------------------------------------------------------------------
  if (role === 'instructor_applicant') {
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

            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-amber-500/10 text-amber-500 shadow-xs text-lg">
              ⏳
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold text-foreground">
                  Başvuru Durumu
                </h1>
                <StatusBadge status="pending" label="İnceleniyor" size="sm" />
              </div>
              <p className="truncate text-xs text-muted-foreground">
                Eğitmenlik başvurunuz değerlendirme aşamasında
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-xl mx-auto w-full">
          <Card className="p-5 border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 font-bold text-2xl">
                📋
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Başvurunuz Alındı ve İnceleniyor
                </h3>
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
              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40">
                <span className="text-muted-foreground">Kategoriler:</span>
                <span className="font-bold text-foreground">{instructorApplication?.teachingCategories?.join(', ') || 'Genel'}</span>
              </div>
            </div>

            {/* Checklist */}
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

            {/* Demo Verification Helper */}
            <div className="pt-3 border-t border-border flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={verifyInstructorDemo}
                className="text-xs font-bold"
              >
                <UserCheck className="h-3.5 w-3.5 mr-1" />
                Başvuruyu Onayla & Stüdyoyu Aç (Test Modu)
              </Button>
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

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-amber-500/10 text-amber-500 shadow-xs text-lg">
            🎓
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Eğitmenlik Başvurusu
              </h1>
              <StatusBadge status="active" label="Akademi Kaydı" size="sm" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Bilgi birikiminizi paylaşın ve eğitimler verin
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Form */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-xl mx-auto w-full">
        {/* Policy Notice */}
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-800 dark:text-amber-300">
          <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0" />
          <span className="leading-snug font-medium">
            Eğitmenlik başvuruları bağımsız eğitim komisyonu tarafından incelenir. Diğer hizmet sağlayıcı hesaplarından tamamen ayrıdır.
          </span>
        </div>

        <form onSubmit={handleApplySubmit}>
          <Card className="p-5 border-border bg-card shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Adınız Soyadınız *
              </label>
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
                <label className="block text-xs font-bold text-foreground mb-1">
                  Uzmanlık Alanı *
                </label>
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
                <label className="block text-xs font-bold text-foreground mb-1">
                  Eğitim Düzeyi
                </label>
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
              <label className="block text-xs font-bold text-foreground mb-1">
                Kısa Eğitmen Biyografisi *
              </label>
              <textarea
                required
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Eğitim geçmişiniz, tecrübeleriniz ve öğretmek istediğiniz konular..."
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>

            {/* Teaching Categories */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">
                Ders Vermek İstediğiniz Kategoriler
              </label>
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
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-border text-primary focus:ring-0"
                      />
                      <span>{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
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
