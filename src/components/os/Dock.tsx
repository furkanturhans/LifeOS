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
  { id: 'ai', labelTr: 'AI', labelEn: 'AI', icon: Sparkles, href: '/home?module=ai' },
  { id: 'library', labelTr: 'Kütüphane', labelEn: 'Library', icon: BookOpen, href: '/library' },
  { id: 'profile', labelTr: 'Profil', labelEn: 'Profile', icon: User, href: '/profile' },
] as const;

export function Dock() {
  const pathname = usePathname();
  const { locale } = useThemeStore();
  const { isEditMode } = useHomescreenStore();

  if (isEditMode) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
      className="fixed bottom-4 left-4 right-4 z-20 safe-bottom"
    >
      <div className="mx-auto max-w-sm">
        <div className="glass-dock rounded-[28px] border border-white/10 px-4 py-3 shadow-xl">
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const label = locale === 'tr' ? item.labelTr : item.labelEn;
              const isActive =
                item.href === '/home'
                  ? pathname === '/home' && !pathname.includes('module')
                  : pathname.startsWith(item.href.split('?')[0]);

              return (
                <Link key={item.id} href={item.href} className="flex flex-col items-center gap-1">
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-[16px] transition-all duration-200',
                      isActive
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>
                  <span
                    className={cn(
                      'text-[10px] font-medium transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground'
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
    </motion.div>
  );
}
