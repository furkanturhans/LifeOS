import { NextResponse } from 'next/server';
import type { Conversation, ConnectScope } from '@/types/connect';

// Seed initial calm, contextual conversations for LifeOS
let CONVERSATIONS_STORE: Conversation[] = [
  // 1. Family Scope
  {
    id: 'conv-family-home',
    title: '🏡 Turhan Ailesi',
    scope: 'family',
    scopeMeta: {
      type: 'family',
      familyGroupId: 'fam-turhan',
      roomName: 'Ev & Yaşam',
      isSharedRoom: true,
    },
    participants: [
      { id: 'usr-furkan', name: 'Furkan Turhan', role: 'user' },
      { id: 'usr-ayse', name: 'Ayşe Turhan', role: 'guardian' },
      { id: 'usr-can', name: 'Can Turhan', role: 'child', isChild: true, canDirectMessage: false },
    ],
    unreadCount: 0,
    isMuted: false,
    isArchived: false,
    isPinned: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastMessage: {
      id: 'msg-fam-1',
      conversationId: 'conv-family-home',
      senderId: 'usr-ayse',
      senderName: 'Ayşe Turhan',
      senderRole: 'guardian',
      content: 'Hafta sonu doğa yürüyüşü için alışveriş listesini ekledim.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      reactions: [{ emoji: '❤️', count: 2, userIds: ['usr-furkan', 'usr-can'] }],
      status: 'read',
    },
  },

  // 2. Education Scope
  {
    id: 'conv-edu-math',
    title: '📐 İleri Matematik 101 Sınıfı',
    scope: 'education',
    scopeMeta: {
      type: 'education',
      courseId: 'crs-math-101',
      courseTitle: 'İleri Matematik 101',
      topicTitle: 'Türev ve İntegral Uygulamaları',
      isQnaChannel: true,
      instructorName: 'Prof. Dr. Ahmet Yılmaz',
    },
    participants: [
      { id: 'usr-instructor-ahmet', name: 'Prof. Dr. Ahmet Yılmaz', role: 'instructor', badge: 'Eğitmen' },
      { id: 'usr-furkan', name: 'Furkan Turhan', role: 'user' },
      { id: 'usr-zeynep', name: 'Zeynep Kaya', role: 'user' },
    ],
    unreadCount: 1,
    isMuted: false,
    isArchived: false,
    isPinned: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    lastMessage: {
      id: 'msg-edu-1',
      conversationId: 'conv-edu-math',
      senderId: 'usr-instructor-ahmet',
      senderName: 'Prof. Dr. Ahmet Yılmaz',
      senderRole: 'instructor',
      content: 'Yarın saat 14:00 canlı ders öncesi türev ödevini kontrol etmeyi unutmayın.',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      reactions: [{ emoji: '👍', count: 4, userIds: ['usr-furkan', 'usr-zeynep'] }],
      isPinned: true,
      status: 'sent',
    },
  },

  // 3. Services Scope
  {
    id: 'conv-srv-taxi-892',
    title: '🚕 Sarı Taksi (#892)',
    scope: 'services',
    scopeMeta: {
      type: 'services',
      serviceType: 'taxi',
      serviceBookingId: 'bk-taxi-892',
      serviceTitle: 'Kadıköy ➔ Beşiktaş Güzergahı',
      serviceStatus: 'active',
      providerName: 'Mehmet K. (34 TKB 44)',
    },
    participants: [
      { id: 'usr-driver-mehmet', name: 'Mehmet K. (Sürücü)', role: 'service_provider', badge: '34 TKB 44' },
      { id: 'usr-furkan', name: 'Furkan Turhan', role: 'user' },
    ],
    unreadCount: 0,
    isMuted: false,
    isArchived: false,
    isPinned: false,
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
    lastMessage: {
      id: 'msg-srv-1',
      conversationId: 'conv-srv-taxi-892',
      senderId: 'usr-driver-mehmet',
      senderName: 'Mehmet K. (Sürücü)',
      senderRole: 'service_provider',
      content: 'Konumunuza 3 dakika içinde varıyorum, kapı önünde bekleyebilirsiniz.',
      createdAt: new Date(Date.now() - 600000).toISOString(),
      reactions: [],
      status: 'read',
    },
  },

  // 4. Personal Scope
  {
    id: 'conv-pers-zeynep',
    title: 'Zeynep Kaya',
    scope: 'personal',
    scopeMeta: {
      type: 'personal',
      contactId: 'usr-zeynep',
      permissionStatus: 'accepted',
    },
    participants: [
      { id: 'usr-furkan', name: 'Furkan Turhan', role: 'user' },
      { id: 'usr-zeynep', name: 'Zeynep Kaya', role: 'user', badge: 'Proje Ortağı' },
    ],
    unreadCount: 0,
    isMuted: false,
    isArchived: false,
    isPinned: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    lastMessage: {
      id: 'msg-pers-1',
      conversationId: 'conv-pers-zeynep',
      senderId: 'usr-zeynep',
      senderName: 'Zeynep Kaya',
      senderRole: 'user',
      content: 'Proje sunum slaytlarını inceledim, 4. sayfadaki grafiği güncelleyebiliriz.',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      reactions: [{ emoji: '👌', count: 1, userIds: ['usr-furkan'] }],
      status: 'read',
    },
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope') as ConnectScope | null;
  const includeArchived = searchParams.get('includeArchived') === 'true';

  let results = [...CONVERSATIONS_STORE];

  if (scope) {
    results = results.filter((c) => c.scope === scope);
  }

  if (!includeArchived) {
    results = results.filter((c) => !c.isArchived);
  }

  // Sort pinned first, then by updatedAt desc
  results.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return NextResponse.json({
    success: true,
    conversations: results,
    total: results.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, scope, scopeMeta, participants, requesterId, isChild } = body;

    // Child Protection Check
    if (isChild && scope === 'personal') {
      return NextResponse.json(
        {
          success: false,
          error: 'Çocuk koruma kuralları gereği doğrudan birebir mesajlaşma başlatılamaz. Lütfen velinizden veya sınıf alanından iletişime geçiniz.',
        },
        { status: 403 }
      );
    }

    if (!title || !scope) {
      return NextResponse.json(
        { success: false, error: 'Başlık ve iletişim kapsamı zorunludur.' },
        { status: 400 }
      );
    }

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title,
      scope,
      scopeMeta: scopeMeta || { type: 'personal', contactId: '', permissionStatus: 'accepted' },
      participants: participants || [
        { id: requesterId || 'usr-current', name: 'Kullanıcı', role: 'user' },
      ],
      unreadCount: 0,
      isMuted: false,
      isArchived: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    CONVERSATIONS_STORE.unshift(newConv);

    return NextResponse.json({
      success: true,
      conversation: newConv,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Konuşma oluşturulurken hata meydana geldi.' },
      { status: 500 }
    );
  }
}
