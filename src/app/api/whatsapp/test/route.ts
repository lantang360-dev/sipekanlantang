import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendTestWhatsApp, getWhatsAppConfig } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ error: 'Nomor telepon wajib diisi' }, { status: 400 });
    }

    const settings = await db.setting.findMany();
    const waConfig = getWhatsAppConfig(settings);

    if (!waConfig) {
      return NextResponse.json({ error: 'WhatsApp belum dikonfigurasi. Masukkan API Key terlebih dahulu.' }, { status: 400 });
    }

    const result = await sendTestWhatsApp({ phone, config: waConfig });

    if (result.success) {
      return NextResponse.json({ success: true, message: `Pesan test terkirim ke ${phone}` });
    } else {
      return NextResponse.json({ success: false, error: result.error || 'Gagal mengirim pesan test' }, { status: 500 });
    }
  } catch (error) {
    console.error('WhatsApp test error:', error);
    return NextResponse.json({ error: 'Gagal mengirim pesan test' }, { status: 500 });
  }
}
