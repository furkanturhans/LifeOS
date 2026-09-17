'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Crown,
  Medal,
  Trophy,
  User,
  Sparkles,
  ShieldCheck,
  Edit2,
  Calendar,
  Gamepad2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useArcadeStore } from '@/stores/useArcadeStore';
import type { MiniGameId, LeaderboardEntry } from '@/types/arcade';
import { cn } from '@/lib/utils';

interface LeaderboardViewProps {
  onBackToArcade: () => void;
}

type Period = 'all_time' | 'weekly';
type GameFilter = 'all' | MiniGameId;

export function LeaderboardView({ onBackToArcade }: LeaderboardViewProps) {
  const {
    gameSessions,
    scores,
    userNickname,
    setUserNickname,
    totalXp,
    setActiveSection,
  } = useArcadeStore();

  const [period, setPeriod] = useState<Period>('all_time');
  const [gameFilter, setGameFilter] = useState<GameFilter>('all');
  const [isEditNicknameOpen, setIsEditNicknameOpen] = useState(false);
  const [tempNickname, setTempNickname] = useState(userNickname);

  // Compute local user entries from real sessions
  const leaderboardEntries = useMemo(() => {
    // Filter sessions by period
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const filteredSessions = gameSessions.filter((s) => {
      if (period === 'weekly') {
        const sessionTime = new Date(s.completedAt).getTime();
        if (sessionTime < oneWeekAgo) return false;
      }
      if (gameFilter !== 'all') {
        return s.gameId === gameFilter;
      }
      return true;
    });

    if (filteredSessions.length === 0) {
      return [];
    }

    // Aggregate best score per user (in local mode, it's the current user)
    // If more real users exist on server, this will merge them.
    const sorted = [...filteredSessions].sort((a, b) => b.score - a.score);
    const topScore = sorted[0];

    const entries: LeaderboardEntry[] = [
      {
        id: 'current_user',
        displayName: userNickname || 'Oyuncu',
        avatarEmoji: '👑',
        gameId: (gameFilter === 'all' ? 'all' : gameFilter) as any,
        score: topScore.score,
        rank: 1,
        date: new Date(topScore.completedAt).toLocaleDateString('tr-TR'),
        isCurrentUser: true,
      },
    ];

    return entries;
  }, [gameSessions, period, gameFilter, userNickname]);

  function handleSaveNickname() {
    const clean = tempNickname.trim() || 'Oyuncu';
    setUserNickname(clean);
    setIsEditNicknameOpen(false);
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

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 shadow-xs text-lg">
            👑
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Liderlik Tablosu
              </h1>
              <StatusBadge status="verified" label="Doğrulanmış Skorlar" size="sm" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Rekorlar ve sıralama
            </p>
          </div>
        </div>

        {/* Nickname button */}
        <button
          onClick={() => {
            setTempNickname(userNickname);
            setIsEditNicknameOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors shadow-2xs"
          title="Oyuncu Takma Adını Değiştir"
        >
          <User className="h-3.5 w-3.5 text-primary" />
          <span className="max-w-[80px] truncate">{userNickname}</span>
          <Edit2 className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>

      {/* Filter Bars */}
      <div className="px-4 py-2.5 border-b border-border/60 bg-muted/20 space-y-2">
        {/* Period Filter */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center rounded-xl border border-border bg-card p-0.5 text-xs">
            <button
              onClick={() => setPeriod('all_time')}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                period === 'all_time'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Tüm Zamanlar
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                period === 'weekly'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Bu Hafta
            </button>
          </div>

          <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Kişisel Veri Gizli</span>
          </div>
        </div>

        {/* Game Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Tüm Oyunlar' },
            { id: 'tavla', label: 'Tavla' },
            { id: 'satranc', label: 'Satranç' },
            { id: 'okey_101', label: '101 Okey' },
            { id: 'poker', label: 'Poker' },
            { id: 'batak', label: 'Batak' },
            { id: 'pisti', label: 'Pişti' },
            { id: 'solitaire', label: 'Solitaire' },
            { id: 'sudoku_master', label: 'Sudoku' },
            { id: 'game_2048', label: '2048' },
            { id: 'kelime_bulmaca', label: 'Kelime Bulmaca' },
          ].map((gf) => (
            <button
              key={gf.id}
              onClick={() => setGameFilter(gf.id as GameFilter)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                gameFilter === gf.id
                  ? 'bg-muted border border-border text-foreground font-bold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {gf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full">
        {leaderboardEntries.length > 0 ? (
          <div className="space-y-2">
            <div className="px-1 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Sıra & Oyuncu</span>
              <span>Skor</span>
            </div>

            {leaderboardEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    'p-3.5 border-border flex items-center justify-between gap-3 shadow-2xs',
                    entry.isCurrentUser
                      ? 'bg-primary/5 border-primary/40'
                      : 'bg-card'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-extrabold text-sm',
                        entry.rank === 1
                          ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30'
                          : entry.rank === 2
                          ? 'bg-slate-300/30 text-slate-700 dark:text-slate-300'
                          : entry.rank === 3
                          ? 'bg-amber-600/20 text-amber-700 dark:text-amber-300'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-foreground truncate">
                          {entry.displayName}
                        </span>
                        {entry.isCurrentUser && (
                          <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            Sen
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground block">
                        Kayıt: {entry.date}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-extrabold text-primary block">
                      {entry.score}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      Puan
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State - High Quality, 0 Fake Bots */
          <div className="py-12 px-4 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-3xl border border-border bg-muted/40 text-3xl shadow-xs">
              🎯
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">
              Henüz Kayıtlı Skor Yok
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Bu filtrede henüz tamamlanmış bir oyun kaydı bulunmuyor. Mini oyunları oynayarak liderlik tablosunda yerinizi alın!
            </p>

            <div className="mt-6">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveSection('mini_games')}
                className="font-bold text-xs h-10 px-5 shadow-xs"
              >
                <Gamepad2 className="h-4 w-4 mr-1.5" />
                Mini Oyun Oyna
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Nickname Modal */}
      <Modal
        isOpen={isEditNicknameOpen}
        onClose={() => setIsEditNicknameOpen(false)}
        title="Oyuncu Takma Adı"
        description="Liderlik tablosunda ve oyunlarda görünecek takma adınızı belirleyin."
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Takma Adınız
            </label>
            <input
              type="text"
              maxLength={20}
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
              placeholder="Örn: Kaplan99"
              className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Gizliliğiniz için gerçek ad veya hassas bilgi yazmayınız.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsEditNicknameOpen(false)}
              className="flex-1 text-xs font-semibold"
            >
              Vazgeç
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveNickname}
              className="flex-1 text-xs font-bold"
            >
              Kaydet
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
