'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Clock,
  BookOpen,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useEducationStore } from '@/stores/useEducationStore';
import { cn } from '@/lib/utils';

export function EducationHeader() {
  const { role, setRole, verifyInstructorDemo, revertToLearnerDemo } = useEducationStore();

  const roleConfigs: Record<
    string,
    { label: string; status: 'active' | 'pending' | 'verified' | 'draft'; icon: string }
  > = {
    learner: { label: 'Öğrenci', status: 'active', icon: '🎒' },
    guardian: { label: 'Veli / İzin Sahibi', status: 'verified', icon: '🛡️' },
    instructor_applicant: { label: 'Eğitmen Adayı', status: 'pending', icon: '⏳' },
    instructor_verified: { label: 'Doğrulanmış Eğitmen', status: 'verified', icon: '🎓' },
    education_moderator: { label: 'Eğitim Moderatörü', status: 'verified', icon: '⚖️' },
  };

  const currentRoleConfig = roleConfigs[role] || roleConfigs.learner;

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-card/70 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/home"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-lg shadow-2xs hover:scale-105 transition-transform"
            aria-label="Ana Ekrana Dön"
          >
            🎓
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold tracking-tight text-foreground truncate">
                Dersler & Akademi
              </h1>
              <StatusBadge
                status={currentRoleConfig.status}
                label={currentRoleConfig.label}
                size="sm"
              />
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Kurslar, canlı dersler ve sertifika merkezi
            </p>
          </div>
        </div>

        {/* Right: Demo Role Toggle Pill for easy testing */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              if (role === 'instructor_verified') {
                revertToLearnerDemo();
              } else {
                verifyInstructorDemo();
              }
            }}
            className={cn(
              'px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all shadow-2xs flex items-center gap-1',
              role === 'instructor_verified'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
                : 'bg-card border-border hover:bg-muted text-muted-foreground'
            )}
            title="Eğitmen / Öğrenci Rolü Değiştir (Geliştirici Modu)"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {role === 'instructor_verified' ? 'Eğitmen Görünümü' : 'Öğrenci Görünümü'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
