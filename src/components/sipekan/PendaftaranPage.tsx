'use client';

import { useSipekanStore } from '@/store/sipekan-store';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, UserPlus, FileText, Upload, CheckCircle,
  ClipboardCheck, Camera, X, Image as ImageIcon, Shield, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface Service {
  id: string;
  name: string;
  prefix: string;
}

const JENIS_BERKAS_OPTIONS = [
  'Perkara Pidana',
  'Perkara Anak',
  'Hak Asasi Manusia',
  'Pemasyarakatan',
  'Lainnya',
];

const JENIS_PERMOHONAN_OPTIONS = [
  'Besukan Keluarga',
  'Besukan Anak',
  'Besukan Khusus',
  'Kunjungan Advokat',
  'Kunjungan Konsuler',
  'Lainnya',
];

const HUBUNGAN_OPTIONS = [
  'Keluarga',
  'Orang Tua',
  'Saudara',
  'Pasangan',
  'Anak',
  'Advokat',
  'Lainnya',
];

export function PendaftaranPage() {
  const { setCurrentPage } = useSipekanStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<string | null>(null); // base64
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const [form, setForm] = useState({
    // Data Pribadi Pengunjung
    visitorName: '',
    visitorNik: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    pekerjaan: '',
    visitorAddress: '',
    visitorPhone: '',
    email: '',
    // Informasi Kunjungan
    visitorRelation: 'Keluarga',
    inmateName: '',
    inmateNumber: '',
    nomorBerkas: '',
    jenisBerkas: '',
    tanggalBerkas: '',
    jenisPermohonan: '',
    keterangan: '',
    // Detail Kunjungan
    visitDate: '',
    visitTime: '',
    serviceId: '',
    visitorCount: '1',
    // Dokumen Pendukung
    documentKtp: false,
    documentSurat: false,
    documentOther: '',
    // Persyaratan
    persetujuanData: false,
    persetujuanAturan: false,
    persetujuanKonsekuensi: false,
  });

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(d => setServices(d.services || [])).catch(() => {});
  }, []);

  // Handle file upload for KTP/Identitas photo
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format file harus JPG, PNG, atau WebP');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFotoPreview(result);
      setFotoFile(result);
      setForm(f => ({ ...f, documentKtp: true }));
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle drag and drop
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format file harus JPG, PNG, atau WebP');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFotoPreview(result);
      setFotoFile(result);
      setForm(f => ({ ...f, documentKtp: true }));
    };
    reader.readAsDataURL(file);
  }, []);

  // Digital Signature Canvas
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setHasSigned(true);
    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;
    if ('touches' in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f1d3e';
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  }, []);

  const getSignatureBase64 = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas || !hasSigned) return null;
    return canvas.toDataURL('image/png');
  }, [hasSigned]);

  const removeFoto = useCallback(() => {
    setFotoPreview(null);
    setFotoFile(null);
    setForm(f => ({ ...f, documentKtp: false }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required KTP/Identitas photo - MUST be uploaded
    if (!fotoFile) {
      alert('Foto KTP / Identitas Lainnya Asli wajib diupload untuk verifikasi');
      return;
    }

    // Validate agreements
    if (!form.persetujuanData || !form.persetujuanAturan || !form.persetujuanKonsekuensi) {
      alert('Semua persyaratan harus disetujui');
      return;
    }

    const signature = getSignatureBase64();
    if (!signature) {
      alert('Tanda tangan digital wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          visitorCount: parseInt(form.visitorCount),
          fotoKtp: fotoFile,
          tandaTangan: signature,
        }),
      });
      const data = await res.json();
      if (data.registration) {
        setSuccess(data.registration.code);
      } else {
        alert(data.error || 'Gagal mendaftar');
      }
    } catch {
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Success view
  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-gray-500 text-sm mb-4">Kode pendaftaran Anda:</p>
          <div className="inline-flex items-center bg-[#0f1d3e] text-white rounded-xl px-8 py-4 text-2xl font-black tracking-wider mb-6">
            {success}
          </div>
          <p className="text-xs text-gray-500 mb-6">Simpan kode ini untuk memantau status pendaftaran Anda.</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 text-left mb-6 flex items-start gap-2">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Foto KTP/Identitas Anda akan diverifikasi oleh petugas. Pastikan membawa dokumen asli saat kunjungan.</span>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="outline" onClick={() => setCurrentPage('status-antrian')}>Cek Status Pendaftaran</Button>
            <Button onClick={() => setCurrentPage('dashboard')} className="bg-[#0f1d3e] hover:bg-[#162b52]">Kembali ke Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button onClick={() => setCurrentPage('dashboard')}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition mb-5">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-[#0f1d3e]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Pendaftaran Kunjungan</h1>
          <p className="text-white/50 text-sm">Isi formulir berikut untuk mendaftar kunjungan besukan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ===== Section 1: Data Pribadi Pengunjung ===== */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-[#0f1d3e] px-5 py-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Data Pribadi Pengunjung</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Nama Lengkap <span className="text-red-500">*</span></Label>
                <Input required value={form.visitorName} onChange={e => setForm({...form, visitorName: e.target.value})} placeholder="Nama sesuai KTP/Identitas" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">NIK / No. KTP <span className="text-red-500">*</span></Label>
                <Input required value={form.visitorNik} onChange={e => setForm({...form, visitorNik: e.target.value.replace(/\D/g, '').slice(0, 16)})} placeholder="16 digit NIK" maxLength={16} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Jenis Kelamin</Label>
                <Select value={form.jenisKelamin} onValueChange={v => setForm({...form, jenisKelamin: v})}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih Jenis Kelamin" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Tempat Lahir</Label>
                <Input value={form.tempatLahir} onChange={e => setForm({...form, tempatLahir: e.target.value})} placeholder="Kota/Kabupaten" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Tanggal Lahir</Label>
                <Input type="date" value={form.tanggalLahir} onChange={e => setForm({...form, tanggalLahir: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Pekerjaan</Label>
                <Input value={form.pekerjaan} onChange={e => setForm({...form, pekerjaan: e.target.value})} placeholder="Pekerjaan" className="mt-1" />
              </div>
            </div>
            <div className="mt-3">
              <Label className="text-xs font-semibold">Alamat Lengkap</Label>
              <Textarea value={form.visitorAddress} onChange={e => setForm({...form, visitorAddress: e.target.value})} placeholder="Alamat lengkap sesuai KTP/Identitas" className="mt-1" rows={2} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <Label className="text-xs font-semibold">Nomor Telepon <span className="text-red-500">*</span></Label>
                <Input required value={form.visitorPhone} onChange={e => setForm({...form, visitorPhone: e.target.value})} placeholder="08xxxxxxxxxx" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@contoh.com" className="mt-1" />
              </div>
            </div>
          </div>
        </div>

        {/* ===== Section 2: Informasi Kunjungan ===== */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-[#0f1d3e] px-5 py-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Informasi Kunjungan</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Nama Warga Binaan <span className="text-red-500">*</span></Label>
                <Input required value={form.inmateName} onChange={e => setForm({...form, inmateName: e.target.value})} placeholder="Nama warga binaan" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">No. Registrasi WNI</Label>
                <Input value={form.inmateNumber} onChange={e => setForm({...form, inmateNumber: e.target.value})} placeholder="Nomor registrasi" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Hubungan <span className="text-red-500">*</span></Label>
                <Select value={form.visitorRelation} onValueChange={v => setForm({...form, visitorRelation: v})}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih Hubungan" /></SelectTrigger>
                  <SelectContent>
                    {HUBUNGAN_OPTIONS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Jenis Permohonan</Label>
                <Select value={form.jenisPermohonan} onValueChange={v => setForm({...form, jenisPermohonan: v})}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih jenis permohonan" /></SelectTrigger>
                  <SelectContent>
                    {JENIS_PERMOHONAN_OPTIONS.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Jenis Berkas</Label>
                <Select value={form.jenisBerkas} onValueChange={v => setForm({...form, jenisBerkas: v})}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih jenis berkas" /></SelectTrigger>
                  <SelectContent>
                    {JENIS_BERKAS_OPTIONS.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Nomor Berkas</Label>
                <Input value={form.nomorBerkas} onChange={e => setForm({...form, nomorBerkas: e.target.value})} placeholder="Nomor berkas perkara" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Tanggal Berkas</Label>
                <Input type="date" value={form.tanggalBerkas} onChange={e => setForm({...form, tanggalBerkas: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Layanan <span className="text-red-500">*</span></Label>
                <Select required value={form.serviceId} onValueChange={v => setForm({...form, serviceId: v})}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih layanan" /></SelectTrigger>
                  <SelectContent>
                    {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <Label className="text-xs font-semibold">Tanggal Kunjungan <span className="text-red-500">*</span></Label>
                <Input required type="date" value={form.visitDate} onChange={e => setForm({...form, visitDate: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Jumlah Pengunjung</Label>
                <Select value={form.visitorCount} onValueChange={v => setForm({...form, visitorCount: v})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3].map(n => <SelectItem key={n} value={String(n)}>{n} orang</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-3">
              <Label className="text-xs font-semibold">Keterangan Tambahan</Label>
              <Textarea value={form.keterangan} onChange={e => setForm({...form, keterangan: e.target.value})} placeholder="Keterangan tambahan (opsional)" className="mt-1" rows={3} />
            </div>
          </div>
        </div>

        {/* ===== Section 3: Dokumen Pendukung ===== */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-[#0f1d3e] px-5 py-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Dokumen Pendukung</h3>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 mb-4">
              Upload dokumen berikut untuk verifikasi identitas:
            </p>

            {/* Document checklist */}
            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="shrink-0 mt-0.5">
                  <CheckCircle className={`w-5 h-5 ${fotoFile ? 'text-green-500' : 'text-red-300'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm">KTP / Identitas Lainnya Asli</span>
                    <span className="text-red-500 text-xs font-bold">WAJIB</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">Wajib upload foto KTP/Identitas yang masih berlaku untuk verifikasi data pengunjung</p>
                  {fotoFile && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-700 font-semibold">
                      <CheckCircle className="w-3 h-3" /> Foto telah diupload
                    </span>
                  )}
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer text-sm p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition">
                <Checkbox checked={form.documentSurat} onCheckedChange={c => setForm({...form, documentSurat: !!c})} />
                <div>
                  <span className="font-medium">Surat Keterangan / Izin Kunjungan</span>
                  <p className="text-xs text-gray-500 mt-0.5">Jika diperlukan untuk kunjungan khusus (opsional)</p>
                </div>
              </label>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <Label className="text-xs font-semibold">Dokumen lainnya</Label>
                <Input value={form.documentOther} onChange={e => setForm({...form, documentOther: e.target.value})} placeholder="Sebutkan jika ada dokumen lain" className="mt-1" />
              </div>
            </div>

            {/* Photo Upload Area - KTP/Identitas */}
            <div className={`border-2 border-dashed rounded-lg p-1 transition-colors ${!fotoFile ? 'border-red-300 bg-red-50/30' : 'border-green-300 bg-green-50/30'}`}>
              {fotoPreview ? (
                <div className="relative">
                  <img
                    src={fotoPreview}
                    alt="Preview KTP/Identitas"
                    className="w-full max-h-64 object-contain rounded-md"
                  />
                  <button
                    type="button"
                    onClick={removeFoto}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Foto KTP/Identitas terupload
                  </div>
                </div>
              ) : (
                <div
                  className={`flex flex-col items-center justify-center py-8 cursor-pointer transition-colors rounded-md ${
                    isDragOver ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                    <Camera className="w-7 h-7 text-amber-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Klik untuk upload atau drag & drop</p>
                  <p className="text-xs text-gray-500">Foto KTP / Identitas Lainnya Asli yang masih berlaku</p>
                  <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, WebP • Maks. 10MB</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-red-500 font-medium">
                    <AlertTriangle className="w-3 h-3" /> Wajib diupload untuk verifikasi
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* ===== Section 4: Persyaratan ===== */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-[#0f1d3e] px-5 py-3 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Persyaratan</h3>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 mb-4">
              Dengan mengisi formulir ini, Anda:
            </p>

            <div className="space-y-3 mb-5">
              <label className="flex items-start gap-3 cursor-pointer text-sm">
                <Checkbox checked={form.persetujuanData} onCheckedChange={c => setForm({...form, persetujuanData: !!c})} />
                <span>Menyatakan bahwa data yang diberikan adalah benar dan dapat dipertanggungjawabkan</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer text-sm">
                <Checkbox checked={form.persetujuanAturan} onCheckedChange={c => setForm({...form, persetujuanAturan: !!c})} />
                <span>Dinyatakan mengetahui dan mematuhi peraturan yang berlaku di Lapas Kelas IIA Bontang</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer text-sm">
                <Checkbox checked={form.persetujuanKonsekuensi} onCheckedChange={c => setForm({...form, persetujuanKonsekuensi: !!c})} />
                <span>Dinyatakan mengetahui konsekuensi jika data yang diberikan tidak benar</span>
              </label>
            </div>

            {/* Digital Signature */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Tanda Tangan Digital <span className="text-red-500">*</span>
                </Label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs text-gray-500 hover:text-red-500 transition flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Hapus
                </button>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-md overflow-hidden bg-gray-50">
                <canvas
                  ref={signatureCanvasRef}
                  width={600}
                  height={160}
                  className="w-full h-32 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              {!hasSigned && (
                <p className="text-xs text-gray-400 mt-1.5 text-center italic">
                  Tanda tangan digital Anda (Wajib diisi untuk menandatangani)
                </p>
              )}
              {hasSigned && (
                <p className="text-xs text-green-600 mt-1.5 text-center font-medium flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Tanda tangan telah dibubuhkan
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-300 rounded-md p-3 text-xs text-amber-800 flex items-start gap-2">
          <Shield className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Pastikan semua data yang dimasukkan sudah benar sesuai KTP/Identitas Asli. Foto KTP/Identitas yang diupload akan diverifikasi oleh petugas saat kunjungan. Dokumen yang tidak sesuai dapat menyebabkan pendaftaran ditolak.</span>
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={loading} className="w-full bg-[#0f1d3e] hover:bg-[#162b52] text-white py-3 text-base font-bold">
          {loading ? 'Memproses...' : 'Kirim Pendaftaran'}
        </Button>
      </form>
    </div>
  );
}
