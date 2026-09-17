'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GraduationCap, ShieldCheck, Video, BookOpen, AlertTriangle } from 'lucide-react';
import { useAdminStore } from '@/stores/useAdminStore';

export function AdminInstructorsView() {
  const { users, executeApplicationAction } = useAdminStore();

  const instructors = users.filter((u) => u.roles.isInstructorVerified);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">Doğrulanmış Eğitmenler ({instructors.length})</h2>
          <p className="text-xs text-muted-foreground">Kurs, canlı sınıf ve sınav açma yetkisine sahip aktif eğitmenler</p>
        </div>
      </div>

      <div className="space-y-3">
        {instructors.map((inst) => (
          <Card key={inst.id} className="p-4 border-border bg-card shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 font-bold text-xl border border-amber-500/20">
                👨‍🏫
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-foreground">{inst.displayName}</h4>
                  <StatusBadge status="verified" label="Doğrulanmış" size="sm" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  ID: @{inst.lifeosId} • E-posta: {inst.maskedEmail} • Kayıt: {new Date(inst.createdAt).toLocaleDateString('tr-TR')}
                </p>
                <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="text-emerald-500 font-semibold">%70 Gelir Paylaşımı</span>
                  <span>•</span>
                  <span>Canlı Sınıf & BBB Yetkisi Açık</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold text-destructive hover:bg-destructive/10 border-border"
              >
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Yetkiyi Askıya Al
              </Button>
            </div>
          </Card>
        ))}

        {instructors.length === 0 && (
          <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-3xl">
            Henüz onaylanmış eğitmen bulunmuyor. &ldquo;Başvurular&rdquo; sekmesinden bekleyen başvuruları onaylayabilirsiniz.
          </div>
        )}
      </div>
    </div>
  );
}
