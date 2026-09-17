import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FinancialSecurityConfig } from '@/types/finance';

interface FinanceState {
  securityConfig: FinancialSecurityConfig;
  setPrivacyMode: (active: boolean) => void;
  setBiometricRequired: (required: boolean) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      securityConfig: {
        isBiometricRequired: false,
        isPrivacyModeActive: true,
        dataEncryption: 'e2ee',
      },

      setPrivacyMode: (isPrivacyModeActive) =>
        set((state) => ({
          securityConfig: { ...state.securityConfig, isPrivacyModeActive },
        })),

      setBiometricRequired: (isBiometricRequired) =>
        set((state) => ({
          securityConfig: { ...state.securityConfig, isBiometricRequired },
        })),
    }),
    {
      name: 'lifeos-finance',
    }
  )
);
