'use client';

import React from 'react';
import { ShieldCheck, Image, LockKeyhole, AlertTriangle, Eye, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { PhotoAnalysisItem } from '@/types/assistant';

interface AssistantPhotoConsentModalProps {
  photo: PhotoAnalysisItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (photo: PhotoAnalysisItem) => void;
}

export function AssistantPhotoConsentModal({
  photo,
  isOpen,
  onClose,
  onConfirm,
}: AssistantPhotoConsentModalProps) {
  if (!photo) return null;

  function handleConfirm() {
    if (!photo) return;
    onConfirm(photo);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Fotoğraf Analizi Güvenlik Onayı</span>
          </div>
          <h2 className="text-base font-bold text-foreground">
            Seçili Fotoğraf Analizi
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fotoğrafınız yalnızca bu istek kapsamında değerlendirilir; arka planda arşiv veya yüz taraması yapılmaz.
          </p>
        </div>

        {/* Photo Preview & Metadata info */}
        <div className="flex items-start gap-4 rounded-xl border border-border bg-muted/40 p-3">
          {photo.dataUrl ? (
            <img
              src={photo.dataUrl}
              alt={photo.fileName}
              className="h-20 w-20 rounded-lg object-cover border border-border shrink-0 bg-background"
            />
          ) : (
            <div className="h-20 w-20 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
              <Image className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-1 text-xs">
            <div className="font-bold text-foreground truncate">{photo.fileName}</div>
            <div className="text-[11px] text-muted-foreground">
              Boyut: {(photo.sizeBytes / 1024).toFixed(1)} KB • {photo.mimeType}
            </div>

            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <LockKeyhole className="h-3.5 w-3.5" />
              <span>GPS ve Kişisel EXIF bilgileri temizlendi</span>
            </div>
          </div>
        </div>

        {/* Scope & Destination Details */}
        <div className="rounded-xl border border-border/80 bg-card p-3 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Analiz Amacı:</span>
            <span className="font-medium text-foreground">{photo.analysisPurpose}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Hedef Sağlayıcı:</span>
            <span className="font-medium text-foreground">{photo.targetAIProvider}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Kapsam Süresi:</span>
            <span className="font-semibold text-primary">Yalnızca Bu Soru</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Vazgeç
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm} className="font-semibold">
            <Check className="h-3.5 w-3.5 mr-1" />
            Analizi Onayla ve Gönder
          </Button>
        </div>
      </div>
    </Modal>
  );
}
