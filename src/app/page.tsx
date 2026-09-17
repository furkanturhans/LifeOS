import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasUser = !!user;
  if (!hasUser) {
    const cookieStore = await cookies();
    hasUser = !!cookieStore.get('lifeos_session')?.value;
  }

  if (hasUser) {
    redirect('/home');
  } else {
    redirect('/login');
  }
}
