'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  DollarSign,
  FileCheck2,
  GraduationCap,
  Truck,
  Users,
  BookOpen,
  Briefcase,
  AlertCircle,
  Activity,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Sun,
  Moon,
  Film,
} from 'lucide-react';
import { useAdminStore } from '@/stores/useAdminStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { AdminOverviewView } from './AdminOverviewView';
import { AdminFinanceHub } from './finance/AdminFinanceHub';
import { AdminApplicationsView } from './AdminApplicationsView';
import { AdminInstructorsView } from './AdminInstructorsView';
import { AdminProvidersView } from './AdminProvidersView';
import { AdminUsersView } from './AdminUsersView';
import { AdminKidsMoviesView } from './AdminKidsMoviesView';
import { AdminComplaintsView } from './AdminComplaintsView';
import { AdminAuditLogsView } from './AdminAuditLogsView';
import { cn } from '@/lib/utils';
import type { AdminTabKey } from '@/types/admin';

const ADMIN_MENU_ITEMS: {
  id: AdminTabKey;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'finance', label: 'Gelir ve Finans', icon: DollarSign },
  { id: 'applications', label: 'Başvurular', icon: FileCheck2 },
  { id: 'instructors', label: 'Eğitmenler', icon: GraduationCap },
  { id: 'providers', label: 'Hizmet Sağlayıcılar', icon: Truck },
  { id: 'users', label: 'Kullanıcılar', icon: Users },
  { id: 'kids_content', label: 'Kids Video & İçerik', icon: Film },
  { id: 'courses', label: 'Dersler & Canlı Sınıflar', icon: BookOpen },
  { id: 'services', label: 'Hizmet İlanları', icon: Briefcase },
  { id: 'complaints', label: 'Şikâyetler & Güvenlik', icon: AlertCircle },
  { id: 'audit_logs', label: 'Denetim Kayıtları', icon: Activity },
  { id: 'settings', label: 'Yönetici Ayarları', icon: Settings },
];

import { AdminKeyUnlockModal } from './AdminKeyUnlockModal';

