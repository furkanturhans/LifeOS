'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameShell } from '../engine/GameShell';
import { useArcadeStore } from '@/stores/useArcadeStore';
import { kidsSound } from '@/lib/arcade/kidsSound';
import { cn } from '@/lib/utils';
import { CheckCircle2, Sparkles } from 'lucide-react';

// =============================================================================
// 1. ÇOCUK SUDOKU (4x4 Mini Sudoku with Fruit / Number Symbols)
// =============================================================================
const FRUITS = ['🍎', '🍌', '🍇', '🍊'];

// Initial 4x4 board with empty spots represented by 0
const SUDOKU_PUZZLE = [
  [1, 0, 3, 4],
  [3, 4, 1, 0],
  [0, 1, 4, 3],
  [4, 3, 0, 1],
];
const SUDOKU_SOLUTION = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
];

export function CocukSudokuGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [board, setBoard] = useState<number[][]>(SUDOKU_PUZZLE.map((r) => [...r]));
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  function handleCellClick(r: number, c: number) {
    if (isGameOver || SUDOKU_PUZZLE[r][c] !== 0) return;
    kidsSound.playFlip(isMuted);
    setSelectedCell({ r, c });
  }

  function handlePickSymbol(num: number) {
    if (!selectedCell || isGameOver) return;
    kidsSound.playFlip(isMuted);
    const { r, c } = selectedCell;
    const newBoard = board.map((row, rowIdx) =>
      rowIdx === r ? row.map((cell, colIdx) => (colIdx === c ? num : cell)) : row
    );
    setBoard(newBoard);

    // Check if whole board is correctly solved
    let isCorrect = true;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (newBoard[i][j] !== SUDOKU_SOLUTION[i][j]) {
          isCorrect = false;
        }
      }
    }

    if (isCorrect) {
      kidsSound.playWin(isMuted);
      const nextScore = score + 100;
      setScore(nextScore);
      recordGameSession({
        gameId: 'cocuk_sudoku',
        score: nextScore,
        level: 1,
        timeSpentSeconds: 0,
        victory: true,
      });
      setIsGameOver(true);
    }
  }

  function handleRestart() {
    setBoard(SUDOKU_PUZZLE.map((r) => [...r]));
    setSelectedCell(null);
    setScore(0);
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Çocuk Sudoku"
      iconEmoji="🧩"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{ score }}
      isGameOver={isGameOver}
      gameOverTitle="Sudoku Çözüldü! 🏆"
      gameOverDescription="4x4 mini meyve sudokusunu eksiksiz ve doğru tamamladınız!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        {/* Sudoku 4x4 Grid */}
        <div className="grid grid-cols-4 gap-2 p-3.5 rounded-3xl border border-border bg-card/80 shadow-xs">
          {board.map((row, r) =>
            row.map((val, c) => {
              const isFixed = SUDOKU_PUZZLE[r][c] !== 0;
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              return (
                <motion.button
                  key={`${r}-${c}`}
                  whileTap={!isFixed ? { scale: 0.95 } : {}}
                  onClick={() => handleCellClick(r, c)}
                  className={cn(
                    'aspect-square rounded-2xl flex items-center justify-center text-2xl border transition-all',
                    isFixed
                      ? 'border-border/80 bg-muted/60 text-foreground cursor-default font-extrabold'
                      : isSelected
                      ? 'border-primary bg-primary/20 ring-2 ring-primary'
                      : 'border-dashed border-primary/40 bg-card hover:bg-muted/40 cursor-pointer'
                  )}
                >
                  {val > 0 ? FRUITS[val - 1] : ''}
                </motion.button>
              );
            })
          )}
        </div>

        {/* Fruit Picker Palette */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {FRUITS.map((fruit, idx) => (
            <motion.button
              key={fruit}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePickSymbol(idx + 1)}
              disabled={!selectedCell}
              className="h-12 w-12 rounded-2xl border border-border bg-card hover:border-primary text-2xl flex items-center justify-center shadow-xs disabled:opacity-40"
            >
              {fruit}
            </motion.button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 2. MANTIK KARELERİ (LOGIC GRIDS)
// =============================================================================
const LOGIC_PUZZLES = [
  {
    clue: 'Yıldız, 3. sütunda ve mavi renkte değil.',
    gridSize: 3,
    starPos: { r: 1, c: 2 },
  },
  {
    clue: 'Gizli hazine tam orta karede yer alıyor.',
    gridSize: 3,
    starPos: { r: 1, c: 1 },
  },
  {
    clue: 'Yıldız sol alt köşede gizlenmiş.',
    gridSize: 3,
    starPos: { r: 2, c: 0 },
  },
];

export function MantikKareleriGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [levelIdx, setLevelIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [clickedCell, setClickedCell] = useState<{ r: number; c: number } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = LOGIC_PUZZLES[levelIdx % LOGIC_PUZZLES.length];

  function handleCellClick(r: number, c: number) {
    if (isGameOver) return;
    setClickedCell({ r, c });

    if (r === current.starPos.r && c === current.starPos.c) {
      kidsSound.playCorrect(isMuted);
      const nextScore = score + 35;
      setScore(nextScore);

      setTimeout(() => {
        setClickedCell(null);
        if (levelIdx + 1 >= LOGIC_PUZZLES.length) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'mantik_kareleri',
            score: nextScore,
            level: LOGIC_PUZZLES.length,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        } else {
          setLevelIdx((l) => l + 1);
        }
      }, 700);
    } else {
      kidsSound.playWrong(isMuted);
      setTimeout(() => setClickedCell(null), 800);
    }
  }

  function handleRestart() {
    setLevelIdx(0);
    setScore(0);
    setClickedCell(null);
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Mantık Kareleri"
      iconEmoji="🧠"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        round: levelIdx + 1,
        maxRounds: LOGIC_PUZZLES.length,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Mantık Dehası! 🏆"
      gameOverDescription="Tüm ipuçlarını doğru değerlendirip gizli kareleri buldunuz!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        <div className="rounded-3xl border border-border bg-card/80 p-4 shadow-xs">
          <span className="text-xs font-bold text-muted-foreground block mb-1">İpucu</span>
          <p className="text-sm font-extrabold text-foreground">&ldquo;{current.clue}&rdquo;</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-3xl border border-border bg-card/80">
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => {
              const isHit = clickedCell?.r === r && clickedCell?.c === c;
              const isStar = r === current.starPos.r && c === current.starPos.c;
              return (
                <motion.button
                  key={`${r}-${c}`}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCellClick(r, c)}
                  className={cn(
                    'aspect-square rounded-2xl flex items-center justify-center text-3xl border transition-all',
                    isHit && isStar
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : isHit && !isStar
                      ? 'border-rose-500 bg-rose-500/20'
                      : 'border-border bg-muted/40 hover:bg-muted'
                  )}
                >
                  {isHit && isStar ? '⭐️' : isHit && !isStar ? '❌' : '?'}
                </motion.button>
              );
            })
          )}
        </div>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 3. SAYI ŞEKİLLERİ (NUMBER SHAPES)
