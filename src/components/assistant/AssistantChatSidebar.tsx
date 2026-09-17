'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  History,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAssistantStore } from '@/stores/useAssistantStore';

interface AssistantChatSidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function AssistantChatSidebar({
  isOpenMobile,
  onCloseMobile,
}: AssistantChatSidebarProps) {
  const {
    conversations,
    activeConversationId,
    createNewConversation,
    selectConversation,
    renameConversation,
    deleteConversation,
    clearAllConversations,
  } = useAssistantStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  function handleStartRename(id: string, currentTitle: string, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  }

  function handleSaveRename(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  }

  function handleCancelRename(e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(null);
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    deleteConversation(id);
  }

  const content = (
    <div className="flex h-full flex-col p-3.5 bg-card/80 backdrop-blur-md select-none">
      {/* New Chat Button */}
      <Button
        onClick={() => {
          createNewConversation();
          onCloseMobile();
        }}
        variant="primary"
        size="sm"
        className="w-full justify-center font-semibold mb-3"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        <span>Yeni Sohbet</span>
      </Button>

      <div className="mb-2 flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <History className="h-3.5 w-3.5" />
          Sohbet Geçmişi
        </span>
        <span className="text-[11px] font-medium">{conversations.length}</span>
      </div>

      {/* Conversation List */}
      <div className="flex-1 space-y-1 overflow-y-auto pr-0.5">
        {conversations.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Henüz kayıtlı bir sohbet bulunmuyor.
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  selectConversation(conv.id);
                  onCloseMobile();
                }}
                className={cn(
                  'group relative flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer border',
                  isActive
                    ? 'border-primary/30 bg-primary/10 text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />

                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full rounded bg-background px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                  ) : (
                    <span className="truncate">{conv.title}</span>
                  )}
                </div>

                {/* Edit & Delete Controls */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => handleSaveRename(conv.id, e)}
                        className="rounded p-1 text-emerald-500 hover:bg-muted"
                        title="Kaydet"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="rounded p-1 text-muted-foreground hover:bg-muted"
                        title="İptal"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => handleStartRename(conv.id, conv.title, e)}
                        className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Yeniden Adlandır"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(conv.id, e)}
                        className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-muted"
                        title="Sohbeti Sil"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Clear All */}
      {conversations.length > 0 && (
        <div className="mt-auto pt-3 border-t border-border/60">
          <button
            onClick={clearAllConversations}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-muted/40 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Tüm Sohbetleri Temizle</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Panel */}
      <div className="hidden md:flex w-64 shrink-0 flex-col border-r border-border/80 bg-card/40">
        {content}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-border/60 p-3">
                <span className="font-bold text-sm text-foreground">Sohbetler</span>
                <button
                  onClick={onCloseMobile}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="h-[calc(100%-53px)]">{content}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
