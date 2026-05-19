'use client';

import { useSipekanStore, PageType } from '@/store/sipekan-store';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Users, FileText, Clock, CheckCircle, XCircle, Eye, LogOut, Monitor, BarChart3, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

  // Navigate when display or rekap tab is selected
  useEffect(() => {
    if (activeTab === 'display') {
      setCurrentPage('display-antrian');
    } else if (activeTab === 'rekap') {
      setCurrentPage('rekapitulasi');
    }
  }, [activeTab, setCurrentPage]);

  const handleLogout = () => {
    setOfficer(null);
    setCurrentPage('dashboard');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'menunggu': return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">Menunggu</span>;
      case 'diverifikasi': return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700">Diverifikasi</span>;
      case 'ditolak': return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700">Ditolak</span>;
      default: return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-50 text-gray-700">{status}</span>;
    }
  };

  if (!officer) {
    setCurrentPage('login-petugas');
    return null;
  }

  const tabs: { id: PetugasTab; label: string; icon: React.ReactNode }[] = [
    { id: 'pendaftaran', label: 'Pendaftaran', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'display', label: 'Display Antrian', icon: <Monitor className="w-4 h-4" /> },
    { id: 'rekap', label: 'Rekapitulasi', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0f1d3e] text-white flex items-center justify-center font-bold text-lg">
            {officer.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-white text-sm">{officer.name}</div>
            <div className="text-white/50 text-xs capitalize">{officer.role}</div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="text-[10px] text-white/30 tabular-nums" title="Terakhir diperbarui">
            ↻ {lastRefresh.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300">
            <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
          </Button>
        </div>
      </div>

      {/* Tab Navigation - PROMINENT */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[#0f1d3e] text-white shadow-lg shadow-[#0f1d3e]/30 scale-[1.02]'
                : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white border border-white/10'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content: Pendaftaran */}
      {activeTab === 'pendaftaran' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total', value: registrations.length, icon: <FileText className="w-5 h-5 text-[#0f1d3e]" />, bg: 'bg-blue-50' },
              { label: 'Menunggu', value: registrations.filter(r => r.status === 'menunggu').length, icon: <Clock className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
              { label: 'Diverifikasi', value: registrations.filter(r => r.status === 'diverifikasi').length, icon: <CheckCircle className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' },
              { label: 'Ditolak', value: registrations.filter(r => r.status === 'ditolak').length, icon: <XCircle className="w-5 h-5 text-red-600" />, bg: 'bg-red-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-1.5`}>{stat.icon}</div>
                <div className="text-lg font-extrabold">{stat.value}</div>
                <div className="text-[11px] text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filter + Search */}
          <div className="flex gap-2 flex-wrap mb-4">
            {['semua', 'menunggu', 'diverifikasi', 'ditolak'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                  filter === f ? 'bg-[#0f1d3e] text-white border-[#0f1d3e]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#0f1d3e] hover:text-[#0f1d3e]'
                }`}>
                {f === 'semua' ? 'Semua' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <div className="flex-1 min-w-[200px]">
              <Input placeholder="Cari nama/NIK..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 text-xs" />
            </div>
            <Button size="sm" onClick={loadRegistrations} className="text-xs bg-[#0f1d3e] hover:bg-[#162b52]">Cari</Button>
          </div>

          {/* Registration List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-white/50">Memuat data...</div>
            ) : registrations.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
                <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-semibold text-gray-400">Tidak ada pendaftaran</p>
                <p className="text-xs text-gray-300">Belum ada data pendaftaran untuk ditampilkan</p>
              </div>
            ) : (
              registrations.map(reg => (
                <div key={reg.id}
                  onClick={() => { setSelectedRegistrationId(reg.id); setCurrentPage('petugas-detail'); }}
                  className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-[#0f1d3e] hover:shadow-md transition hover:-translate-y-0.5">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className="font-bold text-sm font-mono">{reg.code}</span>
                    {getStatusBadge(reg.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[#0f1d3e]" /> {reg.visitorName}</span>
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-[#0f1d3e]" /> {reg.inmateName}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#0f1d3e]" /> {reg.visitDate}</span>
                    <span>{reg.service?.name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t text-[11px] text-gray-400">
                    <span>{new Date(reg.createdAt).toLocaleDateString('id-ID')}</span>
                    <span className="text-[#0f1d3e] font-semibold flex items-center gap-1"><Eye className="w-3 h-3" /> Detail</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Tab Content: Display Antrian (preview card) */}
      {activeTab === 'display' && (
        <div className="bg-white/10 rounded-xl border border-white/15 p-8 text-center">
          <Monitor className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Display Antrian</h3>
          <p className="text-white/50 text-sm mb-6">Membuka halaman display antrian layar penuh</p>
        </div>
      )}

      {/* Tab Content: Rekapitulasi (preview card) */}
      {activeTab === 'rekap' && (
        <div className="bg-white/10 rounded-xl border border-white/15 p-8 text-center">
          <BarChart3 className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Rekapitulasi</h3>
          <p className="text-white/50 text-sm mb-6">Membuka halaman rekapitulasi data pelayanan</p>
        </div>
      )}

      <Button variant="ghost" onClick={() => setCurrentPage('dashboard')} className="mt-6 text-white/50 hover:text-white">
        <ArrowLeft className="w-4 h-4 mr-1" /> Beranda
      </Button>
    </div>
  );
}
