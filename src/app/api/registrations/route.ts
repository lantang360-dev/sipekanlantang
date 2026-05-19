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
      // Informasi Pelaku
      visitorName, visitorNik, tempatLahir, tanggalLahir, jenisKelamin,
      pekerjaan, visitorAddress, visitorPhone, email,
      // Informasi Berkas
      visitorRelation, inmateName, inmateNumber, nomorBerkas,
      jenisBerkas, tanggalBerkas, jenisPermohonan, keterangan,
      // Detail Kunjungan
      visitDate, visitTime, serviceId, visitorCount,
      // Dokumen Pendukung
      documentKtp, documentSurat, documentOther, fotoKtp,
      // Persyaratan
      persetujuanData, persetujuanAturan, persetujuanKonsekuensi, tandaTangan,
    } = body;

    if (!visitorName || !visitorNik || !inmateName || !visitDate || !serviceId) {
      return NextResponse.json({ error: 'Data pendaftaran tidak lengkap' }, { status: 400 });
    }

    // Require KTP photo upload
    if (!fotoKtp) {
      return NextResponse.json({ error: 'Foto KTP/Identitas wajib diupload' }, { status: 400 });
    }

    // Require all agreements
    if (!persetujuanData || !persetujuanAturan || !persetujuanKonsekuensi) {
      return NextResponse.json({ error: 'Semua persyaratan harus disetujui' }, { status: 400 });
    }

    const today = getTodayStr();
    const todayCount = await db.registration.count({
      where: { code: { startsWith: 'P-' } },
    });

    const code = `P-${String(todayCount + 1).padStart(4, '0')}`;

    const registration = await db.registration.create({
      data: {
        code,
        visitorName,
        visitorNik,
        tempatLahir: tempatLahir || null,
        tanggalLahir: tanggalLahir || null,
        jenisKelamin: jenisKelamin || null,
        pekerjaan: pekerjaan || null,
        visitorAddress: visitorAddress || null,
        visitorPhone: visitorPhone || null,
        email: email || null,
        visitorRelation: visitorRelation || 'Keluarga',
        inmateName,
        inmateNumber: inmateNumber || null,
        nomorBerkas: nomorBerkas || null,
        jenisBerkas: jenisBerkas || null,
        tanggalBerkas: tanggalBerkas || null,
        jenisPermohonan: jenisPermohonan || null,
        keterangan: keterangan || null,
        visitDate,
        visitTime: visitTime || null,
        serviceId,
        visitorCount: visitorCount || 1,
        documentKtp: documentKtp || false,
        documentSurat: documentSurat || false,
        documentOther: documentOther || null,
        fotoKtp: fotoKtp || null,
        persetujuanData: persetujuanData || false,
        persetujuanAturan: persetujuanAturan || false,
        persetujuanKonsekuensi: persetujuanKonsekuensi || false,
        tandaTangan: tandaTangan || null,
        status: 'menunggu',
      },
      include: { service: true },
    });

    return NextResponse.json({ registration }, { status: 201 });
  } catch (error) {
    console.error('Registrations POST error:', error);
    const msg = error instanceof Error ? error.message : 'Gagal membuat pendaftaran';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
