'use client';

import React from 'react';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useFinanceStore } from '@/stores/useFinanceStore';

interface FinanceHeaderProps {
  onOpenPrivacyInfo?: () => void;
}

export function FinanceHeader({ onOpenPrivacyInfo }: FinanceHeaderProps) {
  const { securityConfig, setPrivacyMode } = useFinanceStore();

  return (
    <PageHeader
      title="Finans"
      subtitle="Kişisel varlık, bütçe ve harcama yönetimi"
      icon={<Wallet className="h-4 w-4 text-emerald-500" />}
      backHref="/home"
      badge={
        <Badge variant="secondary" className="text-[10px] py-0 px-2">
          Güvenli Alan
        </Badge>
      }
      action={
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setPrivacyMode(!securityConfig.isPrivacyModeActive)}
          className="gap-1.5"
          title="Gizlilik Modu"
        >
          {securityConfig.isPrivacyModeActive ? (
            <>
              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Gizli</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Görünür</span>
            </>
          )}
        </Button>
      }
    />
  );
}

