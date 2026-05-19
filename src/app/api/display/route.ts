import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function GET() {
  try {
    const today = getTodayStr();

    const [counters, waitingCount, servedCount, totalToday, lastCalled] = await Promise.all([
      db.counter.findMany({ include: { service: true }, orderBy: { order: 'asc' } }),
      db.queue.count({ where: { status: 'menunggu', date: today } }),
      db.queue.count({ where: { status: { in: ['dilayani', 'selesai'] }, date: today } }),
      db.queue.count({ where: { date: today } }),
      db.queue.findFirst({
        where: { status: 'dipanggil', date: today },
        include: { service: true, counter: true },
        orderBy: { calledAt: 'desc' },
      }),
    ]);

    const callingCounters = await db.queue.findMany({
      where: { status: 'dipanggil', date: today },
      include: { service: true, counter: true },
      orderBy: { calledAt: 'desc' },
    });

    return NextResponse.json({
      counters,
      waitingCount,
      servedCount,
      totalToday,
      lastCalled,
      callingCounters,
    });
  } catch (error) {
    console.error('Display GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data display' }, { status: 500 });
  }
}
