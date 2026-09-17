'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  LockKeyhole,
  RotateCcw,
  ListTodo,
  Calendar,
  Users,
  Briefcase,
  Wallet,
  Image,
  Folder,
  Terminal,
  Trash2,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAssistantStore } from '@/stores/useAssistantStore';
import {
  ASSISTANT_PERMISSION_SCOPES,
  type AssistantPermissionScopeKey,
  type AssistantPermissionLevel,
} from '@/types/assistant';
import { cn } from '@/lib/utils';

const SCOPE_ICONS: Record<AssistantPermissionScopeKey, React.ElementType> = {
  tasks: ListTodo,
  calendar: Calendar,
  family: Users,
  services: Briefcase,
  finance: Wallet,
  photos: Image,
  files: Folder,
};

const PERMISSION_LEVELS: { id: AssistantPermissionLevel; labelTr: string; descTr: string }[] = [
  { id: 'denied', labelTr: 'Kapalı', descTr: 'Veriye asla erişilemez' },
  { id: 'session_only', labelTr: 'Yalnızca Bu Sohbet', descTr: 'Mevcut konuşma süresince geçerli' },
  { id: 'ask_always', labelTr: 'Her Zaman Sor', descTr: 'Her kullanımda onay istenir' },
  { id: 'allowed', labelTr: 'Açık', descTr: 'Sürekli okuma yetkisi' },
];

export function AssistantPermissionCenter() {
  const {
    permissions,
    setPermissionLevel,
    revokeAllPermissions,
    dataAccessLogs,
    clearDataAccessLogs,
  } = useAssistantStore();

  const scopesList = Object.keys(ASSISTANT_PERMISSION_SCOPES) as AssistantPermissionScopeKey[];

  return (
    <div className="px-4 mt-5 pb-12 sm:px-6 space-y-6 max-w-4xl mx-auto">
      {/* Overview Card */}
      <Card className="border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Sıfır Güven & İzin Mimarisi</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-foreground">
              İzinler ve Veri Erişimi Yönetimi
            </h1>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-xl">
              LifeOS Asistan verilerinize varsayılan olarak erişemez. Her modülün veri paylaşım seviyesini bağımsız olarak denetleyebilir ve istediğiniz an iptal edebilirsiniz.
            </p>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={revokeAllPermissions}
            className="shrink-0 font-semibold text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Tüm İzinleri Sıfırla
          </Button>
        </div>
      </Card>

      {/* Granular Permission Scopes List */}
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Modül İzin Seviyeleri (7 Kapsam)
          </h2>
          <span className="text-[11px] font-medium text-muted-foreground">
            Finans & Aile Varsayılan Olarak Kapalıdır
          </span>
        </div>

        <div className="space-y-3">
          {scopesList.map((scopeKey) => {
            const info = ASSISTANT_PERMISSION_SCOPES[scopeKey];
            const currentLevel = permissions[scopeKey];
            const Icon = SCOPE_ICONS[scopeKey] || Folder;

            return (
              <Card key={scopeKey} className="border-border bg-card p-4 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Icon, Title & Description */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted border border-border text-foreground">
                      <Icon className="h-5 w-5 text-primary stroke-[1.75]" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground truncate">
                          {info.titleTr}
                        </h3>
                        {info.isSensitive && (
                          <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            Hassas Veri
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                        {info.descriptionTr}
                      </p>
                    </div>
                  </div>

                  {/* Right: 4 Levels Pill Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 shrink-0">
                    {PERMISSION_LEVELS.map((lvl) => {
                      const isSelected = currentLevel === lvl.id;

                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setPermissionLevel(scopeKey, lvl.id)}
                          className={cn(
                            'flex flex-col items-center justify-center px-2 py-1.5 rounded-lg text-center text-xs font-semibold transition-colors border',
                            isSelected
                              ? lvl.id === 'denied'
                                ? 'bg-muted text-foreground border-border font-bold'
                                : lvl.id === 'allowed'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-primary/10 text-primary border-primary/30'
                              : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-transparent'
                          )}
                          title={lvl.descTr}
                        >
                          <span className="text-[11px] truncate w-full">{lvl.labelTr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Photo Privacy Guarantee Card */}
      <Card className="border-border bg-card p-4 sm:p-5 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <FileCheck2 className="h-4 w-4 text-emerald-500" />
          <span>Fotoğraf ve Medya Gizlilik Protokolü</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Cihazınızdaki fotoğraf albümüne hiçbir şekilde arka planda tam erişim sağlanmaz. Sadece seçtiğiniz fotoğraflar, GPS koordinatları ve EXIF bilgileri temizlenerek analiz onayınıza sunulur.
        </p>
      </Card>

      {/* Data Access Audit Log */}
      <Card className="border-border bg-card p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Terminal className="h-4 w-4 text-primary" />
            <span>Veri Erişim Günlüğü (Audit Trail)</span>
          </div>

          {dataAccessLogs.length > 0 && (
            <button
              onClick={clearDataAccessLogs}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Günlüğü Temizle</span>
            </button>
          )}
        </div>

        {dataAccessLogs.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Henüz herhangi bir veri erişim kaydı bulunmuyor.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {dataAccessLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-[11px]"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="uppercase text-muted-foreground font-mono">
                      [{log.scope}]
                    </span>
                    <span>{log.actionName}</span>
                  </div>
                  <p className="text-muted-foreground">{log.reason}</p>
                </div>

                <div className="text-right shrink-0 space-y-0.5">
                  <span
                    className={cn(
                      'inline-block px-1.5 py-0.2 rounded text-[10px] font-bold',
                      log.status === 'allowed'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : log.status === 'denied'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-amber-500/10 text-amber-500'
                    )}
                  >
                    {log.status === 'allowed' ? 'İzin Verildi' : log.status === 'denied' ? 'Engellendi' : 'Sıfırlandı'}
                  </span>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('tr-TR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
