'use client';

import React, { useState } from 'react';
import {
  MessageSquarePlus,
  X,
  UserCheck,
  ShieldAlert,
  GraduationCap,
  Users,
  Car,
  Search,
} from 'lucide-react';
import { useConnectStore } from '@/stores/useConnectStore';
import type { ConnectScope, ScopeMeta } from '@/types/connect';

export function ConnectNewChatModal() {
  const {
    isNewChatModalOpen,
    setNewChatModalOpen,
    activeScope,
    currentUser,
    fetchConversations,
    setActiveConversationId,
  } = useConnectStore();

  const [title, setTitle] = useState('');
  const [targetContact, setTargetContact] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewChatModalOpen) return null;

  const isChild = currentUser.role === 'child';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isChild && activeScope === 'personal') {
      setError('Çocuk koruma kuralları gereği doğrudan birebir mesajlaşma başlatılamaz. Lütfen velinizden veya sınıf alanından iletişime geçiniz.');
      return;
    }

    if (!title.trim()) {
      setError('Lütfen bir başlık veya kişi/oda adı giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      let scopeMeta: ScopeMeta;
      if (activeScope === 'family') {
        scopeMeta = {
          type: 'family',
          familyGroupId: 'fam-custom',
          roomName: title.trim(),
          isSharedRoom: true,
        };
      } else if (activeScope === 'education') {
        scopeMeta = {
          type: 'education',
          courseId: `crs-${Date.now()}`,
          courseTitle: title.trim(),
          instructorName: 'Eğitmen',
          isQnaChannel: true,
        };
      } else if (activeScope === 'services') {
        scopeMeta = {
          type: 'services',
          serviceType: 'taxi',
          serviceBookingId: `bk-${Date.now()}`,
          serviceTitle: title.trim(),
          serviceStatus: 'active',
          providerName: 'Hizmet Sağlayıcı',
        };
      } else {
        scopeMeta = {
          type: 'personal',
          contactId: `usr-${Date.now()}`,
          permissionStatus: 'accepted',
        };
      }

      const res = await fetch('/api/connect/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          scope: activeScope,
          scopeMeta,
          isChild,
          requesterId: currentUser.id,
          participants: [
            currentUser,
            { id: `usr-${Date.now()}`, name: targetContact.trim() || 'Yeni Katılımcı', role: 'user' },
          ],
        }),
      });

      const data = await res.json();
      if (data.success && data.conversation) {
        await fetchConversations();
        setActiveConversationId(data.conversation.id);
        setNewChatModalOpen(false);
        setTitle('');
        setTargetContact('');
      } else {
        setError(data.error || 'Konuşma başlatılamadı.');
      }
    } catch {
      setError('Bağlantı hatası meydana geldi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScopeLabel = () => {
    switch (activeScope) {
      case 'family':
        return 'Yeni Aile Odası';
      case 'education':
        return 'Yeni Sınıf / Ders Alanı';
      case 'services':
        return 'Yeni Hizmet İletişimi';
      default:
        return 'Yeni Kişisel Sohbet';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">{getScopeLabel()}</h3>
          </div>
          <button
            onClick={() => setNewChatModalOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isChild && activeScope === 'personal' ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert className="h-4 w-4" />
                <span>Çocuk Güvenlik Koruması Aktif</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Çocuk hesapları yalnızca veli onaylı aile odalarında ve kayıtlı ders sınıflarında iletişim kurabilir. Birebir yabancı mesajlaşma izne tabidir.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold text-foreground">
                  {activeScope === 'personal' ? 'Kişi Adı / Başlık' : 'Grup / Oda Başlığı'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    activeScope === 'personal'
                      ? 'Örn: Zeynep Kaya'
                      : activeScope === 'family'
                      ? 'Örn: Hafta Sonu Planları'
                      : activeScope === 'education'
                      ? 'Örn: Fizik Laboratuvarı Soru Grubu'
                      : 'Örn: Nakliye Görevlisi (#771)'
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  required
                />
              </div>

              {activeScope === 'personal' && (
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Kullanıcı Takma Adı / İzinli Bağlantı
                  </label>
                  <input
                    type="text"
                    value={targetContact}
                    onChange={(e) => setTargetContact(e.target.value)}
                    placeholder="Kişi takma adı..."
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    * Telefon veya e-posta bilgisi gerekmez.
                  </span>
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setNewChatModalOpen(false)}
              className="rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              Kapat
            </button>
            {(!isChild || activeScope !== 'personal') && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? 'Oluşturuluyor...' : 'Sohbeti Başlat'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
