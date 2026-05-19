'use client';

import { useSipekanStore } from '@/store/sipekan-store';
import { useEffect } from 'react';
import { Header } from '@/components/sipekan/Header';
import { Footer } from '@/components/sipekan/Footer';
import { DashboardPage } from '@/components/sipekan/DashboardPage';
import { AntrianPage } from '@/components/sipekan/AntrianPage';
import { PendaftaranPage } from '@/components/sipekan/PendaftaranPage';
import { InformasiPage } from '@/components/sipekan/InformasiPage';
import { StatusAntrianPage } from '@/components/sipekan/StatusAntrianPage';
import { LoginPetugasPage } from '@/components/sipekan/LoginPetugasPage';
import { PetugasDashboardPage } from '@/components/sipekan/PetugasDashboardPage';
import { PetugasDetailPage } from '@/components/sipekan/PetugasDetailPage';
import { DisplayAntrianPage } from '@/components/sipekan/DisplayAntrianPage';
import { RekapitulasiPage } from '@/components/sipekan/RekapitulasiPage';

const DARK_BG_PAGES = ['dashboard', 'petugas-dashboard', 'login-petugas', 'petugas-detail', 'rekapitulasi'];

export default function Home() {
  const { currentPage, officer, setCurrentPage } = useSipekanStore();

  // Redirect to login if trying to access display-antrian without auth
  const wantsDisplay = currentPage === 'display-antrian';
  const showDisplay = wantsDisplay && !!officer;

  useEffect(() => {
    if (wantsDisplay && !officer) {
      setCurrentPage('login-petugas');
    }
  }, [wantsDisplay, officer, setCurrentPage]);

  useEffect(() => {
    const interval = setInterval(() => {
      window.dispatchEvent(new CustomEvent('sipekan-refresh'));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'antrian': return <AntrianPage />;
      case 'pendaftaran': return <PendaftaranPage />;
      case 'informasi': return <InformasiPage />;
      case 'status-antrian': return <StatusAntrianPage />;
      case 'login-petugas': return <LoginPetugasPage />;
      case 'petugas-dashboard': return <PetugasDashboardPage />;
      case 'petugas-detail': return <PetugasDetailPage />;
      case 'rekapitulasi': return <RekapitulasiPage />;
      default: return <DashboardPage />;
    }
  };

  if (showDisplay) {
    return <DisplayAntrianPage />;
  }

  const isDarkBg = DARK_BG_PAGES.includes(currentPage);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: isDarkBg ? '#0f1d3e' : '#f8f9fc' }}>
      <Header />
      <main className={`flex-1 relative z-[2] ${isDarkBg ? '' : 'p-4 md:p-6'}`}>
        <div className={isDarkBg ? '' : 'max-w-[1280px] mx-auto'}>
          {renderPage()}
        </div>
      </main>
      <Footer />
    </div>
  );
}
