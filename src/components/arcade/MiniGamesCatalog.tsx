'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  ShieldCheck,
  Info,
  Play,
  Search,
  Sparkles,
  Gamepad2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KidsGameCreditsModal } from './kids/KidsGameCreditsModal';
import { useArcadeStore } from '@/stores/useArcadeStore';
import type { MiniGameMeta, MiniGameId, GameCatalogCategory } from '@/types/arcade';
import { cn } from '@/lib/utils';

// Original 3 Games
import { MemoryMatchGame } from './kids/MemoryMatchGame';
import { ShapeCounterGame } from './kids/ShapeCounterGame';
import { ColorPatternGame } from './kids/ColorPatternGame';

// New Game Suites
import {
  BilmeceGame,
  KelimeAviGame,
  KelimeYapGame,
  AnagramGame,
  YazimOyunuGame,
} from './games/WordRiddleGames';

import {
  CocukSudokuGame,
  MantikKareleriGame,
  SayiSekilleriGame,
  HedefSayiGame,
} from './games/LogicPuzzleGames';

import {
  TangramGame,
  YapbozGame,
  LabirentGame,
  FarkBulGame,
  GolgeEslestirGame,
  DesenTamamlaGame,
} from './games/VisualSpatialGames';

import {
  SimonDiyorGame,
  HizliDokunGame,
  BalonPatlatGame,
  MeyveYakalaGame,
  RenkKosusuGame,
  BaloncukBirlestirGame,
  KuleYapGame,
  MiniKosucuGame,
} from './games/ReflexArcadeGames';

import {
  MatematikHiziGame,
  SaatOgrenGame,
  HayvanBilgisiGame,
  BayraklarGame,
} from './games/LearningTriviaGames';

export const MINI_GAMES_CATALOG: MiniGameMeta[] = [
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
  },
];

const CATEGORY_TABS: { id: GameCatalogCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'Tümü (30)', icon: '🎮' },
  { id: 'puzzle', label: 'Zeka & Bulmaca (7)', icon: '🧩' },
  { id: 'visual', label: 'Görsel & Şekil (8)', icon: '🎨' },
  { id: 'reflex', label: 'Hız & Refleks (8)', icon: '⚡️' },
  { id: 'learning', label: 'Öğrenme & Bilgi (7)', icon: '📚' },
];

interface MiniGamesCatalogProps {
  onBackToArcade: () => void;
}

