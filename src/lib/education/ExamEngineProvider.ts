import type {
  Exam,
  ExamQuestion,
  ExamAttempt,
  ExamAuditLog,
  ExamSubmissionResult,
} from '@/types/education';

// In-memory persistent store for exams, attempts, and audit trails
let EXAMS_STORE: Exam[] = [
  {
    id: 'exam-math-midterm',
    courseId: 'crs-math-101',
    courseTitle: 'İleri Matematik 101',
    instructorId: 'usr-instructor-ahmet',
    instructorName: 'Prof. Dr. Ahmet Yılmaz',
    title: 'Türev ve Limit Ara Sınavı',
    description: 'İleri Matematik 101 1. Ara Değerlendirme Sınavı. 40 dakika sürelidir.',
    scheduledAt: new Date(Date.now() - 3600000).toISOString(), // 1 saat önce başladı, aktif
    durationMinutes: 40,
    passScorePercent: 70,
    questionsCount: 3,
    totalPoints: 100,
    status: 'open',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    questions: [
      {
        id: 'q-math-1',
        examId: 'exam-math-midterm',
        order: 1,
        questionText: 'f(x) = 3x^2 + 5x - 7 fonksiyonunun x = 2 noktasındaki türevi f\'(2) kaçtır?',
        options: [
          { id: 'opt-a', text: '12' },
          { id: 'opt-b', text: '17' },
          { id: 'opt-c', text: '19' },
          { id: 'opt-d', text: '23' },
        ],
        correctOptionIndex: 1, // 6x + 5 = 6(2) + 5 = 17 -> B
        points: 30,
        explanation: 'f\'(x) = 6x + 5. x = 2 için f\'(2) = 6(2) + 5 = 17.',
      },
      {
        id: 'q-math-2',
        examId: 'exam-math-midterm',
        order: 2,
        questionText: 'lim (x -> 0) [sin(3x) / x] limitinin değeri nedir?',
        options: [
          { id: 'opt-a', text: '0' },
          { id: 'opt-b', text: '1' },
          { id: 'opt-c', text: '3' },
          { id: 'opt-d', text: 'Tanımsız' },
        ],
        correctOptionIndex: 2, // 3 -> C
        points: 35,
        explanation: 'Standart limit kuralı: lim (x -> 0) [sin(kx) / x] = k. Buradan k = 3 bulunur.',
      },
      {
        id: 'q-math-3',
        examId: 'exam-math-midterm',
        order: 3,
        questionText: 'g(x) = e^(2x) fonksiyonunun türevi g\'(x) aşağıdakilerden hangisidir?',
        options: [
          { id: 'opt-a', text: 'e^(2x)' },
          { id: 'opt-b', text: '2e^(2x)' },
          { id: 'opt-c', text: '2x * e^(2x)' },
          { id: 'opt-d', text: 'e^(x)' },
        ],
        correctOptionIndex: 1, // 2e^(2x) -> B
        points: 35,
        explanation: 'Zincir kuralı: (e^u)\' = u\' * e^u. u = 2x ise türev 2 * e^(2x) dir.',
      },
    ],
  },
  {
    id: 'exam-ai-intro',
    courseId: 'crs-ai-foundations',
    courseTitle: 'Yapay Zeka ve Makine Öğrenimi Temelleri',
    instructorId: 'usr-instructor-ahmet',
    instructorName: 'Prof. Dr. Ahmet Yılmaz',
    title: 'Makine Öğrenimi Seviye Belirleme Sınavı',
    description: 'Temel yapay zeka ve denetimli öğrenme konseptlerini ölçen quiz.',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Yarın başlayacak
    durationMinutes: 30,
    passScorePercent: 60,
    questionsCount: 2,
    totalPoints: 100,
    status: 'scheduled',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    questions: [
      {
        id: 'q-ai-1',
        examId: 'exam-ai-intro',
        order: 1,
        questionText: 'Aşağıdakilerden hangisi denetimli öğrenme (supervised learning) örneğidir?',
        options: [
          { id: 'opt-a', text: 'K-Means Kümeleme' },
          { id: 'opt-b', text: 'Lineer Regresyon' },
          { id: 'opt-c', text: 'PCA Boyut İndirgeme' },
          { id: 'opt-d', text: 'Apriori Birliktelik Kuralı' },
        ],
        correctOptionIndex: 1,
        points: 50,
      },
      {
        id: 'q-ai-2',
        examId: 'exam-ai-intro',
        order: 2,
        questionText: 'Aşırı öğrenme (Overfitting) durumunu engellemek için hangi yöntem kullanılır?',
        options: [
          { id: 'opt-a', text: 'Veri boyutunu küçültmek' },
          { id: 'opt-b', text: 'Düzenlileştirme (Regularization) ve Dropout' },
          { id: 'opt-c', text: 'Epok sayısını sonsuza kadar artırmak' },
          { id: 'opt-d', text: 'Öğrenme oranını 100 kat artırmak' },
        ],
        correctOptionIndex: 1,
        points: 50,
      },
    ],
  },
];

