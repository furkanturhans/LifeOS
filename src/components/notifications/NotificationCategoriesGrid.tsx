'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Wallet,
  Gamepad2,
  Compass,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PREFERENCE_OPTIONS,
  type NotificationCategoryKey,
  type NotificationPreferenceLevel,
} from '@/types/notifications';
import { useNotificationStore } from '@/stores/useNotificationStore';

interface NotificationCategoriesGridProps {
  onLockedTrigger: (title: string, icon: React.ReactNode) => void;
}

const CATEGORY_ICON_MAP: Record<NotificationCategoryKey, React.ReactNode> = {
  family: <Users className="h-5 w-5 text-amber-500" />,
  finance: <Wallet className="h-5 w-5 text-emerald-500" />,
  arcade: <Gamepad2 className="h-5 w-5 text-primary" />,
  explore: <Compass className="h-5 w-5 text-blue-500" />,
  system: <Settings className="h-5 w-5 text-indigo-500" />,
};

export function NotificationCategoriesGrid({ onLockedTrigger }: NotificationCategoriesGridProps) {
  const { preferences, setCategoryPreference } = useNotificationStore();

  function handlePreferenceSelect(
    category: NotificationCategoryKey,
    level: NotificationPreferenceLevel
  ) {
    setCategoryPreference(category, level);
  }

  return (
    <div className="mt-4 px-4">
      <div className="mb-3 px-1 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Kategori Tercihleri
        </h2>
        <span className="text-xs font-medium text-muted-foreground">
          5 Kategori
        </span>
      </div>

      <div className="space-y-3">
        {NOTIFICATION_CATEGORIES.map((cat, index) => {
          const currentLevel = preferences[cat.id] || 'all';

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
            >
              <Card>
                <CardHeader className="p-4">
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted border border-border">
                        {CATEGORY_ICON_MAP[cat.id]}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          {cat.titleTr}
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {cat.descriptionTr}
                        </CardDescription>
                      </div>
                    </div>

                    {/* Info button trigger */}
                    <button
                      onClick={() => onLockedTrigger(`${cat.titleTr} Bildirimleri`, CATEGORY_ICON_MAP[cat.id])}
                      className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
                      title="Detay"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Preference Options Pills (Tümü, Önemliler, Sessiz, Kapalı) */}
                  <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-4 gap-1.5">
                    {NOTIFICATION_PREFERENCE_OPTIONS.map((opt) => {
                      const isSelected = currentLevel === opt.id;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handlePreferenceSelect(cat.id, opt.id)}
                          className={cn(
                            'flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-center text-xs font-medium transition-colors border',
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border-transparent'
                          )}
                        >
                          <span className="truncate w-full">{opt.labelTr}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

