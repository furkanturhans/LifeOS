'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Users, ShieldAlert, UserCheck, Search, ShieldCheck } from 'lucide-react';
import { useAdminStore } from '@/stores/useAdminStore';

export function AdminUsersView() {
  const { users, updateUserStatus } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.displayName.toLowerCase().includes(q) || u.lifeosId.toLowerCase().includes(q);
  });

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'restricted' | 'suspended') => {
    await updateUserStatus({
      userId,
      status: newStatus,
      reason: `Yönetici panelinden ${newStatus} durumuna alındı.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">Kullanıcı Yönetimi ({users.length})</h2>
          <p className="text-xs text-muted-foreground">Kullanıcı hesap durumu, roller ve güvenlik kısıtlamaları</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kullanıcı ara..."
            className="w-full h-8 rounded-xl border border-border bg-background pl-9 pr-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2.5">
        {filteredUsers.map((u) => (
          <Card key={u.id} className="p-4 border-border bg-card shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 font-bold text-sm border border-indigo-500/20">
                {u.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-foreground">{u.displayName}</h4>
                  <span className="text-[11px] text-muted-foreground font-mono">@{u.lifeosId}</span>
                  {u.accountStatus === 'active' && <StatusBadge status="verified" label="Aktif Hesap" size="sm" />}
                  {u.accountStatus === 'restricted' && <StatusBadge status="pending" label="Kısıtlı" size="sm" />}
                  {u.accountStatus === 'suspended' && <StatusBadge status="rejected" label="Askıda" size="sm" />}
                </div>

                <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>E-posta: <strong className="font-mono text-foreground">{u.maskedEmail}</strong></span>
                  <span>•</span>
                  <span>Kayıt: {new Date(u.createdAt).toLocaleDateString('tr-TR')}</span>
                  {u.roles.isAdmin && (
                    <>
                      <span>•</span>
                      <span className="text-primary font-bold">🛡️ Yönetici</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {u.accountStatus !== 'active' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(u.id, 'active')}
                  className="h-8 text-xs font-semibold text-emerald-600 border-border hover:bg-emerald-500/10"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                  Aktifleştir
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(u.id, 'restricted')}
                    className="h-8 text-xs font-semibold text-amber-600 border-border hover:bg-amber-500/10"
                  >
                    Kısıtla
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(u.id, 'suspended')}
                    className="h-8 text-xs font-semibold text-destructive border-border hover:bg-destructive/10"
                  >
                    Askıya Al
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
