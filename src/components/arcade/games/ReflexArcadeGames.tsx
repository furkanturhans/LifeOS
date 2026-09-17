'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameShell } from '../engine/GameShell';
import { useArcadeStore } from '@/stores/useArcadeStore';
import { kidsSound } from '@/lib/arcade/kidsSound';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Play, Sparkles } from 'lucide-react';

// =============================================================================
// 1. SİMON DİYOR (SIMON SAYS SEQUENCE)
// =============================================================================
const SIMON_PADS = [
  { id: 'red', color: 'bg-red-500', active: 'bg-red-300 ring-4 ring-white', freq: 440, emoji: '🔴' },
  { id: 'blue', color: 'bg-blue-500', active: 'bg-blue-300 ring-4 ring-white', freq: 554, emoji: '🔵' },
  { id: 'green', color: 'bg-emerald-500', active: 'bg-emerald-300 ring-4 ring-white', freq: 659, emoji: '🟢' },
  { id: 'yellow', color: 'bg-amber-400', active: 'bg-amber-200 ring-4 ring-white', freq: 880, emoji: '🟡' },
];

export function SimonDiyorGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [sequence, setSequence] = useState<string[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [activePad, setActivePad] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  function startNextLevel(lvl: number) {
    setIsPlaying(true);
    setUserStep(0);
    const padIds = SIMON_PADS.map((p) => p.id);
    const newSeq: string[] = [];
    for (let i = 0; i < lvl + 2; i++) {
      newSeq.push(padIds[Math.floor(Math.random() * padIds.length)]);
    }
    setSequence(newSeq);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= newSeq.length) {
        clearInterval(interval);
        setActivePad(null);
        setIsPlaying(false);
        return;
      }
      const pId = newSeq[idx];
      const pad = SIMON_PADS.find((p) => p.id === pId);
      setActivePad(pId);
      if (pad) kidsSound.playBeep(pad.freq, 200, 'sine', isMuted);

      setTimeout(() => setActivePad(null), 300);
      idx++;
    }, 600);
  }

  useEffect(() => {
    startNextLevel(1);
  }, []);

  function handlePadClick(id: string) {
    if (isPlaying || isGameOver) return;
    const pad = SIMON_PADS.find((p) => p.id === id);
    if (pad) kidsSound.playBeep(pad.freq, 150, 'sine', isMuted);
    setActivePad(id);
    setTimeout(() => setActivePad(null), 200);

    if (sequence[userStep] === id) {
      const nextStep = userStep + 1;
      setUserStep(nextStep);

      if (nextStep === sequence.length) {
        kidsSound.playCorrect(isMuted);
        const nextScore = score + level * 20;
        setScore(nextScore);

        setTimeout(() => {
          if (level >= 6) {
            kidsSound.playWin(isMuted);
            recordGameSession({
              gameId: 'simon_diyor',
              score: nextScore,
              level,
              timeSpentSeconds: 0,
              victory: true,
            });
            setIsGameOver(true);
          } else {
            setLevel((l) => {
              const nextL = l + 1;
              startNextLevel(nextL);
              return nextL;
            });
          }
        }, 700);
      }
    } else {
      kidsSound.playWrong(isMuted);
      recordGameSession({
        gameId: 'simon_diyor',
        score,
        level,
        timeSpentSeconds: 0,
        victory: false,
      });
      setIsGameOver(true);
    }
  }

  function handleRestart() {
    setLevel(1);
    setScore(0);
    setUserStep(0);
    setIsGameOver(false);
    startNextLevel(1);
  }

  return (
    <GameShell
      title="Simon Diyor"
      iconEmoji="🚦"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{ score, level }}
      isGameOver={isGameOver}
      gameOverTitle="Simon Oyunu Bitti! 🏆"
      gameOverDescription="Sıralama hafızanızla harika bir derece elde ettiniz!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        <span className="text-xs font-bold text-muted-foreground block">
          {isPlaying ? '👀 Sırayı izleyin...' : '🎯 Sıradaki renklere dokunun!'}
        </span>

        <div className="grid grid-cols-2 gap-3 p-3 rounded-3xl border border-border bg-card/80 aspect-square">
          {SIMON_PADS.map((pad) => (
            <motion.button
              key={pad.id}
              whileTap={!isPlaying ? { scale: 0.95 } : {}}
              onClick={() => handlePadClick(pad.id)}
              disabled={isPlaying}
              className={cn(
                'rounded-2xl transition-all duration-150 flex items-center justify-center text-3xl shadow-sm',
                pad.color,
                activePad === pad.id ? pad.active : 'opacity-85 hover:opacity-100'
              )}
            >
              {pad.emoji}
            </motion.button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 2. HIZLI DOKUN (FAST TAP / TARGET HIT)
// =============================================================================
export function HizliDokunGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setActiveSlot(Math.floor(Math.random() * 9));
    }, 850);
    return () => clearInterval(interval);
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'hizli_dokun',
            score,
            level: 1,
            timeSpentSeconds: 20,
            victory: true,
          });
          setIsGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, score, isMuted, recordGameSession]);

  function handleSlotClick(idx: number) {
    if (isGameOver) return;
    if (idx === activeSlot) {
      kidsSound.playCorrect(isMuted);
      setScore((s) => s + 10);
      setActiveSlot(null);
    }
  }

  function handleRestart() {
    setScore(0);
    setTimeLeft(20);
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Hızlı Dokun"
      iconEmoji="⚡️"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        customStatLabel: 'Kalan Süre',
        customStatValue: `${timeLeft}s`,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Süre Doldu! 🏆"
      gameOverDescription="Harika refleksler! Süre bitene kadar hedefleri hızlıca yakaladınız."
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-3xl border border-border bg-card/80 shadow-xs">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSlotClick(i)}
              className={cn(
                'aspect-square rounded-2xl border text-3xl flex items-center justify-center transition-all',
                activeSlot === i
                  ? 'border-amber-500 bg-amber-500/20 scale-105 animate-bounce shadow-md'
                  : 'border-border/60 bg-muted/40'
              )}
            >
              {activeSlot === i ? '⭐️' : ''}
            </motion.button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 3. BALON PATLAT (BALLOON POP)
// =============================================================================
interface Balloon {
  id: number;
  emoji: string;
  x: number;
}

export function BalonPatlatGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [poppedCount, setPoppedCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const BALLOON_EMOJIS = ['🎈', '🔴', '🔵', '🟢', '🟡', '🟣'];

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setBalloons((prev) => [
        ...prev.slice(-6),
        {
          id: Date.now() + Math.random(),
          emoji: BALLOON_EMOJIS[Math.floor(Math.random() * BALLOON_EMOJIS.length)],
          x: 10 + Math.random() * 75,
        },
      ]);
    }, 900);
    return () => clearInterval(interval);
  }, [isGameOver]);

  function handlePop(id: number) {
    if (isGameOver) return;
    kidsSound.playFlip(isMuted);
    setBalloons((prev) => prev.filter((b) => b.id !== id));
    const nextScore = score + 10;
    const nextPopped = poppedCount + 1;
    setScore(nextScore);
    setPoppedCount(nextPopped);

    if (nextPopped >= 15) {
      kidsSound.playWin(isMuted);
      recordGameSession({
        gameId: 'balon_patlat',
        score: nextScore,
        level: 1,
        timeSpentSeconds: 0,
        victory: true,
      });
      setIsGameOver(true);
    }
  }

  function handleRestart() {
    setBalloons([]);
    setScore(0);
    setPoppedCount(0);
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Balon Patlat"
      iconEmoji="🎈"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        customStatLabel: 'Patlatılan',
        customStatValue: `${poppedCount}/15`,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Balonlar Patlatıldı! 🏆"
      gameOverDescription="15 balonu başarıyla yakalayıp patlattınız!"
    >
      <div className="relative w-full max-w-xs h-72 rounded-3xl border border-border bg-card/80 shadow-xs overflow-hidden">
        {balloons.map((b) => (
          <motion.button
            key={b.id}
            initial={{ y: 260, opacity: 0 }}
            animate={{ y: -30, opacity: 1 }}
            transition={{ duration: 3.5, ease: 'linear' }}
            onAnimationComplete={() => {
              setBalloons((prev) => prev.filter((item) => item.id !== b.id));
            }}
            onClick={() => handlePop(b.id)}
            className="absolute text-4xl p-2 cursor-pointer hover:scale-125 transition-transform select-none"
            style={{ left: `${b.x}%` }}
          >
            {b.emoji}
          </motion.button>
        ))}
      </div>
    </GameShell>
  );
}

