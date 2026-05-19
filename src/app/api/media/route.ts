import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const items = await db.mediaItem.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Media GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil media' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { type, mediaId, title } = await request.json();
    if (!type || !mediaId || !title) {
      return NextResponse.json({ error: 'Data media tidak lengkap' }, { status: 400 });
    }
    const maxOrder = await db.mediaItem.aggregate({ _max: { order: true } });
    const item = await db.mediaItem.create({
      data: { type, mediaId, title, order: (maxOrder._max.order || 0) + 1 },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Media POST error:', error);
    return NextResponse.json({ error: 'Gagal menambah media' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });
    await db.mediaItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Media DELETE error:', error);
    return NextResponse.json({ error: 'Gagal menghapus media' }, { status: 500 });
  }
}