export function MiniGamesCatalog({ onBackToArcade }: MiniGamesCatalogProps) {
  const { isMuted, toggleMute, activeGameId, setActiveGameId } = useArcadeStore();
  const [selectedCategory, setSelectedCategory] = useState<GameCatalogCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  // Filtered games
  const filteredGames = useMemo(() => {
    return MINI_GAMES_CATALOG.filter((game) => {
      const matchCategory =
        selectedCategory === 'all' || game.catalogCategory === selectedCategory;
      const matchSearch =
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Active game router
  if (activeGameId) {
    const handleCloseGame = () => setActiveGameId(null);

    switch (activeGameId) {
      // Original 3
      case 'memory_match':
        return <MemoryMatchGame onBack={handleCloseGame} />;
      case 'shape_counting':
        return <ShapeCounterGame onBack={handleCloseGame} />;
      case 'color_pattern':
        return <ColorPatternGame onBack={handleCloseGame} />;

      // 🧩 Zeka & Bulmaca
      case 'bilmece':
        return <BilmeceGame onBack={handleCloseGame} />;
      case 'kelime_avi':
        return <KelimeAviGame onBack={handleCloseGame} />;
      case 'kelime_yap':
        return <KelimeYapGame onBack={handleCloseGame} />;
      case 'anagram':
        return <AnagramGame onBack={handleCloseGame} />;
      case 'cocuk_sudoku':
        return <CocukSudokuGame onBack={handleCloseGame} />;
      case 'mantik_kareleri':
        return <MantikKareleriGame onBack={handleCloseGame} />;
      case 'sayi_sekilleri':
        return <SayiSekilleriGame onBack={handleCloseGame} />;

      // 🎨 Görsel & Şekil
      case 'tangram':
        return <TangramGame onBack={handleCloseGame} />;
      case 'yapboz':
        return <YapbozGame onBack={handleCloseGame} />;
      case 'labirent':
        return <LabirentGame onBack={handleCloseGame} />;
      case 'fark_bul':
        return <FarkBulGame onBack={handleCloseGame} />;
      case 'golge_eslestir':
        return <GolgeEslestirGame onBack={handleCloseGame} />;
      case 'desen_tamamla':
        return <DesenTamamlaGame onBack={handleCloseGame} />;

      // ⚡️ Hız & Refleks
      case 'simon_diyor':
        return <SimonDiyorGame onBack={handleCloseGame} />;
      case 'hizli_dokun':
        return <HizliDokunGame onBack={handleCloseGame} />;
      case 'balon_patlat':
        return <BalonPatlatGame onBack={handleCloseGame} />;
      case 'meyve_yakala':
        return <MeyveYakalaGame onBack={handleCloseGame} />;
      case 'renk_kosusu':
        return <RenkKosusuGame onBack={handleCloseGame} />;
      case 'baloncuk_birlestir':
        return <BaloncukBirlestirGame onBack={handleCloseGame} />;
      case 'kule_yap':
        return <KuleYapGame onBack={handleCloseGame} />;
      case 'mini_kosucu':
        return <MiniKosucuGame onBack={handleCloseGame} />;

      // 📚 Öğrenme & Bilgi
      case 'matematik_hizi':
        return <MatematikHiziGame onBack={handleCloseGame} />;
      case 'hedef_sayi':
        return <HedefSayiGame onBack={handleCloseGame} />;
      case 'saat_ogren':
        return <SaatOgrenGame onBack={handleCloseGame} />;
      case 'yazim_oyunu':
        return <YazimOyunuGame onBack={handleCloseGame} />;
      case 'hayvan_bilgisi':
        return <HayvanBilgisiGame onBack={handleCloseGame} />;
      case 'bayraklar':
        return <BayraklarGame onBack={handleCloseGame} />;

      default:
        break;
    }
  }

  return (
    <div className="flex flex-col h-full bg-background select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/70 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToArcade}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
            aria-label="Arcade'e Dön"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-primary/10 text-primary shadow-xs text-lg">
            🎮
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Mini Oyunlar
              </h1>
              <StatusBadge status="verified" label="30 Oyun Hazır" size="sm" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Hızlı, temiz ve zeka geliştirici mini oyun kataloğu
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleMute}
            className="h-8 w-8 rounded-xl border border-border/80 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-primary" />}
          </button>

          <button
            onClick={() => setIsCreditsOpen(true)}
            className="h-8 w-8 rounded-xl border border-border/80 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Oyun Lisansı & Bilgi"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="px-4 py-2.5 border-b border-border/60 bg-muted/20 space-y-2">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="30 mini oyun içinde ara..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 shrink-0',
                selectedCategory === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full">
        {/* Child Safety Shield Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold block">Güvenli & Reklamsız Deneyim</span>
              <span className="text-[11px] opacity-90 block">Reklam, harici takip kodu veya uygulama içi satın alma bulunmaz.</span>
            </div>
          </div>
          <button
            onClick={() => setIsCreditsOpen(true)}
            className="text-[11px] font-bold underline hover:opacity-80 shrink-0"
          >
            Bilgi
          </button>
        </div>

        {/* Game Cards List */}
        <div className="space-y-3 pt-1">
          {filteredGames.length > 0 ? (
            filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <Card className="p-3.5 sm:p-4 border-border bg-card hover:border-primary/40 transition-all shadow-2xs group">
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
                          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {game.title}
                          </h3>
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                            {game.ageRange}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
                            • {game.category}
                          </span>
                        </div>

                        <p className="mt-0.5 text-xs text-muted-foreground leading-snug line-clamp-1 sm:line-clamp-2">
                          {game.subtitle}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveGameId(game.id)}
                      className="font-bold text-xs h-9 px-3.5 shrink-0 shadow-xs"
                    >
                      <Play className="h-3.5 w-3.5 mr-1" />
                      Başla
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground text-xs">
              Aramanıza uygun mini oyun bulunamadı.
            </div>
          )}
        </div>
      </div>

      {/* Credits & Open Source Modal */}
      <KidsGameCreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
      />
    </div>
  );
}
