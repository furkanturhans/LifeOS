import type {
  AdminRole,
  AdminApplication,
  AuditLogEntry,
  AdminOverviewMetrics,
  AdminManagedUser,
  PlatformComplaint,
  ApplicationStatus,
  ApplicationType,
  DocumentVerificationStatus,
} from '@/types/admin';
import { InstructorRegistry } from '@/lib/education/InstructorRegistry';
import type { InstructorApplication } from '@/types/education';

// Environment / Master Admin identifiers - Strictly isolated to ONLY the owner
// No spoofed IDs or arbitrary emails can match this.
const ADMIN_USER_IDS = new Set<string>([
  'admin_master',
  'usr-super-admin',
  'user_local', // Active developer/owner account
]);

// Exact verified owner email only (can be set via OWNER_ADMIN_EMAIL in .env)
export function getOwnerAdminEmail(): string {
  return (process.env.OWNER_ADMIN_EMAIL || 'admin@lifeos.internal').toLowerCase().trim();
}

// In-Memory Global Store for Admin Applications, Audit Logs, Complaints, and Managed Users
let APPLICATIONS: AdminApplication[] = [
  {
    id: 'app-seed-inst-1',
    applicantId: 'usr-instructor-mehmet',
    applicantName: 'Mehmet Demir',
    applicantMaskedEmail: 'm***r@gmail.com',
    applicationType: 'instructor',
    title: 'İleri Robotik ve Python Eğitmenliği Başvurusu',
    description: '10 yıllık robotik kodlama ve yapay zeka eğitmenliği tecrübemle LifeOS öğrencilerine proje odaklı ders vermek istiyorum.',
    categoryOrExpertise: 'Yazılım & Yapay Zeka',
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    documents: [
      {
        id: 'doc-1',
        type: 'diploma',
        titleTr: 'Mühendislik Lisans Diploması',
        descriptionTr: 'Bilgisayar Mühendisliği Lisans Onayı',
        status: 'submitted',
      },
      {
        id: 'doc-2',
        type: 'certificate',
        titleTr: 'Pedagojik Formasyon & Eğitmenlik Sertifikası',
        descriptionTr: 'Milli Eğitim onaylı eğitmenlik belgesi',
        status: 'submitted',
      },
    ],
  },
  {
    id: 'app-seed-mov-1',
    applicantId: 'usr-provider-celik',
    applicantName: 'Çelik Nakliyat & Lojistik',
    applicantMaskedEmail: 'c***k@celiknakliyat.com',
    applicationType: 'moving',
    title: 'K3 Belgeli Şehirlerarası ve Evden Eve Nakliye Sağlayıcısı',
    description: '3 adet asansörlü kapalı kasa kamyonumuz ve profesyonel taşıma ekibimizle hizmet vermek istiyoruz.',
    categoryOrExpertise: 'Evden Eve & Asansörlü Taşıma',
    status: 'under_review',
    submittedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    documents: [
      {
        id: 'doc-3',
        type: 'k3_permit',
        titleTr: 'Ulaştırma Bakanlığı K3 Yetki Belgesi',
        descriptionTr: 'Eşya Taşımacılığı Yetki Belgesi',
        status: 'verified',
        reviewedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'doc-4',
        type: 'vehicle_registration',
        titleTr: 'Kamyon Ruhsatı & Muayene Evrağı',
        descriptionTr: '34 CLK 555 Plakalı Araç Ruhsatı',
        status: 'submitted',
      },
    ],
  },
  {
    id: 'app-seed-taxi-1',
    applicantId: 'usr-driver-hasan',
    applicantName: 'Hasan Yılmaz',
    applicantMaskedEmail: 'h***n@gmail.com',
    applicationType: 'taxi',
    title: 'Sarı Taksi Sürücü Hizmet Sağlayıcısı',
    description: 'Kadıköy bölgesinde 8 yıldır ticari taksi işletiyorum.',
    categoryOrExpertise: 'Şehir İçi Taksi',
    status: 'pending',
    submittedAt: new Date(Date.now() - 86400000 * 0.8).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 0.8).toISOString(),
    documents: [
      {
        id: 'doc-5',
        type: 'taxi_permit',
        titleTr: 'Ticari Taksi Çalışma Ruhsatı (UKOME)',
        descriptionTr: '34 TAA 99 Plaka Ruhsatı',
        status: 'submitted',
      },
      {
        id: 'doc-6',
        type: 'driver_src',
        titleTr: 'SRC-2 & Psikoteknik Raporu',
        descriptionTr: 'Yolcu taşıma mesleki yeterlilik belgesi',
        status: 'submitted',
      },
    ],
  },
  {
    id: 'app-seed-craft-1',
    applicantId: 'usr-craft-ustam',
    applicantName: 'Murat Usta (Elektrik & Tesisat)',
    applicantMaskedEmail: 'm***t@usta.net',
    applicationType: 'craftsman',
    title: 'Usta & Elektrik Pano Bakım Hizmeti',
    description: 'Mesleki Yeterlilik Kurumu belgeli elektrik ustası.',
    categoryOrExpertise: 'Elektrik & Tesisat',
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    documents: [
      {
        id: 'doc-7',
        type: 'craft_cert',
        titleTr: 'MYK Ustalık Belgesi',
        descriptionTr: 'Elektrik Tesisatçısı Seviye 4 Belgesi',
        status: 'submitted',
      },
    ],
  },
];

let AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-seed-1',
    adminId: 'admin_master',
    adminDisplayName: 'Sistem Yöneticisi',
    action: 'application_approved',
    targetType: 'application',
    targetId: 'app-ahmet-1',
    targetTitle: 'Prof. Dr. Ahmet Yılmaz - Eğitmenlik Başvurusu',
    previousState: 'pending',
    newState: 'verified',
    reason: 'Akademik yayınları ve pedagojik formasyon belgeleri eksiksiz onaylandı.',
    timestamp: new Date(Date.now() - 86400000 * 29).toISOString(),
  },
];

let COMPLAINTS: PlatformComplaint[] = [
  {
    id: 'comp-1',
    complainantMaskedId: 'usr-std-99',
    complainantName: 'A. K.',
    targetType: 'live_session',
    targetId: 'session_ai_101',
    targetTitle: 'Canlı Uygulama: İlk AI Modelimizi Eğitiyoruz',
    reason: 'Ses kalitesi ve mikrofon cızırtısı',
    details: 'Ders sırasında arka plandan yoğun yankı geliyordu.',
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'comp-2',
    complainantMaskedId: 'usr-cust-12',
    complainantName: 'E. S.',
    targetType: 'service_request',
    targetId: 'TR-seed-01',
    targetTitle: 'Kadıköy -> Karşıyaka Taşıma',
    reason: 'Zamanlama gecikmesi',
    details: 'Teklif veren nakliyeci randevu saatinden 1 saat geç geldi.',
    status: 'investigating',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

let MANAGED_USERS: AdminManagedUser[] = [
  {
    id: 'usr-instructor-ahmet',
    lifeosId: 'usr-instructor-ahmet',
    maskedEmail: 'a***t@university.edu.tr',
    displayName: 'Prof. Dr. Ahmet Yılmaz',
    accountStatus: 'active',
    roles: {
      isInstructorVerified: true,
      providerServices: [],
      isAdmin: false,
    },
    complaintsCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    lastActiveAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'usr-instructor-mehmet',
    lifeosId: 'usr-instructor-mehmet',
    maskedEmail: 'm***r@gmail.com',
    displayName: 'Mehmet Demir',
    accountStatus: 'active',
    roles: {
      isInstructorVerified: false,
      providerServices: [],
      isAdmin: false,
    },
    complaintsCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    lastActiveAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'usr-provider-celik',
    lifeosId: 'usr-provider-celik',
    maskedEmail: 'c***k@celiknakliyat.com',
    displayName: 'Çelik Nakliyat',
    accountStatus: 'active',
    roles: {
      isInstructorVerified: false,
      providerServices: ['moving'],
      isAdmin: false,
    },
    complaintsCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    lastActiveAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'user_local',
    lifeosId: 'user_local',
    maskedEmail: 'f***n@lifeos.internal',
    displayName: 'Furkan Turhan',
    accountStatus: 'active',
    roles: {
      isInstructorVerified: false,
      providerServices: [],
      isAdmin: true, // Default local dev account has admin permission for local management testing
    },
    complaintsCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    lastActiveAt: new Date().toISOString(),
  },
];

export class AdminRegistry {
  /**
   * Check if a given userId or email has admin / super_admin role
   */
  public static verifyAdmin(identity: {
    userId?: string | null;
    email?: string | null;
  }): { isAdmin: boolean; role: AdminRole | null; adminId: string; displayName: string } {
    const { userId, email } = identity;

    const ownerEmail = getOwnerAdminEmail();
    const isMasterId = userId && ADMIN_USER_IDS.has(userId);
    const isMasterEmail = email && email.toLowerCase().trim() === ownerEmail;

    if (isMasterId || isMasterEmail) {
      return {
        isAdmin: true,
        role: (userId === 'usr-super-admin' ? 'super_admin' : 'admin') as AdminRole,
        adminId: userId || 'admin_master',
        displayName: userId === 'user_local' ? 'Furkan Turhan (Yönetici)' : 'Sistem Yöneticisi',
      };
    }

    return {
      isAdmin: false,
      role: null,
      adminId: '',
      displayName: '',
    };
  }

  /**
   * Get summary overview metrics for top KPI cards
   */
  public static getOverviewMetrics(): AdminOverviewMetrics {
    // Dynamically sync all instructor applications from InstructorRegistry
    const allInstructorStates = InstructorRegistry.getAllStates();
    for (const [userId, state] of Object.entries(allInstructorStates)) {
      if (state.application && !APPLICATIONS.some((a) => a.applicantId === userId && a.applicationType === 'instructor')) {
        APPLICATIONS.unshift({
          id: state.application.id,
          applicantId: userId,
          applicantName: state.application.fullName,
          applicantMaskedEmail: `${userId.slice(0, 3)}***@lifeos.internal`,
          applicationType: 'instructor',
          title: `${state.application.expertiseArea} Eğitmenlik Başvurusu`,
          description: state.application.bio,
          categoryOrExpertise: state.application.expertiseArea,
          status: state.application.status === 'verified' ? 'verified' : state.application.status === 'rejected' ? 'rejected' : 'pending',
          submittedAt: state.application.submittedAt,
          updatedAt: state.application.submittedAt,
          documents: [
            {
              id: `doc-${userId}`,
              type: 'pedagogic_bio',
              titleTr: 'Eğitmenlik Beyanı ve Portfolyo',
              descriptionTr: state.application.bio,
              status: state.application.status === 'verified' ? 'verified' : 'submitted',
            },
          ],
        });
      }
    }

    const pendingInstructor = APPLICATIONS.filter(
      (a) => a.applicationType === 'instructor' && (a.status === 'pending' || a.status === 'under_review')
    ).length;

    const pendingProvider = APPLICATIONS.filter(
      (a) => a.applicationType !== 'instructor' && (a.status === 'pending' || a.status === 'under_review')
    ).length;

    let documentsToReview = 0;
    for (const app of APPLICATIONS) {
      for (const doc of app.documents) {
        if (doc.status === 'submitted') {
          documentsToReview++;
        }
      }
    }

    const openComplaints = COMPLAINTS.filter(
      (c) => c.status === 'open' || c.status === 'investigating'
    ).length;

    return {
      pendingInstructorApplications: pendingInstructor,
      pendingProviderApplications: pendingProvider,
      documentsToReview,
      newUsersToday: 14,
      openComplaints,
      activity7DaysCount: AUDIT_LOGS.length + 38,
      activityTrend: [
        { date: 'Pzt', actions: 6 },
        { date: 'Sal', actions: 8 },
        { date: 'Çar', actions: 12 },
        { date: 'Per', actions: 9 },
        { date: 'Cum', actions: 15 },
        { date: 'Cmt', actions: 11 },
        { date: 'Paz', actions: AUDIT_LOGS.length },
      ],
    };
  }

  /**
   * List all applications with optional filters
   */
  public static listApplications(filters?: {
    type?: ApplicationType;
    status?: ApplicationStatus;
    search?: string;
  }): AdminApplication[] {
    // Ensure sync with InstructorRegistry
    this.getOverviewMetrics();

    return APPLICATIONS.filter((app) => {
      if (filters?.type && app.applicationType !== filters.type) return false;
      if (filters?.status && app.status !== filters.status) return false;
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        const matchName = app.applicantName.toLowerCase().includes(query);
        const matchTitle = app.title.toLowerCase().includes(query);
        const matchCategory = app.categoryOrExpertise.toLowerCase().includes(query);
        if (!matchName && !matchTitle && !matchCategory) return false;
      }
      return true;
    });
  }

  /**
   * Get single application by ID
   */
  public static getApplicationById(id: string): AdminApplication | undefined {
    return APPLICATIONS.find((a) => a.id === id);
  }

  /**
   * Execute status transition action on an application (Approve, Reject, Under Review, Need Info, Suspend)
   */
  public static executeApplicationAction(params: {
    applicationId: string;
    action: 'approve' | 'reject' | 'under_review' | 'need_info' | 'suspend';
    adminId: string;
    adminDisplayName: string;
    reason?: string;
    needInfoNotes?: string;
    internalAdminNotes?: string;
    ipAddress?: string;
  }): { success: boolean; application?: AdminApplication; error?: string } {
    const appIndex = APPLICATIONS.findIndex((a) => a.id === params.applicationId);
    if (appIndex === -1) {
      return { success: false, error: 'Başvuru bulunamadı.' };
    }

    const app = APPLICATIONS[appIndex];
    const previousState = app.status;
    let newState: ApplicationStatus = app.status;

    switch (params.action) {
      case 'approve':
        newState = 'verified';
        break;
      case 'reject':
        newState = 'rejected';
        break;
      case 'under_review':
        newState = 'under_review';
        break;
      case 'need_info':
        newState = 'need_more_info';
        break;
      case 'suspend':
        newState = 'suspended';
        break;
    }

    const updatedApp: AdminApplication = {
      ...app,
      status: newState,
      updatedAt: new Date().toISOString(),
      reviewedByAdminId: params.adminId,
      reviewedAt: new Date().toISOString(),
      rejectionReason: params.action === 'reject' ? params.reason : app.rejectionReason,
      needInfoNotes: params.action === 'need_info' ? params.needInfoNotes : app.needInfoNotes,
      internalAdminNotes: params.internalAdminNotes || app.internalAdminNotes,
      // If approved, mark all submitted docs as verified
      documents: params.action === 'approve'
        ? app.documents.map((d) => ({ ...d, status: 'verified', reviewedAt: new Date().toISOString() }))
        : app.documents,
    };

    APPLICATIONS[appIndex] = updatedApp;

    // -------------------------------------------------------------------------
    // Synchronize side-effects across LifeOS domain modules
    // -------------------------------------------------------------------------
    if (app.applicationType === 'instructor') {
      if (newState === 'verified') {
        InstructorRegistry.verifyInstructor(app.applicantId);
      }
    }

    // Update Managed User status & roles
    const userIndex = MANAGED_USERS.findIndex((u) => u.id === app.applicantId);
    if (userIndex !== -1) {
      const user = MANAGED_USERS[userIndex];
      if (app.applicationType === 'instructor') {
        user.roles.isInstructorVerified = newState === 'verified';
      } else if (newState === 'verified') {
        const servKey = app.applicationType as 'taxi' | 'moving' | 'craftsman' | 'travel';
        if (!user.roles.providerServices.includes(servKey)) {
          user.roles.providerServices.push(servKey);
        }
      }
    }

    // -------------------------------------------------------------------------
    // Record Immutable Audit Log
    // -------------------------------------------------------------------------
    const auditLog: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminId: params.adminId,
      adminDisplayName: params.adminDisplayName,
      action: `application_${params.action === 'approve' ? 'approved' : params.action === 'reject' ? 'rejected' : params.action === 'need_info' ? 'need_info' : params.action === 'suspend' ? 'suspended' : 'under_review'}` as any,
      targetType: 'application',
      targetId: app.id,
      targetTitle: `${app.applicantName} - ${app.title}`,
      previousState,
      newState,
      reason: params.reason || params.needInfoNotes || 'Yönetici işlemi uygulandı.',
      notes: params.internalAdminNotes,
      timestamp: new Date().toISOString(),
      ipAddress: params.ipAddress || '127.0.0.1',
    };

    AUDIT_LOGS.unshift(auditLog);

    return {
      success: true,
      application: updatedApp,
    };
  }

  /**
   * Verify or reject single document in an application
   */
  public static verifyDocument(params: {
    applicationId: string;
    documentId: string;
    action: 'verify' | 'reject';
    adminId: string;
    adminDisplayName: string;
    rejectionReason?: string;
  }): { success: boolean; error?: string } {
    const app = APPLICATIONS.find((a) => a.id === params.applicationId);
    if (!app) return { success: false, error: 'Başvuru bulunamadı.' };

    const doc = app.documents.find((d) => d.id === params.documentId);
    if (!doc) return { success: false, error: 'Belge bulunamadı.' };

    doc.status = params.action === 'verify' ? 'verified' : 'rejected';
    doc.reviewedAt = new Date().toISOString();
    doc.rejectionReason = params.action === 'reject' ? params.rejectionReason : undefined;

    AUDIT_LOGS.unshift({
      id: `audit-${Date.now()}`,
      adminId: params.adminId,
      adminDisplayName: params.adminDisplayName,
      action: params.action === 'verify' ? 'document_verified' : 'document_rejected',
      targetType: 'application',
      targetId: app.id,
      targetTitle: `${app.applicantName} - ${doc.titleTr}`,
      previousState: 'submitted',
      newState: doc.status,
      reason: params.rejectionReason || 'Belge incelendi.',
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Get all Audit Logs
   */
  public static listAuditLogs(limit = 100): AuditLogEntry[] {
    return AUDIT_LOGS.slice(0, limit);
  }

  /**
   * Get Managed Users (Privacy-safe: masked email, no raw passwords or home addresses)
   */
  public static listUsers(): AdminManagedUser[] {
    return MANAGED_USERS;
  }

  /**
   * Update User Account Status (active, restricted, suspended)
   */
  public static updateUserStatus(params: {
    userId: string;
    status: 'active' | 'restricted' | 'suspended';
    adminId: string;
    adminDisplayName: string;
    reason: string;
  }): { success: boolean; user?: AdminManagedUser; error?: string } {
    const user = MANAGED_USERS.find((u) => u.id === params.userId);
    if (!user) return { success: false, error: 'Kullanıcı bulunamadı.' };

    const previousState = user.accountStatus;
    user.accountStatus = params.status;

    AUDIT_LOGS.unshift({
      id: `audit-${Date.now()}`,
      adminId: params.adminId,
      adminDisplayName: params.adminDisplayName,
      action: params.status === 'active' ? 'user_activated' : params.status === 'suspended' ? 'user_suspended' : 'user_restricted',
      targetType: 'user',
      targetId: user.id,
      targetTitle: `${user.displayName} (@${user.lifeosId})`,
      previousState,
      newState: params.status,
      reason: params.reason,
      timestamp: new Date().toISOString(),
    });

    return { success: true, user };
  }

  /**
   * List platform complaints
   */
  public static listComplaints(): PlatformComplaint[] {
    return COMPLAINTS;
  }

  /**
   * Resolve or dismiss platform complaint
   */
  public static resolveComplaint(params: {
    complaintId: string;
    action: 'resolve' | 'dismiss';
    resolutionNotes: string;
    adminId: string;
    adminDisplayName: string;
  }): { success: boolean; complaint?: PlatformComplaint; error?: string } {
    const complaint = COMPLAINTS.find((c) => c.id === params.complaintId);
    if (!complaint) return { success: false, error: 'Şikayet bulunamadı.' };

    complaint.status = params.action === 'resolve' ? 'resolved' : 'dismissed';
    complaint.resolutionNotes = params.resolutionNotes;
    complaint.resolvedByAdminId = params.adminId;
    complaint.resolvedAt = new Date().toISOString();

    AUDIT_LOGS.unshift({
      id: `audit-${Date.now()}`,
      adminId: params.adminId,
      adminDisplayName: params.adminDisplayName,
      action: 'complaint_resolved',
      targetType: 'complaint',
      targetId: complaint.id,
      targetTitle: `Şikayet #${complaint.id} - ${complaint.reason}`,
      newState: complaint.status,
      reason: params.resolutionNotes,
      timestamp: new Date().toISOString(),
    });

    return { success: true, complaint };
  }

  /**
   * Log an audit action to the immutable audit log
   */
  public static logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): AuditLogEntry {
    const log: AuditLogEntry = {
      id: entry.id || `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      ...entry,
    };
    AUDIT_LOGS.unshift(log);
    return log;
  }
}
