import { create } from 'zustand';
import type { HomescreenLayout, HomescreenPage, HomescreenItem, DockItem } from '@/types/module';
import { DEFAULT_HOMESCREEN_MODULES, DEFAULT_DOCK_MODULES } from '@/modules/registry';

function buildDefaultLayout(): HomescreenLayout {
  const items: HomescreenItem[] = DEFAULT_HOMESCREEN_MODULES.map((id, index) => ({
    moduleId: id,
    position: index,
    size: 'small' as const,
  }));

  const dockItems: DockItem[] = DEFAULT_DOCK_MODULES.map((id, index) => ({
    moduleId: id,
    position: index,
  }));

  return {
    pages: [{ page: 0, items }],
    dockItems,
  };
}

interface HomescreenState {
  layout: HomescreenLayout;
  isEditMode: boolean;
  isLoading: boolean;
  activePageIndex: number;
  setLayout: (layout: HomescreenLayout) => void;
  setEditMode: (editMode: boolean) => void;
  setLoading: (loading: boolean) => void;
  setActivePage: (index: number) => void;
  addModuleToHomescreen: (moduleId: string) => void;
  removeModuleFromHomescreen: (moduleId: string) => void;
  reorderModules: (pageIndex: number, items: HomescreenItem[]) => void;
  moveModuleToDock: (moduleId: string) => void;
  removeModuleFromDock: (moduleId: string) => void;
  isModuleOnHomescreen: (moduleId: string) => boolean;
  isModuleInDock: (moduleId: string) => boolean;
}

export const useHomescreenStore = create<HomescreenState>()((set, get) => ({
  layout: buildDefaultLayout(),
  isEditMode: false,
  isLoading: false,
  activePageIndex: 0,

  setLayout: (layout) => set({ layout }),
  setEditMode: (isEditMode) => set({ isEditMode }),
  setLoading: (isLoading) => set({ isLoading }),
  setActivePage: (activePageIndex) => set({ activePageIndex }),

  addModuleToHomescreen: (moduleId) => {
    const { layout } = get();
    const currentPage = layout.pages[0] || { page: 0, items: [] };

    // Check if already on homescreen
    const alreadyAdded = currentPage.items.some((item) => item.moduleId === moduleId);
    if (alreadyAdded) return;

    const newItem: HomescreenItem = {
      moduleId,
      position: currentPage.items.length,
      size: 'small',
    };

    const updatedPage: HomescreenPage = {
      ...currentPage,
      items: [...currentPage.items, newItem],
    };

    set({
      layout: {
        ...layout,
        pages: [updatedPage, ...layout.pages.slice(1)],
      },
    });
  },

  removeModuleFromHomescreen: (moduleId) => {
    const { layout } = get();
    const updatedPages = layout.pages.map((page) => ({
      ...page,
      items: page.items
        .filter((item) => item.moduleId !== moduleId)
        .map((item, index) => ({ ...item, position: index })),
    }));
    set({ layout: { ...layout, pages: updatedPages } });
  },

  reorderModules: (pageIndex, items) => {
    const { layout } = get();
    const updatedPages = layout.pages.map((page, i) =>
      i === pageIndex ? { ...page, items } : page
    );
    set({ layout: { ...layout, pages: updatedPages } });
  },

  moveModuleToDock: (moduleId) => {
    const { layout } = get();
    const alreadyInDock = layout.dockItems.some((item) => item.moduleId === moduleId);
    if (alreadyInDock || layout.dockItems.length >= 5) return;

    const newDockItem: DockItem = {
      moduleId,
      position: layout.dockItems.length,
    };

    set({ layout: { ...layout, dockItems: [...layout.dockItems, newDockItem] } });
  },

  removeModuleFromDock: (moduleId) => {
    const { layout } = get();
    const updatedDock = layout.dockItems
      .filter((item) => item.moduleId !== moduleId)
      .map((item, index) => ({ ...item, position: index }));
    set({ layout: { ...layout, dockItems: updatedDock } });
  },

  isModuleOnHomescreen: (moduleId) => {
    const { layout } = get();
    return layout.pages.some((page) =>
      page.items.some((item) => item.moduleId === moduleId)
    );
  },

  isModuleInDock: (moduleId) => {
    const { layout } = get();
    return layout.dockItems.some((item) => item.moduleId === moduleId);
  },
}));
