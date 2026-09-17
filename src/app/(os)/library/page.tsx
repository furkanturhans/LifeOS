'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { Dock } from '@/components/os/Dock';
import { MODULE_REGISTRY } from '@/modules/registry';
import { useHomescreenStore } from '@/stores/useHomescreenStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { cn } from '@/lib/utils';
import type { ModuleCategory } from '@/types/module';

const CATEGORY_LABELS: Record<ModuleCategory, { tr: string; en: string }> = {
  productivity: { tr: 'Verimlilik', en: 'Productivity' },
  health: { tr: 'Sağlık', en: 'Health' },
  finance: { tr: 'Finans', en: 'Finance' },
  entertainment: { tr: 'Eğlence', en: 'Entertainment' },
  communication: { tr: 'İletişim', en: 'Communication' },
  home: { tr: 'Ev', en: 'Home' },
  utility: { tr: 'Araçlar', en: 'Utility' },
};

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
  const { locale } = useThemeStore();
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

  const title = locale === 'tr' ? 'LifeOS Kütüphanesi' : 'LifeOS Library';
  const subtitle =
    locale === 'tr'
      ? 'Modülleri ana ekranına ekle veya kaldır'
      : 'Add or remove modules from your home screen';

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 pt-12 pb-4"
        >
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto px-6 pb-4 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
              activeCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {locale === 'tr' ? 'Tümü' : 'All'}
          </button>
          {CATEGORIES.map((cat) => {
            const label = CATEGORY_LABELS[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {locale === 'tr' ? label.tr : label.en}
              </button>
            );
          })}
        </div>

        {/* Module List */}
        <div className="px-4 space-y-2">
          {filtered.map((module, index) => {
            const name = locale === 'tr' ? module.name : module.nameEn;
            const description = locale === 'tr' ? module.description : module.descriptionEn;
            const onHomescreen = isModuleOnHomescreen(module.id) || isModuleInDock(module.id);

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="flex items-center gap-4 rounded-2xl bg-card border border-border p-4"
              >
                {/* Icon */}
                <div
                  className={cn(
                    'h-14 w-14 flex-shrink-0 rounded-[16px] flex items-center justify-center text-2xl shadow-sm',
                    `bg-gradient-to-br ${module.gradient}`
                  )}
                >
                  {module.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm truncate">{name}</span>
                    {module.status === 'COMING_SOON' && (
                      <span className="flex-shrink-0 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                        {locale === 'tr' ? 'Yakında' : 'Soon'}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{description}</p>
                </div>

                {/* Add/Remove Button */}
                <motion.button
                  onClick={() => handleToggle(module.id, onHomescreen)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'group flex-shrink-0 h-8 px-3 rounded-full flex items-center justify-center gap-1 text-xs font-semibold transition-all duration-200 border',
                    onHomescreen
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20'
                      : 'bg-muted text-muted-foreground border-transparent hover:bg-primary hover:text-primary-foreground'
                  )}
                >
                  {onHomescreen ? (
                    <>
                      {/* Normal state */}
                      <span className="flex items-center gap-1 group-hover:hidden">
                        <Check className="h-3.5 w-3.5" />
                        <span>{locale === 'tr' ? 'Ana Ekranda' : 'On Home Screen'}</span>
                      </span>
                      {/* Hover state */}
                      <span className="hidden group-hover:flex items-center gap-1 text-destructive">
                        <span>{locale === 'tr' ? 'Ana Ekrandan Kaldır' : 'Remove from Home'}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>{locale === 'tr' ? 'Ana Ekrana Ekle' : 'Add to Home'}</span>
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
