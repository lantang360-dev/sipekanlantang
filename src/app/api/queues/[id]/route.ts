import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const queue = await db.queue.findUnique({
      where: { id },
      include: { service: true, counter: true },
    });
    if (!queue) return NextResponse.json({ error: 'Antrian tidak ditemukan' }, { status: 404 });
    return NextResponse.json({ queue });
  } catch (error) {
    console.error('Queue GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data antrian' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, counterId } = body;

    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
      if (status === 'dipanggil') updateData.calledAt = new Date();
      if (status === 'dilayani') updateData.servedAt = new Date();
      if (status === 'selesai') updateData.completedAt = new Date();
    }
    if (counterId !== undefined) updateData.counterId = counterId || null;

    const queue = await db.queue.update({
      where: { id },
      data: updateData,
      include: { service: true, counter: true },
    });

    // If calling a queue, update counter's currentNum
    if (status === 'dipanggil' && counterId) {
      await db.counter.update({
        where: { id: counterId },
        data: { currentNum: queue.number },
      });
    }

    return NextResponse.json({ queue });
  } catch (error) {
    console.error('Queue PATCH error:', error);
    return NextResponse.json({ error: 'Gagal mengupdate antrian' }, { status: 500 });
  }
}
