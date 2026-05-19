'use client';

import { useSipekanStore } from '@/store/sipekan-store';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Settings, MessageSquare, Key, Globe, Save, CheckCircle, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SettingsPage() {
  const { setCurrentPage, officer } = useSipekanStore();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Only admin can access settings
  useEffect(() => {
    if (officer?.role !== 'admin') {
      setCurrentPage('dashboard');
    }
  }, [officer, setCurrentPage]);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => setSettings(d.settings || {}))
      .catch(() => {});
  }, []);

  const handleSave = useCallback(async (key: string, value: string) => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setSettings(s => ({ ...s, [key]: value }));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      alert('Gagal menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveAll = useCallback(async () => {
    setLoading(true);
    setSaved(false);
    try {
      const waKeys = ['wa_api_key', 'wa_device_url'];
      await Promise.all(waKeys.map(key =>
        fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: settings[key] || '' }),
        })
      ));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Gagal menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
  }, [settings]);

  const handleTestWhatsApp = useCallback(async () => {
    if (!testPhone) {
      setTestResult({ success: false, message: 'Masukkan nomor telepon terlebih dahulu' });
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: `✅ Pesan test berhasil terkirim ke ${testPhone}! Cek WhatsApp Anda.` });
      } else {
        setTestResult({ success: false, message: `❌ Gagal: ${data.error || 'Unknown error'}` });
      }
    } catch (err) {
      setTestResult({ success: false, message: `❌ Error: ${err instanceof Error ? err.message : 'Gagal menghubungi server'}` });
    } finally {
      setTestLoading(false);
    }
  }, [testPhone]);

  if (officer?.role !== 'admin') return null;

  const waApiKey = settings['wa_api_key'] || '';
  const waDeviceUrl = settings['wa_device_url'] || 'https://api.fonnte.com/send';
  const isWaConfigured = !!waApiKey;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => setCurrentPage('dashboard')}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition mb-5">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
          <Settings className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Pengaturan</h1>
          <p className="text-white/50 text-sm">Konfigurasi sistem SIPEKAN</p>
        </div>
      </div>

      {/* WhatsApp Integration Settings */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-5">
        <div className="bg-green-600 px-5 py-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-white" />
          <h3 className="font-bold text-sm text-white">Integrasi WhatsApp</h3>
          <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${isWaConfigured ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-600'}`}>
            {isWaConfigured ? 'Aktif' : 'Belum Dikonfigurasi'}
          </span>
        </div>
        <div className="p-5 space-y-4">
          {/* Status Info */}
          <div className={`rounded-lg p-3 flex items-start gap-2 ${isWaConfigured ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            {isWaConfigured ? (
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <p className="text-xs text-gray-700 leading-relaxed">
              {isWaConfigured
                ? 'WhatsApp terkonfigurasi. Pengunjung akan menerima notifikasi WhatsApp saat pendaftaran diverifikasi.'
                : 'WhatsApp belum dikonfigurasi. Daftar di fonnte.com, masukkan API key di bawah.'}
            </p>
          </div>

          {/* Fonnte API Key */}
          <div>
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Key className="w-3.5 h-3.5" /> Fonnte API Key <span className="text-red-500">*</span>
            </Label>
            <Input
              type="password"
              value={waApiKey}
              onChange={e => setSettings(s => ({ ...s, wa_api_key: e.target.value }))}
              placeholder="Masukkan API key dari fonnte.com"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Dapatkan API key gratis di <a href="https://fonnte.com" target="_blank" rel="noopener noreferrer" className="text-green-600 underline">fonnte.com</a> → Dashboard → API Key
            </p>
          </div>

          {/* Device URL */}
          <div>
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Fonnte API URL
            </Label>
            <Input
              value={waDeviceUrl}
              onChange={e => setSettings(s => ({ ...s, wa_device_url: e.target.value }))}
              placeholder="https://api.fonnte.com/send"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default: https://api.fonnte.com/send (tidak perlu diubah kecuali menggunakan endpoint khusus)
            </p>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveAll}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {saved ? (
              <><CheckCircle className="w-4 h-4 mr-1" /> Tersimpan!</>
            ) : (
              <><Save className="w-4 h-4 mr-1" /> {loading ? 'Menyimpan...' : 'Simpan Pengaturan WhatsApp'}</>
            )}
          </Button>

          {/* Test WhatsApp Section */}
          {isWaConfigured && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <Label className="text-xs font-semibold flex items-center gap-1 mb-2">
                <Send className="w-3.5 h-3.5" /> Test Kirim WhatsApp
              </Label>
              <p className="text-xs text-gray-500 mb-3">
                Kirim pesan test untuk memastikan integrasi WhatsApp berfungsi.
              </p>
              <div className="flex gap-2">
                <Input
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="flex-1"
                />
                <Button
                  onClick={handleTestWhatsApp}
                  disabled={testLoading || !testPhone}
                  variant="outline"
                  className="shrink-0"
                >
                  {testLoading ? (
                    <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Mengirim...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-1" /> Test</>
                  )}
                </Button>
              </div>
              {testResult && (
                <div className={`mt-3 p-3 rounded-lg text-xs ${testResult.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                  {testResult.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-[#0f1d3e] px-5 py-3">
          <h3 className="font-bold text-sm text-white">Cara Kerja Notifikasi WhatsApp</h3>
        </div>
        <div className="p-5">
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span>Pengunjung mendaftar online dan mengisi nomor WhatsApp</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <span>Petugas memverifikasi pendaftaran di dashboard</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <span>Sistem otomatis mengirim pesan WhatsApp berisi No. Registrasi ke nomor pengunjung</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">!</span>
              <span className="text-amber-700">Pastikan nomor HP pengunjung menggunakan format 08xx atau 62xx agar notifikasi terkirim</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
