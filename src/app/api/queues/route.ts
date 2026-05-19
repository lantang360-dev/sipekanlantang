import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date') || getTodayStr();

    const where: Record<string, unknown> = { date };
    if (status) where.status = status;

    const queues = await db.queue.findMany({
      where,
      include: { service: true, counter: true },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ queues });
  } catch (error) {
    console.error('Queues GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data antrian' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceId, visitorName, visitorNik, visitorPhone } = body;

    if (!serviceId) {
      return NextResponse.json({ error: 'Layanan wajib dipilih' }, { status: 400 });
    }

    const service = await db.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ error: 'Layanan tidak ditemukan' }, { status: 404 });
    }

    const today = getTodayStr();

    // Find max number for today with same prefix
    const todayQueues = await db.queue.findMany({
      where: { serviceId, date: today },
      orderBy: { number: 'desc' },
      take: 1,
    });

    let nextNum = 1;
    if (todayQueues.length > 0) {
      const parts = todayQueues[0].number.split('-');
      nextNum = parseInt(parts[1], 10) + 1;
    }

    const number = `${service.prefix}-${String(nextNum).padStart(4, '0')}`;

    const queue = await db.queue.create({
      data: {
        number,
        serviceId,
        visitorName: visitorName || null,
        visitorNik: visitorNik || null,
        visitorPhone: visitorPhone || null,
        date: today,
        status: 'menunggu',
      },
      include: { service: true, counter: true },
    });

    return NextResponse.json({ queue }, { status: 201 });
  } catch (error) {
    console.error('Queues POST error:', error);
    return NextResponse.json({ error: 'Gagal membuat antrian' }, { status: 500 });
  }
}
