'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  Menu,
  RotateCcw,
  Loader2,
  Bot,
  Plus,
} from 'lucide-react';
import { AssistantChatSidebar } from './AssistantChatSidebar';
import { AssistantMessageBubble } from './AssistantMessageBubble';
import { AssistantPhotoConsentModal } from './AssistantPhotoConsentModal';
import { Button } from '@/components/ui/Button';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { photoBridge } from '@/services/assistant/PhotoBridgeAdapter';
import { cn } from '@/lib/utils';
import type { PhotoAnalysisItem } from '@/types/assistant';

const CHAT_STARTERS = [
  'Bugün yapmam gereken önemli işleri planla',
  'Bu ayki harcama kategorilerimi özetle ve tasarruf önerisi ver',
  'Aile çemberi için hafta sonu ortak program taslağı hazırla',
  'Youtube Shorts için 45 saniyelik dikey video kurgu planı oluştur',
];

export function AssistantChatView() {
  const {
    conversations,
    activeConversationId,
    isStreaming,
    providerInfo,
    fetchProviderHealth,
    sendMessage,
    createNewConversation,
  } = useAssistantStore();

  const [input, setInput] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [pendingConsentPhoto, setPendingConsentPhoto] = useState<PhotoAnalysisItem | null>(null);
  const [stagedPhoto, setStagedPhoto] = useState<PhotoAnalysisItem | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentConv = conversations.find((c) => c.id === activeConversationId);
  const messages = currentConv?.messages || [];

  useEffect(() => {
    fetchProviderHealth();
  }, [fetchProviderHealth]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if ((!input.trim() && !stagedPhoto) || isStreaming) return;

    const text = input.trim();
    const photo = stagedPhoto || undefined;

    setInput('');
    setStagedPhoto(null);

    await sendMessage(text || 'Fotoğraf analizi', photo);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const item = await photoBridge.pickPhotoFromFile(file);
      setPendingConsentPhoto(item);
    } catch (err) {
      console.error('Photo pick failed:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handlePhotoConsentApproved(photo: PhotoAnalysisItem) {
    setStagedPhoto(photo);
    setPendingConsentPhoto(null);
  }

  return (
    <div className="flex h-[calc(100vh-140px)] border-t border-border/80 bg-background overflow-hidden">
      {/* Conversation History Sidebar */}
      <AssistantChatSidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Chat Conversation Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Top Chat Bar (Mobile Drawer toggle, active title & Provider status) */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2 bg-card/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground md:hidden"
              title="Sohbetler"
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-foreground truncate max-w-[160px] sm:max-w-md">
              {currentConv?.title || 'Yeni Sohbet'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Provider Pill */}
            <div
              className="flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
              title={providerInfo.message || `${providerInfo.providerName} (${providerInfo.model})`}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  providerInfo.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                )}
              />
              <span className="font-medium text-foreground">
                {providerInfo.providerId === 'ollama' ? 'Ollama' : 'OpenAI'}:
              </span>
              <span className="text-muted-foreground">{providerInfo.model}</span>
            </div>

            <span className="text-[11px] font-medium text-muted-foreground hidden md:inline">
              Gizlilik Korumalı
            </span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1 scroll-smooth">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold shadow-md mb-4">
                <Bot className="h-6 w-6" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                LifeOS Asistan’a Hoş Geldiniz
              </h2>
              <p className="mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
                Kişisel yaşam akışınızı planlayın, bütçenizi analiz edin veya video kurgu fikirleri oluşturun. Verileriniz yalnızca açık izniniz olduğunda işlenir.
              </p>

              {/* Starter Prompt Chips */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {CHAT_STARTERS.map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(promptText);
                      setTimeout(() => textareaRef.current?.focus(), 50);
                    }}
                    className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors text-left text-xs font-medium text-foreground shadow-2xs"
                  >
                    <span className="line-clamp-2">{promptText}</span>
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <AssistantMessageBubble
                key={msg.id}
                message={msg}
                conversationId={activeConversationId || ''}
              />
            ))
          )}

          {/* Typing / Streaming Indicator */}
          {isStreaming && (
            <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Asistan düşünüyor ve yanıt hazırlıyor...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Staged Photo Attachment Pill */}
        {stagedPhoto && (
          <div className="mx-4 mb-2 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground truncate max-w-[200px]">
                {stagedPhoto.fileName}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                ✓ Onaylandı
              </span>
            </div>
            <button
              onClick={() => setStagedPhoto(null)}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Kaldır
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-border/60 bg-card/40">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Photo Attach Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Fotoğraf Seç & Analiz Et"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Expanding Textarea */}
            <div className="flex-1 min-w-0 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary/60 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="LifeOS Asistan’a bir şey sorun veya görev verin..."
                rows={1}
                className="w-full resize-none bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none max-h-32"
              />
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              size="md"
              disabled={(!input.trim() && !stagedPhoto) || isStreaming}
              className="h-10 px-4 shrink-0 font-semibold"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Photo Consent Modal before sending to server */}
      <AssistantPhotoConsentModal
        photo={pendingConsentPhoto}
        isOpen={Boolean(pendingConsentPhoto)}
        onClose={() => setPendingConsentPhoto(null)}
        onConfirm={handlePhotoConsentApproved}
      />
    </div>
  );
}
