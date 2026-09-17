import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KidsGameScores } from '@/types/arcade';

interface KidsGamesStoreState {
  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;

  scores: KidsGameScores;
  updateMemoryBest: (diff: 'easy' | 'medium' | 'hard', moves: number) => void;
  updateShapeScore: (score: number) => void;
  updateColorPatternScore: (score: number) => void;
  resetAllScores: () => void;
}

export const useKidsGamesStore = create<KidsGamesStoreState>()(
  persist(
    (set, get) => ({
      // Sound defaults to OFF (Muted) for quiet & child-safe experience
      isMuted: true,
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setMuted: (isMuted) => set({ isMuted }),

      scores: {
        memoryMatchBest: {},
        shapeCountingHighScore: 0,
        colorPatternHighScore: 0,
      },

      updateMemoryBest: (diff, moves) => {
        const key = diff === 'easy' ? 'easyMoves' : diff === 'medium' ? 'mediumMoves' : 'hardMoves';
        const currentBest = get().scores.memoryMatchBest[key];

        if (!currentBest || moves < currentBest) {
          set((state) => ({
            scores: {
              ...state.scores,
              memoryMatchBest: {
                ...state.scores.memoryMatchBest,
                [key]: moves,
              },
            },
          }));
        }
      },

      updateShapeScore: (newScore) => {
        const current = get().scores.shapeCountingHighScore || 0;
        if (newScore > current) {
          set((state) => ({
            scores: {
              ...state.scores,
              shapeCountingHighScore: newScore,
            },
          }));
        }
      },

      updateColorPatternScore: (newScore) => {
        const current = get().scores.colorPatternHighScore || 0;
        if (newScore > current) {
          set((state) => ({
            scores: {
              ...state.scores,
              colorPatternHighScore: newScore,
            },
          }));
        }
      },

      resetAllScores: () => {
        set({
          scores: {
            memoryMatchBest: {},
            shapeCountingHighScore: 0,
            colorPatternHighScore: 0,
          },
        });
      },
    }),
    {
      name: 'lifeos-kids-games-storage',
    }
  )
);
