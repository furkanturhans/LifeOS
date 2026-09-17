import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  KidsSectionKey,
  KidsAgeFilter,
  KidsStudySubject,
  KidsVoiceSettings,
  KidsVoicePersona,
  KidsSpeechSpeed,
  KidsWatchProgress,
} from '@/types/kids';

interface KidsStoreState {
  activeSection: KidsSectionKey | null;
  setActiveSection: (section: KidsSectionKey | null) => void;

  // Parent Controls & PIN
  parentPin: string;
  isKidsModeActive: boolean;
  isParentUnlocked: boolean;
  dailyTimeLimitMinutes: number | null; // e.g. 60
  todayUsageMinutes: number;
  movieAgeFilter: KidsAgeFilter;
  allowedSubjects: KidsStudySubject[];
  soundEnabled: boolean;

  // Video Watch Progress tracking
  watchProgress: Record<string, KidsWatchProgress>;
  saveWatchProgress: (movieId: string, currentTime: number, duration: number, completed?: boolean) => void;
  getWatchProgress: (movieId: string) => KidsWatchProgress | undefined;

  // Voice Narration Settings
  voiceSettings: KidsVoiceSettings;
  isSpeaking: boolean;
  setIsSpeaking: (isSpeaking: boolean) => void;
  updateVoiceSettings: (settings: Partial<KidsVoiceSettings>) => void;

  // Security Lockout
  failedPinAttempts: number;
  lockoutUntil: number | null; // Timestamp ms

  // Actions
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  verifyPin: (pin: string) => { success: boolean; error?: string; remainingAttempts?: number };
  changePin: (oldPin: string, newPin: string) => { success: boolean; error?: string };
  lockParent: () => void;
  unlockParent: () => void;
  setKidsModeActive: (active: boolean) => void;
  setDailyTimeLimit: (minutes: number | null) => void;
  incrementUsageTime: (minutes?: number) => void;
  setMovieAgeFilter: (filter: KidsAgeFilter) => void;
  toggleSubjectPermission: (subject: KidsStudySubject) => void;
  resetKidsSettings: () => void;
}

const DEFAULT_SUBJECTS: KidsStudySubject[] = [
  'letters',
  'numbers',
  'science',
  'nature',
  'shapes',
];

const DEFAULT_VOICE_SETTINGS: KidsVoiceSettings = {
  isVoiceEnabled: true,
  selectedVoiceURI: undefined,
  persona: 'warm_female',
  speed: 'normal',
  volume: 0.9,
  storyNarrationEnabled: true,
  autoStudyAudioEnabled: true,
};

export const useKidsStore = create<KidsStoreState>()(
  persist(
    (set, get) => ({
      activeSection: null,
      setActiveSection: (activeSection) => set({ activeSection }),

      parentPin: '2026',
      isKidsModeActive: true,
      isParentUnlocked: false,
      dailyTimeLimitMinutes: 60,
      todayUsageMinutes: 15,
      movieAgeFilter: 'all',
      allowedSubjects: DEFAULT_SUBJECTS,
      soundEnabled: true,

      watchProgress: {},
      saveWatchProgress: (movieId, currentTime, duration, completed = false) =>
        set((state) => ({
          watchProgress: {
            ...state.watchProgress,
            [movieId]: {
              currentTime,
              duration,
              completed,
              lastWatchedAt: new Date().toISOString(),
            },
          },
        })),
      getWatchProgress: (movieId) => get().watchProgress[movieId],

      voiceSettings: DEFAULT_VOICE_SETTINGS,
      isSpeaking: false,
      setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
      updateVoiceSettings: (newSettings) =>
        set((state) => ({
          voiceSettings: { ...state.voiceSettings, ...newSettings },
        })),

      failedPinAttempts: 0,
      lockoutUntil: null,

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),

      verifyPin: (pin: string) => {
        const { parentPin, failedPinAttempts, lockoutUntil } = get();
        const now = Date.now();

        if (lockoutUntil && now < lockoutUntil) {
          const remainingSec = Math.ceil((lockoutUntil - now) / 1000);
          return {
            success: false,
            error: `Çok fazla hatalı deneme yapıldı. Lütfen ${remainingSec} saniye bekleyin.`,
          };
        }

        if (pin === parentPin) {
          set({
            isParentUnlocked: true,
            failedPinAttempts: 0,
            lockoutUntil: null,
          });
          return { success: true };
        } else {
          const newFailed = failedPinAttempts + 1;
          if (newFailed >= 5) {
            const lockTime = now + 30 * 1000; // 30 sec lockout
            set({ failedPinAttempts: 0, lockoutUntil: lockTime });
            return {
              success: false,
              error: '5 hatalı deneme! Güvenlik nedeniyle 30 saniye kilitlendi.',
            };
          } else {
            set({ failedPinAttempts: newFailed });
            return {
              success: false,
              error: `Hatalı PIN kodu! Kalan hak: ${5 - newFailed}`,
              remainingAttempts: 5 - newFailed,
            };
          }
        }
      },

      changePin: (oldPin: string, newPin: string) => {
        const { parentPin } = get();
        if (oldPin !== parentPin) {
          return { success: false, error: 'Mevcut PIN kodu hatalı.' };
        }
        if (!/^\d{4}$/.test(newPin)) {
          return { success: false, error: 'Yeni PIN tam 4 haneli rakamlardan oluşmalıdır.' };
        }
        set({ parentPin: newPin });
        return { success: true };
      },

      lockParent: () => set({ isParentUnlocked: false }),
      unlockParent: () => set({ isParentUnlocked: true }),

      setKidsModeActive: (isKidsModeActive) => set({ isKidsModeActive }),
      setDailyTimeLimit: (dailyTimeLimitMinutes) => set({ dailyTimeLimitMinutes }),
      incrementUsageTime: (minutes = 1) =>
        set((state) => ({ todayUsageMinutes: state.todayUsageMinutes + minutes })),
      setMovieAgeFilter: (movieAgeFilter) => set({ movieAgeFilter }),

      toggleSubjectPermission: (subject) =>
        set((state) => {
          const exists = state.allowedSubjects.includes(subject);
          const updated = exists
            ? state.allowedSubjects.filter((s) => s !== subject)
            : [...state.allowedSubjects, subject];
          return { allowedSubjects: updated };
        }),

      resetKidsSettings: () =>
        set({
          parentPin: '2026',
          isKidsModeActive: true,
          isParentUnlocked: false,
          dailyTimeLimitMinutes: 60,
          todayUsageMinutes: 0,
          movieAgeFilter: 'all',
          allowedSubjects: DEFAULT_SUBJECTS,
          soundEnabled: true,
          watchProgress: {},
          voiceSettings: DEFAULT_VOICE_SETTINGS,
          isSpeaking: false,
          failedPinAttempts: 0,
          lockoutUntil: null,
        }),
    }),
    {
      name: 'lifeos-kids-storage',
    }
  )
);
