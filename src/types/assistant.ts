export type AssistantTaskType =
  | 'content'
  | 'planning'
  | 'family'
  | 'services'
  | 'finance'
  | 'research';

export type AssistantTaskStatus =
  | 'draft'
  | 'awaiting_input'
  | 'pending_approval'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AssistantPermissionScopeKey =
  | 'tasks'
  | 'calendar'
  | 'family'
  | 'services'
  | 'finance'
  | 'photos'
  | 'files';

export type AssistantPermissionLevel =
  | 'denied'
  | 'session_only'
  | 'ask_always'
  | 'allowed';

export type AssistantPermissionScope = AssistantPermissionScopeKey;

export const PERMISSION_SCOPE_LABELS: Record<AssistantPermissionScopeKey, string> = {
  tasks: 'LifeOS Görevleri',
  calendar: 'Takvim & Zaman Planı',
  family: 'Aile Alanı',
  services: 'Hizmet Talepleri',
  finance: 'Finans Özeti',
  photos: 'Fotoğraflar',
  files: 'Dosyalar',
};

export interface AssistantPermissionScopeInfo {
  key: AssistantPermissionScopeKey;
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  isSensitive: boolean;
  defaultLevel: AssistantPermissionLevel;
  iconName: string;
}

export const ASSISTANT_PERMISSION_SCOPES: Record<AssistantPermissionScopeKey, AssistantPermissionScopeInfo> = {
  tasks: {
    key: 'tasks',
    titleTr: 'LifeOS Görevleri',
    titleEn: 'LifeOS Tasks',
    descriptionTr: 'Görev listesini okuma, yeni görev ve hatırlatıcı planlama.',
    isSensitive: false,
    defaultLevel: 'ask_always',
    iconName: 'ListTodo',
  },
  calendar: {
    key: 'calendar',
    titleTr: 'Takvim & Zaman Planı',
    titleEn: 'Calendar & Schedule',
    descriptionTr: 'Günlük program ve zamanlama uygunluğunu inceleme.',
    isSensitive: false,
    defaultLevel: 'ask_always',
    iconName: 'Calendar',
  },
  family: {
    key: 'family',
    titleTr: 'Aile Alanı',
    titleEn: 'Family Space',
    descriptionTr: 'Aile bireyleri, ortak etkinlikler ve çocuk alanını okuma.',
    isSensitive: true,
    defaultLevel: 'denied',
    iconName: 'Users',
  },
  services: {
    key: 'services',
    titleTr: 'Hizmet Talepleri',
    titleEn: 'Service Requests',
    descriptionTr: 'Taksi, seyahat, nakliye ve usta taleplerinin durumunu sorgulama.',
    isSensitive: true,
    defaultLevel: 'denied',
    iconName: 'Briefcase',
  },
  finance: {
    key: 'finance',
    titleTr: 'Finans Özeti',
    titleEn: 'Finance Summary',
    descriptionTr: 'Harcama kategorileri ve bütçe limitlerini özetleme.',
    isSensitive: true,
    defaultLevel: 'denied',
    iconName: 'Wallet',
  },
  photos: {
    key: 'photos',
    titleTr: 'Fotoğraflar',
    titleEn: 'Photos',
    descriptionTr: 'Kullanıcının açıkça seçtiği fotoğrafları analiz etme.',
    isSensitive: true,
    defaultLevel: 'denied',
    iconName: 'Image',
  },
  files: {
    key: 'files',
    titleTr: 'Dosyalar',
    titleEn: 'Files',
    descriptionTr: 'Yalnızca kullanıcının işaret ettiği belgeleri okuma.',
    isSensitive: true,
    defaultLevel: 'denied',
    iconName: 'Folder',
  },
};

export interface DataAccessLog {
  id: string;
  timestamp: string;
  scope: AssistantPermissionScopeKey;
  actionName: string;
  reason: string;
  targetProvider: string;
  status: 'allowed' | 'denied' | 'revoked';
}

export type AssistantMessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface AssistantToolCall {
  id: string;
  name: string;
  labelTr: string;
  isWriteAction: boolean;
  requiredScope?: AssistantPermissionScopeKey;
  arguments: Record<string, any>;
  status: 'requires_permission' | 'requires_user_approval' | 'executed' | 'rejected';
  permissionReason?: string;
  result?: any;
}

export interface AssistantMessage {
  id: string;
  role: AssistantMessageRole;
  content: string;
  timestamp: string;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  error?: string;
  toolCalls?: AssistantToolCall[];
  attachedPhotoIds?: string[];
}

export interface AssistantConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AssistantMessage[];
  sessionGrantedScopes: AssistantPermissionScopeKey[];
}

export interface PhotoAnalysisItem {
  id: string;
  dataUrl?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  metadataStripped: boolean;
  analysisPurpose: string;
  targetAIProvider: string;
  approved: boolean;
  status: 'pending_consent' | 'ready_for_analysis' | 'analysed' | 'cancelled';
}

export interface AssistantTaskStep {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  details?: string;
}

export interface AssistantTaskLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface ContentSubtypeDetails {
  contentType?: 'video_short' | 'video_clip' | 'article' | 'social_post' | 'thumbnail_concept';
  targetPlatform?: 'youtube_shorts' | 'instagram_reels' | 'tiktok' | 'x' | 'blog';
  videoSpecs?: {
    autoCaptions?: boolean;
    cleanAudio?: boolean;
    aspect?: '9:16' | '16:9' | '1:1';
    targetDurationSec?: number;
  };
}

export interface AssistantTask {
  id: string;
  title: string;
  description: string;
  type: AssistantTaskType;
  status: AssistantTaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  requiredScopes: AssistantPermissionScopeKey[];
  grantedScopes: AssistantPermissionScopeKey[];
  requiresApproval: boolean;
  approvalRequestedAt?: string;
  approvedAt?: string;
  approvalDescription?: string;
  steps: AssistantTaskStep[];
  logs: AssistantTaskLog[];
  resultSummary?: string;
  contentDetails?: ContentSubtypeDetails;
}

export interface ParsedAssistantCommand {
  title: string;
  description: string;
  type: AssistantTaskType;
  requiresApproval: boolean;
  approvalDescription?: string;
  requiredScopes: AssistantPermissionScopeKey[];
  steps: { id: string; title: string; details?: string }[];
  contentDetails?: ContentSubtypeDetails;
}

export const ASSISTANT_TYPE_CONFIG: Record<
  AssistantTaskType,
  { titleTr: string; titleEn: string; iconName: string; colorClass: string; badgeColor: string }
> = {
  content: {
    titleTr: 'İçerik & Video',
    titleEn: 'Content & Video',
    iconName: 'Film',
    colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    badgeColor: 'rose',
  },
  planning: {
    titleTr: 'Planlama & Görev',
    titleEn: 'Planning & Task',
    iconName: 'CalendarCheck',
    colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    badgeColor: 'blue',
  },
  family: {
    titleTr: 'Aile & Ortak Yaşam',
    titleEn: 'Family & Shared Life',
    iconName: 'Users',
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    badgeColor: 'amber',
  },
  services: {
    titleTr: 'Hizmetler & Ulaşım',
    titleEn: 'Services & Travel',
    iconName: 'Briefcase',
    colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    badgeColor: 'emerald',
  },
  finance: {
    titleTr: 'Finans & Bütçe',
    titleEn: 'Finance & Budget',
    iconName: 'Wallet',
    colorClass: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    badgeColor: 'teal',
  },
  research: {
    titleTr: 'Araştırma & Özet',
    titleEn: 'Research & Summary',
    iconName: 'Search',
    colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    badgeColor: 'purple',
  },
};
