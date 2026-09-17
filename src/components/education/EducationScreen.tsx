'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { EducationHeader } from './EducationHeader';
import { EducationFeaturesGrid } from './EducationFeaturesGrid';
import { ExploreView } from './ExploreView';
import { MyCoursesView } from './MyCoursesView';
import { LiveSessionsView } from './LiveSessionsView';
import { MyExamsView } from './MyExamsView';
import { InstructorHubView } from './InstructorHubView';
import { Dock } from '@/components/os/Dock';
import { useEducationStore } from '@/stores/useEducationStore';

export function EducationScreen() {
  const { activeSection, setActiveSection } = useEducationStore();

  // Active View Routing
  if (activeSection === 'explore') {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex-1 overflow-hidden">
          <ExploreView onBackToHub={() => setActiveSection(null)} />
        </div>
        <Dock />
      </div>
    );
  }

  if (activeSection === 'my_courses') {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex-1 overflow-hidden">
          <MyCoursesView onBackToHub={() => setActiveSection(null)} />
        </div>
        <Dock />
      </div>
    );
  }

  if (activeSection === 'live_sessions') {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex-1 overflow-hidden">
          <LiveSessionsView onBackToHub={() => setActiveSection(null)} />
        </div>
        <Dock />
      </div>
    );
  }

  if (activeSection === 'my_exams') {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex-1 overflow-hidden">
          <MyExamsView onBackToHub={() => setActiveSection(null)} />
        </div>
        <Dock />
      </div>
    );
  }

  if (activeSection === 'instructor_hub') {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex-1 overflow-hidden">
          <InstructorHubView onBackToHub={() => setActiveSection(null)} />
        </div>
        <Dock />
      </div>
    );
  }

  // Dersler Ana Ekranı (Temiz 5 Giriş Kartı, açık liste yok)
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Header */}
      <EducationHeader />

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mt-4 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>LifeOS Akademi Merkezi</span>
              </div>
              <h2 className="mt-1 text-base font-bold text-foreground">
                Gelişim, Eğitim ve Canlı Dersler
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Her yaş grubuna uygun kurslar, 70 kişilik interaktif canlı dersler, sınavlar ve eğitmenlik stüdyosu.
              </p>
            </div>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-2xl shadow-sm">
              🎓
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-border/40">
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
              <span>Doğrulanmış Eğitmenler</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>Sertifikasyon & Sınavlar</span>
            </div>
          </div>
        </motion.div>

        {/* 5 Clean Features Grid */}
        <EducationFeaturesGrid onSectionClick={(sectionId) => setActiveSection(sectionId)} />

        {/* Bottom spacer */}
        <div className="h-6" />
      </div>

      {/* Dock */}
      <Dock />
    </div>
  );
}
