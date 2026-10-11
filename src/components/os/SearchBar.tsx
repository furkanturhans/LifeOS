'use client';
import { moduleHref } from '@/modules/routes';

import { AppArtwork } from '@/components/ui/AppArtwork';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { searchModules, getLocalizedModuleName, getLocalizedModuleDescription } from '@/modules/registry';
import { useTranslation } from '@/lib/i18n';
import { useLocaleRender } from '@/lib/i18n/runtime';

export function SearchBar() {
  const localizeText = useLocaleRender();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, locale } = useTranslation();

  const results = query.trim() ? searchModules(query, locale).slice(0, 6) : [];

  function handleExpand() {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleClose() {
    setIsExpanded(false);
    setQuery('');
    inputRef.current?.blur();
  }

  function handleModuleClick(moduleId: string) {
    handleClose();
    const entry = results.find(item => item.id === moduleId);
    router.push(entry?.status === 'ACTIVE' ? moduleHref(moduleId) : '/library');
  }

  const placeholder = t.common.searchPlaceholder;

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
            placeholder={localizeText(placeholder)}
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
                  const name = getLocalizedModuleName(module, locale);
                  const description = getLocalizedModuleDescription(module, locale);
                  return (
                    <button
                      key={module.id}
                      onClick={() => handleModuleClick(module.id)}
                      className="flex w-full items-center gap-3 px-3.5 py-2 hover:bg-muted/60 transition-colors text-left"
                    >
                      <AppArtwork id={module.id} fallback={module.icon} className="h-8 w-8" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{localizeText(name)}</div>
                        <div className="text-xs text-muted-foreground truncate">{localizeText(description)}</div>
                      </div>
                      {module.status === 'COMING_SOON' && (
                        <span className="text-[11px] font-medium text-muted-foreground flex-shrink-0 bg-muted px-2 py-0.5 rounded border border-border">
                          {localizeText(t.common.soon)}
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
              <div className="px-4 py-3 text-center text-xs text-muted-foreground">{localizeText("\"")}{localizeText(query)}{localizeText("\"")}{localizeText(t.common.noResults)}
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
