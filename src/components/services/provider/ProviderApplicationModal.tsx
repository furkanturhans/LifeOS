'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldCheck,
  FileText,
  Sparkles,
  AlertCircle,
  Building,
} from 'lucide-react';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  SERVICE_DETAILS_CONFIG,
  SERVICE_DOCUMENT_REQUIREMENTS,
  type ServiceCategoryKey,
} from '@/types/providerAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ProviderApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType?: ServiceCategoryKey;
}

export function ProviderApplicationModal({
  isOpen,
  onClose,
  serviceType = 'moving',
}: ProviderApplicationModalProps) {
  const { user } = useAuthStore();
  const { submitApplication } = useProviderAuthStore();

  const config = SERVICE_DETAILS_CONFIG[serviceType] || SERVICE_DETAILS_CONFIG.moving;
  const docs = SERVICE_DOCUMENT_REQUIREMENTS[serviceType] || SERVICE_DOCUMENT_REQUIREMENTS.moving;

  const [fullName, setFullName] = useState(user?.displayName || '');
  const [businessTitle, setBusinessTitle] = useState('');
  const [vehicleOrEquipmentInfo, setVehicleOrEquipmentInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Lütfen ad ve soyadınızı girin.');
      return;
    }

    submitApplication(serviceType, {
      fullName,
      businessTitle,
      vehicleOrEquipmentInfo,
      notes,
    });

    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header - Strictly Service Specific */}
            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-600 text-3xl shadow-lg shadow-emerald-500/20 text-white">
                {config.iconEmoji}
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {config.titleTr} Hizmet Veren Başvurusu
              </h3>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {config.roleNameTr} Profili
              </p>
              {/* Mandatory Policy Text */}
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed px-2">
                “Hizmet veren olarak teklif verebilmek için başvurunuzun onaylanması gerekir.”
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal / Company Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  label="Ad Soyad / Yetkili *"
                  placeholder="Adınız Soyadınız"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  label="Ticari Unvan / Şirket"
                  placeholder="Örn: Öz Hilal Taşımacılık Ltd."
                  value={businessTitle}
                  onChange={(e) => setBusinessTitle(e.target.value)}
                  icon={<Building className="h-4 w-4 text-muted-foreground" />}
                />
              </div>

              {/* Service Specific Vehicle / Equipment / Certification Info */}
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  {serviceType === 'moving'
                    ? 'Araç, Plaka & Yetki Belgesi Bilgisi'
                    : serviceType === 'taxi'
                    ? 'Ticari Plaka, Ruhsat & Taksi Bilgisi'
                    : serviceType === 'travel'
                    ? 'Otobüs/Minibüs Plaka & D2 Yetki Bilgisi'
                    : 'Ustalık Belgesi & Mesleki Uzmanlık Alanı'}
                </label>
                <input
                  type="text"
                  placeholder={config.vehicleOrEquipmentPlaceholder}
                  value={vehicleOrEquipmentInfo}
                  onChange={(e) => setVehicleOrEquipmentInfo(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Additional notes */}
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Ek Açıklama & Deneyim (Opsiyonel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Hizmet tecrübeniz, ekip kapasiteniz veya belirtmek istediğiniz ek bilgiler..."
                  rows={2}
                  className="w-full rounded-2xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Service-Specific Document Requirements Notice */}
              <div className="rounded-2xl border border-border/80 bg-muted/30 p-3.5 text-xs space-y-2">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  <span>{config.titleTr} İçin Gerekli Belge Standartları</span>
                </div>
                <div className="space-y-1.5">
                  {docs.map((doc, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 text-[11px]">
                      <div>
                        <span className="font-medium text-foreground">• {doc.titleTr}</span>
                        <p className="text-[10px] text-muted-foreground ml-2.5">{doc.descriptionTr}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {doc.isMandatory ? 'Zorunlu' : 'Opsiyonel'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {config.titleTr} Başvurusunu Gönder
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
