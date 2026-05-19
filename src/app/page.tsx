'use client';

import { useSipekanStore } from '@/store/sipekan-store';
import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/sipekan/Header';
import { Footer } from '@/components/sipekan/Footer';
import dynamic from 'next/dynamic';

// Dynamic imports to reduce initial bundle size and memory usage
const DashboardPage = dynamic(() => import('@/components/sipekan/DashboardPage').then(m => ({ default: m.DashboardPage })), { ssr: false });
const AntrianPage = dynamic(() => import('@/components/sipekan/AntrianPage').then(m => ({ default: m.AntrianPage })), { ssr: false });
const PendaftaranPage = dynamic(() => import('@/components/sipekan/PendaftaranPage').then(m => ({ default: m.PendaftaranPage })), { ssr: false });
const InformasiPage = dynamic(() => import('@/components/sipekan/InformasiPage').then(m => ({ default: m.InformasiPage })), { ssr: false });
const StatusAntrianPage = dynamic(() => import('@/components/sipekan/StatusAntrianPage').then(m => ({ default: m.StatusAntrianPage })), { ssr: false });
const LoginPetugasPage = dynamic(() => import('@/components/sipekan/LoginPetugasPage').then(m => ({ default: m.LoginPetugasPage })), { ssr: false });
const PetugasDashboardPage = dynamic(() => import('@/components/sipekan/PetugasDashboardPage').then(m => ({ default: m.PetugasDashboardPage })), { ssr: false });
const PetugasDetailPage = dynamic(() => import('@/components/sipekan/PetugasDetailPage').then(m => ({ default: m.PetugasDetailPage })), { ssr: false });
const RekapitulasiPage = dynamic(() => import('@/components/sipekan/RekapitulasiPage').then(m => ({ default: m.RekapitulasiPage })), { ssr: false });
const DisplayAntrianPage = dynamic(() => import('@/components/sipekan/DisplayAntrianPage').then(m => ({ default: m.DisplayAntrianPage })), { ssr: false });
const SettingsPage = dynamic(() => import('@/components/sipekan/SettingsPage').then(m => ({ default: m.SettingsPage })), { ssr: false });

const DARK_BG_PAGES = ['dashboard', 'pendaftaran', 'petugas-dashboard', 'login-petugas', 'petugas-detail', 'rekapitulasi', 'antrian', 'status-antrian', 'informasi', 'settings'];

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

  const renderPage = useCallback(() => {
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
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  }, [currentPage]);

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
