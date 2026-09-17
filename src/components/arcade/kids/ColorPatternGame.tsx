'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RotateCcw,
  Pause,
  Play,
  Volume2,
  VolumeX,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { kidsSound } from '@/lib/arcade/kidsSound';
import { useArcadeStore } from '@/stores/useArcadeStore';
import { cn } from '@/lib/utils';

type GameMode = 'sequence' | 'pattern';

const COLOR_PADS = [
  { id: 'red', nameTr: 'Kırmızı', colorClass: 'bg-red-500', activeClass: 'bg-red-400 ring-4 ring-white shadow-lg scale-105', freq: 440, emoji: '🔴' },
  { id: 'blue', nameTr: 'Mavi', colorClass: 'bg-blue-500', activeClass: 'bg-blue-400 ring-4 ring-white shadow-lg scale-105', freq: 554.37, emoji: '🔵' },
  { id: 'green', nameTr: 'Yeşil', colorClass: 'bg-emerald-500', activeClass: 'bg-emerald-400 ring-4 ring-white shadow-lg scale-105', freq: 659.25, emoji: '🟢' },
  { id: 'yellow', nameTr: 'Sarı', colorClass: 'bg-amber-400', activeClass: 'bg-amber-300 ring-4 ring-white shadow-lg scale-105', freq: 880, emoji: '🟡' },
];

