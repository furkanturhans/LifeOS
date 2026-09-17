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

interface ShapeItem {
  id: number;
  emoji: string;
  nameTr: string;
  xPercent: number;
  yPercent: number;
  sizeRem: number;
  rotationDeg: number;
}

const SHAPES_DATA = [
  { emoji: '⭐️', nameTr: 'Yıldız' },
  { emoji: '🔵', nameTr: 'Mavi Daire' },
  { emoji: '🔺', nameTr: 'Kırmızı Üçgen' },
  { emoji: '🟩', nameTr: 'Yeşil Kare' },
  { emoji: '🍎', nameTr: 'Kırmızı Elma' },
  { emoji: '🐱', nameTr: 'Sevimli Kedi' },
  { emoji: '🚀', nameTr: 'Uzay Roketi' },
  { emoji: '🐠', nameTr: 'Minik Balık' },
];

const TOTAL_ROUNDS = 10;

interface ShapeCounterGameProps {
  onBack: () => void;
}

export function ShapeCounterGame({ onBack }: ShapeCounterGameProps) {
  const { isMuted, toggleMute, scores, recordGameSession } = useArcadeStore();

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [targetShape, setTargetShape] = useState(SHAPES_DATA[0]);
  const [targetCount, setTargetCount] = useState(3);
  const [scatteredItems, setScatteredItems] = useState<ShapeItem[]>([]);
  const [choices, setChoices] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Generate round state
  const generateRound = useCallback((roundNum: number) => {
    const randomTarget = SHAPES_DATA[Math.floor(Math.random() * SHAPES_DATA.length)];
    // As rounds increase, count ranges from 2..5 (early) to 3..9 (later)
    const minCount = roundNum <= 3 ? 2 : roundNum <= 7 ? 3 : 4;
    const maxCount = roundNum <= 3 ? 5 : roundNum <= 7 ? 8 : 9;
    const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;

    setTargetShape(randomTarget);
    setTargetCount(count);
    setSelectedAnswer(null);
    setFeedbackState('idle');

    // Generate positions for target shapes
    const items: ShapeItem[] = [];
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        emoji: randomTarget.emoji,
        nameTr: randomTarget.nameTr,
        xPercent: 12 + Math.random() * 76,
        yPercent: 12 + Math.random() * 76,
        sizeRem: 2.2 + Math.random() * 0.8,
        rotationDeg: Math.floor(Math.random() * 30) - 15,
      });
    }

    // Add 1 or 2 decoy shapes on rounds > 4 for mild challenge
    if (roundNum > 4) {
      const decoy = SHAPES_DATA.find((s) => s.emoji !== randomTarget.emoji) || SHAPES_DATA[1];
      const decoyCount = Math.min(2, Math.floor(roundNum / 4));
      for (let j = 0; j < decoyCount; j++) {
        items.push({
          id: count + j,
          emoji: decoy.emoji,
          nameTr: decoy.nameTr,
          xPercent: 12 + Math.random() * 76,
          yPercent: 12 + Math.random() * 76,
          sizeRem: 2.0,
          rotationDeg: Math.floor(Math.random() * 30) - 15,
        });
      }
    }

    setScatteredItems(items);

    // Generate 4 choice numbers including correct answer
    const choiceSet = new Set<number>([count]);
    while (choiceSet.size < 4) {
      const offset = Math.floor(Math.random() * 5) - 2;
      const candidate = count + offset;
      if (candidate >= 1 && candidate <= 12) {
        choiceSet.add(candidate);
      }
    }
    const shuffledChoices = Array.from(choiceSet).sort((a, b) => a - b);
    setChoices(shuffledChoices);
  }, []);

  useEffect(() => {
    generateRound(1);
    setRound(1);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
  }, [generateRound]);

  function handleChoiceClick(chosen: number) {
    if (feedbackState !== 'idle' || isPaused || isGameOver) return;

    setSelectedAnswer(chosen);

    if (chosen === targetCount) {
      // Correct!
      kidsSound.playCorrect(isMuted);
      setFeedbackState('correct');
      const roundPoints = 10 + streak * 2;
      const newScore = score + roundPoints;
      setScore(newScore);
      setStreak((prev) => prev + 1);

      setTimeout(() => {
        if (round >= TOTAL_ROUNDS) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'shape_counting',
            score: newScore,
            level: TOTAL_ROUNDS,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        } else {
          setRound((prev) => {
            const nextRound = prev + 1;
            generateRound(nextRound);
            return nextRound;
          });
        }
      }, 1000);
    } else {
      // Wrong
      kidsSound.playWrong(isMuted);
      setFeedbackState('wrong');
      setStreak(0);

      setTimeout(() => {
        setFeedbackState('idle');
        setSelectedAnswer(null);
      }, 1200);
    }
  }

  function handleRestart() {
    setRound(1);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
    setIsPaused(false);
    generateRound(1);
  }

  const bestScore = scores.shapeCountingHighScore || 0;

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
          <span className="font-bold text-sm text-foreground">Şekil Sayma</span>
        </div>

        {/* Round Progress Pill */}
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-bold text-foreground">
          <span>Tur {round}/{TOTAL_ROUNDS}</span>
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
          <span className="block text-[10px] uppercase font-bold text-muted-foreground">Puan</span>
          <span className="text-base font-extrabold text-foreground">{score}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-1.5 shadow-2xs">
          <span className="block text-[10px] uppercase font-bold text-muted-foreground">Seri (Streak)</span>
          <span className="text-base font-extrabold text-amber-500">
            {streak > 1 ? `🔥 ${streak}x` : `${streak}`}
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-1.5 shadow-2xs">
          <span className="block text-[10px] uppercase font-bold text-muted-foreground">En Yüksek</span>
          <span className="text-base font-extrabold text-primary">
            {bestScore > 0 ? `${bestScore}` : '-'}
          </span>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="px-4 text-center mt-1">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2 shadow-2xs">
          <span className="text-2xl">{targetShape.emoji}</span>
          <span className="text-sm font-extrabold text-foreground">
            Kaç tane {targetShape.nameTr} var?
          </span>
        </div>
      </div>

      {/* Counting Stage Playground Area */}
      <div className="flex-1 px-4 py-3 flex items-center justify-center">
        <div className="relative w-full max-w-md h-56 sm:h-64 rounded-3xl border border-border/80 bg-card/70 shadow-xs overflow-hidden backdrop-blur-xs">
          {scatteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="absolute pointer-events-none select-none"
              style={{
                left: `${item.xPercent}%`,
                top: `${item.yPercent}%`,
                transform: `translate(-50%, -50%) rotate(${item.rotationDeg}deg)`,
                fontSize: `${item.sizeRem}rem`,
              }}
            >
              {item.emoji}
            </motion.div>
          ))}

          {/* Feedback Overlay */}
          <AnimatePresence>
            {feedbackState === 'correct' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/20 backdrop-blur-xs text-emerald-600 dark:text-emerald-400 font-extrabold text-lg"
              >
                <CheckCircle2 className="h-12 w-12 mb-1 animate-bounce" />
                <span>Harika! Doğru Cevap: {targetCount}</span>
              </motion.div>
            )}

            {feedbackState === 'wrong' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-rose-500/20 backdrop-blur-xs text-rose-600 dark:text-rose-400 font-extrabold text-lg"
              >
                <span className="text-3xl mb-1">🧐</span>
                <span>Tekrar dikkatle sayalım!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4 Big Number Selection Buttons */}
      <div className="px-4 pb-6 pt-1 max-w-md mx-auto w-full">
        <div className="grid grid-cols-4 gap-2.5">
          {choices.map((num) => (
            <motion.button
              key={num}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleChoiceClick(num)}
              disabled={feedbackState !== 'idle'}
              className={cn(
                'h-14 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-extrabold shadow-sm transition-all duration-150 border',
                selectedAnswer === num && feedbackState === 'correct'
                  ? 'border-emerald-500 bg-emerald-500 text-white scale-105'
                  : selectedAnswer === num && feedbackState === 'wrong'
                  ? 'border-rose-500 bg-rose-500 text-white animate-shake'
                  : 'border-border/80 bg-card hover:border-primary/50 hover:bg-primary/5 text-foreground'
              )}
            >
              {num}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Pause Modal */}
      <Modal
        isOpen={isPaused}
        onClose={() => setIsPaused(false)}
        title="Oyun Duraklatıldı"
        description="Şekil sayma molası. Hazır olduğunuzda devam edin."
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
        title="Oyun Tamamlandı! 🏆"
        description="10 turun tamamını başarıyla tamamladınız!"
        size="sm"
      >
        <div className="text-center py-2 space-y-4">
          <div className="text-4xl">🌟</div>

          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <span className="text-xs text-muted-foreground block mb-1">Toplam Skorunuz</span>
            <span className="text-3xl font-extrabold text-primary">{score} Puan</span>
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
