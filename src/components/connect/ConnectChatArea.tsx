'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Video,
  Sparkles,
  Send,
  X,
  Volume2,
  VolumeX,
  Archive,
  Pin,
  ShieldCheck,
  Bot,
  Info,
  ChevronDown,
} from 'lucide-react';
import { useConnectStore } from '@/stores/useConnectStore';
import { ConnectMessageItem } from './ConnectMessageItem';
import { ConnectScopeCard } from './ConnectScopeCards';
import type { Message } from '@/types/connect';

export function ConnectChatArea() {
  const {
    activeConversationId,
    conversations,
    messages,
    currentUser,
    sendMessage,
    reactToMessage,
    togglePinMessage,
    openTransformModal,
    startCall,
    requestAiSummary,
    activeAiSummary,
    isGeneratingAiSummary,
    isAiSummaryOpen,
    toggleMuteConversation,
    toggleArchiveConversation,
  } = useConnectStore();

  const [inputContent, setInputContent] = useState('');
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const currentMessages = activeConversationId ? messages[activeConversationId] || [] : [];
  const pinnedMessages = currentMessages.filter((m) => m.isPinned);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  if (!activeConv) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/60 border border-border">
          <Bot className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-bold text-foreground">LifeOS Connect</h3>
        <p className="mt-1 text-xs max-w-sm text-muted-foreground">
          Sakin ve güvenli iletişim alanı. Soldaki listeden bir konuşma seçin veya yeni bir sohbet başlatın.
        </p>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    const content = inputContent;
    setInputContent('');
    const reply = replyTarget;
    setReplyTarget(null);

    await sendMessage(content, reply || undefined);
  };

  return (
    <main className="flex h-full flex-1 flex-col bg-background/50 overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-border bg-card/40 px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground truncate">
              {activeConv.title}
            </h2>
            {activeConv.isMuted && (
              <span title="Sessize Alındı">
                <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {activeConv.participants.map((p) => p.name).join(', ')}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* AI Summary Button */}
          <button
            onClick={() => requestAiSummary()}
            disabled={isGeneratingAiSummary}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            title="Sohbeti AI ile Özetle"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden md:inline">
              {isGeneratingAiSummary ? 'Özetleniyor...' : 'AI Özeti'}
            </span>
          </button>

          {/* Voice Call (LiveKit) */}
          <button
            onClick={() => startCall('audio')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Sesli Ara (LiveKit)"
          >
            <Phone className="h-4 w-4" />
          </button>

          {/* Video Call (LiveKit) */}
          <button
            onClick={() => startCall('video')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Görüntülü Ara (LiveKit)"
          >
            <Video className="h-4 w-4" />
          </button>

          {/* Mute Toggle */}
          <button
            onClick={() => toggleMuteConversation(activeConv.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
            title={activeConv.isMuted ? 'Sesi Aç' : 'Sessize Al'}
          >
            {activeConv.isMuted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Archive Toggle */}
          <button
            onClick={() => toggleArchiveConversation(activeConv.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
            title="Arşivle"
          >
            <Archive className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Context Scope Info Card (Education, Family, Services) */}
      <ConnectScopeCard conversation={activeConv} />

      {/* Pinned Messages Banner */}
      {pinnedMessages.length > 0 && (
        <div className="mx-4 mt-2 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs sm:mx-6">
          <div className="flex items-center gap-2 truncate">
            <Pin className="h-3.5 w-3.5 flex-shrink-0 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-amber-300">Sabitlenen:</span>
            <span className="truncate text-muted-foreground">
              {pinnedMessages[pinnedMessages.length - 1].content}
            </span>
          </div>
          <span className="text-[10px] text-amber-400 font-medium ml-2">
            ({pinnedMessages.length})
          </span>
        </div>
      )}

      {/* AI Summary Card (If requested) */}
      {isAiSummaryOpen && activeAiSummary && (
        <div className="mx-4 mt-2 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 sm:mx-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Sparkles className="h-4 w-4" />
              <span>LifeOS AI Sohbet Özeti</span>
            </div>
            <button
              onClick={() => useConnectStore.setState({ isAiSummaryOpen: false })}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 text-xs text-foreground/90 leading-relaxed">
            {activeAiSummary.summaryText}
          </p>
          {activeAiSummary.keyPoints.length > 0 && (
            <ul className="mt-2 list-disc list-inside space-y-1 text-[11px] text-indigo-200/80">
              {activeAiSummary.keyPoints.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        {currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <p className="text-xs">Bu konuşmada henüz bir mesaj bulunmuyor.</p>
            <p className="text-[11px] mt-1 text-muted-foreground/80">
              İlk mesajı yazarak iletişimi başlatabilirsiniz.
            </p>
          </div>
        ) : (
          currentMessages.map((msg) => (
            <ConnectMessageItem
              key={msg.id}
              message={msg}
              isCurrentUser={msg.senderId === currentUser.id}
              onReply={(m) => setReplyTarget(m)}
              onReact={(msgId, emoji) => reactToMessage(msgId, emoji)}
              onPin={(msgId) => togglePinMessage(msgId)}
              onOpenTransform={(m) => openTransformModal(m)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/60 p-3 sm:px-6">
        {/* Reply Preview Header */}
        {replyTarget && (
          <div className="mb-2 flex items-center justify-between rounded-lg bg-muted/60 px-3 py-1.5 text-xs">
            <div className="truncate">
              <span className="font-semibold text-primary">{replyTarget.senderName}</span>
              <span className="text-muted-foreground">: {replyTarget.content}</span>
            </div>
            <button
              onClick={() => setReplyTarget(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder={`${activeConv.title} içine bir mesaj yazın...`}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputContent.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors shadow-xs"
            title="Gönder"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-muted-foreground">
          <span>* Uçtan uca sunucu güvenlik protokolü ve gizlilik ilkeleri aktiftir.</span>
          <span>Shift + Enter ile satır atlayabilirsiniz.</span>
        </div>
      </div>
    </main>
  );
}
