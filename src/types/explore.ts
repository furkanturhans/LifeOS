export type ExploreSectionKey =
  | 'for_you'
  | 'communities'
  | 'family_feed'
  | 'popular';

export interface ExploreSectionItem {
  id: ExploreSectionKey;
  titleTr: string;
  titleEn: string;
  taglineTr: string;
  taglineEn: string;
  iconName: string;
  gradient: string;
  isLocked: boolean;
}

export type VisibilityScope = 'family_only' | 'friends' | 'public' | 'private';

export interface ExplorePrivacySettings {
  defaultVisibility: VisibilityScope;
  familySafeMode: boolean; // Content filtering for kids/family
  allowCommunityInvites: boolean;
  hideActivityStatus: boolean;
}

export interface CommunityMetadata {
  id: string;
  name: string;
  topic: string;
  iconEmoji: string;
  isFamilyFriendly: boolean;
}
