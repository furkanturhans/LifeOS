'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  ShieldCheck,
  Search,
  Sparkles,
  Gamepad2,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useKidsStore } from '@/stores/useKidsStore';
import { cn } from '@/lib/utils';

// Kids Games
import { MemoryMatchGame } from '../arcade/kids/MemoryMatchGame';
import { ShapeCounterGame } from '../arcade/kids/ShapeCounterGame';
import { ColorPatternGame } from '../arcade/kids/ColorPatternGame';

import {
  BilmeceGame,
  KelimeAviGame,
  KelimeYapGame,
  AnagramGame,
  YazimOyunuGame,
} from '../arcade/games/WordRiddleGames';

import {
  CocukSudokuGame,
  MantikKareleriGame,
  SayiSekilleriGame,
  HedefSayiGame,
} from '../arcade/games/LogicPuzzleGames';

import {
  TangramGame,
  YapbozGame,
  LabirentGame,
  FarkBulGame,
  GolgeEslestirGame,
  DesenTamamlaGame,
} from '../arcade/games/VisualSpatialGames';

import {
  SimonDiyorGame,
  HizliDokunGame,
  BalonPatlatGame,
  MeyveYakalaGame,
  RenkKosusuGame,
  BaloncukBirlestirGame,
  KuleYapGame,
  MiniKosucuGame,
} from '../arcade/games/ReflexArcadeGames';

import {
  MatematikHiziGame,
  SaatOgrenGame,
  HayvanBilgisiGame,
  BayraklarGame,
} from '../arcade/games/LearningTriviaGames';

interface KidsGameItem {
  id: string;
  title: string;
  subtitle: string;
  ageRange: string;
  category: string;
  catalogCategory: 'puzzle' | 'visual' | 'reflex' | 'learning';
  iconEmoji: string;
  colorClass: string;
}

