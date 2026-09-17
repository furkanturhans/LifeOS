import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ArcadeSectionKey,
  MiniGameId,
  GameSession,
  DailyQuest,
  Achievement,
  KidsGameScores,
} from '@/types/arcade';

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

const DEFAULT_DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'quest_play_any',
    title: 'Günün Isınma Turları',
    description: 'Herhangi 3 mini oyunu oyna ve tamamla',
    iconEmoji: '🎮',
    targetValue: 3,
    currentValue: 0,
    xpReward: 50,
    isCompleted: false,
    questType: 'play_any_games',
  },
  {
    id: 'quest_puzzle_play',
    title: 'Zeka & Bulmaca Ustası',
    description: 'Zeka veya bulmaca kategorisinden bir oyun tamamla',
    iconEmoji: '🧩',
    targetValue: 1,
    currentValue: 0,
    xpReward: 40,
    isCompleted: false,
    questType: 'play_category_games',
    targetCategory: 'puzzle',
  },
  {
    id: 'quest_reflex_score',
    title: 'Hızlı Parmaklar',
    description: 'Refleks veya hız oyunlarında en az 40 puan topla',
    iconEmoji: '⚡️',
    targetValue: 40,
    currentValue: 0,
    xpReward: 60,
    isCompleted: false,
    questType: 'reach_score',
  },
  {
    id: 'quest_learning_play',
    title: 'Bilgi Kaşifi',
    description: 'Öğrenme veya bilgi kategorisinden bir oyun tamamla',
    iconEmoji: '📚',
    targetValue: 1,
    currentValue: 0,
    xpReward: 50,
    isCompleted: false,
    questType: 'play_category_games',
    targetCategory: 'learning',
  },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Genel Başarımlar
  {
    id: 'ach_first_game',
    title: 'İlk Adım',
    description: 'Herhangi bir mini oyunu ilk kez oyna ve tamamla',
    iconEmoji: '🌱',
    category: 'general',
    points: 20,
    isUnlocked: false,
    progress: { current: 0, max: 1 },
  },
  {
    id: 'ach_distinct_games',
    title: 'Çok Yönlü Oyuncu',
    description: '5 farklı mini oyunu en az birer kez oyna',
    iconEmoji: '🌟',
    category: 'general',
    points: 50,
    isUnlocked: false,
    progress: { current: 0, max: 5 },
  },
  {
    id: 'ach_arcade_veteran',
    title: 'Arcade Tutkunu',
    description: 'Toplam 15 mini oyun oturumunu tamamla',
    iconEmoji: '🎖️',
    category: 'general',
    points: 100,
    isUnlocked: false,
    progress: { current: 0, max: 15 },
  },

  // Zeka & Bulmaca
  {
    id: 'ach_puzzle_master',
    title: 'Bulmaca Dehası',
    description: 'Zeka ve bulmaca kategorisinde 3 farklı oyunu tamamla',
    iconEmoji: '🧠',
    category: 'puzzle',
    points: 50,
    isUnlocked: false,
    progress: { current: 0, max: 3 },
  },

  // Görsel & Şekil
  {
    id: 'ach_visual_expert',
    title: 'Görsel Usta',
    description: 'Görsel ve şekil kategorisinde 3 farklı oyunu tamamla',
    iconEmoji: '🎨',
    category: 'visual',
    points: 50,
    isUnlocked: false,
    progress: { current: 0, max: 3 },
  },

  // Hız & Refleks
  {
    id: 'ach_reflex_champion',
    title: 'Refleks Şampiyonu',
    description: 'Refleks oyunlarında toplam 5 oyun tamamla',
    iconEmoji: '⚡️',
    category: 'reflex',
    points: 60,
    isUnlocked: false,
    progress: { current: 0, max: 5 },
  },

  // Öğrenme & Bilgi
  {
    id: 'ach_knowledge_guru',
    title: 'Bilgi Gurusu',
    description: 'Öğrenme ve bilgi oyunlarında 3 farklı oyunu tamamla',
    iconEmoji: '📚',
    category: 'learning',
    points: 50,
    isUnlocked: false,
    progress: { current: 0, max: 3 },
  },
];

