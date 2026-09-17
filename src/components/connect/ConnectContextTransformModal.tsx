'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Calendar,
  BookOpen,
  Briefcase,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  Tag,
} from 'lucide-react';
import type { Message, ActionTransformType, ActionTransformPayload } from '@/types/connect';

interface ConnectContextTransformModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  onTransform: (payload: ActionTransformPayload) => void;
}

export function ConnectContextTransformModal({
  isOpen,
  onClose,
  message,
  onTransform,
}: ConnectContextTransformModalProps) {
  const [selectedType, setSelectedType] = useState<ActionTransformType>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  React.useEffect(() => {
    if (message) {
      setTitle(message.content.slice(0, 60));
      setDescription(message.content);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [message]);

  if (!isOpen || !message) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: ActionTransformPayload = {
      type: selectedType,
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || undefined,
      createdAt: new Date().toISOString(),
    };

    onTransform(payload);
  };

  const transformOptions = [
    {
      type: 'task' as ActionTransformType,
      label: 'Göreve Dönüştür',
      desc: 'LifeOS Asistan & Görevler listenize ekler',
      icon: CheckSquare,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    },
    {
      type: 'calendar_event' as ActionTransformType,
      label: 'Takvim Etkinliği',
      desc: 'Tarihli randevu veya hatırlatıcı oluşturur',
      icon: Calendar,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      type: 'course_note' as ActionTransformType,
      label: 'Ders Notu',
      desc: 'Akademi defterinize ders özeti olarak kaydeder',
      icon: BookOpen,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    },
    {
      type: 'service_request' as ActionTransformType,
      label: 'Hizmet Notu',
      desc: 'Hizmet siparişine referans olarak iliştirir',
      icon: Briefcase,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-foreground">
              Mesajı LifeOS Eylemine Dönüştür
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Source Message Preview */}
        <div className="bg-muted/40 px-5 py-3 border-b border-border/50 text-xs">
          <span className="font-semibold text-muted-foreground">Kaynak Mesaj ({message.senderName}):</span>
          <p className="mt-1 line-clamp-2 italic text-foreground/80">"{message.content}"</p>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Option Selector */}
          <div className="grid grid-cols-2 gap-2">
            {transformOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedType === opt.type;
              return (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => setSelectedType(opt.type)}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? `${opt.color} ring-1 ring-primary/50`
                      : 'border-border bg-background/50 hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium text-xs text-foreground">
                    <Icon className="h-4 w-4" />
                    <span>{opt.label}</span>
                  </div>
                  <span className="mt-1 text-[10px] text-muted-foreground leading-tight">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Title input */}
          <div>
            <label className="text-xs font-semibold text-foreground">Başlık</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              placeholder="Eylem başlığı..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-foreground">Açıklama / Detay</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              placeholder="Detaylar..."
            />
          </div>

          {/* Date Picker (optional) */}
          {(selectedType === 'task' || selectedType === 'calendar_event') && (
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Hedef / Bitiş Tarihi
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <span>Eylemi Oluştur</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
