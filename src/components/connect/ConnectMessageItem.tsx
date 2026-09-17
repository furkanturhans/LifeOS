'use client';

import React, { useState } from 'react';
import {
  Pin,
  Reply,
  Smile,
  Sparkles,
  Check,
  CheckCheck,
  Clock,
  CheckSquare,
  Calendar,
  BookOpen,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import type { Message, MessageReaction } from '@/types/connect';

interface ConnectMessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onPin: (messageId: string) => void;
  onOpenTransform: (message: Message) => void;
}

const COMMON_REACTIONS = ['👍', '❤️', '🎉', '💡', '✅', '👏'];

export function ConnectMessageItem({
  message,
  isCurrentUser,
  onReply,
  onReact,
  onPin,
  onOpenTransform,
}: ConnectMessageItemProps) {
  const [showPicker, setShowPicker] = useState(false);

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getRoleBadge = () => {
    switch (message.senderRole) {
      case 'instructor':
        return <span className="rounded bg-blue-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-blue-300">Eğitmen</span>;
      case 'service_provider':
        return <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-300">Hizmet</span>;
      case 'guardian':
        return <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-amber-300">Veli</span>;
      case 'child':
        return <span className="rounded bg-purple-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-purple-300">Çocuk</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`group relative flex flex-col py-1.5 px-4 transition-colors hover:bg-muted/30 ${
        message.isPinned ? 'bg-amber-500/5' : ''
      }`}
    >
      {/* Pinned label if pinned */}
      {message.isPinned && (
        <div className="mb-1 flex items-center gap-1 text-[10px] font-medium text-amber-400">
          <Pin className="h-3 w-3 fill-amber-400" />
          <span>Sabitlenen Mesaj</span>
        </div>
      )}

      {/* Reply Reference Preview */}
      {message.replyToPreview && (
        <div className="mb-1 ml-1 max-w-md rounded-lg border-l-2 border-primary/60 bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground">
          <span className="font-semibold text-primary">{message.replyToPreview.senderName}: </span>
          <span className="truncate">{message.replyToPreview.content}</span>
        </div>
      )}

      <div className="flex items-start gap-2.5">
        {/* Avatar initial */}
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted border border-border text-foreground'
          }`}
        >
          {message.senderName.slice(0, 2).toUpperCase()}
        </div>

        {/* Message Bubble & Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-foreground">
              {message.senderName}
            </span>
            {getRoleBadge()}
            <span className="text-[10px] text-muted-foreground">{formattedTime}</span>

            {/* Status check icons for own messages */}
            {isCurrentUser && (
              <span className="text-muted-foreground ml-1">
                {message.status === 'sending' ? (
                  <Clock className="h-3 w-3 inline text-muted-foreground animate-pulse" />
                ) : message.status === 'read' ? (
                  <CheckCheck className="h-3 w-3 inline text-primary" />
                ) : (
                  <Check className="h-3 w-3 inline text-muted-foreground" />
                )}
              </span>
            )}
          </div>

          {/* Text body */}
          <p className="mt-1 text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed break-words">
            {message.content}
          </p>

          {/* Transformed Action Indicator if attached */}
          {message.transformedAction && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs text-foreground">
              {message.transformedAction.type === 'task' && <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />}
              {message.transformedAction.type === 'calendar_event' && <Calendar className="h-3.5 w-3.5 text-amber-400" />}
              {message.transformedAction.type === 'course_note' && <BookOpen className="h-3.5 w-3.5 text-blue-400" />}
              {message.transformedAction.type === 'service_request' && <Briefcase className="h-3.5 w-3.5 text-emerald-400" />}
              <span className="font-medium text-[11px]">
                Eyleme Dönüştürüldü: <span className="underline">{message.transformedAction.title}</span>
              </span>
            </div>
          )}

          {/* Reactions Row */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {message.reactions.map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => onReact(message.id, r.emoji)}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground hover:bg-muted"
                >
                  <span>{r.emoji}</span>
                  <span className="text-[10px] font-medium text-muted-foreground">{r.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hover Quick Actions Bar */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-2 flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5 shadow-md">
          {/* Reaction Picker Button */}
          <div className="relative">
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="İfade Bırak"
            >
              <Smile className="h-3.5 w-3.5" />
            </button>

            {showPicker && (
              <div className="absolute right-0 bottom-full mb-1 flex items-center gap-1 rounded-xl border border-border bg-card p-1.5 shadow-xl z-20">
                {COMMON_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(message.id, emoji);
                      setShowPicker(false);
                    }}
                    className="rounded p-1 text-sm hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reply Button */}
          <button
            onClick={() => onReply(message)}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Yanıtla"
          >
            <Reply className="h-3.5 w-3.5" />
          </button>

          {/* Pin Button */}
          <button
            onClick={() => onPin(message.id)}
            className={`rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground ${
              message.isPinned ? 'text-amber-400' : ''
            }`}
            title={message.isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
          >
            <Pin className="h-3.5 w-3.5" />
          </button>

          {/* LifeOS Action Transform Button */}
          <button
            onClick={() => onOpenTransform(message)}
            className="rounded p-1 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300"
            title="LifeOS Eylemine Dönüştür (Görev, Takvim, Not)"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
