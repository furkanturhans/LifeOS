export type KidsSectionKey =
  | 'mini_games'
  | 'study'
  | 'movie'
  | 'stories'
  | 'draw'
  | 'parent';

export type KidsAgeFilter = 'all' | 'age_3_5' | 'age_6_8' | 'age_9_12';

export type KidsStudySubject =
  | 'letters'
  | 'numbers'
  | 'science'
  | 'nature'
  | 'shapes';

export type KidsVoicePersona =
  | 'warm_female' // Sıcak & Şefkatli Kadın Anlatıcı (Varsayılan)
  | 'cheerful_female' // Neşeli & Canlı Kadın Anlatıcı
  | 'calm_female'; // Sakin & Dingin Masalcı

export type KidsSpeechSpeed = 'slow' | 'normal' | 'fast';

export interface KidsVoiceSettings {
  isVoiceEnabled?: boolean; // Master toggle: default true
  selectedVoiceURI?: string; // e.g. "Microsoft Emel Online (Natural) - Turkish (Turkey)"
  persona: KidsVoicePersona;
  speed: KidsSpeechSpeed;
  volume: number; // 0.0 - 1.0 (default 0.9)
  storyNarrationEnabled: boolean; // default true
  autoStudyAudioEnabled: boolean; // default true
}

export interface KidsStoryPage {
  pageNumber: number;
  illustrationEmoji: string;
  textTr: string;
  narrationAudio?: string;
}

export interface KidsStoryItem {
  id: string;
  title: string;
  category: string;
  ageRange: string;
  coverEmoji: string;
  summary: string;
  pages: KidsStoryPage[];
}

export interface KidsMovieItem {
  id: string;
  title: string;
  category: string;
  ageFilter: KidsAgeFilter;
  ageRange: string;
  durationMinutes: number;
  thumbnailEmoji: string;
  description: string;
  tags: string[];
  // Verified Open Source Video fields
  videoUrl: string; // Official stream URL
  creator: string; // e.g. "Blender Foundation"
  license: string; // e.g. "Creative Commons Attribution 3.0"
  sourceUrl: string; // e.g. "https://peach.blender.org/"
  attributionText: string; // e.g. "Big Buck Bunny — Blender Foundation — CC BY 3.0"
  isPublished: boolean;
}

export interface KidsWatchProgress {
  currentTime: number; // in seconds
  duration: number; // in seconds
  completed: boolean;
  lastWatchedAt: string; // ISO timestamp
}

export interface KidsStudyLesson {
  id: string;
  subject: KidsStudySubject;
  title: string;
  iconEmoji: string;
  ageRange: string;
  cards: {
    frontText: string;
    backText: string;
    subtext: string;
    iconEmoji: string;
    audioPrompt?: string;
  }[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface KidsParentSettings {
  isKidsModeActive: boolean;
  parentPin: string;
  dailyTimeLimitMinutes: number | null; // e.g. 30, 45, 60, 90, 120 or null (unlimited)
  todayUsageMinutes: number;
  movieAgeFilter: KidsAgeFilter;
  allowedSubjects: KidsStudySubject[];
  soundEnabled: boolean;
  voiceSettings: KidsVoiceSettings;
}
