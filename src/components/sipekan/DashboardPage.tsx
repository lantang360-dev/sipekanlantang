'use client';

import { useSipekanStore, PageType } from '@/store/sipekan-store';
import { useEffect, useState } from 'react';
import {
  Clock, Shield, FileText, Info, Search, Monitor, BarChart3
} from 'lucide-react';

const QUICK_ACTIONS: { icon: React.ReactNode; title: string; desc: string; page: PageType; auth?: boolean }[] = [
  { icon: <Shield className="w-7 h-7" />, title: 'Ambil Antrian', desc: 'Dapatkan nomor antrian untuk pelayanan', page: 'antrian' },
  { icon: <FileText className="w-7 h-7" />, title: 'Daftar Online', desc: 'Pendaftaran besukan secara online', page: 'pendaftaran' },
  { icon: <Info className="w-7 h-7" />, title: 'Informasi Layanan', desc: 'Lihat informasi dan persyaratan layanan', page: 'informasi' },
];

const MORE_ACTIONS: { icon: React.ReactNode; title: string; desc: string; page: PageType; auth?: boolean }[] = [
  { icon: <Search className="w-6 h-6" />, title: 'Cek Status Antrian', desc: 'Pantau status antrian Anda secara real-time', page: 'status-antrian' },
  { icon: <Monitor className="w-6 h-6" />, title: 'Display Antrian', desc: 'Monitor antrian real-time', page: 'display-antrian', auth: true },
  { icon: <BarChart3 className="w-6 h-6" />, title: 'Rekapitulasi', desc: 'Rekap harian pelayanan', page: 'rekapitulasi' },
];

const HOURS = [
  { day: 'Senin-Kamis', open: '08:00 - 15:00 WITA', isOpen: true },
  { day: 'Jumat', open: '08:00 - 15:00 WITA', isOpen: true },
  { day: 'Sabtu', open: '08:00 - 12:00 WITA', isOpen: true },
  { day: 'Minggu & Libur Nasional', open: 'Tutup', isOpen: false },
];

export function DashboardPage() {
  const { setCurrentPage, officer } = useSipekanStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const day = now.getDay();
      if (day === 0) { setIsOpen(false); return; }
      const h = now.getHours(), m = now.getMinutes();
      const t = h * 60 + m;
      if (day === 6) { setIsOpen(t >= 480 && t < 720); return; }
      setIsOpen(t >= 480 && t < 900);
    };
    check();
    const i = setInterval(check, 60000);
    return () => clearInterval(i);
  }, []);

  const navigate = (page: PageType) => {
    if (page === 'display-antrian' && !officer) {
      setCurrentPage('login-petugas');
      return;
    }
    setCurrentPage(page);
  };

  return (
    <div className="relative">
      {/* Background: Photo of Lapas building + dark overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Lapas_Kelas_IIA_Bontang.jpg/1280px-Lapas_Kelas_IIA_Bontang.jpg"
          alt="Lapas Kelas IIA Bontang"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            // Fallback to gradient if image fails
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.nextElementSibling) {
              (target.nextElementSibling as HTMLElement).style.background = `
                radial-gradient(ellipse at 20% 50%, rgba(30, 58, 110, 0.5) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 20%, rgba(180, 130, 30, 0.12) 0%, transparent 40%),
                linear-gradient(175deg, #0a1228 0%, #0f1b3d 25%, #162d5a 50%, #0f1b3d 75%, #0a1228 100%)
              `;
            }
          }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(15,27,61,.82) 0%, rgba(15,27,61,.65) 25%, rgba(15,27,61,.50) 50%, rgba(15,27,61,.55) 75%, rgba(15,27,61,.70) 100%)'
        }} />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 text-center py-10 px-5 md:py-16 md:px-9 text-white">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-2" style={{ textShadow: '0 2px 8px rgba(0,0,0,.3)' }}>
          Selamat Datang di{' '}
          <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
            SIPEKAN
          </span>
        </h1>
        <p className="text-sm md:text-base opacity-70" style={{ textShadow: '0 1px 4px rgba(0,0,0,.3)' }}>
          Sistem Informasi Pelayanan Besukan Lapas
        </p>
        <p className="text-xl md:text-3xl font-bold mt-4 opacity-90" style={{ textShadow: '0 2px 8px rgba(0,0,0,.3)' }}>
          Lembaga Pemasyarakatan Kelas IIA Bontang
        </p>
      </section>

      {/* Content */}
      <div className="relative z-10 px-4 pb-10 md:px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

            {/* Main: 3 Action Cards */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {QUICK_ACTIONS.map((action, i) => (
                  <button key={i} onClick={() => navigate(action.page)}
                    className="bg-white/95 backdrop-blur-sm rounded-xl border-2 border-transparent shadow-lg cursor-pointer transition-all hover:border-[#0f1b3d] hover:shadow-xl hover:-translate-y-1 overflow-hidden text-center group">
                    <div className="h-1 bg-gradient-to-r from-[#0f1b3d] to-[#1e3a6e]" />
                    <div className="p-7 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-[#0f1b3d]/8 flex items-center justify-center mb-4 transition-all group-hover:bg-[#0f1b3d] [&>svg]:text-[#0f1b3d] group-hover:[&>svg]:text-white">
                        {action.icon}
                      </div>
                      <div className="text-sm font-bold text-[#0f1b3d] tracking-wide mb-1.5">{action.title}</div>
                      <div className="text-xs text-gray-500 leading-relaxed">{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* More Services */}
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">Layanan Lainnya</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MORE_ACTIONS.map((action, i) => {
                  const locked = action.auth && !officer;
                  return (
                    <button key={i} onClick={() => navigate(action.page)}
                      className={`bg-white/90 backdrop-blur-sm rounded-lg border border-white/20 shadow cursor-pointer transition-all hover:bg-white hover:shadow-md p-4 flex items-center gap-3 text-left ${locked ? 'opacity-60' : ''}`}>
                      <div className="w-10 h-10 rounded-lg bg-[#0f1b3d]/8 flex items-center justify-center shrink-0 [&>svg]:text-[#0f1b3d]">
                        {action.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#0f1b3d] truncate">{action.title}</div>
                        <div className="text-[10px] text-gray-500 truncate">{action.desc}</div>
                        {locked && (
                          <span className="mt-1 inline-flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-full text-[9px] font-semibold text-amber-800">
                            Petugas
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hours Sidebar */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#0f1b3d] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-[15px] text-[#0f1b3d]">Jam Operasional</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isOpen ? (
                      <><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /><span className="text-[11px] font-semibold text-green-600">Buka Sekarang</span></>
                    ) : (
                      <><span className="w-1.5 h-1.5 rounded-full bg-red-500" /><span className="text-[11px] font-semibold text-red-600">Tutup</span></>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4">
                {HOURS.map((h, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b last:border-b-0 text-sm">
                    <span className="font-semibold text-gray-700 text-[13px]">{h.day}</span>
                    <span className={`px-3 py-0.5 rounded-full text-[11px] font-semibold ${h.isOpen ? 'bg-blue-50 text-[#0f1b3d]' : 'bg-red-50 text-red-600'}`}>
                      {h.open}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
