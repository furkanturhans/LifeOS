'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  LockKeyhole,
  FileText,
  ShieldCheck,
  Film,
  Terminal,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAssistantStore } from '@/stores/useAssistantStore';
import {
  ASSISTANT_TYPE_CONFIG,
  ASSISTANT_PERMISSION_SCOPES,
  type AssistantTask,
} from '@/types/assistant';

interface AssistantTaskDetailModalProps {
  task: AssistantTask;
  isOpen: boolean;
  onClose: () => void;
}

export function AssistantTaskDetailModal({
  task,
  isOpen,
  onClose,
}: AssistantTaskDetailModalProps) {
  const { approveTask, cancelTask, deleteTask } = useAssistantStore();

  const config = ASSISTANT_TYPE_CONFIG[task.type];
  const isPendingApproval = task.status === 'pending_approval';
  const isInProgress = task.status === 'in_progress';
  const isCompleted = task.status === 'completed';

  async function handleApprove() {
    await approveTask(task.id);
  }

  function handleCancel() {
    cancelTask(task.id);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-5">
        {/* Header */}
        <div className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {config.titleTr}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs text-muted-foreground">
              {new Date(task.createdAt).toLocaleString('tr-TR')}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {task.title}
            </h2>
            <StatusBadge
              status={
                isPendingApproval
                  ? 'pending'
                  : isInProgress
                  ? 'bidding'
                  : isCompleted
                  ? 'completed'
                  : 'cancelled'
              }
              label={
                isPendingApproval
                  ? 'Onay Bekliyor'
                  : isInProgress
                  ? 'İşleniyor'
                  : isCompleted
                  ? 'Tamamlandı'
                  : 'İptal Edildi'
              }
              size="sm"
            />
          </div>

          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Video / Content Specs Schema Box if present */}
        {task.contentDetails && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
              <Film className="h-4 w-4" />
              <span>Gelecek Video & İçerik Parametreleri</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-muted-foreground block">Tür:</span>
                <span className="font-semibold text-foreground">{task.contentDetails.contentType}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Platform:</span>
                <span className="font-semibold text-foreground">{task.contentDetails.targetPlatform}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">En/Boy Oranı:</span>
                <span className="font-semibold text-foreground">{task.contentDetails.videoSpecs?.aspect || '9:16'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Altyazı & Ses:</span>
                <span className="font-semibold text-emerald-500">Otomatik Planlandı</span>
              </div>
            </div>
          </div>
        )}

        {/* User Approval Alert Box */}
        {isPendingApproval && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              <span>Kullanıcı Güvenlik Onayı Zorunludur</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {task.approvalDescription ||
                'Bu görev harici işlem veya veri erişimi gerektirmektedir. Onayınız olmadan hiçbir işlem yürütülmez.'}
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Button onClick={handleApprove} variant="primary" size="sm" className="font-semibold">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Görevi Onayla & Başlat
              </Button>
              <Button onClick={handleCancel} variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                Görevi İptal Et
              </Button>
            </div>
          </div>
        )}

        {/* Step Breakdown */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
            İşlem & Yürütme Adımları
          </h3>
          <div className="space-y-2">
            {task.steps.map((step, idx) => (
              <div
                key={step.id}
                className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3 text-xs"
              >
                <div className="mt-0.5 shrink-0">
                  {step.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : step.status === 'in_progress' ? (
                    <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-border flex items-center justify-center text-[10px] text-muted-foreground">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-bold text-foreground">{step.title}</div>
                  {step.details && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {step.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Scopes */}
        {task.requiredScopes.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Veri İzinleri & Gizlilik Kapsamı
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {task.requiredScopes.map((scope) => {
                const isGranted = task.grantedScopes.includes(scope);
                const info = ASSISTANT_PERMISSION_SCOPES[scope];

                return (
                  <div
                    key={scope}
                    className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-muted/30 p-2.5 text-xs"
                  >
                    <LockKeyhole className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <span>{info?.titleTr || scope}</span>
                        {isGranted ? (
                          <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                            İzinli
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-500 font-medium bg-amber-500/10 px-1.5 py-0.2 rounded">
                            Onay Bekliyor
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {info?.descriptionTr}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {task.logs.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5" />
              <span>İşlem Günlüğü (Audit Trail)</span>
            </h3>
            <div className="rounded-xl border border-border bg-muted/40 p-3 text-[11px] font-mono space-y-1 max-h-32 overflow-y-auto">
              {task.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-muted-foreground shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString('tr-TR')}
                  </span>
                  <span
                    className={
                      log.level === 'error'
                        ? 'text-destructive font-bold'
                        : log.level === 'warn'
                        ? 'text-amber-500'
                        : 'text-foreground'
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
          <Button onClick={onClose} variant="secondary" size="sm">
            Kapat
          </Button>
        </div>
      </div>
    </Modal>
  );
}
