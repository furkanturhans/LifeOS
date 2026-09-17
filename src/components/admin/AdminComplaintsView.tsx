'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AlertCircle, CheckCircle2, MessageSquare, ShieldAlert } from 'lucide-react';
import { useAdminStore } from '@/stores/useAdminStore';
import type { PlatformComplaint } from '@/types/admin';

export function AdminComplaintsView() {
  const { complaints, resolveComplaint } = useAdminStore();
  const [selectedComplaint, setSelectedComplaint] = useState<PlatformComplaint | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResolve = async (action: 'resolve' | 'dismiss') => {
    if (!selectedComplaint) return;
    setIsSubmitting(true);
    await resolveComplaint({
      complaintId: selectedComplaint.id,
      action,
      resolutionNotes: resolutionNote.trim() || (action === 'resolve' ? 'Şikayet çözümlendi.' : 'Şikayet geçersiz bulundu.'),
    });
    setIsSubmitting(false);
    setSelectedComplaint(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-foreground">Şikâyetler ve Güvenlik Bildirimleri ({complaints.length})</h2>
        <p className="text-xs text-muted-foreground">Dersler, canlı sınıflar, teklifler ve hizmet sağlayıcıları hakkındaki kullanıcı şikâyetleri</p>
      </div>

      <div className="space-y-3">
        {complaints.map((comp) => (
          <Card key={comp.id} className="p-4 border-border bg-card shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-foreground">{comp.reason}</h4>
                    <span className="text-[10px] font-mono text-muted-foreground">({comp.targetType})</span>
                    {comp.status === 'open' && <StatusBadge status="rejected" label="Açık" size="sm" />}
                    {comp.status === 'investigating' && <StatusBadge status="pending" label="İnceleniyor" size="sm" />}
                    {comp.status === 'resolved' && <StatusBadge status="verified" label="Çözüldü" size="sm" />}
                    {comp.status === 'dismissed' && <StatusBadge status="draft" label="Kapatıldı" size="sm" />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{comp.details}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Hedef: <strong className="text-foreground font-semibold">{comp.targetTitle}</strong> • Bildiren: {comp.complainantName} ({comp.complainantMaskedId})
                  </p>
                </div>
              </div>

              {comp.status !== 'resolved' && comp.status !== 'dismissed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedComplaint(comp)}
                  className="h-8 text-xs font-semibold shrink-0"
                >
                  İncele & Çöz
                </Button>
              )}
            </div>

            {comp.resolutionNotes && (
              <div className="pt-2 border-t border-border/50 text-[11px] text-emerald-600 dark:text-emerald-400">
                <strong>Yönetici Çözüm Notu:</strong> {comp.resolutionNotes}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-foreground">Şikâyeti Sonuçlandır</h4>
            <p className="text-xs text-muted-foreground">{selectedComplaint.reason} - {selectedComplaint.targetTitle}</p>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Çözüm / Kapatma Notu *</label>
              <textarea
                rows={3}
                required
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Şikayetin nasıl çözüldüğünü ve alınan aksiyonu yazınız..."
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setSelectedComplaint(null)} className="text-xs">Vazgeç</Button>
              <Button variant="outline" size="sm" onClick={() => handleResolve('dismiss')} disabled={isSubmitting} className="text-xs">
                Şikâyeti Reddet
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleResolve('resolve')} disabled={isSubmitting || !resolutionNote.trim()} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                Çözüldü Olarak Kapat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
