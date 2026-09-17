'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
  Briefcase,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';
import { ProviderApplicationModal } from './ProviderApplicationModal';
import {
  SERVICE_DETAILS_CONFIG,
  type ServiceCategoryKey,
} from '@/types/providerAuth';
import { Badge } from '@/components/ui/Badge';

interface ProviderStatusBannerProps {
  className?: string;
}

const SERVICE_KEYS: ServiceCategoryKey[] = ['moving', 'taxi', 'travel', 'craftsman'];

export function ProviderStatusBanner({ className = '' }: ProviderStatusBannerProps) {
  const { getProfile } = useProviderAuthStore();
  const [activeModalService, setActiveModalService] = useState<ServiceCategoryKey | null>(null);

  return (
    <>
      <div className={`mx-4 space-y-2.5 ${className}`}>
        {SERVICE_KEYS.map((key) => {
          const profile = getProfile(key);
          const config = SERVICE_DETAILS_CONFIG[key];

          const isVerified = profile.status === 'provider_verified';
          const isApplicant = profile.status === 'provider_applicant';
          const isSuspended = profile.status === 'provider_suspended';

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                if (!isVerified) {
                  setActiveModalService(key);
                }
              }}
              className={`group overflow-hidden rounded-3xl border p-3.5 transition-all ${
                isVerified
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : isApplicant
                  ? 'border-blue-500/40 bg-blue-500/10 cursor-pointer'
                  : isSuspended
                  ? 'border-destructive/40 bg-destructive/10 cursor-pointer'
                  : 'border-border/80 bg-card hover:border-amber-500/40 hover:shadow-md cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl shadow-sm ${
                      isVerified
                        ? 'bg-emerald-500 text-white'
                        : isApplicant
                        ? 'bg-blue-500 text-white animate-pulse'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {config.iconEmoji}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">
                        {config.titleTr}
                      </h4>
                      <Badge
                        variant={
                          isVerified
                            ? 'success'
                            : isApplicant
                            ? 'secondary'
                            : isSuspended
                            ? 'destructive'
                            : 'outline'
                        }
                        className="text-[9px] py-0 px-1.5"
                      >
                        {isVerified
                          ? '✓ Doğrulandı'
                          : isApplicant
                          ? 'İnceleniyor'
                          : isSuspended
                          ? 'Askıda'
                          : 'Başvuru Yapılmadı'}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {isVerified
                        ? `${config.roleNameTr} yetkiniz aktif. Açık ilanlara teklif verebilirsiniz.`
                        : isApplicant
                        ? 'Belgeleriniz inceleniyor. Onay bekliyor.'
                        : `${config.roleNameTr} olarak hizmet vermek için başvurun.`}
                    </p>
                  </div>
                </div>

                {!isVerified && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {activeModalService && (
        <ProviderApplicationModal
          isOpen={!!activeModalService}
          onClose={() => setActiveModalService(null)}
          serviceType={activeModalService}
        />
      )}
    </>
  );
}
