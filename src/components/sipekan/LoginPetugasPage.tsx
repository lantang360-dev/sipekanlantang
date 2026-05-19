'use client';

import { useSipekanStore } from '@/store/sipekan-store';
import { useState } from 'react';
import { ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginPetugasPage() {
  const { setCurrentPage, setOfficer } = useSipekanStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.officer) {
        setOfficer(data.officer);
        setCurrentPage('petugas-dashboard');
      } else {
        setError(data.error || 'Login gagal');
      }
    } catch {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#0f1d3e] text-white flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Login Petugas</h2>
          <p className="text-gray-500 text-sm mt-1">Masuk untuk mengakses panel petugas</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-sm text-red-700 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label className="text-xs font-semibold">Username</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Masukkan username" className="mt-1" required />
          </div>
          <div>
            <Label className="text-xs font-semibold">Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan password" className="mt-1" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#0f1d3e] hover:bg-[#162b52] py-3">
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>

        <Button variant="ghost" onClick={() => setCurrentPage('dashboard')} className="w-full mt-3 text-gray-500">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Dashboard
        </Button>
      </div>
    </div>
  );
}
