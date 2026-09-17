'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Copy, Check, Sparkles } from 'lucide-react';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface FamilyHeaderProps {
  onOpenInvite: () => void;
  onOpenCreate: () => void;
}

export function FamilyHeader({ onOpenInvite, onOpenCreate }: FamilyHeaderProps) {
  const { family } = useFamilyStore();
  const [copied, setCopied] = useState(false);

  function handleCopyCode() {
    if (!family?.inviteCode) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(family.inviteCode);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <PageHeader
        title={family?.name || 'Aile'}
        subtitle={family ? `${family.members.length} Aile Üyesi` : 'Kişisel Aile Alanı'}
        icon={<Users className="h-4 w-4 text-primary" />}
        backHref="/home"
        badge={
          <Badge variant="secondary" className="text-[10px] py-0 px-2">
            Alan
          </Badge>
        }
        action={
          family ? (
            <Button onClick={onOpenInvite} size="sm" variant="secondary" className="gap-1.5">
              <UserPlus className="h-3.5 w-3.5" />
              <span>Davet Et</span>
            </Button>
          ) : (
            <Button onClick={onOpenCreate} size="sm" variant="primary" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Aileni Kur</span>
            </Button>
          )
        }
      />

      {/* Invite Code Banner */}
      {family && (
        <div className="mx-4 mt-3 flex items-center justify-between rounded-xl border border-border/70 bg-muted/40 px-3.5 py-2 text-xs text-muted-foreground sm:mx-6">
          <span className="text-[11px]">
            Aile Kodu: <strong className="font-mono text-foreground font-semibold ml-1">{family.inviteCode}</strong>
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 text-[11px]">Kopyalandı</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="text-[11px]">Kopyala</span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}