let ATTEMPTS_STORE: ExamAttempt[] = [];
let AUDIT_LOGS_STORE: ExamAuditLog[] = [];

export class ExamEngineProvider {
  /**
   * Helper: Calculate server remaining seconds for an attempt
   */
  public static calculateRemainingSeconds(attempt: ExamAttempt): number {
    const now = Date.now();
    const expiry = new Date(attempt.expiresAt).getTime();
    const diff = Math.floor((expiry - now) / 1000);
    return Math.max(0, diff);
  }

  /**
   * Auto-check expiry for an attempt and lock if needed
   */
  private static checkAndLockExpiry(attempt: ExamAttempt): void {
    if (attempt.status === 'in_progress') {
      const remaining = this.calculateRemainingSeconds(attempt);
      if (remaining <= 0) {
        attempt.status = 'expired';
        attempt.submittedAt = attempt.expiresAt;
        this.gradeAttempt(attempt);

        this.recordAudit({
          examId: attempt.examId,
          attemptId: attempt.id,
          learnerId: attempt.learnerId,
          action: 'auto_submitted',
          metadata: { reason: 'server_timer_expired' },
        });
      }
    }
  }

  /**
   * Record audit log
   */
  public static recordAudit(params: {
    examId: string;
    attemptId: string;
    learnerId: string;
    action: ExamAuditLog['action'];
    metadata?: Record<string, unknown>;
  }): void {
    const log: ExamAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      examId: params.examId,
      attemptId: params.attemptId,
      learnerId: params.learnerId,
      action: params.action,
      timestamp: new Date().toISOString(),
      metadata: params.metadata,
    };
    AUDIT_LOGS_STORE.push(log);
  }

  /**
   * Grade an attempt against exam answer keys
   */
  public static gradeAttempt(attempt: ExamAttempt): void {
    const exam = EXAMS_STORE.find((e) => e.id === attempt.examId);
    if (!exam || !exam.questions || exam.questions.length === 0) {
      attempt.scorePercent = 0;
      attempt.totalScore = 0;
      attempt.isPassed = false;
      return;
    }

    let earnedPoints = 0;
    const totalPoints = exam.totalPoints || 100;

    exam.questions.forEach((q) => {
      const selectedOption = attempt.answers[q.id];
      if (selectedOption !== undefined && selectedOption === q.correctOptionIndex) {
        earnedPoints += q.points;
      }
    });

    const scorePercent = Math.round((earnedPoints / totalPoints) * 100);
    attempt.totalScore = earnedPoints;
    attempt.scorePercent = scorePercent;
    attempt.isPassed = scorePercent >= exam.passScorePercent;
    attempt.certificateEarned = attempt.isPassed;
  }

  /**
   * List exams with security filtering
   */
  public static getExams(params: {
    learnerId?: string;
    instructorId?: string;
    isInstructor?: boolean;
  }): Exam[] {
    // If instructor, return their exams with questions
    if (params.isInstructor && params.instructorId) {
      return EXAMS_STORE.filter((e) => e.instructorId === params.instructorId);
    }

    // If student/learner, sanitize questions by stripping correctOptionIndex and explanation
    return EXAMS_STORE.map((exam) => {
      const sanitizedQuestions = exam.questions?.map((q) => ({
        id: q.id,
        examId: q.examId,
        order: q.order,
        questionText: q.questionText,
        options: q.options,
        correctOptionIndex: -1, // Hidden for student
        points: q.points,
      }));

      return {
        ...exam,
        questions: sanitizedQuestions,
      };
    });
  }

  /**
   * Create an exam (Instructor verified only)
   */
  public static createExam(
    instructorId: string,
    instructorName: string,
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
  ): { success: boolean; exam?: Exam; error?: string } {
    if (!data.title?.trim() || !data.courseId || data.questions.length === 0) {
      return { success: false, error: 'Sınav başlığı, kurs seçimi ve en az 1 soru zorunludur.' };
    }

    const examId = `exam-${Date.now()}`;
    const totalPoints = data.questions.reduce((sum, q) => sum + (q.points || 0), 0) || 100;

    const formattedQuestions: ExamQuestion[] = data.questions.map((q, idx) => ({
      id: `q-${examId}-${idx + 1}`,
      examId,
      order: idx + 1,
      questionText: q.questionText.trim(),
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      points: q.points || 10,
      explanation: q.explanation,
    }));

    const newExam: Exam = {
      id: examId,
      courseId: data.courseId,
      courseTitle: data.courseTitle,
      instructorId,
      instructorName,
      title: data.title.trim(),
      description: data.description?.trim() || '',
      scheduledAt: data.scheduledAt || new Date().toISOString(),
      durationMinutes: Math.max(5, data.durationMinutes || 40),
      passScorePercent: Math.max(1, Math.min(100, data.passScorePercent || 70)),
      questionsCount: formattedQuestions.length,
      totalPoints,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: formattedQuestions,
    };

    EXAMS_STORE.unshift(newExam);

    return { success: true, exam: newExam };
  }

  /**
   * Start or resume a single-attempt exam session for a student
   */
  public static startAttempt(
    examId: string,
    learnerId: string,
    learnerName: string
  ): { success: boolean; attempt?: ExamAttempt; exam?: Exam; error?: string } {
    const exam = EXAMS_STORE.find((e) => e.id === examId);
    if (!exam) {
      return { success: false, error: 'Sınav bulunamadı.' };
    }

    // Check if student already has an attempt
    const existing = ATTEMPTS_STORE.find(
      (a) => a.examId === examId && a.learnerId === learnerId
    );

    if (existing) {
      this.checkAndLockExpiry(existing);
      const remainingSeconds = this.calculateRemainingSeconds(existing);

      const sanitizedExam = {
        ...exam,
        questions: exam.questions?.map((q) => ({
          ...q,
          correctOptionIndex: -1, // Security strip
        })),
      };

      return {
        success: true,
        attempt: {
          ...existing,
          serverRemainingSeconds: remainingSeconds,
        },
        exam: sanitizedExam,
      };
    }

    // New Attempt creation
    const now = Date.now();
    const durationMs = (exam.durationMinutes || 40) * 60 * 1000;
    const expiresAt = new Date(now + durationMs).toISOString();

    const newAttempt: ExamAttempt = {
      id: `attempt-${examId}-${learnerId}`,
      examId,
      examTitle: exam.title,
      courseId: exam.courseId,
      learnerId,
      learnerName,
      startedAt: new Date(now).toISOString(),
      expiresAt,
      status: 'in_progress',
      answers: {},
    };

    ATTEMPTS_STORE.push(newAttempt);

    this.recordAudit({
      examId,
      attemptId: newAttempt.id,
      learnerId,
      action: 'started',
      metadata: { startedAt: newAttempt.startedAt, expiresAt: newAttempt.expiresAt },
    });

    const sanitizedExam = {
      ...exam,
      questions: exam.questions?.map((q) => ({
        ...q,
        correctOptionIndex: -1, // Security strip
      })),
    };

    return {
      success: true,
      attempt: {
        ...newAttempt,
        serverRemainingSeconds: Math.floor(durationMs / 1000),
      },
      exam: sanitizedExam,
    };
  }

  /**
   * Save an answer idempotently with server time lock check
   */
  public static saveAnswer(params: {
    attemptId: string;
    learnerId: string;
    questionId: string;
    selectedOptionIndex: number;
  }): { success: boolean; error?: string; remainingSeconds?: number } {
    const attempt = ATTEMPTS_STORE.find(
      (a) => a.id === params.attemptId && a.learnerId === params.learnerId
    );

    if (!attempt) {
      return { success: false, error: 'Sınav oturumu bulunamadı.' };
    }

    // Check server expiry
    this.checkAndLockExpiry(attempt);

    if (attempt.status !== 'in_progress') {
      return {
        success: false,
        error: 'Sınav süresi dolduğu veya teslim edildiği için cevaplar değiştirilemez.',
      };
    }

    // Idempotent save
    attempt.answers[params.questionId] = params.selectedOptionIndex;

    this.recordAudit({
      examId: attempt.examId,
      attemptId: attempt.id,
      learnerId: params.learnerId,
      action: 'answer_saved',
      metadata: {
        questionId: params.questionId,
        selectedOptionIndex: params.selectedOptionIndex,
      },
    });

    const remaining = this.calculateRemainingSeconds(attempt);

    return {
      success: true,
      remainingSeconds: remaining,
    };
  }

  /**
   * Submit an exam attempt (Manual submit or auto-submit on timeout)
   */
  public static submitAttempt(params: {
    attemptId: string;
    learnerId: string;
    isAutoSubmit?: boolean;
  }): ExamSubmissionResult {
    const attempt = ATTEMPTS_STORE.find(
      (a) => a.id === params.attemptId && a.learnerId === params.learnerId
    );

    if (!attempt) {
      return {
        success: false,
        message: 'Sınav oturumu bulunamadı.',
        attempt: {} as ExamAttempt,
      };
    }

    if (attempt.status === 'submitted' || attempt.status === 'graded') {
      return {
        success: true,
        message: 'Sınavınız daha önce öğretmeninize teslim edilmiştir.',
        attempt,
      };
    }

    // Lock and grade
    attempt.status = 'submitted';
    attempt.submittedAt = new Date().toISOString();
    this.gradeAttempt(attempt);

    this.recordAudit({
      examId: attempt.examId,
      attemptId: attempt.id,
      learnerId: params.learnerId,
      action: params.isAutoSubmit ? 'auto_submitted' : 'manual_submitted',
      metadata: {
        submittedAt: attempt.submittedAt,
        scorePercent: attempt.scorePercent,
        isPassed: attempt.isPassed,
      },
    });

    return {
      success: true,
      message: 'Sınavınız öğretmeninize teslim edildi.',
      attempt,
    };
  }

  /**
   * Get student's all attempts
   */
  public static getLearnerAttempts(learnerId: string): ExamAttempt[] {
    return ATTEMPTS_STORE.filter((a) => a.learnerId === learnerId);
  }

  /**
   * Get instructor's exam submissions and results
   */
  public static getInstructorResults(instructorId: string): {
    exam: Exam;
    attempts: ExamAttempt[];
  }[] {
    const instructorExams = EXAMS_STORE.filter((e) => e.instructorId === instructorId);

    return instructorExams.map((exam) => {
      const attempts = ATTEMPTS_STORE.filter((a) => a.examId === exam.id);
      return {
        exam,
        attempts,
      };
    });
  }
}
