'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Film,
  Play,
  Pause,
  Clock,
  ShieldCheck,
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize,
  Minimize,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useKidsStore } from '@/stores/useKidsStore';
import type { KidsMovieItem, KidsAgeFilter } from '@/types/kids';
import { cn } from '@/lib/utils';

// Only verified, open-source, licensed content
export const KIDS_MOVIES_CATALOG: KidsMovieItem[] = [
  {
    id: 'big_buck_bunny',
    title: 'Big Buck Bunny',
    category: 'Animasyon',
    ageFilter: 'age_6_8',
    ageRange: '7+ Yaş',
    durationMinutes: 10,
    thumbnailEmoji: '🐰',
    description: 'Ormanda yaşayan sevimli tavşanın eğlenceli kısa macerası.',
    tags: ['Orman', 'Tavşan', 'Macera', 'Açık Kaynak'],
    videoUrl: 'https://download.blender.org/demo/movies/BBB/bbb_sunflower_1080p_30fps_normal.mp4',
    creator: 'Blender Foundation',
    license: 'Creative Commons Attribution 3.0',
    sourceUrl: 'https://peach.blender.org/',
    attributionText: 'Big Buck Bunny — Blender Foundation — CC BY 3.0',
    isPublished: true,
  },
];

export function KidsMovieView({ onBackToKids }: { onBackToKids: () => void }) {
  const {
    movieAgeFilter,
    watchProgress,
    saveWatchProgress,
    getWatchProgress,
    dailyTimeLimitMinutes,
    todayUsageMinutes,
  } = useKidsStore();

  const [selectedAge, setSelectedAge] = useState<KidsAgeFilter>(movieAgeFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMovie, setActiveMovie] = useState<KidsMovieItem | null>(null);

  // Video Player States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedTime, setSavedTime] = useState(0);

  const filteredMovies = useMemo(() => {
    return KIDS_MOVIES_CATALOG.filter((m) => {
      if (!m.isPublished) return false;
      const matchAge = selectedAge === 'all' || m.ageFilter === selectedAge;
      const matchSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchAge && matchSearch;
    });
  }, [selectedAge, searchQuery]);

  // Open movie & check resume point
  const handleOpenMovie = (movie: KidsMovieItem) => {
    setActiveMovie(movie);
    setIsBuffering(true);
    setHasError(false);
    setErrorMessage('');
    setIsCompleted(false);

    const progress = getWatchProgress(movie.id);
    if (progress && progress.currentTime > 10 && !progress.completed) {
      setSavedTime(progress.currentTime);
      setShowResumePrompt(true);
    } else {
      setShowResumePrompt(false);
      setSavedTime(0);
    }
  };

  const handleClosePlayer = () => {
    if (activeMovie && videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 600;
      saveWatchProgress(activeMovie.id, current, dur, isCompleted);
    }
    setActiveMovie(null);
    setIsPlaying(false);
    setIsBuffering(false);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // Save progress periodically
    if (activeMovie && Math.floor(current) % 5 === 0) {
      saveWatchProgress(
        activeMovie.id,
        current,
        videoRef.current.duration || 600,
        false
      );
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 600);
    setIsBuffering(false);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setIsCompleted(true);
    if (activeMovie) {
      saveWatchProgress(activeMovie.id, duration, duration, true);
    }
  };

  const handleVideoError = () => {
    setIsBuffering(false);
    setHasError(true);
    setErrorMessage(
      'Video kaynağına şu anda ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.'
    );
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setHasError(true);
          setErrorMessage('Video oynatılamadı. Lütfen tekrar deneyin.');
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleRewind10 = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const handleForward10 = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
    }
  };

  const handleResumeClick = () => {
    if (videoRef.current && savedTime > 0) {
      videoRef.current.currentTime = savedTime;
      setCurrentTime(savedTime);
    }
    setShowResumePrompt(false);
    togglePlay();
  };

  const handleStartOverClick = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
    setShowResumePrompt(false);
    togglePlay();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-rose-500/10 text-rose-500 shadow-xs text-lg">
            🎬
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Kids Movie (Animasyon)
              </h1>
              <StatusBadge status="verified" label="Telifli & Güvenli Video" size="sm" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Reklamsız, harici bağlantısız ve güvenli çizgi film alanı
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-4 py-2.5 border-b border-border/60 bg-muted/20 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Animasyon ara..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Tüm Yaşlar' },
            { id: 'age_3_5', label: '3-5 Yaş' },
            { id: 'age_6_8', label: '6-8 Yaş (7+)' },
            { id: 'age_9_12', label: '9-12 Yaş' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedAge(tab.id as KidsAgeFilter)}
              className={cn(
                'px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                selectedAge === tab.id
                  ? 'bg-rose-500 text-white shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Catalog */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full">
        {/* Child Safety & Legal Attribution Assurance */}
        <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
          <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Doğrulanmış Açık Kaynak İçerik</span>
            <span className="text-[11px] opacity-90 block mt-0.5">
              Tüm videolar Creative Commons lisanslıdır. Reklam, harici öneri veya yorum içermez.
            </span>
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="space-y-3">
          {filteredMovies.map((movie) => {
            const progress = getWatchProgress(movie.id);
            const progressPercent =
              progress && progress.duration > 0
                ? Math.round((progress.currentTime / progress.duration) * 100)
                : 0;

            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-4 border-border bg-card hover:border-rose-500/40 transition-all shadow-2xs group">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-4xl shadow-xs group-hover:scale-105 transition-transform">
                        {movie.thumbnailEmoji}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-foreground group-hover:text-rose-500 transition-colors">
                            {movie.title}
                          </h3>
                          <span className="rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 text-[10px] font-bold">
                            {movie.ageRange}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            • {movie.durationMinutes} Dakika
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {movie.description}
                        </p>

                        {/* Mandatory Attribution Link */}
                        <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                          <span>Kaynak:</span>
                          <a
                            href={movie.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-0.5"
                          >
                            {movie.attributionText}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>

                        {/* Resume Progress Bar */}
                        {progress && progressPercent > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                style={{ width: `${progressPercent}%` }}
                                className="h-full bg-rose-500 rounded-full"
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              %{progressPercent} İzlendi
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenMovie(movie)}
                      className="w-full sm:w-auto font-bold text-xs h-10 px-5 bg-rose-500 hover:bg-rose-600 border-none text-white shadow-xs shrink-0"
                    >
                      <Play className="h-4 w-4 mr-1.5" />
                      {progress && progressPercent > 0 && !progress.completed ? 'Devam Et' : 'İzle'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Real HTML5 Child-Safe Video Player Modal */}
      {activeMovie && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white pb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleClosePlayer}
                className="h-9 w-9 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-sm sm:text-base font-bold truncate">{activeMovie.title}</h2>
                <span className="text-[11px] text-white/70 block">
                  {activeMovie.category} • {activeMovie.ageRange}
                </span>
              </div>
            </div>

            {/* Shield Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="h-4 w-4" />
              <span>Güvenli Çocuk Oynatıcı</span>
            </div>
          </div>

          {/* Video Player Frame */}
          <div className="relative flex-1 flex items-center justify-center max-w-4xl mx-auto w-full overflow-hidden rounded-3xl bg-black border border-white/10">
            {/* Real HTML5 Video */}
            <video
              ref={videoRef}
              src={activeMovie.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => setIsBuffering(false)}
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              muted={isMuted}
              playsInline
              className="w-full h-full object-contain max-h-[70vh]"
            />

            {/* Buffering Spinner */}
            {isBuffering && !hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white gap-2">
                <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
                <span className="text-xs font-semibold">Video yükleniyor...</span>
              </div>
            )}

            {/* Real Error State */}
            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-6 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center text-2xl">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-rose-400">Video Yüklenemedi</h3>
                <p className="text-xs text-white/80 max-w-sm">{errorMessage}</p>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClosePlayer}
                    className="text-xs font-semibold bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Listeye Dön
                  </Button>
                </div>
              </div>
            )}

            {/* Resume Prompt Overlay */}
            {showResumePrompt && !hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-6 text-center space-y-4">
                <div className="h-14 w-14 rounded-3xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl">
                  🐰
                </div>
                <div>
                  <h3 className="text-base font-bold">Kaldığın Yerden Devam Et</h3>
                  <p className="text-xs text-white/70 mt-1">
                    Bu videoyu daha önce {formatTime(savedTime)} anına kadar izlemiştin.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={handleResumeClick}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs h-10 px-5"
                  >
                    <Play className="h-4 w-4 mr-1" /> Devam Et ({formatTime(savedTime)})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleStartOverClick}
                    className="bg-white/10 border-white/20 text-white font-semibold text-xs h-10 px-4 hover:bg-white/20"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" /> Baştan Başlat
                  </Button>
                </div>
              </div>
            )}

            {/* Video Completed Overlay */}
            {isCompleted && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-white p-6 text-center space-y-4">
                <div className="h-14 w-14 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl">
                  🎉
                </div>
                <div>
                  <h3 className="text-base font-bold">Tebrikler! Video Tamamlandı</h3>
                  <p className="text-xs text-white/70 mt-1">
                    Big Buck Bunny macerasını keyifle tamamladın.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="primary"
                    onClick={handleStartOverClick}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs h-9 px-4"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Tekrar İzle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClosePlayer}
                    className="bg-white/10 border-white/20 text-white font-semibold text-xs h-9 px-4 hover:bg-white/20"
                  >
                    Listeye Dön
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Player Controls & Mandatory Attribution */}
          <div className="pt-3 max-w-4xl mx-auto w-full space-y-2">
            {/* Scrubber & Time */}
            <div className="flex items-center gap-3 text-white text-xs font-mono">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1.5 rounded-lg bg-white/20 accent-rose-500 cursor-pointer"
              />
              <span>{formatTime(duration)}</span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={togglePlay}
                  className="h-9 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" /> Duraklat
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" /> Oynat
                    </>
                  )}
                </Button>

                <button
                  onClick={handleRewind10}
                  className="h-9 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold"
                  title="10 Saniye Geri"
                >
                  -10s
                </button>
                <button
                  onClick={handleForward10}
                  className="h-9 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold"
                  title="10 Saniye İleri"
                >
                  +10s
                </button>
              </div>

              {/* Mute and Attribution */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Mandatory Attribution Footer Under Player */}
            <div className="pt-2 text-center text-[11px] text-white/60 border-t border-white/10">
              <a
                href={activeMovie.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white underline inline-flex items-center gap-1 font-medium transition-colors"
              >
                <span>{activeMovie.attributionText}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
