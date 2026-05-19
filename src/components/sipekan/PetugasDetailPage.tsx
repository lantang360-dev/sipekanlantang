'use client';

import { useSipekanStore } from '@/store/sipekan-store';
import { useState, useEffect } from 'react';
import {
  ArrowLeft, CheckCircle, XCircle, User, FileText, Clock, Shield,
  Printer, Upload, ClipboardCheck, ImageIcon, ZoomIn, X, AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RegistrationDetail {
  id: string;
  code: string;
  // Informasi Pelaku
  visitorName: string;
  visitorNik: string;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  jenisKelamin: string | null;
  pekerjaan: string | null;
  visitorAddress: string | null;
  visitorPhone: string | null;
  email: string | null;
  // Informasi Berkas
  visitorRelation: string;
  inmateName: string;
  inmateNumber: string | null;
  nomorBerkas: string | null;
  jenisBerkas: string | null;
  tanggalBerkas: string | null;
  jenisPermohonan: string | null;
  keterangan: string | null;
  // Detail Kunjungan
  visitDate: string;
  visitTime: string | null;
  visitorCount: number;
  // Dokumen
  documentKtp: boolean;
  documentSurat: boolean;
  documentOther: string | null;
  fotoKtp: string | null;
  tandaTangan: string | null;
  // Persyaratan
  persetujuanData: boolean;
  persetujuanAturan: boolean;
  persetujuanKonsekuensi: boolean;
  // Status
  status: string;
  verifyNote: string | null;
  service: { name: string };
  officer: { name: string; role: string } | null;
  queue: { number: string; service: { name: string } } | null;
}

export function PetugasDetailPage() {
  const { setCurrentPage, officer, selectedRegistrationId } = useSipekanStore();
  const [reg, setReg] = useState<RegistrationDetail | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFotoZoom, setShowFotoZoom] = useState(false);
  const [showSignatureZoom, setShowSignatureZoom] = useState(false);
  const [waStatus, setWaStatus] = useState<{ sent: boolean; message: string } | null>(null);

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
      // Show WhatsApp status
      if (data.waStatus) {
        setWaStatus(data.waStatus);
      } else if (newStatus === 'diverifikasi') {
        setWaStatus(null);
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
        <div class="info-row"><span class="label">Tempat/Tgl Lahir</span><span class="value">${reg.tempatLahir || '-'}, ${reg.tanggalLahir || '-'}</span></div>
        <div class="info-row"><span class="label">Jenis Kelamin</span><span class="value">${reg.jenisKelamin || '-'}</span></div>
        <div class="info-row"><span class="label">Pekerjaan</span><span class="value">${reg.pekerjaan || '-'}</span></div>
        <div class="info-row"><span class="label">Telepon</span><span class="value">${reg.visitorPhone || '-'}</span></div>
        <div class="info-row"><span class="label">Hubungan</span><span class="value">${reg.visitorRelation}</span></div>
        <div class="info-row"><span class="label">Nama WB</span><span class="value">${reg.inmateName}</span></div>
        <div class="info-row"><span class="label">No. Registrasi WNI</span><span class="value">${reg.inmateNumber || '-'}</span></div>
        <div class="info-row"><span class="label">Jenis Berkas</span><span class="value">${reg.jenisBerkas || '-'}</span></div>
        <div class="info-row"><span class="label">Jenis Permohonan</span><span class="value">${reg.jenisPermohonan || '-'}</span></div>
        <div class="info-row"><span class="label">Tanggal Kunjungan</span><span class="value">${reg.visitDate}</span></div>
        <div class="info-row"><span class="label">Layanan</span><span class="value">${reg.service?.name || '-'}</span></div>
        <div class="info-row"><span class="label">Jumlah Pengunjung</span><span class="value">${reg.visitorCount} orang</span></div>
        <div class="info-row"><span class="label">Diverifikasi Oleh</span><span class="value">${reg.officer?.name || '-'}</span></div>

        <div class="footer">
          <p>Bukti ini merupakan tanda pendaftaran yang sah.</p>
          <p>Wajib membawa KTP/Identitas Lainnya Asli saat kunjungan.</p>
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

  const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="flex justify-between py-2 text-sm border-b border-gray-100 last:border-b-0">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="font-semibold text-right max-w-[60%]">{value || '-'}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button onClick={() => setCurrentPage('petugas-dashboard')}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition mb-5">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* Main Detail */}
        <div className="space-y-4">

          {/* Section: Informasi Pelaku */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-[#0f1d3e] px-5 py-3 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Data Pribadi Pengunjung</h3>
            </div>
            <div className="p-4 divide-y divide-gray-100">
              <InfoRow label="Kode Pendaftaran" value={reg.code} />
              <InfoRow label="Nama Lengkap" value={reg.visitorName} />
              <InfoRow label="NIK / No. KTP" value={reg.visitorNik} />
              <InfoRow label="Tempat Lahir" value={reg.tempatLahir} />
              <InfoRow label="Tanggal Lahir" value={reg.tanggalLahir} />
              <InfoRow label="Jenis Kelamin" value={reg.jenisKelamin} />
              <InfoRow label="Pekerjaan" value={reg.pekerjaan} />
              <InfoRow label="Alamat Lengkap" value={reg.visitorAddress} />
              <InfoRow label="Nomor Telepon" value={reg.visitorPhone} />
              <InfoRow label="Email" value={reg.email} />
            </div>
          </div>

          {/* Section: Informasi Berkas */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-[#0f1d3e] px-5 py-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Informasi Kunjungan</h3>
            </div>
            <div className="p-4 divide-y divide-gray-100">
              <InfoRow label="Nama Warga Binaan" value={reg.inmateName} />
              <InfoRow label="No. Registrasi WNI" value={reg.inmateNumber} />
              <InfoRow label="Hubungan" value={reg.visitorRelation} />
              <InfoRow label="Nomor Berkas" value={reg.nomorBerkas} />
              <InfoRow label="Jenis Berkas" value={reg.jenisBerkas} />
              <InfoRow label="Tanggal Berkas" value={reg.tanggalBerkas} />
              <InfoRow label="Jenis Permohonan" value={reg.jenisPermohonan} />
              <InfoRow label="Tanggal Kunjungan" value={reg.visitDate} />
              <InfoRow label="Waktu Kunjungan" value={reg.visitTime} />
              <InfoRow label="Layanan" value={reg.service?.name} />
              <InfoRow label="Jumlah Pengunjung" value={`${reg.visitorCount} orang`} />
              {reg.keterangan && <InfoRow label="Keterangan" value={reg.keterangan} />}
            </div>
          </div>

          {/* Section: Dokumen Pendukung - KTP Photo Verification */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-[#0f1d3e] px-5 py-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Dokumen Pendukung</h3>
            </div>
            <div className="p-4">
              {/* Document checkboxes status */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  {reg.documentKtp ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-200" />}
                  <span className="font-medium">KTP / Identitas Lainnya Asli</span>
                  {reg.documentKtp && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Terverifikasi</span>}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {reg.documentSurat ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-200" />}
                  <span>Surat Keterangan / Izin</span>
                </div>
                {reg.documentOther && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{reg.documentOther}</span>
                  </div>
                )}
              </div>

              {/* KTP Photo Display - for verification sync */}
              {reg.fotoKtp && (
                <div className="border-2 border-amber-200 rounded-lg p-3 bg-amber-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-800">Foto KTP / Identitas Asli</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFotoZoom(true)}
                      className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium bg-amber-100 px-2.5 py-1 rounded-full transition"
                    >
                      <ZoomIn className="w-3.5 h-3.5" /> Perbesar
                    </button>
                  </div>
                  <div className="relative rounded-md overflow-hidden bg-white border border-gray-200 cursor-pointer" onClick={() => setShowFotoZoom(true)}>
                    <img
                      src={`/api/registrations/${reg.id}/foto-ktp`}
                      alt="Foto KTP"
                      className="w-full max-h-48 object-contain"
                    />
                  </div>
                  <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verifikasi kesesuaian foto KTP/Identitas Asli dengan data pengunjung dan dokumen asli yang dibawa
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Persyaratan & Tanda Tangan */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-[#0f1d3e] px-5 py-3 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Persyaratan</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  {reg.persetujuanData ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-200" />}
                  <span className="text-xs">Data yang diberikan adalah benar</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {reg.persetujuanAturan ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-200" />}
                  <span className="text-xs">Mematuhi peraturan yang berlaku</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {reg.persetujuanKonsekuensi ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-200" />}
                  <span className="text-xs">Mengetahui konsekuensi jika data tidak benar</span>
                </div>
              </div>

              {/* Digital Signature Display */}
              {reg.tandaTangan && (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">Tanda Tangan Digital</span>
                    <button
                      type="button"
                      onClick={() => setShowSignatureZoom(true)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium bg-gray-100 px-2 py-0.5 rounded-full transition"
                    >
                      <ZoomIn className="w-3 h-3" /> Perbesar
                    </button>
                  </div>
                  <img
                    src={reg.tandaTangan}
                    alt="Tanda Tangan"
                    className="max-h-20 object-contain cursor-pointer"
                    onClick={() => setShowSignatureZoom(true)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Queue Number (if verified) */}
          {isVerified && reg.queue && (
            <div className="p-4 bg-[#0f1d3e] rounded-lg text-center">
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">Nomor Antrian</p>
              <p className="text-white text-3xl font-black tracking-widest">{reg.queue.number}</p>
            </div>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">
          {/* Status Card */}
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
            {/* WhatsApp Status */}
            {waStatus && (
              <div className={`mt-3 p-3 rounded-lg text-xs flex items-start gap-2 ${waStatus.sent ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
                <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{waStatus.sent ? 'WhatsApp Terkirim' : 'WhatsApp Tidak Terkirim'}</p>
                  <p className="mt-0.5">{waStatus.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Verification Guide - shown when menunggu */}
          {reg.status === 'menunggu' && (
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
              <h4 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Panduan Verifikasi KTP/Identitas
              </h4>
              <ol className="text-xs text-amber-700 space-y-1.5 list-decimal list-inside">
                <li>Periksa kesesuaian <strong>nama lengkap</strong> dengan foto KTP/Identitas</li>
                <li>Periksa kesesuaian <strong>NIK</strong> dengan foto KTP/Identitas</li>
                <li>Periksa <strong>tempat & tanggal lahir</strong> sesuai KTP/Identitas</li>
                <li>Periksa <strong>alamat</strong> sesuai KTP/Identitas</li>
                <li>Periksa <strong>foto KTP/Identitas asli</strong> yang dibawa pengunjung</li>
                <li>Verifikasi tanda tangan digital</li>
                <li>Pastikan KTP/Identitas <strong>masih berlaku</strong></li>
                <li>Klik &quot;Verifikasi&quot; jika semua data sesuai</li>
              </ol>
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-[11px] text-red-700 flex items-start gap-1.5">
                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                <span><strong>WAJIB</strong> - Pengunjung harus membawa KTP/Identitas Lainnya Asli saat kunjungan. Verifikasi hanya bisa dilakukan jika foto KTP yang diupload sesuai dengan dokumen asli.</span>
              </div>
            </div>
          )}

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

          {/* Print Receipt */}
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

      {/* Foto KTP Zoom Modal */}
      {showFotoZoom && reg.fotoKtp && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowFotoZoom(false)}>
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowFotoZoom(false)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-2">
              <img
                src={`/api/registrations/${reg.id}/foto-ktp`}
                alt="Foto KTP (Zoom)"
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{reg.visitorName}</p>
                <p className="text-xs text-gray-500">NIK: {reg.visitorNik}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                  KTP / Identitas Asli
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Zoom Modal */}
      {showSignatureZoom && reg.tandaTangan && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowSignatureZoom(false)}>
          <div className="relative max-w-xl bg-white rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowSignatureZoom(false)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4">
              <p className="text-sm font-semibold mb-2">Tanda Tangan Digital</p>
              <img
                src={reg.tandaTangan}
                alt="Tanda Tangan (Zoom)"
                className="max-w-full max-h-60 object-contain border rounded-lg bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-2">Pemohon: {reg.visitorName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