const PATTERN_TEMPLATES = [
  { pattern: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', options: ['🔴', '🔵', '🟢', '🟡'] },
  { pattern: ['🟢', '🟡', '🟢', '🟡'], answer: '🟢', options: ['🟢', '🟡', '🔴', '🔵'] },
  { pattern: ['🔵', '🔵', '🔴', '🔵', '🔵'], answer: '🔴', options: ['🔴', '🔵', '🟢', '🟡'] },
  { pattern: ['🟡', '🔴', '🟢', '🟡', '🔴'], answer: '🟢', options: ['🟢', '🟡', '🔴', '🔵'] },
  { pattern: ['🔴', '🟢', '🟢', '🔴', '🟢'], answer: '🟢', options: ['🟢', '🔴', '🔵', '🟡'] },
];

interface ColorPatternGameProps {
  onBack: () => void;
}

export function ColorPatternGame({ onBack }: ColorPatternGameProps) {
  const { isMuted, toggleMute, scores, recordGameSession } = useArcadeStore();

  const [mode, setMode] = useState<GameMode>('sequence');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  // Sequence mode state (Simon style)
  const [sequence, setSequence] = useState<string[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [activePadId, setActivePadId] = useState<string | null>(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);

  // Pattern completion state
  const [patternIndex, setPatternIndex] = useState(0);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // ---------------------------------------------------------------------------
  // SEQUENCE MODE LOGIC
  // ---------------------------------------------------------------------------
  const startNextSequenceLevel = useCallback((nextLevel: number) => {
    setIsPlayingSequence(true);
    setUserStep(0);

    // Generate random sequence of length: nextLevel + 2
    const padIds = COLOR_PADS.map((p) => p.id);
    const newSeq: string[] = [];
    for (let i = 0; i < nextLevel + 2; i++) {
      newSeq.push(padIds[Math.floor(Math.random() * padIds.length)]);
    }
    setSequence(newSeq);

    // Play sequence animation
    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx >= newSeq.length) {
        clearInterval(interval);
        setActivePadId(null);
        setIsPlayingSequence(false);
        return;
      }

      const currentPadId = newSeq[stepIdx];
      const padConfig = COLOR_PADS.find((p) => p.id === currentPadId);
      setActivePadId(currentPadId);
      if (padConfig) kidsSound.playBeep(padConfig.freq, 250, 'sine', isMuted);

      setTimeout(() => {
        setActivePadId(null);
      }, 350);

      stepIdx++;
    }, 650);
  }, [isMuted]);

  function handlePadClick(padId: string) {
    if (isPlayingSequence || isPaused || isGameOver) return;

    const padConfig = COLOR_PADS.find((p) => p.id === padId);
    if (padConfig) kidsSound.playBeep(padConfig.freq, 150, 'sine', isMuted);

    setActivePadId(padId);
    setTimeout(() => setActivePadId(null), 200);

    if (sequence[userStep] === padId) {
      // Correct step
      const nextStep = userStep + 1;
      setUserStep(nextStep);

      if (nextStep === sequence.length) {
        // Level Completed!
        kidsSound.playCorrect(isMuted);
        const newScore = score + level * 10;
        setScore(newScore);

        setTimeout(() => {
          if (level >= 8) {
            kidsSound.playWin(isMuted);
            recordGameSession({
              gameId: 'color_pattern',
              score: newScore,
              level,
              timeSpentSeconds: 0,
              victory: true,
            });
            setIsGameOver(true);
          } else {
            setLevel((prev) => {
              const nextLvl = prev + 1;
              startNextSequenceLevel(nextLvl);
              return nextLvl;
            });
          }
        }, 800);
      }
    } else {
      // Mistake
      kidsSound.playWrong(isMuted);
      recordGameSession({
        gameId: 'color_pattern',
        score,
        level,
        timeSpentSeconds: 0,
        victory: false,
      });
      setIsGameOver(true);
    }
  }

  // ---------------------------------------------------------------------------
  // PATTERN MODE LOGIC
  // ---------------------------------------------------------------------------
  function handlePatternOptionClick(option: string) {
    if (feedbackState !== 'idle' || isPaused || isGameOver) return;

    const currentTemplate = PATTERN_TEMPLATES[patternIndex % PATTERN_TEMPLATES.length];

    if (option === currentTemplate.answer) {
      // Correct
      kidsSound.playCorrect(isMuted);
      setFeedbackState('correct');
      const newScore = score + 15;
      setScore(newScore);

      setTimeout(() => {
        setFeedbackState('idle');
        if (patternIndex + 1 >= PATTERN_TEMPLATES.length) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'color_pattern',
            score: newScore,
            level: patternIndex + 1,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        } else {
          setPatternIndex((prev) => prev + 1);
          setLevel((prev) => prev + 1);
        }
      }, 900);
    } else {
      // Wrong
      kidsSound.playWrong(isMuted);
      setFeedbackState('wrong');
      setTimeout(() => setFeedbackState('idle'), 1000);
    }
  }

  function handleRestart() {
    setLevel(1);
    setScore(0);
    setUserStep(0);
    setPatternIndex(0);
    setIsGameOver(false);
    setIsPaused(false);
    setFeedbackState('idle');

    if (mode === 'sequence') {
      startNextSequenceLevel(1);
    }
  }

  useEffect(() => {
    handleRestart();
  }, [mode]);

  const bestScore = scores.colorPatternHighScore || 0;
  const currentPattern = PATTERN_TEMPLATES[patternIndex % PATTERN_TEMPLATES.length];

  return (
    <div className="flex flex-col h-full bg-background select-none">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onBack}
            className="h-9 px-2.5 text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Oyunlar</span>
          </Button>
          <span className="font-bold text-sm text-foreground">Renk & Desen</span>
        </div>

        {/* Mode Selector Switch */}
        <div className="flex items-center rounded-xl border border-border/80 bg-muted/40 p-0.5 text-xs">
          <button
            onClick={() => setMode('sequence')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
              mode === 'sequence'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Renk Sırası
          </button>
          <button
            onClick={() => setMode('pattern')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
              mode === 'pattern'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Desen Bul
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleMute}
            className="h-9 w-9 rounded-xl border border-border/80 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-primary" />}
          </button>

          <button
            onClick={() => setIsPaused(true)}
            className="h-9 w-9 rounded-xl border border-border/80 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Duraklat"
          >
            <Pause className="h-4 w-4" />
          </button>

          <button
            onClick={handleRestart}
            className="h-9 w-9 rounded-xl border border-border/80 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Yeniden Başlat"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-2 px-4 py-2 max-w-md mx-auto w-full text-center">
        <div className="rounded-xl border border-border bg-card p-1.5 shadow-2xs">
          <span className="block text-[10px] uppercase font-bold text-muted-foreground">Seviye</span>
          <span className="text-base font-extrabold text-foreground">{level}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-1.5 shadow-2xs">
          <span className="block text-[10px] uppercase font-bold text-muted-foreground">Puan</span>
          <span className="text-base font-extrabold text-foreground">{score}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-1.5 shadow-2xs">
          <span className="block text-[10px] uppercase font-bold text-muted-foreground">En Yüksek</span>
          <span className="text-base font-extrabold text-primary">
            {bestScore > 0 ? `${bestScore}` : '-'}
          </span>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
        {mode === 'sequence' ? (
          /* SEQUENCE / SIMON STYLE GAME */
          <div className="w-full flex flex-col items-center space-y-4">
            <div className="text-center">
              <span className="text-xs font-bold text-muted-foreground">
                {isPlayingSequence ? '👀 Sırayı dikkatle izleyin...' : '🎯 Sıradaki renkleri dokunarak tekrarlayın!'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xs aspect-square p-2">
              {COLOR_PADS.map((pad) => (
                <motion.button
                  key={pad.id}
                  whileTap={!isPlayingSequence ? { scale: 0.95 } : {}}
                  onClick={() => handlePadClick(pad.id)}
                  disabled={isPlayingSequence}
                  className={cn(
                    'aspect-square rounded-3xl transition-all duration-150 flex items-center justify-center shadow-md',
                    pad.colorClass,
                    activePadId === pad.id ? pad.activeClass : 'opacity-85 hover:opacity-100'
                  )}
                >
                  <span className="text-3xl filter drop-shadow">{pad.emoji}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          /* PATTERN COMPLETION GAME */
          <div className="w-full flex flex-col items-center space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold text-muted-foreground">
                Sıradaki şekil hangisi olmalı? Soru işaretine dokunun!
              </span>
            </div>

            {/* Pattern Strip Display */}
            <div className="flex items-center justify-center gap-2 p-4 rounded-3xl border border-border bg-card/80 shadow-sm w-full max-w-sm flex-wrap">
              {currentPattern.pattern.map((item, idx) => (
                <span key={idx} className="text-3xl sm:text-4xl animate-in fade-in zoom-in-75 duration-200">
                  {item}
                </span>
              ))}
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-primary/10 text-primary text-xl font-extrabold animate-pulse">
                ?
              </div>
            </div>

            {/* Feedback Message */}
            <div className="h-6">
              {feedbackState === 'correct' && (
                <span className="text-emerald-500 font-extrabold text-sm flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Doğru Desen!
                </span>
              )}
              {feedbackState === 'wrong' && (
                <span className="text-rose-500 font-extrabold text-sm">
                  Tekrar Deneyin!
                </span>
              )}
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-4 gap-3 w-full max-w-xs">
              {currentPattern.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handlePatternOptionClick(opt)}
                  disabled={feedbackState !== 'idle'}
                  className="h-16 rounded-2xl border border-border bg-card hover:border-primary flex items-center justify-center text-3xl shadow-xs transition-all"
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pause Modal */}
      <Modal
        isOpen={isPaused}
        onClose={() => setIsPaused(false)}
        title="Oyun Duraklatıldı"
        description="Mola verdiniz. Hazır olduğunuzda devam edin."
        size="sm"
      >
        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            onClick={() => setIsPaused(false)}
            className="w-full font-bold h-11 text-sm"
          >
            <Play className="h-4 w-4 mr-1.5" />
            Devam Et
          </Button>
          <Button
            variant="outline"
            onClick={handleRestart}
            className="w-full font-semibold text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Yeniden Başlat
          </Button>
          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full text-xs text-muted-foreground"
          >
            Oyunlardan Çık
          </Button>
        </div>
      </Modal>

      {/* Game Over Modal */}
      <Modal
        isOpen={isGameOver}
        onClose={handleRestart}
        title={score > 30 ? 'Harika Performans! 🏆' : 'Oyun Bitti'}
        description="Oyununuz tamamlandı."
        size="sm"
      >
        <div className="text-center py-2 space-y-4">
          <div className="text-4xl">🎨</div>

          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <span className="text-xs text-muted-foreground block mb-1">Skorunuz</span>
            <span className="text-3xl font-extrabold text-primary">{score} Puan</span>
            <span className="text-[11px] text-muted-foreground block mt-1">Ulaşılan Seviye: {level}</span>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              onClick={handleRestart}
              className="w-full font-bold h-11 text-sm"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Tekrar Oyna
            </Button>
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full text-xs font-semibold"
            >
              Diğer Oyunlara Dön
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
