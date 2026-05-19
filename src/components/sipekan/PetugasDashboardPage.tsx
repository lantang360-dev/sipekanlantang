'use client';

import { useSipekanStore, PageType } from '@/store/sipekan-store';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Users, FileText, Clock, CheckCircle, XCircle, Eye, LogOut, Monitor, BarChart3, ClipboardList, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Separate component to handle redirect without setting state during render
function OfficerRedirect() {
  const { setCurrentPage } = useSipekanStore();
  useEffect(() => {
    setCurrentPage('login-petugas');
  }, [setCurrentPage]);
  return null;
}

interface Registration {
  id: string;
  code: string;
  visitorName: string;
  visitorNik: string;
  visitorPhone: string;
  visitorRelation: string;
  inmateName: string;
  visitDate: string;
  visitorCount: number;
  status: string;
  fotoKtp: string | null;
  jenisPermohonan: string | null;
  service: { name: string; prefix: string };
  createdAt: string;
}

type PetugasTab = 'pendaftaran' | 'display' | 'rekap';

export function PetugasDashboardPage() {
  const { setCurrentPage, officer, setOfficer, setSelectedRegistrationId } = useSipekanStore();
  const [activeTab, setActiveTab] = useState<PetugasTab>('pendaftaran');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filter, setFilter] = useState('semua');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadRegistrations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'semua') params.set('status', filter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/registrations?${params}`);
      const data = await res.json();
      setRegistrations(data.registrations || []);
      setLastRefresh(new Date());
    } catch {
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadRegistrations();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadRegistrations]);

  const handleLogout = () => {
    setOfficer(null);
    setCurrentPage('dashboard');
  };

  const handleTabClick = (tab: PetugasTab) => {
    setActiveTab(tab);
    if (tab === 'display') {
      setCurrentPage('display-antrian');
    } else if (tab === 'rekap') {
      setCurrentPage('rekapitulasi');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'menunggu': return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">Menunggu</span>;
      case 'diverifikasi': return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-800">Diverifikasi</span>;
      case 'ditolak': return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">Ditolak</span>;
      default: return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  if (!officer) {
    // Use useEffect to avoid setting state during render
    return <OfficerRedirect />;
  }

  const tabs: { id: PetugasTab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'pendaftaran', label: 'Pendaftaran', icon: <ClipboardList className="w-5 h-5" />, desc: 'Kelola pendaftaran besukan' },
    { id: 'display', label: 'Display Antrian', icon: <Monitor className="w-5 h-5" />, desc: 'Tampilan layar antrian' },
    { id: 'rekap', label: 'Rekapitulasi', icon: <BarChart3 className="w-5 h-5" />, desc: 'Rekap data pelayanan' },
  ];

  return (
    <div className="px-4 py-6 md:px-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-[#0f1d3e] flex items-center justify-center font-black text-lg shadow-lg shadow-amber-500/20">
            {officer.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-white text-base">{officer.name}</div>
            <div className="text-amber-400/70 text-xs font-medium capitalize">{officer.role}</div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="text-[10px] text-white/30 tabular-nums" title="Terakhir diperbarui">
            ↻ {lastRefresh.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10">
            <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
          </Button>
        </div>
      </div>

      {/* Tab Navigation - LARGE & PROMINENT */}
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-3 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex flex-col items-center gap-2 px-4 py-4 rounded-2xl text-sm font-bold transition-all border-2 ${
              activeTab === tab.id
                ? 'bg-amber-400 text-[#0f1d3e] border-amber-400 shadow-lg shadow-amber-400/25 scale-[1.03]'
                : 'bg-white/8 text-white/70 border-white/15 hover:bg-white/15 hover:text-white hover:border-amber-400/40'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className={`text-[10px] font-normal ${activeTab === tab.id ? 'text-[#0f1d3e]/60' : 'text-white/30'}`}>
              {tab.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content: Pendaftaran */}
      {activeTab === 'pendaftaran' && (
        <div className="max-w-4xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total', value: registrations.length, icon: <FileText className="w-5 h-5 text-[#0f1d3e]" />, bg: 'bg-blue-100' },
              { label: 'Menunggu', value: registrations.filter(r => r.status === 'menunggu').length, icon: <Clock className="w-5 h-5 text-amber-700" />, bg: 'bg-amber-100' },
              { label: 'Diverifikasi', value: registrations.filter(r => r.status === 'diverifikasi').length, icon: <CheckCircle className="w-5 h-5 text-green-700" />, bg: 'bg-green-100' },
              { label: 'Ditolak', value: registrations.filter(r => r.status === 'ditolak').length, icon: <XCircle className="w-5 h-5 text-red-700" />, bg: 'bg-red-100' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/90 rounded-xl border border-white/20 p-3 shadow-sm">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-1.5`}>{stat.icon}</div>
                <div className="text-lg font-extrabold text-[#0f1d3e]">{stat.value}</div>
                <div className="text-[11px] text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filter + Search */}
          <div className="flex gap-2 flex-wrap mb-4">
            {['semua', 'menunggu', 'diverifikasi', 'ditolak'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                  filter === f ? 'bg-amber-400 text-[#0f1d3e] border-amber-400' : 'bg-white/10 text-white/70 border-white/15 hover:border-amber-400/40 hover:text-white'
                }`}>
                {f === 'semua' ? 'Semua' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <div className="flex-1 min-w-[200px]">
              <Input placeholder="Cari nama/NIK..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 text-xs bg-white/10 border-white/15 text-white placeholder:text-white/30 focus:border-amber-400/50" />
            </div>
            <Button size="sm" onClick={loadRegistrations} className="text-xs bg-amber-400 text-[#0f1d3e] hover:bg-amber-500 font-bold">Cari</Button>
          </div>

          {/* Registration List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-white/50">Memuat data...</div>
            ) : registrations.length === 0 ? (
              <div className="bg-white/10 rounded-xl border border-white/10 text-center py-12">
                <FileText className="w-12 h-12 text-white/15 mx-auto mb-3" />
                <p className="font-semibold text-white/40">Tidak ada pendaftaran</p>
                <p className="text-xs text-white/20">Belum ada data pendaftaran untuk ditampilkan</p>
              </div>
            ) : (
              registrations.map(reg => (
                <div key={reg.id}
                  onClick={() => { setSelectedRegistrationId(reg.id); setCurrentPage('petugas-detail'); }}
                  className="bg-white/90 rounded-xl border border-white/20 p-4 cursor-pointer hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-400/5 transition hover:-translate-y-0.5">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className="font-bold text-sm font-mono text-[#0f1d3e]">{reg.code}</span>
                    {getStatusBadge(reg.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[#0f1d3e]" /> {reg.visitorName}</span>
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-[#0f1d3e]" /> {reg.inmateName}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#0f1d3e]" /> {reg.visitDate}</span>
                    <span>{reg.service?.name}</span>
                  </div>
                  {/* KTP Photo indicator */}
                  <div className="flex items-center gap-2 mt-2 text-[11px]">
                    {reg.fotoKtp ? (
                      <span className="flex items-center gap-1 text-green-600 font-medium"><Camera className="w-3 h-3" /> Foto KTP terupload</span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600"><Camera className="w-3 h-3" /> Belum ada foto KTP</span>
                    )}
                    {reg.jenisPermohonan && (
                      <span className="text-gray-400">• {reg.jenisPermohonan}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100 text-[11px] text-gray-400">
                    <span>{new Date(reg.createdAt).toLocaleDateString('id-ID')}</span>
                    <span className="text-[#0f1d3e] font-semibold flex items-center gap-1"><Eye className="w-3 h-3" /> Detail</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => setCurrentPage('dashboard')} className="mt-6 text-white/40 hover:text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-1" /> Beranda
        </Button>
      </div>
    </div>
  );
}
