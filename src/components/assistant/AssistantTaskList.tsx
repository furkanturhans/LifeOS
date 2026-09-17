'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Inbox } from 'lucide-react';
import { AssistantTaskCard } from './AssistantTaskCard';
import { AssistantTaskDetailModal } from './AssistantTaskDetailModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAssistantStore } from '@/stores/useAssistantStore';
import type { AssistantTask } from '@/types/assistant';

export function AssistantTaskList() {
  const { tasks, activeTab, selectedCategory } = useAssistantStore();
  const [selectedTask, setSelectedTask] = useState<AssistantTask | null>(null);

  // Filter tasks based on activeTab and selectedCategory
  const filteredTasks = tasks.filter((t) => {
    // Tab Filter
    if (activeTab === 'pending_approval' && t.status !== 'pending_approval') return false;
    if (activeTab === 'in_progress' && t.status !== 'in_progress' && t.status !== 'awaiting_input') return false;
    if (activeTab === 'completed' && t.status !== 'completed') return false;

    // Category Filter
    if (selectedCategory !== 'all' && t.type !== selectedCategory) return false;

    return true;
  });

  // Keep selectedTask synchronized with store updates
  const liveSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || selectedTask
    : null;

  return (
    <div className="px-4 mt-5 pb-8 sm:px-6">
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={Bot}
          title={
            activeTab === 'pending_approval'
              ? 'Onay Bekleyen Görev Yok'
              : activeTab === 'in_progress'
              ? 'Yürütülen Aktif Görev Yok'
              : activeTab === 'completed'
              ? 'Henüz Tamamlanan Görev Yok'
              : 'Henüz Bir Görev Başlatılmadı'
          }
          description={
            activeTab === 'all'
              ? "Yukarıdaki komut alanına ne yapmak istediğinizi yazarak yapay zekâ asistanınıza ilk görevi verebilirsiniz."
              : 'Bu filtre kriterine uygun görev bulunmuyor.'
          }
          className="border-border bg-card/50 py-12"
        />
      ) : (
        <div className="space-y-3.5">
          {filteredTasks.map((task) => (
            <AssistantTaskCard
              key={task.id}
              task={task}
              onOpenDetail={(t) => setSelectedTask(t)}
            />
          ))}
        </div>
      )}

      {/* Task Detail & Approval Modal */}
      {liveSelectedTask && (
        <AssistantTaskDetailModal
          task={liveSelectedTask}
          isOpen={Boolean(liveSelectedTask)}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
