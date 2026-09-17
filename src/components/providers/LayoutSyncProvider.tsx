'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useHomescreenStore } from '@/stores/useHomescreenStore';

export function LayoutSyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const fetchLayout = useHomescreenStore((state) => state.fetchLayout);

  useEffect(() => {
    if (user) {
      fetchLayout();
    }
  }, [user, fetchLayout]);

  return <>{children}</>;
}
