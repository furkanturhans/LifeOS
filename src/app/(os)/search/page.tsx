'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Dock } from '@/components/os/Dock';
import { MODULE_REGISTRY, searchModules } from '@/modules/registry';
import { useThemeStore } from '@/stores/useThemeStore';
import { useHomescreenStore } from '@/stores/useHomescreenStore';
import { cn } from '@/lib/utils';
import type { ModuleDefinition } from '@/types/module';

export default function SearchPage() {
  const { locale } = useThemeStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ModuleDefinition[]>([]);
  const { addModuleToHomescreen, isModuleOnHomescreen } = useHomescreenStore();

  useEffect(() => {
    if (query.trim()) {
      setResults(searchModules(query, locale));
    } else {
      setResults([]);
    }
  }, [query, locale]);

  const placeholder = locale === 'tr' ? "LifeOS'ta ara..." : 'Search LifeOS...';
  const title = locale === 'tr' ? 'Arama' : 'Search';
  const allModulesLabel = locale === 'tr' ? 'Tüm Modüller' : 'All Modules';

  const displayList = query.trim() ? results : MODULE_REGISTRY;

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
        </motion.div>

        {/* Search Input */}
        <div className="px-4 mb-6">
          <div className="glass-search flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results label */}
        <div className="px-6 mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {query.trim()
              ? locale === 'tr'
                ? `"${query}" sonuçları`
                : `Results for "${query}"`
              : allModulesLabel}
          </p>
        </div>

        {/* Results Grid */}
        {displayList.length > 0 ? (
          <div className="px-4 space-y-2">
            {displayList.map((module, index) => {
              const name = locale === 'tr' ? module.name : module.nameEn;
              const description = locale === 'tr' ? module.description : module.descriptionEn;
              const onHomescreen = isModuleOnHomescreen(module.id);

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="flex items-center gap-3 rounded-2xl bg-card border border-border p-3"
                >
                  <div
                    className={cn(
                      'h-12 w-12 flex-shrink-0 rounded-[14px] flex items-center justify-center text-2xl',
                      `bg-gradient-to-br ${module.gradient}`
                    )}
                  >
                    {module.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">{name}</span>
                      {module.status === 'COMING_SOON' && (
                        <span className="flex-shrink-0 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                          {locale === 'tr' ? 'Yakında' : 'Soon'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{description}</p>
                  </div>
                  {onHomescreen ? (
                    <span className="flex-shrink-0 text-xs text-muted-foreground">
                      {locale === 'tr' ? 'Eklendi' : 'Added'}
                    </span>
                  ) : (
                    <button
                      onClick={() => addModuleToHomescreen(module.id)}
                      className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <span className="text-sm font-bold leading-none">+</span>
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm text-muted-foreground">
              {locale === 'tr' ? `"${query}" için sonuç bulunamadı` : `No results for "${query}"`}
            </p>
          </div>
        )}
      </div>
      <Dock />
    </div>
  );
}
