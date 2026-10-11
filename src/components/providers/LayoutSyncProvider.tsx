'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useHomescreenStore } from '@/stores/useHomescreenStore';

export function LayoutSyncProvider({ children }: { children: React.ReactNode }) {
  const userId = useAuthStore(state => state.user?.id);
  const fetchLayout = useHomescreenStore((state) => state.fetchLayout);

  useEffect(() => {
    if (userId) {
      fetchLayout();
    }
  }, [userId, fetchLayout]);

  return <>{children}</>;
}
