interface WhatsAppConfig {
  apiKey: string;
  deviceUrl?: string;
}

/**
 * Get WhatsApp configuration from database settings.
 * Expected settings keys:
 *   - wa_api_key: Fonnte API key
 *   - wa_device_url: (optional) Custom Fonnte endpoint
 */
export function getWhatsAppConfig(settings: { key: string; value: string }[]): WhatsAppConfig | null {
  const apiKey = settings.find(s => s.key === 'wa_api_key')?.value;
  if (!apiKey) return null;
  const deviceUrl = settings.find(s => s.key === 'wa_device_url')?.value;
  return { apiKey, deviceUrl };
}

/**
 * Format phone number to international format (62xxx)
 */
function formatPhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
  if (cleaned.startsWith('+62')) cleaned = '62' + cleaned.slice(3);
  if (!cleaned.startsWith('62')) cleaned = '62' + cleaned;
  return cleaned;
}

/**
 * Send WhatsApp text message via Fonnte API
 */
async function sendFonnteMessage(
  config: WhatsAppConfig,
  targetPhone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const fonnteUrl = config.deviceUrl || 'https://api.fonnte.com/send';

    const formData = new FormData();
    formData.append('target', targetPhone);
    formData.append('message', message);

    console.log(`[WhatsApp] Sending to ${targetPhone} via ${fonnteUrl}`);

    const response = await fetch(fonnteUrl, {
      method: 'POST',
      headers: {
        'Authorization': config.apiKey,
      },
      body: formData,
    });

    const result = await response.json();
    console.log(`[WhatsApp] Fonnte response:`, JSON.stringify(result));

    if (result.status === true || result.status === 'true' || response.ok) {
      return { success: true };
    } else {
      return { success: false, error: JSON.stringify(result) };
    }
  } catch (error) {
    console.error('[WhatsApp] Fetch error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send WhatsApp notification via Fonnte API
 * - Sends text message with registration details
 * - No image (Fonnte does not support base64 images, only public URLs)
 */
export async function sendWhatsAppNotification(params: {
  phone: string;
  registrationCode: string;
  queueNumber?: string;
  visitorName: string;
  inmateName: string;
  visitDate: string;
  serviceName: string;
  config: WhatsAppConfig;
}): Promise<{ success: boolean; error?: string }> {
  const { phone, registrationCode, visitorName, inmateName, visitDate, serviceName, config } = params;

  try {
    const targetPhone = formatPhone(phone);

    // Build message text
    let message = `✅ *Pendaftaran Diverifikasi*\n\n`;
    message += `📋 *No. Registrasi:* ${registrationCode}\n`;
    message += `\n👤 Nama: ${visitorName}`;
    message += `\n🏷️ Warga Binaan: ${inmateName}`;
    message += `\n📅 Tanggal Kunjungan: ${visitDate}`;
    message += `\n🏢 Layanan: ${serviceName}`;
    message += `\n\nHarap tunjukkan No. Registrasi ini saat datang ke Lapas.`;
    message += `\n\n— SIPEKAN Lapas Kelas IIA Bontang`;

    return await sendFonnteMessage(config, targetPhone, message);
  } catch (error) {
    console.error('[WhatsApp] Error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send a test WhatsApp message
 */
export async function sendTestWhatsApp(params: {
  phone: string;
  config: WhatsAppConfig;
}): Promise<{ success: boolean; error?: string }> {
  const targetPhone = formatPhone(params.phone);
  const message = `🔔 *Test Notifikasi WhatsApp*\n\nIni adalah pesan test dari SIPEKAN Lapas Kelas IIA Bontang.\n\nJika Anda menerima pesan ini, berarti integrasi WhatsApp berhasil! ✅\n\n— SIPEKAN Lapas Kelas IIA Bontang`;
  return await sendFonnteMessage(params.config, targetPhone, message);
}
