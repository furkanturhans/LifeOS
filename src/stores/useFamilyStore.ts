import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FamilyUnit, FamilyMember, FamilyRole } from '@/types/family';

interface FamilyState {
  family: FamilyUnit | null;
  isLoading: boolean;
  createFamily: (name: string, myName: string, myRole: FamilyRole, avatarEmoji?: string) => void;
  inviteMember: (name: string, role: FamilyRole, avatarEmoji?: string) => void;
  removeMember: (memberId: string) => void;
  loadSampleFamily: () => void;
  resetFamily: () => void;
}

const SAMPLE_FAMILY: FamilyUnit = {
  id: 'fam_sample_01',
  name: 'Bizim Aile',
  avatarEmoji: '🏡',
  inviteCode: 'LIFEOS-FAM-7482',
  createdAt: new Date().toISOString(),
  createdBy: 'mem_01',
  members: [
    {
      id: 'mem_01',
      name: 'Sen',
      role: 'father',
      avatarEmoji: '👨',
      avatarBg: 'from-blue-500 to-indigo-600',
      isCurrentUser: true,
      isAdmin: true,
      joinedAt: new Date().toISOString(),
      status: 'active',
    },
    {
      id: 'mem_02',
      name: 'Ayşe',
      role: 'mother',
      avatarEmoji: '👩',
      avatarBg: 'from-pink-500 to-rose-600',
      isCurrentUser: false,
      isAdmin: true,
      joinedAt: new Date().toISOString(),
      status: 'active',
    },
    {
      id: 'mem_03',
      name: 'Can',
      role: 'child',
      avatarEmoji: '🧒',
      avatarBg: 'from-amber-400 to-orange-500',
      isCurrentUser: false,
      isAdmin: false,
      joinedAt: new Date().toISOString(),
      status: 'active',
    },
    {
      id: 'mem_04',
      name: 'Fatma Hanım',
      role: 'grandmother',
      avatarEmoji: '👵',
      avatarBg: 'from-purple-400 to-violet-600',
      isCurrentUser: false,
      isAdmin: false,
      joinedAt: new Date().toISOString(),
      status: 'active',
    },
  ],
};

function generateInviteCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `FAM-${num}`;
}

const ROLE_EMOJIS: Record<FamilyRole, string> = {
  mother: '👩',
  father: '👨',
  child: '🧒',
  grandfather: '👴',
  grandmother: '👵',
  sibling: '🧑',
  spouse: '💍',
  other: '👤',
};

const ROLE_GRADIENTS: Record<FamilyRole, string> = {
  mother: 'from-pink-500 to-rose-600',
  father: 'from-blue-500 to-indigo-600',
  child: 'from-amber-400 to-orange-500',
  grandfather: 'from-emerald-500 to-teal-600',
  grandmother: 'from-purple-400 to-violet-600',
  sibling: 'from-cyan-400 to-blue-500',
  spouse: 'from-red-400 to-pink-500',
  other: 'from-stone-400 to-gray-600',
};

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      family: SAMPLE_FAMILY,
      isLoading: false,

      createFamily: (name, myName, myRole, avatarEmoji = '🏡') => {
        const creatorMember: FamilyMember = {
          id: `mem_${Date.now()}_me`,
          name: myName || 'Ben',
          role: myRole,
          avatarEmoji: ROLE_EMOJIS[myRole] || '👤',
          avatarBg: ROLE_GRADIENTS[myRole] || 'from-indigo-500 to-purple-600',
          isCurrentUser: true,
          isAdmin: true,
          joinedAt: new Date().toISOString(),
          status: 'active',
        };

        const newFamily: FamilyUnit = {
          id: `fam_${Date.now()}`,
          name: name.trim() || 'Yeni Ailemiz',
          avatarEmoji,
          inviteCode: generateInviteCode(),
          createdAt: new Date().toISOString(),
          createdBy: creatorMember.id,
          members: [creatorMember],
        };

        set({ family: newFamily });
      },

      inviteMember: (name, role, customEmoji) => {
        const currentFamily = get().family;
        if (!currentFamily) return;

        const newMember: FamilyMember = {
          id: `mem_${Date.now()}`,
          name: name.trim() || 'Yeni Üye',
          role,
          avatarEmoji: customEmoji || ROLE_EMOJIS[role] || '👤',
          avatarBg: ROLE_GRADIENTS[role] || 'from-blue-400 to-indigo-600',
          isCurrentUser: false,
          isAdmin: false,
          joinedAt: new Date().toISOString(),
          status: 'active',
        };

        set({
          family: {
            ...currentFamily,
            members: [...currentFamily.members, newMember],
          },
        });
      },

      removeMember: (memberId) => {
        const currentFamily = get().family;
        if (!currentFamily) return;

        set({
          family: {
            ...currentFamily,
            members: currentFamily.members.filter((m) => m.id !== memberId),
          },
        });
      },

      loadSampleFamily: () => {
        set({ family: SAMPLE_FAMILY });
      },

      resetFamily: () => {
        set({ family: null });
      },
    }),
    {
      name: 'lifeos-family',
    }
  )
);
