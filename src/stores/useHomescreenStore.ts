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
  fetchLayout: () => Promise<void>;
  syncLayout: () => Promise<void>;
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

  fetchLayout: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/user/homescreen');
      if (res.ok) {
        const data = await res.json();
        if (data.layout) {
          set({ layout: data.layout });
        }
      }
    } catch (err) {
      console.warn('Could not fetch homescreen layout:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  syncLayout: async () => {
    const { layout } = get();
    try {
      await fetch('/api/user/homescreen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout })
      });
    } catch (err) {
      console.warn('Could not sync homescreen layout:', err);
    }
  },

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

    get().syncLayout();
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

    get().syncLayout();
  },

  reorderModules: (pageIndex, items) => {
    const { layout } = get();
    const updatedPages = layout.pages.map((page, i) =>
      i === pageIndex ? { ...page, items } : page
    );
    set({ layout: { ...layout, pages: updatedPages } });

    get().syncLayout();
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

    get().syncLayout();
  },

  removeModuleFromDock: (moduleId) => {
    const { layout } = get();
    const updatedDock = layout.dockItems
      .filter((item) => item.moduleId !== moduleId)
      .map((item, index) => ({ ...item, position: index }));
    set({ layout: { ...layout, dockItems: updatedDock } });

    get().syncLayout();
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
