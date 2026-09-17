'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Heart,
  Bookmark,
  Square,
  Play,
  AudioLines,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useKidsStore } from '@/stores/useKidsStore';
import { kidsSpeech } from '@/services/kidsSpeechService';
import type { KidsStoryItem } from '@/types/kids';
import { cn } from '@/lib/utils';

const STORIES: KidsStoryItem[] = [
  {
    id: 'story_1',
    title: 'Cesur Tavşancık ve Parlak Yıldız',
    category: 'Uyku Masalı',
    ageRange: '3-7 Yaş',
    coverEmoji: '🐰',
    summary: 'Ormanın en sevimli tavşanının gökyüzündeki kayan yıldızla kurduğu sıcacık dostluk masalı.',
    pages: [
      {
        pageNumber: 1,
        illustrationEmoji: '🌲🐰🌙',
        textTr: 'Bir varmış bir yokmuş... Yemyeşil ulu çam ağaçlarının arasında Pırpır adında meraklı bir tavşancık yaşarmış.',
        narrationAudio: 'Bir varmış bir yokmuş... Yemyeşil ulu çam ağaçlarının arasında Pırpır adında meraklı bir tavşancık yaşarmış.',
      },
      {
        pageNumber: 2,
        illustrationEmoji: '✨⭐👀',
        textTr: 'Bir gece gökyüzüne bakarken parıl parıl parlayan minik bir yıldızın ona göz kırptığını fark etmiş.',
        narrationAudio: 'Bir gece gökyüzüne bakarken parıl parıl parlayan minik bir yıldızın ona göz kırptığını fark etmiş.',
      },
      {
        pageNumber: 3,
        illustrationEmoji: '🌸🐰💤',
        textTr: 'Yıldız ona tatlı rüyalar fısıldamış. Pırpır sıcacık yuvasında huzurla gözlerini kapatıp mışıl mışıl uyumuş.',
        narrationAudio: 'Yıldız ona tatlı rüyalar fısıldamış. Pırpır sıcacık yuvasında huzurla gözlerini kapatıp mışıl mışıl uyumuş.',
      },
    ],
  },
  {
    id: 'story_2',
    title: 'Mavi Ejderha ve Renkli Resimler',
    category: 'Yaratıcılık Masalı',
    ageRange: '4-9 Yaş',
    coverEmoji: '🐲',
    summary: 'Ateş püskürtmek yerine rengarenk gökkuşakları çizen sanatçı mavi ejderhanın hikayesi.',
    pages: [
      {
        pageNumber: 1,
        illustrationEmoji: '🎨🐲⛰️',
        textTr: 'Yüksek dağların ardında yaşayan Maviş, diğer ejderhalar gibi değildi. O resim yapmayı çok severdi.',
        narrationAudio: 'Yüksek dağların ardında yaşayan Maviş, diğer ejderhalar gibi değildi. O resim yapmayı çok severdi.',
      },
      {
        pageNumber: 2,
        illustrationEmoji: '🌈🖌️☁️',
        textTr: 'Nefesiyle gökyüzüne üflediğinde havada harika gökkuşakları ve renkli kelebekler oluşurdu.',
        narrationAudio: 'Nefesiyle gökyüzüne üflediğinde havada harika gökkuşakları ve renkli kelebekler oluşurdu.',
      },
      {
        pageNumber: 3,
        illustrationEmoji: '👑🎉🥳',
        textTr: 'Bütün kasaba halkı gökyüzündeki bu muhteşem sanat festivalini neşeyle kutladı.',
        narrationAudio: 'Bütün kasaba halkı gökyüzündeki bu muhteşem sanat festivalini neşeyle kutladı.',
      },
    ],
  },
  {
    id: 'story_3',
    title: 'Dalgıç Kaplumbağa Tonton',
    category: 'Doğa & Keşif',
    ageRange: '5-10 Yaş',
    coverEmoji: '🐢',
    summary: 'Denizlerin derinliklerindeki mercan kayalıklarını keşfe çıkan sevimli deniz kaplumbağası.',
    pages: [
      {
        pageNumber: 1,
        illustrationEmoji: '🌊🐢🐠',
        textTr: 'Tonton, masmavi okyanusun en bilge deniz kaplumbağasıydı. Her gün yeni sualtı arkadaşlarıyla tanışırdı.',
        narrationAudio: 'Tonton, masmavi okyanusun en bilge deniz kaplumbağasıydı. Her gün yeni sualtı arkadaşlarıyla tanışırdı.',
      },
      {
        pageNumber: 2,
        illustrationEmoji: '🐬🪸🐚',
        textTr: 'Bir gün yunus dostuyla birlikte parıldayan dev bir sedef kabuğu buldular.',
        narrationAudio: 'Bir gün yunus dostuyla birlikte parıldayan dev bir sedef kabuğu buldular.',
      },
      {
        pageNumber: 3,
        illustrationEmoji: '🌟💙🌊',
        textTr: 'Okyanusu temiz tutmanın ve deniz canlılarını korumanın önemini tüm dostlarına anlattılar.',
        narrationAudio: 'Okyanusu temiz tutmanın ve deniz canlılarını korumanın önemini tüm dostlarına anlattılar.',
      },
    ],
  },
];

