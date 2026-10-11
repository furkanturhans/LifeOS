'use client';

import { FrequentModules } from './FrequentModules';

import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useHomescreenStore } from '@/stores/useHomescreenStore';
import { motion } from 'framer-motion';
import { StatusBar } from './StatusBar';
import { SearchBar } from './SearchBar';
import { AppGrid } from './AppGrid';
import { Dock } from './Dock';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { useEffect, useRef } from 'react';

export function HomeScreen() {

  const { t } = useTranslation();
  const { isEditMode, setEditMode } = useHomescreenStore();
  const { user } = useAuthStore();
  const { backgroundType, backgroundValue } = useThemeStore();
  const press = useRef<{ x: number; y: number; held: boolean; moved: boolean; timer?: ReturnType<typeof setTimeout> } | null>(null);
  useEffect(() => () => { clearTimeout(press.current?.timer); }, []);

  const isColor = backgroundType === 'color' && backgroundValue;
  const isImage = backgroundType === 'image' && backgroundValue;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative flex h-full flex-col overflow-hidden transition-colors duration-200"
      onPointerDown={event => {
        if (event.button !== 0 || (event.target as HTMLElement).closest('button, a, input, select, textarea, [data-widget]')) return;
        clearTimeout(press.current?.timer);
        const current = { x: event.clientX, y: event.clientY, held: false, moved: false, timer: undefined as ReturnType<typeof setTimeout> | undefined };
        press.current = current;
        current.timer = setTimeout(() => { current.held = true; setEditMode(true); }, 500);
      }}
      onPointerMove={event => {
        const current = press.current;
        if (current && Math.hypot(event.clientX - current.x, event.clientY - current.y) > 8) {
          current.moved = true; clearTimeout(current.timer);
        }
      }}
      onPointerUp={() => {
        const current = press.current;
        clearTimeout(current?.timer);
        if (current && !current.held && !current.moved) setEditMode(false);
        press.current = null;
      }}
      onPointerCancel={() => { clearTimeout(press.current?.timer); press.current = null; }}
      onContextMenu={event => event.preventDefault()}
      onKeyDown={event => {
        if (event.key === 'Escape') setEditMode(false);
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault(); setEditMode(!isEditMode);
        }
      }}
      tabIndex={0}
      aria-label={t.common.edit}
      style={{
        backgroundColor: isColor ? backgroundValue : undefined,
        background: isColor
          ? backgroundValue
          : !isImage
          ? 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background)) 100%)'
          : undefined,
      }}
    >
      {/* Custom Image Background */}
      {isImage && (
        <>
          <div
            className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat transition-all duration-500"
            style={{
              backgroundImage: `url(${backgroundValue})`,
            }}
          />
          {/* Subtle readability overlay */}
          <div className="fixed inset-0 -z-10 bg-black/40 backdrop-blur-[1px]" />
        </>
      )}

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth w-full max-w-5xl mx-auto sm:px-4">
        {/* Status Bar: Time, Date, Greeting, Notifications */}
        <StatusBar displayName={user?.displayName || (user?.lifeosId ? `@${user.lifeosId}` : undefined)} />

        {/* Global Search Bar */}
        <div className="mt-3">
          <SearchBar />
        </div>

        <FrequentModules />

        {/* Full Interactive Application Grid */}
        <section className="mt-7"><AppGrid pageIndex={0} /></section>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>

      {/* Mobile Glass Dock */}
      <Dock />
      {isEditMode && <div className="fixed bottom-5 inset-x-4 z-30 flex justify-center gap-2 safe-bottom">
        <Link href="/library" onClick={() => setEditMode(false)} className="flex min-h-12 items-center gap-2 rounded-2xl border border-border bg-card px-5 text-sm font-medium shadow-lg">
          <LayoutGrid className="h-5 w-5" />{t.library.title}
        </Link>
        <button type="button" onClick={() => setEditMode(false)} className="min-h-12 rounded-2xl bg-primary px-4 text-sm text-primary-foreground">{t.common.done}</button>
      </div>}
    </motion.div>
  );
}


