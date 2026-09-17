'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  BookOpen,
  Video,
  FileCheck,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useEducationStore } from '@/stores/useEducationStore';
import type { EducationSectionKey } from '@/types/education';

export interface EducationSectionConfig {
  id: EducationSectionKey;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentBg: string;
  isAvailable: boolean;
  statusLabel?: string;
  statusType?: 'active' | 'pending' | 'verified' | 'draft';
}

interface EducationFeaturesGridProps {
  onSectionClick: (sectionKey: EducationSectionKey) => void;
}

export function EducationFeaturesGrid({ onSectionClick }: EducationFeaturesGridProps) {
  const { role } = useEducationStore();

  const isInstructor = role === 'instructor_verified';
  const isApplicant = role === 'instructor_applicant';

  const SECTIONS: EducationSectionConfig[] = [
    {
      id: 'explore',
      title: 'Keşfet',
      description: 'Yaş grubuna ve ilgi alanına göre kursları ve eğitim içeriklerini inceleyin',
      icon: <Compass className="h-5 w-5 text-blue-500" />,
      accentBg: 'bg-blue-500/10 text-blue-500',
      isAvailable: true,
      statusLabel: 'Katalog',
      statusType: 'active',
    },
    {
      id: 'my_courses',
      title: 'Kurslarım',
      description: 'Kayıtlı olduğunuz eğitimler, ders ilerlemeleri ve tamamlanan içerikler',
      icon: <BookOpen className="h-5 w-5 text-emerald-500" />,
      accentBg: 'bg-emerald-500/10 text-emerald-500',
      isAvailable: true,
      statusLabel: 'Öğrenim',
      statusType: 'active',
    },
    {
      id: 'live_sessions',
      title: 'Canlı Dersler',
      description: '50 kredi ve 70 katılımcı kapasiteli interaktif canlı ders oturumları',
      icon: <Video className="h-5 w-5 text-rose-500" />,
      accentBg: 'bg-rose-500/10 text-rose-500',
      isAvailable: true,
      statusLabel: 'Canlı',
      statusType: 'active',
    },
    {
      id: 'my_exams',
      title: 'Sınavlarım',
      description: 'Soru bankaları, deneme sınavları, seviye testleri ve sertifika durumu',
      icon: <FileCheck className="h-5 w-5 text-purple-500" />,
      accentBg: 'bg-purple-500/10 text-purple-500',
      isAvailable: true,
      statusLabel: 'Test',
      statusType: 'active',
    },
    {
      id: 'instructor_hub',
      title: isInstructor
        ? 'Eğitmen Paneli'
        : isApplicant
        ? 'Başvuru Durumu'
        : 'Eğitmen Ol',
      description: isInstructor
        ? 'Taslak kurslar oluşturun, ders içerikleri ekleyin ve stüdyonuzu yönetin'
        : isApplicant
        ? 'Eğitmenlik başvurunuz inceleniyor. Belgeler ve onay sürecini takip edin'
        : 'Uzmanlığınızı paylaşın, eğitim kategorilerini seçin ve eğitmenlik başvurusu yapın',
      icon: <GraduationCap className="h-5 w-5 text-amber-500" />,
      accentBg: 'bg-amber-500/10 text-amber-500',
      isAvailable: true,
      statusLabel: isInstructor ? 'Stüdyo' : isApplicant ? 'İncelemede' : 'Başvuru',
      statusType: isInstructor ? 'verified' : isApplicant ? 'pending' : 'active',
    },
  ];

  return (
    <div className="mt-4 px-4">
      <div className="mb-3 px-1 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Akademi Bölümleri
        </h2>
        <span className="text-xs font-medium text-muted-foreground">
          5 Bölüm
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SECTIONS.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSectionClick(section.id)}
            className="cursor-pointer"
          >
            <Card hover interactive className="h-full">
              <CardHeader className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-muted border border-border">
                      {section.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold">
                        {section.title}
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs line-clamp-2">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>

                  <StatusBadge
                    status={section.statusType || 'active'}
                    label={section.statusLabel || 'Aktif'}
                    size="sm"
                  />
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Bölüme Gir</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
