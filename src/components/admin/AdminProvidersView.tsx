'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Truck, Car, Wrench, Bus, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAdminStore } from '@/stores/useAdminStore';

export function AdminProvidersView() {
  const { users } = useAdminStore();
  const [selectedService, setSelectedService] = useState<'all' | 'moving' | 'taxi' | 'craftsman' | 'travel'>('all');

  const providers = users.filter((u) => {
    if (selectedService === 'all') return u.roles.providerServices.length > 0;
    return u.roles.providerServices.includes(selectedService);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">Hizmet Sağlayıcılar</h2>
          <p className="text-xs text-muted-foreground">Taksi, Nakliye, Usta ve Seyahat için ayrı ayrı yetkilendirilen sağlayıcılar</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'moving', label: 'Nakliye' },
            { id: 'taxi', label: 'Taksi' },
            { id: 'craftsman', label: 'Usta' },
            { id: 'travel', label: 'Seyahat' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedService(item.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedService === item.id
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {providers.map((p) => (
          <Card key={p.id} className="p-4 border-border bg-card shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 font-bold text-xl border border-emerald-500/20">
                🚚
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-foreground">{p.displayName}</h4>
                  <StatusBadge status="verified" label="Onaylı Sağlayıcı" size="sm" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  ID: @{p.lifeosId} • E-posta: {p.maskedEmail}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  {p.roles.providerServices.map((srv) => (
                    <span key={srv} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                      {srv === 'moving' && '🚚 Nakliye'}
                      {srv === 'taxi' && '🚕 Taksi'}
                      {srv === 'craftsman' && '🛠️ Usta'}
                      {srv === 'travel' && '🚌 Seyahat'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold text-destructive hover:bg-destructive/10 border-border"
              >
                Hizmeti Askıya Al
              </Button>
            </div>
          </Card>
        ))}

        {providers.length === 0 && (
          <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-3xl">
            Seçili kategoride onaylanmış hizmet sağlayıcı bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
}
