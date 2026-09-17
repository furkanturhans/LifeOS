'use client';

import { motion } from 'framer-motion';
import { StatusBar } from './StatusBar';
import { SearchBar } from './SearchBar';
import { AppGrid } from './AppGrid';
import { Dock } from './Dock';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore } from '@/stores/useThemeStore';

export function HomeScreen() {
  const { user } = useAuthStore();
  const { backgroundType, backgroundValue } = useThemeStore();

  const isColor = backgroundType === 'color' && backgroundValue;
  const isImage = backgroundType === 'image' && backgroundValue;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative flex h-full flex-col overflow-hidden transition-colors duration-200"
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        {/* Status Bar: Time, Date, Greeting, Notifications */}
        <StatusBar displayName={user?.displayName || (user?.lifeosId ? `@${user.lifeosId}` : undefined)} />

        {/* Global Search Bar */}
        <div className="mt-3">
          <SearchBar />
        </div>

        {/* LifeOS Asistan Prominent Quick Entry Bar */}
        <div className="px-4 mt-3">
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors p-3.5 flex items-center justify-between gap-3 shadow-2xs"
            onClick={() => window.location.href = '/ai'}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs">
                🤖
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    LifeOS Asistan
                  </span>
                  <span className="rounded-full bg-primary/20 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                    AI Agent
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  Doğal dille görev verin, planlama ve video kurgu süreçlerini yönetin
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-primary shrink-0 flex items-center gap-1">
              <span>Aç</span>
              <span>→</span>
            </span>
          </motion.div>
        </div>

        {/* Full Interactive Application Grid */}
        <div className="mt-4">
          <AppGrid pageIndex={0} />
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>

      {/* Mobile Glass Dock */}
      <Dock />
    </motion.div>
  );
}


