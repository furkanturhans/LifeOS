'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Home } from 'lucide-react';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { FAMILY_ROLES, type FamilyRole } from '@/types/family';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface CreateFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAMILY_EMOJIS = ['🏡', '👨‍👩‍👧‍👦', '❤️', '🌟', '🏰', '🌱', '🛡️', '☀️'];

export function CreateFamilyModal({ isOpen, onClose }: CreateFamilyModalProps) {
  const { user } = useAuthStore();
  const { createFamily } = useFamilyStore();

  const [familyName, setFamilyName] = useState('Bizim Aile');
  const [userName, setUserName] = useState(user?.displayName || 'Ben');
  const [selectedRole, setSelectedRole] = useState<FamilyRole>('mother');
  const [selectedEmoji, setSelectedEmoji] = useState('🏡');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createFamily(familyName, userName, selectedRole, selectedEmoji);
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
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl shadow-lg shadow-amber-500/20">
                {selectedEmoji}
              </div>
              <h3 className="text-xl font-bold text-foreground">Yeni Aile Oluştur</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Aileni bir araya getir, anılarını ve planlarını paylaş.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Emoji Selector */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Aile Simgesi
                </label>
                <div className="flex justify-between gap-2 overflow-x-auto pb-1">
                  {FAMILY_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={cn(
                        'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl transition-all',
                        selectedEmoji === emoji
                          ? 'bg-amber-500/20 ring-2 ring-amber-500 scale-105'
                          : 'bg-muted/50 hover:bg-muted'
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Family Name */}
              <Input
                label="Aile Adı"
                placeholder="Örn: Yılmaz Ailesi"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                icon={<Home className="h-4 w-4 text-muted-foreground" />}
                required
              />

              {/* Creator Name */}
              <Input
                label="Senin İsmin"
                placeholder="Adın veya lakabın"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />

              {/* Role Selection */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ailedaki Rolün
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
                        <div className="text-[10px] text-muted-foreground truncate">
                          {role.descriptionTr}
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
                  <Sparkles className="mr-2 h-4 w-4" />
                  Aileni Başlat
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
