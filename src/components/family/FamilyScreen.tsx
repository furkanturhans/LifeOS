'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Sparkles, Plus, Users, UserPlus } from 'lucide-react';
import { FamilyHeader } from './FamilyHeader';
import { FamilyMembersList } from './FamilyMembersList';
import { FamilyFeaturesGrid } from './FamilyFeaturesGrid';
import { CreateFamilyModal } from './CreateFamilyModal';
import { InviteMemberModal } from './InviteMemberModal';
import { LockedFeatureModal } from './LockedFeatureModal';
import { Dock } from '@/components/os/Dock';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { Button } from '@/components/ui/Button';

export function FamilyScreen() {
  const { family } = useFamilyStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedLockedFeature, setSelectedLockedFeature] = useState<{
    title: string;
    icon: React.ReactNode;
  } | null>(null);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Header */}
      <FamilyHeader
        onOpenInvite={() => setIsInviteModalOpen(true)}
        onOpenCreate={() => setIsCreateModalOpen(true)}
      />

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        {/* Family Greeting Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mt-4 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                <Heart className="h-3.5 w-3.5 fill-amber-500" />
                <span>LifeOS Aile Alanı</span>
              </div>
              <h2 className="mt-1 text-base font-bold text-foreground">
                {family ? `${family.name} Dijital Yuvanız` : 'Aileniz İçin Güvenli Alan'}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Tüm aile bireyleri tek bir güvenli çatı altında. Anılarınızı paylaşın, takvimlerinizi birleştirin ve ortak notlarınızı tutun.
              </p>
            </div>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-2xl shadow-sm">
              ✨
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-border/40">
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Uçtan Uca Özel Alan</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Genişletilebilir Altyapı</span>
            </div>
          </div>
        </motion.div>

        {/* Members Carousel */}
        <FamilyMembersList
          onOpenInvite={() => setIsInviteModalOpen(true)}
          onOpenCreate={() => setIsCreateModalOpen(true)}
        />

        {/* 4 Feature Cards (Ortak Alan, Anılar, Takvim, Notlar) */}
        <FamilyFeaturesGrid
          onFeatureClick={(feature) =>
            setSelectedLockedFeature({
              title: feature.title,
              icon: feature.icon,
            })
          }
        />

        {/* Bottom spacer */}
        <div className="h-6" />
      </div>

      {/* Dock */}
      <Dock />

      {/* Modals */}
      <CreateFamilyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        inviteCode={family?.inviteCode}
      />

      <LockedFeatureModal
        isOpen={!!selectedLockedFeature}
        onClose={() => setSelectedLockedFeature(null)}
        featureTitle={selectedLockedFeature?.title}
        featureIcon={selectedLockedFeature?.icon}
      />
    </div>
  );
}
