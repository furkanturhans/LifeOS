'use client';

import React from 'react';
import { MessageSquare, ListTodo, ShieldCheck, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { cn } from '@/lib/utils';
import { useLocaleRender } from '@/lib/i18n/runtime';

export function AssistantHeader() {
  const localizeText = useLocaleRender();
  const { currentView, setCurrentView, createNewConversation } = useAssistantStore();

  return (
    <PageHeader
      backHref="/home"

      title={localizeText("LifeOS Asistan")}


      actions={
        <div className="flex items-center gap-2">
          {/* Mode Switcher Pills */}
          <details className="relative"><summary className="cursor-pointer rounded-xl p-3 text-sm">{localizeText("Sohbet")}</summary><div className="absolute end-0 top-full z-30 flex flex-col gap-2 rounded-xl border border-border bg-card p-2 shadow-lg">
            <button
              onClick={() => setCurrentView('chat')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors',
                currentView === 'chat'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="inline">{localizeText("Sohbet")}</span>
            </button>

            <button
              onClick={() => setCurrentView('tasks')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors',
                currentView === 'tasks'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ListTodo className="h-3.5 w-3.5" />
              <span className="inline">{localizeText("Görevler")}</span>
            </button>

            <button
              onClick={() => setCurrentView('permissions')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors',
                currentView === 'permissions'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span className="inline">{localizeText("İzinler & Veri")}</span>
            </button>
          </div></details>

          {currentView === 'chat' && (
            <Button
              size="sm"
              variant="outline"
              onClick={createNewConversation}
              className="text-xs font-semibold"
              title={localizeText("Yeni Sohbet Başlat")}
            >
              <Plus className="h-3.5 w-3.5 sm:mr-1" />
              <span className="inline">{localizeText("Yeni Sohbet")}</span>
            </Button>
          )}
        </div>
      }
    />
  );
}
