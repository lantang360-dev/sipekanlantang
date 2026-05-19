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
    const { action, manualNumber } = body; // call_next, change_status, recall, call_manual

    const counter = await db.counter.findUnique({ where: { id }, include: { service: true } });
    if (!counter) return NextResponse.json({ error: 'Loket tidak ditemukan' }, { status: 404 });

    if (action === 'change_status') {
      const { status } = body;
      const updated = await db.counter.update({ where: { id }, data: { status }, include: { service: true } });
      return NextResponse.json({ counter: updated });
    }

    if (action === 'call_next') {
      const today = getTodayStr();
      // First try same-service queue, then fallback to any waiting queue
      let nextQueue = await db.queue.findFirst({
        where: { serviceId: counter.serviceId, status: 'menunggu', date: today },
        orderBy: { number: 'asc' },
      });

      if (!nextQueue) {
        // Fallback: call any waiting queue regardless of service
        nextQueue = await db.queue.findFirst({
          where: { status: 'menunggu', date: today },
          orderBy: { number: 'asc' },
        });
      }

      if (!nextQueue) {
        return NextResponse.json({ error: 'Tidak ada antrian menunggu' }, { status: 404 });
      }

      const updatedQueue = await db.queue.update({
        where: { id: nextQueue.id },
        data: { status: 'dipanggil', counterId: id, calledAt: new Date() },
        include: { service: true, counter: true },
      });

      const updatedCounter = await db.counter.update({
        where: { id },
        data: { currentNum: nextQueue.number },
        include: { service: true },
      });

      return NextResponse.json({ counter: updatedCounter, queue: updatedQueue });
    }

    if (action === 'recall') {
      // Re-announce the current number for this counter
      let currentQueue = await db.queue.findFirst({
        where: { counterId: id, status: 'dipanggil', date: getTodayStr() },
        include: { service: true, counter: true },
        orderBy: { calledAt: 'desc' },
      });

      // If no dipanggil queue, try to find by currentNum
      if (!currentQueue && counter.currentNum) {
        currentQueue = await db.queue.findFirst({
          where: { number: counter.currentNum, date: getTodayStr() },
          include: { service: true, counter: true },
          orderBy: { calledAt: 'desc' },
        });
        if (currentQueue) {
          // Re-assign to this counter and set dipanggil
          currentQueue = await db.queue.update({
            where: { id: currentQueue.id },
            data: { status: 'dipanggil', counterId: id, calledAt: new Date() },
            include: { service: true, counter: true },
          });
          return NextResponse.json({ queue: currentQueue, counter: await db.counter.update({ where: { id }, data: { currentNum: currentQueue.number }, include: { service: true } }), recalled: true });
        }
      }

      if (!currentQueue) {
        return NextResponse.json({ error: 'Tidak ada antrian yang sedang dipanggil' }, { status: 404 });
      }

      // Update calledAt to trigger re-announcement on display
      const recalled = await db.queue.update({
        where: { id: currentQueue.id },
        data: { calledAt: new Date() },
        include: { service: true, counter: true },
      });

      return NextResponse.json({ queue: recalled, recalled: true });
    }

    if (action === 'call_manual') {
      // Manually call a specific queue number
      if (!manualNumber) {
        return NextResponse.json({ error: 'Nomor antrian wajib diisi' }, { status: 400 });
      }

      const today = getTodayStr();
      // Search by exact number or partial match
      let queue = await db.queue.findFirst({
        where: { number: manualNumber, date: today },
        include: { service: true, counter: true },
      });

      // Try prefix-based search (e.g., user types "B1" to find "B-0001")
      if (!queue) {
        const upperNum = manualNumber.toUpperCase();
        queue = await db.queue.findFirst({
          where: {
            number: { contains: upperNum.replace(/[^A-Z0-9]/g, '') },
            date: today,
          },
          include: { service: true, counter: true },
        });
      }

      if (!queue) {
        return NextResponse.json({ error: 'Nomor antrian tidak ditemukan untuk hari ini' }, { status: 404 });
      }

      const updatedQueue = await db.queue.update({
        where: { id: queue.id },
        data: { status: 'dipanggil', counterId: id, calledAt: new Date() },
        include: { service: true, counter: true },
      });

      const updatedCounter = await db.counter.update({
        where: { id },
        data: { currentNum: queue.number },
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