export function KidsStoriesView({ onBackToKids }: { onBackToKids: () => void }) {
  const { voiceSettings, isSpeaking, setIsSpeaking } = useKidsStore();
  const [activeStory, setActiveStory] = useState<KidsStoryItem | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [hasFemaleVoice, setHasFemaleVoice] = useState(true);

  useEffect(() => {
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

  const speakCurrentPage = (text: string) => {
    if (isSpeaking) {
      kidsSpeech.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
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

  // Auto-play narration on page load if enabled in voiceSettings
  useEffect(() => {
    if (activeStory && voiceSettings.storyNarrationEnabled && voiceSettings.isVoiceEnabled !== false) {
      const currentPage = activeStory.pages[pageIndex];
      if (currentPage) {
        kidsSpeech.speak(currentPage.narrationAudio || currentPage.textTr, {
          settings: voiceSettings,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
          onUnavailable: () => {
            setIsSpeaking(false);
            setHasFemaleVoice(false);
          },
        });
      }
    } else {
      kidsSpeech.stop();
      setIsSpeaking(false);
    }
  }, [activeStory, pageIndex, voiceSettings, setIsSpeaking]);

  // Story Reader
  if (activeStory) {
    const page = activeStory.pages[pageIndex];

    return (
      <div className="flex flex-col h-full bg-background select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/70 bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                kidsSpeech.stop();
                setIsSpeaking(false);
                setActiveStory(null);
              }}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <span className="text-2xl">{activeStory.coverEmoji}</span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-foreground">
                {activeStory.title}
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                Sayfa {pageIndex + 1} / {activeStory.pages.length}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant={isSpeaking ? 'destructive' : 'primary'}
            disabled={!hasFemaleVoice}
            onClick={() => speakCurrentPage(page.narrationAudio || page.textTr)}
            className="text-xs font-bold h-8 px-3 bg-amber-500 hover:bg-amber-600 border-none text-white shadow-xs disabled:opacity-40"
          >
            {isSpeaking ? (
              <>
                <Square className="h-3.5 w-3.5 mr-1" /> Durdur
              </>
            ) : (
              <>
                <Volume2 className="h-3.5 w-3.5 mr-1" /> Sesli Oku
              </>
            )}
          </Button>
        </div>

        {/* Reader Arena */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <motion.div
            key={pageIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full rounded-3xl border-4 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-amber-500/5 p-6 shadow-2xl flex flex-col items-center text-center space-y-5 relative overflow-hidden"
          >
            {/* Live Narration Indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/30 animate-pulse">
                <AudioLines className="h-3.5 w-3.5" />
                <span>🌸 Kadın Anlatıcı Seslendiriyor...</span>
              </div>
            )}

            <span className="text-6xl my-4 tracking-widest">{page.illustrationEmoji}</span>

            <p className="text-base font-semibold text-foreground leading-relaxed">
              {page.textTr}
            </p>

            <div className="pt-4 flex items-center justify-between w-full border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex === 0}
                onClick={() => {
                  kidsSpeech.stop();
                  setIsSpeaking(false);
                  setPageIndex((p) => p - 1);
                }}
                className="font-bold text-xs"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Önceki Sayfa
              </Button>

              <span className="text-xs font-bold text-muted-foreground">
                {pageIndex + 1} / {activeStory.pages.length}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex === activeStory.pages.length - 1}
                onClick={() => {
                  kidsSpeech.stop();
                  setIsSpeaking(false);
                  setPageIndex((p) => p + 1);
                }}
                className="font-bold text-xs"
              >
                Sonraki Sayfa <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
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

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-amber-500/10 text-amber-500 shadow-xs text-lg">
            📖
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Masallar & Hikâyeler
              </h1>
              <StatusBadge status="verified" label="Doğal Anlatıcı" size="sm" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Resimli ve sıcak kadın sesli çocuk masalları
            </p>
          </div>
        </div>
      </div>

      {/* Stories List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 max-w-2xl mx-auto w-full">
        {STORIES.map((story, idx) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.04 }}
          >
            <Card className="p-4 border-border bg-card hover:border-amber-500/40 transition-all shadow-2xs group">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-3xl shadow-xs group-hover:scale-105 transition-transform">
                    {story.coverEmoji}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-amber-500 transition-colors truncate">
                        {story.title}
                      </h3>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {story.ageRange}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-snug line-clamp-1">
                      {story.summary}
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setActiveStory(story);
                    setPageIndex(0);
                  }}
                  className="font-bold text-xs h-9 px-3.5 shrink-0 bg-amber-500 hover:bg-amber-600 border-none text-white shadow-xs"
                >
                  Oku <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