// =============================================================================
const SHAPE_NUMBER_LEVELS = [
  { targetCount: 4, shapeEmoji: '🔷', options: [2, 4, 6, 8] },
  { targetCount: 7, shapeEmoji: '⭐️', options: [5, 6, 7, 9] },
  { targetCount: 5, shapeEmoji: '🔺', options: [3, 5, 7, 8] },
  { targetCount: 9, shapeEmoji: '🟢', options: [6, 8, 9, 10] },
];

export function SayiSekilleriGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = SHAPE_NUMBER_LEVELS[index % SHAPE_NUMBER_LEVELS.length];

  function handleChoose(val: number) {
    if (isGameOver) return;
    if (val === current.targetCount) {
      kidsSound.playCorrect(isMuted);
      const nextScore = score + 25;
      setScore(nextScore);

      setTimeout(() => {
        if (index + 1 >= SHAPE_NUMBER_LEVELS.length) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'sayi_sekilleri',
            score: nextScore,
            level: SHAPE_NUMBER_LEVELS.length,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        } else {
          setIndex((i) => i + 1);
        }
      }, 700);
    } else {
      kidsSound.playWrong(isMuted);
    }
  }

  function handleRestart() {
    setIndex(0);
    setScore(0);
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Sayı Şekilleri"
      iconEmoji="🔢"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        round: index + 1,
        maxRounds: SHAPE_NUMBER_LEVELS.length,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Sayı Şekilleri Tamamlandı! 🏆"
      gameOverDescription="Tüm sayı ve şekil eşleştirmelerini başarıyla bitirdiniz!"
    >
      <div className="w-full max-w-xs space-y-5 text-center">
        <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-xs flex flex-wrap items-center justify-center gap-2 min-h-[110px]">
          {Array.from({ length: current.targetCount }).map((_, i) => (
            <span key={i} className="text-3xl animate-in zoom-in-75 duration-150">
              {current.shapeEmoji}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {current.options.map((opt) => (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleChoose(opt)}
              className="h-14 rounded-2xl border border-border bg-card hover:border-primary text-2xl font-extrabold shadow-xs"
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 4. HEDEF SAYI (TARGET NUMBER PUZZLE)
// =============================================================================
const TARGET_NUMBER_LEVELS = [
  { target: 10, cards: [2, 3, 5, 8], hint: '5 + 5 veya 2 + 8' },
  { target: 15, cards: [7, 8, 4, 3], hint: '7 + 8 = 15' },
  { target: 12, cards: [4, 8, 6, 2], hint: '4 + 8 = 12' },
  { target: 20, cards: [9, 11, 5, 6], hint: '9 + 11 = 20' },
];

export function HedefSayiGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = TARGET_NUMBER_LEVELS[index % TARGET_NUMBER_LEVELS.length];
  const currentSum = selectedCards.reduce((acc, c) => acc + c, 0);

  function handleToggleCard(val: number) {
    if (isGameOver) return;
    kidsSound.playFlip(isMuted);
    let next: number[];
    if (selectedCards.includes(val)) {
      next = selectedCards.filter((c) => c !== val);
    } else {
      next = [...selectedCards, val];
    }
    setSelectedCards(next);

    const sum = next.reduce((a, b) => a + b, 0);
    if (sum === current.target) {
      kidsSound.playCorrect(isMuted);
      const nextScore = score + 30;
      setScore(nextScore);

      setTimeout(() => {
        setSelectedCards([]);
        if (index + 1 >= TARGET_NUMBER_LEVELS.length) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'hedef_sayi',
            score: nextScore,
            level: TARGET_NUMBER_LEVELS.length,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        } else {
          setIndex((i) => i + 1);
        }
      }, 700);
    }
  }

  function handleRestart() {
    setIndex(0);
    setScore(0);
    setSelectedCards([]);
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Hedef Sayı"
      iconEmoji="🎯"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        round: index + 1,
        maxRounds: TARGET_NUMBER_LEVELS.length,
        customStatLabel: 'Toplam',
        customStatValue: currentSum,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Hedefe Ulaşıldı! 🏆"
      gameOverDescription="Sayı kartlarını toplayarak tüm hedef sayılara başarıyla ulaştınız!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        {/* Target Prompt */}
        <div className="rounded-3xl border border-primary/30 bg-primary/10 p-4 shadow-xs">
          <span className="text-xs font-bold text-muted-foreground block mb-0.5">Hedef Sayı</span>
          <span className="text-4xl font-extrabold text-primary">{current.target}</span>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-2 gap-3">
          {current.cards.map((c, i) => {
            const isSelected = selectedCards.includes(c);
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToggleCard(c)}
                className={cn(
                  'h-16 rounded-2xl border text-2xl font-extrabold flex items-center justify-center transition-all shadow-xs',
                  isSelected
                    ? 'border-primary bg-primary text-white scale-105'
                    : 'border-border bg-card hover:border-primary/50 text-foreground'
                )}
              >
                {c}
              </motion.button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}
