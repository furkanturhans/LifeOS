import { NextResponse } from 'next/server';
import type { Message } from '@/types/connect';

// Seed initial messages per conversation
const MESSAGES_STORE: Record<string, Message[]> = {
  'conv-family-home': [
    {
      id: 'msg-fam-0',
      conversationId: 'conv-family-home',
      senderId: 'usr-furkan',
      senderName: 'Furkan Turhan',
      senderRole: 'user',
      content: 'Pazar günü saat 10:00 da Belgrad Ormanı yürüyüşüne çıkıyoruz.',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      reactions: [{ emoji: '🎉', count: 3, userIds: ['usr-ayse', 'usr-can', 'usr-furkan'] }],
      isPinned: true,
      status: 'read',
    },
    {
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
  ],
  'conv-edu-math': [
    {
      id: 'msg-edu-0',
      conversationId: 'conv-edu-math',
      senderId: 'usr-instructor-ahmet',
      senderName: 'Prof. Dr. Ahmet Yılmaz',
      senderRole: 'instructor',
      content: 'Ders notları ve çalışma soruları sisteme yüklendi: PDF: "Hafta-4-Integral-Uygulamalari.pdf"',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      reactions: [{ emoji: '📚', count: 5, userIds: ['usr-furkan', 'usr-zeynep'] }],
      isPinned: true,
      status: 'read',
    },
    {
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
  ],
  'conv-srv-taxi-892': [
    {
      id: 'msg-srv-0',
      conversationId: 'conv-srv-taxi-892',
      senderId: 'usr-furkan',
      senderName: 'Furkan Turhan',
      senderRole: 'user',
      content: 'Merhaba, apartman girişinde bekliyorum.',
      createdAt: new Date(Date.now() - 900000).toISOString(),
      reactions: [],
      status: 'read',
    },
    {
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
  ],
  'conv-pers-zeynep': [
    {
      id: 'msg-pers-0',
      conversationId: 'conv-pers-zeynep',
      senderId: 'usr-furkan',
      senderName: 'Furkan Turhan',
      senderRole: 'user',
      content: 'Selam Zeynep, LifeOS Connect arayüz prototipini inceleyebildin mi?',
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      reactions: [],
      status: 'read',
    },
    {
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
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json(
      { success: false, error: 'conversationId parametresi zorunludur.' },
      { status: 400 }
    );
  }

  const messages = MESSAGES_STORE[conversationId] || [];

  return NextResponse.json({
    success: true,
    conversationId,
    messages,
    total: messages.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Send new message
    if (action === 'send' || !action) {
      const {
        conversationId,
        content,
        senderId,
        senderName,
        senderRole,
        replyToId,
        replyToPreview,
        attachments,
        transformedAction,
      } = body;

      if (!conversationId || !content?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Mesaj içeriği ve conversationId zorunludur.' },
          { status: 400 }
        );
      }

      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        conversationId,
        senderId: senderId || 'usr-furkan',
        senderName: senderName || 'Furkan Turhan',
        senderRole: senderRole || 'user',
        content: content.trim(),
        createdAt: new Date().toISOString(),
        replyToId,
        replyToPreview,
        reactions: [],
        status: 'sent',
        attachments: attachments || [],
        transformedAction,
      };

      if (!MESSAGES_STORE[conversationId]) {
        MESSAGES_STORE[conversationId] = [];
      }

      MESSAGES_STORE[conversationId].push(newMessage);

      return NextResponse.json({
        success: true,
        message: newMessage,
      });
    }

    // 2. Toggle reaction
    if (action === 'react') {
      const { conversationId, messageId, emoji, userId } = body;

      const list = MESSAGES_STORE[conversationId];
      if (!list) {
        return NextResponse.json({ success: false, error: 'Konuşma bulunamadı.' }, { status: 404 });
      }

      const msg = list.find((m) => m.id === messageId);
      if (!msg) {
        return NextResponse.json({ success: false, error: 'Mesaj bulunamadı.' }, { status: 404 });
      }

      const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
      if (existingReaction) {
        if (existingReaction.userIds.includes(userId)) {
          // Remove reaction
          existingReaction.userIds = existingReaction.userIds.filter((id) => id !== userId);
          existingReaction.count = existingReaction.userIds.length;
          if (existingReaction.count === 0) {
            msg.reactions = msg.reactions.filter((r) => r.emoji !== emoji);
          }
        } else {
          // Add user
          existingReaction.userIds.push(userId);
          existingReaction.count = existingReaction.userIds.length;
        }
      } else {
        msg.reactions.push({
          emoji,
          count: 1,
          userIds: [userId],
        });
      }

      return NextResponse.json({
        success: true,
        reactions: msg.reactions,
      });
    }

    // 3. Pin / Unpin message
    if (action === 'pin') {
      const { conversationId, messageId, isPinned } = body;
      const list = MESSAGES_STORE[conversationId];
      const msg = list?.find((m) => m.id === messageId);
      if (msg) {
        msg.isPinned = Boolean(isPinned);
        return NextResponse.json({ success: true, isPinned: msg.isPinned });
      }
      return NextResponse.json({ success: false, error: 'Mesaj bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: false, error: 'Geçersiz işlem.' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Mesaj işlenirken hata oluştu.' }, { status: 500 });
  }
}
