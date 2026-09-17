import { create } from 'zustand';
import type {
  AdminTabKey,
  AdminOverviewMetrics,
  AdminApplication,
  AdminManagedUser,
  PlatformComplaint,
  AuditLogEntry,
  ApplicationType,
  ApplicationStatus,
} from '@/types/admin';

interface AdminStoreState {
  // Auth state
  isAdmin: boolean;
  adminRole: 'admin' | 'super_admin' | null;
  adminDisplayName: string;
  isCheckingAuth: boolean;
  authError: string | null;

  // Active Tab
  activeTab: AdminTabKey;
  setActiveTab: (tab: AdminTabKey) => void;

  // Overview Metrics
  overviewMetrics: AdminOverviewMetrics | null;
  fetchOverviewMetrics: () => Promise<void>;

  // Applications Queue
  applications: AdminApplication[];
  selectedApplication: AdminApplication | null;
  applicationTypeFilter: ApplicationType | 'all';
  applicationStatusFilter: ApplicationStatus | 'all';
  applicationSearchQuery: string;
  setSelectedApplication: (app: AdminApplication | null) => void;
  setApplicationTypeFilter: (type: ApplicationType | 'all') => void;
  setApplicationStatusFilter: (status: ApplicationStatus | 'all') => void;
  setApplicationSearchQuery: (query: string) => void;
  fetchApplications: () => Promise<void>;
  executeApplicationAction: (params: {
    applicationId: string;
    action: 'approve' | 'reject' | 'under_review' | 'need_info' | 'suspend';
    reason?: string;
    needInfoNotes?: string;
    internalAdminNotes?: string;
  }) => Promise<{ success: boolean; message?: string }>;

  // Managed Users
  users: AdminManagedUser[];
  fetchUsers: () => Promise<void>;
  updateUserStatus: (params: {
    userId: string;
    status: 'active' | 'restricted' | 'suspended';
    reason: string;
  }) => Promise<{ success: boolean; message?: string }>;

  // Complaints
  complaints: PlatformComplaint[];
  fetchComplaints: () => Promise<void>;
  resolveComplaint: (params: {
    complaintId: string;
    action: 'resolve' | 'dismiss';
    resolutionNotes: string;
  }) => Promise<{ success: boolean; message?: string }>;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  fetchAuditLogs: () => Promise<void>;

  // Check initial admin auth
  checkAdminAuth: () => Promise<boolean>;
}

export const useAdminStore = create<AdminStoreState>((set, get) => ({
  isAdmin: false,
  adminRole: null,
  adminDisplayName: '',
  isCheckingAuth: true,
  authError: null,

  activeTab: 'overview',
  setActiveTab: (activeTab) => set({ activeTab }),

  overviewMetrics: null,
  fetchOverviewMetrics: async () => {
    try {
      const res = await fetch('/api/admin/overview');
      const data = await res.json();
      if (data.success && data.metrics) {
        set({ overviewMetrics: data.metrics });
      }
    } catch {}
  },

  applications: [],
  selectedApplication: null,
  applicationTypeFilter: 'all',
  applicationStatusFilter: 'all',
  applicationSearchQuery: '',

  setSelectedApplication: (selectedApplication) => set({ selectedApplication }),
  setApplicationTypeFilter: (applicationTypeFilter) => {
    set({ applicationTypeFilter });
    get().fetchApplications();
  },
  setApplicationStatusFilter: (applicationStatusFilter) => {
    set({ applicationStatusFilter });
    get().fetchApplications();
  },
  setApplicationSearchQuery: (applicationSearchQuery) => {
    set({ applicationSearchQuery });
    get().fetchApplications();
  },

  fetchApplications: async () => {
    try {
      const { applicationTypeFilter, applicationStatusFilter, applicationSearchQuery } = get();
      const params = new URLSearchParams();
      if (applicationTypeFilter !== 'all') params.set('type', applicationTypeFilter);
      if (applicationStatusFilter !== 'all') params.set('status', applicationStatusFilter);
      if (applicationSearchQuery.trim()) params.set('search', applicationSearchQuery.trim());

      const res = await fetch(`/api/admin/applications?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.applications)) {
        set({ applications: data.applications });
      }
    } catch {}
  },

  executeApplicationAction: async (params) => {
    try {
      const res = await fetch(`/api/admin/applications/${params.applicationId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh local data
        await get().fetchApplications();
        await get().fetchOverviewMetrics();
        await get().fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'İşlem başarısız oldu.' };
    } catch {
      return { success: false, message: 'Sunucuya bağlanılamadı.' };
    }
  },

  users: [],
  fetchUsers: async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        set({ users: data.users });
      }
    } catch {}
  },

  updateUserStatus: async (params) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchUsers();
        await get().fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'Kullanıcı güncellenemedi.' };
    } catch {
      return { success: false, message: 'Sunucuya bağlanılamadı.' };
    }
  },

  complaints: [],
  fetchComplaints: async () => {
    try {
      const res = await fetch('/api/admin/complaints');
      const data = await res.json();
      if (data.success && Array.isArray(data.complaints)) {
        set({ complaints: data.complaints });
      }
    } catch {}
  },

  resolveComplaint: async (params) => {
    try {
      const res = await fetch('/api/admin/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchComplaints();
        await get().fetchOverviewMetrics();
        await get().fetchAuditLogs();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'Şikayet güncellenemedi.' };
    } catch {
      return { success: false, message: 'Sunucuya bağlanılamadı.' };
    }
  },

  auditLogs: [],
  fetchAuditLogs: async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        set({ auditLogs: data.logs });
      }
    } catch {}
  },

  checkAdminAuth: async () => {
    set({ isCheckingAuth: true, authError: null });
    try {
      const res = await fetch('/api/admin/auth/check');
      const data = await res.json();
      if (data.success && data.isAdmin) {
        set({
          isAdmin: true,
          adminRole: data.role,
          adminDisplayName: data.displayName,
          isCheckingAuth: false,
          authError: null,
        });
        return true;
      } else {
        set({
          isAdmin: false,
          adminRole: null,
          adminDisplayName: '',
          isCheckingAuth: false,
          authError: data.error || 'Bu alana erişim yetkiniz bulunmuyor.',
        });
        return false;
      }
    } catch (e: any) {
      set({
        isAdmin: false,
        adminRole: null,
        adminDisplayName: '',
        isCheckingAuth: false,
        authError: 'Yetkilendirme sunucusuna bağlanılamadı.',
      });
      return false;
    }
  },
}));
