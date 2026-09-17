'use client';

import React, { useEffect } from 'react';
import { Truck, Car, Wrench, Compass, Award } from 'lucide-react';
import { useAdminFinanceStore } from '@/stores/useAdminFinanceStore';

function formatTL(kurus: number): string {
  const tl = kurus / 100;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(tl);
}

export function FinanceProvidersView() {
  const { metrics, fetchOverview } = useAdminFinanceStore();

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Overview */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-2xs space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Hizmet Sağlayıcı Kazançları & Pazar Yeri</h3>
            <p className="text-xs text-muted-foreground">
              Nakliye, Taksi, Usta ve Seyahat hizmet sağlayıcılarının brüt cirosu ve komisyon dökümleri
            </p>
          </div>
        </div>
      </div>

      {/* Providers Table */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-border/70 flex items-center justify-between">
          <h4 className="text-xs font-bold text-foreground">Hizmet Sağlayıcıları ve Komisyon Tablosu</h4>
          <span className="text-[10px] text-muted-foreground font-mono">
            {metrics?.topProviders.length || 0} Aktif Sağlayıcı
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold">
                <th className="p-3.5">Sağlayıcı Adı & Hizmet Alanı</th>
                <th className="p-3.5 text-center">Hizmet / İş Adedi</th>
                <th className="p-3.5 text-right">Toplam Brüt Hacim</th>
                <th className="p-3.5 text-right">LifeOS Komisyonu</th>
                <th className="p-3.5 text-right">Sağlayıcı Net Kazancı</th>
                <th className="p-3.5 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {metrics?.topProviders.map((prov) => {
                const providerNet = prov.grossKurus - prov.commissionKurus;
                return (
                  <tr key={prov.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-foreground text-xs">{prov.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {prov.serviceType} • {prov.id}
                      </div>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-foreground">{prov.jobsCount}</td>
                    <td className="p-3.5 text-right font-bold font-mono text-foreground">{formatTL(prov.grossKurus)}</td>
                    <td className="p-3.5 text-right font-bold font-mono text-primary">
                      {formatTL(prov.commissionKurus)}
                    </td>
                    <td className="p-3.5 text-right font-black font-mono text-emerald-500">
                      {formatTL(providerNet)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        Mutabakat Tamam
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
