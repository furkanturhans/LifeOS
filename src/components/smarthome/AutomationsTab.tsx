'use client';

import React from 'react';
import { Play, Sparkles, Clock, CheckCircle2, XCircle, ShieldCheck, History } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSmartHomeStore } from '@/stores/useSmartHomeStore';
import { cn } from '@/lib/utils';

export function AutomationsTab() {
  const { scenes, automations, auditLogs, activateScene, isActionLoading } = useSmartHomeStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-200 select-none">
      {/* 1. One-Tap Scenes Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-foreground">Hızlı Sahneler ({scenes.length})</h3>
            <p className="text-[11px] text-muted-foreground">Tek dokunuşla çoklu cihaz modlarını çalıştırın</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {scenes.map((scene) => (
            <Card
              key={scene.id}
              className="p-3.5 rounded-3xl border-border bg-card shadow-xs flex flex-col justify-between h-28 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{scene.icon}</span>
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => activateScene(scene.id)}
                  className="h-8 w-8 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-all active:scale-95"
                  title="Sahneyi Çalıştır"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                </button>
              </div>

              <div>
                <span className="text-xs font-bold text-foreground block">{scene.name}</span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {scene.description}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. Automations (If/Then) Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-foreground">Akıllı Otomasyon Kuralları</h3>
            <p className="text-[11px] text-muted-foreground">Koşullu zaman ve sensör tetikleyicileri</p>
          </div>
        </div>

        <div className="space-y-2">
          {automations.map((auto) => (
            <div
              key={auto.id}
              className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{auto.name}</span>
                  <span
                    className={cn(
                      'px-2 py-0.2 rounded-full text-[10px] font-bold',
                      auto.isActive ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {auto.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-snug">
                  <strong>Eğer:</strong> {auto.triggerDescription} ➔ <strong>Uygula:</strong> {auto.actionDescription}
                </p>
                {auto.lastRunAt && (
                  <span className="text-[10px] text-muted-foreground block">
                    Son çalışma: {new Date(auto.lastRunAt).toLocaleTimeString('tr-TR')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Security & Control Audit Logs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-foreground">Denetim Günlüğü (Audit Logs)</h3>
            <p className="text-[11px] text-muted-foreground">Tüm cihaz tetiklemeleri ve güvenlik olayları</p>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            {auditLogs.length} Kayıt
          </span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold">
                  <th className="p-3">Tarih / Saat</th>
                  <th className="p-3">Kullanıcı & Rol</th>
                  <th className="p-3">Eylem</th>
                  <th className="p-3">Durum</th>
                  <th className="p-3">Not</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground text-xs">
                      Henüz kayıtlı bir denetim olayı bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30">
                      <td className="p-3 text-[11px] font-mono text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString('tr-TR')}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-foreground block">{log.userName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{log.userRole}</span>
                      </td>
                      <td className="p-3 font-semibold text-foreground">{log.action}</td>
                      <td className="p-3">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-bold',
                            log.status === 'success'
                              ? 'bg-emerald-500/15 text-emerald-600'
                              : log.status === 'rejected'
                              ? 'bg-rose-500/15 text-rose-600'
                              : 'bg-amber-500/15 text-amber-600'
                          )}
                        >
                          {log.status === 'success' ? 'Başarılı' : log.status === 'rejected' ? 'Engellendi' : 'Hata'}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-muted-foreground">{log.note || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
