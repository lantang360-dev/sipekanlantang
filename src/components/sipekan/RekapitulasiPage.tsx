'use client';

import { useSipekanStore } from '@/store/sipekan-store';
import { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, Users, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Stats {
  totalQueues: number;
  waitingQueues: number;
  servedQueues: number;
  totalRegistrations: number;
  services: { name: string; prefix: string; _count: { queues: number } }[];
  counters: { name: string; currentNum: string; service: { name: string }; status: string }[];
}

export function RekapitulasiPage() {
  const { setCurrentPage } = useSipekanStore();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const loadStats = () => {
      fetch('/api/stats').then(r => r.json()).then(d => setStats(d)).catch(() => {});
    };
    loadStats();
    window.addEventListener('sipekan-refresh', loadStats);
    return () => window.removeEventListener('sipekan-refresh', loadStats);
  }, []);

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (!stats) {
    return <div className="text-center py-12 text-white/50">Memuat data...</div>;
  }

  const progress = stats.totalQueues > 0 ? Math.round((stats.servedQueues / stats.totalQueues) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button onClick={() => setCurrentPage('dashboard')}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition mb-5">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-[#0f1b3d]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Rekapitulasi Harian</h1>
          <p className="text-white/50 text-sm">{today}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Antrian', value: stats.totalQueues, icon: <Users className="w-5 h-5 text-[#0f1b3d]" />, bg: 'bg-blue-50' },
          { label: 'Menunggu', value: stats.waitingQueues, icon: <Clock className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
          { label: 'Dilayani', value: stats.servedQueues, icon: <CheckCircle className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' },
          { label: 'Pendaftaran', value: stats.totalRegistrations, icon: <BarChart3 className="w-5 h-5 text-[#0f1b3d]" />, bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>{stat.icon}</div>
            <div className="text-xl font-extrabold">{stat.value}</div>
            <div className="text-[11px] text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h3 className="font-bold text-sm mb-3">Progres Pelayanan</h3>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#0f1b3d] to-amber-400 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm font-bold text-[#0f1b3d]">{progress}%</span>
        </div>
        <p className="text-xs text-gray-500">{stats.servedQueues} dari {stats.totalQueues} antrian telah dilayani</p>
      </div>

      {/* Per Layanan */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h3 className="font-bold text-sm mb-4">Per Layanan</h3>
        <div className="space-y-3">
          {stats.services.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0f1b3d]/8 flex items-center justify-center text-[#0f1b3d] font-bold text-xs">
                {s.prefix}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{s.name}</div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-[#0f1b3d] rounded-full"
                    style={{ width: `${stats.totalQueues > 0 ? (s._count.queues / stats.totalQueues) * 100 : 0}%` }} />
                </div>
              </div>
              <span className="text-sm font-bold">{s._count.queues}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per Loket */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="font-bold text-sm mb-4">Per Loket</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-2 font-semibold">Loket</th>
                <th className="text-left py-2 font-semibold">Layanan</th>
                <th className="text-center py-2 font-semibold">Status</th>
                <th className="text-center py-2 font-semibold">Nomor Terakhir</th>
              </tr>
            </thead>
            <tbody>
              {stats.counters.map((c, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="py-2.5 font-semibold">{c.name}</td>
                  <td className="py-2.5 text-gray-500">{c.service?.name}</td>
                  <td className="py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      c.status === 'aktif' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
                    }`}>{c.status}</span>
                  </td>
                  <td className="py-2.5 text-center font-mono font-bold">{c.currentNum || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
