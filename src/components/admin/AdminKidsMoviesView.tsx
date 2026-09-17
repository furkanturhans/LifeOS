'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Film,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  Trash2,
  Eye,
  Lock,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KIDS_MOVIES_CATALOG } from '@/components/kids/KidsMovieView';
import type { KidsMovieItem } from '@/types/kids';
import { cn } from '@/lib/utils';

export function AdminKidsMoviesView() {
  const [moviesList, setMoviesList] = useState<KidsMovieItem[]>(KIDS_MOVIES_CATALOG);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Movie Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ageRange, setAgeRange] = useState('6-8 Yaş (7+)');
  const [ageFilter, setAgeFilter] = useState<'age_3_5' | 'age_6_8' | 'age_9_12'>('age_6_8');
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [videoUrl, setVideoUrl] = useState('');
  const [creator, setCreator] = useState('');
  const [license, setLicense] = useState('Creative Commons Attribution 3.0');
  const [sourceUrl, setSourceUrl] = useState('');
  const [thumbnailEmoji, setThumbnailEmoji] = useState('🎬');
  const [formError, setFormError] = useState('');

  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Strict validation as requested:
    // Video başlığı, videoUrl, ageRange, creator, license, sourceUrl are mandatory
    if (!title.trim()) {
      setFormError('Video başlığı zorunludur.');
      return;
    }
    if (!videoUrl.trim() || (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://'))) {
      setFormError('Geçerli bir video akış / kaynak bağlantısı (URL) girilmelidir.');
      return;
    }
    if (!creator.trim()) {
      setFormError('İçerik sahibi / yapımcı bilgisi zorunludur.');
      return;
    }
    if (!license.trim()) {
      setFormError('Lisans ve telif durumu belirtilmeden içerik yayınlanamaz.');
      return;
    }
    if (!sourceUrl.trim() || (!sourceUrl.startsWith('http://') && !sourceUrl.startsWith('https://'))) {
      setFormError('Doğrulanabilir resmî kaynak / atıf bağlantısı zorunludur.');
      return;
    }

    const newMovie: KidsMovieItem = {
      id: `movie_${Date.now()}`,
      title: title.trim(),
      category: 'Animasyon',
      ageFilter,
      ageRange,
      durationMinutes,
      thumbnailEmoji: thumbnailEmoji.trim() || '🎬',
      description: description.trim() || 'Çocuklar için eğitici ve güvenli animasyon.',
      tags: ['Açık Kaynak', 'Eğitici'],
      videoUrl: videoUrl.trim(),
      creator: creator.trim(),
      license: license.trim(),
      sourceUrl: sourceUrl.trim(),
      attributionText: `${title.trim()} — ${creator.trim()} — ${license.trim()}`,
      isPublished: true,
    };

    setMoviesList((prev) => [newMovie, ...prev]);
    setIsAddModalOpen(false);

    // Reset Form
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setCreator('');
    setSourceUrl('');
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">Kids Movie İçerik Yönetimi</h1>
            <StatusBadge status="verified" label="Telif Korumalı" size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kids Movie alanında yayınlanan animasyonlar, kaynak lisansları ve atıf denetimi
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="h-10 px-4 font-bold text-xs shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Yeni Doğrulanmış Video Ekle
        </Button>
      </div>

      {/* Mandatory License & Compliance Banner */}
      <Card className="p-4 border-emerald-500/30 bg-emerald-500/10 shadow-2xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
              Yayınlanabilirlik ve Telif Standartları
            </h4>
            <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
              Çocuk güvenliği politikası gereğince; içerik sahibi, geçerli lisans türü ve kaynak bağlantısı doğrulanmamış hiçbir video Kids alanında yayınlanamaz. Tüm içerikler LifeOS kapalı güvenli oynatıcısında oynatılır.
            </p>
          </div>
        </div>
      </Card>

      {/* Videos List Table */}
      <div className="space-y-3">
        <div className="px-1 flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <span>Yayınlanan Videolar ({moviesList.length})</span>
          <span>Durum & Lisans</span>
        </div>

        {moviesList.map((movie) => (
          <Card key={movie.id} className="p-4 border-border bg-card shadow-2xs hover:border-primary/30 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-3xl shadow-xs">
                  {movie.thumbnailEmoji}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-foreground truncate">
                      {movie.title}
                    </h3>
                    <span className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                      ● YAYINDA
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {movie.ageRange} • {movie.durationMinutes} Dk
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {movie.description}
                  </p>

                  <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-muted font-medium text-foreground">
                      Sahip: {movie.creator}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">
                      Lisans: {movie.license}
                    </span>
                    <a
                      href={movie.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-0.5 font-semibold"
                    >
                      Kaynak <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <a
                  href={movie.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground inline-flex items-center gap-1"
                >
                  <Eye className="h-3.5 w-3.5" /> Akışı Test Et
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add New Video Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Yeni Telifli Video Yayınla"
        description="Kids Movie alanına eklenecek açık kaynak veya lisanslı video bilgilerini girin."
        size="md"
      >
        <form onSubmit={handleAddMovie} className="space-y-4 pt-2">
          {formError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Video Başlığı *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Sintel"
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                İçerik Sahibi / Yapımcı *
              </label>
              <input
                type="text"
                required
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="Örn: Blender Foundation"
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Gerçek Video Kaynak Bağlantısı (MP4 Stream URL) *
            </label>
            <input
              type="url"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://.../video.mp4"
              className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-mono focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Lisans / Telif Durumu *
              </label>
              <select
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:border-primary focus:outline-none"
              >
                <option value="Creative Commons Attribution 3.0">CC BY 3.0</option>
                <option value="Creative Commons Attribution 4.0">CC BY 4.0</option>
                <option value="Creative Commons Zero (Public Domain)">CC0 (Kamu Malı)</option>
                <option value="Telif İzinli / Lisanslı Yayın">Telif İzinli / Lisanslı</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Resmî Kaynak / Atıf URL *
              </label>
              <input
                type="url"
                required
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://peach.blender.org/"
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-mono focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Yaş Grubu
              </label>
              <select
                value={ageFilter}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setAgeFilter(val);
                  setAgeRange(val === 'age_3_5' ? '3-5 Yaş' : val === 'age_6_8' ? '6-8 Yaş (7+)' : '9-12 Yaş');
                }}
                className="w-full h-9 rounded-xl border border-border bg-background px-2 text-xs font-semibold focus:border-primary focus:outline-none"
              >
                <option value="age_3_5">3-5 Yaş</option>
                <option value="age_6_8">6-8 Yaş (7+)</option>
                <option value="age_9_12">9-12 Yaş</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Süre (Dk)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 10)}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Kapak Emojisi
              </label>
              <input
                type="text"
                maxLength={2}
                value={thumbnailEmoji}
                onChange={(e) => setThumbnailEmoji(e.target.value)}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-center text-sm font-bold focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Türkçe Açıklama
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Animasyon konusu..."
              className="w-full rounded-xl border border-border bg-background p-2 text-xs focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 font-semibold text-xs h-10"
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 font-bold text-xs h-10 shadow-xs"
            >
              Onayla ve Yayınla
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
