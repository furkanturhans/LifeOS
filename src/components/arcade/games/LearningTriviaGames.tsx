'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GameShell } from '../engine/GameShell';
import { useArcadeStore } from '@/stores/useArcadeStore';
import { kidsSound } from '@/lib/arcade/kidsSound';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock } from 'lucide-react';

// =============================================================================
// 1. MATEMATİK HIZI (SPEED MATH)
// =============================================================================
const SPEED_MATH_QUESTIONS = [
  { question: '3 + 5 = ?', answer: 8, options: [6, 7, 8, 9] },
  { question: '9 - 4 = ?', answer: 5, options: [4, 5, 6, 3] },
  { question: '4 x 2 = ?', answer: 8, options: [6, 8, 10, 12] },
  { question: '10 + 7 = ?', answer: 17, options: [15, 16, 17, 18] },
  { question: '12 - 5 = ?', answer: 7, options: [6, 7, 8, 9] },
];

export function MatematikHiziGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = SPEED_MATH_QUESTIONS[index % SPEED_MATH_QUESTIONS.length];

  function handleAnswer(choice: number) {
    if (isGameOver) return;
    if (choice === current.answer) {
      kidsSound.playCorrect(isMuted);
      const nextScore = score + 20;
      setScore(nextScore);

      setTimeout(() => {
        if (index + 1 >= SPEED_MATH_QUESTIONS.length) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'matematik_hizi',
            score: nextScore,
            level: SPEED_MATH_QUESTIONS.length,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        } else {
          setIndex((i) => i + 1);
        }
      }, 600);
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
      title="Matematik Hızı"
      iconEmoji="➕"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        round: index + 1,
        maxRounds: SPEED_MATH_QUESTIONS.length,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Matematik Testi Tamamlandı! 🏆"
      gameOverDescription="Tüm matematik işlemlerini hızlıca çözdünüz!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-xs">
          <span className="text-3xl font-extrabold text-foreground">{current.question}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {current.options.map((opt) => (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(opt)}
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
// 2. SAAT ÖĞREN (LEARN THE CLOCK)
// =============================================================================
const CLOCK_QUESTIONS = [
  { question: 'Saat 3:00 hangisidir?', answer: '🕒', options: ['🕒', '🕕', '🕘', '🕛'] },
  { question: 'Saat 6:00 hangisidir?', answer: '🕕', options: ['🕒', '🕕', '🕘', '🕛'] },
  { question: 'Saat 9:00 hangisidir?', answer: '🕘', options: ['🕒', '🕕', '🕘', '🕛'] },
  { question: 'Saat 12:00 hangisidir?', answer: '🕛', options: ['🕒', '🕕', '🕘', '🕛'] },
];

export function SaatOgrenGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = CLOCK_QUESTIONS[index % CLOCK_QUESTIONS.length];

  function handleChoose(choice: string) {
    if (isGameOver) return;
    if (choice === current.answer) {
      kidsSound.playCorrect(isMuted);
      const nextScore = score + 25;
      setScore(nextScore);

      setTimeout(() => {
        if (index + 1 >= CLOCK_QUESTIONS.length) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'saat_ogren',
            score: nextScore,
            level: CLOCK_QUESTIONS.length,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        } else {
          setIndex((i) => i + 1);
        }
      }, 600);
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
      title="Saat Öğren"
      iconEmoji="⏰"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        round: index + 1,
        maxRounds: CLOCK_QUESTIONS.length,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Saatleri Öğrendiniz! 🏆"
      gameOverDescription="Tüm saat sorularını doğru cevapladınız!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-xs">
          <Clock className="h-10 w-10 text-primary mx-auto mb-2" />
          <p className="text-base font-bold text-foreground">{current.question}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {current.options.map((opt) => (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChoose(opt)}
              className="h-16 rounded-2xl border border-border bg-card hover:border-primary text-3xl flex items-center justify-center shadow-xs"
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
// 3. HAYVAN BİLGİSİ (ANIMAL TRIVIA)
// =============================================================================
const ANIMAL_QUESTIONS = [
  {
    question: 'En hızlı koşan kara hayvanı hangisidir?',
    answer: 'Çita',
    options: ['Çita', 'Aslan', 'Zürafa', 'Tavşan'],
    emoji: '🐆',
  },
  {
    question: 'Bambu yapraklarını çok seven siyah beyaz sevimli hayvan kimdir?',
    answer: 'Panda',
    options: ['Panda', 'Koala', 'Kutup Ayısı', 'Zebra'],
    emoji: '🐼',
  },
  {
    question: 'Denizlerde yaşayan en büyük memeli canlı hangisidir?',
    answer: 'Mavi Balina',
    options: ['Mavi Balina', 'Köpekbalığı', 'Yunus', 'Fok'],
    emoji: '🐋',
  },
  {
    question: 'Gündüzleri uyuyup geceleri uyanık olan kocaman gözlü kuş hangisidir?',
    answer: 'Baykuş',
    options: ['Baykuş', 'Kartal', 'Papağan', 'Güvercin'],
    emoji: '🦉',
  },
];

export function HayvanBilgisiGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = ANIMAL_QUESTIONS[index % ANIMAL_QUESTIONS.length];

  function handleChoose(opt: string) {
    if (isGameOver) return;
    if (opt === current.answer) {
      kidsSound.playCorrect(isMuted);
      const nextScore = score + 25;
      setScore(nextScore);

      setTimeout(() => {
        if (index + 1 >= ANIMAL_QUESTIONS.length) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'hayvan_bilgisi',
            score: nextScore,
            level: ANIMAL_QUESTIONS.length,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        } else {
          setIndex((i) => i + 1);
        }
      }, 600);
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
      title="Hayvan Bilgisi"
      iconEmoji="🐾"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        round: index + 1,
        maxRounds: ANIMAL_QUESTIONS.length,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Doğa Uzmanı! 🏆"
      gameOverDescription="Tüm hayvan sorularını başarıyla doğru bildiniz!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-xs">
          <span className="text-4xl block mb-2">{current.emoji}</span>
          <p className="text-sm font-bold text-foreground leading-relaxed">{current.question}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {current.options.map((opt) => (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChoose(opt)}
              className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary text-sm font-extrabold shadow-xs"
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
// 4. BAYRAKLAR (FLAGS QUIZ)
// =============================================================================
const FLAGS_QUESTIONS = [
  { question: 'Türkiye bayrağı hangisidir?', answer: '🇹🇷', options: ['🇹🇷', '🇩🇪', '🇯🇵', '🇫🇷'] },
  { question: 'Japonya bayrağı hangisidir?', answer: '🇯🇵', options: ['🇹🇷', '🇩🇪', '🇯🇵', '🇮🇹'] },
  { question: 'Almanya bayrağı hangisidir?', answer: '🇩🇪', options: ['🇬🇧', '🇩🇪', '🇪🇸', '🇮🇹'] },
  { question: 'Fransa bayrağı hangisidir?', answer: '🇫🇷', options: ['🇫🇷', '🇳🇱', '🇧🇪', '🇷🇺'] },
];

export function BayraklarGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = FLAGS_QUESTIONS[index % FLAGS_QUESTIONS.length];

  function handleChoose(opt: string) {
    if (isGameOver) return;
    if (opt === current.answer) {
      kidsSound.playCorrect(isMuted);
      const nextScore = score + 25;
      setScore(nextScore);

      setTimeout(() => {
        if (index + 1 >= FLAGS_QUESTIONS.length) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'bayraklar',
            score: nextScore,
            level: FLAGS_QUESTIONS.length,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        } else {
          setIndex((i) => i + 1);
        }
      }, 600);
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
      title="Bayraklar"
      iconEmoji="🚩"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        round: index + 1,
        maxRounds: FLAGS_QUESTIONS.length,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Bayraklar Testi Tamam! 🏆"
      gameOverDescription="Tüm ülke bayraklarını doğru tanıdınız!"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-xs">
          <p className="text-base font-bold text-foreground">{current.question}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {current.options.map((opt) => (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChoose(opt)}
              className="h-16 rounded-2xl border border-border bg-card hover:border-primary text-4xl flex items-center justify-center shadow-xs"
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
