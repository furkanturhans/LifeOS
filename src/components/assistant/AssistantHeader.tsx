'use client';

import React from 'react';
import { Bot, MessageSquare, ListTodo, ShieldCheck, Plus, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { cn } from '@/lib/utils';

export function AssistantHeader() {
  const { currentView, setCurrentView, createNewConversation } = useAssistantStore();

  return (
    <PageHeader
      backHref="/home"
      icon={<Bot className="h-5 w-5 text-primary" />}
      title="LifeOS Asistan"
      subtitle="Kişisel AI Asistanı & Görev Yönetim Merkezi"
      badge={<StatusBadge status="verified" label="AI Agent" size="sm" />}
      actions={
        <div className="flex items-center gap-2">
          {/* Mode Switcher Pills */}
          <div className="flex items-center rounded-xl border border-border bg-muted/50 p-0.5">
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
              <span className="hidden sm:inline">Sohbet</span>
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
              <span className="hidden sm:inline">Görevler</span>
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
              <span className="hidden sm:inline">İzinler & Veri</span>
            </button>
          </div>

          {currentView === 'chat' && (
            <Button
              size="sm"
              variant="outline"
              onClick={createNewConversation}
              className="text-xs font-semibold"
              title="Yeni Sohbet Başlat"
            >
              <Plus className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Yeni Sohbet</span>
            </Button>
          )}
        </div>
      }
    />
  );
}
