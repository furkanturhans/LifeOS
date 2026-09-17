'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Volume2,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Star,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useKidsStore } from '@/stores/useKidsStore';
import { kidsSpeech } from '@/services/kidsSpeechService';
import type { KidsStudySubject, KidsStudyLesson } from '@/types/kids';
import { cn } from '@/lib/utils';

const LESSONS: KidsStudyLesson[] = [
  {
    id: 'lesson_letters',
    subject: 'letters',
    title: 'Harfler ve Sesler',
    iconEmoji: '🔤',
    ageRange: '4-7 Yaş',
    cards: [
      { frontText: 'A', backText: 'Arı 🐝', subtext: 'A harfi ile başlar: Arı vızıldar.', iconEmoji: '🐝', audioPrompt: 'A... Arı' },
      { frontText: 'B', backText: 'Balık 🐟', subtext: 'B harfi ile başlar: Balık yüzer.', iconEmoji: '🐟', audioPrompt: 'B... Balık' },
      { frontText: 'C', backText: 'Ceviz 🌰', subtext: 'C harfi ile başlar: Ceviz sağlıklıdır.', iconEmoji: '🌰', audioPrompt: 'C... Ceviz' },
      { frontText: 'D', backText: 'Dede 👴', subtext: 'D harfi ile başlar: Dede masal anlatır.', iconEmoji: '👴', audioPrompt: 'D... Dede' },
      { frontText: 'E', backText: 'Elma 🍎', subtext: 'E harfi ile başlar: Elma kırmızı ve tatlıdır.', iconEmoji: '🍎', audioPrompt: 'E... Elma' },
      { frontText: 'K', backText: 'Kedi 🐱', subtext: 'K harfi ile başlar: Kedi miyavlar.', iconEmoji: '🐱', audioPrompt: 'K... Kedi' },
    ],
    quiz: [
      {
        question: 'Hangi meyve "E" harfi ile başlar?',
        options: ['Muz', 'Elma', 'Çilek', 'Portakal'],
        correctIndex: 1,
        explanation: 'Doğru! Elma "E" harfi ile başlar.',
      },
      {
        question: '"Balık" kelimesi hangi harfle başlar?',
        options: ['B', 'A', 'K', 'L'],
        correctIndex: 0,
        explanation: 'Harika! Balık "B" harfi ile başlar.',
      },
    ],
  },
  {
    id: 'lesson_numbers',
    subject: 'numbers',
    title: 'Sayılar ve Sayma',
    iconEmoji: '🔢',
    ageRange: '3-6 Yaş',
    cards: [
      { frontText: '1', backText: 'Bir Güneş ☀️', subtext: 'Gökyüzünde 1 tane parlak güneş var.', iconEmoji: '☀️', audioPrompt: 'Bir' },
      { frontText: '2', backText: 'İki Göz 👀', subtext: 'Etrafı görmek için 2 gözümüz var.', iconEmoji: '👀', audioPrompt: 'İki' },
      { frontText: '3', backText: 'Üçgen 🔺', subtext: 'Üçgenin tam 3 kenarı vardır.', iconEmoji: '🔺', audioPrompt: 'Üç' },
      { frontText: '4', backText: 'Dört Mevsim 🌸', subtext: 'İlkbahar, Yaz, Sonbahar, Kış: 4 Mevsim.', iconEmoji: '🌸', audioPrompt: 'Dört' },
      { frontText: '5', backText: 'Beş Parmak 🖐️', subtext: 'Bir elimizde tam 5 parmak vardır.', iconEmoji: '🖐️', audioPrompt: 'Beş' },
    ],
    quiz: [
      {
        question: 'Bir elimizde kaç parmak vardır?',
        options: ['3', '4', '5', '6'],
        correctIndex: 2,
        explanation: 'Tebrikler! Bir elimizde 5 parmak vardır.',
      },
      {
        question: 'Gökyüzünde kaç tane güneş vardır?',
        options: ['1', '2', '3', '0'],
        correctIndex: 0,
        explanation: 'Doğru! 1 tane güneş vardır.',
      },
    ],
  },
  {
    id: 'lesson_science',
    subject: 'science',
    title: 'Gezegenler ve Uzay',
    iconEmoji: '🚀',
    ageRange: '6-10 Yaş',
    cards: [
      { frontText: 'Dünya 🌍', backText: 'Bizim Evimiz', subtext: 'Üzerinde yaşadığımız mavi gezegen.', iconEmoji: '🌍', audioPrompt: 'Dünya' },
      { frontText: 'Ay 🌙', backText: 'Dünyanın Uydusu', subtext: 'Geceleri gökyüzünde parıldar.', iconEmoji: '🌙', audioPrompt: 'Ay' },
      { frontText: 'Güneş ☀️', backText: 'Dev Bir Yıldız', subtext: 'Bize ısı ve ışık veren sıcacık yıldız.', iconEmoji: '☀️', audioPrompt: 'Güneş' },
      { frontText: 'Roket 🚀', backText: 'Uzay Aracı', subtext: 'Astronotları uzaya taşıyan güçlü araç.', iconEmoji: '🚀', audioPrompt: 'Roket' },
    ],
    quiz: [
      {
        question: 'Üzerinde yaşadığımız gezegen hangisidir?',
        options: ['Mars', 'Dünya', 'Jüpiter', 'Satürn'],
        correctIndex: 1,
        explanation: 'Doğru! Biz Dünya gezegeninde yaşıyoruz.',
      },
    ],
  },
  {
    id: 'lesson_nature',
    subject: 'nature',
    title: 'Doğa ve Sevimli Canlılar',
    iconEmoji: '🌿',
    ageRange: '4-8 Yaş',
    cards: [
      { frontText: 'Ağaç 🌳', backText: 'Oksijen Kaynağı', subtext: 'Kuşlara yuva olur, havayı temizler.', iconEmoji: '🌳', audioPrompt: 'Ağaç' },
      { frontText: 'Kelebek 🦋', backText: 'Renkli Kanatlar', subtext: 'Çiçekten çiçeğe konarak neşe saçar.', iconEmoji: '🦋', audioPrompt: 'Kelebek' },
      { frontText: 'Yağmur 🌧️', backText: 'Tatlı Su', subtext: 'Bitkileri sular ve doğayı canlandırır.', iconEmoji: '🌧️', audioPrompt: 'Yağmur' },
    ],
    quiz: [
      {
        question: 'Hangisi çiçeklerden nektar toplar?',
        options: ['Kelebek', 'Ayı', 'Balık', 'Tavşan'],
        correctIndex: 0,
        explanation: 'Harika! Kelebekler ve arılar çiçeklere konar.',
      },
    ],
  },
  {
    id: 'lesson_shapes',
    subject: 'shapes',
    title: 'Renkler ve Geometri',
    iconEmoji: '🎨',
    ageRange: '3-6 Yaş',
    cards: [
      { frontText: 'Kırmızı 🔴', backText: 'Çilek Rengi', subtext: 'Kalpler ve elmalar da kırmızıdır.', iconEmoji: '🍓', audioPrompt: 'Kırmızı' },
      { frontText: 'Mavi 🔵', backText: 'Deniz ve Gökyüzü', subtext: 'Uçsuz bucaksız denizlerin rengi.', iconEmoji: '🌊', audioPrompt: 'Mavi' },
      { frontText: 'Kare ⬛', backText: 'Dört Eşit Kenar', subtext: 'Tüm kenarları birbirine eşittir.', iconEmoji: '🔲', audioPrompt: 'Kare' },
    ],
    quiz: [
      {
        question: 'Gökyüzünün ve denizin rengi nedir?',
        options: ['Kırmızı', 'Mavi', 'Yeşil', 'Sarı'],
        correctIndex: 1,
        explanation: 'Doğru! Denizler ve gökyüzü mavidir.',
      },
    ],
  },
];

