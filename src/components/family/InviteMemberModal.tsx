'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Copy, Check, Share2 } from 'lucide-react';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { FAMILY_ROLES, type FamilyRole } from '@/types/family';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode?: string;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  inviteCode = 'LIFEOS-FAM-7482',
}: InviteMemberModalProps) {
  const { inviteMember } = useFamilyStore();
  const [memberName, setMemberName] = useState('');
  const [selectedRole, setSelectedRole] = useState<FamilyRole>('child');
  const [isCopied, setIsCopied] = useState(false);

  function handleCopy() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteCode);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!memberName.trim()) return;
    inviteMember(memberName, selectedRole);
    setMemberName('');
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl shadow-lg shadow-amber-500/20 text-white">
                <UserPlus className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Aile Üyesi Davet Et</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Aile kodunu paylaş veya yeni bir aile ferdi tanımla.
              </p>
            </div>

            {/* Invite Code Box */}
            <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 dark:text-amber-400">
                    Özel Aile Davet Kodu
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold tracking-wider text-foreground">
                    {inviteCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md transition-all hover:bg-amber-600 active:scale-95"
                  title="Kodu Kopyala"
                >
                  {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
              {isCopied && (
                <div className="mt-2 text-center text-xs font-medium text-emerald-500">
                  ✓ Davet kodu panoya kopyalandı!
                </div>
              )}
            </div>

            {/* Add Member Form */}
            <form onSubmit={handleAddMember} className="space-y-4">
              <Input
                label="Üye Adı Soyadı"
                placeholder="Örn: Can, Ayşe Hanım..."
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                required
              />

              {/* Role Selection */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Üyenin Rolü
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FAMILY_ROLES.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={cn(
                        'flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition-all',
                        selectedRole === role.id
                          ? 'border-amber-500 bg-amber-500/10 text-foreground ring-1 ring-amber-500'
                          : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                      )}
                    >
                      <span className="text-xl">{role.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate text-foreground">
                          {role.labelTr}
                        </div>
                      </div>
                      {selectedRole === role.id && (
                        <Check className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-700"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Üyeyi Aileye Ekle
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
