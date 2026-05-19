'use client';

import { useSipekanStore, PageType } from '@/store/sipekan-store';
import { useState, useEffect } from 'react';
import {
  Menu, X, Clock, Shield, LogIn, UserCheck, Monitor, LogOut
} from 'lucide-react';

// Navigation items for public (not logged in) users - includes Ambil Antrian
const NAV_ITEMS_PUBLIC: { label: string; page: PageType }[] = [
  { label: 'Beranda', page: 'dashboard' },
  { label: 'Ambil Antrian', page: 'antrian' },
  { label: 'Pendaftaran', page: 'pendaftaran' },
  { label: 'Informasi', page: 'informasi' },
  { label: 'Cek Antrian', page: 'status-antrian' },
];

// Navigation items for logged-in petugas - includes Display Antrian
const NAV_ITEMS_PETUGAS: { label: string; page: PageType }[] = [
  { label: 'Beranda', page: 'dashboard' },
  { label: 'Ambil Antrian', page: 'antrian' },
  { label: 'Pendaftaran', page: 'pendaftaran' },
  { label: 'Informasi', page: 'informasi' },
  { label: 'Cek Antrian', page: 'status-antrian' },
  { label: 'Display Antrian', page: 'display-antrian' },
];

// Map sub-pages to their parent tab for active state highlighting
const PAGE_TO_PARENT_TAB: Partial<Record<PageType, PageType>> = {
  'petugas-detail': 'petugas-dashboard',
  'display-antrian': 'display-antrian',
  'rekapitulasi': 'petugas-dashboard',
};

export function Header() {
  const { currentPage, setCurrentPage, officer, setOfficer } = useSipekanStore();
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
    // Display Antrian requires login
    if (page === 'display-antrian' && !officer) {
      setCurrentPage('login-petugas');
      setMobileOpen(false);
      return;
    }
    // Ambil Antrian requires login
    if (page === 'antrian' && !officer) {
      setCurrentPage('login-petugas');
      setMobileOpen(false);
      return;
    }
    setCurrentPage(page);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    setOfficer(null);
    setCurrentPage('dashboard');
    setMobileOpen(false);
  };

  // Choose nav items based on login status
  const navItems = officer ? NAV_ITEMS_PETUGAS : NAV_ITEMS_PUBLIC;

  // Resolve the effective "tab page" for active state highlighting
  const resolveActivePage = (page: PageType): PageType => {
    return PAGE_TO_PARENT_TAB[page] || page;
  };

  // Check if a nav item's page matches the current page (accounting for sub-pages)
  const isActive = (navPage: PageType): boolean => {
    const effectiveCurrentPage = resolveActivePage(currentPage);
    return effectiveCurrentPage === navPage;
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
            {navItems.map(item => (
              <button key={item.page}
                onClick={() => navigate(item.page)}
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive(item.page)
                    ? 'text-white bg-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,.25)]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right side: Clock + Login/Logout */}
          <div className="flex items-center gap-3">
            {/* Clock */}
            <div className="hidden md:flex items-center gap-0 px-3 py-1.5 rounded-md text-sm text-white/90 tabular-nums" style={{ background: 'rgba(255,255,255,.08)' }}>
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              <span>{time}</span>
            </div>

            {/* Login/Officer Button */}
            {officer ? (
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => navigate('petugas-dashboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all cursor-pointer hover:opacity-90"
                  style={{ background: '#d4a843', color: '#fff' }}>
                  <UserCheck className="w-4 h-4" />
                  <span>{officer.name}</span>
                </button>
                <button onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer text-white/60 hover:text-red-400 hover:bg-red-400/10"
                  title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('login-petugas')}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all cursor-pointer hover:opacity-90"
                style={{ background: '#d4a843', color: '#fff' }}>
                <LogIn className="w-4 h-4" />
                <span>Login Petugas</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/15 transition cursor-pointer">
              {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[9998] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#0a1530] border-l border-white/10 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <span className="text-white font-bold text-sm">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex flex-col p-2">
              {navItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => navigate(item.page)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium text-left transition cursor-pointer ${
                    isActive(item.page)
                      ? 'bg-white/10 text-amber-400'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}>
                  {item.label}
                </button>
              ))}
              <div className="my-2 border-t border-white/10" />
              {officer ? (
                <>
                  <button onClick={() => navigate('petugas-dashboard')}
                    className="px-4 py-3 rounded-lg text-sm font-bold text-left cursor-pointer flex items-center gap-2"
                    style={{ background: '#d4a843', color: '#fff' }}>
                    <UserCheck className="w-4 h-4" />
                    {officer.name}
                  </button>
                  <button onClick={handleLogout}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-left text-red-400 hover:bg-red-400/10 transition cursor-pointer flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <button onClick={() => navigate('login-petugas')} className="px-4 py-3 rounded-lg text-sm font-bold text-left cursor-pointer" style={{ background: '#d4a843', color: '#fff' }}>
                  <LogIn className="w-4 h-4 inline mr-2" />
                  Login Petugas
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
