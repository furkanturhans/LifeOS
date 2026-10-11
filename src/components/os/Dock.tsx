'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Home, Search, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useHomescreenStore } from '@/stores/useHomescreenStore';
import { useLocaleRender } from '@/lib/i18n/runtime';
import { useArcadeStore } from '@/stores/useArcadeStore';
import { useEducationStore } from '@/stores/useEducationStore';
import { useAssistantStore } from '@/stores/useAssistantStore';

export function Dock() {
  const localizeText = useLocaleRender();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isEditMode } = useHomescreenStore();
  const arcadeSection = useArcadeStore(state => state.activeSection);
  const educationSection = useEducationStore(state => state.activeSection);
  const takingExam = useEducationStore(state => state.isTakingExam);
  const assistantView = useAssistantStore(state => state.currentView);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const viewport = window.visualViewport;
    let baseline = viewport?.height ?? window.innerHeight;
    let frame = 0;
    function update() {
      const height = viewport?.height ?? window.innerHeight;
      baseline = Math.max(baseline, height);
      const element = document.activeElement;
      const editing = element instanceof HTMLElement &&
        (element.matches('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), textarea:not([readonly])') || element.isContentEditable);
      setKeyboardOpen(Boolean(editing && (window.matchMedia('(pointer: coarse)').matches || baseline - height > 150)));
    }
    function reset() { baseline = viewport?.height ?? window.innerHeight; update(); }
    function afterBlur() { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); }
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', afterBlur);
    viewport?.addEventListener('resize', update);
    window.addEventListener('orientationchange', reset);
    return () => {
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', afterBlur);
      cancelAnimationFrame(frame);
      viewport?.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', reset);
    };
  }, []);

  const navItems = [
    { id: 'home', label: t.nav.home, icon: Home, href: '/home' },
    { id: 'search', label: t.nav.search, icon: Search, href: '/search' },
    { id: 'ai', label: t.nav.assistant, icon: Sparkles, href: '/ai' },
    { id: 'profile', label: t.nav.profile, icon: User, href: '/profile' },
  ];

  const focusedScreen = pathname === '/explore' || pathname.startsWith('/services/') || pathname.startsWith('/settings/') ||
    pathname === '/chat' || pathname === '/connect' || (pathname === '/ai' && assistantView !== 'tasks') ||
    (pathname === '/arcade' && Boolean(arcadeSection)) ||
    (['/courses', '/education'].includes(pathname) && (Boolean(educationSection) || takingExam));
  if ((pathname === '/home' && isEditMode) || focusedScreen || keyboardOpen) return null;

  return (
    <nav
      role="navigation"
      aria-label={localizeText("Ana Navigasyon")}
      className="fixed bottom-0 inset-x-0 z-30 border-t border-border/60 bg-background lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto max-w-lg">
        <div className="px-2 py-1">
          <div className="grid grid-cols-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const label = item.label;
              const isActive =
                item.href === '/home'
                  ? pathname === '/home' && !pathname.includes('module')
                  : pathname.startsWith(item.href.split('?')[0]);

              return (
                <Link
                  key={item.id}
                  aria-current={isActive ? 'page' : undefined}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center gap-1 min-h-14 min-w-0 py-1 px-1 transition-colors select-none"
                >
                  <div
                    className={cn(
                      'flex h-6 w-9 items-center justify-center transition-colors duration-150',
                      isActive
                        ? 'text-primary font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.75} />
                  </div>
                  <span
                    className={cn(
                      'text-[11px] font-medium leading-tight text-center transition-colors',
                      isActive ? 'text-primary font-bold' : 'text-muted-foreground'
                    )}
                  >
                    {localizeText(label)}
                  </span>
                  {isActive && <span aria-hidden="true" className="absolute top-0 h-0.5 w-5 rounded-full bg-primary" />}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

