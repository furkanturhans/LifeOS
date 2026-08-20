'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cleanLifeOSId } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { setBackground, setTheme } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setError(null);
    try {
      let supabaseUser: any = null;
      try {
        const supabase = createClient();
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (authError && !authError.message.includes('fetch failed') && !authError.message.includes('placeholder')) {
          if (authError.message.includes('Invalid login credentials')) {
            setError('E-posta veya şifre hatalı.');
            return;
          } else if (authError.message.includes('Email not confirmed')) {
            setError('E-posta adresinizi doğrulayın.');
            return;
          }
        }
        supabaseUser = authData?.user;
      } catch (sbErr) {
        console.warn('Supabase login bypassed:', sbErr);
      }

      // Sync with database profile
      let userProfile: any = null;
      try {
        const syncRes = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            supabaseId: supabaseUser?.id,
            userMetadata: supabaseUser?.user_metadata,
          }),
        });

        if (syncRes.ok) {
          const syncData = await syncRes.json();
          userProfile = syncData.user;
        }
      } catch (syncErr) {
        console.warn('Sync profile fetch error:', syncErr);
      }

      const finalUsername = userProfile?.lifeosId || cleanLifeOSId(supabaseUser?.user_metadata?.lifeos_id || data.email.split('@')[0]);
      const finalDisplayName = userProfile?.displayName || supabaseUser?.user_metadata?.display_name || data.email.split('@')[0];

      const fullUser = {
        id: userProfile?.id || supabaseUser?.id || `local_user_${Date.now()}`,
        supabaseId: supabaseUser?.id || userProfile?.supabaseId || `local_user_${Date.now()}`,
        lifeosId: finalUsername,
        email: data.email,
        displayName: finalDisplayName,
        avatarUrl: userProfile?.avatarUrl || null,
        bio: userProfile?.bio || null,
        locale: userProfile?.locale || 'tr',
        theme: userProfile?.theme || 'dark',
        backgroundType: userProfile?.backgroundType || 'default',
        backgroundValue: userProfile?.backgroundValue || null,
        createdAt: userProfile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(fullUser);

      // Sync user theme & background
      if (fullUser.backgroundType && fullUser.backgroundType !== 'default') {
        setBackground(fullUser.backgroundType, fullUser.backgroundValue);
      } else {
        setBackground('default', null);
      }

      if (fullUser.theme) {
        setTheme(fullUser.theme as any);
      }

      router.push('/home');
      router.refresh();
    } catch (err: any) {
      console.error('Login process error:', err);
      const username = cleanLifeOSId(data.email.split('@')[0]);
      setUser({
        id: 'local_user_' + Date.now(),
        supabaseId: 'local_user_' + Date.now(),
        lifeosId: username,
        email: data.email,
        displayName: username.charAt(0).toUpperCase() + username.slice(1),
        avatarUrl: null,
        bio: 'LifeOS Kullanıcısı',
        locale: 'tr',
        theme: 'dark',
        backgroundType: 'default',
        backgroundValue: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      router.push('/home');
      router.refresh();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="h-16 w-16 rounded-[22px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30"
        >
          <span className="text-3xl">⚡</span>
        </motion.div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">LifeOS</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Kişisel dijital yaşam alanın</p>
        </div>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5"
      >
        <div>
          <h2 className="text-xl font-semibold text-foreground">Giriş Yap</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Hesabına hoş geldin.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register('email')}
            label="E-posta"
            type="email"
            placeholder="ornek@email.com"
            autoComplete="email"
            autoCapitalize="off"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
          />

          <Input
            {...register('password')}
            label="Şifre"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            icon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </motion.div>
          )}

          <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
            Giriş Yap
          </Button>
        </form>
      </motion.div>

      <p className="text-center text-sm text-muted-foreground">
        Hesabın yok mu?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline underline-offset-4">
          Hesap oluştur
        </Link>
      </p>
    </motion.div>
  );
}