// Helper to determine category of a game
const PUZZLE_GAMES: MiniGameId[] = ['bilmece', 'kelime_avi', 'kelime_yap', 'anagram', 'cocuk_sudoku', 'mantik_kareleri', 'sayi_sekilleri'];
const VISUAL_GAMES: MiniGameId[] = ['memory_match', 'tangram', 'yapboz', 'labirent', 'fark_bul', 'golge_eslestir', 'desen_tamamla', 'shape_counting'];
const REFLEX_GAMES: MiniGameId[] = ['simon_diyor', 'hizli_dokun', 'balon_patlat', 'meyve_yakala', 'renk_kosusu', 'baloncuk_birlestir', 'kule_yap', 'mini_kosucu'];
const LEARNING_GAMES: MiniGameId[] = ['matematik_hizi', 'hedef_sayi', 'saat_ogren', 'yazim_oyunu', 'hayvan_bilgisi', 'bayraklar', 'color_pattern'];

function getGameCategory(id: MiniGameId): string {
  if (PUZZLE_GAMES.includes(id)) return 'puzzle';
  if (VISUAL_GAMES.includes(id)) return 'visual';
  if (REFLEX_GAMES.includes(id)) return 'reflex';
  if (LEARNING_GAMES.includes(id)) return 'learning';
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
  scores: KidsGameScores;
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
      scores: {
        memoryMatchBest: {},
        shapeCountingHighScore: 0,
        colorPatternHighScore: 0,
      },
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
        if (fullSession.gameId === 'memory_match' && fullSession.difficulty && fullSession.moves) {
          const diffKey =
            fullSession.difficulty === 'easy'
              ? 'easyMoves'
              : fullSession.difficulty === 'medium'
              ? 'mediumMoves'
              : 'hardMoves';
          const prevBest = currentScores.memoryMatchBest[diffKey];
          if (!prevBest || fullSession.moves < prevBest) {
            currentScores.memoryMatchBest[diffKey] = fullSession.moves;
          }
        } else {
          const gameKey = `${fullSession.gameId}_high`;
          if (fullSession.score > (currentScores[gameKey] || 0)) {
            currentScores[gameKey] = fullSession.score;
          }
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
        const playedPuzzleCount = new Set(currentSessions.filter((s) => PUZZLE_GAMES.includes(s.gameId)).map((s) => s.gameId)).size;
        const playedVisualCount = new Set(currentSessions.filter((s) => VISUAL_GAMES.includes(s.gameId)).map((s) => s.gameId)).size;
        const playedReflexSessions = currentSessions.filter((s) => REFLEX_GAMES.includes(s.gameId)).length;
        const playedLearningCount = new Set(currentSessions.filter((s) => LEARNING_GAMES.includes(s.gameId)).map((s) => s.gameId)).size;

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
              currentProg = Math.min(5, playedGameIds.size);
              unlockNow = currentProg >= 5;
              break;
            case 'ach_arcade_veteran':
              currentProg = Math.min(15, currentSessions.length);
              unlockNow = currentProg >= 15;
              break;
            case 'ach_puzzle_master':
              currentProg = Math.min(3, playedPuzzleCount);
              unlockNow = currentProg >= 3;
              break;
            case 'ach_visual_expert':
              currentProg = Math.min(3, playedVisualCount);
              unlockNow = currentProg >= 3;
              break;
            case 'ach_reflex_champion':
              currentProg = Math.min(5, playedReflexSessions);
              unlockNow = currentProg >= 5;
              break;
            case 'ach_knowledge_guru':
              currentProg = Math.min(3, playedLearningCount);
              unlockNow = currentProg >= 3;
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
          scores: {
            memoryMatchBest: {},
            shapeCountingHighScore: 0,
            colorPatternHighScore: 0,
          },
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
