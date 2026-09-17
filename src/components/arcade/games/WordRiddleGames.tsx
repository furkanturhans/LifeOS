'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameShell, type Difficulty } from '../engine/GameShell';
import { useArcadeStore } from '@/stores/useArcadeStore';
import { kidsSound } from '@/lib/arcade/kidsSound';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Sparkles, HelpCircle, Volume2 } from 'lucide-react';
import { kidsSpeech } from '@/services/kidsSpeechService';

// =============================================================================
// 1. BİLMECE (RIDDLE GAME)
// =============================================================================
const RIDDLES_DATA = [
  {
    question: 'Uzaktan baktım bir taş, yanına vardım dört ayak bir baş.',
    options: ['Kaplumbağa', 'Kedi', 'Tavşan', 'Kirpi'],
    answer: 'Kaplumbağa',
    emoji: '🐢',
  },
  {
    question: 'Karnı tok, sırtı pek; gökte uçar benek benek.',
    options: ['Uçurtma', 'Kuş', 'Uçak', 'Balon'],
    answer: 'Uçurtma',
    emoji: '🪁',
  },
  {
    question: 'Benim bir kuyum var, içinde iki türlü suyum var.',
    options: ['Yumurta', 'Karpuz', 'Hindistan Cevizi', 'Portakal'],
    answer: 'Yumurta',
    emoji: '🥚',
  },
  {
    question: 'Daldan dala atlarım, kuyruğumdan sarkarım.',
    options: ['Maymun', 'Sincap', 'Kedi', 'Papağan'],
    answer: 'Maymun',
    emoji: '🐒',
  },
  {
    question: 'Gündüz kaçar, gece çıkar; ışıl ışıl parıldar.',
    options: ['Yıldız', 'Güneş', 'Fener', 'Ateşböceği'],
    answer: 'Yıldız',
    emoji: '⭐️',
  },
];

