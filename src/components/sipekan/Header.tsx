'use client';

import { useSipekanStore, PageType } from '@/store/sipekan-store';
import { useState, useEffect } from 'react';
import {
  Menu, X, Clock, Users, FileText, Info, Search, Shield, Monitor, BarChart3, Lock, UserCheck
} from 'lucide-react';

const NAV_ITEMS: { label: string; page: PageType; auth?: boolean }[] = [
  { label: 'Beranda', page: 'dashboard' },
  { label: 'Ambil Antrian', page: 'antrian' },
  { label: 'Pendaftaran', page: 'pendaftaran' },
  { label: 'Informasi', page: 'informasi' },
  { label: 'Cek Antrian', page: 'status-antrian' },
  { label: 'Display Antrian', page: 'display-antrian', auth: true },
  { label: 'Petugas', page: 'login-petugas', auth: true },
];

export function Header() {
  const { currentPage, setCurrentPage, officer } = useSipekanStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    update();
    const i = setInterval(update, 30000);
    return () => clearInterval(i);
  }, []);

  const navigate = (page: PageType) => {
    setCurrentPage(page);
    setMobileOpen(false);
  };

  const isLocked = (page: PageType) => {
    if (page === 'display-antrian') return !officer;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center px-4 py-2.5 md:px-5 gap-4"
        style={{ background: '#0f1b3d', borderBottom: '1px solid rgba(255,255,255,.1)', boxShadow: '0 2px 12px rgba(0,0,0,.15)' }}>
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => navigate('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm tracking-wide">SIPEKAN</span>
              <span className="text-white/50 text-[10px] leading-tight">Sistem Informasi Pelayanan Besukan Lapas</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-1">
            {NAV_ITEMS.map(item => {
              const locked = isLocked(item.page);
              return (
                <button key={item.page}
                  onClick={() => navigate(item.page)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                    currentPage === item.page
                      ? 'text-white bg-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,.25)]'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {locked && <Lock className="w-3 h-3 text-amber-400" />}
                  {item.label}
                  {item.auth && !officer && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-500 font-semibold">Petugas</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right side: Officer Indicator + Clock + Hamburger */}
          <div className="flex items-center gap-3">
            {officer && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-400/10 border border-amber-400/20">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-[#0f1b3d] flex items-center justify-center text-[10px] font-bold">
                  {officer.name.charAt(0)}
                </div>
                <span className="text-amber-400 text-xs font-semibold max-w-[120px] truncate">{officer.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold uppercase">{officer.role}</span>
              </div>
            )}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/8 text-white/90 text-sm tabular-nums">
              <Clock className="w-3.5 h-3.5" />
              <span>{time}</span>
            </div>
            <button className="md:hidden flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/15 transition"
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
            <div className="p-3 border-b">
              <div className="text-xs text-gray-500">{date}</div>
              <div className="text-sm font-semibold text-gray-800">{time}</div>
            </div>
            {officer && (
              <div className="flex items-center gap-3 px-4 py-3 border-b bg-amber-50">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-[#0f1b3d] flex items-center justify-center text-sm font-bold">
                  {officer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{officer.name}</div>
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3 h-3 text-amber-600" />
                    <span className="text-[10px] font-bold text-amber-700 uppercase">{officer.role}</span>
                  </div>
                </div>
              </div>
            )}
            {NAV_ITEMS.map(item => {
              const locked = isLocked(item.page);
              return (
                <button key={item.page}
                  onClick={() => navigate(item.page)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium transition ${
                    currentPage === item.page ? 'bg-[#e8edf5] text-[#0f1b3d]' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {locked && <Lock className="w-3.5 h-3.5 text-amber-500" />}
                  <span className="flex-1">{item.label}</span>
                  {item.auth && !officer && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold">Petugas</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
