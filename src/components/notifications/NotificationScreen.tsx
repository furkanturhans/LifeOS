'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BellOff, ShieldCheck, Sparkles, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { NotificationHeader } from './NotificationHeader';
import { NotificationCategoriesGrid } from './NotificationCategoriesGrid';
import { LockedNotificationModal } from './LockedNotificationModal';
import { Dock } from '@/components/os/Dock';

export function NotificationScreen() {
  const [selectedLockedFeature, setSelectedLockedFeature] = useState<{
    title: string;
    icon: React.ReactNode;
  } | null>(null);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Header */}
      <NotificationHeader
        onOpenPreferences={() =>
          setSelectedLockedFeature({
            title: 'Gelişmiş Bildirim Tercihleri',
            icon: <SlidersHorizontal className="h-8 w-8 text-indigo-500" />,
          })
        }
      />

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        {/* Empty State Banner (Clean & Reassuring, No fake data) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mt-4 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Gündem Sakin</span>
              </div>
              <h2 className="mt-1 text-base font-bold text-foreground">
                Yeni Bildiriminiz Yok
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Tüm modüllerden gelen önemli bildirimler ve hatırlatmalar burada toplanır. Dilediğiniz kategorinin ses ve öncelik seviyesini aşağıdan ayarlayabilirsiniz.
              </p>
            </div>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-2xl shadow-sm">
              🔔
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-border/40">
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
              <span>Gereksiz Bildirim Yok</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span>Kategoriye Özel Kontrol</span>
            </div>
          </div>
        </motion.div>

        {/* Categories & Preferences: Aile, Finans, Arcade, Keşfet, Sistem */}
        <NotificationCategoriesGrid
          onLockedTrigger={(title, icon) =>
            setSelectedLockedFeature({ title, icon })
          }
        />

        {/* Bottom spacer */}
        <div className="h-6" />
      </div>

      {/* Dock */}
      <Dock />

      {/* Locked Notification Modal */}
      <LockedNotificationModal
        isOpen={!!selectedLockedFeature}
        onClose={() => setSelectedLockedFeature(null)}
        featureTitle={selectedLockedFeature?.title}
        featureIcon={selectedLockedFeature?.icon}
      />
    </div>
  );
}