export function BilmeceGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isGameOver, setIsGameOver] = useState(false);

  const current = RIDDLES_DATA[index % RIDDLES_DATA.length];

  function handleSelect(option: string) {
    if (feedback !== 'idle' || isGameOver) return;
    setSelectedOpt(option);

    if (option === current.answer) {
      kidsSound.playCorrect(isMuted);
      setFeedback('correct');
      const roundScore = 20 + streak * 5;
      const nextScore = score + roundScore;
      setScore(nextScore);
      setStreak((s) => s + 1);

      setTimeout(() => {
        setFeedback('idle');
        setSelectedOpt(null);
        if (index + 1 >= RIDDLES_DATA.length) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'bilmece',
            score: nextScore,
            level: RIDDLES_DATA.length,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        } else {
          setIndex((i) => i + 1);
        }
      }, 900);
    } else {
      kidsSound.playWrong(isMuted);
      setFeedback('wrong');
      setStreak(0);
      setTimeout(() => {
        setFeedback('idle');
        setSelectedOpt(null);
      }, 1000);
    }
  }

  function handleRestart() {
    setIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedOpt(null);
    setFeedback('idle');
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Bilmece"
      iconEmoji="❓"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        round: index + 1,
        maxRounds: RIDDLES_DATA.length,
        streak,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Bilmeceler Tamamlandı! 🎉"
      gameOverDescription="Tüm bilmeceleri başarıyla cevapladınız!"
    >
      <div className="w-full max-w-md space-y-4">
        {/* Question card */}
        <div className="rounded-3xl border border-border bg-card/80 p-5 text-center shadow-xs relative">
          <button
            type="button"
            onClick={() => kidsSpeech.speak(current.question)}
            className="absolute right-4 top-4 flex h-8 items-center gap-1 px-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition-all"
            title="Bilmeciyi Sesli Dinle"
          >
            <Volume2 className="h-3.5 w-3.5" /> Dinle
          </button>
          <span className="text-4xl block mb-2">{current.emoji}</span>
          <p className="text-base font-bold text-foreground leading-relaxed">
            &ldquo;{current.question}&rdquo;
          </p>
        </div>

        {/* 4 Choices */}
        <div className="grid grid-cols-2 gap-3">
          {current.options.map((opt) => (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(opt)}
              disabled={feedback !== 'idle'}
              className={cn(
                'p-4 rounded-2xl border text-sm font-extrabold shadow-2xs transition-all text-center',
                selectedOpt === opt && feedback === 'correct'
                  ? 'border-emerald-500 bg-emerald-500 text-white scale-105'
                  : selectedOpt === opt && feedback === 'wrong'
                  ? 'border-rose-500 bg-rose-500 text-white animate-shake'
                  : 'border-border bg-card hover:border-primary/50 text-foreground'
              )}
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
// 2. KELİME AVI (WORD SEARCH GAME)
// =============================================================================
const WORD_SEARCH_WORDS = ['KEDİ', 'ELMA', 'KUŞ', 'BALIK', 'GÜNEŞ'];
const GRID_LETTERS = [
  ['K', 'E', 'D', 'İ', 'A', 'B'],
  ['E', 'L', 'M', 'A', 'C', 'D'],
  ['X', 'Y', 'K', 'U', 'Ş', 'E'],
  ['B', 'A', 'L', 'I', 'K', 'F'],
  ['G', 'Ü', 'N', 'E', 'Ş', 'G'],
  ['T', 'O', 'P', 'A', 'L', 'H'],
];

export function KelimeAviGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  function handleCellClick(r: number, c: number) {
    if (isGameOver) return;
    kidsSound.playFlip(isMuted);

    const already = selectedCells.find((cell) => cell.r === r && cell.c === c);
    let newSelected = already
      ? selectedCells.filter((cell) => !(cell.r === r && cell.c === c))
      : [...selectedCells, { r, c }];

    setSelectedCells(newSelected);

    // Check constructed word
    const formed = newSelected.map((cell) => GRID_LETTERS[cell.r][cell.c]).join('');
    if (WORD_SEARCH_WORDS.includes(formed) && !foundWords.includes(formed)) {
      kidsSound.playMatch(isMuted);
      const nextFound = [...foundWords, formed];
      const nextScore = score + 30;
      setFoundWords(nextFound);
      setScore(nextScore);
      setSelectedCells([]);

      if (nextFound.length >= WORD_SEARCH_WORDS.length) {
        setTimeout(() => {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'kelime_avi',
            score: nextScore,
            level: nextFound.length,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        }, 500);
      }
    }
  }

  function handleRestart() {
    setFoundWords([]);
    setSelectedCells([]);
    setScore(0);
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Kelime Avı"
      iconEmoji="🔍"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        customStatLabel: 'Bulunan',
        customStatValue: `${foundWords.length}/${WORD_SEARCH_WORDS.length}`,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Tüm Kelimeler Bulundu! 🏆"
      gameOverDescription="Harf ızgarasındaki tüm gizli kelimeleri başarıyla avladınız!"
    >
      <div className="w-full max-w-sm space-y-4">
        {/* Word Targets List */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {WORD_SEARCH_WORDS.map((w) => (
            <span
              key={w}
              className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-bold transition-all',
                foundWords.includes(w)
                  ? 'bg-emerald-500 text-white line-through opacity-80'
                  : 'bg-muted text-foreground border border-border'
              )}
            >
              {w}
            </span>
          ))}
        </div>

        {/* 6x6 Letter Grid */}
        <div className="grid grid-cols-6 gap-1.5 p-3 rounded-3xl border border-border bg-card/80 shadow-xs">
          {GRID_LETTERS.map((row, r) =>
            row.map((letter, c) => {
              const isSelected = selectedCells.some((cell) => cell.r === r && cell.c === c);
              return (
                <motion.button
                  key={`${r}-${c}`}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCellClick(r, c)}
                  className={cn(
                    'aspect-square rounded-xl flex items-center justify-center text-sm font-extrabold transition-all border',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border/60 bg-muted/40 hover:bg-muted text-foreground'
                  )}
                >
                  {letter}
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
// 3. KELİME YAP (WORD BUILDER GAME)
// =============================================================================
const WORD_MAKER_LEVELS = [
  { target: 'KİTAP', emoji: '📖', hint: 'Okumak için sayfalarını çeviririz' },
  { target: 'GÜNEŞ', emoji: '☀️', hint: 'Gökyüzündeki sıcak ışık kaynağımız' },
  { target: 'DENİZ', emoji: '🌊', hint: 'Masmavi dalgaların olduğu yer' },
  { target: 'YILDIZ', emoji: '✨', hint: 'Gece gökyüzünde parlayan minik ışıklar' },
  { target: 'ORMAN', emoji: '🌲', hint: 'Ağaçlarla ve kuşlarla dolu yeşil alan' },
];

export function KelimeYapGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [levelIdx, setLevelIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [builtLetters, setBuiltLetters] = useState<string[]>([]);
  const [poolLetters, setPoolLetters] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const current = WORD_MAKER_LEVELS[levelIdx % WORD_MAKER_LEVELS.length];

  const initLevel = useCallback((lvl: number) => {
    const item = WORD_MAKER_LEVELS[lvl % WORD_MAKER_LEVELS.length];
    const letters = item.target.split('').sort(() => 0.5 - Math.random());
    setPoolLetters(letters);
    setBuiltLetters([]);
  }, []);

  useEffect(() => {
    initLevel(0);
  }, [initLevel]);

  function handleAddLetter(letter: string, poolIdx: number) {
    kidsSound.playFlip(isMuted);
    const nextBuilt = [...builtLetters, letter];
    const nextPool = poolLetters.filter((_, i) => i !== poolIdx);
    setBuiltLetters(nextBuilt);
    setPoolLetters(nextPool);

    if (nextBuilt.join('') === current.target) {
      kidsSound.playCorrect(isMuted);
      const nextScore = score + 25;
      setScore(nextScore);

      setTimeout(() => {
        if (levelIdx + 1 >= WORD_MAKER_LEVELS.length) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'kelime_yap',
            score: nextScore,
            level: WORD_MAKER_LEVELS.length,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        } else {
          setLevelIdx((l) => {
            const nextLvl = l + 1;
            initLevel(nextLvl);
            return nextLvl;
          });
        }
      }, 700);
    }
  }

  function handleRemoveLetter(builtIdx: number) {
    kidsSound.playFlip(isMuted);
    const letter = builtLetters[builtIdx];
    setBuiltLetters((prev) => prev.filter((_, i) => i !== builtIdx));
    setPoolLetters((prev) => [...prev, letter]);
  }

  function handleRestart() {
    setLevelIdx(0);
    setScore(0);
    setIsGameOver(false);
    initLevel(0);
  }

  return (
    <GameShell
      title="Kelime Yap"
      iconEmoji="🔤"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        round: levelIdx + 1,
        maxRounds: WORD_MAKER_LEVELS.length,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Kelime Ustası! 🏆"
      gameOverDescription="Tüm kelimeleri doğru harflerle başarıyla oluşturdunuz!"
    >
      <div className="w-full max-w-sm space-y-5 text-center">
        {/* Hint Card */}
        <div className="rounded-3xl border border-border bg-card/80 p-4 shadow-xs">
          <span className="text-4xl block mb-1">{current.emoji}</span>
          <p className="text-xs text-muted-foreground font-semibold">{current.hint}</p>
        </div>

        {/* Word Building Slots */}
        <div className="flex items-center justify-center gap-2 min-h-[52px]">
          {current.target.split('').map((_, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => builtLetters[i] && handleRemoveLetter(i)}
              className={cn(
                'h-12 w-12 rounded-2xl border text-xl font-extrabold flex items-center justify-center transition-all shadow-xs',
                builtLetters[i]
                  ? 'border-primary bg-primary text-white scale-105'
                  : 'border-dashed border-border bg-muted/30 text-transparent'
              )}
            >
              {builtLetters[i] || ''}
            </motion.button>
          ))}
        </div>

        {/* Available Letter Pool */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {poolLetters.map((char, idx) => (
            <motion.button
              key={`${char}-${idx}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAddLetter(char, idx)}
              className="h-12 w-12 rounded-2xl border border-border bg-card hover:border-primary text-lg font-extrabold flex items-center justify-center shadow-xs"
            >
              {char}
            </motion.button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 4. ANAGRAM GAME
// =============================================================================
const ANAGRAM_ITEMS = [
  { scrambled: 'AYKA', answer: 'AYAK', hint: 'Yürümek için bastığımız uzvumuz' },
  { scrambled: 'ALEM', answer: 'ELMA', hint: 'Ağaçta yetişen tatlı kırmızı meyve' },
  { scrambled: 'KURA', answer: 'ARUK', alt: 'KURA', hint: 'Kelebek olmadan önce ne olur?' },
  { scrambled: 'MİGİ', answer: 'GEMİ', hint: 'Denizlerde yüzen büyük taşıt' },
  { scrambled: 'VETA', answer: 'TAVŞAN', hint: 'Hızlı koşan sevimli zıpzıp' },
];

export function AnagramGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isGameOver, setIsGameOver] = useState(false);

  const anagramList = [
    { scrambled: 'E K D İ', target: 'KEDİ', hint: 'Miyavlayan evcil dostumuz' },
    { scrambled: 'E M L A', target: 'ELMA', hint: 'Kırmızı, tatlı bir meyve' },
    { scrambled: 'P A R A', target: 'PARA', hint: 'Alışverişte ödediğimiz araç' },
    { scrambled: 'G M E İ', target: 'GEMİ', hint: 'Denizde yüzen taşıt' },
    { scrambled: 'M Y U N M A', target: 'MAYMUN', hint: 'Muz seven sevimli hayvan' },
  ];

  const current = anagramList[index % anagramList.length];

  function handleCheck() {
    if (feedback !== 'idle' || isGameOver) return;
    if (userInput.toUpperCase().trim() === current.target) {
      kidsSound.playCorrect(isMuted);
      setFeedback('correct');
      const nextScore = score + 30;
      setScore(nextScore);

      setTimeout(() => {
        setFeedback('idle');
        setUserInput('');
        if (index + 1 >= anagramList.length) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'anagram',
            score: nextScore,
            level: anagramList.length,
            timeSpentSeconds: 0,
            victory: true,
          });
          setIsGameOver(true);
        } else {
          setIndex((i) => i + 1);
        }
      }, 800);
    } else {
      kidsSound.playWrong(isMuted);
      setFeedback('wrong');
      setTimeout(() => setFeedback('idle'), 1000);
    }
  }

  function handleRestart() {
    setIndex(0);
    setScore(0);
    setUserInput('');
    setFeedback('idle');
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Anagram"
      iconEmoji="🔄"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        round: index + 1,
        maxRounds: anagramList.length,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Anagram Çözüldü! 🏆"
      gameOverDescription="Karışık harfleri başarıyla doğru kelimelere dönüştürdünüz!"
    >
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-xs">
          <span className="text-xs font-bold text-muted-foreground block mb-1">Karışık Harfler</span>
          <span className="text-2xl font-extrabold text-primary tracking-widest block mb-2">
            {current.scrambled}
          </span>
          <p className="text-xs text-muted-foreground">{current.hint}</p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value.toUpperCase())}
            placeholder="Doğru kelimeyi yazın..."
            className="w-full h-12 rounded-2xl border border-border bg-card px-4 text-center text-lg font-bold text-foreground focus:border-primary focus:outline-none"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCheck}
            disabled={!userInput.trim() || feedback !== 'idle'}
            className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-xs disabled:opacity-50"
          >
            Kontrol Et
          </motion.button>
        </div>
      </div>
    </GameShell>
  );
}

// =============================================================================
// 5. YAZIM OYUNU (SPELLING TEST GAME)
// =============================================================================
const SPELLING_ITEMS = [
  { word: 'A R _ B A', missing: 'A', options: ['A', 'E', 'O', 'U'], full: 'ARABA', emoji: '🚗' },
  { word: 'G Ü N _ Ş', missing: 'E', options: ['E', 'İ', 'A', 'Ü'], full: 'GÜNEŞ', emoji: '☀️' },
  { word: 'B _ L I K', missing: 'A', options: ['A', 'O', 'U', 'I'], full: 'BALIK', emoji: '🐟' },
  { word: 'T _ V Ş A N', missing: 'A', options: ['A', 'E', 'O', 'I'], full: 'TAVŞAN', emoji: '🐰' },
  { word: 'Y I L D _ Z', missing: 'I', options: ['I', 'İ', 'U', 'A'], full: 'YILDIZ', emoji: '🌟' },
];

export function YazimOyunuGame({ onBack }: { onBack: () => void }) {
  const { isMuted, recordGameSession } = useArcadeStore();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isGameOver, setIsGameOver] = useState(false);

  const current = SPELLING_ITEMS[index % SPELLING_ITEMS.length];

  function handlePick(letter: string) {
    if (feedback !== 'idle' || isGameOver) return;

    if (letter === current.missing) {
      kidsSound.playCorrect(isMuted);
      setFeedback('correct');
      const nextScore = score + 20;
      setScore(nextScore);

      setTimeout(() => {
        setFeedback('idle');
        if (index + 1 >= SPELLING_ITEMS.length) {
          kidsSound.playWin(isMuted);
          recordGameSession({
            gameId: 'yazim_oyunu',
            score: nextScore,
            level: SPELLING_ITEMS.length,
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
      setFeedback('wrong');
      setTimeout(() => setFeedback('idle'), 900);
    }
  }

  function handleRestart() {
    setIndex(0);
    setScore(0);
    setFeedback('idle');
    setIsGameOver(false);
  }

  return (
    <GameShell
      title="Yazım Oyunu"
      iconEmoji="✏️"
      onBack={onBack}
      onRestart={handleRestart}
      stats={{
        score,
        round: index + 1,
        maxRounds: SPELLING_ITEMS.length,
      }}
      isGameOver={isGameOver}
      gameOverTitle="Yazım Tamamlandı! 🏆"
      gameOverDescription="Eksik harflerin hepsini doğru tamamladınız!"
    >
      <div className="w-full max-w-sm space-y-5 text-center">
        <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-xs">
          <span className="text-4xl block mb-2">{current.emoji}</span>
          <span className="text-2xl font-extrabold text-foreground tracking-widest block">
            {current.word}
          </span>
          <p className="mt-2 text-xs text-muted-foreground">Eksik harfi bulunuz</p>
        </div>

        {/* 4 Choice buttons */}
        <div className="grid grid-cols-4 gap-2.5">
          {current.options.map((opt) => (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePick(opt)}
              disabled={feedback !== 'idle'}
              className="h-14 rounded-2xl border border-border bg-card hover:border-primary text-xl font-extrabold shadow-xs transition-all"
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
