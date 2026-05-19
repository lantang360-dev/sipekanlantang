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
