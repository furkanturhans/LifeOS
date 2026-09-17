import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  EducationRole,
  EducationSectionKey,
  CourseDraft,
  InstructorApplication,
  InstructorProfile,
  GuardianConsent,
  LiveSession,
  LiveSessionRegistration,
  CreditLedgerEntry,
  BigBlueButtonJoinResult,
  LiveClassHealthResult,
  Exam,
  ExamAttempt,
  ClassroomGroup,
} from '@/types/education';

interface EducationStoreState {
  // Roles & User State
  role: EducationRole;
  setRole: (role: EducationRole) => void;

  // Active Hub Section (null = Hub Home, or explore, my_courses, live_sessions, my_exams, instructor_hub)
  activeSection: EducationSectionKey | null;
  setActiveSection: (section: EducationSectionKey | null) => void;

  // Instructor Application & Profile (Server Authoritative)
  instructorApplication: InstructorApplication | null;
  instructorProfile: InstructorProfile | null;
  activeInstructorTab: 'courses' | 'live_sessions' | 'exams' | 'students' | 'classrooms' | 'profile' | 'earnings';
  setActiveInstructorTab: (
    tab: 'courses' | 'live_sessions' | 'exams' | 'students' | 'classrooms' | 'profile' | 'earnings'
  ) => void;
  fetchInstructorStatus: () => Promise<void>;
  submitInstructorApplication: (
    data: Omit<InstructorApplication, 'id' | 'submittedAt' | 'status'>
  ) => Promise<boolean>;
  verifyInstructorDemo: () => void;
  revertToLearnerDemo: () => void;

  // Instructor Students & Classrooms
  instructorStudents: Array<{
    id: string;
    name: string;
    enrolledCoursesCount: number;
    liveSessionsAttended: number;
    lastActiveAt: string;
    status: string;
  }>;
  fetchInstructorStudents: () => Promise<void>;
  instructorClassrooms: ClassroomGroup[];
  fetchInstructorClassrooms: () => Promise<void>;

  // Instructor Course Drafts
  courseDrafts: CourseDraft[];
  saveCourseDraft: (draft: CourseDraft) => void;
  deleteCourseDraft: (draftId: string) => void;

  // Guardian Permissions
  guardianConsent: GuardianConsent;
  updateGuardianConsent: (consent: Partial<GuardianConsent>) => void;

  // Credits & Immutable Ledger
  creditBalance: number;
  creditLedger: CreditLedgerEntry[];

  // Live Sessions & Registrations
  liveSessions: LiveSession[];
  registrations: LiveSessionRegistration[];
  liveClassHealth: LiveClassHealthResult | null;
  checkLiveClassHealth: () => Promise<LiveClassHealthResult>;
  fetchLiveSessions: () => Promise<void>;
  createLiveSession: (
    data: Partial<LiveSession>
  ) => Promise<{ success: boolean; message?: string; session?: LiveSession }>;
  startLiveSession: (
    sessionId: string
  ) => Promise<{ success: boolean; session?: LiveSession; joinUrl?: string; message?: string }>;
  endLiveSession: (
    sessionId: string
  ) => Promise<{ success: boolean; message?: string }>;
  enrollInLiveSession: (
    sessionId: string
  ) => Promise<{ success: boolean; message?: string }>;
  cancelLiveSession: (
    sessionId: string
  ) => Promise<{ success: boolean; message?: string }>;
  joinLiveSession: (
    sessionId: string
  ) => Promise<BigBlueButtonJoinResult>;
  // Timed Exams Infrastructure
  exams: Exam[];
  activeExam: Exam | null;
  activeAttempt: ExamAttempt | null;
  isTakingExam: boolean;
  fetchExams: () => Promise<void>;
  createExam: (
    data: {
      courseId: string;
      courseTitle: string;
      title: string;
      description: string;
      scheduledAt: string;
      durationMinutes: number;
      passScorePercent: number;
      questions: Array<{
        questionText: string;
        options: Array<{ id: string; text: string }>;
        correctOptionIndex: number;
        points: number;
        explanation?: string;
      }>;
    }
  ) => Promise<{ success: boolean; message?: string; exam?: Exam }>;
  startExamAttempt: (
    examId: string
  ) => Promise<{ success: boolean; attempt?: ExamAttempt; exam?: Exam; error?: string }>;
  saveExamAnswer: (
    questionId: string,
    selectedOptionIndex: number
  ) => Promise<{ success: boolean; error?: string }>;
  submitExamAttempt: (
    isAutoSubmit?: boolean
  ) => Promise<{ success: boolean; message?: string; attempt?: ExamAttempt }>;
  closeExamTaker: () => void;
}

