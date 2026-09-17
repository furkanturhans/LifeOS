'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  Clock,
  Film,
  BookOpen,
  KeyRound,
  LogOut,
  RotateCcw,
  Check,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Sliders,
  Volume2,
  VolumeX,
  Sparkles,
  Headphones,
  Play,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useKidsStore } from '@/stores/useKidsStore';
import { kidsSpeech } from '@/services/kidsSpeechService';
import type { KidsAgeFilter, KidsStudySubject, KidsVoicePersona, KidsSpeechSpeed } from '@/types/kids';
import { cn } from '@/lib/utils';

interface ParentDashboardViewProps {
  onBackToKids: () => void;
}

export function ParentDashboardView({ onBackToKids }: ParentDashboardViewProps) {
  const router = useRouter();
  const {
    isKidsModeActive,
    setKidsModeActive,
    dailyTimeLimitMinutes,
    setDailyTimeLimit,
    todayUsageMinutes,
    movieAgeFilter,
    setMovieAgeFilter,
    allowedSubjects,
    toggleSubjectPermission,
    voiceSettings,
    updateVoiceSettings,
    isSpeaking,
    setIsSpeaking,
    changePin,
    lockParent,
    resetKidsSettings,
  } = useKidsStore();

  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAzureConfigured, setIsAzureConfigured] = useState<boolean | null>(null);
  const [previewNotice, setPreviewNotice] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  useEffect(() => {
    let mounted = true;
    kidsSpeech.checkConfiguration().then((configured) => {
      if (mounted) {
        setIsAzureConfigured(configured);
      }
    });

    return () => {
      mounted = false;
      kidsSpeech.stop();
      setIsSpeaking(false);
    };
  }, [setIsSpeaking]);

  const handleExitKidsToLifeOS = () => {
    kidsSpeech.stop();
    setKidsModeActive(false);
    lockParent();
    router.push('/');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = changePin(oldPin, newPin);
    if (res.success) {
      setPinChangeMsg({ type: 'success', text: 'PIN kodunuz başarıyla güncellendi.' });
      setOldPin('');
      setNewPin('');
    } else {
      setPinChangeMsg({ type: 'error', text: res.error || 'PIN değiştirilemedi.' });
    }
  };

  const handlePreviewVoice = () => {
    if (isPreviewPlaying) {
      kidsSpeech.stop();
      setIsPreviewPlaying(false);
      setIsSpeaking(false);
      return;
    }

    if (!isAzureConfigured) {
      setPreviewNotice('Sesli anlatımı etkinleştirmek için anlatıcı servisi yapılandırılmalıdır.');
      return;
    }

    setPreviewNotice(null);
    setIsPreviewPlaying(true);
    setIsSpeaking(true);

    kidsSpeech.preview(voiceSettings, {
      onStart: () => {
        setIsPreviewPlaying(true);
        setIsSpeaking(true);
      },
      onEnd: () => {
        setIsPreviewPlaying(false);
        setIsSpeaking(false);
      },
      onUnavailable: (msg) => {
        setIsPreviewPlaying(false);
        setIsSpeaking(false);
        setPreviewNotice(msg || 'Sesli anlatımı etkinleştirmek için anlatıcı servisi yapılandırılmalıdır.');
      },
      onError: () => {
        setIsPreviewPlaying(false);
        setIsSpeaking(false);
        setPreviewNotice('Ses çalma sırasında bir sorun oluştu.');
      },
    });
  };

  const SUBJECT_LIST: { id: KidsStudySubject; label: string; icon: string }[] = [
    { id: 'letters', label: 'Harfler & Alfabe', icon: '🔤' },
    { id: 'numbers', label: 'Sayılar & Matematik', icon: '🔢' },
    { id: 'science', label: 'Bilim & Keşif', icon: '🔬' },
    { id: 'nature', label: 'Doğa & Hayvanlar', icon: '🌿' },
    { id: 'shapes', label: 'Renkler & Şekiller', icon: '🎨' },
  ];

  const AZURE_VOICE_OPTIONS = [
    {
      id: 'tr-TR-Elif:MAI-Voice-2',
      label: 'Elif (MAI-Voice-2) • Varsayılan Öncelikli',
      desc: 'Çocuklara özel, sıcak, doğal ve sakin Türkçe kadın anlatıcı sesi.',
      icon: '🌸',
    },
    {
      id: 'tr-TR-EmelNeural',
      label: 'Emel (Neural) • Doğal Kadın Anlatıcı',
      desc: 'Yumuşak, şefkatli ve akıcı Türkçe masal ve ders anlatıcısı.',
      icon: '🌟',
    },
  ];

  const currentVoiceId = voiceSettings.selectedVoiceURI || 'tr-TR-Elif:MAI-Voice-2';

  return (
    <div className="flex flex-col h-full bg-background select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/70 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToKids}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
            aria-label="Kids Hub'a Dön"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-primary/10 text-primary shadow-xs text-lg">
            🛡️
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Ebeveyn Denetim Masası
              </h1>
              <StatusBadge status="verified" label="Korumalı Alan" size="sm" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Kids modu, sesli anlatım, ekran süresi ve içerik izinleri
            </p>
          </div>
        </div>

        {/* Exit to OS Homescreen */}
        <Button
          variant="destructive"
          size="sm"
          onClick={handleExitKidsToLifeOS}
          className="font-bold text-xs h-8 px-3 shadow-xs"
        >
          <LogOut className="h-3.5 w-3.5 mr-1" />
          LifeOS&apos;a Dön
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-w-2xl mx-auto w-full pb-12">
        {/* Active Protection Card */}
        <Card className="p-4 border-emerald-500/30 bg-emerald-500/10 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                🔒
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Kids Kilidi Aktif
                </h3>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                  Çocuğunuz bu alandayken ana ekrana, finansal servislere veya ayarlara erişemez.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 🔊 SESLİ ANLATIM AYARLARI (AZURE SPEECH TURKISH FEMALE) */}
        <Card className="p-4 border-border bg-card shadow-2xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-purple-500" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">Sesli Anlatım ve Anlatıcı Sesi</h3>
                  <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    🌸 Azure Türkçe Kadın Sesi
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Sıcak, sakin ve güven veren kadın anlatıcı (Eski robotik/erkek sesler tamamen devre dışıdır)
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant={isPreviewPlaying ? 'destructive' : 'primary'}
              onClick={handlePreviewVoice}
              disabled={isAzureConfigured === false}
              className="h-8 px-3 text-xs font-bold shadow-xs bg-purple-600 hover:bg-purple-700 text-white border-none shrink-0 disabled:opacity-50"
            >
              {isPreviewPlaying ? (
                <>
                  <Square className="h-3 w-3 mr-1" /> Durdur
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" /> Sesi Dinle
                </>
              )}
            </Button>
          </div>

          {/* Servis Yapılandırılmamışsa Bilgilendirme */}
          {isAzureConfigured === false && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-medium space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-100">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Anlatıcı Servisi Bilgilendirmesi</span>
              </div>
              <p className="leading-relaxed">
                Sesli anlatımı etkinleştirmek için anlatıcı servisi yapılandırılmalıdır.
              </p>
            </div>
          )}

          {previewNotice && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
              <span>{previewNotice}</span>
            </div>
          )}

          {/* Master Switch: Sesli Anlatıcı Açık / Kapalı */}
          <div className="pt-1">
            <div
              onClick={() =>
                updateVoiceSettings({
                  isVoiceEnabled: voiceSettings.isVoiceEnabled !== false ? false : true,
                })
              }
              className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
            >
              <div className="min-w-0 pr-2">
                <span className="text-xs font-bold text-foreground block">
                  Sesli Anlatıcı: {voiceSettings.isVoiceEnabled !== false ? 'Açık' : 'Kapalı'}
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Tüm ders, masal ve oyun yönlendirmelerinde kadın sesli anlatımı açar veya kapatır.
                </span>
              </div>
              <div
                className={cn(
                  'h-6 w-11 rounded-full transition-colors flex items-center p-0.5 shrink-0',
                  voiceSettings.isVoiceEnabled !== false ? 'bg-purple-600 justify-end' : 'bg-muted-foreground/30 justify-start'
                )}
              >
                <div className="h-5 w-5 rounded-full bg-white shadow-xs" />
              </div>
            </div>
          </div>

          {/* Kadın Anlatıcı Sesi Seçimi (Elif / Emel) */}
          <div className="space-y-2 pt-1 border-t border-border/40">
            <label className="block text-xs font-bold text-foreground">
              Kadın Anlatıcı Ses Modeli
            </label>
            <div className="space-y-2">
              {AZURE_VOICE_OPTIONS.map((v) => {
                const isSelected = currentVoiceId === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => updateVoiceSettings({ selectedVoiceURI: v.id })}
                    className={cn(
                      'p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3',
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10 shadow-xs'
                        : 'border-border bg-muted/20 hover:border-purple-300'
                    )}
                  >
                    <span className="text-2xl mt-0.5">{v.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{v.label}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                            Seçili
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{v.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Konuşma Hızı: Yavaş (0.75x) / Normal (0.85x) */}
          <div className="space-y-2 pt-1 border-t border-border/40">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-foreground">
                Ses Hızı
              </label>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Çocukların rahat anlaması için hafif yavaşlatılmış tempo
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'slow', label: 'Yavaş (0.75x)' },
                { id: 'normal', label: 'Normal (0.85x)' },
              ].map((s) => {
                const isSelected = (voiceSettings.speed || 'normal') === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => updateVoiceSettings({ speed: s.id as KidsSpeechSpeed })}
                    className={cn(
                      'py-2.5 rounded-xl text-xs font-bold border transition-all text-center',
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ses Seviyesi: Düşük / Orta / Yüksek */}
          <div className="space-y-2 pt-1 border-t border-border/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Ses Seviyesi</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                %{Math.round((voiceSettings.volume ?? 0.85) * 100)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 0.6, label: 'Düşük (%60)' },
                { val: 0.85, label: 'Orta (%85)' },
                { val: 1.0, label: 'Yüksek (%100)' },
              ].map((vol) => (
                <button
                  key={vol.val}
                  type="button"
                  onClick={() => updateVoiceSettings({ volume: vol.val })}
                  className={cn(
                    'py-2 rounded-xl text-xs font-bold border transition-all text-center',
                    Math.abs((voiceSettings.volume ?? 0.85) - vol.val) < 0.05
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
                  )}
                >
                  {vol.label}
                </button>
              ))}
            </div>
          </div>

          {/* Otomatik Okuma İzinleri */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <div
              onClick={() =>
                updateVoiceSettings({
                  storyNarrationEnabled: !voiceSettings.storyNarrationEnabled,
                })
              }
              className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
            >
              <div className="min-w-0 pr-2">
                <span className="text-xs font-bold text-foreground block">
                  Hikâyelerde Sesli Anlatım
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Masal sayfalarını kadın anlatıcıyla otomatik veya dokunarak okur.
                </span>
              </div>
              <div
                className={cn(
                  'h-6 w-11 rounded-full transition-colors flex items-center p-0.5 shrink-0',
                  voiceSettings.storyNarrationEnabled ? 'bg-purple-600 justify-end' : 'bg-muted-foreground/30 justify-start'
                )}
              >
                <div className="h-5 w-5 rounded-full bg-white shadow-xs" />
              </div>
            </div>

            <div
              onClick={() =>
                updateVoiceSettings({
                  autoStudyAudioEnabled: !voiceSettings.autoStudyAudioEnabled,
                })
              }
              className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
            >
              <div className="min-w-0 pr-2">
                <span className="text-xs font-bold text-foreground block">
                  Derslerde Sesli Telaffuz
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Harf, sayı ve kelime kartları kadın ses tonuyla seslendirilir.
                </span>
              </div>
              <div
                className={cn(
                  'h-6 w-11 rounded-full transition-colors flex items-center p-0.5 shrink-0',
                  voiceSettings.autoStudyAudioEnabled ? 'bg-purple-600 justify-end' : 'bg-muted-foreground/30 justify-start'
                )}
              >
                <div className="h-5 w-5 rounded-full bg-white shadow-xs" />
              </div>
            </div>
          </div>

          {/* Güvenli Ses Koruma Bilgisi */}
          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block">Sıfır Erkek Ses Güvencesi:</strong>
              Cihazda veya tarayıcıda onaylı Türkçe kadın sesi bulunamazsa sistem asla erkek veya yabancı aksanlı sese geçiş yapmaz; çocukları korumak amacıyla sesli anlatım sessizce duraklatılır ve içerik ekranda yazılı olarak sunulur.
            </div>
          </div>
        </Card>

        {/* 1. Daily Time Limit */}
        <Card className="p-4 border-border bg-card shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-foreground">Günlük Ekran Süresi Sınırı</h3>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl">
              Bugün: {todayUsageMinutes} dk
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Süre dolduğunda çocuğunuza eğlenceli bir mola uyarısı gösterilir.
          </p>

          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {[
              { val: 30, label: '30 Dk' },
              { val: 45, label: '45 Dk' },
              { val: 60, label: '60 Dk' },
              { val: 90, label: '90 Dk' },
              { val: null, label: 'Sınırsız' },
            ].map((item) => {
              const isSelected = dailyTimeLimitMinutes === item.val;
              return (
                <button
                  key={String(item.val)}
                  onClick={() => setDailyTimeLimit(item.val)}
                  className={cn(
                    'py-2 rounded-xl text-xs font-bold border transition-all text-center',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* 2. Movie Age Filter */}
        <Card className="p-4 border-border bg-card shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-rose-500" />
            <h3 className="text-sm font-bold text-foreground">Kids Movie Yaş Filtresi</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Yalnızca seçilen yaş grubuna uygun çizgi film ve animasyonlar listelenir.
          </p>

          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'age_3_5', label: '3-5 Yaş' },
              { id: 'age_6_8', label: '6-8 Yaş' },
              { id: 'age_9_12', label: '9-12 Yaş' },
            ].map((f) => {
              const isSelected = movieAgeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setMovieAgeFilter(f.id as KidsAgeFilter)}
                  className={cn(
                    'py-2 rounded-xl text-xs font-bold border transition-all text-center',
                    isSelected
                      ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                      : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* 3. Study Subject Permissions */}
        <Card className="p-4 border-border bg-card shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-bold text-foreground">Kids Study Konu İzinleri</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Çocuğunuzun çalışma ekranında görmek istediğiniz ders konularını açın veya kapatın.
          </p>

          <div className="space-y-2 pt-1">
            {SUBJECT_LIST.map((subject) => {
              const isAllowed = allowedSubjects.includes(subject.id);
              return (
                <div
                  key={subject.id}
                  onClick={() => toggleSubjectPermission(subject.id)}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all',
                    isAllowed
                      ? 'bg-blue-500/5 border-blue-500/30'
                      : 'bg-muted/30 border-border opacity-60'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{subject.icon}</span>
                    <span className="text-xs font-bold text-foreground">{subject.label}</span>
                  </div>

                  <div
                    className={cn(
                      'h-6 w-6 rounded-lg flex items-center justify-center border text-xs font-bold transition-all',
                      isAllowed
                        ? 'bg-blue-500 text-white border-blue-600'
                        : 'border-border bg-card text-muted-foreground'
                    )}
                  >
                    {isAllowed ? <Check className="h-3.5 w-3.5" /> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 4. Change Parent PIN */}
        <Card className="p-4 border-border bg-card shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Ebeveyn PIN Kodunu Değiştir</h3>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Mevcut PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="2026"
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-bold text-center tracking-widest focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Yeni 4 Haneli PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="****"
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-bold text-center tracking-widest focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {pinChangeMsg && (
              <div
                className={cn(
                  'text-xs font-semibold p-2 rounded-xl border text-center',
                  pinChangeMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-destructive/10 border-destructive/20 text-destructive'
                )}
              >
                {pinChangeMsg.text}
              </div>
            )}

            <Button type="submit" variant="primary" size="sm" className="w-full font-bold text-xs h-9">
              PIN Güncelle
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
