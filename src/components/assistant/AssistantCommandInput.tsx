'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, CornerDownLeft, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAssistantStore } from '@/stores/useAssistantStore';

const PROMPT_SUGGESTIONS = [
  { label: 'Dikey Video Kurgu Planı', prompt: 'Youtube Shorts ve Reels için 45 saniyelik dikey video kurgu planı ve altyazı akışı hazırla' },
  { label: 'Aylık Bütçe Planı', prompt: 'Bu ay için harcama limitlerini optimize et ve tasarruf hedefi planla' },
  { label: 'Ev Taşıma Kontrol Listesi', prompt: 'Nakliye öncesi paketleme, oda envanteri ve nakliyeci talep taslağı oluştur' },
  { label: 'Aile Hafta Sonu Planı', prompt: 'Aile çemberi için hafta sonu ortak etkinlik ve zaman çizelgesi planla' },
  { label: 'Usta İhtiyaç Analizi', prompt: 'Ev tesisat ve elektrik bakımı için kontrol adımları ve usta talep metni hazırla' },
];

export function AssistantCommandInput() {
  const [command, setCommand] = useState('');
  const { createTaskFromCommand, isProcessing } = useAssistantStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!command.trim() || isProcessing) return;

    const cmd = command.trim();
    setCommand('');
    try {
      await createTaskFromCommand(cmd);
    } catch (err) {
      console.error('Failed to create task from command:', err);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleSuggestionClick(promptText: string) {
    setCommand(promptText);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }

  return (
    <div className="px-4 mt-5 sm:px-6">
      <Card className="border-border bg-card p-4 sm:p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Ne yapmak istiyorsunuz?</span>
          </div>

          <div className="relative rounded-xl border border-border bg-muted/40 focus-within:border-primary/60 focus-within:bg-background transition-all">
            <textarea
              ref={inputRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Örn: 'Youtube Shorts için dikey video kurgu planı hazırla' veya 'Aylık bütçe hedeflerini planla'..."
              rows={2}
              className="w-full resize-none bg-transparent p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />

            <div className="flex items-center justify-between border-t border-border/40 px-3 py-2 text-xs">
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                Gönderim için <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">Enter</kbd> tuşuna basın
              </span>

              <Button
                type="submit"
                size="sm"
                disabled={!command.trim() || isProcessing}
                className="ml-auto font-semibold text-xs"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    <span>Planlanıyor...</span>
                  </>
                ) : (
                  <>
                    <span>Görevi Başlat</span>
                    <Send className="h-3.5 w-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Suggestion Chips */}
        <div className="mt-3.5 pt-3 border-t border-border/50">
          <div className="text-[11px] font-semibold text-muted-foreground mb-2">
            Hızlı Görev Örnekleri:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PROMPT_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(item.prompt)}
                className="rounded-lg border border-border/80 bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
