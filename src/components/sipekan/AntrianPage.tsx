'use client';

import { useSipekanStore } from '@/store/sipekan-store';
import { useState, useEffect, useCallback } from 'react';
import { Shield, Package, Headphones, ArrowLeft, CheckCircle, Clock, Volume2, Search, Printer, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Service {
  id: string;
  name: string;
  prefix: string;
  description: string;
  estimatedMin: number;
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  B: <Shield className="w-6 h-6" />,
  P: <Package className="w-6 h-6" />,
  A: <Headphones className="w-6 h-6" />,
};

function speakQueueNumber(number: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Parse the queue number (e.g., "B-001" -> "B dash 001")
  const parts = number.split('-');
  const spokenParts = parts.map(part => {
    // If it's a number string like "001", spell out digits
    if (/^\d+$/.test(part)) {
      return part.split('').join(' ');
    }
    return part;
  }).join(' ');

  const text = `Nomor antrian Anda adalah ${spokenParts}. Harap menunggu di ruang tunggu.`;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'id-ID';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Try to find an Indonesian voice
  const voices = window.speechSynthesis.getVoices();
  const idVoice = voices.find(v => v.lang.startsWith('id'));
  if (idVoice) {
    utterance.voice = idVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function AntrianPage() {
  const { setCurrentPage, setLastQueueNumber } = useSipekanStore();
  const [services, setServices] = useState<Service[]>([]);
  const [successData, setSuccessData] = useState<{ number: string; service: string; date: string; time: string; est: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Check speech synthesis support
  useEffect(() => {
    setSpeechSupported(typeof window !== 'undefined' && !!window.speechSynthesis);
  }, []);

  // Track speaking state
  useEffect(() => {
    if (!successData || !speechSupported) return;
    const checkSpeaking = setInterval(() => {
      if (window.speechSynthesis && !window.speechSynthesis.speaking) {
        setIsSpeaking(false);
      }
    }, 500);
    return () => clearInterval(checkSpeaking);
  }, [successData, speechSupported]);

  const handleSpeak = useCallback(() => {
    if (!successData || !speechSupported) return;
    speakQueueNumber(successData.number);
    setIsSpeaking(true);
  }, [successData, speechSupported]);

  const handleStopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(data => setServices(data.services || []))
      .catch(() => {});
  }, []);

  const takeQueue = async (serviceId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/queues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }),
      });
      const data = await res.json();
      if (data.queue) {
        const now = new Date();
        setSuccessData({
          number: data.queue.number,
          service: data.queue.service.name,
          date: now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          est: `~${data.queue.service.estimatedMin} menit`,
        });
        setLastQueueNumber(data.queue.number);
      }
    } catch {
      alert('Gagal mengambil antrian. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center print-ticket">
          <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-5 animate-bounce print-hidden">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold mb-2">Antrian Berhasil Diambil!</h2>
          <p className="text-gray-500 text-sm mb-6">Simpan nomor antrian Anda</p>

          <div className="inline-flex items-center gap-3 bg-[#0f1d3e] text-white rounded-xl px-8 py-5 text-4xl font-black tracking-widest shadow-lg mb-6 print:bg-white print:text-[#0f1d3e] print:shadow-none print:border print:border-gray-300 print:rounded-lg">
            {successData.number}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 text-left max-w-sm mx-auto mb-4">
            {[
              { label: 'Layanan', value: successData.service },
              { label: 'Tanggal', value: successData.date },
              { label: 'Waktu', value: successData.time },
              { label: 'Estimasi', value: successData.est },
            ].map((row, i) => (
              <div key={i} className="flex justify-between py-2 border-b last:border-b-0 text-sm">
                <span className="text-gray-500 font-medium">{row.label}</span>
                <span className="font-semibold">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-300 rounded-md p-3 text-xs text-amber-800 text-left max-w-sm mx-auto mb-6 flex items-start gap-2">
            <Volume2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Nomor antrian akan dipanggil melalui pengumuman. Harap menunggu di ruang tunggu.</span>
          </div>

          <div className="flex gap-3 justify-center flex-wrap print-hidden">
            <Button onClick={() => window.print()} className="flex items-center gap-2 bg-[#0f1d3e] hover:bg-[#162b52] text-white">
              <Printer className="w-4 h-4" /> Cetak Tiket
            </Button>
            {speechSupported && (
              isSpeaking ? (
                <Button variant="outline" onClick={handleStopSpeaking} className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50">
                  <VolumeX className="w-4 h-4 animate-pulse" /> Berhenti
                </Button>
              ) : (
                <Button variant="outline" onClick={handleSpeak} className="flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50">
                  <Volume2 className="w-4 h-4" /> Dengarkan
                </Button>
              )
            )}
            <Button variant="outline" onClick={() => setCurrentPage('display-antrian')} className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Display Antrian
            </Button>
            <Button variant="outline" onClick={() => setCurrentPage('status-antrian')} className="flex items-center gap-2">
              <Search className="w-4 h-4" /> Cek Status
            </Button>
          </div>

          <Button variant="ghost" onClick={() => { setSuccessData(null); handleStopSpeaking(); }} className="mt-4 print-hidden">
            Ambil Antrian Lagi
          </Button>
        </div>

        {/* Print-only footer */}
        <div className="hidden print:block text-center text-xs text-gray-400 mt-4 pt-4 border-t border-dashed border-gray-300">
          SIPEKAN — Sistem Informasi Pelayanan Besukan Lapas | Dicetak pada {new Date().toLocaleString('id-ID')}
        </div>

        <style>{`
          @media print {
            header, footer, .print-hidden { display: none !important; }
            body { background: white !important; }
            .print-ticket { border: 2px dashed #ccc !important; padding: 24px !important; }
            .print\\:bg-white { background: white !important; }
            .print\\:text-\\[\\#0f1d3e\\] { color: #0f1d3e !important; }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:border { border: 2px solid #333 !important; }
            .print\\:rounded-lg { border-radius: 8px !important; }
            .print\\:block { display: block !important; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button onClick={() => setCurrentPage('dashboard')}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition mb-5">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#0f1d3e]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Ambil Antrian</h1>
          <p className="text-white/50 text-sm">Pilih layanan untuk mendapatkan nomor antrian</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
        <Clock className="w-5 h-5 text-[#0f1d3e] shrink-0 mt-0.5" />
        <p className="text-sm text-[#0f1d3e]">
          Pilih layanan yang Anda butuhkan. Nomor antrian akan diberikan secara otomatis.
        </p>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map(service => (
          <div key={service.id}
            className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#0f1d3e] hover:shadow-md transition cursor-default">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-3 text-[#0f1d3e]">
              {SERVICE_ICONS[service.prefix] || <Shield className="w-6 h-6" />}
            </div>
            <div className="font-bold text-sm mb-1">{service.name}</div>
            <div className="text-xs text-gray-500 leading-relaxed mb-2">{service.description}</div>
            <div className="text-xs text-[#0f1d3e] font-semibold mb-4">Estimasi: ~{service.estimatedMin} menit</div>
            <div className="border-t pt-4">
              <Button
                onClick={() => takeQueue(service.id)}
                disabled={loading}
                className="w-full bg-[#0f1d3e] hover:bg-[#162b52] text-white"
              >
                {loading ? 'Memproses...' : 'Ambil Nomor Antrian'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
