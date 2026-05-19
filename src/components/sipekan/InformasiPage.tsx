'use client';

import { useSipekanStore } from '@/store/sipekan-store';
import { useState } from 'react';
import { ArrowLeft, Info, CheckCircle, XCircle, Clock, Users, Shield, FileText, AlertTriangle, BookOpen, ClipboardList, Headphones, Search, Monitor } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function InformasiPage() {
  const { setCurrentPage } = useSipekanStore();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button onClick={() => setCurrentPage('dashboard')}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition mb-5">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <Info className="w-5 h-5 text-[#0f1d3e]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Informasi Besukan</h1>
          <p className="text-white/50 text-sm">Syarat, ketentuan, dan jadwal kunjungan</p>
        </div>
      </div>

      {/* Panduan Pengguna Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-100">
          <BookOpen className="w-5 h-5 text-[#0f1d3e]" />
          <h2 className="font-bold text-sm text-[#0f1d3e]">Panduan Pengguna SIPEKAN</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Ikuti langkah-langkah berikut untuk menggunakan layanan SIPEKAN dengan mudah dan cepat.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              step: 1,
              icon: <ClipboardList className="w-6 h-6 text-white" />,
              title: 'Daftar Kunjungan',
              desc: 'Isi formulir pendaftaran kunjungan online dengan data diri Anda dan informasi warga binaan.',
              page: 'pendaftaran' as const,
              color: 'bg-[#0f1d3e]',
            },
            {
              step: 2,
              icon: <Shield className="w-6 h-6 text-white" />,
              title: 'Ambil Nomor Antrian',
              desc: 'Pilih layanan yang Anda butuhkan dan dapatkan nomor antrian secara otomatis.',
              page: 'antrian' as const,
              color: 'bg-[#162d5a]',
            },
            {
              step: 3,
              icon: <Search className="w-6 h-6 text-white" />,
              title: 'Pantau Status Antrian',
              desc: 'Cek posisi antrian Anda secara real-time melalui halaman Cek Antrian.',
              page: 'status-antrian' as const,
              color: 'bg-amber-600',
            },
            {
              step: 4,
              icon: <Monitor className="w-6 h-6 text-white" />,
              title: 'Menuju Loket',
              desc: 'Saat nomor antrian Anda dipanggil, segera menuju loket yang ditentukan untuk pelayanan.',
              page: null,
              color: 'bg-green-600',
            },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => item.page && setCurrentPage(item.page)}
              className={`text-left border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-[#0f1d3e]/20 transition ${item.page ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {item.step}
                    </span>
                    <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  {item.page && (
                    <span className="inline-block mt-2 text-[10px] font-semibold text-[#0f1d3e] bg-[#0f1d3e]/5 px-2 py-0.5 rounded">
                      Klik untuk mulai →
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Accordion type="multiple" defaultValue={['syarat', 'pakaian', 'larangan', 'jadwal', 'program']} className="space-y-2">
        <AccordionItem value="syarat" className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 font-semibold text-sm">📋 Syarat & Prosedur Besukan</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ol className="list-none space-y-3 counter-reset-none">
              {[
                'Membawa KTP asli yang masih berlaku',
                'Mendaftar melalui sistem SIPEKAN atau langsung di loket',
                'Mengambil nomor antrian sesuai layanan',
                'Menunggu nomor antrian dipanggil di ruang tunggu',
                'Menuju loket yang ditentukan saat nomor dipanggil',
                'Menyerahkan dokumen yang diperlukan kepada petugas',
                'Memasuki ruang besukan sesuai jadwal yang ditentukan',
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start text-sm text-gray-600">
                  <span className="w-7 h-7 rounded-full bg-[#0f1d3e] text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  <span className="pt-1">{item}</span>
                </li>
              ))}
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pakaian" className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 font-semibold text-sm">👔 Ketentuan Pakaian</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ul className="space-y-2">
              {[
                'Berpakaian rapi dan sopan',
                'Mengenakan pakaian tertutup (baju lengan panjang/di bawah lutut)',
                'Tidak memakai pakaian transparan atau ketat',
                'Mengenakan alas kaki yang tertutup',
                'Wanita diwajibkan mengenakan jilbab',
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="larangan" className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 font-semibold text-sm">🚫 Barang yang Dilarang</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ul className="space-y-2">
              {[
                'Senjata api, senjata tajam, atau bahan peledak',
                'Narkotika dan obat-obatan terlarang',
                'Minuman beralkohol',
                'Alat komunikasi (HP, tablet, laptop)',
                'Kamera atau alat perekam',
                'Uang dalam jumlah besar (tanpa izin)',
                'Makanan atau minuman dari luar',
                'Barang-barang yang dianggap membahayakan keamanan',
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="jadwal" className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 font-semibold text-sm">🕐 Jadwal Besukan</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3 text-sm text-gray-600">
              <h4 className="font-bold text-gray-800">Hari Kunjungan: Senin - Jumat</h4>
              <div className="space-y-1.5">
                <p>• Sesi I: 08:00 - 10:00 WITA</p>
                <p>• Sesi II: 10:00 - 12:00 WITA</p>
                <p>• Sesi III: 13:00 - 15:00 WITA</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Jadwal dapat berubah sewaktu-waktu sesuai kebijakan Lapas. Maksimal 3 orang pengunjung per warga binaan per kunjungan.</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="program" className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 font-semibold text-sm">📋 Program Pembinaan</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Pembinaan Kepribadian', desc: 'Program pembinaan mental dan spiritual untuk warga binaan', badge: 'Wajib' },
                { title: 'Pembinaan Kemandirian', desc: 'Pelatihan keterampilan kerja dan usaha mandiri', badge: 'Wajib' },
                { title: 'Pendidikan Kejar Paket', desc: 'Program pendidikan kesetaraan (Paket A, B, C)', badge: 'Pilihan' },
                { title: 'Keterampilan Kerja', desc: 'Pelatihan menjahit, bertani, kerajinan tangan dll', badge: 'Pilihan' },
              ].map((p, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold mb-2 ${p.badge === 'Wajib' ? 'bg-blue-50 text-[#0f1d3e]' : 'bg-amber-50 text-amber-700'}`}>
                    {p.badge}
                  </span>
                  <h4 className="font-bold text-sm mb-1">{p.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