const INITIAL_LIVE_SESSIONS: LiveSession[] = [
  {
    id: 'session_ai_101',
    courseId: 'draft_sample_1',
    courseTitle: 'Yapay Zeka ve Python Temelleri',
    instructorId: 'inst_verified_1',
    instructorName: 'Dr. Ahmet Yılmaz',
    instructorAvatar: '👨‍🏫',
    instructorBio: 'Yapay zeka araştırmacısı ve eğitmen',
    title: 'Canlı Uygulama: İlk AI Modelimizi Eğitiyoruz',
    description: 'Python kullanarak temel bir sınıflandırma modelini canlı yayında birlikte kodlayıp test edeceğiz.',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    durationMinutes: 60,
    ageGroup: 'youth',
    creditsRequired: 50,
    maxParticipants: 70,
    currentParticipantCount: 42,
    status: 'scheduled',
    bbbMeetingId: 'bbb_meet_ai_101',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'session_math_202',
    instructorId: 'inst_verified_2',
    instructorName: 'Zeynep Öğretmen',
    instructorAvatar: '👩‍🏫',
    instructorBio: 'Olimpiyat matematik mentörü',
    title: 'Hızlı Zihinsel Matematik ve Problem Çözme Taktikleri',
    description: 'Sınavlarda zaman kazandıran pratik hesaplama ve soru analiz teknikleri.',
    scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 2 days later
    durationMinutes: 45,
    ageGroup: 'child',
    creditsRequired: 50,
    maxParticipants: 70,
    currentParticipantCount: 18,
    status: 'scheduled',
    bbbMeetingId: 'bbb_meet_math_202',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_LEDGER_ENTRY: CreditLedgerEntry = {
  id: 'ledger_init_1',
  userId: 'user_local',
  type: 'topup',
  amount: 150,
  balanceAfter: 150,
  description: 'LifeOS Eğitim Başlangıç Kredisi',
  createdAt: new Date().toISOString(),
};

export const useEducationStore = create<EducationStoreState>()(
  persist(
    (set, get) => ({
      role: 'learner',
      setRole: (role) => set({ role }),

      activeSection: null,
      setActiveSection: (activeSection) => set({ activeSection }),

      instructorApplication: null,
      instructorProfile: null,
      activeInstructorTab: 'courses',
      setActiveInstructorTab: (tab) => set({ activeInstructorTab: tab }),

      fetchInstructorStatus: async () => {
        try {
          const res = await fetch('/api/education/instructor/status?userId=user_local');
          const data = await res.json();
          if (data.success) {
            set({
              role: data.role,
              instructorApplication: data.application,
              instructorProfile: data.profile,
            });
          }
        } catch {}
      },

      instructorStudents: [],
      fetchInstructorStudents: async () => {
        try {
          const res = await fetch('/api/education/instructor/students?instructorId=user_local');
          const data = await res.json();
          if (data.success && Array.isArray(data.students)) {
            set({ instructorStudents: data.students });
          }
        } catch {}
      },

      instructorClassrooms: [],
      fetchInstructorClassrooms: async () => {
        try {
          const res = await fetch('/api/education/instructor/classrooms?instructorId=user_local');
          const data = await res.json();
          if (data.success && Array.isArray(data.classrooms)) {
            set({ instructorClassrooms: data.classrooms });
          }
        } catch {}
      },

      submitInstructorApplication: async (data) => {
        try {
          const res = await fetch('/api/education/instructor/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...data,
              applicantLifeosId: 'user_local',
            }),
          });
          const resData = await res.json();
          if (resData.success && resData.application) {
            set({
              instructorApplication: resData.application,
              role: 'instructor_applicant',
            });
            return true;
          }
        } catch {}

        return false;
      },

      verifyInstructorDemo: async () => {
        try {
          const res = await fetch('/api/education/instructor/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify', userId: 'user_local' }),
          });
          const data = await res.json();
          if (data.success) {
            set({
              role: 'instructor_verified',
              instructorProfile: data.profile,
            });
          }
        } catch {}
      },

      revertToLearnerDemo: () => {
        set({
          role: 'learner',
          instructorApplication: null,
          instructorProfile: null,
        });
      },

      courseDrafts: [
        {
          id: 'draft_sample_1',
          instructorId: 'inst_verified_1',
          instructorName: 'Doğrulanmış Eğitmen',
          title: 'Yapay Zeka ve Python Temelleri (Taslak)',
          description: 'Sıfırdan modern yapay zeka araçları ve temel programlama mantığı.',
          category: 'Yazılım & Teknoloji',
          ageGroup: 'youth',
          level: 'beginner',
          learningGoals: [
            'Python değişkenleri ve döngüleri anlamak',
            'Basit yapay zeka modelleriyle tanışmak',
            'Kendi mini projesini tasarlamak',
          ],
          coverEmoji: '🐍',
          sections: [
            {
              id: 'sec_1',
              title: 'Bölüm 1: Giriş ve Kurulum',
              order: 1,
              lessons: [
                {
                  id: 'les_1',
                  title: 'Python Nedir ve Neden Öğrenmeliyiz?',
                  order: 1,
                  isDraft: true,
                  contents: [
                    {
                      id: 'cnt_1',
                      type: 'video',
                      title: 'Giriş Videosu Taslağı',
                      durationMinutes: 12,
                      isDraft: true,
                    },
                    {
                      id: 'cnt_2',
                      type: 'article',
                      title: 'Kurulum Rehberi Makalesi',
                      articleText: 'LifeOS ortamında kod çalıştırma adımları...',
                      isDraft: true,
                    },
                  ],
                },
              ],
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDraft: true,
          isPublished: false,
        },
      ],

      saveCourseDraft: (draft) => {
        const existing = get().courseDrafts;
        const index = existing.findIndex((d) => d.id === draft.id);
        let updated: CourseDraft[];

        if (index !== -1) {
          updated = existing.map((d) => (d.id === draft.id ? draft : d));
        } else {
          updated = [draft, ...existing];
        }

        set({ courseDrafts: updated });

        try {
          fetch('/api/education/courses/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(draft),
          }).catch(() => {});
        } catch {}
      },

      deleteCourseDraft: (draftId) => {
        set((state) => ({
          courseDrafts: state.courseDrafts.filter((d) => d.id !== draftId),
        }));
      },

      guardianConsent: {
        id: 'consent_default',
        guardianLifeosId: 'parent_user',
        childLifeosId: 'child_user',
        allowLiveSessions: true,
        allowClassroomQA: true,
        visibilityControl: 'guardian_monitored',
        grantedAt: new Date().toISOString(),
      },

      updateGuardianConsent: (partial) => {
        set((state) => ({
          guardianConsent: {
            ...state.guardianConsent,
            ...partial,
          },
        }));
      },

      // -----------------------------------------------------------------------
      // Credits & Ledger
      // -----------------------------------------------------------------------
      creditBalance: 150,
      creditLedger: [INITIAL_LEDGER_ENTRY],

      // -----------------------------------------------------------------------
      // Live Sessions & BigBlueButton
      // -----------------------------------------------------------------------
      liveSessions: INITIAL_LIVE_SESSIONS,
      registrations: [],
      liveClassHealth: null,

      checkLiveClassHealth: async () => {
        try {
          const res = await fetch('/api/education/live-sessions/health');
          const data = await res.json();
          if (data.health) {
            set({ liveClassHealth: data.health });
            return data.health;
          }
        } catch (error) {
          console.warn('Health check request failed:', error);
        }

        const fallbackHealth: LiveClassHealthResult = {
          isConfigured: false,
          provider: 'bigbluebutton',
          isReachable: false,
          message: 'Canlı sınıf sunucusuna erişilemedi.',
        };
        set({ liveClassHealth: fallbackHealth });
        return fallbackHealth;
      },

      fetchLiveSessions: async () => {
        try {
          const res = await fetch('/api/education/live-sessions');
          const data = await res.json();
          if (data.success && Array.isArray(data.sessions)) {
            set({ liveSessions: data.sessions });
          }
        } catch (error) {
          console.warn('Could not fetch server live sessions, using local store:', error);
        }
      },

      createLiveSession: async (data) => {
        const state = get();
        const instructorId = state.instructorProfile?.id || 'inst_verified_1';
        const instructorName = state.instructorProfile?.displayName || 'Doğrulanmış Eğitmen';
        const instructorAvatar = state.instructorProfile?.avatarEmoji || '👨‍🏫';
        const instructorBio = state.instructorProfile?.bio || 'LifeOS Eğitmeni';

        // Cap participants to max 70
        const maxParticipants = Math.min(70, Math.max(5, Number(data.maxParticipants) || 70));
        // Default 50 credits
        const creditsRequired = Number(data.creditsRequired) !== undefined ? Number(data.creditsRequired) : 50;

        const newSession: LiveSession = {
          id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          courseId: data.courseId,
          courseTitle: data.courseTitle,
          instructorId,
          instructorName,
          instructorAvatar,
          instructorBio,
          title: (data.title || 'Canlı Eğitim Oturumu').trim(),
          description: (data.description || '').trim(),
          scheduledAt: data.scheduledAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          durationMinutes: Number(data.durationMinutes) || 45,
          ageGroup: data.ageGroup || 'youth',
          creditsRequired,
          maxParticipants,
          currentParticipantCount: 0,
          status: 'scheduled',
          bbbMeetingId: `bbb_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Update local state immediately
        set((s) => ({
          liveSessions: [newSession, ...s.liveSessions],
        }));

        // Send to server API
        try {
          const res = await fetch('/api/education/live-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSession),
          });
          const resData = await res.json();
          if (resData.success && resData.session) {
            return { success: true, message: 'Canlı ders başarıyla planlandı.', session: resData.session };
          }
        } catch {}

        return { success: true, message: 'Canlı ders başarıyla planlandı.', session: newSession };
      },

      startLiveSession: async (sessionId: string) => {
        const state = get();
        try {
          const res = await fetch('/api/education/live-sessions/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              instructorId: state.instructorProfile?.id || 'inst_verified_1',
              instructorDisplayName: state.instructorProfile?.displayName || 'Doğrulanmış Eğitmen',
            }),
          });
          const data = await res.json();
          if (data.success && data.session) {
            set((s) => ({
              liveSessions: s.liveSessions.map((ls) => (ls.id === sessionId ? data.session : ls)),
            }));
            return {
              success: true,
              session: data.session,
              joinUrl: data.joinUrl,
              message: data.message,
            };
          }
          return { success: false, message: data.message || 'Canlı ders başlatılamadı.' };
        } catch (error) {
          return { success: false, message: 'Sunucuya bağlanılamadı.' };
        }
      },

      endLiveSession: async (sessionId: string) => {
        const state = get();
        try {
          const res = await fetch('/api/education/live-sessions/end', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              instructorId: state.instructorProfile?.id || 'inst_verified_1',
            }),
          });
          const data = await res.json();
          if (data.success && data.session) {
            set((s) => ({
              liveSessions: s.liveSessions.map((ls) => (ls.id === sessionId ? data.session : ls)),
            }));
            return { success: true, message: data.message || 'Ders tamamlandı.' };
          }
          return { success: false, message: data.message || 'Ders kapatılamadı.' };
        } catch (error) {
          return { success: false, message: 'Sunucuya bağlanılamadı.' };
        }
      },

      enrollInLiveSession: async (sessionId: string) => {
        const state = get();
        const session = state.liveSessions.find((s) => s.id === sessionId);

        if (!session) {
          return { success: false, message: 'Canlı ders bulunamadı.' };
        }

        if (session.status === 'cancelled') {
          return { success: false, message: 'Bu canlı ders iptal edilmiştir.' };
        }

        if (session.status === 'completed') {
          return { success: false, message: 'Bu canlı ders tamamlanmıştır.' };
        }

        // Duplicate check (protection against double clicks)
        const alreadyRegistered = state.registrations.some(
          (r) => r.sessionId === sessionId && r.status === 'confirmed'
        );
        if (alreadyRegistered) {
          return { success: false, message: 'Bu canlı derse zaten kayıtlısınız.' };
        }

        // Capacity check (Max 70 students)
        if (session.currentParticipantCount >= session.maxParticipants) {
          return {
            success: false,
            message: `Bu canlı dersin kontenjanı dolmuştur (Maksimum ${session.maxParticipants} öğrenci).`,
          };
        }

        // Credit balance check
        const requiredCredits = session.creditsRequired || 50;
        if (state.creditBalance < requiredCredits) {
          return {
            success: false,
            message: `Yetersiz kredi bakiyesi. Bu derse katılmak için ${requiredCredits} kredi gereklidir. Mevcut bakiyeniz: ${state.creditBalance} Kredi.`,
          };
        }

        // Check child guardian permission if ageGroup is child/preschool
        if ((session.ageGroup === 'child' || session.ageGroup === 'preschool') && !state.guardianConsent.allowLiveSessions) {
          return {
            success: false,
            message: 'Veli izin ayarlarınızda canlı ders oturumlarına katılım kapalıdır. Lütfen velinizden izin isteyiniz.',
          };
        }

        const newBalance = state.creditBalance - requiredCredits;
        const newLedgerEntry: CreditLedgerEntry = {
          id: `ledger_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: 'user_local',
          type: 'session_enrollment',
          amount: -requiredCredits,
          balanceAfter: newBalance,
          description: `"${session.title}" Canlı Ders Kaydı`,
          referenceId: session.id,
          createdAt: new Date().toISOString(),
        };

        const registration: LiveSessionRegistration = {
          id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          sessionId: session.id,
          sessionTitle: session.title,
          instructorName: session.instructorName,
          scheduledAt: session.scheduledAt,
          learnerId: 'user_local',
          learnerDisplayName: 'Ben (Öğrenci)',
          creditsPaid: requiredCredits,
          enrolledAt: new Date().toISOString(),
          status: 'confirmed',
        };

        // Update local state atomically
        set((s) => ({
          creditBalance: newBalance,
          creditLedger: [newLedgerEntry, ...s.creditLedger],
          registrations: [registration, ...s.registrations],
          liveSessions: s.liveSessions.map((ls) =>
            ls.id === sessionId
              ? { ...ls, currentParticipantCount: ls.currentParticipantCount + 1 }
              : ls
          ),
        }));

        // Send to server API
        try {
          fetch('/api/education/live-sessions/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              learnerId: 'user_local',
              learnerDisplayName: 'Ben (Öğrenci)',
            }),
          }).catch(() => {});
        } catch {}

        return {
          success: true,
          message: `${requiredCredits} kredi karşılığında canlı derse başarıyla kaydoldunuz!`,
        };
      },

      cancelLiveSession: async (sessionId: string) => {
        const state = get();
        const session = state.liveSessions.find((s) => s.id === sessionId);

        if (!session) {
          return { success: false, message: 'Canlı ders bulunamadı.' };
        }

        // Check if current user is registered and needs a refund
        const userRegistration = state.registrations.find(
          (r) => r.sessionId === sessionId && r.status === 'confirmed'
        );

        let newBalance = state.creditBalance;
        let updatedLedger = [...state.creditLedger];

        if (userRegistration) {
          const refundAmount = userRegistration.creditsPaid || 50;
          newBalance += refundAmount;
          const refundEntry: CreditLedgerEntry = {
            id: `ledger_ref_${Date.now()}`,
            userId: 'user_local',
            type: 'refund',
            amount: refundAmount,
            balanceAfter: newBalance,
            description: `"${session.title}" İptal İadesi`,
            referenceId: session.id,
            createdAt: new Date().toISOString(),
          };
          updatedLedger = [refundEntry, ...updatedLedger];
        }

        // Update state
        set((s) => ({
          creditBalance: newBalance,
          creditLedger: updatedLedger,
          liveSessions: s.liveSessions.map((ls) =>
            ls.id === sessionId ? { ...ls, status: 'cancelled' } : ls
          ),
          registrations: s.registrations.map((r) =>
            r.sessionId === sessionId ? { ...r, status: 'refunded' } : r
          ),
        }));

        // Send cancel to API
        try {
          await fetch('/api/education/live-sessions/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              instructorId: state.instructorProfile?.id || 'inst_verified_1',
            }),
          });
        } catch {}

        return {
          success: true,
          message: 'Canlı ders iptal edildi ve tüm kayıtlı öğrencilerin kredileri eksiksiz iade edildi.',
        };
      },

      joinLiveSession: async (sessionId: string) => {
        const state = get();
        try {
          const res = await fetch('/api/education/live-sessions/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              userId: 'user_local',
              userRole: state.role,
              displayName: state.role === 'instructor_verified' ? state.instructorProfile?.displayName || 'Eğitmen' : 'Öğrenci',
            }),
          });
          const data: BigBlueButtonJoinResult = await res.json();
          return data;
        } catch (error) {
          return {
            success: false,
            isConfigured: false,
            message: 'Canlı ders sunucusuna bağlanılamadı.',
          };
        }
      },

      // -----------------------------------------------------------------------
      // Timed Exams State & Actions
      // -----------------------------------------------------------------------
      exams: [],
      activeExam: null,
      activeAttempt: null,
      isTakingExam: false,

      fetchExams: async () => {
        const state = get();
        const isInst = state.role === 'instructor_verified';
        const instId = state.instructorProfile?.id;
        const url = `/api/education/exams?isInstructor=${isInst}${instId ? `&instructorId=${instId}` : ''}`;

        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.success && Array.isArray(data.exams)) {
            set({ exams: data.exams });
          }
        } catch {}
      },

      createExam: async (data) => {
        const state = get();
        try {
          const res = await fetch('/api/education/exams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...data,
              role: state.role,
              instructorId: state.instructorProfile?.id || 'inst_verified_1',
              instructorName: state.instructorProfile?.displayName || 'Doğrulanmış Eğitmen',
            }),
          });
          const resData = await res.json();
          if (resData.success && resData.exam) {
            set((s) => ({ exams: [resData.exam, ...s.exams] }));
            return { success: true, message: 'Sınav başarıyla oluşturuldu.', exam: resData.exam };
          }
          return { success: false, message: resData.error || 'Sınav oluşturulamadı.' };
        } catch {
          return { success: false, message: 'Sunucuya bağlanılamadı.' };
        }
      },

      startExamAttempt: async (examId: string) => {
        const state = get();
        const learnerId = 'user_local';
        const learnerName = state.role === 'instructor_verified'
          ? state.instructorProfile?.displayName || 'Eğitmen'
          : 'Furkan Turhan';

        try {
          const res = await fetch('/api/education/exams/attempt/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              examId,
              learnerId,
              learnerName,
            }),
          });
          const data = await res.json();
          if (data.success && data.attempt && data.exam) {
            set({
              activeAttempt: data.attempt,
              activeExam: data.exam,
              isTakingExam: true,
            });
            return {
              success: true,
              attempt: data.attempt,
              exam: data.exam,
            };
          }
          return { success: false, error: data.error || 'Sınav başlatılamadı.' };
        } catch {
          return { success: false, error: 'Sunucu bağlantı hatası.' };
        }
      },

      saveExamAnswer: async (questionId: string, selectedOptionIndex: number) => {
        const state = get();
        const attempt = state.activeAttempt;
        if (!attempt) return { success: false, error: 'Aktif sınav bulunamadı.' };

        // Optimistically update local attempt answers
        const updatedAnswers = {
          ...attempt.answers,
          [questionId]: selectedOptionIndex,
        };
        set({
          activeAttempt: {
            ...attempt,
            answers: updatedAnswers,
          },
        });

        try {
          const res = await fetch('/api/education/exams/attempt/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              attemptId: attempt.id,
              learnerId: attempt.learnerId,
              questionId,
              selectedOptionIndex,
            }),
          });
          const data = await res.json();
          if (!data.success) {
            return { success: false, error: data.error || 'Cevap kaydedilemedi.' };
          }
          return { success: true };
        } catch {
          return { success: false, error: 'Ağ hatası.' };
        }
      },

      submitExamAttempt: async (isAutoSubmit?: boolean) => {
        const state = get();
        const attempt = state.activeAttempt;
        if (!attempt) return { success: false, message: 'Aktif sınav bulunamadı.' };

        try {
          const res = await fetch('/api/education/exams/attempt/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              attemptId: attempt.id,
              learnerId: attempt.learnerId,
              isAutoSubmit: Boolean(isAutoSubmit),
            }),
          });
          const data = await res.json();
          if (data.success && data.attempt) {
            set({
              activeAttempt: data.attempt,
            });
            return {
              success: true,
              message: data.message || 'Sınavınız öğretmeninize teslim edildi.',
              attempt: data.attempt,
            };
          }
          return { success: false, message: data.error || 'Sınav teslim edilemedi.' };
        } catch {
          return { success: false, message: 'Bağlantı hatası.' };
        }
      },

      closeExamTaker: () => {
        set({
          isTakingExam: false,
          activeExam: null,
          activeAttempt: null,
        });
      },
    }),
    {
      name: 'lifeos-education-storage',
    }
  )
);
