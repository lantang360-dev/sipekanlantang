'use client';

import { Shield, Phone, MapPin, Mail, CircleDot, Info } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto relative z-[2]" style={{ background: '#0a1530', borderTop: '1px solid rgba(255,255,255,.1)' }}>
      <div className="max-w-[1280px] mx-auto px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Column 1: Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(212,168,67,.15)' }}>
                <Shield className="w-5 h-5" style={{ color: '#d4a843' }} />
              </div>
              <div>
                <h3 className="text-white text-base font-bold leading-tight tracking-wide">SIPEKAN</h3>
                <p className="text-white/60 text-[11px] leading-tight mt-0.5">Sistem Informasi Pelayanan Besukan</p>
              </div>
            </div>
            <p className="text-white/70 text-[13px] leading-relaxed">
              Sistem Informasi Pelayanan Besukan (SIPEKAN) merupakan layanan digital yang dirancang untuk memudahkan masyarakat dalam mengurus proses besukan di Lembaga Pemasyarakatan. Layanan ini mencakup pengambilan nomor antrian, pendaftaran besukan online, serta informasi mengenai berbagai jenis layanan yang tersedia.
            </p>
          </div>

          {/* Column 2: Informasi */}
          <div>
            <h3 className="text-white text-[15px] font-bold mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" style={{ color: '#d4a843' }} />
              Informasi
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <CircleDot className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#d4a843' }} />
                <span className="text-white/70 text-[13px] leading-relaxed">Layanan ini gratis tanpa dipungut biaya apapun</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CircleDot className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#d4a843' }} />
                <span className="text-white/70 text-[13px] leading-relaxed">Dilarang membawa barang terlarang ke dalam Lapas</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CircleDot className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#d4a843' }} />
                <span className="text-white/70 text-[13px] leading-relaxed">Hubungi petugas untuk informasi lebih lanjut</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Informasi Kontak */}
          <div>
            <h3 className="text-white text-[15px] font-bold mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4" style={{ color: '#d4a843' }} />
              Informasi Kontak
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#d4a843' }} />
                <span className="text-white/70 text-[13px] leading-relaxed">Jl. Prestasi, Kel. Bontang Lestari, Kec. Bontang Selatan, Kota Bontang, Kalimantan Timur</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#d4a843' }} />
                <span className="text-white/70 text-[13px] leading-relaxed">(022) 733-1493</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#d4a843' }} />
                <span className="text-white/70 text-[13px] leading-relaxed">info@lapasbontang.go.id</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-white/50 text-xs">
            © 2026 Kementerian Imigrasi dan Pemasyarakatan RI — Lapas Kelas IIA Bontang
          </p>
        </div>
      </div>
    </footer>
  );
}
