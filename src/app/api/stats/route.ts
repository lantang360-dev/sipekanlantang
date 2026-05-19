import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function GET() {
  try {
    const today = getTodayStr();

    const [totalQueues, waitingQueues, servedQueues, totalRegistrations, pendingRegistrations, verifiedRegistrations] = await Promise.all([
      db.queue.count({ where: { date: today } }),
      db.queue.count({ where: { date: today, status: 'menunggu' } }),
      db.queue.count({ where: { date: today, status: { in: ['dilayani', 'selesai'] } } }),
      db.registration.count({ where: { visitDate: today } }),
      db.registration.count({ where: { visitDate: today, status: 'menunggu' } }),
      db.registration.count({ where: { visitDate: today, status: 'diverifikasi' } }),
    ]);

    const services = await db.service.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { queues: { where: { date: today } } } },
      },
      orderBy: { order: 'asc' },
    });

    const counters = await db.counter.findMany({
      include: { service: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      totalQueues,
      waitingQueues,
      servedQueues,
      totalRegistrations,
      pendingRegistrations,
      verifiedRegistrations,
      services,
      counters,
    });
  } catch (error) {
    console.error('Stats GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil statistik' }, { status: 500 });
  }
}
