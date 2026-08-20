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
  const { addModuleToHomescreen, isModuleOnHomescreen } = useHomescreenStore();
  const [activeCategory, setActiveCategory] = useState<ModuleCategory | 'all'>('all');
  const [addedModules, setAddedModules] = useState<Set<string>>(new Set());

  const filtered =
    activeCategory === 'all'
      ? MODULE_REGISTRY
      : MODULE_REGISTRY.filter((m) => m.category === activeCategory);

  function handleAdd(moduleId: string) {
    addModuleToHomescreen(moduleId);
    setAddedModules((prev) => new Set([...prev, moduleId]));
    setTimeout(() => {
      setAddedModules((prev) => {
        const next = new Set(prev);
        next.delete(moduleId);
        return next;
      });
    }, 2000);
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
            const onHomescreen = isModuleOnHomescreen(module.id);
            const justAdded = addedModules.has(module.id);

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

                {/* Add/Added Button */}
                <motion.button
                  onClick={() => !onHomescreen && handleAdd(module.id)}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300',
                    onHomescreen || justAdded
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                  )}
                  title={
                    onHomescreen
                      ? locale === 'tr'
                        ? 'Ana ekranda'
                        : 'On home screen'
                      : locale === 'tr'
                      ? 'Ana ekrana ekle'
                      : 'Add to home screen'
                  }
                >
                  {onHomescreen || justAdded ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
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
