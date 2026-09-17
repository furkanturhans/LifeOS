export type EducationRole =
  | 'learner'
  | 'guardian'
  | 'instructor_applicant'
  | 'instructor_verified'
  | 'education_moderator';

export type AgeGroup =
  | 'preschool' // Okul Öncesi (3-6)
  | 'child'     // Çocuk (7-12)
  | 'youth'     // Genç (13-18)
  | 'adult'     // Yetişkin (19-64)
  | 'senior';   // 65+ Yaş

export type CourseLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'all_levels';

export type LessonContentType =
  | 'video'
  | 'live_session'
  | 'article'
  | 'digital_book'
  | 'resource_file'
  | 'assignment'
  | 'exam';

export type EducationSectionKey =
  | 'explore'
  | 'my_courses'
  | 'live_sessions'
  | 'my_exams'
  | 'instructor_hub';

export type LiveSessionStatus =
  | 'draft'
  | 'scheduled'
  | 'live'
  | 'completed'
  | 'cancelled';

export interface LessonContent {
  id: string;
  type: LessonContentType;
  title: string;
  durationMinutes?: number;
  description?: string;
  articleText?: string;
  bookPagesCount?: number;
  fileUrl?: string;
  assignmentInstructions?: string;
  examId?: string;
  isDraft: boolean;
}

export interface LessonDraft {
  id: string;
  title: string;
  order: number;
  contents: LessonContent[];
  isDraft: boolean;
}

export interface CourseSection {
  id: string;
  title: string;
  order: number;
  lessons: LessonDraft[];
}

export interface CourseDraft {
  id: string;
  instructorId: string;
  instructorName: string;
  title: string;
  description: string;
  category: string;
  ageGroup: AgeGroup;
  level: CourseLevel;
  learningGoals: string[];
  coverEmoji: string;
  sections: CourseSection[];
  createdAt: string;
  updatedAt: string;
  isDraft: boolean; // Always true in Phase 1
  isPublished: boolean; // Always false in Phase 1
}

export interface InstructorApplication {
  id: string;
  applicantLifeosId: string;
  fullName: string;
  expertiseArea: string;
  educationLevel: 'high_school' | 'bachelor' | 'master' | 'doctorate' | 'certified_expert';
  bio: string;
  teachingCategories: string[];
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
}

export interface InstructorProfile {
  id: string;
  lifeosId: string;
  displayName: string;
  avatarEmoji: string;
  expertiseArea: string;
  educationLevel: string;
  bio: string;
  teachingCategories: string[];
  isVerified: boolean;
  verifiedAt?: string;
  revenueSharePercent: number; // e.g. 70% to instructor
}

// -----------------------------------------------------------------------------
// Live Sessions, 50-Credit Model & Max 70 Participants
// -----------------------------------------------------------------------------

export interface LiveSession {
  id: string;
  courseId?: string;
  courseTitle?: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  instructorBio: string;
  title: string;
  description: string;
  scheduledAt: string; // ISO timestamp
  durationMinutes: number; // e.g. 45 or 60 min
  ageGroup: AgeGroup;
  creditsRequired: number; // Standard: 50 credits
  maxParticipants: number; // Maximum capped at 70
  currentParticipantCount: number;
  status: LiveSessionStatus;
  bbbMeetingId?: string;
  attendeePW?: string;
  moderatorPW?: string;
  createdAt: string;
  updatedAt: string;
}

// Backward-compatibility alias
export type LiveSessionPlan = LiveSession;

export interface LiveSessionRegistration {
  id: string;
  sessionId: string;
  sessionTitle: string;
  instructorName: string;
  scheduledAt: string;
  learnerId: string;
  learnerDisplayName: string;
  creditsPaid: number;
  enrolledAt: string;
  status: 'confirmed' | 'refunded';
}

// -----------------------------------------------------------------------------
// Credit Ledger & Immutable Transaction History
// -----------------------------------------------------------------------------

export type CreditTransactionType =
  | 'earn'
  | 'topup'
  | 'session_enrollment'
  | 'refund'
  | 'adjustment';

export interface CreditLedgerEntry {
  id: string;
  userId: string;
  type: CreditTransactionType;
  amount: number; // e.g. -50 for enrollment, +50 for refund
  balanceAfter: number;
  description: string;
  referenceId?: string; // sessionId or orderId
  createdAt: string;
}

export interface BigBlueButtonJoinResult {
  success: boolean;
  isConfigured: boolean;
  joinUrl?: string;
  meetingId?: string;
  message?: string;
  role?: 'viewer' | 'moderator';
}

export interface LiveClassHealthResult {
  isConfigured: boolean;
  provider: string;
  isReachable: boolean;
  message: string;
}

// -----------------------------------------------------------------------------
// Timed Exam Infrastructure Models
// -----------------------------------------------------------------------------

export type ExamStatus = 'draft' | 'scheduled' | 'open' | 'ended' | 'evaluated';

export interface ExamOption {
  id: string;
  text: string;
}

export interface ExamQuestion {
  id: string;
  examId: string;
  order: number;
  questionText: string;
  options: ExamOption[];
  correctOptionIndex: number; // Server-only, stripped for students during active exam
  points: number;
  explanation?: string;
}

export interface Exam {
  id: string;
  courseId: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  title: string;
  description: string;
  scheduledAt: string; // ISO timestamp for exam start
  durationMinutes: number; // Configurable (e.g. 40 min)
  passScorePercent: number; // Configurable (e.g. 70%)
  questionsCount: number;
  totalPoints: number;
  status: ExamStatus;
  createdAt: string;
  updatedAt: string;
  questions?: ExamQuestion[];
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  courseId: string;
  learnerId: string;
  learnerName: string;
  startedAt: string; // Server ISO timestamp
  expiresAt: string; // Server ISO timestamp (startedAt + durationMinutes)
  submittedAt?: string;
  status: 'in_progress' | 'submitted' | 'expired' | 'graded';
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  scorePercent?: number;
  totalScore?: number;
  isPassed?: boolean;
  certificateEarned?: boolean;
  serverRemainingSeconds?: number;
}

export interface ExamAuditLog {
  id: string;
  examId: string;
  attemptId: string;
  learnerId: string;
  action: 'started' | 'answer_saved' | 'auto_submitted' | 'manual_submitted' | 'graded';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ExamSubmissionResult {
  success: boolean;
  message: string;
  attempt: ExamAttempt;
}

export interface ClassroomAnnouncement {
  id: string;
  instructorId: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface ClassroomQA {
  id: string;
  studentId: string;
  studentName: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
}

export interface ClassroomGroup {
  id: string;
  courseId: string;
  name: string;
  announcements: ClassroomAnnouncement[];
  qaThreads: ClassroomQA[];
  sharedResources: { id: string; name: string; type: string; url: string }[];
}

export interface GuardianConsent {
  id: string;
  guardianLifeosId: string;
  childLifeosId: string;
  allowLiveSessions: boolean;
  allowClassroomQA: boolean;
  visibilityControl: 'private' | 'guardian_monitored' | 'classroom_only';
  grantedAt: string;
}

export interface Certificate {
  id: string;
  learnerId: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string;
  certificateCode: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: CreditTransactionType;
  amountCredits: number;
  referenceId: string;
  createdAt: string;
}