export function AdminLayout() {
  const [isUnlocked, setIsUnlocked] = React.useState<boolean>(false);
  const [isCheckingLock, setIsCheckingLock] = React.useState<boolean>(true);

  const {
    isAdmin,
    adminRole,
    adminDisplayName,
    isCheckingAuth,
    authError,
    activeTab,
    setActiveTab,
    checkAdminAuth,
    fetchOverviewMetrics,
    fetchApplications,
    fetchUsers,
    fetchComplaints,
    fetchAuditLogs,
  } = useAdminStore();

  const { theme, setTheme, resolvedTheme } = useThemeStore();

  useEffect(() => {
    // Check if 22-key was unlocked in this session
    const unlocked = sessionStorage.getItem('lifeos_admin_key_unlocked') === 'true';
    setIsUnlocked(unlocked);
    setIsCheckingLock(false);

    checkAdminAuth().then((authorized) => {
      if (authorized) {
        fetchOverviewMetrics();
        fetchApplications();
        fetchUsers();
        fetchComplaints();
        fetchAuditLogs();
      }
    });
  }, [
    checkAdminAuth,
    fetchOverviewMetrics,
    fetchApplications,
    fetchUsers,
    fetchComplaints,
    fetchAuditLogs,
  ]);

  function toggleTheme() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }

  // 1. Loading State
  if (isCheckingAuth) {
    return (
      <div className="flex h-svh items-center justify-center bg-background select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          <span className="text-xs font-semibold text-muted-foreground">
            Yönetici yetkileri doğrulanıyor...
          </span>
        </div>
      </div>
    );
  }

  // 2. Unauthorized State (Güvenli Yetkisiz Erişim Ekranı)
  if (!isAdmin) {
    return (
      <div className="flex h-svh flex-col items-center justify-center bg-background p-6 select-none text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-destructive/15 text-destructive font-bold text-2xl mb-4 border border-destructive/20 shadow-lg">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <h1 className="text-lg font-bold text-foreground">
          Bu Alana Erişim Yetkiniz Bulunmuyor
        </h1>

        <p className="mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
          {authError ||
            'LifeOS Yönetim Paneli yalnızca sistem yöneticileri ve süper yöneticiler için ayrılmıştır. Hesabınızda yönetici yetkisi tanımlı değildir.'}
        </p>

        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Ana Ekrana Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  // 3. 22-Key Master Password Lock State
  if (!isUnlocked) {
    return (
      <div className="flex h-svh flex-col items-center justify-center bg-background p-6 select-none text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/15 text-amber-500 font-bold text-2xl mb-4 border border-amber-500/20 shadow-lg">
          🔐
        </div>

        <h1 className="text-lg font-bold text-foreground">
          Yönetici Kasası Kilitli
        </h1>

        <p className="mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
          Yönetim paneline erişmek için 22 haneli kişisel güvenlik anahtarınızı doğrulamanız gerekmektedir.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Profile Dön</span>
          </Link>

          <button
            onClick={() => setIsUnlocked(false)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-md shadow-amber-500/20"
          >
            22 Haneli Şifreyi Gir
          </button>
        </div>

        <AdminKeyUnlockModal
          isOpen={true}
          onClose={() => {
            window.location.href = '/profile';
          }}
          onSuccess={() => {
            setIsUnlocked(true);
          }}
        />
      </div>
    );
  }

  // 4. Authorized & Unlocked Admin Panel View
  return (
    <div className="relative flex h-full min-h-svh overflow-hidden bg-background text-foreground select-none">
      {/* 10-Item Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/80 bg-card/60 backdrop-blur-md p-4 select-none shrink-0">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-xs">
              🛡️
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-foreground">
                LifeOS Yönetim
              </span>
              <span className="block text-[10px] font-bold text-primary uppercase tracking-wider">
                {adminRole === 'super_admin' ? 'Süper Yönetici' : 'Yönetici Paneli'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Tema Değiştir"
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
          {ADMIN_MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left',
                  isActive
                    ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Footer Admin Identity */}
        <div className="pt-3 border-t border-border/70 mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
              👑
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground truncate">
                {adminDisplayName || 'Yönetici'}
              </div>
              <div className="text-[10px] text-muted-foreground truncate font-mono">
                {adminRole || 'admin'}
              </div>
            </div>
          </div>

          <Link
            href="/home"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
            title="Kullanıcı Arayüzüne Dön"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Admin Viewport */}
      <main className="relative flex-1 h-full overflow-hidden flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">LifeOS Yönetim</span>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {adminRole}
            </span>
          </div>
          <Link href="/home" className="text-xs font-semibold text-muted-foreground">
            ← Çıkış
          </Link>
        </div>

        {/* Mobile Nav Scroller */}
        <div className="flex md:hidden border-b border-border bg-muted/40 px-3 py-2 overflow-x-auto no-scrollbar gap-1.5">
          {ADMIN_MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap',
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'bg-card border border-border text-muted-foreground'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6 pb-24">
          {activeTab === 'overview' && <AdminOverviewView />}
          {activeTab === 'finance' && <AdminFinanceHub />}
          {activeTab === 'applications' && <AdminApplicationsView />}
          {activeTab === 'instructors' && <AdminInstructorsView />}
          {activeTab === 'providers' && <AdminProvidersView />}
          {activeTab === 'users' && <AdminUsersView />}
          {activeTab === 'kids_content' && <AdminKidsMoviesView />}
          {activeTab === 'complaints' && <AdminComplaintsView />}
          {activeTab === 'audit_logs' && <AdminAuditLogsView />}

          {/* Fallback for other modules */}
          {(activeTab === 'courses' || activeTab === 'services' || activeTab === 'settings') && (
            <div className="py-16 text-center text-xs text-muted-foreground border border-dashed border-border rounded-3xl space-y-2">
              <ShieldCheck className="h-8 w-8 text-primary mx-auto" />
              <h4 className="text-sm font-bold text-foreground">
                {activeTab === 'courses' && 'Dersler ve Canlı Sınıf Yönetimi'}
                {activeTab === 'services' && 'Hizmet İlanları ve Teklif Pazar Yeri'}
                {activeTab === 'settings' && 'Platform Güvenlik & Sistem Ayarları'}
              </h4>
              <p className="max-w-md mx-auto">
                Bu alandaki tüm veriler ve politikalar Yönetim Paneli üzerinden merkezi olarak yönetilmektedir.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
