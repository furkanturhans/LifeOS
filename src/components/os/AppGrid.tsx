'use client';

import { useState, useRef, useCallback } from 'react';
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
import type { HomescreenItem } from '@/types/module';

interface AppIconProps {
  item: HomescreenItem;
  isEditMode: boolean;
  onPress: (moduleId: string) => void;
  onRemove: (moduleId: string) => void;
  onLongPress: (moduleId: string) => void;
}

function AppIcon({ item, isEditMode, onPress, onRemove, onLongPress }: AppIconProps) {
  const moduleDef = getModuleById(item.moduleId);
  const { locale } = useThemeStore();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasLongPressed = useRef(false);

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
      wasLongPressed.current = false;
      longPressTimer.current = setTimeout(() => {
        wasLongPressed.current = true;
        onLongPress(item.moduleId);
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
    if (!isEditMode && !wasLongPressed.current) {
      onPress(item.moduleId);
    }
  }

  if (!moduleDef) return null;

  const name = locale === 'tr' ? moduleDef.name : moduleDef.nameEn;

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
            className="absolute -top-2 -left-2 z-10 h-5 w-5 rounded-full bg-foreground/80 text-background flex items-center justify-center shadow-sm"
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
        whileTap={!isEditMode ? { scale: 0.9 } : {}}
        className={cn(
          'h-[68px] w-[68px] rounded-[18px] flex items-center justify-center text-3xl shadow-md transition-shadow duration-200',
          `bg-gradient-to-br ${moduleDef.gradient}`,
          isEditMode && 'cursor-grab active:cursor-grabbing'
        )}
        {...(isEditMode ? { ...attributes, ...listeners } : {})}
        aria-label={name}
      >
        <span>{moduleDef.icon}</span>
      </motion.button>

      {/* Label */}
      <span className="text-[11px] font-medium text-foreground/90 text-center leading-tight max-w-[72px] truncate">
        {name}
      </span>
    </motion.div>
  );
}

interface AppGridProps {
  pageIndex?: number;
}

export function AppGrid({ pageIndex = 0 }: AppGridProps) {
  const {
    layout,
    isEditMode,
    reorderModules,
    removeModuleFromHomescreen,
    setEditMode,
  } = useHomescreenStore();

  const [comingSoonModule, setComingSoonModule] = useState<string | null>(null);
  const [activeOptionsModule, setActiveOptionsModule] = useState<string | null>(null);
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
      const moduleDef = getModuleById(moduleId);
      if (!moduleDef) return;
      if (moduleDef.status === 'COMING_SOON' || moduleDef.status !== 'ACTIVE') {
        setComingSoonModule(moduleId);
      }
    },
    []
  );

  const handleRemove = useCallback(
    (moduleId: string) => {
      removeModuleFromHomescreen(moduleId);
    },
    [removeModuleFromHomescreen]
  );

  const handleLongPress = useCallback(
    (moduleId: string) => {
      setActiveOptionsModule(moduleId);
    },
    []
  );

  const sortedItems = [...items].sort((a, b) => a.position - b.position);
  const sortableIds = sortedItems.map((item) => item.moduleId);

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
                  onLongPress={handleLongPress}
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
              className="px-6 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold shadow-lg"
            >
              {locale === 'tr' ? 'Bitti' : 'Done'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coming Soon Modal */}
      <ComingSoonModal
        moduleId={comingSoonModule}
        onClose={() => setComingSoonModule(null)}
        locale={locale}
      />

      {/* App Options Menu Modal */}
      <AppOptionsModal
        moduleId={activeOptionsModule}
        onClose={() => setActiveOptionsModule(null)}
        onOpenApp={handleModulePress}
        onRemoveApp={handleRemove}
        locale={locale}
      />
    </>
  );
}

// Coming Soon Modal inline
interface ComingSoonModalProps {
  moduleId: string | null;
  onClose: () => void;
  locale: string;
}

function ComingSoonModal({ moduleId, onClose, locale }: ComingSoonModalProps) {
  const moduleDef = moduleId ? getModuleById(moduleId) : null;

  if (!moduleDef) return null;

  const name = locale === 'tr' ? moduleDef.name : moduleDef.nameEn;

  return (
    <AnimatePresence>
      {moduleId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm"
          >
            <div className="rounded-3xl bg-card border border-border shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex flex-col items-center pt-8 pb-6 px-6">
                {/* Icon */}
                <div
                  className={cn(
                    'h-20 w-20 rounded-[24px] flex items-center justify-center text-4xl mb-4 shadow-lg',
                    `bg-gradient-to-br ${moduleDef.gradient}`
                  )}
                >
                  {moduleDef.icon}
                </div>

                {/* Badge */}
                <span className="mb-3 inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-400">
                  {locale === 'tr' ? '🚀 Çok Yakında' : '🚀 Coming Soon'}
                </span>

                {/* Title */}
                <h2 className="text-xl font-bold text-foreground text-center">{name}</h2>

                {/* Description */}
                <p className="mt-3 text-sm text-muted-foreground text-center leading-relaxed">
                  {locale === 'tr'
                    ? `${name} modülünü sizin için hazırlıyoruz. Çok yakında LifeOS içerisinde kullanıma sunacağız.`
                    : `We're preparing the ${name} module for you. It will be available in LifeOS very soon.`}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Action */}
              <button
                onClick={onClose}
                className="w-full py-4 text-center text-base font-semibold text-primary hover:bg-muted/50 transition-colors"
              >
                {locale === 'tr' ? 'Tamam' : 'OK'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface AppOptionsModalProps {
  moduleId: string | null;
  onClose: () => void;
  onOpenApp: (moduleId: string) => void;
  onRemoveApp: (moduleId: string) => void;
  locale: string;
}

function AppOptionsModal({ moduleId, onClose, onOpenApp, onRemoveApp, locale }: AppOptionsModalProps) {
  const moduleDef = moduleId ? getModuleById(moduleId) : null;

  if (!moduleDef) return null;

  const name = locale === 'tr' ? moduleDef.name : moduleDef.nameEn;

  return (
    <AnimatePresence>
      {moduleId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[3px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm"
          >
            <div className="rounded-3xl bg-card/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden p-4 space-y-3">
              <div className="flex items-center gap-3 px-2 py-1">
                <div className={cn(
                  "h-12 w-12 rounded-[14px] flex items-center justify-center text-2xl shadow-sm bg-gradient-to-br",
                  moduleDef.gradient
                )}>
                  {moduleDef.icon}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {locale === 'tr' ? 'Uygulama Seçenekleri' : 'App Options'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden divide-y divide-white/5">
                <button
                  onClick={() => {
                    onOpenApp(moduleId);
                    onClose();
                  }}
                  className="w-full py-3.5 px-4 text-left text-sm font-semibold text-foreground hover:bg-white/10 transition-colors flex items-center justify-between"
                >
                  <span>{locale === 'tr' ? 'Aç' : 'Open'}</span>
                </button>

                <button
                  onClick={() => {
                    onRemoveApp(moduleId);
                    onClose();
                  }}
                  className="w-full py-3.5 px-4 text-left text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-between"
                >
                  <span>{locale === 'tr' ? 'Ana Ekrandan Kaldır' : 'Remove from Home'}</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-muted/60 hover:bg-muted font-semibold text-sm text-foreground transition-all active:scale-[0.98]"
              >
                {locale === 'tr' ? 'İptal' : 'Cancel'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
