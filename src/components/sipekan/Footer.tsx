'use client';

import { useSipekanStore, PageType } from '@/store/sipekan-store';
import { Shield, Phone, MapPin, Clock, ExternalLink, Mail, Globe } from 'lucide-react';

export function Footer() {
  const { setCurrentPage } = useSipekanStore();

  return (
    <footer className="mt-auto relative z-2" style={{ background: '#0a1228', borderTop: '1px solid rgba(255,255,255,.08)' }}>
      <div className="max-w-[1280px] mx-auto px-4 py-5 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-white font-bold text-sm tracking-wide">SIPEKAN</h3>
            </div>
            <p className="text-white/50 text-xs leading-relaxed">
              Sistem Informasi Pelayanan Besukan Lapas Kelas IIA Bontang.
              Mempermudah proses pelayanan kunjungan dan penitipan barang
              bagi keluarga warga binaan.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white/90 font-bold text-xs uppercase tracking-wider mb-2.5">Tautan Cepat</h3>
            <ul className="space-y-1.5">
              {[
                { label: 'Ambil Antrian', page: 'antrian' as PageType },
                { label: 'Pendaftaran Kunjungan', page: 'pendaftaran' as PageType },
                { label: 'Informasi Besukan', page: 'informasi' as PageType },
                { label: 'Cek Status Antrian', page: 'status-antrian' as PageType },
                { label: 'Rekapitulasi', page: 'rekapitulasi' as PageType },
              ].map(item => (
                <li key={item.page}>
                  <button onClick={() => setCurrentPage(item.page)}
                    className="text-white/50 text-xs hover:text-amber-400 transition flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white/90 font-bold text-xs uppercase tracking-wider mb-2.5">Kontak</h3>
            <div className="space-y-1.5 text-xs text-white/50">
              <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400" /> Jl. Awang Long, Bontang Selatan, Kaltim</p>
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0 text-amber-400" /> (0548) 123456</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 shrink-0 text-amber-400" /> sipekan@lapas-bontang.go.id</p>
              <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 shrink-0 text-amber-400" /> Senin - Jumat: 08:00 - 15:00 WITA</p>
            </div>
          </div>

          {/* Social / Useful Links */}
          <div>
            <h3 className="text-white/90 font-bold text-xs uppercase tracking-wider mb-2.5">Tautan Terkait</h3>
            <div className="space-y-1.5 text-xs">
              <a href="https://www.kemenkumham.go.id" target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-amber-400 transition flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 shrink-0" /> Kemenkumham RI
              </a>
              <a href="https://www.ditjenpas.kemenkumham.go.id" target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-amber-400 transition flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 shrink-0" /> Ditjen PAS
              </a>
              <a href="https://bontangkota.go.id" target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-amber-400 transition flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 shrink-0" /> Pemkot Bontang
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-amber-400 transition flex items-center gap-2">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                Instagram Lapas Bontang
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-amber-400 transition flex items-center gap-2">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                YouTube Kanal Lapas
              </a>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-white/30">
          <span>© {new Date().getFullYear()} SIPEKAN — Lapas Kelas IIA Bontang. Hak Cipta Dilindungi.</span>
          <span>Diselenggarakan oleh Kementerian Hukum dan HAM RI</span>
        </div>
      </div>
    </footer>
  );
}
