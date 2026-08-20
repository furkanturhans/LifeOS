import { create } from 'zustand';
import type { ModuleDefinition } from '@/types/module';

interface SearchState {
  query: string;
  isOpen: boolean;
  results: ModuleDefinition[];
  recentSearches: string[];
  setQuery: (query: string) => void;
  setOpen: (open: boolean) => void;
  setResults: (results: ModuleDefinition[]) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>()((set, get) => ({
  query: '',
  isOpen: false,
  results: [],
  recentSearches: [],

  setQuery: (query) => set({ query }),
  setOpen: (isOpen) => set({ isOpen }),
  setResults: (results) => set({ results }),

  addRecentSearch: (query) => {
    if (!query.trim()) return;
    const { recentSearches } = get();
    const filtered = recentSearches.filter((s) => s !== query);
    set({ recentSearches: [query, ...filtered].slice(0, 10) });
  },

  clearRecentSearches: () => set({ recentSearches: [] }),

  reset: () => set({ query: '', isOpen: false, results: [] }),
}));
