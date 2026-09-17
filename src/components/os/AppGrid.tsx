'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { getModuleById } from '@/modules/registry';
import { useHomescreenStore } from '@/stores/useHomescreenStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { LockedFeatureModal } from '@/components/ui/LockedFeatureModal';
import type { HomescreenItem } from '@/types/module';

interface AppIconProps {
  item: HomescreenItem;
  isEditMode: boolean;
  onPress: (moduleId: string) => void;
  onRemove: (moduleId: string) => void;
}

function AppIcon({ item, isEditMode, onPress, onRemove }: AppIconProps) {
  const module = getModuleById(item.moduleId);
  const { locale } = useThemeStore();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setEditMode } = useHomescreenStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.moduleId, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  function handlePointerDown() {
    if (!isEditMode) {
      longPressTimer.current = setTimeout(() => {
        setEditMode(true);
      }, 500);
    }
  }

  function handlePointerUp() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handleClick() {
    if (!isEditMode) {
      onPress(item.moduleId);
    }
  }

  if (!module) return null;

  const name = locale === 'tr' ? module.name : module.nameEn;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative flex flex-col items-center gap-1.5',
        isDragging && 'opacity-50'
      )}
      animate={isEditMode && !isDragging ? { rotate: [-1.5, 1.5] } : { rotate: 0 }}
      transition={
        isEditMode && !isDragging
          ? { repeat: Infinity, repeatType: 'reverse', duration: 0.25, ease: 'easeInOut' }
          : { duration: 0.2 }
      }
    >
      {/* Remove button */}
      <AnimatePresence>
        {isEditMode && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.moduleId);
            }}
            className="absolute -top-2 -left-2 z-10 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm"
          >
            <X className="h-3 w-3" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Icon */}
      <motion.button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        whileTap={!isEditMode ? { scale: 0.92 } : {}}
        className={cn(
          'h-16 w-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/10 transition-all duration-200',
          `bg-gradient-to-br ${module.gradient}`,
          isEditMode && 'cursor-grab active:cursor-grabbing'
        )}
        {...(isEditMode ? { ...attributes, ...listeners } : {})}
        aria-label={name}
      >
        <span>{module.icon}</span>
      </motion.button>

      {/* Label */}
      <span className="text-xs font-medium text-foreground text-center leading-tight max-w-[72px] truncate">
        {name}
      </span>
    </motion.div>
  );
}

interface AppGridProps {
  pageIndex?: number;
}

export function AppGrid({ pageIndex = 0 }: AppGridProps) {
  const router = useRouter();
  const {
    layout,
    isEditMode,
    reorderModules,
    removeModuleFromHomescreen,
    setEditMode,
  } = useHomescreenStore();

  const [comingSoonModule, setComingSoonModule] = useState<string | null>(null);
  const { locale } = useThemeStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const page = layout.pages[pageIndex];
  const items = page?.items ?? [];

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.moduleId === active.id);
    const newIndex = items.findIndex((item) => item.moduleId === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...items];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updatedItems = reordered.map((item, index) => ({
      ...item,
      position: index,
    }));

    reorderModules(pageIndex, updatedItems);
  }

  const handleModulePress = useCallback(
    (moduleId: string) => {
      const module = getModuleById(moduleId);
      if (!module) return;

      if (moduleId === 'taxi') {
        router.push('/services/taxi');
        return;
      }
      if (moduleId === 'travel') {
        router.push('/services/travel');
        return;
      }
      if (moduleId === 'moving') {
        router.push('/services/moving');
        return;
      }
      if (moduleId === 'craftsman') {
        router.push('/services/craftsman');
        return;
      }
      if (moduleId === 'smart-home' || moduleId === 'smarthome') {
        router.push('/smarthome');
        return;
      }
      if (
        moduleId === 'family' ||
        moduleId === 'finance' ||
        moduleId === 'arcade' ||
        moduleId === 'kids' ||
        moduleId === 'services' ||
        (module.status === 'ACTIVE' && moduleId !== 'explore')
      ) {
        router.push(`/${moduleId}`);
        return;
      }
      setComingSoonModule(moduleId);
    },
    [router]
  );

  const handleRemove = useCallback(
    (moduleId: string) => {
      removeModuleFromHomescreen(moduleId);
    },
    [removeModuleFromHomescreen]
  );

  const SUB_SERVICES = new Set(['taxi', 'travel', 'moving', 'craftsman']);
  const filteredItems = items.filter((item) => !SUB_SERVICES.has(item.moduleId));
  const sortedItems = [...filteredItems].sort((a, b) => a.position - b.position);
  const sortableIds = sortedItems.map((item) => item.moduleId);

  const activeComingSoonModule = comingSoonModule ? getModuleById(comingSoonModule) : null;
  const comingSoonName = activeComingSoonModule
    ? locale === 'tr'
      ? activeComingSoonModule.name
      : activeComingSoonModule.nameEn
    : '';

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-4 gap-x-4 gap-y-6 px-4 py-2">
            {sortedItems.map((item) => (
              <div key={item.moduleId} className="flex justify-center">
                <AppIcon
                  item={item}
                  isEditMode={isEditMode}
                  onPress={handleModulePress}
                  onRemove={handleRemove}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Edit mode done button */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-30"
          >
            <button
              onClick={() => setEditMode(false)}
              className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg"
            >
              {locale === 'tr' ? 'Bitti' : 'Done'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coming Soon Modal */}
      <LockedFeatureModal
        isOpen={Boolean(comingSoonModule)}
        onClose={() => setComingSoonModule(null)}
        title={comingSoonName}
        description={
          locale === 'tr'
            ? `${comingSoonName} modülünü sizin için hazırlıyoruz. Çok yakında LifeOS içerisinde kullanıma sunulacaktır.`
            : `We are preparing the ${comingSoonName} module for you. It will be available in LifeOS soon.`
        }
        moduleName="LifeOS Modül"
      />
    </>
  );
}

