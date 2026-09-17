'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, X, AlertTriangle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useKidsStore } from '@/stores/useKidsStore';
import { cn } from '@/lib/utils';

interface ParentPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function ParentPinModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Ebeveyn Doğrulaması',
  description = 'Kids alanından çıkmak veya ayarları düzenlemek için 4 haneli PIN kodunuzu girin.',
}: ParentPinModalProps) {
  const { verifyPin, lockoutUntil } = useKidsStore();
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutUntil) {
      setRemainingTime(null);
      return;
    }
    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= lockoutUntil) {
        setRemainingTime(null);
        setErrorMessage('');
      } else {
        setRemainingTime(Math.ceil((lockoutUntil - now) / 1000));
      }
    }, 500);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleDigit = (digit: string) => {
    if (pin.length < 4 && !remainingTime) {
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMessage('');

      if (newPin.length === 4) {
        // Auto verify
        const res = verifyPin(newPin);
        if (res.success) {
          setPin('');
          setErrorMessage('');
          onSuccess();
          onClose();
        } else {
          setPin('');
          setErrorMessage(res.error || 'Hatalı PIN!');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} size="sm">
      <div className="py-3 flex flex-col items-center select-none space-y-4">
        {/* Lock Icon */}
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs">
          <KeyRound className="h-6 w-6" />
        </div>

        {/* 4-digit Pin Dots */}
        <div className="flex items-center gap-3">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={cn(
                  'w-4 h-4 rounded-full border-2 transition-all duration-200',
                  isFilled
                    ? 'bg-primary border-primary scale-110 shadow-xs'
                    : 'border-muted-foreground/40 bg-muted/20'
                )}
              />
            );
          })}
        </div>

        {/* Error / Lockout Message */}
        {errorMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive text-center">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {remainingTime && (
          <div className="text-xs font-bold text-destructive">
            Güvenlik kilidi: {remainingTime} saniye
          </div>
        )}

        {/* Number Keypad */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              disabled={Boolean(remainingTime)}
              onClick={() => handleDigit(num.toString())}
              className="h-12 rounded-2xl bg-card border border-border/80 hover:bg-muted font-bold text-lg text-foreground transition-all active:scale-95 disabled:opacity-40 shadow-2xs flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            disabled={Boolean(remainingTime)}
            onClick={handleClear}
            className="h-12 rounded-2xl bg-card border border-border/80 hover:bg-muted font-bold text-xs text-muted-foreground transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center"
          >
            Temizle
          </button>
          <button
            disabled={Boolean(remainingTime)}
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-card border border-border/80 hover:bg-muted font-bold text-lg text-foreground transition-all active:scale-95 disabled:opacity-40 shadow-2xs flex items-center justify-center"
          >
            0
          </button>
          <button
            disabled={Boolean(remainingTime)}
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-card border border-border/80 hover:bg-muted font-bold text-xs text-muted-foreground transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        {/* Demo Hint */}
        <p className="text-[11px] text-muted-foreground/60 text-center pt-1">
          Varsayılan Ebeveyn PIN: <span className="font-mono font-bold text-foreground">2026</span>
        </p>
      </div>
    </Modal>
  );
}
