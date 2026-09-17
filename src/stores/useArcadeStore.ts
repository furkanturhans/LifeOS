import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ArcadeSectionKey,
  MiniGameId,
  GameSession,
  DailyQuest,
  Achievement,
  ArcadeGameScores,
} from '@/types/arcade';

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

const DEFAULT_DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'quest_play_any',
    title: 'Günün Oyun Seansı',
    description: 'Herhangi 2 oyunu oyna ve tamamla',
    iconEmoji: '🎮',
    targetValue: 2,
    currentValue: 0,
    xpReward: 50,
    isCompleted: false,
    questType: 'play_any_games',
  },
  {
    id: 'quest_board_play',
    title: 'Masa & Taş Ustası',
    description: 'Tavla, Satranç veya 101 Okey oyunundan birini oyna',
    iconEmoji: '🎲',
    targetValue: 1,
    currentValue: 0,
    xpReward: 40,
    isCompleted: false,
    questType: 'play_category_games',
    targetCategory: 'board',
  },
  {
    id: 'quest_cards_play',
    title: 'Kart Stratejisti',
    description: 'Batak, Pişti, Solitaire veya Poker oyununda skor üret',
    iconEmoji: '🃏',
    targetValue: 30,
    currentValue: 0,
    xpReward: 60,
    isCompleted: false,
    questType: 'reach_score',
  },
  {
    id: 'quest_puzzle_play',
    title: 'Zihin Egzersizi',
    description: 'Sudoku Master, 2048 veya Kelime Bulmaca tamamla',
    iconEmoji: '🧠',
    targetValue: 1,
    currentValue: 0,
    xpReward: 50,
    isCompleted: false,
    questType: 'play_category_games',
    targetCategory: 'mind_puzzle',
  },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Genel Başarımlar
  {
    id: 'ach_first_game',
    title: 'İlk Adım',
    description: 'Herhangi bir oyunu ilk kez oyna ve tamamla',
    iconEmoji: '🌱',
    category: 'general',
    points: 20,
    isUnlocked: false,
    progress: { current: 0, max: 1 },
  },
  {
    id: 'ach_distinct_games',
    title: 'Çok Yönlü Oyuncu',
    description: '4 farklı oyunu en az birer kez oyna',
    iconEmoji: '🌟',
    category: 'general',
    points: 50,
    isUnlocked: false,
    progress: { current: 0, max: 4 },
  },
  {
    id: 'ach_arcade_veteran',
    title: 'Arcade Tutkunu',
    description: 'Toplam 10 oyun oturumunu tamamla',
    iconEmoji: '🎖️',
    category: 'general',
    points: 100,
    isUnlocked: false,
    progress: { current: 0, max: 10 },
  },

  // Masa & Taş Oyunları
  {
    id: 'ach_board_master',
    title: 'Masa Dehası',
    description: 'Masa oyunları kategorisinde 2 farklı oyunu tamamla',
    iconEmoji: '🎲',
    category: 'board',
    points: 50,
    isUnlocked: false,
    progress: { current: 0, max: 2 },
  },

  // Klasik Kart Oyunları
  {
    id: 'ach_cards_expert',
    title: 'İskambil Ustası',
    description: 'Kart oyunlarında toplam 3 oyun tamamla',
    iconEmoji: '🃏',
    category: 'cards',
    points: 50,
    isUnlocked: false,
    progress: { current: 0, max: 3 },
  },

  // Zihin & Bulmaca
  {
    id: 'ach_mind_champion',
    title: 'Zihin Şampiyonu',
    description: 'Bulmaca ve zihin oyunlarında 2 farklı oyunu tamamla',
    iconEmoji: '🧠',
    category: 'mind_puzzle',
    points: 60,
    isUnlocked: false,
    progress: { current: 0, max: 2 },
  },
];

const BOARD_GAMES: MiniGameId[] = ['tavla', 'satranc', 'okey_101'];
const CARDS_GAMES: MiniGameId[] = ['poker', 'batak', 'pisti', 'solitaire'];
const MIND_GAMES: MiniGameId[] = ['sudoku_master', 'game_2048', 'kelime_bulmaca'];

function getGameCategory(id: MiniGameId): string {
  if (BOARD_GAMES.includes(id)) return 'board';
  if (CARDS_GAMES.includes(id)) return 'cards';
  if (MIND_GAMES.includes(id)) return 'mind_puzzle';
  return 'general';
}

interface ArcadeStoreState {
  activeSection: ArcadeSectionKey | null;
  activeGameId: MiniGameId | null;
  setActiveSection: (section: ArcadeSectionKey | null) => void;
  setActiveGameId: (gameId: MiniGameId | null) => void;

  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;

  userNickname: string;
  setUserNickname: (name: string) => void;

  questsDate: string;
  dailyQuests: DailyQuest[];
  checkAndResetDailyQuests: () => void;

  achievements: Achievement[];
  gameSessions: GameSession[];
  scores: ArcadeGameScores;
  totalXp: number;

  recordGameSession: (session: Omit<GameSession, 'sessionId' | 'completedAt'>) => void;
  resetAllProgress: () => void;
}