export const KIDS_GAMES_LIST: KidsGameItem[] = [
  // 🧩 Zeka & Bulmaca (7 Oyun)
  {
    id: 'bilmece',
    title: 'Bilmece',
    subtitle: 'Eğlenceli Türkçe bilmeceler ve zeka soruları',
    ageRange: '5-12 Yaş',
    category: 'Sözel Mantık',
    catalogCategory: 'puzzle',
    iconEmoji: '❓',
    colorClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'kelime_avi',
    title: 'Kelime Avı',
    subtitle: 'Harf ızgarasında gizlenmiş kelimeleri bulma',
    ageRange: '6-12 Yaş',
    category: 'Kelime & Dikkat',
    catalogCategory: 'puzzle',
    iconEmoji: '🔍',
    colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  },
  {
    id: 'kelime_yap',
    title: 'Kelime Yap',
    subtitle: 'Karışık harf bloklarını sıraya dizip kelime oluşturma',
    ageRange: '5-10 Yaş',
    category: 'Kelime Üretimi',
    catalogCategory: 'puzzle',
    iconEmoji: '🔤',
    colorClass: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
  },
  {
    id: 'anagram',
    title: 'Anagram',
    subtitle: 'Harfleri doğru sırada çözüp gizli kelimeleri bulma',
    ageRange: '6-12 Yaş',
    category: 'Harf Bulmacası',
    catalogCategory: 'puzzle',
    iconEmoji: '🔄',
    colorClass: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
  },
  {
    id: 'cocuk_sudoku',
    title: 'Çocuk Sudoku',
    subtitle: '4x4 meyveli kolay ve eğitici mini sudoku',
    ageRange: '5-10 Yaş',
    category: 'Mantık & Dizilim',
    catalogCategory: 'puzzle',
    iconEmoji: '🧩',
    colorClass: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 'mantik_kareleri',
    title: 'Mantık Kareleri',
    subtitle: 'İpuçlarını değerlendirip gizli kareleri ortaya çıkarma',
    ageRange: '6-12 Yaş',
    category: 'Mantıksal Çıkarım',
    catalogCategory: 'puzzle',
    iconEmoji: '🧠',
    colorClass: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20',
  },
  {
    id: 'sayi_sekilleri',
    title: 'Sayı Şekilleri',
    subtitle: 'Şekil adetlerini doğru sayılarla eşleştirme',
    ageRange: '4-8 Yaş',
    category: 'Sayısal Zeka',
    catalogCategory: 'puzzle',
    iconEmoji: '🔢',
    colorClass: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
  },

  // 🎨 Görsel & Şekil (8 Oyun)
  {
    id: 'memory_match',
    title: 'Hafıza Eşleştirme',
    subtitle: 'Kartları çevir, eşleşen çiftleri bul ve hafızanı güçlendir',
    ageRange: '4-8 Yaş',
    category: 'Görsel Bellek',
    catalogCategory: 'visual',
    iconEmoji: '🃏',
    colorClass: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
  },
  {
    id: 'tangram',
    title: 'Tangram',
    subtitle: 'Geometrik parçaları hedef silüete yerleştirme',
    ageRange: '5-12 Yaş',
    category: 'Geometri & Şekil',
    catalogCategory: 'visual',
    iconEmoji: '📐',
    colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'yapboz',
    title: 'Yapboz',
    subtitle: 'Kaydırmalı 3x3 parça dizme ve tamamlama',
    ageRange: '5-12 Yaş',
    category: 'Görsel Yapboz',
    catalogCategory: 'visual',
    iconEmoji: '🧩',
    colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  },
  {
    id: 'labirent',
    title: 'Labirent',
    subtitle: 'Engelleri aşıp hedefe giden doğru yolu bulma',
    ageRange: '4-10 Yaş',
    category: 'Yön & Koordinasyon',
    catalogCategory: 'visual',
    iconEmoji: '🌀',
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'fark_bul',
    title: 'Farkı Bul',
    subtitle: 'Görseller arasındaki farklı nesneyi yakalama',
    ageRange: '4-9 Yaş',
    category: 'Görsel Dikkat',
    catalogCategory: 'visual',
    iconEmoji: '👀',
    colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  },
  {
    id: 'golge_eslestir',
    title: 'Gölge Eşleştir',
    subtitle: 'Nesneleri karanlık gölge silüetleriyle eşleme',
    ageRange: '3-7 Yaş',
    category: 'Görsel Eşleme',
    catalogCategory: 'visual',
    iconEmoji: '👤',
    colorClass: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
  },
  {
    id: 'desen_tamamla',
    title: 'Desen Tamamla',
    subtitle: 'Sıradaki eksik desen parçasını seçme',
    ageRange: '4-9 Yaş',
    category: 'Desen Takibi',
    catalogCategory: 'visual',
    iconEmoji: '🎨',
    colorClass: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  },
  {
    id: 'shape_counting',
    title: 'Şekil Sayma',
    subtitle: 'Ekrandaki sevimli şekilleri say ve doğru sayıyı seç',
    ageRange: '3-7 Yaş',
    category: 'Temel Matematik',
    catalogCategory: 'visual',
    iconEmoji: '🔢',
    colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },

  // ⚡️ Hız & Refleks (8 Oyun)
  {
    id: 'simon_diyor',
    title: 'Simon Diyor',
    subtitle: 'Işık ve ses sırasını hafızada tutup tekrarlama',
    ageRange: '4-12 Yaş',
    category: 'İşitsel & Görsel Sıra',
    catalogCategory: 'reflex',
    iconEmoji: '🚦',
    colorClass: 'text-red-500 bg-red-500/10 border-red-500/20',
  },
  {
    id: 'hizli_dokun',
    title: 'Hızlı Dokun',
    subtitle: 'Beliren yıldız hedeflerine hızlıca dokunma',
    ageRange: '4-12 Yaş',
    category: 'Hız & Tepki',
    catalogCategory: 'reflex',
    iconEmoji: '⚡️',
    colorClass: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  },
  {
    id: 'balon_patlat',
    title: 'Balon Patlat',
    subtitle: 'Yükselen renkli balonları kaçırmadan patlatma',
    ageRange: '3-8 Yaş',
    category: 'Refleks & Eğlence',
    catalogCategory: 'reflex',
    iconEmoji: '🎈',
    colorClass: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
  },
  {
    id: 'meyve_yakala',
    title: 'Meyve Yakala',
    subtitle: 'Sepeti kaydırarak düşen taze meyveleri yakalama',
    ageRange: '4-10 Yaş',
    category: 'El-Göz Koordinasyonu',
    catalogCategory: 'reflex',
    iconEmoji: '🧺',
    colorClass: 'text-green-500 bg-green-500/10 border-green-500/20',
  },
  {
    id: 'renk_kosusu',
    title: 'Renk Koşusu',
    subtitle: 'Oyuncu rengini gelen kapılarla eşleştirme',
    ageRange: '5-12 Yaş',
    category: 'Renk Hızı',
    catalogCategory: 'reflex',
    iconEmoji: '🏃‍♂️',
    colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  },
  {
    id: 'baloncuk_birlestir',
    title: 'Baloncuk Birleştir',
    subtitle: 'Aynı sayıdaki baloncukları dokunarak birleştirme',
    ageRange: '5-12 Yaş',
    category: 'Sayı Birleştirme',
    catalogCategory: 'reflex',
    iconEmoji: '🫧',
    colorClass: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 'kule_yap',
    title: 'Kule Yap',
    subtitle: 'Blokları üst üste ekleyerek dev kule inşa etme',
    ageRange: '4-10 Yaş',
    category: 'Zamanlama',
    catalogCategory: 'reflex',
    iconEmoji: '🏗️',
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'mini_kosucu',
    title: 'Mini Koşucu',
    subtitle: 'Engellerin üzerinden zıplayarak koşuyu tamamlama',
    ageRange: '4-11 Yaş',
    category: 'Mini Macera',
    catalogCategory: 'reflex',
    iconEmoji: '🏃',
    colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  },

  // 📚 Öğrenme & Bilgi (7 Oyun)
  {
    id: 'matematik_hizi',
    title: 'Matematik Hızı',
    subtitle: 'Hızlı zihinsel toplama ve çıkarma zeka oyunu',
    ageRange: '6-12 Yaş',
    category: 'Pratik Matematik',
    catalogCategory: 'learning',
    iconEmoji: '➕',
    colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'hedef_sayi',
    title: 'Hedef Sayı',
    subtitle: 'Sayı kartlarını toplayarak hedef sayıya ulaşma',
    ageRange: '6-12 Yaş',
    category: 'Sayısal Strateji',
    catalogCategory: 'learning',
    iconEmoji: '🎯',
    colorClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'saat_ogren',
    title: 'Saat Öğren',
    subtitle: 'Analog saat kadranını okuma ve zamanı öğrenme',
    ageRange: '5-9 Yaş',
    category: 'Zaman Kavramı',
    catalogCategory: 'learning',
    iconEmoji: '⏰',
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'yazim_oyunu',
    title: 'Yazım Oyunu',
    subtitle: 'Eksik harfleri tamamlayarak doğru kelimeleri bulma',
    ageRange: '5-10 Yaş',
    category: 'Türkçe Yazım',
    catalogCategory: 'learning',
    iconEmoji: '✏️',
    colorClass: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
  },
  {
    id: 'hayvan_bilgisi',
    title: 'Hayvan Bilgisi',
    subtitle: 'Doğa ve sevimli hayvanlar hakkında eğlenceli bilgiler',
    ageRange: '4-12 Yaş',
    category: 'Doğa Bilgisi',
    catalogCategory: 'learning',
    iconEmoji: '🐾',
    colorClass: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  },
  {
    id: 'bayraklar',
    title: 'Bayraklar',
    subtitle: 'Ülke bayraklarını tanıma ve eğlenceli eşleştirme',
    ageRange: '6-14 Yaş',
    category: 'Genel Kültür',
    catalogCategory: 'learning',
    iconEmoji: '🚩',
    colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  },
  {
    id: 'color_pattern',
    title: 'Renk & Desen',
    subtitle: 'Renk sıralamasını ve eğlenceli desenleri takip et',
    ageRange: '4-9 Yaş',
    category: 'Mantık & Sıralama',
    catalogCategory: 'learning',
    iconEmoji: '🎨',
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'Tümü (30)', icon: '🎮' },
  { id: 'puzzle', label: 'Zeka (7)', icon: '🧩' },
  { id: 'visual', label: 'Görsel (8)', icon: '🎨' },
  { id: 'reflex', label: 'Refleks (8)', icon: '⚡️' },
  { id: 'learning', label: 'Öğrenme (7)', icon: '📚' },
];

