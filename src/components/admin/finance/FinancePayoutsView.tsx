'use client';

import React, { useEffect, useState } from 'react';
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Building,
  Edit,
  X,
  Send,
  RefreshCw,
} from 'lucide-react';
import { useAdminFinanceStore } from '@/stores/useAdminFinanceStore';
import { cn } from '@/lib/utils';
import type { PayoutRecord, PayoutStatus } from '@/types/finance';

function formatTL(kurus: number): string {
  const tl = kurus / 100;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(tl);
}

const STATUS_LABELS: Record<PayoutStatus, { label: string; color: string }> = {
  calculated: { label: 'Hesaplandı', color: 'text-amber-500 bg-amber-500/10' },
  under_review: { label: 'İncelemede', color: 'text-sky-500 bg-sky-500/10' },
  payout_scheduled: { label: 'Ödeme Planlandı', color: 'text-indigo-500 bg-indigo-500/10' },
  paid: { label: 'Ödendi', color: 'text-emerald-500 bg-emerald-500/10' },
  reconciled: { label: 'Mutabakat Tamam', color: 'text-teal-500 bg-teal-500/10' },
};

export function FinancePayoutsView() {
  const { payouts, fetchPayouts, updatePayoutStatus, isUpdatingPayout } = useAdminFinanceStore();
  const [editingPayout, setEditingPayout] = useState<PayoutRecord | null>(null);
  const [newStatus, setNewStatus] = useState<PayoutStatus>('payout_scheduled');
  const [paymentReference, setPaymentReference] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleOpenEdit = (payout: PayoutRecord) => {
    setEditingPayout(payout);
    setNewStatus(payout.status);
    setPaymentReference(payout.paymentReference || '');
    setAdminNotes(payout.adminNotes || '');
  };

  const handleSave = async () => {
    if (!editingPayout) return;
    const res = await updatePayoutStatus({
      payoutId: editingPayout.id,
      newStatus,
      paymentReference,
      adminNotes,
    });
    if (res.success) {
      setEditingPayout(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-2xs space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Ödemeler & Hakediş Süreci (Payouts)</h3>
            <p className="text-xs text-muted-foreground">
              Eğitmen ve sağlayıcı net hakedişlerinin hesaplanması, onaylanması ve banka mutabakatı
            </p>
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold">
                <th className="p-3.5">Hakediş Kodu</th>
                <th className="p-3.5">Hak Sahibi</th>
                <th className="p-3.5">Dönem</th>
                <th className="p-3.5 text-right">Brüt Tutar</th>
                <th className="p-3.5 text-right">Platform Payı</th>
                <th className="p-3.5 text-right">Net Ödenecek</th>
                <th className="p-3.5 text-center">Durum</th>
                <th className="p-3.5 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {payouts.map((po) => {
                const badge = STATUS_LABELS[po.status] || { label: po.status, color: 'text-muted-foreground bg-muted' };
                return (
                  <tr key={po.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-foreground text-xs">{po.id}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(po.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-foreground text-xs">{po.recipientName}</div>
                      <div className="text-[10px] text-muted-foreground capitalize">
                        {po.recipientType === 'instructor' ? 'Eğitmen' : 'Hizmet Sağlayıcı'}
                      </div>
                    </td>
                    <td className="p-3.5 text-[11px] font-mono text-muted-foreground">
                      {new Date(po.periodStart).toLocaleDateString('tr-TR')} - {new Date(po.periodEnd).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-3.5 text-right font-bold font-mono text-foreground">{formatTL(po.totalGrossKurus)}</td>
                    <td className="p-3.5 text-right font-bold font-mono text-primary">{formatTL(po.totalCommissionKurus)}</td>
                    <td className="p-3.5 text-right font-black font-mono text-emerald-500">{formatTL(po.netPayoutKurus)}</td>
                    <td className="p-3.5 text-center">
                      <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md', badge.color)}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleOpenEdit(po)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] transition-colors"
                      >
                        <Edit className="h-3 w-3" /> Durum Güncelle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Payout Modal */}
      {editingPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Hakediş Durumu Güncelle</h3>
              </div>
              <button
                onClick={() => setEditingPayout(null)}
                className="rounded-xl p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                <div className="text-muted-foreground">Hak Sahibi:</div>
                <div className="font-bold text-foreground text-sm">{editingPayout.recipientName}</div>
                <div className="font-mono font-bold text-emerald-500 mt-1">
                  Net Ödenecek: {formatTL(editingPayout.netPayoutKurus)}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">
                  Yeni Hakediş Aşaması:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as PayoutStatus)}
                  className="w-full bg-muted/50 border border-border/70 rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-hidden focus:border-primary"
                >
                  <option value="calculated">1. Hesaplandı (calculated)</option>
                  <option value="under_review">2. İncelemede (under_review)</option>
                  <option value="payout_scheduled">3. Ödeme Planlandı (payout_scheduled)</option>
                  <option value="paid">4. Ödendi (paid)</option>
                  <option value="reconciled">5. Mutabakat Tamamlandı (reconciled)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">
                  Banka Referans / EFT Kodu:
                </label>
                <input
                  type="text"
                  placeholder="Örn: EFT-TR9928172601"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full bg-muted/50 border border-border/70 rounded-xl px-3 py-2 text-xs font-mono text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">
                  Yönetici Denetim Notu:
                </label>
                <textarea
                  rows={3}
                  placeholder="Hakediş onay veya aktarım notu..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-muted/50 border border-border/70 rounded-xl p-3 text-xs text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/70">
              <button
                onClick={() => setEditingPayout(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                İptal
              </button>

              <button
                onClick={handleSave}
                disabled={isUpdatingPayout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 disabled:opacity-50"
              >
                {isUpdatingPayout ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>Kaydet & Onayla</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
