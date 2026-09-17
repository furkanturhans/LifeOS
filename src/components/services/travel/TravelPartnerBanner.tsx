'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useTravelPartnerStore } from '@/stores/useTravelPartnerStore';
import { TravelPartnerApplicationModal } from './partner/TravelPartnerApplicationModal';
import { Badge } from '@/components/ui/Badge';

interface TravelPartnerBannerProps {
  onOpenPartner?: () => void;
}

export function TravelPartnerBanner({ onOpenPartner }: TravelPartnerBannerProps) {
  const { status, partnerProfile } = useTravelPartnerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isVerified = status === 'partner_verified';
  const isApplicant = status === 'partner_applicant';

  const handleClick = () => {
    if (onOpenPartner) {
      onOpenPartner();
    } else if (isVerified) {
      // If already verified and no prop, nothing
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="mx-4 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleClick}
          className="group cursor-pointer overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent p-4.5 shadow-sm transition-all hover:border-blue-500/50 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-md shadow-blue-500/20 text-xl">
                🏢
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Otobüs Firması & Acenteler
                  </span>
                  <Badge
                    variant={isVerified ? 'success' : isApplicant ? 'secondary' : 'outline'}
                    className="text-[9px] py-0 px-1.5"
                  >
                    {isVerified
                      ? '✓ İş Ortağı Onaylı'
                      : isApplicant
                      ? 'Başvuru İnceleniyor'
                      : 'Firma Girişi'}
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  {isVerified ? `${partnerProfile?.companyName} Firma Paneli` : 'Seyahat İş Ortağımız Olun'}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {isVerified
                    ? 'Araçlarınızı, rotalarınızı ve sefer taslaklarınızı yönetin.'
                    : 'D2/B2 yetki belgeli otobüs seferlerinizi LifeOS seyahat merkezine bağlayın.'}
                </p>
              </div>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </motion.div>
      </div>

      <TravelPartnerApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
