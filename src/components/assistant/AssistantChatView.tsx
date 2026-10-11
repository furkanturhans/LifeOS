'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Menu,
  Loader2,
  Bot,
} from 'lucide-react';
import { AssistantChatSidebar } from './AssistantChatSidebar';
import { AssistantMessageBubble } from './AssistantMessageBubble';
import { AssistantPhotoConsentModal } from './AssistantPhotoConsentModal';
import { Button } from '@/components/ui/Button';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { photoBridge } from '@/services/assistant/PhotoBridgeAdapter';
import type { PhotoAnalysisItem } from '@/types/assistant';
import { useLocaleRender } from '@/lib/i18n/runtime';


export function AssistantChatView() {
  const localizeText = useLocaleRender();
  const {
    conversations,
    activeConversationId,
    isStreaming,
    fetchProviderHealth,
    sendMessage,
  } = useAssistantStore();

  const [input, setInput] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [pendingConsentPhoto, setPendingConsentPhoto] = useState<PhotoAnalysisItem | null>(null);
  const [stagedPhoto, setStagedPhoto] = useState<PhotoAnalysisItem | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentConv = conversations.find((c) => c.id === activeConversationId);
  const messages = useMemo(() => currentConv?.messages || [], [currentConv?.messages]);

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
    <div className="flex h-full min-h-0 bg-background overflow-hidden">
      {/* Conversation History Sidebar */}
      {isMobileSidebarOpen && <AssistantChatSidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />}

      {/* Main Chat Conversation Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Top Chat Bar (Mobile Drawer toggle, active title & Provider status) */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2 bg-card/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(open => !open)}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground "
              title={localizeText("Sohbetler")}
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-foreground truncate max-w-[160px] sm:max-w-md">
              {localizeText(currentConv?.title || 'Yeni Sohbet')}
            </span>
          </div>

          <div className="flex items-center gap-2">
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-4 space-y-1 scroll-smooth">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-full text-center px-4 py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold shadow-md mb-4">
                <Bot className="h-6 w-6" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">{localizeText("LifeOS Asistan’a Hoş Geldiniz")}</h2>



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
                <span>{localizeText("Asistan düşünüyor ve yanıt hazırlıyor...")}</span>
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
                {localizeText(stagedPhoto.fileName)}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">{localizeText("✓ Onaylandı")}</span>
            </div>
            <button
              onClick={() => setStagedPhoto(null)}
              className="text-xs text-muted-foreground hover:text-destructive"
            >{localizeText("Kaldır")}</button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-background">
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-end gap-2 rounded-3xl border border-border bg-muted/30 p-2">
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
              title={localizeText("Fotoğraf Seç & Analiz Et")}
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Expanding Textarea */}
            <div className="flex-1 min-w-0 rounded-xl px-3 py-2 focus-within:border-primary/60 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={localizeText("LifeOS Asistan’a bir şey sorun veya görev verin...")}
                rows={1}
                className="w-full resize-none bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none max-h-32"
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
