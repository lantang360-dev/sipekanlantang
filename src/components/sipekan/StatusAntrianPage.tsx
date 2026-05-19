'use client';

import { useSipekanStore } from '@/store/sipekan-store';
import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Clock, CheckCircle, Users, AlertCircle, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RecentQueue {
  number: string;
  status: string;
  service: { name: string; prefix: string };
  counter: { name: string } | null;
  calledAt: string | null;
}

export function StatusAntrianPage() {
  const { setCurrentPage, lastQueueNumber } = useSipekanStore();
  const [searchInput, setSearchInput] = useState(lastQueueNumber || '');
  const [result, setResult] = useState<{ number: string; status: string; service: string; counter?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentQueues, setRecentQueues] = useState<RecentQueue[]>([]);

  // Fetch last 5 called/serving queues
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/queues?status=dipanggil');
        const data = await res.json();
        const called = (data.queues || []) as RecentQueue[];
        // Also get "dilayani" queues
        const res2 = await fetch('/api/queues?status=dilayani');
        const data2 = await res2.json();
        const serving = (data2.queues || []) as RecentQueue[];
        // Combine and take last 5 by calledAt
        const combined = [...called, ...serving]
          .sort((a, b) => {
            const timeA = a.calledAt ? new Date(a.calledAt).getTime() : 0;
            const timeB = b.calledAt ? new Date(b.calledAt).getTime() : 0;
            return timeB - timeA;
          })
          .slice(0, 5);
        setRecentQueues(combined);
      } catch {
        setRecentQueues([]);
      }
    };
    fetchRecent();
    const interval = setInterval(fetchRecent, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/queues`);
      const data = await res.json();
      const found = data.queues?.find((q: { number: string }) => q.number === searchInput.trim());
      if (found) {
        setResult({
          number: found.number,
          status: found.status,
          service: found.service?.name || '',
          counter: found.counter?.name,
        });
      } else {
        setResult({ number: searchInput, status: 'tidak_ditemukan', service: '' });
      }
    } catch {
      setResult({ number: searchInput, status: 'error', service: '' });
    } finally {
      setLoading(false);
    }
  };

  const useLastQueue = () => {
    if (lastQueueNumber) {
      setSearchInput(lastQueueNumber);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'menunggu': return { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Menunggu' };
      case 'dipanggil': return { bg: 'bg-green-50', text: 'text-green-700', label: 'Dipanggil' };
      case 'dilayani': return { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Sedang Dilayani' };
      case 'selesai': return { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Selesai' };
      default: return { bg: 'bg-red-50', text: 'text-red-700', label: 'Tidak Ditemukan' };
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => setCurrentPage('dashboard')}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition mb-5">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <Search className="w-5 h-5 text-[#0f1b3d]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Cek Status Antrian</h1>
          <p className="text-white/50 text-sm">Masukkan nomor antrian untuk melihat status</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <div className="flex gap-2">
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Contoh: B-0001"
            className="flex-1"
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading} className="bg-[#0f1b3d] hover:bg-[#162d5a]">
            <Search className="w-4 h-4 mr-1" /> Cari
          </Button>
        </div>
        {lastQueueNumber && (
          <button onClick={useLastQueue} className="text-xs text-[#0f1b3d] font-medium mt-2 hover:underline">
            Gunakan nomor antrian terakhir: {lastQueueNumber}
          </button>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 animate-in fade-in mb-6">
          {result.status === 'tidak_ditemukan' || result.status === 'error' ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">Nomor antrian tidak ditemukan</p>
              <p className="text-xs text-gray-400 mt-1">Pastikan nomor antrian yang dimasukkan sudah benar</p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-5 text-white mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold opacity-80 mb-1">Nomor Antrian</div>
                    <div className="text-3xl font-black tracking-wider">{result.number}</div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(result.status).bg} ${getStatusColor(result.status).text}`}>
                    {getStatusColor(result.status).label}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Layanan', value: result.service },
                  { label: 'Loket', value: result.counter || 'Menunggu' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-[11px] text-gray-500 font-medium">{item.label}</div>
                    <div className="text-sm font-bold">{item.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Recent Called Queues */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ListOrdered className="w-4 h-4 text-[#0f1b3d]" />
          <h3 className="text-sm font-bold text-gray-800">Antrian Terakhir Dipanggil</h3>
        </div>
        {recentQueues.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Belum ada antrian yang dipanggil hari ini</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentQueues.map((q, i) => (
              <div key={q.number + i}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0f1b3d] text-white flex items-center justify-center text-xs font-bold">
                    {q.number.split('-')[0]}
                  </div>
                  <div>
                    <span className="font-bold text-sm font-mono">{q.number}</span>
                    <div className="text-[11px] text-gray-500">{q.service?.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    q.status === 'dipanggil'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {q.status === 'dipanggil' ? 'Dipanggil' : 'Dilayani'}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{q.counter?.name || '-'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-[10px] text-gray-400 text-center mt-3">Diperbarui otomatis setiap 10 detik</div>
      </div>
    </div>
  );
}
