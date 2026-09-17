'use client';

import React, { useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  FileText,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAdminFinanceStore } from '@/stores/useAdminFinanceStore';
import { cn } from '@/lib/utils';
import type { TimeFilterOption } from '@/types/finance';

function formatTL(kurus: number): string {
  const tl = kurus / 100;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(tl);
}

const TIME_FILTERS: { id: TimeFilterOption; label: string }[] = [
  { id: 'today', label: 'Bugün' },
  { id: 'yesterday', label: 'Dün' },
  { id: 'last_7_days', label: 'Son 7 Gün' },
  { id: 'last_30_days', label: 'Son 30 Gün' },
  { id: 'this_month', label: 'Bu Ay' },
  { id: 'last_month', label: 'Geçen Ay' },
  { id: 'custom', label: 'Tüm Zamanlar' },
];

export function FinanceReportsView() {
  const { timeFilter, setTimeFilter, metrics, downloadCsvExport, fetchOverview } =
    useAdminFinanceStore();

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Export CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 font-bold">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Finansal Raporlama ve Dışa Aktarım</h3>
            <p className="text-xs text-muted-foreground">
              Muhasebe ve denetim standartlarına uygun, KVKK korumalı CSV raporları üretin
            </p>
          </div>
        </div>

        <button
          onClick={downloadCsvExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>CSV Olarak İndir (Seçili Dönem)</span>
        </button>
      </div>

      {/* Time Filter Selector */}
      <div className="flex items-center gap-2 bg-card border border-border/70 p-3 rounded-2xl shadow-2xs overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-muted-foreground whitespace-nowrap pl-1">Rapor Dönemi:</span>
        <div className="flex items-center gap-1.5">
          {TIME_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                timeFilter === f.id
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-muted-foreground">Dönem Toplam Satış Hacmi</span>
          <div className="text-xl font-black text-foreground font-mono">
            {formatTL(metrics?.totalGrossVolumeKurus || 0)}
          </div>
          <p className="text-[10px] text-muted-foreground">Tüm modüller dahil brüt ciro</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-muted-foreground">Dönem Platform Komisyon Neti</span>
          <div className="text-xl font-black text-emerald-500 font-mono">
            {formatTL(metrics?.platformNetRevenueKurus || 0)}
          </div>
          <p className="text-[10px] text-muted-foreground">LifeOS kasasına giren net gelir</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-muted-foreground">Tamamlanan İadeler</span>
          <div className="text-xl font-black text-rose-500 font-mono">
            {formatTL(metrics?.completedRefundsKurus || 0)}
          </div>
          <p className="text-[10px] text-muted-foreground">İptal edilen işlem ve iade toplamı</p>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 flex items-start gap-3 text-xs">
        <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-muted-foreground">
          <span className="font-bold text-foreground block">Gizlilik & KVKK Güvencesi:</span>
          <p className="leading-relaxed text-[11px]">
            İndirilen tüm CSV ve finansal raporlarda alıcı kullanıcıların kişisel bilgileri, e-postaları ve hassas ödeme verileri otomatik olarak maskelenir (ör. usr-std-***4). Finansal kayıtlar güvenli ve denetlenebilir tutulur.
          </p>
        </div>
      </div>
    </div>
  );
}
