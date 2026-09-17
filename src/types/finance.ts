export type FinanceSectionKey =
  | 'overview'
  | 'expenses'
  | 'budget'
  | 'goals'
  | 'subscriptions';

export interface FinanceSectionItem {
  id: FinanceSectionKey;
  titleTr: string;
  titleEn: string;
  taglineTr: string;
  taglineEn: string;
  iconName: string;
  gradient: string;
  accentColor: string;
  isLocked: boolean;
}

export type AccountType = 'bank' | 'cash' | 'credit_card' | 'investment' | 'crypto' | 'other';

export type ExpenseCategory =
  | 'food'
  | 'housing'
  | 'transport'
  | 'entertainment'
  | 'health'
  | 'shopping'
  | 'education'
  | 'bills'
  | 'other';

export interface FinancialSecurityConfig {
  isBiometricRequired: boolean;
  isPrivacyModeActive: boolean; // hide balances
  dataEncryption: 'local' | 'e2ee';
}
