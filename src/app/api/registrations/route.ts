import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { visitorName: { contains: search } },
        { code: { contains: search } },
        { visitorNik: { contains: search } },
        { inmateName: { contains: search } },
      ];
    }

    const registrations = await db.registration.findMany({
      where,
      include: { service: true, officer: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ registrations });
  } catch (error) {
    console.error('Registrations GET error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pendaftaran' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      visitorName, visitorNik, visitorPhone, visitorAddress, visitorRelation,
      inmateName, inmateNumber, visitDate, visitTime,
      serviceId, visitorCount, documentKtp, documentSurat, documentOther,
    } = body;

    if (!visitorName || !visitorNik || !visitorPhone || !inmateName || !visitDate || !serviceId) {
      return NextResponse.json({ error: 'Data pendaftaran tidak lengkap' }, { status: 400 });
    }

    const today = getTodayStr();
    const todayCount = await db.registration.count({
      where: { code: { startsWith: `REG-${today}` } },
    });

    const code = `REG-${today}-${String(todayCount + 1).padStart(4, '0')}`;

    const registration = await db.registration.create({
      data: {
        code,
        visitorName,
        visitorNik,
        visitorPhone,
        visitorAddress: visitorAddress || null,
        visitorRelation: visitorRelation || 'Keluarga',
        inmateName,
        inmateNumber: inmateNumber || null,
        visitDate,
        visitTime: visitTime || null,
        serviceId,
        visitorCount: visitorCount || 1,
        documentKtp: documentKtp || false,
        documentSurat: documentSurat || false,
        documentOther: documentOther || null,
        status: 'menunggu',
      },
      include: { service: true },
    });

    return NextResponse.json({ registration }, { status: 201 });
  } catch (error) {
    console.error('Registrations POST error:', error);
    return NextResponse.json({ error: 'Gagal membuat pendaftaran' }, { status: 500 });
  }
}
