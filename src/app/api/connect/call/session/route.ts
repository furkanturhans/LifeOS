import { NextResponse } from 'next/server';
import type { CallSession, CallStatus, CallType, UserRole } from '@/types/connect';

let ACTIVE_CALLS: Record<string, CallSession> = {};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, conversationId, callerId, callerName, callerRole, targetUserIds, type, callId } = body;

    if (action === 'start') {
      const newCallId = `call-${Date.now()}`;
      const session: CallSession = {
        id: newCallId,
        conversationId,
        callerId: callerId || 'usr-furkan',
        callerName: callerName || 'Furkan Turhan',
        callerRole: (callerRole as UserRole) || 'user',
        targetUserIds: targetUserIds || [],
        type: (type as CallType) || 'audio',
        status: 'calling',
        startedAt: new Date().toISOString(),
        roomName: `lifeos-call-${conversationId}`,
      };

      ACTIVE_CALLS[newCallId] = session;

      return NextResponse.json({
        success: true,
        session,
      });
    }

    if (action === 'update_status') {
      const session = ACTIVE_CALLS[callId];
      if (!session) {
        return NextResponse.json({ success: false, error: 'Arama oturumu bulunamadı.' }, { status: 404 });
      }

      session.status = body.status as CallStatus;
      if (session.status === 'ended' || session.status === 'rejected') {
        session.endedAt = new Date().toISOString();
      }

      return NextResponse.json({
        success: true,
        session,
      });
    }

    return NextResponse.json({ success: false, error: 'Geçersiz arama eylemi.' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Arama oturumu işlenirken hata oluştu.' }, { status: 500 });
  }
}
