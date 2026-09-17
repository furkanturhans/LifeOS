'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Video,
  Users,
  Coins,
  ShieldCheck,
  Calendar,
  Sparkles,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  History,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useEducationStore } from '@/stores/useEducationStore';
import type { LiveSession, BigBlueButtonJoinResult } from '@/types/education';
import { cn } from '@/lib/utils';

interface LiveSessionsViewProps {
  onBackToHub: () => void;
}

export function LiveSessionsView({ onBackToHub }: LiveSessionsViewProps) {
  const {
    liveSessions,
    registrations,
    creditBalance,
    creditLedger,
    enrollInLiveSession,
    joinLiveSession,
  } = useEducationStore();

  const [activeTab, setActiveTab] = useState<'all' | 'my_registered'>('all');
  const [selectedSessionForEnroll, setSelectedSessionForEnroll] = useState<LiveSession | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

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

  // Ledger History Modal
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  // Handle Enrollment
  async function handleConfirmEnroll() {
    if (!selectedSessionForEnroll) return;
    setIsEnrolling(true);
    setEnrollError(null);
    setEnrollSuccess(null);

    const res = await enrollInLiveSession(selectedSessionForEnroll.id);
    setIsEnrolling(false);

    if (res.success) {
      setEnrollSuccess(res.message || 'Canlı derse başarıyla kaydoldunuz!');
      setTimeout(() => {
        setSelectedSessionForEnroll(null);
        setEnrollSuccess(null);
      }, 1400);
    } else {
      setEnrollError(res.message || 'Kayıt işlemi gerçekleştirilemedi.');
    }
  }

  // Handle BBB Launch
  async function handleLaunchBBB(session: LiveSession) {
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

  const registeredSessionIds = new Set(
    registrations.filter((r) => r.status === 'confirmed').map((r) => r.sessionId)
  );

  const myRegisteredSessions = liveSessions.filter((s) => registeredSessionIds.has(s.id));

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

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-xs text-lg">
            🎥
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Canlı Dersler
              </h1>
              <StatusBadge status="active" label="BigBlueButton Hazır" size="sm" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Birebir ve grup canlı eğitim oturumları
            </p>
          </div>
        </div>

        {/* Credit Balance Badge & Ledger Trigger */}
        <button
          onClick={() => setIsLedgerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all active:scale-95 text-xs font-bold shadow-xs"
        >
          <Coins className="h-4 w-4 text-rose-500" />
          <span>{creditBalance} Kredi</span>
          <History className="h-3.5 w-3.5 text-muted-foreground ml-0.5 opacity-80" />
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/20 text-xs font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'px-3 py-1.5 rounded-xl transition-all',
            activeTab === 'all'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          )}
        >
          Tüm Canlı Dersler ({liveSessions.filter((s) => s.status !== 'cancelled').length})
        </button>
        <button
          onClick={() => setActiveTab('my_registered')}
          className={cn(
            'px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5',
            activeTab === 'my_registered'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          )}
        >
          <span>Kayıtlı Derslerim</span>
          {myRegisteredSessions.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white">
              {myRegisteredSessions.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-3xl mx-auto w-full">
        {/* Rules Card */}
        <Card className="p-4 border-border bg-gradient-to-br from-rose-500/10 via-card to-card shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500 font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">
                Canlı Ders Katılım ve Kontenjan Modeli
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                Yüksek etkileşim kalitesi için her canlı ders maksimum 70 katılımcı ile sınırlandırılır.
              </p>

              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl border border-border bg-card p-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-rose-500 mb-0.5">
                    <Coins className="h-4 w-4" />
                    <span>50 Kredi</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Standart katılım bedeli
                  </span>
                </div>

                <div className="rounded-xl border border-border bg-card p-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-blue-500 mb-0.5">
                    <Users className="h-4 w-4" />
                    <span>Maks 70 Kişi</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Kesin sınıf kontenjan sınırı
                  </span>
                </div>

                <div className="rounded-xl border border-border bg-card p-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-500 mb-0.5">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Otomatik İade</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    İptal durumunda tam kredi iadesi
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* TAB 1: ALL SESSIONS */}
        {activeTab === 'all' && (
          <div className="space-y-3">
            <div className="px-1 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Planlanan Canlı Dersler
              </h2>
            </div>

            {liveSessions.length > 0 ? (
              liveSessions.map((session) => {
                const isRegistered = registeredSessionIds.has(session.id);
                const isCancelled = session.status === 'cancelled';
                const isCompleted = session.status === 'completed';
                const isLive = session.status === 'live';
                const isFull = session.currentParticipantCount >= session.maxParticipants;
                const progressPercent = Math.min(
                  100,
                  Math.round((session.currentParticipantCount / session.maxParticipants) * 100)
                );

                return (
                  <Card
                    key={session.id}
                    className={cn(
                      'p-4 border-border bg-card shadow-2xs space-y-3 transition-all',
                      isCancelled && 'opacity-60 bg-muted/30',
                      isLive && 'border-rose-500/40 bg-rose-500/5'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl',
                          isLive ? 'border-rose-500/30 bg-rose-500/15 animate-pulse' : 'border-border bg-muted/60'
                        )}>
                          {session.instructorAvatar || '👨‍🏫'}
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
                            ) : isRegistered ? (
                              <StatusBadge status="active" label="Kayıtlısınız (Planlandı)" size="sm" />
                            ) : isFull ? (
                              <StatusBadge status="pending" label="Kontenjan Dolu" size="sm" />
                            ) : (
                              <StatusBadge status="open" label="Kayıt Açık" size="sm" />
                            )}
                          </div>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Eğitmen: <strong className="text-foreground">{session.instructorName}</strong>
                            {session.courseTitle && ` • ${session.courseTitle}`}
                          </p>
                          {session.description && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {session.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-1 text-xs font-bold text-rose-500">
                          <Coins className="h-4 w-4" />
                          <span>{session.creditsRequired || 50} Kredi</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Spot Progress */}
                    <div className="pt-2 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {new Date(session.scheduledAt).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{session.durationMinutes} Dk</span>
                        </div>
                      </div>

                      {/* Participant Capacity Progress (Shows Registered Counts) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" /> Kayıtlı Kontenjan:
                          </span>
                          <span className="font-bold text-foreground">
                            {session.currentParticipantCount} / {session.maxParticipants} Öğrenci
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              progressPercent >= 100
                                ? 'bg-destructive'
                                : progressPercent > 75
                                ? 'bg-amber-500'
                                : 'bg-primary'
                            )}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 flex items-center justify-end gap-2">
                      {isCancelled ? (
                        <span className="text-xs text-destructive font-medium">
                          Bu oturum iptal edildi. Ödenen krediler iade edildi.
                        </span>
                      ) : isCompleted ? (
                        <span className="text-xs text-muted-foreground font-medium">
                          Bu canlı ders tamamlandı.
                        </span>
                      ) : isRegistered ? (
                        isLive ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleLaunchBBB(session)}
                            className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs animate-pulse"
                          >
                            <Video className="h-3.5 w-3.5 mr-1" />
                            Canlı Sınıfa Gir (BBB)
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLaunchBBB(session)}
                            className="h-8 text-xs font-semibold border-border text-foreground hover:bg-muted shadow-xs"
                          >
                            <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            Canlı Sınıf Hazırlanıyor
                          </Button>
                        )
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isFull}
                          onClick={() => {
                            setSelectedSessionForEnroll(session);
                            setEnrollError(null);
                            setEnrollSuccess(null);
                          }}
                          className="h-8 text-xs font-bold shadow-xs"
                        >
                          {isFull ? (
                            'Kontenjan Doldu'
                          ) : (
                            <>
                              <Coins className="h-3.5 w-3.5 mr-1" />
                              {session.creditsRequired || 50} Kredi ile Katıl
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="py-10 text-center text-xs text-muted-foreground">
                Planlanmış canlı ders bulunamadı.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY REGISTERED SESSIONS */}
        {activeTab === 'my_registered' && (
          <div className="space-y-3">
            <div className="px-1 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Kayıt Olduğum Canlı Dersler
              </h2>
            </div>

            {myRegisteredSessions.length > 0 ? (
              myRegisteredSessions.map((session) => {
                const isLive = session.status === 'live';
                return (
                  <Card key={session.id} className="p-4 border-border bg-card shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/60 text-2xl">
                          {session.instructorAvatar || '👨‍🏫'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-foreground truncate">
                              {session.title}
                            </h3>
                            {isLive ? (
                              <span className="inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white animate-pulse">
                                Canlı Yayında
                              </span>
                            ) : (
                              <StatusBadge status="completed" label="Kayıt Onaylandı" size="sm" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Eğitmen: <strong className="text-foreground">{session.instructorName}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          50 Kredi Ödendi
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(session.scheduledAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {isLive ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleLaunchBBB(session)}
                          className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs animate-pulse"
                        >
                          <Video className="h-3.5 w-3.5 mr-1" />
                          Canlı Sınıfa Gir (BBB)
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLaunchBBB(session)}
                          className="h-8 text-xs font-semibold border-border text-foreground hover:bg-muted shadow-xs"
                        >
                          <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          Canlı Sınıf Hazırlanıyor
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                <div className="text-3xl">🎒</div>
                <p className="font-semibold text-foreground">Henüz kayıt olduğunuz bir canlı ders yok.</p>
                <p>&ldquo;Tüm Canlı Dersler&rdquo; sekmesinden ilgilendiğiniz derslere kaydolabilirsiniz.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('all')}
                  className="mt-2 text-xs font-bold"
                >
                  Dersleri İncele
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ENROLLMENT CONFIRMATION MODAL */}
      <AnimatePresence>
        {selectedSessionForEnroll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-rose-500" />
                  <h3 className="text-sm font-bold text-foreground">
                    Canlı Derse Kayıt Onayı
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSessionForEnroll(null)}
                  className="h-7 w-7 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {enrollError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{enrollError}</span>
                </div>
              )}

              {enrollSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{enrollSuccess}</span>
                </div>
              )}

              <div className="space-y-2 text-xs">
                <p className="text-muted-foreground">
                  Aşağıdaki canlı eğitim oturumuna kaydolmak üzeresiniz:
                </p>
                <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-1">
                  <div className="font-bold text-foreground text-sm">
                    {selectedSessionForEnroll.title}
                  </div>
                  <div className="text-muted-foreground">
                    Eğitmen: {selectedSessionForEnroll.instructorName}
                  </div>
                  <div className="text-muted-foreground">
                    Tarih: {new Date(selectedSessionForEnroll.scheduledAt).toLocaleString('tr-TR')}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-between font-bold">
                  <span className="text-muted-foreground">Gerekli Kredi:</span>
                  <span className="text-rose-500 text-sm">
                    {selectedSessionForEnroll.creditsRequired || 50} Kredi
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border border-border bg-card flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Mevcut Bakiyeniz:</span>
                  <span className="font-bold text-foreground">{creditBalance} Kredi</span>
                </div>

                {creditBalance < (selectedSessionForEnroll.creditsRequired || 50) && (
                  <p className="text-destructive font-semibold text-[11px] pt-1">
                    Bakiyeniz yetersizdir. Canlı derse katılabilmek için yeterli krediniz bulunmamaktadır.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSessionForEnroll(null)}
                  disabled={isEnrolling}
                  className="text-xs"
                >
                  Vazgeç
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmEnroll}
                  disabled={
                    isEnrolling ||
                    creditBalance < (selectedSessionForEnroll.creditsRequired || 50)
                  }
                  className="font-bold text-xs px-4 h-9 shadow-xs"
                >
                  {isEnrolling ? 'Kaydediliyor...' : '50 Kredi ile Kaydol'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BIGBLUEBUTTON JOIN MODAL (STUDENT FRIENDLY) */}
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
                  <div className="h-7 w-7 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center text-sm">
                    🎥
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    BigBlueButton Canlı Sınıf
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
                  <p>Canlı sınıf oturumu hazırlanıyor...</p>
                </div>
              ) : bbbModalData.result?.isConfigured && bbbModalData.result?.joinUrl && bbbModalData.session?.status === 'live' ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Canlı sınıf oturumu aktif ve yayında.</span>
                  </div>

                  <p className="text-muted-foreground">
                    Aşağıdaki butona tıklayarak BigBlueButton sınıf ortamına güvenli bağlantı ile katılabilirsiniz.
                  </p>

                  <a
                    href={bbbModalData.result.joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-xs hover:opacity-90 transition-all"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Sınıfa Şimdi Katıl
                  </a>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-foreground space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-rose-500">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span>Canlı Sınıf Bağlantısı Hazırlanıyor</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Ders saati geldiğinde ve eğitmen oturumu başlattığında canlı sınıf bağlantısı aktif olacaktır. Lütfen bekleyiniz.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/30 text-[11px] text-muted-foreground space-y-1">
                    <span className="font-bold text-foreground block">Oturum Bilgisi:</span>
                    <span>
                      Ders: {bbbModalData.session?.title} • Eğitmen: {bbbModalData.session?.instructorName}
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

      {/* LEDGER TRANSACTION HISTORY MODAL */}
      <AnimatePresence>
        {isLedgerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-5 flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-rose-500" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Kredi Hesap Özeti & İşlem Geçmişi
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Değiştirilemez kredi muhasebe kaydı
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLedgerOpen(false)}
                  className="h-7 w-7 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Current balance card */}
              <div className="my-3 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block">
                    Kullanılabilir Kredi Bakiyesi
                  </span>
                  <span className="text-xl font-extrabold text-rose-500">
                    {creditBalance} Kredi
                  </span>
                </div>
                <div className="text-right text-[11px] text-muted-foreground">
                  Toplam {creditLedger.length} İşlem
                </div>
              </div>

              {/* Transactions List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {creditLedger.map((entry) => {
                  const isPositive = entry.amount > 0;
                  return (
                    <div
                      key={entry.id}
                      className="p-3 rounded-xl border border-border bg-card flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-foreground truncate">
                          {entry.description}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' • '}
                          İşlem Sonrası Bakiye: <strong>{entry.balanceAfter} Kredi</strong>
                        </div>
                      </div>

                      <div
                        className={cn(
                          'font-extrabold text-sm shrink-0 pl-3',
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                        )}
                      >
                        {isPositive ? `+${entry.amount}` : entry.amount} Kredi
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLedgerOpen(false)}
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
