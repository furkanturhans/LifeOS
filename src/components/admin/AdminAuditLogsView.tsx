'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Activity, ShieldCheck, Clock, User } from 'lucide-react';
import { useAdminStore } from '@/stores/useAdminStore';

export function AdminAuditLogsView() {
  const { auditLogs } = useAdminStore();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-foreground">Denetim Kayıtları (Audit Logs)</h2>
        <p className="text-xs text-muted-foreground">Platform yöneticileri tarafından yapılan tüm onay, ret, askıya alma ve durum değişikliklerinin değiştirilemez zaman damgalı dökümü</p>
      </div>

      <div className="space-y-2">
        {auditLogs.map((log) => (
          <Card key={log.id} className="p-3.5 border-border bg-card shadow-xs flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 font-bold text-xs mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground">{log.adminDisplayName}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                    {log.action}
                  </span>
                  <span className="text-muted-foreground">➔</span>
                  <span className="font-semibold text-foreground">{log.targetTitle || log.targetId}</span>
                </div>

                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Gerekçe / Not: &ldquo;{log.reason}&rdquo;
                </p>

                {log.previousState && log.newState && (
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Durum Geçişi: <span className="text-amber-500">{log.previousState}</span> ➔ <span className="text-emerald-500">{log.newState}</span>
                  </div>
                )}
              </div>
            </div>

            <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
              {new Date(log.timestamp).toLocaleString('tr-TR')}
            </span>
          </Card>
        ))}

        {auditLogs.length === 0 && (
          <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-3xl">
            Henüz kayıtlı denetim işlemi bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
}
