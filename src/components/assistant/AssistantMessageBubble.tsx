'use client';

import React, { useState } from 'react';
import {
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  LockKeyhole,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAssistantStore } from '@/stores/useAssistantStore';
import type { AssistantMessage, AssistantToolCall } from '@/types/assistant';

interface AssistantMessageBubbleProps {
  message: AssistantMessage;
  conversationId: string;
}

export function AssistantMessageBubble({
  message,
  conversationId,
}: AssistantMessageBubbleProps) {
  const { resolveToolCall, retryLastMessage } = useAssistantStore();
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const isError = message.status === 'error';

  function handleCopy() {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={cn(
        'flex gap-3 py-3 px-4 transition-colors',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs mt-0.5">
          <Bot className="h-4 w-4" />
        </div>
      )}

      {/* Bubble Container */}
      <div className={cn('max-w-[85%] sm:max-w-[75%] space-y-2', isUser && 'items-end text-right')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-primary text-primary-foreground font-medium rounded-tr-xs shadow-xs'
              : isError
              ? 'border border-destructive/30 bg-destructive/10 text-destructive rounded-tl-xs'
              : 'border border-border bg-card text-foreground rounded-tl-xs shadow-xs'
          )}
        >
          {message.content}
        </div>

        {/* In-Chat Tool Calls & In-line Consent Cards */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-2 pt-1 text-left">
            {message.toolCalls.map((toolCall) => (
              <div
                key={toolCall.id}
                className="rounded-xl border border-border bg-card p-3 text-xs space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <LockKeyhole className="h-3.5 w-3.5 text-primary" />
                    <span>{toolCall.labelTr}</span>
                  </div>

                  {toolCall.status === 'executed' ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      <CheckCircle2 className="h-3 w-3" />
                      İzin Verildi
                    </span>
                  ) : toolCall.status === 'rejected' ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                      <XCircle className="h-3 w-3" />
                      Reddedildi
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      <AlertTriangle className="h-3 w-3" />
                      Onay Bekliyor
                    </span>
                  )}
                </div>

                {toolCall.permissionReason && (
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {toolCall.permissionReason}
                  </p>
                )}

                {toolCall.status === 'requires_permission' && (
                  <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => resolveToolCall(conversationId, message.id, toolCall.id, true)}
                      className="text-xs font-semibold py-1 h-7"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      İzin Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveToolCall(conversationId, message.id, toolCall.id, false)}
                      className="text-xs py-1 h-7 text-muted-foreground"
                    >
                      Reddet
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bubble Bottom Meta & Copy Action */}
        <div
          className={cn(
            'flex items-center gap-2 text-[10px] text-muted-foreground px-1',
            isUser ? 'justify-end' : 'justify-start'
          )}
        >
          <span>{new Date(message.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>

          {!isUser && !isError && (
            <button
              onClick={handleCopy}
              className="rounded p-1 hover:text-foreground transition-colors"
              title="Kopyala"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </button>
          )}

          {isError && (
            <button
              onClick={retryLastMessage}
              className="flex items-center gap-1 font-semibold text-primary hover:underline ml-2"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Tekrar Dene</span>
            </button>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted border border-border text-foreground font-bold shadow-xs mt-0.5">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
