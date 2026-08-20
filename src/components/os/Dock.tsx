'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, BookOpen, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/useThemeStore';
import { useHomescreenStore } from '@/stores/useHomescreenStore';
import { getModuleById } from '@/modules/registry';

export function Dock() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useThemeStore();
  const { isEditMode, layout } = useHomescreenStore();
  const [comingSoonModule, setComingSoonModule] = useState<string | null>(null);

  if (isEditMode) return null;

  // Static items grouped
  const leftStaticItems = [
    { id: 'home', labelTr: 'Ana Ekran', labelEn: 'Home', icon: Home, href: '/home' },
    { id: 'search', labelTr: 'Ara', labelEn: 'Search', icon: Search, href: '/search' },
  ];

  const rightStaticItems = [
    { id: 'library', labelTr: 'Kütüphane', labelEn: 'Library', icon: BookOpen, href: '/library' },
    { id: 'profile', labelTr: 'Profil', labelEn: 'Profile', icon: User, href: '/profile' },
  ];

  function handleModuleClick(moduleId: string) {
    const moduleDef = getModuleById(moduleId);
    if (!moduleDef) return;
    if (moduleDef.status === 'COMING_SOON' || moduleDef.status !== 'ACTIVE') {
      setComingSoonModule(moduleId);
    } else {
      router.push(`/home?module=${moduleId}`);
    }
  }

  // Sorted dynamic dock items
  const sortedDockItems = [...(layout.dockItems || [])].sort((a, b) => a.position - b.position);

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
        className="fixed bottom-4 left-4 right-4 z-20 safe-bottom"
      >
        <div className="mx-auto max-w-md">
          <div className="glass-dock rounded-[28px] border border-white/10 px-4 py-3 shadow-xl">
            <div className="flex items-center justify-around">
              {/* Left Static Navigation */}
              {leftStaticItems.map((item) => {
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

              {/* Dynamic User Custom Dock Items */}
              {sortedDockItems.map((dockItem) => {
                const moduleDef = getModuleById(dockItem.moduleId);
                if (!moduleDef) return null;
                const label = locale === 'tr' ? moduleDef.name : moduleDef.nameEn;
                const isActive = pathname.includes(`module=${moduleDef.id}`);

                return (
                  <button
                    key={dockItem.moduleId}
                    onClick={() => handleModuleClick(dockItem.moduleId)}
                    className="flex flex-col items-center gap-1"
                  >
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-[16px] text-2xl shadow-sm bg-gradient-to-br transition-all duration-200',
                        moduleDef.gradient,
                        isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                      )}
                    >
                      <span>{moduleDef.icon}</span>
                    </motion.div>
                    <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[48px]">
                      {label}
                    </span>
                  </button>
                );
              })}

              {/* Right Static Navigation */}
              {rightStaticItems.map((item) => {
                const Icon = item.icon;
                const label = locale === 'tr' ? item.labelTr : item.labelEn;
                const isActive = pathname.startsWith(item.href);

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

      {/* Coming Soon Modal */}
      <ComingSoonModal
        moduleId={comingSoonModule}
        onClose={() => setComingSoonModule(null)}
        locale={locale}
      />
    </>
  );
}

// Coming Soon Modal component inline
interface ComingSoonModalProps {
  moduleId: string | null;
  onClose: () => void;
  locale: string;
}

function ComingSoonModal({ moduleId, onClose, locale }: ComingSoonModalProps) {
  const moduleDef = moduleId ? getModuleById(moduleId) : null;

  if (!moduleDef) return null;

  const name = locale === 'tr' ? moduleDef.name : moduleDef.nameEn;

  return (
    <AnimatePresence>
      {moduleId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm"
          >
            <div className="rounded-3xl bg-card border border-border shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex flex-col items-center pt-8 pb-6 px-6">
                {/* Icon */}
                <div
                  className={cn(
                    'h-20 w-20 rounded-[24px] flex items-center justify-center text-4xl mb-4 shadow-lg',
                    `bg-gradient-to-br ${moduleDef.gradient}`
                  )}
                >
                  {moduleDef.icon}
                </div>

                {/* Badge */}
                <span className="mb-3 inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-400">
                  {locale === 'tr' ? '🚀 Çok Yakında' : '🚀 Coming Soon'}
                </span>

                {/* Title */}
                <h2 className="text-xl font-bold text-foreground text-center">{name}</h2>

                {/* Description */}
                <p className="mt-3 text-sm text-muted-foreground text-center leading-relaxed">
                  {locale === 'tr'
                    ? `${name} modülünü sizin için hazırlıyoruz. Çok yakında LifeOS içerisinde kullanıma sunacağız.`
                    : `We're preparing the ${name} module for you. It will be available in LifeOS very soon.`}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Action */}
              <button
                onClick={onClose}
                className="w-full py-4 text-center text-base font-semibold text-primary hover:bg-muted/50 transition-colors"
              >
                {locale === 'tr' ? 'Tamam' : 'OK'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
