'use client';

import { AppArtwork } from '@/components/ui/AppArtwork';

import { useState } from 'react';
import Link from 'next/link';
import { moduleHref } from '@/modules/routes';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Dock } from '@/components/os/Dock';
import { MODULE_REGISTRY, searchModules, getLocalizedModuleName, getLocalizedModuleDescription } from '@/modules/registry';
import { useTranslation } from '@/lib/i18n';
import { useHomescreenStore } from '@/stores/useHomescreenStore';
import { cn } from '@/lib/utils';
import { useLocaleRender } from '@/lib/i18n/runtime';

export default function SearchPage() {
  const localizeText = useLocaleRender();
  const { t, locale } = useTranslation();
  const [query, setQuery] = useState('');
  const { addModuleToHomescreen, isModuleOnHomescreen } = useHomescreenStore();

  const results = query.trim() ? searchModules(query, locale) : [];

  const placeholder = t.common.searchPlaceholder;
  const title = t.nav.search;
  const allModulesLabel = t.common.allModules;

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            {localizeText(title)}
          </h1>
        </motion.div>

        {/* Search Input */}
        <div className="px-4 mb-6">
          <div className="glass-search flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-3 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={localizeText(placeholder)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={localizeText(t.common.close)}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results label */}
        <div className="px-6 mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {localizeText(query.trim()
              ? `"${query}" (${displayList.length})`
              : allModulesLabel)}
          </p>
        </div>

        {/* Results Grid */}
        {displayList.length > 0 ? (
          <div className="px-4 space-y-2">
            {displayList.map((module, index) => {
              const name = getLocalizedModuleName(module, locale);
              const description = getLocalizedModuleDescription(module, locale);
              const onHomescreen = isModuleOnHomescreen(module.id);

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="flex items-center gap-3 rounded-2xl bg-card border border-border/80 p-3 shadow-sm"
                >
                  <div
                    className={cn(
                      'h-12 w-12 flex-shrink-0 rounded-[14px] flex items-center justify-center text-2xl shadow-sm',
                      'bg-card border border-border/60'
                    )}
                  >
                    {<AppArtwork id={module.id} fallback={module.icon} className="h-full w-full p-2" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={module.status === 'ACTIVE' ? moduleHref(module.id) : '/library'} className="font-semibold text-sm text-foreground truncate hover:text-primary">{localizeText(name)}</Link>
                      {module.status === 'COMING_SOON' && (
                        <span className="flex-shrink-0 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                          {localizeText(t.common.soon)}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{localizeText(description)}</p>
                  </div>
                  {onHomescreen ? (
                    <span className="flex-shrink-0 text-xs text-muted-foreground font-medium px-2 py-1 rounded-md bg-muted">
                      {localizeText(t.common.added)}
                    </span>
                  ) : (
                    <button
                      onClick={() => addModuleToHomescreen(module.id)}
                      className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
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
            <p className="text-sm text-muted-foreground">{localizeText("\"")}{localizeText(query)}{localizeText("\"")}{localizeText(t.common.noResults)}
            </p>
          </div>
        )}
      </div>
      <Dock />
    </div>
  );
}
