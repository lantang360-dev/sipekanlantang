import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const counters = await db.counter.findMany({
      include: { service: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ counters });
  } catch (error) {
    console.error('Counters GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data loket' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });
    await db.counter.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Counter DELETE error:', error);
    return NextResponse.json({ error: 'Gagal menghapus loket' }, { status: 500 });
  }
}
