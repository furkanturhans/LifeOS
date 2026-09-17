import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId, messages, scope } = body;

    if (!conversationId || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Özetlenecek mesaj bulunamadı.' },
        { status: 400 }
      );
    }

    const messageCount = messages.length;
    const senders = Array.from(new Set(messages.map((m: { senderName: string }) => m.senderName)));

    let summaryText = '';
    const keyPoints: string[] = [];

    if (scope === 'family') {
      summaryText = `Aile içi son ${messageCount} mesajda hafta sonu doğa yürüyüşü ve alışveriş hazırlıkları konuşuldu.`;
      keyPoints.push('Pazar günü Belgrad Ormanı yürüyüşü planlandı.');
      keyPoints.push('Alışveriş listesi güncellendi.');
    } else if (scope === 'education') {
      summaryText = `İleri Matematik sınıfında son ${messageCount} mesajda türev ödevi ve canlı ders hazırlıkları ele alındı.`;
      keyPoints.push('Hafta 4 İntegral çalışma soruları PDF formatında paylaşıldı.');
      keyPoints.push('Yarın saat 14:00 deki canlı ders hatırlatması yapıldı.');
    } else if (scope === 'services') {
      summaryText = `Hizmet iletişiminde son ${messageCount} mesajda araç varış saati ve konum teyidi paylaşıldı.`;
      keyPoints.push('Sürücü varış süresi 3 dakika olarak bildirildi.');
      keyPoints.push('Buluşma noktası apartman girişi olarak teyit edildi.');
    } else {
      summaryText = `${senders.join(', ')} arasındaki konuşmada son ${messageCount} mesajda proje sunum slaytları ve grafik revizyonları değerlendirildi.`;
      keyPoints.push('Proje sunumunun 4. sayfasındaki grafik güncellenecek.');
    }

    return NextResponse.json({
      success: true,
      summary: {
        conversationId,
        generatedAt: new Date().toISOString(),
        summaryText,
        keyPoints,
        messageCount,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Sohbet özeti üretilirken hata oluştu.' },
      { status: 500 }
    );
  }
}
