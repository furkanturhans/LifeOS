'use client';

import { AppArtwork } from '@/components/ui/AppArtwork';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, BookOpen } from 'lucide-react';
import { Dock } from '@/components/os/Dock';
import { MODULE_REGISTRY, getLocalizedModuleName, getLocalizedModuleDescription } from '@/modules/registry';
import { useHomescreenStore } from '@/stores/useHomescreenStore';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ModuleCategory } from '@/types/module';
import { useLocaleRender } from '@/lib/i18n/runtime';

const CATEGORIES: ModuleCategory[] = [
  'productivity',
  'communication',
  'health',
  'finance',
  'entertainment',
  'home',
  'utility',
];

export default function LibraryPage() {
  const localizeText = useLocaleRender();
  const { t, locale } = useTranslation();
  const {
    addModuleToHomescreen,
    removeModuleFromHomescreen,
    removeModuleFromDock,
    isModuleOnHomescreen,
    isModuleInDock,
  } = useHomescreenStore();
  const [activeCategory, setActiveCategory] = useState<ModuleCategory | 'all'>('all');

  const filtered =
    activeCategory === 'all'
      ? MODULE_REGISTRY
      : MODULE_REGISTRY.filter((m) => m.category === activeCategory);

  function handleToggle(moduleId: string, isOnHomescreen: boolean) {
    if (isOnHomescreen) {
      removeModuleFromHomescreen(moduleId);
      if (isModuleInDock(moduleId)) {
        removeModuleFromDock(moduleId);
      }
    } else {
      addModuleToHomescreen(moduleId);
    }
  }

  const categoryLabelMap: Record<ModuleCategory, string> = {
    productivity: t.categories.core,
    communication: t.categories.social,
    health: t.categories.services,
    finance: t.categories.finance,
    entertainment: t.categories.entertainment,
    home: t.categories.smarthome,
    utility: t.categories.services,
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-32 w-full max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 pt-8 pb-6"
        >
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            {localizeText(t.library.title)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{localizeText(t.library.subtitle)}</p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto px-6 pb-4 scrollbar-none">
          <button
            aria-pressed={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
            className={cn(
              'flex-shrink-0 min-h-11 rounded-2xl px-4 py-2 text-sm font-medium transition-all',
              activeCategory === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {localizeText(t.library.filterAll)}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              aria-pressed={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {localizeText(categoryLabelMap[cat] || cat)}
            </button>
          ))}
        </div>

        {/* Module List */}
        <div className="px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((module, index) => {
            const name = getLocalizedModuleName(module, locale);
            const description = getLocalizedModuleDescription(module, locale);
            const onHomescreen = isModuleOnHomescreen(module.id) || isModuleInDock(module.id);

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="flex flex-wrap items-center gap-3 rounded-3xl bg-card border border-border/80 p-4 shadow-sm"
              >
                {/* Icon */}
                <div
                  className={cn(
                    'h-14 w-14 flex-shrink-0 rounded-[18px] flex items-center justify-center text-2xl shadow-sm',
                    'bg-card border border-border/60'
                  )}
                >
                  {<AppArtwork id={module.id} fallback={module.icon} className="h-full w-full p-2" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-base break-words">{localizeText(name)}</span>
                    {module.status === 'COMING_SOON' && (
                      <span className="flex-shrink-0 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-400">
                        {localizeText(t.common.soon)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">{localizeText(description)}</p>
                </div>

                {/* Add/Remove Button */}
                <motion.button
                  aria-label={`${onHomescreen ? t.library.removeFromHome : t.library.addToHome}: ${name}`}
                  aria-pressed={onHomescreen}
                  onClick={() => handleToggle(module.id, onHomescreen)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'group w-full sm:w-auto flex-shrink-0 min-h-11 px-3 rounded-xl flex items-center justify-center gap-1 text-xs font-semibold transition-all duration-200 border',
                    onHomescreen
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20'
                      : 'bg-muted text-muted-foreground border-transparent hover:bg-primary hover:text-primary-foreground'
                  )}
                >
                  {onHomescreen ? (
                    <>
                      <span className="flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" />
                        <span>{localizeText(t.library.removeFromHome)}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>{localizeText(t.library.addToHome)}</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
      <Dock />
    </div>
  );
}
