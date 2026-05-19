import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const services = await db.service.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Services error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data layanan' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, estimatedMin, prefix, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID layanan wajib diisi' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (estimatedMin !== undefined) updateData.estimatedMin = estimatedMin;
    if (prefix !== undefined) updateData.prefix = prefix;
    if (isActive !== undefined) updateData.isActive = isActive;

    const service = await db.service.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Update service error:', error);
    return NextResponse.json({ error: 'Gagal mengupdate layanan' }, { status: 500 });
  }
}
