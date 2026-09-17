'use client';

import React from 'react';
import { AssistantHeader } from './AssistantHeader';
import { AssistantSecurityBanner } from './AssistantSecurityBanner';
import { AssistantCommandInput } from './AssistantCommandInput';
import { AssistantTaskTabs } from './AssistantTaskTabs';
import { AssistantTaskList } from './AssistantTaskList';
import { AssistantChatView } from './AssistantChatView';
import { AssistantPermissionCenter } from './AssistantPermissionCenter';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { Dock } from '@/components/os/Dock';

export function AssistantScreen() {
  const { currentView } = useAssistantStore();

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Header */}
      <AssistantHeader />

      {/* Main Content Area */}
      {currentView === 'chat' && (
        <div className="flex-1 overflow-hidden">
          <AssistantChatView />
        </div>
      )}

      {currentView === 'tasks' && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
          {/* Security & Privacy Banner */}
          <AssistantSecurityBanner />

          {/* Natural Language Command Input */}
          <AssistantCommandInput />

          {/* Task Tabs & Filters */}
          <AssistantTaskTabs />

          {/* Tasks List */}
          <AssistantTaskList />
        </div>
      )}

      {currentView === 'permissions' && (
        <div className="flex-1 overflow-hidden">
          <AssistantPermissionCenter />
        </div>
      )}

      {/* Mobile Glass Dock (hidden in chat view to avoid overlapping bottom bar, or included consistently) */}
      <Dock />
    </div>
  );
}

