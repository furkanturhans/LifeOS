'use client';

import React, { useEffect } from 'react';
import { useConnectStore } from '@/stores/useConnectStore';
import { ConnectSidebar } from './ConnectSidebar';
import { ConnectChatArea } from './ConnectChatArea';
import { ConnectCallModal } from './ConnectCallModal';
import { ConnectContextTransformModal } from './ConnectContextTransformModal';
import { ConnectNewChatModal } from './ConnectNewChatModal';

export function ConnectScreen() {
  const {
    fetchConversations,
    checkLiveKitStatus,
    isTransformModalOpen,
    transformTargetMessage,
    closeTransformModal,
    transformMessage,
  } = useConnectStore();

  useEffect(() => {
    fetchConversations();
    checkLiveKitStatus();
  }, [fetchConversations, checkLiveKitStatus]);

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* Sidebar with scopes and conversations */}
      <ConnectSidebar />

      {/* Active Conversation Chat View */}
      <ConnectChatArea />

      {/* Modals */}
      <ConnectCallModal />
      <ConnectNewChatModal />
      <ConnectContextTransformModal
        isOpen={isTransformModalOpen}
        onClose={closeTransformModal}
        message={transformTargetMessage}
        onTransform={transformMessage}
      />
    </div>
  );
}
