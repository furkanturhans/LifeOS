'use client';

import React, { useEffect, useState } from 'react';
import { RotateCcw, AlertCircle, CheckCircle2, ShieldCheck, Check, X, Clock } from 'lucide-react';
import { useAdminFinanceStore } from '@/stores/useAdminFinanceStore';
import type { CreditRefundRequest } from '@/types/payment';
import { Button } from '@/components/ui/Button';

function formatTL(kurus: number): string {
  const tl = kurus / 100;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(tl);
}

export function FinanceRefundsView() {
  const { transactions, fetchTransactions } = useAdminFinanceStore();
  const [creditRefundRequests, setCreditRefundRequests] = useState<CreditRefundRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchCreditRefunds = async () => {
    setIsLoadingRequests(true);
    try {
      const res = await fetch('/api/admin/finance/credits');
      const data = await res.json();
      if (data.success) {
        setCreditRefundRequests(data.refundRequests || []);
      }
    } catch {
      // Ignored
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCreditRefunds();
  }, [fetchTransactions]);

  const handleReview = async (requestId: string, decision: 'approve' | 'reject') => {
    const note = prompt(
      decision === 'approve'
        ? 'Onay notu veya dekont açıklaması giriniz:'
        : 'Ret gerekçesini giriniz:'
    );
    if (note === null) return;

    try {
      const res = await fetch('/api/admin/finance/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review_refund',
          requestId,
          adminId: 'admin_super',
          decision,
          decisionNote: note || (decision === 'approve' ? 'Yönetici onayı ile iade edildi.' : 'Ret kararı.'),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message || 'İşlem tamamlandı.');
        setTimeout(() => setActionMessage(null), 2500);
        fetchCreditRefunds();
      } else {
        alert(data.error || 'İşlem başarısız.');
      }
    } catch {
      alert('Sunucuya bağlanılamadı.');
    }
  };

  const refundTransactions = transactions.filter(
    (t) => t.type === 'refund' || t.type === 'partial_refund' || t.status === 'refunded'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Action Notification */}
      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* 1. LifeOS Kredisi İade Talepleri Yönetimi */}
      <div className="space-y-3">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Kullanılmamış Kredi İade Talepleri</h3>
                <p className="text-xs text-muted-foreground">
                  Kullanıcıların satın alıp hiç kullanmadığı krediler için orijinal ödeme kanalına iade onay merkezi
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
              {creditRefundRequests.filter((r) => r.status === 'pending_review').length} Bekleyen Talep
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold">
                  <th className="p-3.5">Talep No & Tarih</th>
                  <th className="p-3.5">Kullanıcı</th>
                  <th className="p-3.5">İade Nedeni</th>
                  <th className="p-3.5">Orijinal Ödeme Kanalı</th>
                  <th className="p-3.5 text-right">Kredi Miktarı</th>
                  <th className="p-3.5 text-right">İade Tutarı</th>
                  <th className="p-3.5 text-center">Karar / Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {creditRefundRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground text-xs">
                      İncelenmeyi bekleyen kredi iade talebi bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  creditRefundRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-foreground">{req.id}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(req.createdAt).toLocaleString('tr-TR')}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-foreground font-mono">{req.userId}</td>
                      <td className="p-3.5 max-w-[200px] text-muted-foreground">
                        <span className="text-xs text-foreground font-medium block truncate">{req.reason}</span>
                        {req.adminDecisionNote && (
                          <span className="text-[10px] text-muted-foreground italic block">
                            Not: {req.adminDecisionNote}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-medium text-foreground">{req.originalPaymentMethod}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-foreground">
                        {req.creditAmount} Kredi
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-amber-600">
                        {formatTL(req.refundAmountKurus)}
                      </td>
                      <td className="p-3.5 text-center">
                        {req.status === 'pending_review' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleReview(req.id, 'approve')}
                              className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1"
                              title="Onayla & Orijinal Kanala İade Et"
                            >
                              <Check className="h-3 w-3" />
                              <span>Onayla</span>
                            </button>
                            <button
                              onClick={() => handleReview(req.id, 'reject')}
                              className="h-7 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1"
                              title="Reddet"
                            >
                              <X className="h-3 w-3" />
                              <span>Reddet</span>
                            </button>
                          </div>
                        ) : req.status === 'approved' || req.status === 'processed' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            <Check className="h-3 w-3" /> Onaylandı & İade Edildi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-md">
                            <X className="h-3 w-3" /> Reddedildi
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Tüm İadeler & Ters Defter Kayıtları */}
      <div className="space-y-3 pt-4">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Hizmet & Ders İptal Kayıtları (Ters Defter)</h3>
              <p className="text-xs text-muted-foreground">
                İptal edilen canlı dersler veya hakem heyeti kararıyla düzeltilen işlemler
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold">
                  <th className="p-3.5">İşlem Kodu & Tarih</th>
                  <th className="p-3.5">İade Nedeni / Kalem</th>
                  <th className="p-3.5">Eğitmen / Sağlayıcı</th>
                  <th className="p-3.5">Müşteri</th>
                  <th className="p-3.5 text-right">İade Tutarı</th>
                  <th className="p-3.5 text-right">LifeOS İade Payı</th>
                  <th className="p-3.5 text-center">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {refundTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">
                      Kayıtlı aktif bir iade veya düzeltme işlemi bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  refundTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-rose-500 text-xs">{tx.id}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleString('tr-TR')}
                        </div>
                      </td>
                      <td className="p-3.5 max-w-[200px]">
                        <span className="font-semibold text-foreground block truncate">
                          {tx.referenceItemTitle}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {tx.auditNote || 'İade işlemi'}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-foreground">{tx.sellerName || '-'}</td>
                      <td className="p-3.5 font-mono text-muted-foreground">{tx.buyerMaskedId}</td>
                      <td className="p-3.5 text-right font-black font-mono text-rose-500">
                        -{formatTL(tx.refundAmountKurus)}
                      </td>
                      <td className="p-3.5 text-right font-bold font-mono text-rose-500">
                        {formatTL(tx.platformNetKurus)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
                          Tam İade Edildi
                        </span>
                      </td>
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
