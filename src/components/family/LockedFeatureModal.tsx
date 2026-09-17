'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LockedFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  featureIcon?: React.ReactNode;
}

export function LockedFeatureModal({
  isOpen,
  onClose,
  featureTitle = 'Bu Bölüm',
  featureIcon,
}: LockedFeatureModalProps) {
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
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-card/95 p-6 text-center shadow-2xl backdrop-blur-xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Glowing Icon Container */}
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-4xl shadow-inner ring-1 ring-amber-500/30">
              {featureIcon || <Sparkles className="h-8 w-8 text-amber-500" />}
            </div>

            {/* Pill Badge */}
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-500 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{featureTitle} — Geliştirme Aşamasında</span>
            </div>

            {/* Requested Exact Message */}
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              {featureTitle}
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              “Çok yakında sizlerle. Biraz daha zamana ihtiyacımız var; beklettiğimiz için üzgünüz.”
            </p>

            {/* Action */}
            <div className="mt-6">
              <Button
                onClick={onClose}
                size="lg"
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-700"
              >
                Anladım
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
