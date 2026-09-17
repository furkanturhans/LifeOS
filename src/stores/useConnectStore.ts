'use client';

import { create } from 'zustand';
import type {
  ConnectScope,
  Conversation,
  Message,
  CallSession,
  CallType,
  ConnectUser,
  ConnectUserPrivacySettings,
  LiveKitTokenResponse,
  ActionTransformPayload,
  UserRole,
} from '@/types/connect';

interface ConnectState {
  // Scopes & Navigation
  activeScope: ConnectScope;
  setActiveScope: (scope: ConnectScope) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Current User
  currentUser: ConnectUser;
  setCurrentUserRole: (role: UserRole) => void;

  // Conversations & Messages
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  messages: Record<string, Message[]>;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;

  // Privacy & Settings
  privacySettings: ConnectUserPrivacySettings;
  updatePrivacySettings: (settings: Partial<ConnectUserPrivacySettings>) => void;

  // Call Management (LiveKit)
  callSession: CallSession | null;
  liveKitStatus: { configured: boolean; url: string | null } | null;
  liveKitTokenData: LiveKitTokenResponse | null;
  isCallModalOpen: boolean;
  isMicMuted: boolean;
  isCamMuted: boolean;
  toggleMic: () => void;
  toggleCam: () => void;

  // Modals & Action Transforms
  isTransformModalOpen: boolean;
  transformTargetMessage: Message | null;
  openTransformModal: (msg: Message) => void;
  closeTransformModal: () => void;

  isNewChatModalOpen: boolean;
  setNewChatModalOpen: (open: boolean) => void;

  isAiSummaryOpen: boolean;
  activeAiSummary: { summaryText: string; keyPoints: string[] } | null;
  isGeneratingAiSummary: boolean;

  // Actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (convId: string) => Promise<void>;
  sendMessage: (content: string, replyTo?: Message) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  togglePinMessage: (messageId: string) => Promise<void>;
  toggleMuteConversation: (convId: string) => void;
  toggleArchiveConversation: (convId: string) => void;
  checkLiveKitStatus: () => Promise<void>;
  startCall: (type: CallType) => Promise<void>;
  endCall: () => void;
  requestAiSummary: () => Promise<void>;
  transformMessage: (payload: ActionTransformPayload) => void;
}

