'use client';
import { SERVICE_LINKS } from '@/modules/service-links';

import { AppArtwork } from '@/components/ui/AppArtwork';

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
import { getModuleById, getLocalizedModuleName } from '@/modules/registry';
import { useTranslation } from '@/lib/i18n';
import { useHomescreenStore } from '@/stores/useHomescreenStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { LockedFeatureModal } from '@/components/ui/LockedFeatureModal';
import type { HomescreenItem } from '@/types/module';
import { useLocaleRender } from '@/lib/i18n/runtime';

interface AppIconProps {
  item: HomescreenItem;
  isEditMode: boolean;
  onPress: (moduleId: string) => void;
  onRemove: (moduleId: string) => void;
}

function AppIcon({ item, isEditMode, onPress, onRemove }: AppIconProps) {
  const localizeText = useLocaleRender();
  const module = getModuleById(item.moduleId);
  const { locale } = useThemeStore();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
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
    held.current = false;
    if (!isEditMode) {
      longPressTimer.current = setTimeout(() => {
        held.current = true;
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
    if (held.current) { held.current = false; return; }
    if (isEditMode) { setEditMode(false); return; }
    if (!isEditMode) {
      onPress(item.moduleId);
    }
  }

  if (!module) return null;

  const name = getLocalizedModuleName(module, locale);

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
            aria-label={`${localizeText("Kaldır")}: ${name}`}
            className="absolute -top-2 -left-2 z-10 h-9 w-9 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm"
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
        onPointerCancel={handlePointerUp}
        onPointerMove={handlePointerUp}
        onClick={handleClick}
        whileTap={!isEditMode ? { scale: 0.92 } : {}}
        className={cn(
          'h-20 w-20 rounded-3xl flex items-center justify-center text-2xl shadow-sm border border-border/60 bg-card transition-all duration-200 hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary',

          isEditMode && 'cursor-grab active:cursor-grabbing touch-none'
        )}
        {...(isEditMode ? { ...attributes, ...listeners } : {})}
        aria-label={localizeText(name)}
      >
        <AppArtwork id={module.id} fallback={module.icon} className="h-12 w-12" />
      </motion.button>

      {/* Label */}
      <span className="text-xs font-medium text-foreground text-center leading-tight max-w-[104px] min-h-8 break-words">
        {localizeText(name)}
      </span>
    </motion.div>
  );
}

interface AppGridProps {
  pageIndex?: number;
}

export function AppGrid({ pageIndex = 0 }: AppGridProps) {
  const localizeText = useLocaleRender();
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

      if (SERVICE_LINKS[moduleId]) {
        router.push(SERVICE_LINKS[moduleId]);
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
        module.status === 'ACTIVE'
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

  const sortedItems = [...items].sort((a, b) => a.position - b.position);
  const sortableIds = sortedItems.map((item) => item.moduleId);

  const { t } = useTranslation();
  const activeComingSoonModule = comingSoonModule ? getModuleById(comingSoonModule) : null;
  const comingSoonName = activeComingSoonModule
    ? getLocalizedModuleName(activeComingSoonModule, locale)
    : '';

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 min-[380px]:grid-cols-4 sm:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6 px-4 py-4">
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

      {/* Coming Soon Modal */}
      <LockedFeatureModal
        isOpen={Boolean(comingSoonModule)}
        onClose={() => setComingSoonModule(null)}
        title={localizeText(comingSoonName)}
        description={
          localizeText(`${comingSoonName} modülünü sizin için hazırlıyoruz. Çok yakında LifeOS içerisinde kullanıma sunulacaktır.`)
        }
        moduleName="LifeOS Modül"
      />
    </>
  );
}

