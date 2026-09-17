export type AdminRole = 'admin' | 'super_admin';

export type ApplicationType =
  | 'instructor'
  | 'taxi'
  | 'moving'
  | 'craftsman'
  | 'travel';

export type ApplicationStatus =
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'need_more_info'
  | 'suspended';

export type DocumentVerificationStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export interface ApplicationDocument {
  id: string;
  type: string;
  titleTr: string;
  descriptionTr: string;
  fileUrl?: string;
  status: DocumentVerificationStatus;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface AdminApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantMaskedEmail?: string;
  applicationType: ApplicationType;
  title: string;
  description: string;
  categoryOrExpertise: string;
  documents: ApplicationDocument[];
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
  reviewedByAdminId?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  needInfoNotes?: string;
  internalAdminNotes?: string;
}

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminDisplayName: string;
  action:
    | 'application_approved'
    | 'application_rejected'
    | 'application_under_review'
    | 'application_need_info'
    | 'application_suspended'
    | 'document_verified'
    | 'document_rejected'
    | 'user_restricted'
    | 'user_suspended'
    | 'user_activated'
    | 'complaint_resolved'
    | 'setting_updated';
  targetType: 'application' | 'user' | 'course' | 'service_request' | 'complaint' | 'system';
  targetId: string;
  targetTitle?: string;
  previousState?: string;
  newState?: string;
  reason?: string;
  notes?: string;
  timestamp: string;
  ipAddress?: string;
}

export interface AdminOverviewMetrics {
  pendingInstructorApplications: number;
  pendingProviderApplications: number;
  documentsToReview: number;
  newUsersToday: number;
  openComplaints: number;
  activity7DaysCount: number;
  activityTrend: Array<{ date: string; actions: number }>;
}

export type AdminTabKey =
  | 'overview'
  | 'finance'
  | 'applications'
  | 'instructors'
  | 'providers'
  | 'users'
  | 'kids_content'
  | 'courses'
  | 'services'
  | 'complaints'
  | 'audit_logs'
  | 'settings';

export interface AdminManagedUser {
  id: string;
  lifeosId: string;
  maskedEmail: string;
  displayName: string;
  avatarUrl?: string | null;
  accountStatus: 'active' | 'restricted' | 'suspended';
  roles: {
    isInstructorVerified: boolean;
    providerServices: Array<'taxi' | 'moving' | 'craftsman' | 'travel'>;
    isAdmin: boolean;
  };
  complaintsCount: number;
  createdAt: string;
  lastActiveAt: string;
}

export interface PlatformComplaint {
  id: string;
  complainantMaskedId: string;
  complainantName: string;
  targetType: 'user' | 'course' | 'live_session' | 'service_request' | 'bid';
  targetId: string;
  targetTitle: string;
  reason: string;
  details: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolutionNotes?: string;
  resolvedByAdminId?: string;
  createdAt: string;
  resolvedAt?: string;
}