export const useConnectStore = create<ConnectState>((set, get) => ({
  // Default State
  activeScope: 'personal',
  setActiveScope: (scope) => {
    set({ activeScope: scope });
    const convs = get().conversations.filter((c) => c.scope === scope && !c.isArchived);
    if (convs.length > 0) {
      set({ activeConversationId: convs[0].id });
      get().fetchMessages(convs[0].id);
    } else {
      set({ activeConversationId: null });
    }
  },
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  currentUser: {
    id: 'usr-furkan',
    name: 'Furkan Turhan',
    role: 'user',
    badge: 'Pro',
    isOnline: true,
  },
  setCurrentUserRole: (role) => {
    const isChild = role === 'child';
    set((state) => ({
      currentUser: {
        ...state.currentUser,
        role,
        isChild,
        canDirectMessage: !isChild,
      },
    }));
  },

  conversations: [],
  activeConversationId: null,
  setActiveConversationId: (id) => {
    set({ activeConversationId: id });
    if (id) {
      get().fetchMessages(id);
    }
  },
  messages: {},
  isLoadingConversations: false,
  isLoadingMessages: false,

  privacySettings: {
    showOnlineStatus: false,
    sendReadReceipts: false,
    allowIncomingCalls: true,
    blockDirectMessages: false,
  },
  updatePrivacySettings: (settings) =>
    set((state) => ({ privacySettings: { ...state.privacySettings, ...settings } })),

  // Calls
  callSession: null,
  liveKitStatus: null,
  liveKitTokenData: null,
  isCallModalOpen: false,
  isMicMuted: false,
  isCamMuted: false,
  toggleMic: () => set((state) => ({ isMicMuted: !state.isMicMuted })),
  toggleCam: () => set((state) => ({ isCamMuted: !state.isCamMuted })),

  // Modals
  isTransformModalOpen: false,
  transformTargetMessage: null,
  openTransformModal: (msg) => set({ isTransformModalOpen: true, transformTargetMessage: msg }),
  closeTransformModal: () => set({ isTransformModalOpen: false, transformTargetMessage: null }),

  isNewChatModalOpen: false,
  setNewChatModalOpen: (open) => set({ isNewChatModalOpen: open }),

  isAiSummaryOpen: false,
  activeAiSummary: null,
  isGeneratingAiSummary: false,

  // API Async Handlers
  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const res = await fetch('/api/connect/conversations');
      const data = await res.json();
      if (data.success && Array.isArray(data.conversations)) {
        const convs = data.conversations as Conversation[];
        set({ conversations: convs });

        const currentActive = get().activeConversationId;
        const currentScope = get().activeScope;
        const filtered = convs.filter((c) => c.scope === currentScope && !c.isArchived);

        if (!currentActive || !convs.some((c) => c.id === currentActive)) {
          if (filtered.length > 0) {
            set({ activeConversationId: filtered[0].id });
            get().fetchMessages(filtered[0].id);
          }
        }
      }
    } catch {
      // Keep existing state on error
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  fetchMessages: async (convId: string) => {
    set({ isLoadingMessages: true });
    try {
      const res = await fetch(`/api/connect/messages?conversationId=${encodeURIComponent(convId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        set((state) => ({
          messages: {
            ...state.messages,
            [convId]: data.messages,
          },
        }));
      }
    } catch {
      // Fallback
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (content: string, replyTo?: Message) => {
    const convId = get().activeConversationId;
    if (!convId || !content.trim()) return;

    const user = get().currentUser;
    const optimisticId = `msg-opt-${Date.now()}`;
    const replyPreview = replyTo
      ? { id: replyTo.id, senderName: replyTo.senderName, content: replyTo.content.slice(0, 80) }
      : undefined;

    const optimisticMsg: Message = {
      id: optimisticId,
      conversationId: convId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      replyToId: replyTo?.id,
      replyToPreview: replyPreview,
      reactions: [],
      status: 'sending',
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [convId]: [...(state.messages[convId] || []), optimisticMsg],
      },
    }));

    try {
      const res = await fetch('/api/connect/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          conversationId: convId,
          content: content.trim(),
          senderId: user.id,
          senderName: user.name,
          senderRole: user.role,
          replyToId: replyTo?.id,
          replyToPreview: replyPreview,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        set((state) => ({
          messages: {
            ...state.messages,
            [convId]: state.messages[convId].map((m) => (m.id === optimisticId ? data.message : m)),
          },
        }));
      }
    } catch {
      set((state) => ({
        messages: {
          ...state.messages,
          [convId]: state.messages[convId].map((m) =>
            m.id === optimisticId ? { ...m, status: 'sent' } : m
          ),
        },
      }));
    }
  },

  reactToMessage: async (messageId: string, emoji: string) => {
    const convId = get().activeConversationId;
    if (!convId) return;
    const userId = get().currentUser.id;

    try {
      const res = await fetch('/api/connect/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'react',
          conversationId: convId,
          messageId,
          emoji,
          userId,
        }),
      });
      const data = await res.json();
      if (data.success && data.reactions) {
        set((state) => ({
          messages: {
            ...state.messages,
            [convId]: state.messages[convId].map((m) =>
              m.id === messageId ? { ...m, reactions: data.reactions } : m
            ),
          },
        }));
      }
    } catch {
      // Handled
    }
  },

  togglePinMessage: async (messageId: string) => {
    const convId = get().activeConversationId;
    if (!convId) return;

    const list = get().messages[convId] || [];
    const target = list.find((m) => m.id === messageId);
    if (!target) return;

    const newPinned = !target.isPinned;

    try {
      const res = await fetch('/api/connect/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pin',
          conversationId: convId,
          messageId,
          isPinned: newPinned,
        }),
      });
      const data = await res.json();
      if (data.success) {
        set((state) => ({
          messages: {
            ...state.messages,
            [convId]: state.messages[convId].map((m) =>
              m.id === messageId ? { ...m, isPinned: newPinned } : m
            ),
          },
        }));
      }
    } catch {
      // Handled
    }
  },

  toggleMuteConversation: (convId: string) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === convId ? { ...c, isMuted: !c.isMuted } : c
      ),
    }));
  },

  toggleArchiveConversation: (convId: string) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === convId ? { ...c, isArchived: !c.isArchived } : c
      ),
    }));
  },

  checkLiveKitStatus: async () => {
    try {
      const res = await fetch('/api/connect/call/token');
      const data = await res.json();
      if (data.success) {
        set({ liveKitStatus: { configured: data.configured, url: data.url || null } });
      }
    } catch {
      set({ liveKitStatus: { configured: false, url: null } });
    }
  },

  startCall: async (type: CallType) => {
    const convId = get().activeConversationId;
    if (!convId) return;
    const conv = get().conversations.find((c) => c.id === convId);
    const user = get().currentUser;

    set({ isCallModalOpen: true });

    // Request token from server
    try {
      const res = await fetch('/api/connect/call/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: `room-${convId}`,
          participantIdentity: user.id,
          participantName: user.name,
        }),
      });
      const data = await res.json();

      set({ liveKitTokenData: data });

      const newSession: CallSession = {
        id: `call-${Date.now()}`,
        conversationId: convId,
        callerId: user.id,
        callerName: user.name,
        callerRole: user.role,
        targetUserIds: conv ? conv.participants.map((p) => p.id) : [],
        type,
        status: data.configured ? 'connected' : 'idle',
        startedAt: new Date().toISOString(),
        roomName: `room-${convId}`,
      };

      set({ callSession: newSession });
    } catch {
      set({
        liveKitTokenData: {
          configured: false,
          message: 'Arama sunucusuna bağlanırken ağ hatası oluştu.',
        },
      });
    }
  },

  endCall: () => {
    set({
      isCallModalOpen: false,
      callSession: null,
      liveKitTokenData: null,
      isMicMuted: false,
      isCamMuted: false,
    });
  },

  requestAiSummary: async () => {
    const convId = get().activeConversationId;
    if (!convId) return;
    const list = get().messages[convId] || [];
    const conv = get().conversations.find((c) => c.id === convId);

    set({ isGeneratingAiSummary: true, isAiSummaryOpen: true });
    try {
      const res = await fetch('/api/connect/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: convId,
          messages: list,
          scope: conv?.scope || 'personal',
        }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        set({
          activeAiSummary: {
            summaryText: data.summary.summaryText,
            keyPoints: data.summary.keyPoints,
          },
        });
      }
    } catch {
      set({
        activeAiSummary: {
          summaryText: 'Özet çıkarılırken bağlantı hatası oluştu.',
          keyPoints: [],
        },
      });
    } finally {
      set({ isGeneratingAiSummary: false });
    }
  },

  transformMessage: (payload: ActionTransformPayload) => {
    const convId = get().activeConversationId;
    const msgId = get().transformTargetMessage?.id;
    if (!convId || !msgId) return;

    set((state) => ({
      messages: {
        ...state.messages,
        [convId]: state.messages[convId].map((m) =>
          m.id === msgId ? { ...m, transformedAction: payload } : m
        ),
      },
      isTransformModalOpen: false,
      transformTargetMessage: null,
    }));
  },
}));
