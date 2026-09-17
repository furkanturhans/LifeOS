'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, AtSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { generateLifeOSId, cleanLifeOSId, formatLifeOSId, setSessionCookie } from '@/lib/utils';

const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(2, 'İsim en az 2 karakter olmalıdır')
      .max(50, 'İsim en fazla 50 karakter olabilir'),
    lifeosId: z
      .string()
      .min(3, 'LifeOS ID en az 3 karakter olmalıdır')
      .max(20, 'LifeOS ID en fazla 20 karakter olabilir')
      .regex(/^[a-zA-Z0-9_@]+$/, 'Sadece harf, rakam ve _ kullanılabilir'),
    email: z.string().email('Geçerli bir e-posta adresi girin'),
    password: z
      .string()
      .min(6, 'Şifre en az 6 karakter olmalıdır'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const displayName = watch('displayName', '');
  const rawLifeosId = watch('lifeosId', '');

  function handleNameBlur() {
    const currentId = watch('lifeosId');
    if (displayName && !currentId) {
      setValue('lifeosId', generateLifeOSId(displayName));
    }
  }

  async function onSubmit(data: RegisterFormData) {
    setError(null);
    const cleanedUsername = cleanLifeOSId(data.lifeosId);

    if (!cleanedUsername || cleanedUsername.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalıdır.');
      return;
    }

    try {
      // 1. Register with Database API to save user and verify uniqueness
      let dbUser: any = null;
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            displayName: data.displayName.trim(),
            lifeosId: cleanedUsername,
          }),
        });

        const resData = await res.json();
        if (!res.ok) {
          setError(resData.error || 'Kayıt başarısız oldu.');
          return;
        }
        dbUser = resData.user;
      } catch (err) {
        console.warn('DB register API fallback:', err);
      }

      // 2. Register in Supabase if configured
      let supabaseUserId = dbUser?.id || `sb_${Date.now()}`;
      try {
        const supabase = createClient();
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              display_name: data.displayName.trim(),
              lifeos_id: cleanedUsername,
            },
          },
        });

        if (signUpError && !signUpError.message.includes('fetch failed') && !signUpError.message.includes('placeholder')) {
          if (signUpError.message.includes('already registered')) {
            setError('Bu e-posta adresi zaten kullanılıyor.');
            return;
          }
        }
        if (authData?.user) {
          supabaseUserId = authData.user.id;
        }
      } catch (sbErr) {
        console.warn('Supabase signup fallback:', sbErr);
      }

      // 3. Set local auth session
      const finalSupabaseUserId = supabaseUserId;
      setUser({
        id: dbUser?.id || finalSupabaseUserId,
        supabaseId: finalSupabaseUserId,
        lifeosId: cleanedUsername,
        email: data.email,
        displayName: data.displayName.trim(),
        avatarUrl: null,
        bio: null,
        locale: 'tr',
        theme: 'dark',
        backgroundType: 'default',
        backgroundValue: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setSessionCookie(finalSupabaseUserId);

      router.push('/home');
      router.refresh();
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Kayıt işlemi sırasında bir hata oluştu.');
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">LifeOS&apos;a Katıl</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Kişisel dijital yaşam alanını oluştur</p>
        </div>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="rounded-3xl border border-border bg-card p-6 shadow-sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register('displayName')}
            onBlur={handleNameBlur}
            label="Ad Soyad"
            type="text"
            placeholder="Furkan Yılmaz"
            autoComplete="name"
            icon={<User className="h-4 w-4" />}
            error={errors.displayName?.message}
          />

          <div>
            <Input
              {...register('lifeosId')}
              label="LifeOS ID (Kullanıcı Adı)"
              type="text"
              placeholder="furkan"
              autoComplete="username"
              autoCapitalize="off"
              icon={<AtSign className="h-4 w-4" />}
              error={errors.lifeosId?.message}
            />
            {rawLifeosId && (
              <p className="text-[11px] text-muted-foreground mt-1 px-1">
                Kullanılacak kimlik: <span className="font-semibold text-primary">{formatLifeOSId(rawLifeosId)}</span>
              </p>
            )}
          </div>

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
            autoComplete="new-password"
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

          <Input
            {...register('confirmPassword')}
            label="Şifre Tekrarı"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            icon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.confirmPassword?.message}
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
            Hesap Oluştur
          </Button>
        </form>
      </motion.div>

      <p className="text-center text-sm text-muted-foreground">
        Zaten hesabın var mı?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
          Giriş yap
        </Link>
      </p>
    </motion.div>
  );
}
