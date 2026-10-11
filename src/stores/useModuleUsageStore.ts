import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Usage = Record<string, { count: number; lastOpened: number }>;
type WidgetPreference = { visible: boolean; manual: boolean; pinned: string[] };
export const DEFAULT_WIDGET: WidgetPreference = { visible: true, manual: false, pinned: [] };
export const useModuleUsageStore = create<{
  accounts: Record<string, Usage>;
  widgets: Record<string, WidgetPreference>;
  configure: (account: string, patch: Partial<WidgetPreference>) => void;
  record: (account: string, id: string) => void;
}>()(persist((set) => ({
  accounts: {},
  widgets: {},
  configure: (account, patch) => set(state => {
    const next = { ...(state.widgets[account] ?? DEFAULT_WIDGET), ...patch };
    next.pinned = [...new Set(next.pinned)].slice(0, 4);
    return { widgets: { ...state.widgets, [account]: next } };
  }),
  record: (account, id) => set(state => {
    const usage = state.accounts[account] ?? {};
    return { accounts: { ...state.accounts, [account]: { ...usage,
      [id]: { count: (usage[id]?.count ?? 0) + 1, lastOpened: Date.now() },
    } } };
  }),
}), { name: 'lifeos-module-usage', partialize: state => ({ accounts: state.accounts, widgets: state.widgets }) }));
