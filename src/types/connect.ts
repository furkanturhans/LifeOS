export type ConnectScope = 'personal' | 'family' | 'education' | 'services';

export type UserRole = 'user' | 'guardian' | 'child' | 'instructor' | 'service_provider' | 'admin';

export interface ConnectUser {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  badge?: string;
  isOnline?: boolean;
  isChild?: boolean;
  canDirectMessage?: boolean;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'file' | 'audio' | 'video' | 'link';
  url: string;
  size?: string;
}

export type ActionTransformType = 'task' | 'calendar_event' | 'course_note' | 'service_request';

export interface ActionTransformPayload {
  type: ActionTransformType;
  title: string;
  description: string;
  dueDate?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  createdAt: string;
  replyToId?: string;
  replyToPreview?: {
    id: string;
    senderName: string;
    content: string;
  };
  reactions: MessageReaction[];
  isPinned?: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: MessageAttachment[];
  transformedAction?: ActionTransformPayload;
}

export interface PersonalScopeMeta {
  type: 'personal';
  contactId: string;
  permissionStatus: 'accepted' | 'pending' | 'blocked';
}

export interface FamilyScopeMeta {
  type: 'family';
  familyGroupId: string;
  roomName: string;
  isSharedRoom: boolean;
}

export interface EducationScopeMeta {
  type: 'education';
  courseId: string;
  courseTitle: string;
  topicTitle?: string;
  isQnaChannel?: boolean;
  instructorName: string;
}

export interface ServicesScopeMeta {
  type: 'services';
  serviceType: 'taxi' | 'moving' | 'craftsman' | 'travel';
  serviceBookingId: string;
  serviceTitle: string;
  serviceStatus: 'active' | 'in_progress' | 'completed' | 'archived';
  providerName: string;
}

export type ScopeMeta =
  | PersonalScopeMeta
  | FamilyScopeMeta
  | EducationScopeMeta
  | ServicesScopeMeta;

export interface Conversation {
  id: string;
  title: string;
  scope: ConnectScope;
  scopeMeta: ScopeMeta;
  participants: ConnectUser[];
  lastMessage?: Message;
  unreadCount: number;
  isMuted: boolean;
  isArchived: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CallType = 'audio' | 'video';

export type CallStatus =
  | 'idle'
  | 'calling'
  | 'ringing'
  | 'connected'
  | 'rejected'
  | 'missed'
  | 'ended';

export interface CallSession {
  id: string;
  conversationId: string;
  callerId: string;
  callerName: string;
  callerRole: UserRole;
  targetUserIds: string[];
  type: CallType;
  status: CallStatus;
  startedAt: string;
  endedAt?: string;
  roomName: string;
  durationSeconds?: number;
}

export interface LiveKitTokenResponse {
  configured: boolean;
  token?: string;
  url?: string;
  roomName?: string;
  participantIdentity?: string;
  participantName?: string;
  message?: string;
}

export interface ConnectUserPrivacySettings {
  showOnlineStatus: boolean;
  sendReadReceipts: boolean;
  allowIncomingCalls: boolean;
  blockDirectMessages: boolean;
}