export function KidsStudyView({ onBackToKids }: { onBackToKids: () => void }) {
  const { allowedSubjects, voiceSettings, isSpeaking, setIsSpeaking } = useKidsStore();
  const [activeLesson, setActiveLesson] = useState<KidsStudyLesson | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasFemaleVoice, setHasFemaleVoice] = useState(true);

  const availableLessons = LESSONS.filter((l) => allowedSubjects.includes(l.subject));

  const speakText = (text: string) => {
    kidsSpeech.speak(text, {
      settings: voiceSettings,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
      onUnavailable: () => {
        setIsSpeaking(false);
        setHasFemaleVoice(false);
      },
    });
  };

  React.useEffect(() => {
    let mounted = true;
    kidsSpeech.checkConfiguration().then((isConfigured) => {
      if (mounted) {
        setHasFemaleVoice(isConfigured);
      }
    });

    return () => {
      mounted = false;
      kidsSpeech.stop();
      setIsSpeaking(false);
    };
  }, [setIsSpeaking]);

  // Lesson interactive player
  if (activeLesson) {
    const card = activeLesson.cards[currentCardIndex];
    const quizItem = activeLesson.quiz[quizIndex];

    return (
      <div className="flex flex-col h-full bg-background select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/70 bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                setActiveLesson(null);
                setIsQuizMode(false);
              }}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <span className="text-2xl">{activeLesson.iconEmoji}</span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-foreground">
                {activeLesson.title}
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                {isQuizMode ? 'Soru Zamanı 🎯' : `Kart ${currentCardIndex + 1} / ${activeLesson.cards.length}`}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant={isQuizMode ? 'outline' : 'primary'}
            onClick={() => {
              setIsQuizMode(!isQuizMode);
              setSelectedOption(null);
            }}
            className="text-xs font-bold h-8"
          >
            {isQuizMode ? 'Kartlara Dön' : 'Mini Test 🎯'}
          </Button>
        </div>

        {/* Main lesson arena */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          {!isQuizMode ? (
            /* Flashcard view */
            <div className="w-full space-y-4">
              <motion.div
                key={currentCardIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => {
                  const nextFlip = !isFlipped;
                  setIsFlipped(nextFlip);
                  if (card.audioPrompt && voiceSettings.autoStudyAudioEnabled) {
                    speakText(card.audioPrompt);
                  }
                }}
                className={cn(
                  'aspect-[4/3] w-full rounded-3xl border-4 p-6 shadow-2xl cursor-pointer flex flex-col items-center justify-center text-center transition-all duration-300',
                  isFlipped
                    ? 'border-blue-400 bg-gradient-to-br from-blue-500/10 via-card to-blue-500/5'
                    : 'border-primary/40 bg-gradient-to-br from-primary/10 via-card to-primary/5'
                )}
              >
                <span className="text-6xl mb-3">{card.iconEmoji}</span>
                <span className="text-3xl font-extrabold text-foreground">
                  {isFlipped ? card.backText : card.frontText}
                </span>
                {isFlipped && (
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    {card.subtext}
                  </p>
                )}
                <span className="mt-4 text-[11px] font-bold text-primary/80 flex items-center gap-1">
                  <RotateCcw className="h-3.5 w-3.5" /> Dokun ve Çevir
                </span>
              </motion.div>

              {/* Pronunciation & Next/Prev Controls */}
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentCardIndex === 0}
                  onClick={() => {
                    setCurrentCardIndex((i) => i - 1);
                    setIsFlipped(false);
                  }}
                  className="font-bold text-xs flex-1 h-10"
                >
                  ◀ Önceki
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={!hasFemaleVoice}
                  onClick={() => speakText(card.audioPrompt || card.frontText)}
                  className="h-10 px-4 font-bold text-xs bg-blue-500 hover:bg-blue-600 border-none text-white shadow-xs disabled:opacity-40"
                >
                  <Volume2 className="h-4 w-4 mr-1" /> Dinle
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentCardIndex === activeLesson.cards.length - 1}
                  onClick={() => {
                    setCurrentCardIndex((i) => i + 1);
                    setIsFlipped(false);
                  }}
                  className="font-bold text-xs flex-1 h-10"
                >
                  Sonraki ▶
                </Button>
              </div>
            </div>
          ) : (
            /* Quiz view */
            <div className="w-full space-y-4">
              <Card className="p-5 border-border bg-card shadow-lg text-center space-y-3">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block">
                  Soru {quizIndex + 1}
                </span>
                <h3 className="text-base font-extrabold text-foreground">
                  {quizItem.question}
                </h3>
              </Card>

              <div className="grid grid-cols-2 gap-2">
                {quizItem.options.map((opt, idx) => {
                  const isCorrect = idx === quizItem.correctIndex;
                  const isChosen = selectedOption === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedOption(idx);
                        speakText(isCorrect ? 'Harika! Doğru cevap.' : 'Tekrar dene!');
                      }}
                      className={cn(
                        'p-4 rounded-2xl border-2 font-extrabold text-sm transition-all text-center',
                        isChosen && isCorrect
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : isChosen && !isCorrect
                          ? 'border-rose-500 bg-rose-500/20 text-rose-700 dark:text-rose-300'
                          : 'border-border bg-card hover:border-blue-400 text-foreground'
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <Card className="p-3 bg-muted/40 border-border text-center text-xs font-medium text-foreground">
                  {selectedOption === quizItem.correctIndex
                    ? quizItem.explanation
                    : 'Yanlış seçenek. Başka bir şıkkı dene!'}
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

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

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-blue-500/10 text-blue-500 shadow-xs text-lg">
            📚
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Kids Study (Öğrenme)
              </h1>
              <StatusBadge status="verified" label="Eğitici Dersler" size="sm" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Harfler, sayılar, bilim ve doğa keşfi
            </p>
          </div>
        </div>
      </div>

      {/* Lesson List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 max-w-2xl mx-auto w-full">
        {availableLessons.map((lesson, idx) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.04 }}
          >
            <Card className="p-4 border-border bg-card hover:border-blue-500/40 transition-all shadow-2xs group">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-2xl shadow-xs group-hover:scale-105 transition-transform">
                    {lesson.iconEmoji}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-blue-500 transition-colors truncate">
                        {lesson.title}
                      </h3>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {lesson.ageRange}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {lesson.cards.length} İnteraktif Kart & Quiz
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setActiveLesson(lesson);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                    setIsQuizMode(false);
                  }}
                  className="font-bold text-xs h-9 px-3.5 shrink-0 bg-blue-500 hover:bg-blue-600 border-none text-white shadow-xs"
                >
                  Ders Başlat <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
