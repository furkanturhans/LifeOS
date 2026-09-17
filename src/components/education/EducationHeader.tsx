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
  ArrowRight,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useEducationStore } from '@/stores/useEducationStore';
import { cn } from '@/lib/utils';

export function EducationHeader() {
  const { role, setActiveSection, fetchInstructorStatus } = useEducationStore();

  const isInstructor = role === 'instructor_verified';
  const isApplicant = role === 'instructor_applicant';

  const handleInstructorPanelClick = () => {
    fetchInstructorStatus();
    setActiveSection('instructor_hub');
  };

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
              <span className="hidden xs:inline-block">
                <StatusBadge
                  status="active"
                  label="Öğrenci Merkezi"
                  size="sm"
                />
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Kurslar, canlı dersler, sınavlar ve akademi stüdyosu
            </p>
          </div>
        </div>

        {/* Right: Clean Instructor Panel Entry Point (No manual role switchers) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstructorPanelClick}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-2xs flex items-center gap-1.5',
              isInstructor
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                : isApplicant
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
                : 'bg-card border-border hover:bg-muted text-foreground'
            )}
            title="Eğitmen Paneli & Stüdyo Girişi"
          >
            <GraduationCap className={cn('h-4 w-4', isInstructor ? 'text-amber-500' : 'text-primary')} />
            <span>
              {isInstructor
                ? 'Eğitmen Paneli'
                : isApplicant
                ? 'Başvuru İnceleniyor'
                : 'Eğitmen Ol'}
            </span>
            <ArrowRight className="h-3 w-3 opacity-60" />
          </button>
        </div>
      </div>
    </header>
  );
}
