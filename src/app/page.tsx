'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSipekanStore, PageType } from '@/store/sipekan-store';
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

export default function Home() {
  const { currentPage } = useSipekanStore();
  const [showDisplay, setShowDisplay] = useState(false);

  useEffect(() => {
    setShowDisplay(currentPage === 'display-antrian');
  }, [currentPage]);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger re-render by updating time-based state
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f1b3d' }}>
      <Header />
      <main className="flex-1 relative z-2" style={{ background: '#0f1b3d' }}>
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}
