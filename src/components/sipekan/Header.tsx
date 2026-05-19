'use client';

import { useSipekanStore, PageType } from '@/store/sipekan-store';
import { useState, useEffect } from 'react';
import {
  Menu, X, Clock, Shield, Lock, LogIn, UserCheck
} from 'lucide-react';

const NAV_ITEMS: { label: string; page: PageType; auth?: boolean }[] = [
  { label: 'Beranda', page: 'dashboard' },
  { label: 'Ambil Antrian', page: 'antrian' },
  { label: 'Pendaftaran', page: 'pendaftaran' },
  { label: 'Informasi', page: 'informasi' },
  { label: 'Cek Antrian', page: 'status-antrian' },
  { label: 'Display Antrian', page: 'display-antrian' },
];

export function Header() {
  const { currentPage, setCurrentPage, officer } = useSipekanStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  const navigate = (page: PageType) => {
    setCurrentPage(page);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center px-4 py-2.5 md:px-5 gap-4 md:gap-5"
        style={{ background: '#0a1530', borderBottom: '1px solid rgba(255,255,255,.1)', boxShadow: '0 2px 12px rgba(0,0,0,.15)' }}>
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => navigate('dashboard')}>
            <div className="w-[38px] h-[38px] flex items-center justify-center shrink-0 overflow-hidden">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <div className="flex flex-col justify-center gap-0 min-w-0">
              <span className="text-white font-bold text-base leading-tight whitespace-nowrap tracking-wide">SIPEKAN</span>
              <span className="text-white/65 text-[10px] leading-[1.3] mt-px">Sistem Informasi<br/>Pelayanan Besukan</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-1">
            {NAV_ITEMS.map(item => (
              <button key={item.page}
                onClick={() => navigate(item.page)}
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  currentPage === item.page
                    ? 'text-white bg-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,.25)]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right side: Clock + Login */}
          <div className="flex items-center gap-3">
            {/* Clock */}
            <div className="hidden md:flex items-center gap-0 px-3 py-1.5 rounded-md text-sm text-white/90 tabular-nums" style={{ background: 'rgba(255,255,255,.08)' }}>
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              <span>{time}</span>
            </div>

            {/* Login Petugas Button */}
            {officer ? (
              <button onClick={() => navigate('petugas-dashboard')}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all cursor-pointer"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                <UserCheck className="w-4 h-4" />
                <span>{officer.name}</span>
              </button>
            ) : (
              <button onClick={() => navigate('login-petugas')}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all cursor-pointer hover:opacity-90"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                <LogIn className="w-4 h-4" />
                <span>Login Petugas</span>
              </button>
            )}

            {/* Hamburger */}
            <button className="md:hidden flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/15 transition cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="bg-white shadow-xl max-h-[60vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-3 border-b flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-sm font-semibold text-gray-800 tabular-nums">{time}</span>
            </div>
            {NAV_ITEMS.map(item => (
              <button key={item.page}
                onClick={() => navigate(item.page)}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition cursor-pointer ${
                  currentPage === item.page ? 'bg-blue-50 text-[var(--primary)]' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button onClick={() => navigate(officer ? 'petugas-dashboard' : 'login-petugas')}
              className="w-full text-left px-4 py-3 text-sm font-bold cursor-pointer"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {officer ? officer.name : 'Login Petugas'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
