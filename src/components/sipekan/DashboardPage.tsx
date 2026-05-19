'use client';

import { useSipekanStore, PageType } from '@/store/sipekan-store';
import { useEffect, useState } from 'react';
import {
  Shield, FileText, Info, Clock, Lock, LogIn, Monitor, BarChart3, Users, Settings
} from 'lucide-react';

const HOURS = [
  { day: 'Senin - Kamis', open: '08:00 - 15:00 WITA', isOpen: true },
  { day: 'Jumat', open: 'Tutup', isOpen: false },
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
      if (day === 0 || day === 5) { setIsOpen(false); return; }
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
    if (page === 'antrian' && !officer) {
      setCurrentPage('login-petugas');
      return;
    }
    if (page === 'display-antrian' && !officer) {
      setCurrentPage('login-petugas');
      return;
    }
    setCurrentPage(page);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image - Fixed, Full Screen */}
      <img
        src="/lapas-building.png"
        alt="Lapas Kelas IIA Bontang"
        className="fixed !top-0 !left-0 !right-0 !bottom-0 w-full h-full object-cover object-center z-0 pointer-events-none block m-0 p-0 border-none outline-none"
      />
      {/* Dark Overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{
        background: 'linear-gradient(180deg, rgba(15,29,62,.88) 0%, rgba(15,29,62,.65) 25%, rgba(15,29,62,.50) 50%, rgba(15,29,62,.55) 75%, rgba(15,29,62,.78) 100%)'
      }} />

      {/* Hero Section */}
      <section className="relative z-[2] text-center py-10 px-5 md:py-16 md:px-9 text-white">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-2" style={{ textShadow: '0 2px 8px rgba(0,0,0,.3)' }}>
          Selamat Datang di{' '}
          <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
            SIPEKAN
          </span>
        </h1>
        <p className="text-sm md:text-base opacity-70" style={{ textShadow: '0 1px 4px rgba(0,0,0,.3)' }}>
          Sistem Informasi Pelayanan Besukan Lapas
        </p>
        <p className="text-xl md:text-3xl font-bold mt-4 opacity-90 whitespace-nowrap" style={{ textShadow: '0 2px 8px rgba(0,0,0,.3)' }}>
          Lembaga Pemasyarakatan Kelas IIA Bontang
        </p>
      </section>

      {/* PETUGAS QUICK ACCESS — only when logged in */}
      {officer && (
        <div className="relative z-[10] px-5 md:px-6 mb-6">
          <div className="max-w-[1280px] mx-auto">
            <div className="bg-gradient-to-r from-amber-400/20 via-amber-400/10 to-amber-400/20 backdrop-blur-md rounded-2xl border-2 border-amber-400/40 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#0f1d3e]" />
                </div>
                <span className="text-amber-400 font-bold text-sm">Panel Petugas — {officer.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => navigate('display-antrian')}
                  className="bg-amber-400 hover:bg-amber-500 text-[#0f1d3e] rounded-xl px-4 py-3 font-bold text-sm flex flex-col items-center gap-1.5 transition-all hover:scale-[1.03] shadow-lg shadow-amber-400/20"
                >
                  <Monitor className="w-6 h-6" />
                  Display Antrian
                </button>
                <button
                  onClick={() => navigate('petugas-dashboard')}
                  className="bg-white/15 hover:bg-white/25 text-white rounded-xl px-4 py-3 font-bold text-sm flex flex-col items-center gap-1.5 transition-all border border-white/20"
                >
                  <Users className="w-6 h-6" />
                  Pendaftaran
                </button>
                <button
                  onClick={() => navigate('rekapitulasi')}
                  className="bg-white/15 hover:bg-white/25 text-white rounded-xl px-4 py-3 font-bold text-sm flex flex-col items-center gap-1.5 transition-all border border-white/20"
                >
                  <BarChart3 className="w-6 h-6" />
                  Rekapitulasi
                </button>
              </div>
              {officer.role === 'admin' && (
                <button
                  onClick={() => navigate('settings')}
                  className="mt-3 w-full bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2.5 font-bold text-sm flex items-center justify-center gap-2 transition-all border border-white/15"
                >
                  <Settings className="w-4 h-4" />
                  Pengaturan WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4 Cards in a Row */}
      <div className="relative z-[10] px-5 pb-10 md:px-6 md:pb-12">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Card 1: Jam Operasional */}
            <div className="bg-white/80 backdrop-blur-md rounded-xl border border-white/30 shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0f1d3e] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-[14px] text-[#0f1d3e]">Jam Operasional</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isOpen ? (
                      <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><span className="text-[11px] font-semibold text-green-600">Buka Sekarang</span></>
                    ) : (
                      <><span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[11px] font-semibold text-red-600">Tutup</span></>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4">
                {HOURS.map((h, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="font-semibold text-gray-700 text-[13px]">{h.day}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${h.isOpen ? 'bg-blue-50 text-[#0f1d3e]' : 'bg-red-50 text-red-600'}`}>
                      {h.open}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Ambil Antrian */}
            <button
              onClick={() => navigate('antrian')}
              className="bg-white/80 backdrop-blur-md rounded-xl border border-white/30 shadow-lg cursor-pointer transition-all overflow-hidden text-center group hover:bg-white/95 hover:border-white/50 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="p-6 flex flex-col items-center">
                {officer ? (
                  <>
                    <div className="w-14 h-14 rounded-full bg-[rgba(15,29,62,.08)] flex items-center justify-center mb-4 transition-all group-hover:bg-[#0f1d3e]">
                      <Shield className="w-7 h-7 text-[#0f1d3e] group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-sm font-bold text-[#0f1d3e] tracking-wide mb-1.5">AMBIL ANTRIAN</div>
                    <div className="text-xs text-gray-500 leading-relaxed">Ambil nomor antrian untuk pelayanan besukan</div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-[rgba(15,29,62,.06)] flex items-center justify-center mb-4">
                      <Lock className="w-7 h-7 text-gray-400" />
                    </div>
                    <div className="text-sm font-bold text-[#0f1d3e] tracking-wide mb-1.5">AMBIL ANTRIAN</div>
                    <div className="text-xs text-gray-500 mb-3">Login Petugas</div>
                    <div className="inline-flex items-center gap-1.5 bg-[#d4a843] px-4 py-1.5 rounded-md text-[12px] font-bold text-white">
                      <LogIn className="w-3.5 h-3.5" />
                      Login Petugas
                    </div>
                  </>
                )}
              </div>
            </button>

            {/* Card 3: Daftar Online */}
            <button
              onClick={() => navigate('pendaftaran')}
              className="bg-white/80 backdrop-blur-md rounded-xl border border-white/30 shadow-lg cursor-pointer transition-all overflow-hidden text-center group hover:bg-white/95 hover:border-white/50 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="p-6 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[rgba(15,29,62,.08)] flex items-center justify-center mb-4 transition-all group-hover:bg-[#0f1d3e]">
                  <FileText className="w-7 h-7 text-[#0f1d3e] group-hover:text-white transition-colors" />
                </div>
                <div className="text-sm font-bold text-[#0f1d3e] tracking-wide mb-1.5">DAFTAR ONLINE</div>
                <div className="text-xs text-gray-500 leading-relaxed">Pendaftaran besukan secara online</div>
              </div>
            </button>

            {/* Card 4: Informasi Layanan */}
            <button
              onClick={() => navigate('informasi')}
              className="bg-white/80 backdrop-blur-md rounded-xl border border-white/30 shadow-lg cursor-pointer transition-all overflow-hidden text-center group hover:bg-white/95 hover:border-white/50 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="p-6 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[rgba(15,29,62,.08)] flex items-center justify-center mb-4 transition-all group-hover:bg-[#0f1d3e]">
                  <Info className="w-7 h-7 text-[#0f1d3e] group-hover:text-white transition-colors" />
                </div>
                <div className="text-sm font-bold text-[#0f1d3e] tracking-wide mb-1.5">INFORMASI LAYANAN</div>
                <div className="text-xs text-gray-500 leading-relaxed">Lihat informasi dan persyaratan layanan</div>
              </div>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
