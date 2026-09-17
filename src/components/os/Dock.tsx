'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Sparkles, BookOpen, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/useThemeStore';
import { useHomescreenStore } from '@/stores/useHomescreenStore';

const NAV_ITEMS = [
  { id: 'home', labelTr: 'Ana Ekran', labelEn: 'Home', icon: Home, href: '/home' },
  { id: 'search', labelTr: 'Ara', labelEn: 'Search', icon: Search, href: '/search' },
  { id: 'ai', labelTr: 'Asistan', labelEn: 'AI', icon: Sparkles, href: '/ai' },
  { id: 'library', labelTr: 'Kütüphane', labelEn: 'Library', icon: BookOpen, href: '/library' },
  { id: 'profile', labelTr: 'Profil', labelEn: 'Profile', icon: User, href: '/profile' },
] as const;

export function Dock() {
  const pathname = usePathname();
  const { locale } = useThemeStore();
  const { isEditMode } = useHomescreenStore();

  if (isEditMode) return null;

  return (
    <nav
      role="navigation"
      aria-label="Ana Navigasyon"
      className="fixed bottom-3.5 left-3.5 right-3.5 z-30 safe-bottom lg:hidden pointer-events-none"
    >
      <div className="mx-auto max-w-sm pointer-events-auto">
        <div className="glass-dock rounded-2xl border border-border/80 bg-card/90 px-3 py-2 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const label = locale === 'tr' ? item.labelTr : item.labelEn;
              const isActive =
                item.href === '/home'
                  ? pathname === '/home' && !pathname.includes('module')
                  : pathname.startsWith(item.href.split('?')[0]);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex flex-col items-center gap-1 py-0.5 px-2 rounded-xl transition-colors select-none"
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150',
                      isActive
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-medium leading-none transition-colors',
                      isActive ? 'text-primary font-bold' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

