'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  FileCheck,
  ShieldCheck,
  Eye,
  X,
  MessageSquare,
  GraduationCap,
  Truck,
  Car,
  Wrench,
  Bus,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdminStore } from '@/stores/useAdminStore';
import type { AdminApplication, ApplicationType, ApplicationStatus } from '@/types/admin';
import { cn } from '@/lib/utils';

export function AdminApplicationsView() {
  const {
    applications,
    selectedApplication,
    setSelectedApplication,
    applicationTypeFilter,
    setApplicationTypeFilter,
    applicationStatusFilter,
    setApplicationStatusFilter,
    applicationSearchQuery,
    setApplicationSearchQuery,
    executeApplicationAction,
  } = useAdminStore();

  // Action Modal State
  const [actionModalType, setActionModalType] = useState<
    'approve' | 'reject' | 'under_review' | 'need_info' | 'suspend' | null
  >(null);
  const [actionReason, setActionReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const getAppTypeInfo = (type: ApplicationType) => {
    switch (type) {
      case 'instructor':
        return { label: 'Eğitmen', icon: GraduationCap, color: 'text-amber-500 bg-amber-500/10' };
      case 'moving':
        return { label: 'Nakliye', icon: Truck, color: 'text-emerald-500 bg-emerald-500/10' };
      case 'taxi':
        return { label: 'Taksi', icon: Car, color: 'text-amber-500 bg-amber-500/10' };
      case 'craftsman':
        return { label: 'Usta', icon: Wrench, color: 'text-purple-500 bg-purple-500/10' };
      case 'travel':
        return { label: 'Seyahat', icon: Bus, color: 'text-blue-500 bg-blue-500/10' };
      default:
        return { label: 'Başvuru', icon: FileText, color: 'text-muted-foreground bg-muted' };
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'verified':
        return <StatusBadge status="verified" label="Onaylandı" size="sm" />;
      case 'pending':
        return <StatusBadge status="pending" label="Beklemede" size="sm" />;
      case 'under_review':
        return <StatusBadge status="bidding" label="İncelemede" size="sm" />;
      case 'need_more_info':
        return <StatusBadge status="pending" label="Ek Bilgi Bekleniyor" size="sm" />;
      case 'rejected':
        return <StatusBadge status="rejected" label="Reddedildi" size="sm" />;
      case 'suspended':
        return <StatusBadge status="rejected" label="Askıya Alındı" size="sm" />;
      default:
        return <StatusBadge status="draft" label={status} size="sm" />;
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedApplication || !actionModalType) return;
    setIsProcessing(true);

    const res = await executeApplicationAction({
      applicationId: selectedApplication.id,
      action: actionModalType,
      reason: actionReason.trim(),
      needInfoNotes: actionModalType === 'need_info' ? actionReason.trim() : undefined,
      internalAdminNotes: internalNotes.trim(),
    });

    setIsProcessing(false);
    if (res.success) {
      setFeedbackMessage(res.message || 'İşlem başarıyla gerçekleştirildi.');
      setTimeout(() => {
        setActionModalType(null);
        setSelectedApplication(null);
        setActionReason('');
        setInternalNotes('');
        setFeedbackMessage(null);
      }, 1200);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <Card className="p-4 border-border bg-card shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={applicationSearchQuery}
              onChange={(e) => setApplicationSearchQuery(e.target.value)}
              placeholder="Başvuru sahibi, başlık veya uzmanlık alanı ara..."
              className="w-full h-9 rounded-xl border border-border bg-background pl-9 pr-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={applicationTypeFilter}
            onChange={(e) => setApplicationTypeFilter(e.target.value as any)}
            className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none shrink-0"
          >
            <option value="all">Tüm Başvuru Türleri</option>
            <option value="instructor">Eğitmen Başvuruları</option>
            <option value="moving">Nakliye Başvuruları</option>
            <option value="taxi">Taksi Başvuruları</option>
            <option value="craftsman">Usta Başvuruları</option>
            <option value="travel">Seyahat Başvuruları</option>
          </select>

          {/* Status Filter */}
          <select
            value={applicationStatusFilter}
            onChange={(e) => setApplicationStatusFilter(e.target.value as any)}
            className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none shrink-0"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="under_review">İncelemede</option>
            <option value="need_more_info">Ek Bilgi Bekleniyor</option>
            <option value="verified">Onaylandı</option>
            <option value="rejected">Reddedildi</option>
            <option value="suspended">Askıya Alındı</option>
          </select>
        </div>
      </Card>

      {/* Applications Queue Table / Card List */}
      <div className="space-y-2.5">
        {applications.length > 0 ? (
          applications.map((app) => {
            const typeInfo = getAppTypeInfo(app.applicationType);
            const Icon = typeInfo.icon;
            const submittedDocsCount = app.documents.filter((d) => d.status === 'submitted').length;
            const verifiedDocsCount = app.documents.filter((d) => d.status === 'verified').length;

            return (
              <Card
                key={app.id}
                className="p-4 border-border bg-card shadow-xs hover:border-primary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-bold',
                      typeInfo.color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-foreground truncate">
                        {app.applicantName}
                      </h4>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        ({app.applicantMaskedEmail || 'Gizli E-posta'})
                      </span>
                      {getStatusBadge(app.status)}
                    </div>

                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{app.title}</p>

                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>Kategori: <strong className="text-foreground font-semibold">{app.categoryOrExpertise}</strong></span>
                      <span>•</span>
                      <span>Belgeler: <strong className="text-foreground font-semibold">{verifiedDocsCount}/{app.documents.length} Onaylı</strong> {submittedDocsCount > 0 && `(${submittedDocsCount} bekliyor)`}</span>
                      <span>•</span>
                      <span>Tarih: {new Date(app.submittedAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApplication(app)}
                    className="h-8 text-xs font-bold px-3 border-border hover:bg-muted"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1 text-primary" />
                    İncele & İşlem Yap
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-3xl">
            Seçilen filtrelere uygun başvuru bulunamadı.
          </div>
        )}
      </div>

      {/* Application Detail & Actions Modal */}
      <AnimatePresence>
        {selectedApplication && !actionModalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                    📋
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground truncate">
                      Başvuru Detayı: {selectedApplication.applicantName}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      ID: #{selectedApplication.id} • Tür: {selectedApplication.applicationType.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="h-8 w-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {/* Status & Category Bar */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground block text-[11px]">Mevcut Durum:</span>
                    <div>{getStatusBadge(selectedApplication.status)}</div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-muted-foreground block text-[11px]">Hizmet / Alan:</span>
                    <span className="font-bold text-foreground">{selectedApplication.categoryOrExpertise}</span>
                  </div>
                </div>

                {/* Description & Statement */}
                <div className="space-y-1">
                  <span className="font-bold text-foreground block">Başvuru Açıklaması & Niyet:</span>
                  <p className="p-3 rounded-xl bg-background border border-border leading-relaxed text-muted-foreground">
                    {selectedApplication.description}
                  </p>
                </div>

                {/* Submitted Documents Checklist */}
                <div className="space-y-2">
                  <span className="font-bold text-foreground block">Yüklenen Belgeler ({selectedApplication.documents.length}):</span>
                  <div className="space-y-2">
                    {selectedApplication.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-xl border border-border/80 bg-background flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <div className="min-w-0">
                            <h5 className="font-bold text-foreground truncate">{doc.titleTr}</h5>
                            <p className="text-[11px] text-muted-foreground truncate">{doc.descriptionTr}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground">
                          {doc.status === 'verified' ? '✓ Doğrulandı' : 'İnceleniyor'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Internal Admin Notes */}
                {selectedApplication.internalAdminNotes && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                    <strong className="text-amber-600 dark:text-amber-400 block mb-1">
                      🔒 Yönetici İç Notu (Kullanıcıya Gösterilmez):
                    </strong>
                    <p className="text-foreground">{selectedApplication.internalAdminNotes}</p>
                  </div>
                )}
              </div>

              {/* Modal Actions Footer */}
              <div className="p-4 border-t border-border bg-muted/30 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActionModalType('under_review')}
                    className="h-8 text-xs font-semibold"
                  >
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    İncelemeye Al
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActionModalType('need_info')}
                    className="h-8 text-xs font-semibold text-amber-600"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    Ek Bilgi İste
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setActionModalType('reject')}
                    className="h-8 text-xs font-bold"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Reddet
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActionModalType('approve')}
                    className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Başvuruyu Onayla
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decision Confirmation Sub-Modal (Approve, Reject, Need Info, etc.) */}
      <AnimatePresence>
        {actionModalType && selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">
                    {actionModalType === 'approve' && 'Başvuruyu Onayla'}
                    {actionModalType === 'reject' && 'Başvuruyu Reddet'}
                    {actionModalType === 'need_info' && 'Ek Bilgi ve Belge İste'}
                    {actionModalType === 'under_review' && 'İnceleme Durumuna Al'}
                  </h4>
                </div>
                <button
                  onClick={() => setActionModalType(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {feedbackMessage ? (
                <div className="p-4 text-center text-xs font-bold text-emerald-500 bg-emerald-500/10 rounded-2xl">
                  {feedbackMessage}
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>{selectedApplication.applicantName}</strong> adlı kullanıcının{' '}
                    <strong>{selectedApplication.title}</strong> başvurusu için işlem uygulanacaktır.
                  </p>

                  {(actionModalType === 'reject' || actionModalType === 'need_info') && (
                    <div>
                      <label className="block font-bold text-foreground mb-1">
                        {actionModalType === 'reject' ? 'Ret Gerekçesi (Kullanıcıya İletilir) *' : 'Talep Edilen Ek Bilgi Açıklaması *'}
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="Kullanıcıya gönderilecek profesyonel gerekçe..."
                        className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-foreground mb-1">
                      Yönetici İç Notu (Opsiyonel / Gizli)
                    </label>
                    <input
                      type="text"
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Yalnızca yöneticilerin göreceği denetim notu..."
                      className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActionModalType(null)}
                      className="text-xs"
                    >
                      Vazgeç
                    </Button>
                    <Button
                      variant={actionModalType === 'reject' ? 'destructive' : 'primary'}
                      size="sm"
                      onClick={handleConfirmAction}
                      disabled={
                        isProcessing ||
                        ((actionModalType === 'reject' || actionModalType === 'need_info') && !actionReason.trim())
                      }
                      className={cn(
                        'text-xs font-bold',
                        actionModalType === 'approve' && 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      )}
                    >
                      {isProcessing ? 'İşleniyor...' : 'Onayla & Denetime İşle'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
