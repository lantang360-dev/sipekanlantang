import QRCode from 'qrcode';

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
 * Generate QR code as base64 PNG image
 */
export async function generateQRCode(text: string): Promise<string> {
  const qrDataUrl = await QRCode.toDataURL(text, {
    width: 300,
    margin: 2,
    color: { dark: '#0f1d3e', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  });
  // Convert data URL to raw base64
  return qrDataUrl.replace(/^data:image\/png;base64,/, '');
}

/**
 * Send WhatsApp notification via Fonnte API
 * - Sends text message with registration info
 * - Attaches QR code image containing the registration code
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
  const { phone, registrationCode, queueNumber, visitorName, inmateName, visitDate, serviceName, config } = params;

  try {
    const targetPhone = formatPhone(phone);

    // Build message text
    let message = `✅ *Pendaftaran Diverifikasi*\n\n`;
    message += `📋 *No. Registrasi:* ${registrationCode}\n`;
    if (queueNumber) {
      message += `🎟️ *No. Antrian:* ${queueNumber}\n`;
    }
    message += `\n👤 Nama: ${visitorName}`;
    message += `\n🏷️ Warga Binaan: ${inmateName}`;
    message += `\n📅 Tanggal Kunjungan: ${visitDate}`;
    message += `\n🏢 Layanan: ${serviceName}`;
    message += `\n\nScan QR code di bawah untuk melihat detail pendaftaran.`;
    message += `\n\n— SIPEKAN Lapas Kelas IIA Bontang`;

    // Generate QR code image (registration code as content)
    const qrBase64 = await generateQRCode(registrationCode);

    // Send via Fonnte API
    const fonnteUrl = config.deviceUrl || 'https://api.fonnte.com/send';

    const formData = new FormData();
    formData.append('target', targetPhone);
    formData.append('message', message);
    formData.append('image', `data:image/png;base64,${qrBase64}`);
    formData.append('filename', `QR-${registrationCode}.png`);

    const response = await fetch(fonnteUrl, {
      method: 'POST',
      headers: {
        'Authorization': config.apiKey,
      },
      body: formData,
    });

    const result = await response.json();

    if (result.status === true || result.status === 'true' || response.ok) {
      console.log(`[WhatsApp] Sent to ${targetPhone} for ${registrationCode}:`, result);
      return { success: true };
    } else {
      console.error(`[WhatsApp] Failed for ${targetPhone}:`, result);
      return { success: false, error: JSON.stringify(result) };
    }
  } catch (error) {
    console.error('[WhatsApp] Error:', error);
    return { success: false, error: String(error) };
  }
}
