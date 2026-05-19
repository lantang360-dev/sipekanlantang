'use client';

import { useSipekanStore } from '@/store/sipekan-store';
import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, CheckCircle, UserPlus } from 'lucide-react';
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

export function PendaftaranPage() {
  const { setCurrentPage } = useSipekanStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    visitorName: '', visitorNik: '', visitorPhone: '', visitorAddress: '',
    visitorRelation: 'Keluarga', inmateName: '', inmateNumber: '',
    visitDate: '', visitTime: '', serviceId: '', visitorCount: '1',
    documentKtp: false, documentSurat: false, documentOther: '',
  });

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(d => setServices(d.services || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          visitorCount: parseInt(form.visitorCount),
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
          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="outline" onClick={() => setCurrentPage('status-antrian')}>Cek Status Pendaftaran</Button>
            <Button onClick={() => setCurrentPage('dashboard')} className="bg-[#0f1d3e] hover:bg-[#162b52]">Kembali ke Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
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
        {/* Data Pengunjung */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-bold text-sm mb-4 pb-2 border-b-2 border-blue-50 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#0f1d3e]" /> Data Pengunjung
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Nama Lengkap <span className="text-red-500">*</span></Label>
              <Input required value={form.visitorName} onChange={e => setForm({...form, visitorName: e.target.value})} placeholder="Nama sesuai KTP" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold">NIK <span className="text-red-500">*</span></Label>
              <Input required value={form.visitorNik} onChange={e => setForm({...form, visitorNik: e.target.value})} placeholder="16 digit NIK" maxLength={16} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold">No. Telepon <span className="text-red-500">*</span></Label>
              <Input required value={form.visitorPhone} onChange={e => setForm({...form, visitorPhone: e.target.value})} placeholder="08xxxxxxxxxx" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Hubungan</Label>
              <Select value={form.visitorRelation} onValueChange={v => setForm({...form, visitorRelation: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Keluarga">Keluarga</SelectItem>
                  <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                  <SelectItem value="Saudara">Saudara</SelectItem>
                  <SelectItem value="Pasangan">Pasangan</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3">
            <Label className="text-xs font-semibold">Alamat</Label>
            <Textarea value={form.visitorAddress} onChange={e => setForm({...form, visitorAddress: e.target.value})} placeholder="Alamat lengkap" className="mt-1" rows={2} />
          </div>
        </div>

        {/* Data Warga Binaan */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-bold text-sm mb-4 pb-2 border-b-2 border-blue-50 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0f1d3e]" /> Data Warga Binaan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Nama Warga Binaan <span className="text-red-500">*</span></Label>
              <Input required value={form.inmateName} onChange={e => setForm({...form, inmateName: e.target.value})} placeholder="Nama warga binaan" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Nomor Register</Label>
              <Input value={form.inmateNumber} onChange={e => setForm({...form, inmateNumber: e.target.value})} placeholder="Opsional" className="mt-1" />
            </div>
          </div>
        </div>

        {/* Detail Kunjungan */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-bold text-sm mb-4 pb-2 border-b-2 border-blue-50 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0f1d3e]" /> Detail Kunjungan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Tanggal Kunjungan <span className="text-red-500">*</span></Label>
              <Input required type="date" value={form.visitDate} onChange={e => setForm({...form, visitDate: e.target.value})} className="mt-1" />
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
        </div>

        {/* Dokumen */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-bold text-sm mb-4 pb-2 border-b-2 border-blue-50 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0f1d3e]" /> Kelengkapan Dokumen
          </h3>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer text-sm">
              <Checkbox checked={form.documentKtp} onCheckedChange={c => setForm({...form, documentKtp: !!c})} />
              <span>KTP asli yang masih berlaku</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer text-sm">
              <Checkbox checked={form.documentSurat} onCheckedChange={c => setForm({...form, documentSurat: !!c})} />
              <span>Surat izin kunjungan (jika diperlukan)</span>
            </label>
            <div>
              <Label className="text-xs font-semibold">Dokumen lainnya</Label>
              <Input value={form.documentOther} onChange={e => setForm({...form, documentOther: e.target.value})} placeholder="Sebutkan jika ada" className="mt-1" />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-300 rounded-md p-3 text-xs text-amber-800 flex items-start gap-2">
          <span>⚠️</span>
          <span>Pastikan semua data yang dimasukkan sudah benar. Data yang tidak valid dapat menyebabkan pendaftaran ditolak.</span>
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-[#0f1d3e] hover:bg-[#162b52] text-white py-3">
          {loading ? 'Memproses...' : 'Kirim Pendaftaran'}
        </Button>
      </form>
    </div>
  );
}
