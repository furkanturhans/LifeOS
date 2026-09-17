'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  ShieldCheck,
  UserCheck,
  FileText,
  Bus,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useTravelPartnerStore } from '@/stores/useTravelPartnerStore';
import { PARTNER_ROLE_LABELS } from '@/types/travelPartner';
import { Badge } from '@/components/ui/Badge';

export function CompanyProfileSection() {
  const { partnerProfile, getMyVehicles, getMyRoutes, getMyDraftTrips } =
    useTravelPartnerStore();

  if (!partnerProfile) return null;

  const vehicles = getMyVehicles();
  const routes = getMyRoutes();
  const draftTrips = getMyDraftTrips();

  return (
    <div className="space-y-4">
      {/* Company Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent p-5 shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/25 text-2xl">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  {partnerProfile.companyName}
                </h3>
                <Badge variant="success" className="text-[10px] py-0 px-2">
                  ✓ Doğrulanmış Firma
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                D2 / B2 Şehirlerarası Karayolu Yolcu Taşıma İş Ortağı
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-5 grid grid-cols-3 gap-2.5 pt-4 border-t border-border/40 text-center">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-3">
            <div className="text-lg font-bold text-blue-500">{vehicles.length}</div>
            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
              Tanımlı Araç
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/60 p-3">
            <div className="text-lg font-bold text-indigo-500">{routes.length}</div>
            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
              Aktif Rota
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/60 p-3">
            <div className="text-lg font-bold text-emerald-500">{draftTrips.length}</div>
            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
              Taslak Sefer
            </div>
          </div>
        </div>
      </motion.div>

      {/* Details Box */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-3 text-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
          Firma & Yetki Bilgileri
        </h4>

        <div className="flex items-center justify-between py-1 border-b border-border/40">
          <span className="text-muted-foreground">Yetkili Temsilci:</span>
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-blue-500" />
            {partnerProfile.authorizedPersonName}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-border/40">
          <span className="text-muted-foreground">Yetki Ünvanı:</span>
          <span className="font-medium text-foreground">
            {PARTNER_ROLE_LABELS[partnerProfile.authorizedRole]}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-border/40">
          <span className="text-muted-foreground">Ulaştırma Belge No (D2/B2):</span>
          <span className="font-mono text-foreground font-semibold">
            {partnerProfile.d2LicenseNumber || 'D2.34.19827'}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-border/40">
          <span className="text-muted-foreground">Hizmet Alanı:</span>
          <span className="text-foreground font-medium">Şehirlerarası Otobüs</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground">Doğrulama Durumu:</span>
          <span className="text-emerald-500 font-bold flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Doğrulandı & Yetkili
          </span>
        </div>
      </div>
    </div>
  );
}
