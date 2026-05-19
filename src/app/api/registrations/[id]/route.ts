import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendWhatsAppNotification, getWhatsAppConfig } from '@/lib/whatsapp';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const registration = await db.registration.findUnique({
      where: { id },
      include: { service: true, officer: { select: { id: true, name: true, role: true } }, queue: { include: { service: true, counter: true } } },
    });
    if (!registration) return NextResponse.json({ error: 'Pendaftaran tidak ditemukan' }, { status: 404 });
    return NextResponse.json({ registration });
  } catch (error) {
    console.error('Registration GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pendaftaran' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, verifiedBy, verifyNote, queueId } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (verifiedBy) updateData.verifiedBy = verifiedBy;
    if (verifyNote !== undefined) updateData.verifyNote = verifyNote;
    if (queueId !== undefined) updateData.queueId = queueId;

    // If verifying and no queueId yet, auto-create a queue
    if (status === 'diverifikasi' && !queueId) {
      const registration = await db.registration.findUnique({
        where: { id },
        include: { service: true },
      });

      if (registration && !registration.queueId) {
        const today = getTodayStr();

        // Find max number for today with same service prefix
        const todayQueues = await db.queue.findMany({
          where: { serviceId: registration.serviceId, date: today },
          orderBy: { number: 'desc' },
          take: 1,
        });

        let nextNum = 1;
        if (todayQueues.length > 0) {
          const parts = todayQueues[0].number.split('-');
          nextNum = parseInt(parts[1], 10) + 1;
        }

        const number = `${registration.service.prefix}-${String(nextNum).padStart(3, '0')}`;

        const newQueue = await db.queue.create({
          data: {
            number,
            serviceId: registration.serviceId,
            visitorName: registration.visitorName,
            visitorNik: registration.visitorNik,
            visitorPhone: registration.visitorPhone || null,
            date: today,
            status: 'menunggu',
          },
          include: { service: true, counter: true },
        });

        updateData.queueId = newQueue.id;
      }
    }

    const registration = await db.registration.update({
      where: { id },
      data: updateData,
      include: { service: true, officer: { select: { id: true, name: true, role: true } }, queue: { include: { service: true, counter: true } } },
    });

    // Send WhatsApp notification after successful verification
    if (status === 'diverifikasi' && registration.visitorPhone) {
      try {
        const settings = await db.setting.findMany();
        const waConfig = getWhatsAppConfig(settings);
        if (waConfig) {
          await sendWhatsAppNotification({
            phone: registration.visitorPhone,
            registrationCode: registration.code,
            queueNumber: registration.queue?.number,
            visitorName: registration.visitorName,
            inmateName: registration.inmateName,
            visitDate: registration.visitDate,
            serviceName: registration.service.name,
            config: waConfig,
          });
          console.log(`[WhatsApp] Notification sent for ${registration.code}`);
        } else {
          console.log('[WhatsApp] Skipped — no WA API key configured in settings');
        }
      } catch (waError) {
        // Don't fail the verification if WhatsApp fails
        console.error('[WhatsApp] Notification failed (non-blocking):', waError);
      }
    }

    return NextResponse.json({ registration });
  } catch (error) {
    console.error('Registration PATCH error:', error);
    return NextResponse.json({ error: 'Gagal mengupdate pendaftaran' }, { status: 500 });
  }
}
