import type { Metadata } from 'next';
import { AdminLayout } from '@/components/admin/AdminLayout';

export const metadata: Metadata = {
  title: 'LifeOS — Yönetim Paneli',
  description: 'LifeOS Güvenli Sistem ve Başvuru Yönetim Merkezi',
};

export default function AdminPage() {
  return <AdminLayout />;
}
