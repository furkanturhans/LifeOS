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
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { kidsSound } from '@/lib/arcade/kidsSound';
import { useArcadeStore } from '@/stores/useArcadeStore';
import { cn } from '@/lib/utils';

type Difficulty = 'easy' | 'medium' | 'hard';

interface CardItem {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJI_POOL = ['🦁', '🐬', '🚀', '🌟', '🍎', '🎨', '🌈', '🎸', '🚗', '⚽', '🍦', '🎁'];

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; pairsCount: number; gridCols: string; maxStarsMoves: number }
> = {
  easy: { label: 'Kolay (6 Kart)', pairsCount: 3, gridCols: 'grid-cols-3', maxStarsMoves: 5 },
  medium: { label: 'Orta (12 Kart)', pairsCount: 6, gridCols: 'grid-cols-3 sm:grid-cols-4', maxStarsMoves: 10 },
  hard: { label: 'Zor (16 Kart)', pairsCount: 8, gridCols: 'grid-cols-4', maxStarsMoves: 15 },
};

interface MemoryMatchGameProps {
  onBack: () => void;
}

export function MemoryMatchGame({ onBack }: MemoryMatchGameProps) {
  const { isMuted, toggleMute, scores, recordGameSession } = useArcadeStore();

  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const config = DIFFICULTY_CONFIG[difficulty];
  const bestScore =
    difficulty === 'easy'
      ? scores.memoryMatchBest.easyMoves
      : difficulty === 'medium'
      ? scores.memoryMatchBest.mediumMoves
      : scores.memoryMatchBest.hardMoves;

  // Initialize or reset game
  const startNewGame = useCallback(() => {
    const selectedEmojis = [...EMOJI_POOL].sort(() => 0.5 - Math.random()).slice(0, config.pairsCount);
    const cardPairs = [...selectedEmojis, ...selectedEmojis]
      .sort(() => 0.5 - Math.random())
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(cardPairs);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setSeconds(0);
    setIsPaused(false);
    setIsGameOver(false);
    setIsChecking(false);
  }, [config.pairsCount]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Timer tick
  useEffect(() => {
    if (isPaused || isGameOver) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isGameOver]);

  // Card click handler
  function handleCardClick(index: number) {
    if (
      isPaused ||
      isChecking ||
      cards[index].isFlipped ||
      cards[index].isMatched ||
      flippedIndices.length >= 2
    ) {
      return;
    }

    kidsSound.playFlip(isMuted);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      setIsChecking(true);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.emoji === secondCard.emoji) {
        // Matched!
        setTimeout(() => {
          kidsSound.playMatch(isMuted);
          setCards((prev) =>
            prev.map((c, idx) =>
              idx === firstIdx || idx === secondIdx ? { ...c, isMatched: true } : c
            )
          );
          setMatches((prev) => {
            const nextMatches = prev + 1;
            if (nextMatches === config.pairsCount) {
              // Game Won
              setTimeout(() => {
                kidsSound.playWin(isMuted);
                const finalMoves = moves + 1;
                const calculatedScore = Math.max(
                  10,
                  (config.pairsCount * 100) - (finalMoves * 5) - Math.floor(seconds / 2)
                );

                recordGameSession({
                  gameId: 'memory_match',
                  score: calculatedScore,
                  moves: finalMoves,
                  difficulty,
                  timeSpentSeconds: seconds,
                  victory: true,
                });

                setIsGameOver(true);
              }, 400);
            }
            return nextMatches;
          });
          setFlippedIndices([]);
          setIsChecking(false);
        }, 500);
      } else {
        // Not matched
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, idx) =>
              idx === firstIdx || idx === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedIndices([]);
          setIsChecking(false);
        }, 900);
      }
    }
  }

  function formatTime(totalSec: number) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  const starCount = moves <= config.maxStarsMoves ? 3 : moves <= config.maxStarsMoves * 1.5 ? 2 : 1;

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
          <span className="font-bold text-sm text-foreground">Hafıza Eşleştirme</span>
        </div>

        {/* Difficulty Selector Pills */}
        <div className="flex items-center rounded-xl border border-border/80 bg-muted/40 p-0.5 text-xs">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDifficulty(d);
              }}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                difficulty === d
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor'}
            </button>
          ))}
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
            onClick={startNewGame}
            className="h-9 w-9 rounded-xl border border-border/80 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Yeniden Başlat"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-2 px-4 py-2.5 max-w-md mx-auto w-full text-center">
        <div className="rounded-xl border border-border bg-card p-2 shadow-2xs">
          <span className="block text-[10px] uppercase font-bold text-muted-foreground">Hamle</span>
          <span className="text-base font-extrabold text-foreground">{moves}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 shadow-2xs">
          <span className="block text-[10px] uppercase font-bold text-muted-foreground">Süre</span>
          <span className="text-base font-extrabold text-foreground">{formatTime(seconds)}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 shadow-2xs">
          <span className="block text-[10px] uppercase font-bold text-muted-foreground">En İyi</span>
          <span className="text-base font-extrabold text-primary">
            {bestScore ? `${bestScore} Hamle` : '-'}
          </span>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <div className={cn('grid gap-3 max-w-sm sm:max-w-md w-full', config.gridCols)}>
          {cards.map((card, index) => (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(index)}
              className={cn(
                'aspect-square rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-xs transition-all duration-200 border select-none',
                card.isMatched
                  ? 'border-emerald-500/40 bg-emerald-500/10 opacity-70 cursor-default'
                  : card.isFlipped
                  ? 'border-primary/50 bg-card shadow-md scale-100'
                  : 'border-border/80 bg-muted/60 hover:bg-muted/90 cursor-pointer'
              )}
            >
              {card.isFlipped || card.isMatched ? (
                <motion.span
                  initial={{ scale: 0.5, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {card.emoji}
                </motion.span>
              ) : (
                <span className="text-muted-foreground/30 font-bold text-xl">?</span>
              )}
            </motion.button>
          ))}
        </div>
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
            onClick={startNewGame}
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

      {/* Game Over / Victory Modal */}
      <Modal
        isOpen={isGameOver}
        onClose={startNewGame}
        title="Tebrikler! 🎉"
        description="Tüm eşleşen kartları başarıyla buldunuz!"
        size="sm"
      >
        <div className="text-center py-2 space-y-4">
          {/* Star Rating */}
          <div className="flex items-center justify-center gap-1.5 text-amber-400">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={cn(
                  'h-8 w-8 transition-transform',
                  starIdx <= starCount ? 'fill-amber-400 text-amber-400 scale-110' : 'text-muted/40'
                )}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/30 p-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Toplam Hamle</span>
              <span className="font-extrabold text-foreground text-sm">{moves}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Tamamlanma Süresi</span>
              <span className="font-extrabold text-foreground text-sm">{formatTime(seconds)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              onClick={startNewGame}
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
