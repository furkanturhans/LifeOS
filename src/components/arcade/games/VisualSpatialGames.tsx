'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameShell } from '../engine/GameShell';
import { useArcadeStore } from '@/stores/useArcadeStore';
import { kidsSound } from '@/lib/arcade/kidsSound';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

// =============================================================================
// 1. TANGRAM GAME
// =============================================================================
const TANGRAM_LEVELS = [
  {
    targetName: 'Ev (House)',
    targetEmoji: '🏠',
    pieces: ['🔺', '🟩', '🟨'],
    silhouette: ['🔺', '🟩'],
  },
  {
    targetName: 'Ağaç (Tree)',
    targetEmoji: '🌲',
    pieces: ['🔺', '🔺', '🟫'],
    silhouette: ['🔺', '🔺', '🟫'],
  },
  {
    targetName: 'Roket (Rocket)',
    targetEmoji: '🚀',
    pieces: ['🔺', '🟦', '🔺'],
    silhouette: ['🔺', '🟦', '🔺'],
  },
];

export function TangramGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = TANGRAM_LEVELS[level % TANGRAM_LEVELS.length];

  function handlePlacePiece(piece: string) {
    if (isGameOver) return;
    kidsSound.playFlip(isMuted);
    const nextPlaced = [...placed, piece];
    setPlaced(nextPlaced);

    if (nextPlaced.length >= current.pieces.length) {
      kidsSound.playWin(isMuted);
      const nextScore = score + 30;
      setScore(nextScore);

      setTimeout(() => {
        setPlaced([]);
        if (level + 1 >= TANGRAM_LEVELS.length) {
          recordGameSession({
            gameId: 'tangram',
            score: nextScore,
            level: TANGRAM_LEVELS.length,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        } else {
          setLevel((l) => l + 1);
        }
      }, 700);
    }
  }

  function handleRestart() {
    setLevel(0);
    setScore(0);
    setPlaced([]);
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Tangram"
      iconEmoji="📐"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        round: level + 1,
        maxRounds: TANGRAM_LEVELS.length,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Tangram Tamamlandı! 🏆"
      gameOverDescription="Tüm geometrik şekilleri başarıyla birleştirdiniz!"
    >
      <div className="w-full max-w-xs space-y-5 text-center">
        {/* Silhouette Area */}
        <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-xs">
          <span className="text-4xl block mb-2">{current.targetEmoji}</span>
          <span className="text-xs font-bold text-muted-foreground block mb-3">
            {current.targetName} Şeklini Oluşturun
          </span>
          <div className="flex items-center justify-center gap-2 min-h-[50px]">
            {current.pieces.map((_, i) => (
              <div
                key={i}
                className="h-12 w-12 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 flex items-center justify-center text-2xl"
              >
                {placed[i] || ''}
              </div>
            ))}
          </div>
        </div>

        {/* Available Pieces */}
        <div className="flex items-center justify-center gap-3">
          {current.pieces.map((p, idx) => {
            const isUsed = placed.filter((x) => x === p).length > 0 && placed.length > idx;
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.9 }}
                onClick={() => handlePlacePiece(p)}
                disabled={isUsed}
                className="h-14 w-14 rounded-2xl border border-border bg-card hover:border-primary text-2xl flex items-center justify-center shadow-xs disabled:opacity-30"
              >
                {p}
              </motion.button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 2. YAPBOZ (SLIDING PUZZLE)
// =============================================================================
export function YapbozGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [tiles, setTiles] = useState([1, 2, 3, 4, 5, 6, 7, 0, 8]); // 0 is empty slot
  const [moves, setMoves] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  function handleTileClick(index: number) {
    if (isGameOver) return;
    const emptyIndex = tiles.indexOf(0);
    const validMoves = [
      emptyIndex - 1, // left
      emptyIndex + 1, // right
      emptyIndex - 3, // up
      emptyIndex + 3, // down
    ];

    // Prevent wrapping across edges
    if (emptyIndex % 3 === 0 && index === emptyIndex - 1) return;
    if (emptyIndex % 3 === 2 && index === emptyIndex + 1) return;

    if (validMoves.includes(index)) {
      kidsSound.playFlip(isMuted);
      const nextTiles = [...tiles];
      nextTiles[emptyIndex] = tiles[index];
      nextTiles[index] = 0;
      setTiles(nextTiles);
      setMoves((m) => m + 1);

      // Check win: [1, 2, 3, 4, 5, 6, 7, 8, 0]
      const isWin = nextTiles.slice(0, 8).every((val, idx) => val === idx + 1);
      if (isWin) {
        kidsSound.playWin(isMuted);
        const score = Math.max(20, 200 - moves * 5);
        recordGameSession({
          gameId: 'yapboz',
          score,
          moves: moves + 1,
          timeSpentSeconds: 0,
          victory: true,
        });
        setIsGameOver(true);
      }
    }
  }

  function handleRestart() {
    setTiles([1, 2, 3, 4, 5, 6, 7, 0, 8]);
    setMoves(0);
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Yapboz"
      iconEmoji="🧩"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{ moves, score: Math.max(0, 200 - moves * 5) }}
      isGameOver={isGameOver}
      gameOverTitle="Yapboz Birleşti! 🏆"
      gameOverDescription="Tüm sayı parçalarını doğru sıraya dizdiniz!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        <div className="grid grid-cols-3 gap-2 p-3.5 rounded-3xl border border-border bg-card/80 shadow-xs">
          {tiles.map((val, idx) => (
            <motion.button
              key={idx}
              whileTap={val !== 0 ? { scale: 0.95 } : {}}
              onClick={() => handleTileClick(idx)}
              className={cn(
                'aspect-square rounded-2xl flex items-center justify-center text-2xl font-extrabold border transition-all',
                val === 0
                  ? 'border-dashed border-border/40 bg-muted/20 text-transparent'
                  : 'border-border bg-card hover:border-primary text-foreground shadow-xs'
              )}
            >
              {val !== 0 ? val : ''}
            </motion.button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 3. LABİRENT (MAZE RUNNER)
// =============================================================================
const MAZE_GRID = [
  ['S', 0, 1, 0, 0],
  [1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 1, 'E'],
];

export function LabirentGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 });
  const [moves, setMoves] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  function move(dr: number, dc: number) {
    if (isGameOver) return;
    const nr = playerPos.r + dr;
    const nc = playerPos.c + dc;

    if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
      if (MAZE_GRID[nr][nc] !== 1) {
        kidsSound.playFlip(isMuted);
        setPlayerPos({ r: nr, c: nc });
        setMoves((m) => m + 1);

        if (MAZE_GRID[nr][nc] === 'E') {
          kidsSound.playWin(isMuted);
          const score = Math.max(30, 150 - moves * 5);
          recordGameSession({
            gameId: 'labirent',
            score,
            moves: moves + 1,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        }
      }
    }
  }

  function handleRestart() {
    setPlayerPos({ r: 0, c: 0 });
    setMoves(0);
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Labirent"
      iconEmoji="🌀"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{ moves, score: Math.max(0, 150 - moves * 5) }}
      isGameOver={isGameOver}
      gameOverTitle="Çıkışa Ulaşıldı! 🏆"
      gameOverDescription="Labirenti başarıyla tamamlayıp yıldıza ulaştınız!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        <div className="grid grid-cols-5 gap-1.5 p-3 rounded-3xl border border-border bg-card/80 shadow-xs">
          {MAZE_GRID.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = playerPos.r === r && playerPos.c === c;
              const isWall = cell === 1;
              const isExit = cell === 'E';
              return (
                <div
                  key={`${r}-${c}`}
                  className={cn(
                    'aspect-square rounded-xl flex items-center justify-center text-lg font-extrabold border transition-all',
                    isPlayer
                      ? 'border-primary bg-primary text-white shadow-xs'
                      : isWall
                      ? 'border-border bg-muted/80'
                      : isExit
                      ? 'border-amber-500/40 bg-amber-500/20 text-amber-500'
                      : 'border-border/40 bg-card'
                  )}
                >
                  {isPlayer ? '🐱' : isExit ? '⭐️' : isWall ? '🧱' : ''}
                </div>
              );
            })
          )}
        </div>

        {/* Direction Controls */}
        <div className="flex flex-col items-center gap-1.5 pt-2">
          <button
            onClick={() => move(-1, 0)}
            className="h-11 w-14 rounded-2xl border border-border bg-card hover:bg-muted flex items-center justify-center"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => move(0, -1)}
              className="h-11 w-14 rounded-2xl border border-border bg-card hover:bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => move(1, 0)}
              className="h-11 w-14 rounded-2xl border border-border bg-card hover:bg-muted flex items-center justify-center"
            >
              <ArrowDown className="h-5 w-5" />
            </button>
            <button
              onClick={() => move(0, 1)}
              className="h-11 w-14 rounded-2xl border border-border bg-card hover:bg-muted flex items-center justify-center"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 4. FARKI BUL (SPOT THE DIFFERENCE)
// =============================================================================
const SPOT_DIFF_LEVELS = [
  { items: ['🍎', '🍎', '🍎', '🍓', '🍎', '🍎'], oddIndex: 3 },
  { items: ['🐱', '🐱', '🐶', '🐱', '🐱', '🐱'], oddIndex: 2 },
  { items: ['⭐️', '⭐️', '⭐️', '⭐️', '🌟', '⭐️'], oddIndex: 4 },
  { items: ['🚗', '🚗', '🚗', '🚕', '🚗', '🚗'], oddIndex: 3 },
];

export function FarkBulGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = SPOT_DIFF_LEVELS[index % SPOT_DIFF_LEVELS.length];

  function handlePick(idx: number) {
    if (isGameOver) return;
    if (idx === current.oddIndex) {
      kidsSound.playCorrect(isMuted);
      const nextScore = score + 25;
      setScore(nextScore);

      setTimeout(() => {
        if (index + 1 >= SPOT_DIFF_LEVELS.length) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'fark_bul',
            score: nextScore,
            level: SPOT_DIFF_LEVELS.length,
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
      title="Farkı Bul"
      iconEmoji="👀"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        round: index + 1,
        maxRounds: SPOT_DIFF_LEVELS.length,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Tüm Farklar Bulundu! 🏆"
      gameOverDescription="Keskin gözlerinizle farklı olan tüm nesneleri tespit ettiniz!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        <p className="text-xs font-bold text-muted-foreground">Farklı olan nesneye dokunun!</p>
        <div className="grid grid-cols-3 gap-2.5 p-4 rounded-3xl border border-border bg-card/80 shadow-xs">
          {current.items.map((emoji, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePick(i)}
              className="aspect-square rounded-2xl border border-border bg-card hover:border-primary text-3xl flex items-center justify-center shadow-xs"
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 5. GÖLGE EŞLEŞTİR (SHADOW MATCHING)
// =============================================================================
const SHADOW_ITEMS = [
  { item: '🦁', shadow: '⬛️🦁', name: 'Aslan' },
  { item: '🐬', shadow: '⬛️🐬', name: 'Yunus' },
  { item: '🐘', shadow: '⬛️🐘', name: 'Fil' },
  { item: '🦒', shadow: '⬛️🦒', name: 'Zürafa' },
];

export function GolgeEslestirGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = SHADOW_ITEMS[index % SHADOW_ITEMS.length];
  const shuffledOptions = [...SHADOW_ITEMS].sort(() => 0.5 - Math.random());

  function handleSelect(item: string) {
    if (isGameOver) return;
    if (item === current.item) {
      kidsSound.playCorrect(isMuted);
      const nextScore = score + 25;
      setScore(nextScore);

      setTimeout(() => {
        if (index + 1 >= SHADOW_ITEMS.length) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'golge_eslestir',
            score: nextScore,
            level: SHADOW_ITEMS.length,
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
      title="Gölge Eşleştir"
      iconEmoji="👤"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        round: index + 1,
        maxRounds: SHADOW_ITEMS.length,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Gölgeler Eşleşti! 🏆"
      gameOverDescription="Tüm hayvanları kendi gölgeleriyle doğru eşleştirdiniz!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        {/* Silhouette Display */}
        <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-xs">
          <span className="text-xs font-bold text-muted-foreground block mb-2">Bu gölge kime ait?</span>
          <div className="flex items-center justify-center h-20 w-20 mx-auto rounded-2xl bg-muted/60 border text-4xl filter grayscale contrast-200">
            {current.item}
          </div>
        </div>

        {/* 4 Choices */}
        <div className="grid grid-cols-2 gap-3">
          {SHADOW_ITEMS.map((opt) => (
            <motion.button
              key={opt.item}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(opt.item)}
              className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary text-2xl flex items-center justify-center shadow-xs"
            >
              {opt.item}
            </motion.button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 6. DESEN TAMAMLA (PATTERN COMPLETION)
// =============================================================================
const PATTERNS_LIST = [
  { sequence: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', options: ['🔴', '🔵', '🟢', '🟡'] },
  { sequence: ['⭐️', '🌙', '⭐️', '🌙'], answer: '⭐️', options: ['⭐️', '🌙', '☀️', '☁️'] },
  { sequence: ['🔺', '🔺', '🟦', '🔺', '🔺'], answer: '🟦', options: ['🔺', '🟦', '🟢', '🟨'] },
];

export function DesenTamamlaGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = PATTERNS_LIST[index % PATTERNS_LIST.length];

  function handlePick(opt: string) {
    if (isGameOver) return;
    if (opt === current.answer) {
      kidsSound.playCorrect(isMuted);
      const nextScore = score + 25;
      setScore(nextScore);

      setTimeout(() => {
        if (index + 1 >= PATTERNS_LIST.length) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'desen_tamamla',
            score: nextScore,
            level: PATTERNS_LIST.length,
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
      title="Desen Tamamla"
      iconEmoji="🎨"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        round: index + 1,
        maxRounds: PATTERNS_LIST.length,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Desen Tamamlandı! 🏆"
      gameOverDescription="Tüm eksik desenleri başarıyla buldunuz!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        {/* Sequence strip */}
        <div className="flex items-center justify-center gap-2 p-4 rounded-3xl border border-border bg-card/80 shadow-xs flex-wrap">
          {current.sequence.map((item, i) => (
            <span key={i} className="text-3xl">{item}</span>
          ))}
          <div className="h-10 w-10 rounded-xl border-2 border-dashed border-primary bg-primary/10 text-primary flex items-center justify-center font-extrabold text-lg animate-pulse">
            ?
          </div>
        </div>

        {/* 4 Choices */}
        <div className="grid grid-cols-4 gap-2">
          {current.options.map((opt) => (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePick(opt)}
              className="h-14 rounded-2xl border border-border bg-card hover:border-primary text-2xl flex items-center justify-center shadow-xs"
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
