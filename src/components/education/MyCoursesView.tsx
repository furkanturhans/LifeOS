'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  Video,
  Calendar,
  Coins,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useEducationStore } from '@/stores/useEducationStore';
import { cn } from '@/lib/utils';

interface MyCoursesViewProps {
  onBackToHub: () => void;
}

export function MyCoursesView({ onBackToHub }: MyCoursesViewProps) {
  const {
    setActiveSection,
    registrations,
    liveSessions,
  } = useEducationStore();

  const [activeSubTab, setActiveSubTab] = useState<'courses' | 'live_sessions'>('courses');

  const activeRegistrations = registrations.filter((r) => r.status === 'confirmed');

  return (
    <div className="flex flex-col h-full bg-background select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/70 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToHub}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground active:scale-95"
            aria-label="Dersler Merkezine Dön"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs text-lg">
            📚
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-foreground">
                Öğrenim Merkezim
              </h1>
              <StatusBadge
                status="active"
                label={`${activeRegistrations.length} Canlı Ders`}
                size="sm"
              />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Kayıtlı olduğunuz eğitimler ve canlı ders oturumlarınız
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/20 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('courses')}
          className={cn(
            'px-3 py-1.5 rounded-xl transition-all',
            activeSubTab === 'courses'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          )}
        >
          Kurslarım (0)
        </button>
        <button
          onClick={() => setActiveSubTab('live_sessions')}
          className={cn(
            'px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5',
            activeSubTab === 'live_sessions'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          )}
        >
          <span>Kayıtlı Canlı Derslerim</span>
          {activeRegistrations.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white">
              {activeRegistrations.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full">
        {activeSubTab === 'courses' && (
          <div className="py-14 px-4 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-3xl border border-border bg-muted/40 text-3xl shadow-xs">
              🎒
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">
              Henüz Kayıtlı Bir Kursunuz Yok
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Keşfet bölümünden ilginizi çeken eğitimleri inceleyebilir, eğitmenler tarafından hazırlanan kurs ve canlı ders programlarına kaydolabilirsiniz.
            </p>

            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveSection('explore')}
                className="font-bold text-xs h-10 px-5 shadow-xs"
              >
                <Compass className="h-4 w-4 mr-1.5" />
                Kursları Keşfet
              </Button>
            </div>
          </div>
        )}

        {activeSubTab === 'live_sessions' && (
          <div className="space-y-3">
            {activeRegistrations.length > 0 ? (
              activeRegistrations.map((reg) => {
                const session = liveSessions.find((s) => s.id === reg.sessionId);
                const isLive = session?.status === 'live';

                return (
                  <Card key={reg.id} className="p-4 border-border bg-card shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg',
                          isLive ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-rose-500/10 text-rose-500'
                        )}>
                          🎥
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground truncate">
                              {reg.sessionTitle}
                            </h4>
                            {isLive ? (
                              <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white animate-pulse">
                                Canlı Yayında
                              </span>
                            ) : (
                              <StatusBadge status="active" label="Planlandı" size="sm" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Eğitmen: <strong className="text-foreground">{reg.instructorName}</strong>
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
                        {reg.creditsPaid} Kredi
                      </span>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(reg.scheduledAt).toLocaleString('tr-TR')}</span>
                      </div>

                      <Button
                        variant={isLive ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setActiveSection('live_sessions')}
                        className={cn(
                          'h-8 text-xs font-bold shadow-xs',
                          isLive ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' : 'border-border text-foreground hover:bg-muted'
                        )}
                      >
                        <Video className="h-3.5 w-3.5 mr-1" />
                        {isLive ? 'Canlı Sınıfa Gir' : 'Canlı Sınıfı Görüntüle'}
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                <div className="text-3xl">🎥</div>
                <p className="font-semibold text-foreground">Kayıtlı canlı dersiniz bulunmuyor.</p>
                <p>Canlı Dersler bölümünden ilgilendiğiniz derslere kaydolabilirsiniz.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSection('live_sessions')}
                  className="mt-2 text-xs font-bold"
                >
                  Canlı Derslere Göz At
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
