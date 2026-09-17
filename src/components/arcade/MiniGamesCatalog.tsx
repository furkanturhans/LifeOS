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
  Dices,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KidsGameCreditsModal } from './kids/KidsGameCreditsModal';
import { useArcadeStore } from '@/stores/useArcadeStore';
import type { MiniGameMeta, MiniGameId, GameCatalogCategory } from '@/types/arcade';
import { cn } from '@/lib/utils';

// Adult Game Components
import {
  TavlaGame,
  SatrancGame,
  Okey101Game,
  PokerGame,
  BatakGame,
  PistiGame,
  SolitaireGame,
  SudokuMasterGame,
  Game2048,
  KelimeBulmacaGame,
} from './games/AdultGames';

export const MINI_GAMES_CATALOG: MiniGameMeta[] = [
  // 🎲 Masa & Taş Oyunları
  {
    id: 'tavla',
    title: 'Tavla (Backgammon)',
    subtitle: 'Klasik Türk tavlası, zar atışları ve taktiksel pul hamleleri',
    category: 'Masa & Zar Oyunu',
    catalogCategory: 'board',
    iconEmoji: '🎲',
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    isAvailable: true,
    playerCount: '1v1 Yapay Zeka',
    badge: 'Klasik',
  },
  {
    id: 'satranc',
    title: 'Satranç (Chess)',
    subtitle: '8x8 tahtada stratejik hamleler, şah ve mat kurguları',
    category: 'Strateji & Zeka',
    catalogCategory: 'board',
    iconEmoji: '♟️',
    colorClass: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
    isAvailable: true,
    playerCount: '1v1 Bot',
    badge: 'Popüler',
  },
  {
    id: 'okey_101',
    title: '101 Okey',
    subtitle: 'Istaka dizilimi, per toplamları ve 101 barajı el açma',
    category: 'Masa & Taş Oyunu',
    catalogCategory: 'board',
    iconEmoji: '🀄',
    colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    isAvailable: true,
    playerCount: '4 Kişilik Masa',
    badge: 'Yeni',
  },

  // 🃏 Klasik Kart Oyunları
  {
    id: 'poker',
    title: 'Poker (Texas Hold\'em)',
    subtitle: 'Eğlence ve strateji amaçlı kapalı devre puan simülasyonu',
    category: 'Kart Stratejisi',
    catalogCategory: 'cards',
    iconEmoji: '♠️',
    colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    isAvailable: true,
    playerCount: 'Masa Simülatörü',
    badge: 'Simülasyon',
  },
  {
    id: 'batak',
    title: 'Batak (Koz Maça)',
    subtitle: 'İhaleli koz takibi, el alma ve klasik Türk iskambil oyunu',
    category: 'İskambil & Taktik',
    catalogCategory: 'cards',
    iconEmoji: '🃏',
    colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    isAvailable: true,
    playerCount: '4 Kişilik Masa',
  },
  {
    id: 'pisti',
    title: 'Pişti',
    subtitle: 'Hızlı kart eşleştirme, pişti yakalama ve yerdeki puanları toplama',
    category: 'Geleneksel İskambil',
    catalogCategory: 'cards',
    iconEmoji: '🎴',
    colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    isAvailable: true,
    playerCount: '1v1 Masa',
  },
  {
    id: 'solitaire',
    title: 'Solitaire (Klondike)',
    subtitle: '7 sütunlu kart dizilimi, serileri tamamlama ve as temelleri',
    category: 'Klasik Sabır Oyunu',
    catalogCategory: 'cards',
    iconEmoji: '♥️',
    colorClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    isAvailable: true,
    playerCount: 'Tek Kişilik',
  },

  // 🧠 Zihin & Bulmaca & Strateji
  {
    id: 'sudoku_master',
    title: 'Sudoku Master (9x9)',
    subtitle: 'Klasik 9x9 zeka ızgarası, sayı analizi ve zihin egzersizi',
    category: 'Mantık & Rakam',
    catalogCategory: 'mind_puzzle',
    iconEmoji: '🔢',
    colorClass: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    isAvailable: true,
    badge: 'Zeka',
  },
  {
    id: 'game_2048',
    title: '2048',
    subtitle: 'Sayı bloklarını kaydırarak birleştir ve 2048 hedefine ulaş',
    category: 'Sayısal Bulmaca',
    catalogCategory: 'mind_puzzle',
    iconEmoji: '🚀',
    colorClass: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    isAvailable: true,
  },
  {
    id: 'kelime_bulmaca',
    title: 'Kelime Bulmaca',
    subtitle: '5 harfli gizli Türkçe kelimeyi 6 denemede tahmin et',
    category: 'Kelime & Akıl',
    catalogCategory: 'mind_puzzle',
    iconEmoji: '🔤',
    colorClass: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    isAvailable: true,
  },
];

const CATEGORY_TABS: { id: GameCatalogCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'Tümü (10)', icon: '🎮' },
  { id: 'board', label: 'Masa & Taş Oyunları (3)', icon: '🎲' },
  { id: 'cards', label: 'Klasik Kart Oyunları (4)', icon: '🃏' },
  { id: 'mind_puzzle', label: 'Zihin & Bulmaca (3)', icon: '🧠' },
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
      case 'tavla':
        return <TavlaGame onBack={handleCloseGame} />;
      case 'satranc':
        return <SatrancGame onBack={handleCloseGame} />;
      case 'okey_101':
        return <Okey101Game onBack={handleCloseGame} />;
      case 'poker':
        return <PokerGame onBack={handleCloseGame} />;
      case 'batak':
        return <BatakGame onBack={handleCloseGame} />;
      case 'pisti':
        return <PistiGame onBack={handleCloseGame} />;
      case 'solitaire':
        return <SolitaireGame onBack={handleCloseGame} />;
      case 'sudoku_master':
        return <SudokuMasterGame onBack={handleCloseGame} />;
      case 'game_2048':
        return <Game2048 onBack={handleCloseGame} />;
      case 'kelime_bulmaca':
        return <KelimeBulmacaGame onBack={handleCloseGame} />;
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
                Oyun Kataloğu
              </h1>
              <StatusBadge status="verified" label="10 Klasik Oyun" size="sm" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Masa, kart, strateji ve zihin oyunları
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
            placeholder="Oyunlar içinde ara..."
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
        {/* Anti-Gambling and Safety Assurance Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold block">Adil ve Güvenli Oyun Alanı</span>
              <span className="text-[11px] opacity-90 block">
                Gerçek para veya kumar içermez. Yalnızca eğlence, zeka ve rekabet odaklıdır.
              </span>
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
                          {game.badge && (
                            <span className="rounded-md bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-bold">
                              {game.badge}
                            </span>
                          )}
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
                      Oyna
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground text-xs">
              Aramanıza uygun oyun bulunamadı.
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
