export type FamilyRole =
  | 'mother'
  | 'father'
  | 'child'
  | 'grandfather'
  | 'grandmother'
  | 'sibling'
  | 'spouse'
  | 'other';

export interface FamilyRoleDefinition {
  id: FamilyRole;
  labelTr: string;
  labelEn: string;
  icon: string;
  descriptionTr: string;
  descriptionEn: string;
}

export const FAMILY_ROLES: FamilyRoleDefinition[] = [
  {
    id: 'mother',
    labelTr: 'Anne',
    labelEn: 'Mother',
    icon: '👩',
    descriptionTr: 'Aile yöneticisi & ebeveyn',
    descriptionEn: 'Family manager & parent',
  },
  {
    id: 'father',
    labelTr: 'Baba',
    labelEn: 'Father',
    icon: '👨',
    descriptionTr: 'Aile yöneticisi & ebeveyn',
    descriptionEn: 'Family manager & parent',
  },
  {
    id: 'child',
    labelTr: 'Çocuk',
    labelEn: 'Child',
    icon: '🧒',
    descriptionTr: 'Aile üyesi',
    descriptionEn: 'Family member',
  },
  {
    id: 'grandfather',
    labelTr: 'Dede',
    labelEn: 'Grandfather',
    icon: '👴',
    descriptionTr: 'Büyükbaba / Aile büyüğü',
    descriptionEn: 'Grandfather / Family elder',
  },
  {
    id: 'grandmother',
    labelTr: 'Babaanne / Anneanne',
    labelEn: 'Grandmother',
    icon: '👵',
    descriptionTr: 'Büyükanne / Aile büyüğü',
    descriptionEn: 'Grandmother / Family elder',
  },
  {
    id: 'sibling',
    labelTr: 'Kardeş',
    labelEn: 'Sibling',
    icon: '🧑',
    descriptionTr: 'Kardeş / Aile üyesi',
    descriptionEn: 'Sibling / Family member',
  },
  {
    id: 'spouse',
    labelTr: 'Eş',
    labelEn: 'Spouse',
    icon: '💍',
    descriptionTr: 'Hayat arkadaşı',
    descriptionEn: 'Life partner',
  },
  {
    id: 'other',
    labelTr: 'Diğer',
    labelEn: 'Other',
    icon: '👤',
    descriptionTr: 'Aile yakını / Akraba',
    descriptionEn: 'Relative / Close member',
  },
];

export interface FamilyMember {
  id: string;
  name: string;
  role: FamilyRole;
  customRoleTitle?: string;
  avatarEmoji?: string;
  avatarUrl?: string | null;
  avatarBg?: string;
  isCurrentUser?: boolean;
  isAdmin?: boolean;
  joinedAt: string;
  status: 'active' | 'pending';
}

export interface FamilyUnit {
  id: string;
  name: string;
  avatarEmoji: string;
  inviteCode: string;
  createdAt: string;
  createdBy: string;
  members: FamilyMember[];
}

export type FamilyFeatureKey = 'shared_space' | 'memories' | 'calendar' | 'notes';

export interface FamilyFeatureItem {
  id: FamilyFeatureKey;
  nameTr: string;
  nameEn: string;
  taglineTr: string;
  taglineEn: string;
  iconName: string;
  gradient: string;
  badgeTr: string;
  badgeEn: string;
  isLocked: boolean;
}