export function KidsMiniGamesView({ onBackToKids }: { onBackToKids: () => void }) {
  const { soundEnabled, toggleSound } = useKidsStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const filteredGames = useMemo(() => {
    return KIDS_GAMES_LIST.filter((game) => {
      const matchCat = selectedCategory === 'all' || game.catalogCategory === selectedCategory;
      const matchQuery =
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Active game player
  if (activeGameId) {
    const handleClose = () => setActiveGameId(null);

    switch (activeGameId) {
      case 'memory_match':
        return <MemoryMatchGame onBack={handleClose} />;
      case 'shape_counting':
        return <ShapeCounterGame onBack={handleClose} />;
      case 'color_pattern':
        return <ColorPatternGame onBack={handleClose} />;
      case 'bilmece':
        return <BilmeceGame onBack={handleClose} />;
      case 'kelime_avi':
        return <KelimeAviGame onBack={handleClose} />;
      case 'kelime_yap':
        return <KelimeYapGame onBack={handleClose} />;
      case 'anagram':
        return <AnagramGame onBack={handleClose} />;
      case 'cocuk_sudoku':
        return <CocukSudokuGame onBack={handleClose} />;
      case 'mantik_kareleri':
        return <MantikKareleriGame onBack={handleClose} />;
      case 'sayi_sekilleri':
        return <SayiSekilleriGame onBack={handleClose} />;
      case 'tangram':
        return <TangramGame onBack={handleClose} />;
      case 'yapboz':
        return <YapbozGame onBack={handleClose} />;
      case 'labirent':
        return <LabirentGame onBack={handleClose} />;
      case 'fark_bul':
        return <FarkBulGame onBack={handleClose} />;
      case 'golge_eslestir':
        return <GolgeEslestirGame onBack={handleClose} />;
      case 'desen_tamamla':
        return <DesenTamamlaGame onBack={handleClose} />;
      case 'simon_diyor':
        return <SimonDiyorGame onBack={handleClose} />;
      case 'hizli_dokun':
        return <HizliDokunGame onBack={handleClose} />;
      case 'balon_patlat':
        return <BalonPatlatGame onBack={handleClose} />;
      case 'meyve_yakala':
        return <MeyveYakalaGame onBack={handleClose} />;
      case 'renk_kosusu':
        return <RenkKosusuGame onBack={handleClose} />;
      case 'baloncuk_birlestir':
        return <BaloncukBirlestirGame onBack={handleClose} />;
      case 'kule_yap':
        return <KuleYapGame onBack={handleClose} />;
      case 'mini_kosucu':
        return <MiniKosucuGame onBack={handleClose} />;
      case 'matematik_hizi':
        return <MatematikHiziGame onBack={handleClose} />;
      case 'hedef_sayi':
        return <HedefSayiGame onBack={handleClose} />;
      case 'saat_ogren':
        return <SaatOgrenGame onBack={handleClose} />;
      case 'yazim_oyunu':
        return <YazimOyunuGame onBack={handleClose} />;
      case 'hayvan_bilgisi':
        return <HayvanBilgisiGame onBack={handleClose} />;
      case 'bayraklar':
        return <BayraklarGame onBack={handleClose} />;
      default:
        break;
    }
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

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-pink-500/10 text-pink-500 shadow-xs text-lg">
            🎮
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Çocuk Mini Oyunları
              </h1>
              <StatusBadge status="verified" label="30 Eğitici Oyun" size="sm" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Reklamsız, güvenli ve zeka geliştirici oyunlar
            </p>
          </div>
        </div>

        <button
          onClick={toggleSound}
          className="h-8 w-8 rounded-xl border border-border/80 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>

      {/* Filter bar */}
      <div className="px-4 py-2.5 border-b border-border/60 bg-muted/20 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Oyun ara..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 shrink-0',
                selectedCategory === tab.id
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Games List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 max-w-2xl mx-auto w-full">
        {filteredGames.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
          >
            <Card className="p-3.5 sm:p-4 border-border bg-card hover:border-pink-500/40 transition-all shadow-2xs group">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={cn(
                      'flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl shadow-xs transition-transform group-hover:scale-105',
                      game.colorClass
                    )}
                  >
                    {game.iconEmoji}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-pink-500 transition-colors truncate">
                        {game.title}
                      </h3>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {game.ageRange}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-snug line-clamp-1">
                      {game.subtitle}
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveGameId(game.id)}
                  className="font-bold text-xs h-9 px-3.5 shrink-0 bg-pink-500 hover:bg-pink-600 border-none text-white shadow-xs"
                >
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Oyna
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
