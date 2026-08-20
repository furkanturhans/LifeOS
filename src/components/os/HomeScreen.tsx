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
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative flex h-full flex-col overflow-hidden transition-colors duration-300"
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

      {/* Default subtle background gradient */}
      {!isColor && !isImage && (
        <div
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, hsl(238 84% 67% / 0.08) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 80%, hsl(290 60% 60% / 0.06) 0%, transparent 60%)
            `,
          }}
        />
      )}

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        {/* Status Bar: Time, Date, Greeting */}
        <StatusBar displayName={user?.displayName || (user?.lifeosId ? `@${user.lifeosId}` : undefined)} />

        {/* Search Bar */}
        <div className="mt-4">
          <SearchBar />
        </div>

        {/* App Grid */}
        <div className="mt-6">
          <AppGrid pageIndex={0} />
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>

      {/* Dock */}
      <Dock />
    </motion.div>
  );
}
