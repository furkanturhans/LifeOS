'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Film,
  CalendarCheck,
  Users,
  Briefcase,
  Wallet,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LockKeyhole,
  ArrowRight,
  ShieldCheck,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useAssistantStore } from '@/stores/useAssistantStore';
import {
  ASSISTANT_TYPE_CONFIG,
  ASSISTANT_PERMISSION_SCOPES,
  type AssistantTask,
  type AssistantTaskType,
} from '@/types/assistant';

interface AssistantTaskCardProps {
  task: AssistantTask;
  onOpenDetail: (task: AssistantTask) => void;
}

const TYPE_ICONS: Record<AssistantTaskType, React.ElementType> = {
  content: Film,
  planning: CalendarCheck,
  family: Users,
  services: Briefcase,
  finance: Wallet,
  research: Search,
};

export function AssistantTaskCard({ task, onOpenDetail }: AssistantTaskCardProps) {
  const { approveTask, cancelTask, deleteTask } = useAssistantStore();

  const Icon = TYPE_ICONS[task.type] || CalendarCheck;
  const config = ASSISTANT_TYPE_CONFIG[task.type];

  const completedStepsCount = task.steps.filter((s) => s.status === 'completed').length;
  const totalSteps = task.steps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;

  const isPendingApproval = task.status === 'pending_approval';
  const isInProgress = task.status === 'in_progress';
  const isCompleted = task.status === 'completed';
  const isCancelled = task.status === 'cancelled';

  return (
    <Card className="border-border bg-card p-4 sm:p-5 transition-all shadow-xs hover:border-border/80">
      {/* Header: Icon, Type Badge, Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted border border-border text-foreground">
            <Icon className="h-5 w-5 text-primary stroke-[1.75]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {config.titleTr}
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-[11px] text-muted-foreground">
                {new Date(task.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h3
              onClick={() => onOpenDetail(task)}
              className="text-sm sm:text-base font-bold text-foreground hover:text-primary cursor-pointer transition-colors line-clamp-1"
            >
              {task.title}
            </h3>
          </div>
        </div>

        <div>
          {isPendingApproval ? (
            <StatusBadge status="pending" label="Onay Bekliyor" size="sm" />
          ) : isInProgress ? (
            <StatusBadge status="bidding" label="İşleniyor" size="sm" />
          ) : isCompleted ? (
            <StatusBadge status="completed" label="Tamamlandı" size="sm" />
          ) : isCancelled ? (
            <StatusBadge status="cancelled" label="İptal Edildi" size="sm" />
          ) : (
            <StatusBadge status="open" label="Taslak" size="sm" />
          )}
        </div>
      </div>

      {/* Description */}
      <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {task.description}
      </p>

      {/* Required Permission Tags */}
      {task.requiredScopes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {task.requiredScopes.map((scope) => {
            const isGranted = task.grantedScopes.includes(scope);
            const label = ASSISTANT_PERMISSION_SCOPES[scope]?.titleTr || scope;

            return (
              <span
                key={scope}
                className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                <LockKeyhole className="h-2.5 w-2.5 text-primary" />
                <span>{label}</span>
                {isGranted && <span className="text-emerald-500 font-bold">✓</span>}
              </span>
            );
          })}
        </div>
      )}

      {/* Step Progress Bar */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
          <span>İlerleme Adımları</span>
          <span className="font-semibold text-foreground">
            {completedStepsCount}/{totalSteps} Adım
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Approval Warning Notice if Pending */}
      {isPendingApproval && task.approvalDescription && (
        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-700 dark:text-amber-300">
          <div className="font-semibold flex items-center gap-1 mb-0.5">
            <AlertTriangle className="h-3 w-3" />
            <span>Kullanıcı Onayı Gereklidir:</span>
          </div>
          <p className="text-muted-foreground leading-snug">
            {task.approvalDescription}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenDetail(task)}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Detayları İncele →
        </button>

        <div className="flex items-center gap-2">
          {isPendingApproval && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => cancelTask(task.id)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                İptal
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => approveTask(task.id)}
                className="text-xs font-semibold"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Onayla & Başlat
              </Button>
            </>
          )}

          {isInProgress && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenDetail(task)}
              className="text-xs font-semibold"
            >
              Görevi İzle
            </Button>
          )}

          {isCompleted && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenDetail(task)}
              className="text-xs font-semibold"
            >
              Sonuçları Gör
            </Button>
          )}

          {isCancelled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteTask(task.id)}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
