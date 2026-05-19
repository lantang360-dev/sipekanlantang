import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const registration = await db.registration.findUnique({
      where: { id },
      select: { fotoKtp: true },
    });

    if (!registration || !registration.fotoKtp) {
      return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 404 });
    }

    // fotoKtp is stored as base64 data URL (e.g., "data:image/jpeg;base64,...")
    const dataUrl = registration.fotoKtp;

    // Parse the data URL
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: 'Format foto tidak valid' }, { status: 500 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Foto KTP GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil foto' }, { status: 500 });
  }
}