// =============================================================================
// 4. MEYVE YAKALA (FRUIT CATCH)
// =============================================================================
export function MeyveYakalaGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [basketX, setBasketX] = useState(50);
  const [fruitX, setFruitX] = useState(50);
  const [fruitY, setFruitY] = useState(0);
  const [fruitEmoji, setFruitEmoji] = useState('🍎');
  const [score, setScore] = useState(0);
  const [caught, setCaught] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const FRUITS = ['🍎', '🍌', '🍇', '🍓', '🍊'];

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setFruitY((y) => {
        if (y >= 85) {
          // Check collision with basket
          if (Math.abs(fruitX - basketX) < 25) {
            kidsSound.playCorrect(isMuted);
            setScore((s) => s + 10);
            setCaught((c) => {
              const nextC = c + 1;
              if (nextC >= 10) {
                kidsSound.playWin(isMuted);
                recordGameSession({
                  gameId: 'meyve_yakala',
                  score: score + 10,
                  level: 1,
                  timeSpentSeconds: 0,
                  victory: true,
                });
                setIsGameOver(true);
              }
              return nextC;
            });
          }
          // Reset fruit
          setFruitX(15 + Math.random() * 70);
          setFruitEmoji(FRUITS[Math.floor(Math.random() * FRUITS.length)]);
          return 0;
        }
        return y + 5;
      });
    }, 70);
    return () => clearInterval(interval);
  }, [fruitX, basketX, isGameOver, isMuted, score, caught, recordGameSession]);

  function handleRestart() {
    setBasketX(50);
    setFruitY(0);
    setScore(0);
    setCaught(0);
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Meyve Yakala"
      iconEmoji="🧺"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        customStatLabel: 'Yakalanan',
        customStatValue: `${caught}/10`,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Sepet Doldu! 🏆"
      gameOverDescription="10 lezzetli meyveyi sepete başarıyla doldurdunuz!"
    >
      <div className="w-full max-w-xs space-y-3 text-center">
        <div className="relative w-full h-64 rounded-3xl border border-border bg-card/80 shadow-xs overflow-hidden">
          {/* Falling fruit */}
          <div
            className="absolute text-3xl transition-all select-none"
            style={{ left: `${fruitX}%`, top: `${fruitY}%`, transform: 'translate(-50%, 0)' }}
          >
            {fruitEmoji}
          </div>

          {/* Basket */}
          <div
            className="absolute bottom-2 text-4xl transition-all duration-75 select-none"
            style={{ left: `${basketX}%`, transform: 'translate(-50%, 0)' }}
          >
            🧺
          </div>
        </div>

        {/* Left / Right touch controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setBasketX((x) => Math.max(15, x - 20))}
            className="h-12 w-24 rounded-2xl border border-border bg-card hover:bg-muted flex items-center justify-center font-bold"
          >
            <ArrowLeft className="h-5 w-5 mr-1" /> Sol
          </button>
          <button
            onClick={() => setBasketX((x) => Math.min(85, x + 20))}
            className="h-12 w-24 rounded-2xl border border-border bg-card hover:bg-muted flex items-center justify-center font-bold"
          >
            Sağ <ArrowRight className="h-5 w-5 ml-1" />
          </button>
        </div>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 5. RENK KOŞUSU (COLOR RUN)
// =============================================================================
export function RenkKosusuGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [playerColor, setPlayerColor] = useState('red');
  const [gateColor, setGateColor] = useState('red');
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const COLORS = [
    { id: 'red', name: 'Kırmızı', bg: 'bg-red-500' },
    { id: 'blue', name: 'Mavi', bg: 'bg-blue-500' },
    { id: 'green', name: 'Yeşil', bg: 'bg-emerald-500' },
  ];

  function handlePass() {
    if (isGameOver) return;
    if (playerColor === gateColor) {
      kidsSound.playCorrect(isMuted);
      const nextScore = score + 20;
      const nextPassed = passed + 1;
      setScore(nextScore);
      setPassed(nextPassed);

      // Change gate color
      const randColor = COLORS[Math.floor(Math.random() * COLORS.length)].id;
      setGateColor(randColor);

      if (nextPassed >= 8) {
        kidsSound.playWin(isMuted);
        recordGameSession({
          gameId: 'renk_kosusu',
          score: nextScore,
          level: 1,
          timeSpentSeconds: 0,
          victory: true,
        });
        setIsGameOver(true);
      }
    } else {
      kidsSound.playWrong(isMuted);
    }
  }

  function handleRestart() {
    setPlayerColor('red');
    setGateColor('red');
    setScore(0);
    setPassed(0);
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Renk Koşusu"
      iconEmoji="🏃‍♂️"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        customStatLabel: 'Geçilen',
        customStatValue: `${passed}/8`,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Koşu Tamamlandı! 🏆"
      gameOverDescription="Tüm renkli kapılardan doğru renkle başarıyla geçtiniz!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        {/* Gate View */}
        <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-xs flex flex-col items-center">
          <span className="text-xs font-bold text-muted-foreground mb-2">Hedef Kapı Rengi</span>
          <div
            className={cn(
              'h-16 w-36 rounded-2xl flex items-center justify-center font-extrabold text-white text-lg shadow-sm',
              COLORS.find((c) => c.id === gateColor)?.bg
            )}
          >
            KAPI
          </div>

          <span className="text-xs font-bold text-muted-foreground mt-4 mb-2">Oyuncu Renginiz</span>
          <div
            className={cn(
              'h-12 w-12 rounded-full border-2 border-white shadow-md',
              COLORS.find((c) => c.id === playerColor)?.bg
            )}
          />
        </div>

        {/* Color buttons & Pass action */}
        <div className="flex justify-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                kidsSound.playFlip(isMuted);
                setPlayerColor(c.id);
              }}
              className={cn(
                'h-11 px-3.5 rounded-xl font-bold text-xs text-white shadow-xs',
                c.bg,
                playerColor === c.id ? 'ring-4 ring-primary' : 'opacity-80'
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        <button
          onClick={handlePass}
          className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-xs"
        >
          Kapıdan Geç 🚪
        </button>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 6. BALONCUK BİRLEŞTİR (BUBBLE MERGE)
// =============================================================================
export function BaloncukBirlestirGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [bubbles, setBubbles] = useState([2, 2, 4, 4, 8, 8, 16, 2]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  function handleMerge(idx: number) {
    if (isGameOver) return;
    kidsSound.playFlip(isMuted);
    const val = bubbles[idx];
    const matchIdx = bubbles.findIndex((b, i) => b === val && i !== idx);

    if (matchIdx !== -1) {
      kidsSound.playMatch(isMuted);
      const nextBubbles = [...bubbles];
      nextBubbles[idx] = val * 2;
      nextBubbles[matchIdx] = 2; // spawn small bubble
      setBubbles(nextBubbles);
      const nextScore = score + val * 2;
      setScore(nextScore);

      if (val * 2 >= 64) {
        kidsSound.playWin(isMuted);
        recordGameSession({
          gameId: 'baloncuk_birlestir',
          score: nextScore,
          level: 1,
          timeSpentSeconds: 0,
          victory: true,
        });
        setIsGameOver(true);
      }
    }
  }

  function handleRestart() {
    setBubbles([2, 2, 4, 4, 8, 8, 16, 2]);
    setScore(0);
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Baloncuk Birleştir"
      iconEmoji="🫧"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{ score }}
      isGameOver={isGameOver}
      gameOverTitle="64 Baloncuğu Oluştu! 🏆"
      gameOverDescription="Baloncukları birleştirerek 64 sayısına ulaştınız!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        <p className="text-xs font-bold text-muted-foreground">Aynı sayıdaki baloncuklara dokunup birleştirin!</p>
        <div className="grid grid-cols-4 gap-2.5 p-4 rounded-3xl border border-border bg-card/80 shadow-xs">
          {bubbles.map((num, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleMerge(i)}
              className="aspect-square rounded-2xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xl font-extrabold flex items-center justify-center shadow-xs"
            >
              {num}
            </motion.button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 7. KULE YAP (TOWER BUILDER)
// =============================================================================
export function KuleYapGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [towerHeight, setTowerHeight] = useState(1);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  function handleDropBlock() {
    if (isGameOver) return;
    kidsSound.playFlip(isMuted);
    const nextH = towerHeight + 1;
    const nextScore = score + 20;
    setTowerHeight(nextH);
    setScore(nextScore);

    if (nextH >= 8) {
      kidsSound.playWin(isMuted);
      recordGameSession({
        gameId: 'kule_yap',
        score: nextScore,
        level: nextH,
        timeSpentSeconds: 0,
        victory: true,
      });
      setIsGameOver(true);
    }
  }

  function handleRestart() {
    setTowerHeight(1);
    setScore(0);
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Kule Yap"
      iconEmoji="🏗️"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        customStatLabel: 'Kat Sayısı',
        customStatValue: `${towerHeight}/8`,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Gökdelen Tamamlandı! 🏆"
      gameOverDescription="8 katlı muhteşem bir kule inşa ettiniz!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        <div className="h-60 rounded-3xl border border-border bg-card/80 p-4 shadow-xs flex flex-col-reverse items-center justify-start gap-1 overflow-hidden">
          {Array.from({ length: towerHeight }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="h-6 w-32 rounded-lg bg-amber-500 border border-amber-600 shadow-xs flex items-center justify-center text-[10px] text-white font-bold"
            >
              Kat {i + 1}
            </motion.div>
          ))}
        </div>

        <button
          onClick={handleDropBlock}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm shadow-xs"
        >
          Yeni Kat Ekle 🧱
        </button>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 8. MİNİ KOŞUCU (MINI RUNNER)
// =============================================================================
export function MiniKosucuGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [isJumping, setIsJumping] = useState(false);
  const [distance, setDistance] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setDistance((d) => {
        const nextD = d + 1;
        setScore(nextD * 10);
        if (nextD >= 10) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'mini_kosucu',
            score: nextD * 10,
            level: 1,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        }
        return nextD;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver, isMuted, recordGameSession]);

  function handleJump() {
    if (isJumping || isGameOver) return;
    kidsSound.playFlip(isMuted);
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 500);
  }

  function handleRestart() {
    setIsJumping(false);
    setDistance(0);
    setScore(0);
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Mini Koşucu"
      iconEmoji="🏃"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        customStatLabel: 'Mesafe',
        customStatValue: `${distance}m`,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Bitiş Çizgisine Ulaşıldı! 🏆"
      gameOverDescription="Engelleri aşarak yarışı başarıyla tamamladınız!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        <div className="relative h-48 rounded-3xl border border-border bg-card/80 p-4 shadow-xs overflow-hidden flex items-end">
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-muted border-t border-border" />

          {/* Runner */}
          <motion.div
            animate={{ y: isJumping ? -60 : 0 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-8 left-12 text-3xl select-none"
          >
            🏃
          </motion.div>

          {/* Obstacle */}
          <motion.div
            animate={{ x: [-50, 250] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute bottom-8 text-2xl select-none"
          >
            🪨
          </motion.div>
        </div>

        <button
          onClick={handleJump}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm shadow-xs"
        >
          Zıpla ⬆️
        </button>
      </div>
    </GameShell>
  );
}