export const useArcadeStore = create<ArcadeStoreState>()(
  persist(
    (set, get) => ({
      activeSection: null,
      activeGameId: null,
      setActiveSection: (activeSection) => set({ activeSection }),
      setActiveGameId: (activeGameId) => set({ activeGameId }),

      isMuted: true,
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setMuted: (isMuted) => set({ isMuted }),

      userNickname: 'Oyuncu',
      setUserNickname: (userNickname) => set({ userNickname }),

      questsDate: getTodayDateString(),
      dailyQuests: DEFAULT_DAILY_QUESTS,
      achievements: DEFAULT_ACHIEVEMENTS,

      gameSessions: [],
      scores: {},
      totalXp: 0,

      checkAndResetDailyQuests: () => {
        const today = getTodayDateString();
        if (get().questsDate !== today) {
          set({
            questsDate: today,
            dailyQuests: DEFAULT_DAILY_QUESTS.map((q) => ({
              ...q,
              currentValue: 0,
              isCompleted: false,
            })),
          });
        }
      },

      recordGameSession: (rawSession) => {
        const today = getTodayDateString();
        if (get().questsDate !== today) {
          get().checkAndResetDailyQuests();
        }

        const fullSession: GameSession = {
          ...rawSession,
          sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          completedAt: new Date().toISOString(),
        };

        const currentSessions = [...get().gameSessions, fullSession];
        const currentScores = { ...get().scores };
        let additionalXp = 0;

        // 1. Update Best Scores
        const gameKey = `${fullSession.gameId}_high`;
        if (fullSession.score > (currentScores[gameKey] || 0)) {
          currentScores[gameKey] = fullSession.score;
        }

        const gameCat = getGameCategory(fullSession.gameId);

        // 2. Update Daily Quests
        const updatedQuests = get().dailyQuests.map((quest) => {
          if (quest.isCompleted) return quest;

          let newCurrent = quest.currentValue;

          if (quest.questType === 'play_any_games') {
            newCurrent += 1;
          } else if (
            quest.questType === 'play_category_games' &&
            quest.targetCategory === gameCat
          ) {
            newCurrent += 1;
          } else if (quest.questType === 'reach_score') {
            newCurrent = Math.max(newCurrent, fullSession.score);
          }

          const isNowCompleted = newCurrent >= quest.targetValue;
          if (isNowCompleted && !quest.isCompleted) {
            additionalXp += quest.xpReward;
          }

          return {
            ...quest,
            currentValue: newCurrent,
            isCompleted: isNowCompleted,
          };
        });

        // 3. Update Achievements
        const playedGameIds = new Set(currentSessions.map((s) => s.gameId));
        const playedBoardCount = new Set(currentSessions.filter((s) => BOARD_GAMES.includes(s.gameId)).map((s) => s.gameId)).size;
        const playedCardsCount = new Set(currentSessions.filter((s) => CARDS_GAMES.includes(s.gameId)).map((s) => s.gameId)).size;
        const playedMindCount = new Set(currentSessions.filter((s) => MIND_GAMES.includes(s.gameId)).map((s) => s.gameId)).size;

        const updatedAchievements = get().achievements.map((ach) => {
          if (ach.isUnlocked) return ach;

          let currentProg = ach.progress.current;
          let unlockNow = false;

          switch (ach.id) {
            case 'ach_first_game':
              currentProg = Math.min(1, currentSessions.length);
              unlockNow = currentProg >= 1;
              break;
            case 'ach_distinct_games':
              currentProg = Math.min(4, playedGameIds.size);
              unlockNow = currentProg >= 4;
              break;
            case 'ach_arcade_veteran':
              currentProg = Math.min(10, currentSessions.length);
              unlockNow = currentProg >= 10;
              break;
            case 'ach_board_master':
              currentProg = Math.min(2, playedBoardCount);
              unlockNow = currentProg >= 2;
              break;
            case 'ach_cards_expert':
              currentProg = Math.min(3, currentSessions.filter((s) => CARDS_GAMES.includes(s.gameId)).length);
              unlockNow = currentProg >= 3;
              break;
            case 'ach_mind_champion':
              currentProg = Math.min(2, playedMindCount);
              unlockNow = currentProg >= 2;
              break;
            default:
              break;
          }

          if (unlockNow && !ach.isUnlocked) {
            additionalXp += ach.points;
            return {
              ...ach,
              isUnlocked: true,
              unlockedAt: new Date().toISOString(),
              progress: { ...ach.progress, current: ach.progress.max },
            };
          }

          return {
            ...ach,
            progress: { ...ach.progress, current: currentProg },
          };
        });

        // Commit state
        set((state) => ({
          gameSessions: currentSessions,
          scores: currentScores,
          dailyQuests: updatedQuests,
          achievements: updatedAchievements,
          totalXp: state.totalXp + additionalXp,
        }));

        // Send score async to server API
        try {
          fetch('/api/arcade/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session: fullSession,
              displayName: get().userNickname,
            }),
          }).catch(() => {});
        } catch {}
      },

      resetAllProgress: () => {
        set({
          gameSessions: [],
          scores: {},
          dailyQuests: DEFAULT_DAILY_QUESTS.map((q) => ({
            ...q,
            currentValue: 0,
            isCompleted: false,
          })),
          achievements: DEFAULT_ACHIEVEMENTS.map((a) => ({
            ...a,
            isUnlocked: false,
            unlockedAt: undefined,
            progress: { ...a.progress, current: 0 },
          })),
          totalXp: 0,
        });
      },
    }),
    {
      name: 'lifeos-arcade-storage',
    }
  )
);
