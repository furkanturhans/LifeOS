import type { Metadata } from 'next';
import { FinanceScreen } from '@/components/finance/FinanceScreen';

export const metadata: Metadata = {
  title: 'Finans — LifeOS',
  description: 'LifeOS Finans Alanı — Finansal hayatını yönet',
};

export default function FinancePage() {
  return <FinanceScreen />;
}
