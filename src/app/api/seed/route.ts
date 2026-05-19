import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Simple auth check - requires secret key in header or query param
// This prevents unauthorized seeding of the database
function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('x-seed-secret');
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  const secret = process.env.SEED_SECRET || 'sipekan-seed-2024';
  return authHeader === secret || querySecret === secret;
}

export async function GET(request: Request) {
  // Auth check
  if (!isAuthorized(request)) {
    return NextResponse.json({ 
      error: 'Unauthorized. Provide x-seed-secret header or ?secret= query param.' 
    }, { status: 401 });
  }

  try {
    const saltRounds = 10;

    // Seed officers with hashed passwords
    const adminHash = await bcrypt.hash('admin123', saltRounds);
    const petugasHash = await bcrypt.hash('petugas123', saltRounds);

    const officers = await Promise.all([
      db.officer.upsert({ 
        where: { username: 'admin' }, 
        update: { password: adminHash }, 
        create: { username: 'admin', password: adminHash, name: 'Administrator', role: 'admin' } 
      }),
      db.officer.upsert({ 
        where: { username: 'petugas1' }, 
        update: { password: petugasHash }, 
        create: { username: 'petugas1', password: petugasHash, name: 'Petugas Loket 1', role: 'petugas' } 
      }),
      db.officer.upsert({ 
        where: { username: 'petugas2' }, 
        update: { password: petugasHash }, 
        create: { username: 'petugas2', password: petugasHash, name: 'Petugas Loket 2', role: 'petugas' } 
      }),
    ]);

    // Seed services
    const services = await Promise.all([
      db.service.upsert({ where: { prefix: 'B' }, update: {}, create: { name: 'Besukan Tatap Muka', prefix: 'B', description: 'Layanan kunjungan tatap muka dengan warga binaan', estimatedMin: 30, order: 1 } }),
      db.service.upsert({ where: { prefix: 'P' }, update: {}, create: { name: 'Penitipan Barang', prefix: 'P', description: 'Layanan penitipan barang untuk warga binaan', estimatedMin: 15, order: 2 } }),
      db.service.upsert({ where: { prefix: 'A' }, update: { name: 'Daftar Online', description: 'Antrian khusus pendaftar online yang sudah diverifikasi', estimatedMin: 10 }, create: { name: 'Daftar Online', prefix: 'A', description: 'Antrian khusus pendaftar online yang sudah diverifikasi', estimatedMin: 10, order: 3 } }),
    ]);

    // Seed counters — 4 loket
    const existingCounters = await db.counter.count();
    if (existingCounters === 0) {
      await db.counter.createMany({ data: [
        { name: 'Loket 1', serviceId: services[0].id, status: 'aktif', currentNum: '', order: 1 },
        { name: 'Loket 2', serviceId: services[0].id, status: 'aktif', currentNum: '', order: 2 },
        { name: 'Loket 3', serviceId: services[1].id, status: 'aktif', currentNum: '', order: 3 },
        { name: 'Loket 4', serviceId: services[2].id, status: 'aktif', currentNum: '', order: 4 },
      ]});
    }

    // Seed settings
    const settings = [
      { key: 'open_hour', value: '08:00' },
      { key: 'close_hour', value: '15:00' },
      { key: 'max_visitors', value: '3' },
      { key: 'visit_days', value: 'Senin,Jumat' },
      { key: 'institution_name', value: 'Lapas Kelas IIA Bontang' },
      { key: 'marquee_text', value: 'Selamat datang di Pelayanan Besukan Lapas Kelas IIA Bontang. Pastikan Anda membawa KTP asli yang masih berlaku. Maksimal 3 orang pengunjung per warga binaan.' },
    ];
    for (const s of settings) {
      await db.setting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
    }

    return NextResponse.json({ success: true, officers: officers.length, services: services.length, note: 'Passwords are hashed with bcrypt' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
