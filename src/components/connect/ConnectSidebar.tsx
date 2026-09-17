'use client';

import React from 'react';
import {
  User,
  Users,
  GraduationCap,
  Briefcase,
  Search,
  Plus,
  Pin,
  VolumeX,
  ShieldCheck,
  Baby,
} from 'lucide-react';
import { useConnectStore } from '@/stores/useConnectStore';
import type { ConnectScope, UserRole } from '@/types/connect';

export function ConnectSidebar() {
  const {
    activeScope,
    setActiveScope,
    searchQuery,
    setSearchQuery,
    conversations,
    activeConversationId,
    setActiveConversationId,
    setNewChatModalOpen,
    currentUser,
    setCurrentUserRole,
  } = useConnectStore();

  const scopes: { id: ConnectScope; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'personal', label: 'Kişisel', icon: User, color: 'text-indigo-400' },
    { id: 'family', label: 'Aile', icon: Users, color: 'text-amber-400' },
    { id: 'education', label: 'Dersler', icon: GraduationCap, color: 'text-blue-400' },
    { id: 'services', label: 'Hizmetler', icon: Briefcase, color: 'text-emerald-400' },
  ];

  // Filter conversations by active scope & search query
  const filteredConversations = conversations.filter((c) => {
    if (c.scope !== activeScope) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchMsg = c.lastMessage?.content.toLowerCase().includes(q);
      return matchTitle || matchMsg;
    }
    return true;
  });

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-card/60 sm:w-80 md:w-96 flex-shrink-0">
      {/* Scope Selector Tabs */}
      <div className="border-b border-border p-3">
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-muted/60 p-1">
          {scopes.map((s) => {
            const Icon = s.icon;
            const isActive = activeScope === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveScope(s.id)}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-semibold transition-all ${
                  isActive
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? s.color : 'text-muted-foreground'}`} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and New Chat Row */}
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Konuşmalarda ara..."
            className="w-full rounded-lg border border-border bg-background/50 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <button
          onClick={() => setNewChatModalOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          title="Yeni Sohbet Başlat"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/30">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <p className="text-xs">Bu alanda henüz bir konuşma yok.</p>
            <button
              onClick={() => setNewChatModalOpen(true)}
              className="mt-3 text-xs font-semibold text-primary hover:underline"
            >
              + Yeni Sohbet Başlat
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = activeConversationId === conv.id;
            const formattedTime = conv.lastMessage
              ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'bg-primary/10 border-l-2 border-primary'
                    : 'hover:bg-muted/40'
                }`}
              >
                {/* Avatar Icon */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-muted border border-border text-xs font-bold text-foreground">
                  {conv.title.slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-foreground truncate">
                      {conv.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {formattedTime}
                    </span>
                  </div>

                  {/* Last message snippet */}
                  <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                    {conv.lastMessage
                      ? `${conv.lastMessage.senderName}: ${conv.lastMessage.content}`
                      : 'Henüz mesaj yok.'}
                  </p>

                  {/* Badges / Icons row */}
                  <div className="mt-1 flex items-center gap-1.5">
                    {conv.isPinned && <Pin className="h-3 w-3 text-amber-400 fill-amber-400" />}
                    {conv.isMuted && <VolumeX className="h-3 w-3 text-muted-foreground" />}
                    {conv.unreadCount > 0 && (
                      <span className="ml-auto rounded-full bg-primary px-1.5 py-0.2 text-[9px] font-bold text-primary-foreground">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Role Switcher & Safety Badge Footer */}
      <div className="border-t border-border bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <div className="text-[11px]">
              <span className="font-semibold text-foreground">{currentUser.name}</span>
              <span className="text-muted-foreground ml-1">({currentUser.role})</span>
            </div>
          </div>

          {/* Quick Role Tester */}
          <select
            value={currentUser.role}
            onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
            className="rounded border border-border bg-background px-1.5 py-1 text-[10px] text-foreground focus:outline-none"
            title="Rol Değiştir (Test)"
          >
            <option value="user">Kullanıcı</option>
            <option value="guardian">Veli</option>
            <option value="child">Çocuk (Korumalı)</option>
            <option value="instructor">Eğitmen</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
