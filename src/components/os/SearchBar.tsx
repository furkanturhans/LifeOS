'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { searchModules } from '@/modules/registry';
import { useThemeStore } from '@/stores/useThemeStore';
import type { ModuleDefinition } from '@/types/module';

export function SearchBar() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ModuleDefinition[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { locale } = useThemeStore();

  useEffect(() => {
    if (query.trim()) {
      const found = searchModules(query, locale);
      setResults(found.slice(0, 6));
    } else {
      setResults([]);
    }
  }, [query, locale]);

  function handleExpand() {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleClose() {
    setIsExpanded(false);
    setQuery('');
    setResults([]);
    inputRef.current?.blur();
  }

  function handleModuleClick(moduleId: string) {
    handleClose();
    if (moduleId === 'taxi') {
      router.push('/services/taxi');
      return;
    }
    if (moduleId === 'travel') {
      router.push('/services/travel');
      return;
    }
    if (moduleId === 'moving') {
      router.push('/services/moving');
      return;
    }
    if (moduleId === 'craftsman') {
      router.push('/services/craftsman');
      return;
    }
    if (
      moduleId === 'family' ||
      moduleId === 'finance' ||
      moduleId === 'arcade' ||
      moduleId === 'explore' ||
      moduleId === 'services'
    ) {
      router.push(`/${moduleId}`);
      return;
    }
    router.push(`/home?module=${moduleId}`);
  }

  const placeholder = locale === 'tr' ? "LifeOS'ta ara..." : 'Search LifeOS...';

  return (
    <div className="relative w-full px-4">
      <motion.div
        className={cn(
          'rounded-xl border border-border bg-card/90 backdrop-blur-sm transition-all duration-200',
          isExpanded ? 'shadow-md border-primary/50' : 'hover:border-border/80'
        )}
        animate={{ scale: isExpanded ? 1.01 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleExpand}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <AnimatePresence>
            {isExpanded && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClose}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <AnimatePresence>
          {isExpanded && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border overflow-hidden"
            >
              <div className="py-1">
                {results.map((module) => {
                  const name = locale === 'tr' ? module.name : module.nameEn;
                  const description = locale === 'tr' ? module.description : module.descriptionEn;
                  return (
                    <button
                      key={module.id}
                      onClick={() => handleModuleClick(module.id)}
                      className="flex w-full items-center gap-3 px-3.5 py-2 hover:bg-muted/60 transition-colors text-left"
                    >
                      <span className="text-lg w-7 text-center">{module.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{name}</div>
                        <div className="text-xs text-muted-foreground truncate">{description}</div>
                      </div>
                      {module.status === 'COMING_SOON' && (
                        <span className="text-[11px] font-medium text-muted-foreground flex-shrink-0 bg-muted px-2 py-0.5 rounded border border-border">
                          {locale === 'tr' ? 'Yakında' : 'Soon'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        <AnimatePresence>
          {isExpanded && query.trim() && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border overflow-hidden"
            >
              <div className="px-4 py-3 text-center text-xs text-muted-foreground">
                {locale === 'tr' ? `"${query}" için sonuç bulunamadı` : `No results for "${query}"`}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 -z-10"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
