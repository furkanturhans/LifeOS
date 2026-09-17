export type ArcadeSectionKey =
  | 'mini_games'
  | 'daily_quests'
  | 'achievements'
  | 'leaderboard';

export type AdultGameId =
  // 🎲 Masa & Taş Oyunları
  | 'tavla'
  | 'satranc'
  | 'okey_101'
  // 🃏 Klasik Kart Oyunları
  | 'poker'
  | 'batak'
  | 'pisti'
  | 'solitaire'
  // 🧠 Zihin & Bulmaca & Strateji
  | 'sudoku_master'
  | 'game_2048'
  | 'kelime_bulmaca';

export type LegacyKidsGameId =
  | 'bilmece'
  | 'kelime_avi'
  | 'kelime_yap'
  | 'anagram'
  | 'cocuk_sudoku'
  | 'mantik_kareleri'
  | 'sayi_sekilleri'
  | 'memory_match'
  | 'tangram'
  | 'yapboz'
  | 'labirent'
  | 'fark_bul'
  | 'golge_eslestir'
  | 'desen_tamamla'
  | 'shape_counting'
  | 'simon_diyor'
  | 'hizli_dokun'
  | 'balon_patlat'
  | 'meyve_yakala'
  | 'renk_kosusu'
  | 'baloncuk_birlestir'
  | 'kule_yap'
  | 'mini_kosucu'
  | 'matematik_hizi'
  | 'hedef_sayi'
  | 'saat_ogren'
  | 'yazim_oyunu'
  | 'hayvan_bilgisi'
  | 'bayraklar'
  | 'color_pattern';

export type MiniGameId = AdultGameId | LegacyKidsGameId;

// Backward compatibility alias for any legacy references
export type KidsGameId = MiniGameId;

export type GameCatalogCategory =
  | 'all'
  | 'board'
  | 'cards'
  | 'mind_puzzle'
  | 'strategy'
  | 'puzzle'
  | 'visual'
  | 'reflex'
  | 'learning';

export interface MiniGameMeta {
  id: MiniGameId;
  title: string;
  subtitle: string;
  category: string;
  catalogCategory: GameCatalogCategory;
  iconEmoji: string;
  colorClass: string;
  isAvailable?: boolean;
  playerCount?: string;
  badge?: string;
  ageRange?: string;
}

export type KidsGameMeta = MiniGameMeta;

export interface KidsGameScores {
  memoryMatchBest: {
    easyMoves?: number;
    mediumMoves?: number;
    hardMoves?: number;
  };
  shapeCountingHighScore: number;
  colorPatternHighScore: number;
  [key: string]: any;
}

export interface ArcadeGameScores {
  [gameId: string]: any;
}

export interface ArcadeSectionItem {
  id: ArcadeSectionKey;
  titleTr: string;
  titleEn: string;
  taglineTr: string;
  taglineEn: string;
  iconName: string;
  gradient: string;
  isLocked: boolean;
}

export interface GameSession {
  sessionId: string;
  gameId: MiniGameId;
  score: number;
  moves?: number;
  level?: number;
  timeSpentSeconds: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  victory: boolean;
  completedAt: string; // ISO timestamp
}

export type QuestType =
  | 'play_any_games'
  | 'reach_score'
  | 'play_category_games'
  | 'win_board_game'
  | 'win_card_game'
  | 'complete_memory'
  | 'reach_color_level'
  | 'play_distinct_games';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  iconEmoji: string;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  isCompleted: boolean;
  questType: QuestType;
  targetGameId?: MiniGameId;
  targetCategory?: GameCatalogCategory;
}

export type AchievementCategory =
  | 'general'
  | 'board'
  | 'cards'
  | 'mind_puzzle'
  | 'strategy'
  | 'puzzle'
  | 'visual'
  | 'reflex'
  | 'learning'
  | 'memory_match'
  | 'shape_counting'
  | 'color_pattern';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconEmoji: string;
  category: AchievementCategory;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: {
    current: number;
    max: number;
  };
}

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  avatarEmoji: string;
  gameId: MiniGameId | 'all';
  score: number;
  rank: number;
  date: string;
  isCurrentUser?: boolean;
}

export interface ScoreSubmitRequest {
  session: GameSession;
  displayName?: string;
}

export interface ScoreSubmitResponse {
  success: boolean;
  recordedSession: GameSession;
  unlockedAchievements: string[];
  completedQuests: string[];
  message?: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  totalPlayers: number;
  userEntry?: LeaderboardEntry;
}
