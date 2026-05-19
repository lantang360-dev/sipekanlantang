'use client';

import { useSipekanStore } from '@/store/sipekan-store';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, User, FileText, Clock, Shield, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RegistrationDetail {
  id: string;
  code: string;
  visitorName: string;
  visitorNik: string;
  visitorPhone: string;
  visitorAddress: string;
  visitorRelation: string;
  inmateName: string;
  inmateNumber: string;
  visitDate: string;
  visitTime: string;
  visitorCount: number;
  documentKtp: boolean;
  documentSurat: boolean;
  documentOther: string;
  status: string;
  verifyNote: string;
  service: { name: string };
  officer: { name: string; role: string } | null;
  queue: { number: string; service: { name: string } } | null;
}

export function PetugasDetailPage() {
  const { setCurrentPage, officer, selectedRegistrationId } = useSipekanStore();
  const [reg, setReg] = useState<RegistrationDetail | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRegistrationId) {
      fetch(`/api/registrations/${selectedRegistrationId}`)
        .then(r => r.json())
        .then(data => setReg(data.registration))
        .catch(() => {});
    }
  }, [selectedRegistrationId]);

  const handleVerify = async (newStatus: string) => {
    if (!reg || !officer) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/registrations/${reg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          verifiedBy: officer.id,
          verifyNote: note,
        }),
      });
      const data = await res.json();
      if (data.registration) {
        setReg(data.registration);
      }
    } catch {
      alert('Gagal mengupdate status');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow || !reg) return;

    const queueNumber = reg.queue?.number || '-';
    const now = new Date().toLocaleString('id-ID');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bukti Pendaftaran - ${reg.code}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; max-width: 320px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 12px; margin-bottom: 12px; }
          .header h1 { font-size: 18px; color: #0f1d3e; letter-spacing: 2px; margin-bottom: 2px; }
          .header p { font-size: 10px; color: #666; }
          .header .subtitle { font-size: 11px; color: #333; font-weight: 600; margin-top: 4px; }
          .queue-box { text-align: center; border: 3px solid #0f1d3e; border-radius: 8px; padding: 16px; margin: 12px 0; }
          .queue-box .label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
          .queue-box .number { font-size: 36px; font-weight: 900; color: #0f1d3e; letter-spacing: 4px; }
          .info-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #ddd; font-size: 11px; }
          .info-row .label { color: #666; }
          .info-row .value { font-weight: 600; color: #222; text-align: right; max-width: 60%; }
          .footer { margin-top: 16px; padding-top: 12px; border-top: 2px dashed #333; text-align: center; }
          .footer p { font-size: 9px; color: #999; }
          .footer .datetime { font-size: 10px; color: #666; margin-top: 4px; }
          .verified-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; margin-top: 8px; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SIPEKAN</h1>
          <p>Sistem Informasi Pelayanan Besukan Lapas</p>
          <div class="subtitle">Lapas Kelas IIA Bontang</div>
        </div>

        <div style="text-align:center; margin-bottom: 4px;">
          <span class="verified-badge">&#10003; TERVERIFIKASI</span>
        </div>

        <div class="queue-box">
          <div class="label">Nomor Antrian</div>
          <div class="number">${queueNumber}</div>
        </div>

        <div class="info-row"><span class="label">Kode Daftar</span><span class="value">${reg.code}</span></div>
        <div class="info-row"><span class="label">Nama Pengunjung</span><span class="value">${reg.visitorName}</span></div>
        <div class="info-row"><span class="label">NIK</span><span class="value">${reg.visitorNik}</span></div>
        <div class="info-row"><span class="label">Hubungan</span><span class="value">${reg.visitorRelation}</span></div>
        <div class="info-row"><span class="label">Nama WB</span><span class="value">${reg.inmateName}</span></div>
        <div class="info-row"><span class="label">No. Register WB</span><span class="value">${reg.inmateNumber || '-'}</span></div>
        <div class="info-row"><span class="label">Tanggal Kunjungan</span><span class="value">${reg.visitDate}</span></div>
        <div class="info-row"><span class="label">Waktu</span><span class="value">${reg.visitTime || '-'}</span></div>
        <div class="info-row"><span class="label">Layanan</span><span class="value">${reg.service?.name || '-'}</span></div>
        <div class="info-row"><span class="label">Jumlah Pengunjung</span><span class="value">${reg.visitorCount} orang</span></div>
        <div class="info-row"><span class="label">Diverifikasi Oleh</span><span class="value">${reg.officer?.name || '-'}</span></div>

        <div class="footer">
          <p>Bukti ini merupakan tanda pendaftaran yang sah.</p>
          <p>Harap datang sesuai jadwal kunjungan yang tertera.</p>
          <div class="datetime">Dicetak: ${now}</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 300);
  };

  if (!reg) {
    return <div className="text-center py-12 text-white/50">Memuat data...</div>;
  }

  const isProcessed = reg.status !== 'menunggu';
  const isVerified = reg.status === 'diverifikasi';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button onClick={() => setCurrentPage('petugas-dashboard')}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition mb-5">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-5">
        {/* Main Detail */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-bold text-sm mb-4 pb-2 border-b-2 border-blue-50 flex items-center gap-2">
            <User className="w-4 h-4 text-[#0f1d3e]" /> Detail Pendaftaran
          </h3>
          {[
            { label: 'Kode', value: reg.code },
            { label: 'Nama Pengunjung', value: reg.visitorName },
            { label: 'NIK', value: reg.visitorNik },
            { label: 'Telepon', value: reg.visitorPhone },
            { label: 'Alamat', value: reg.visitorAddress || '-' },
            { label: 'Hubungan', value: reg.visitorRelation },
            { label: 'Nama WB', value: reg.inmateName },
            { label: 'No. Register WB', value: reg.inmateNumber || '-' },
            { label: 'Tanggal Kunjungan', value: reg.visitDate },
            { label: 'Waktu', value: reg.visitTime || '-' },
            { label: 'Layanan', value: reg.service?.name },
            { label: 'Jumlah Pengunjung', value: `${reg.visitorCount} orang` },
          ].map((row, i) => (
            <div key={i} className="flex justify-between py-2 text-sm border-b last:border-b-0">
              <span className="text-gray-500 font-medium">{row.label}</span>
              <span className="font-semibold text-right max-w-[60%]">{row.value}</span>
            </div>
          ))}

          {/* Queue Number (if verified and linked) */}
          {isVerified && reg.queue && (
            <div className="mt-4 p-3 bg-[#0f1d3e] rounded-lg text-center">
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">Nomor Antrian</p>
              <p className="text-white text-3xl font-black tracking-widest">{reg.queue.number}</p>
            </div>
          )}

          {/* Document Status */}
          <h4 className="font-bold text-sm mt-4 mb-2">Kelengkapan Dokumen</h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              {reg.documentKtp ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-200" />}
              KTP asli
            </div>
            <div className="flex items-center gap-2 text-sm">
              {reg.documentSurat ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-200" />}
              Surat izin
            </div>
            {reg.documentOther && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                {reg.documentOther}
              </div>
            )}
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-bold text-sm mb-3">Status</h3>
            {reg.status === 'menunggu' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">Menunggu Verifikasi</span>
            )}
            {reg.status === 'diverifikasi' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">Diverifikasi</span>
            )}
            {reg.status === 'ditolak' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">Ditolak</span>
            )}
            {reg.officer && (
              <p className="text-xs text-gray-500 mt-2">Oleh: {reg.officer.name}</p>
            )}
            {reg.verifyNote && (
              <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">Catatan: {reg.verifyNote}</p>
            )}
          </div>

          {!isProcessed && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-bold text-sm mb-3">Aksi</h3>
              <div>
                <Label className="text-xs font-semibold">Catatan Verifikasi</Label>
                <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Tambahkan catatan (opsional)" className="mt-1 mb-3" rows={3} />
              </div>
              <Button onClick={() => handleVerify('diverifikasi')} disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white mb-2">
                <CheckCircle className="w-4 h-4 mr-1" /> Verifikasi
              </Button>
              <Button onClick={() => handleVerify('ditolak')} disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white">
                <XCircle className="w-4 h-4 mr-1" /> Tolak
              </Button>
            </div>
          )}

          {/* Print Receipt - only shown when verified */}
          {isVerified && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-bold text-sm mb-3">Bukti Pendaftaran</h3>
              <p className="text-xs text-gray-500 mb-3">
                Cetak bukti pendaftaran yang telah diverifikasi untuk diberikan kepada pengunjung.
              </p>
              <Button onClick={handlePrintReceipt}
                className="w-full bg-[#0f1d3e] hover:bg-[#162b52] text-white">
                <Printer className="w-4 h-4 mr-2" /> Cetak Bukti Pendaftaran
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
