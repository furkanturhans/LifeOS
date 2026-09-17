'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Crown, UserPlus } from 'lucide-react';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { FAMILY_ROLES } from '@/types/family';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface FamilyMembersListProps {
  onOpenInvite: () => void;
  onOpenCreate: () => void;
}

export function FamilyMembersList({ onOpenInvite, onOpenCreate }: FamilyMembersListProps) {
  const { family } = useFamilyStore();

  if (!family) {
    return (
      <div className="mx-4 mt-4 rounded-3xl border border-dashed border-amber-500/30 bg-amber-500/5 p-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl">
          👨‍👩‍👧‍👦
        </div>
        <h3 className="text-base font-bold text-foreground">Henüz Bir Aile Grubu Yok</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Aile bireylerini tek bir güvenli dijital çatı altında toplamak için aileni hemen oluştur.
        </p>
        <button
          onClick={onOpenCreate}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Aileni Oluştur
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between px-6 pb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Aile Bireyleri
          </h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {family.members.length}
          </span>
        </div>
        <button
          onClick={onOpenInvite}
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 hover:text-amber-600 transition-colors"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Üye Ekle</span>
        </button>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
        {family.members.map((member, index) => {
          const roleDef = FAMILY_ROLES.find((r) => r.id === member.role);
          const roleLabel = roleDef ? roleDef.labelTr : member.role;

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="relative flex w-28 flex-shrink-0 flex-col items-center rounded-2xl border border-border/80 bg-card p-3.5 text-center shadow-sm transition-all hover:border-amber-500/40"
            >
              {/* Admin crown */}
              {member.isAdmin && (
                <div
                  className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/10 text-amber-500"
                  title="Yönetici"
                >
                  <Crown className="h-2.5 w-2.5" />
                </div>
              )}

              {/* Avatar Emoji Container */}
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-sm',
                  `bg-gradient-to-br ${member.avatarBg || 'from-amber-400 to-orange-500'}`
                )}
              >
                {member.avatarEmoji || roleDef?.icon || '👤'}
              </div>

              {/* Member Name */}
              <div className="mt-2 text-xs font-bold text-foreground truncate w-full">
                {member.name}
              </div>

              {/* Role Badge */}
              <div className="mt-1">
                <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground truncate max-w-[84px]">
                  {roleLabel}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Invite Member Quick Card */}
        <motion.button
          onClick={onOpenInvite}
          whileTap={{ scale: 0.95 }}
          className="flex w-24 flex-shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-3.5 text-center transition-all hover:bg-amber-500/10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
            <Plus className="h-6 w-6" />
          </div>
          <span className="mt-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            Davet Et
          </span>
        </motion.button>
      </div>
    </div>
  );
}
