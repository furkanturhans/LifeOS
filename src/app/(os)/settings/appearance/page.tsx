'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Image as ImageIcon, Palette, Upload, Trash2, Sparkles } from 'lucide-react';
import { Dock } from '@/components/os/Dock';
import { useThemeStore } from '@/stores/useThemeStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { ThemePreference, BackgroundType } from '@/types/user';

interface ThemeOptionProps {
  value: ThemePreference;
  label: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  preview: 'light' | 'dark' | 'auto';
}

function ThemeOption({ value, label, description, isSelected, onSelect, preview }: ThemeOptionProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={cn(
        'flex items-center gap-4 w-full p-4 rounded-2xl border-2 transition-all text-left',
        isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/50'
      )}
    >
      {/* Preview */}
      <div className="h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden border border-border">
        {preview === 'light' && (
          <div className="h-full w-full bg-white flex flex-col p-1 gap-0.5">
            <div className="h-1.5 w-6 rounded-full bg-gray-200" />
            <div className="h-1 w-4 rounded-full bg-gray-100" />
            <div className="h-4 w-full rounded bg-gray-50 mt-auto" />
          </div>
        )}
        {preview === 'dark' && (
          <div className="h-full w-full bg-[#0a0f1e] flex flex-col p-1 gap-0.5">
            <div className="h-1.5 w-6 rounded-full bg-gray-700" />
            <div className="h-1 w-4 rounded-full bg-gray-800" />
            <div className="h-4 w-full rounded bg-gray-900 mt-auto" />
          </div>
        )}
        {preview === 'auto' && (
          <div className="h-full w-full flex">
            <div className="w-1/2 bg-white" />
            <div className="w-1/2 bg-[#0a0f1e]" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
      {isSelected && (
        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Check className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      )}
    </motion.button>
  );
}

const SOLID_COLORS = [
  { id: 'default', nameTr: 'Varsayılan', nameEn: 'Default', hex: '', isDefault: true },
  { id: 'black', nameTr: 'Siyah', nameEn: 'Deep Black', hex: '#09090b' },
  { id: 'dark_gray', nameTr: 'Koyu Gri', nameEn: 'Dark Slate', hex: '#18181b' },
  { id: 'soft_gray', nameTr: 'Soft Gri', nameEn: 'Soft Slate', hex: '#334155' },
  { id: 'navy', nameTr: 'Lacivert', nameEn: 'Navy Blue', hex: '#0f172a' },
  { id: 'dark_blue', nameTr: 'Koyu Mavi', nameEn: 'Deep Cobalt', hex: '#172554' },
  { id: 'emerald', nameTr: 'Yeşil', nameEn: 'Forest Green', hex: '#064e3b' },
  { id: 'midnight_purple', nameTr: 'Mor', nameEn: 'Midnight Purple', hex: '#2e1065' },
  { id: 'beige', nameTr: 'Bej', nameEn: 'Warm Beige', hex: '#292524' },
  { id: 'light_gray', nameTr: 'Açık Gri', nameEn: 'Light Slate', hex: '#e2e8f0' },
  { id: 'pure_white', nameTr: 'Beyaz', nameEn: 'Pure White', hex: '#ffffff' },
];

export default function AppearancePage() {
  const router = useRouter();
  const { theme, setTheme, locale, backgroundType, backgroundValue, setBackground, resetBackground } = useThemeStore();
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'color' | 'image'>(backgroundType === 'image' ? 'image' : 'color');

  const syncBackgroundWithDatabase = async (type: BackgroundType, value: string | null) => {
    if (!user) return;
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          backgroundType: type,
          backgroundValue: value,
        }),
      });
      setUser({
        ...user,
        backgroundType: type,
        backgroundValue: value,
      });
    } catch (err) {
      console.warn('Could not sync background to DB:', err);
    }
  };

  const handleColorSelect = (hex: string, isDefault: boolean = false) => {
    if (isDefault) {
      resetBackground();
      syncBackgroundWithDatabase('default', null);
    } else {
      setBackground('color', hex);
      syncBackgroundWithDatabase('color', hex);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimize and compress image on a canvas to prevent huge base64 strings
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setBackground('image', compressedDataUrl);
          syncBackgroundWithDatabase('image', compressedDataUrl);
        }
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    resetBackground();
    syncBackgroundWithDatabase('default', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const themes: { value: ThemePreference; preview: 'light' | 'dark' | 'auto'; labelTr: string; labelEn: string; descTr: string; descEn: string }[] = [
    {
      value: 'dark',
      preview: 'dark',
      labelTr: 'Koyu',
      labelEn: 'Dark',
      descTr: 'LifeOS koyu temada görünür',
      descEn: 'LifeOS appears in dark mode',
    },
    {
      value: 'light',
      preview: 'light',
      labelTr: 'Açık',
      labelEn: 'Light',
      descTr: 'LifeOS açık temada görünür',
      descEn: 'LifeOS appears in light mode',
    },
    {
      value: 'system',
      preview: 'auto',
      labelTr: 'Sistem',
      labelEn: 'System',
      descTr: 'Cihazınızın temasını takip eder',
      descEn: 'Follows your device theme',
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-32">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 px-4 pt-12 pb-4"
        >
          <button
            onClick={() => router.back()}
            className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {locale === 'tr' ? 'Görünüm & Arka Plan' : 'Appearance & Background'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {locale === 'tr' ? 'Tema ve ana ekran arka planını özelleştirin' : 'Customize theme and homescreen background'}
            </p>
          </div>
        </motion.div>

        {/* Section 1: Background Customization */}
        <div className="px-4 mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {locale === 'tr' ? 'Ana Ekran Arka Planı' : 'Homescreen Background'}
            </h2>
            {backgroundType !== 'default' && (
              <button
                onClick={handleRemoveImage}
                className="text-xs text-primary hover:underline"
              >
                {locale === 'tr' ? 'Varsayılana Dön' : 'Reset to Default'}
              </button>
            )}
          </div>

          {/* Background Tabs */}
          <div className="flex rounded-2xl bg-muted/60 p-1 border border-border">
            <button
              onClick={() => setActiveTab('color')}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2',
                activeTab === 'color'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Palette className="w-3.5 h-3.5" />
              {locale === 'tr' ? 'Sade Renk' : 'Solid Color'}
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2',
                activeTab === 'image'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              {locale === 'tr' ? 'Kendi Fotoğrafım' : 'Custom Photo'}
            </button>
          </div>

          {/* Tab 1: Solid Colors */}
          {activeTab === 'color' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border bg-card p-5 space-y-4"
            >
              <p className="text-xs text-muted-foreground">
                {locale === 'tr'
                  ? 'LifeOS tasarımına uygun soft ve sade renk tonlarından birini seçin:'
                  : 'Select one of the soft and minimal tones matching LifeOS style:'}
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {SOLID_COLORS.map((c) => {
                  const isSelected =
                    c.isDefault
                      ? backgroundType === 'default'
                      : backgroundType === 'color' && backgroundValue === c.hex;

                  return (
                    <button
                      key={c.id}
                      onClick={() => handleColorSelect(c.hex, c.isDefault)}
                      className={cn(
                        'group relative flex flex-col items-center gap-2 p-2.5 rounded-2xl border transition-all text-center',
                        isSelected
                          ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                          : 'border-border/60 hover:border-border bg-muted/20 hover:bg-muted/40'
                      )}
                    >
                      <div
                        className={cn(
                          'w-full h-10 rounded-xl border shadow-inner flex items-center justify-center transition-transform group-hover:scale-105',
                          c.isDefault
                            ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-indigo-500/30'
                            : 'border-white/10'
                        )}
                        style={{
                          backgroundColor: !c.isDefault ? c.hex : undefined,
                        }}
                      >
                        {c.isDefault && <Sparkles className="w-4 h-4 text-indigo-400" />}
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-foreground truncate w-full">
                        {locale === 'tr' ? c.nameTr : c.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Tab 2: Custom Image */}
          {activeTab === 'image' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border bg-card p-5 space-y-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {backgroundType === 'image' && backgroundValue ? (
                <div className="space-y-4">
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={backgroundValue}
                      alt="Current Background"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-1.5"
                      >
                        <Upload className="w-4 h-4" />
                        {locale === 'tr' ? 'Fotoğrafı Değiştir' : 'Change Photo'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {locale === 'tr' ? 'Yeni Fotoğraf Seç' : 'Choose New Photo'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {locale === 'tr' ? 'Kaldır' : 'Remove'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-36 rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer p-4 text-center group"
                >
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">
                      {isUploading
                        ? locale === 'tr' ? 'Yükleniyor...' : 'Uploading...'
                        : locale === 'tr' ? 'Cihazınızdan Fotoğraf Seçin' : 'Select Photo from Device'}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      JPG, PNG, WebP • Otomatik karartma ve optimizasyon uygulanır
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Section 2: Theme Preference */}
        <div className="px-4 mt-8 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {locale === 'tr' ? 'Tema Tercihi' : 'Theme Mode'}
          </h2>
          {themes.map((t) => (
            <ThemeOption
              key={t.value}
              value={t.value}
              label={locale === 'tr' ? t.labelTr : t.labelEn}
              description={locale === 'tr' ? t.descTr : t.descEn}
              isSelected={theme === t.value}
              onSelect={() => {
                setTheme(t.value);
                if (user) {
                  fetch('/api/user/profile', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: user.id, email: user.email, theme: t.value }),
                  }).catch(() => {});
                }
              }}
              preview={t.preview}
            />
          ))}
        </div>
      </div>
      <Dock />
    </div>
  );
}
