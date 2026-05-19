import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body; // call_next, change_status, recall

    const counter = await db.counter.findUnique({ where: { id }, include: { service: true } });
    if (!counter) return NextResponse.json({ error: 'Loket tidak ditemukan' }, { status: 404 });

    if (action === 'change_status') {
      const { status } = body;
      const updated = await db.counter.update({ where: { id }, data: { status }, include: { service: true } });
      return NextResponse.json({ counter: updated });
    }

    if (action === 'call_next') {
      const today = getTodayStr();
      // Find next waiting queue for this counter's service
      const nextQueue = await db.queue.findFirst({
        where: { serviceId: counter.serviceId, status: 'menunggu', date: today },
        orderBy: { number: 'asc' },
      });

      if (!nextQueue) {
        return NextResponse.json({ error: 'Tidak ada antrian menunggu' }, { status: 404 });
      }

      // Update queue
      const updatedQueue = await db.queue.update({
        where: { id: nextQueue.id },
        data: { status: 'dipanggil', counterId: id, calledAt: new Date() },
        include: { service: true, counter: true },
      });

      // Update counter
      const updatedCounter = await db.counter.update({
        where: { id },
        data: { currentNum: nextQueue.number },
        include: { service: true },
      });

      return NextResponse.json({ counter: updatedCounter, queue: updatedQueue });
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Counter PATCH error:', error);
    return NextResponse.json({ error: 'Gagal mengupdate loket' }, { status: 500 });
  }
}
