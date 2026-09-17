import type {
  EducationRole,
  InstructorApplication,
  InstructorProfile,
  ClassroomGroup,
  ClassroomAnnouncement,
  ClassroomQA,
} from '@/types/education';

// In-memory registry for server-side instructor authorization
interface UserInstructorState {
  userId: string;
  role: EducationRole;
  application: InstructorApplication | null;
  profile: InstructorProfile | null;
}

const INSTRUCTOR_STATES: Record<string, UserInstructorState> = {
  // Verified Demo Instructor
  'usr-instructor-ahmet': {
    userId: 'usr-instructor-ahmet',
    role: 'instructor_verified',
    application: {
      id: 'app-ahmet-1',
      applicantLifeosId: 'usr-instructor-ahmet',
      fullName: 'Prof. Dr. Ahmet Yılmaz',
      expertiseArea: 'Yapay Zeka ve İleri Matematik',
      educationLevel: 'doctorate',
      bio: '20 yıllık akademik ve sektörel yapay zeka araştırmacısı.',
      teachingCategories: ['Yazılım & Yapay Zeka', 'Matematik & Fen Bilimleri'],
      submittedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      status: 'verified',
    },
    profile: {
      id: 'inst_verified_1',
      lifeosId: 'usr-instructor-ahmet',
      displayName: 'Prof. Dr. Ahmet Yılmaz',
      avatarEmoji: '👨‍🏫',
      expertiseArea: 'Yapay Zeka ve İleri Matematik',
      educationLevel: 'Doktora (PhD)',
      bio: '20 yıllık akademik ve sektörel yapay zeka araştırmacısı.',
      teachingCategories: ['Yazılım & Yapay Zeka', 'Matematik & Fen Bilimleri'],
      isVerified: true,
      verifiedAt: new Date(Date.now() - 86400000 * 29).toISOString(),
      revenueSharePercent: 70,
    },
  },
  // Default Local User (Starts as learner)
  'user_local': {
    userId: 'user_local',
    role: 'learner',
    application: null,
    profile: null,
  },
};

export class InstructorRegistry {
  /**
   * Get all registered instructor states (for administrative review)
   */
  public static getAllStates(): Record<string, UserInstructorState> {
    return INSTRUCTOR_STATES;
  }

  /**
   * Get user's server-authoritative instructor status
   */
  public static getStatus(userId: string): {
    role: EducationRole;
    isVerified: boolean;
    application: InstructorApplication | null;
    profile: InstructorProfile | null;
  } {
    const state = INSTRUCTOR_STATES[userId] || {
      userId,
      role: 'learner' as EducationRole,
      application: null,
      profile: null,
    };

    return {
      role: state.role,
      isVerified: state.role === 'instructor_verified',
      application: state.application,
      profile: state.profile,
    };
  }

  /**
   * Submit an application to become an instructor
   */
  public static submitApplication(data: {
    applicantLifeosId: string;
    fullName: string;
    expertiseArea: string;
    educationLevel: InstructorApplication['educationLevel'];
    bio: string;
    teachingCategories: string[];
  }): { success: boolean; application: InstructorApplication } {
    const userId = data.applicantLifeosId || 'user_local';

    const application: InstructorApplication = {
      id: `app_${Date.now()}`,
      applicantLifeosId: userId,
      fullName: data.fullName.trim(),
      expertiseArea: data.expertiseArea.trim(),
      educationLevel: data.educationLevel,
      bio: data.bio.trim(),
      teachingCategories: data.teachingCategories,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    INSTRUCTOR_STATES[userId] = {
      userId,
      role: 'instructor_applicant',
      application,
      profile: null,
    };

    return {
      success: true,
      application,
    };
  }

  /**
   * Verify and approve instructor application
   */
  public static verifyInstructor(userId: string): {
    success: boolean;
    profile: InstructorProfile;
  } {
    const current = INSTRUCTOR_STATES[userId];
    const app = current?.application;

    const profile: InstructorProfile = {
      id: `inst_${userId}`,
      lifeosId: userId,
      displayName: app?.fullName || 'Doğrulanmış Eğitmen',
      avatarEmoji: '👨‍🏫',
      expertiseArea: app?.expertiseArea || 'Akademi Eğitmeni',
      educationLevel: app?.educationLevel || 'master',
      bio: app?.bio || 'LifeOS Doğrulanmış Akademi Eğitmeni.',
      teachingCategories: app?.teachingCategories || ['Genel Eğitim'],
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      revenueSharePercent: 70,
    };

    INSTRUCTOR_STATES[userId] = {
      userId,
      role: 'instructor_verified',
      application: app ? { ...app, status: 'verified' } : null,
      profile,
    };

    return {
      success: true,
      profile,
    };
  }

  /**
   * Get enrolled students list for an instructor (privacy-safe: no raw email/phone)
   */
  public static getInstructorStudents(instructorId: string) {
    return [
      {
        id: 'std-1',
        name: 'Zeynep Kaya',
        enrolledCoursesCount: 2,
        liveSessionsAttended: 3,
        lastActiveAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        status: 'active',
      },
      {
        id: 'std-2',
        name: 'Furkan Turhan',
        enrolledCoursesCount: 3,
        liveSessionsAttended: 4,
        lastActiveAt: new Date(Date.now() - 1800000).toISOString(),
        status: 'active',
      },
      {
        id: 'std-3',
        name: 'Mert Demir',
        enrolledCoursesCount: 1,
        liveSessionsAttended: 1,
        lastActiveAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'active',
      },
      {
        id: 'std-4',
        name: 'Elif Şahin',
        enrolledCoursesCount: 2,
        liveSessionsAttended: 2,
        lastActiveAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'active',
      },
    ];
  }

  /**
   * Get classroom groups, announcements and Q&A for an instructor
   */
  public static getInstructorClassrooms(instructorId: string): ClassroomGroup[] {
    return [
      {
        id: 'grp-math-101',
        courseId: 'crs-math-101',
        name: 'İleri Matematik 101 Sınıf Alanı',
        announcements: [
          {
            id: 'ann-1',
            instructorId,
            title: 'Hafta 4 Türev Çalışma Soruları Yüklendi',
            content: 'Önümüzdeki canlı derse kadar çalışma sorularını inceleyiniz.',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
        ],
        qaThreads: [
          {
            id: 'qa-1',
            studentId: 'std-1',
            studentName: 'Zeynep Kaya',
            question: 'İntegral 3. soru için kısmi integrasyon formülü uygulanabilir mi?',
            answer: 'Evet, u = x ve dv = e^x dx dönüşümü yaparak çözebilirsiniz.',
            answeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
          },
        ],
        sharedResources: [
          { id: 'res-1', name: 'Integral-Uygulamalari.pdf', type: 'pdf', url: '#' },
        ],
      },
    ];
  }
}
