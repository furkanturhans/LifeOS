'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Bot,
  Briefcase,
  Users,
  Wallet,
  Compass,
  Gamepad2,
  GraduationCap,
  Bell,
  Settings,
  User,
  Search,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/useThemeStore';
import { useAuthStore } from '@/stores/useAuthStore';

const SIDEBAR_NAV = [
  { id: 'home', label: 'Ana Ekran', href: '/home', icon: Home },
  { id: 'ai', label: 'LifeOS Asistan', href: '/ai', icon: Bot },
  { id: 'courses', label: 'Dersler', href: '/courses', icon: GraduationCap },
  { id: 'services', label: 'Hizmetler', href: '/services', icon: Briefcase },
  { id: 'family', label: 'Aile', href: '/family', icon: Users },
  { id: 'finance', label: 'Finans', href: '/finance', icon: Wallet },
  { id: 'explore', label: 'Keşfet', href: '/explore', icon: Compass },
  { id: 'arcade', label: 'Arcade', href: '/arcade', icon: Gamepad2 },
  { id: 'notifications', label: 'Bildirimler', href: '/notifications', icon: Bell },
  { id: 'settings', label: 'Ayarlar', href: '/settings', icon: Settings },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { theme, setTheme, resolvedTheme } = useThemeStore();

  function toggleTheme() {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border/80 bg-card/60 backdrop-blur-md p-4 select-none shrink-0">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3 py-2 mb-4">
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs font-bold text-base">
            L
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-foreground">
              LifeOS
            </span>
            <span className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Dijital Yaşam
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Tema Değiştir"
          aria-label="Tema Değiştir"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {SIDEBAR_NAV.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/home'
              ? pathname === '/home'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="pt-3 border-t border-border/70 mt-auto">
        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl transition-colors',
            pathname.startsWith('/profile')
              ? 'bg-muted/80 text-foreground'
              : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border text-foreground font-semibold text-xs">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-foreground truncate">
              {user?.displayName || 'LifeOS Kullanıcısı'}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {user?.email || (user?.lifeosId ? `@${user.lifeosId}` : 'Profil')}
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
