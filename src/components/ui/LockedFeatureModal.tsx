'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface LockedFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  moduleName?: string;
}

export function LockedFeatureModal({
  isOpen,
  onClose,
  title,
  description,
  moduleName,
}: LockedFeatureModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center py-2">
        <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted/50 text-foreground">
          <Sparkles className="h-6 w-6 text-primary stroke-[1.75]" />
        </div>

        {moduleName && (
          <span className="inline-block px-2.5 py-0.5 mb-1.5 rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
            {moduleName}
          </span>
        )}

        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>

        <div className="mt-6">
          <Button onClick={onClose} variant="secondary" size="md" className="w-full">
            Anladım
          </Button>
        </div>
      </div>
    </Modal>
  );
}
