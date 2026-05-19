'use client';

import { useSipekanStore } from '@/store/sipekan-store';
import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Volume2, VolumeX, RefreshCw, ArrowRight, Play, Pause, SkipForward, SkipBack, Settings, Plus, Trash2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CounterData {
  id: string;
  name: string;
  status: string;
  currentNum: string;
  service: { name: string; prefix: string };
}

interface DisplayData {
  counters: CounterData[];
  waitingCount: number;
  servedCount: number;
  totalToday: number;
  lastCalled: { number: string; counter: { name: string }; service: { name: string } } | null;
  callingCounters: { number: string; counter: { name: string }; service: { name: string } }[];
}

export function DisplayAntrianPage() {
  const { setCurrentPage, officer } = useSipekanStore();
  const [data, setData] = useState<DisplayData | null>(null);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const [highlightCounterId, setHighlightCounterId] = useState<string | null>(null);
  const [mediaSettingsOpen, setMediaSettingsOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<{ id: string; type: string; mediaId: string; title: string }[]>([]);
  const [newMediaType, setNewMediaType] = useState('youtube');
  const [newMediaId, setNewMediaId] = useState('');
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [marqueeText, setMarqueeText] = useState('Selamat datang di Pelayanan Besukan Lapas Kelas IIA Bontang. Pastikan Anda membawa KTP asli yang masih berlaku. Maksimal 3 orang pengunjung per warga binaan.');
  const prevCalledRef = useRef<string | null>(null);

  // Clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  // Speech function
  const speakQueue = useCallback((number: string, counterName: string) => {
    if (!soundOn) return;
    try {
      const utterance = new SpeechSynthesisUtterance(
        `Perhatian. Nomor antrian ${number}, silakan menuju ${counterName}.`
      );
      utterance.lang = 'id-ID';
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch {}
  }, [soundOn]);

  // Poll display data
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/display');
      const d = await res.json();

      // Detect new call for highlight & speech
      if (d.callingCounters?.length > 0) {
        const latest = d.callingCounters[0];
        const callKey = latest.number + '-' + latest.counter?.name;
        if (callKey !== prevCalledRef.current && soundOn) {
          prevCalledRef.current = callKey;
          setHighlightCounterId(latest.counter?.id || null);
          // Speech announcement
          speakQueue(latest.number, latest.counter?.name || '');
          setTimeout(() => setHighlightCounterId(null), 8000);
        }
      }

      setData(d);
    } catch {}
  }, [soundOn, speakQueue]);

  useEffect(() => {
    // Initial fetch with a micro-delay to avoid synchronous setState in effect
    const timeout = setTimeout(fetchData, 0);
    const i = setInterval(fetchData, 3000);
    return () => { clearTimeout(timeout); clearInterval(i); };
  }, [fetchData]);

  // Load media items
  useEffect(() => {
    fetch('/api/media').then(r => r.json()).then(d => setMediaItems(d.items || [])).catch(() => {});
  }, []);

  // Load marquee text from settings
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d.settings?.marquee_text) {
          setMarqueeText(d.settings.marquee_text);
        }
      })
      .catch(() => {});
  }, []);

  // Call next for a counter
  const callNext = async (counterId: string) => {
    try {
      await fetch(`/api/counters/${counterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'call_next' }),
      });
      fetchData();
    } catch {}
  };

  // Add media
  const addMedia = async () => {
    if (!newMediaId || !newMediaTitle) return;
    try {
      await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newMediaType, mediaId: newMediaId, title: newMediaTitle }),
      });
      setNewMediaId('');
      setNewMediaTitle('');
      const res = await fetch('/api/media');
      const d = await res.json();
      setMediaItems(d.items || []);
    } catch {}
  };

  // Remove media
  const removeMedia = async (id: string) => {
    try {
      await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const res = await fetch('/api/media');
      const d = await res.json();
      setMediaItems(d.items || []);
    } catch {}
  };

  if (!data) {
    return (
      <div className="fixed inset-0 bg-[#0a1628] flex items-center justify-center text-white">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-400" />
          <p>Memuat data display...</p>
        </div>
      </div>
    );
  }

  const lastCalledNum = data.callingCounters?.[0]?.number || data.lastCalled?.number || '--';
  const lastCalledCounter = data.callingCounters?.[0]?.counter?.name || data.lastCalled?.counter?.name || 'Menunggu';

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0a1628] via-[#0f2044] to-[#0a1628] text-gray-200 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-black/40 border-b-2 border-amber-400/30 shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm font-bold text-amber-400 tracking-widest uppercase">SIPEKAN</div>
            <div className="text-[10px] text-white/30">Lapas Kelas IIA Bontang</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold tabular-nums text-white tracking-wider" style={{ textShadow: '0 0 10px rgba(251,191,36,.2)' }}>{time}</div>
            <div className="text-[11px] text-white/50">{date}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSoundOn(!soundOn)}
              className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-amber-400 hover:bg-white/10 transition">
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            {officer && (
              <>
                <button onClick={fetchData}
                  className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-amber-400 hover:bg-white/10 transition">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={() => setMediaSettingsOpen(!mediaSettingsOpen)}
                  className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-amber-400 hover:bg-white/10 transition">
                  <Settings className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={() => setCurrentPage('dashboard')}
              className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-amber-400 hover:bg-white/10 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Queue Number Display */}
        <div className="flex-[0_0_42%] flex flex-col justify-center items-center p-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,.06)_0%,transparent_70%)] pointer-events-none" />

          {/* Call Alert Overlay */}
          {highlightCounterId && data.callingCounters?.[0] && (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-700/85 via-amber-500/70 to-amber-400/80 flex flex-col items-center justify-center z-10 animate-in fade-in">
              <div className="text-xs font-semibold text-white/80 tracking-widest uppercase mb-2">Perhatian</div>
              <div className="text-5xl md:text-7xl font-black text-white tracking-wider font-mono">{data.callingCounters[0].number}</div>
              <div className="text-lg font-semibold text-white/90 mt-2">Menuju {data.callingCounters[0].counter?.name}</div>
              <div className="flex items-center gap-6 mt-3">
                <Phone className="w-5 h-5 text-white animate-pulse" />
                <Phone className="w-6 h-6 text-white animate-pulse" />
                <Phone className="w-5 h-5 text-white animate-pulse" />
              </div>
            </div>
          )}

          <div className="text-sm font-semibold text-white/50 tracking-[.2em] uppercase relative z-1 mb-1">Nomor Antrian</div>
          <div className="text-sm font-medium text-amber-400/80 relative z-1 mb-5">{lastCalledCounter}</div>
          <div className="text-7xl md:text-[120px] font-black text-amber-400 tracking-wider leading-none relative z-1 font-mono"
            style={{ textShadow: '0 0 60px rgba(251,191,36,.4), 0 0 120px rgba(251,191,36,.15)' }}>
            {lastCalledNum}
          </div>
          <div className="w-3/5 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent my-5 relative z-1" />
          <div className="text-xs text-white/30 text-center relative z-1 leading-relaxed">
            Menunggu: {data.waitingCount} | Dilayani: {data.servedCount} | Total: {data.totalToday}
          </div>
        </div>

        {/* Media Area */}
        <div className="flex-1 flex flex-col bg-black relative overflow-hidden">
          <div className="flex items-center justify-between px-4 py-1.5 bg-black/60 border-b border-white/5 shrink-0">
            <span className="text-[10px] font-semibold text-white/40 tracking-widest uppercase">Media</span>
            <div className="flex gap-1.5">
              <button onClick={() => setCurrentMediaIdx(Math.max(0, currentMediaIdx - 1))} className="w-7 h-7 rounded-md border border-white/8 bg-white/5 flex items-center justify-center text-white/50 hover:text-amber-400 transition">
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setCurrentMediaIdx(Math.min(mediaItems.length - 1, currentMediaIdx + 1))} className="w-7 h-7 rounded-md border border-white/8 bg-white/5 flex items-center justify-center text-white/50 hover:text-amber-400 transition">
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex-1 relative bg-black">
            {mediaItems.length > 0 && mediaItems[currentMediaIdx] ? (
              mediaItems[currentMediaIdx].type === 'youtube' ? (
                <iframe
                  src={`https://www.youtube.com/embed/${mediaItems[currentMediaIdx].mediaId}?autoplay=1&mute=1&loop=1&controls=0`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/20">
                  <FileIcon className="w-16 h-16" />
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/15">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-3" />
                  <p className="text-sm">Tidak ada media</p>
                  {officer && <p className="text-xs mt-1">Buka Settings untuk menambah media</p>}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-1.5 py-2 bg-black/40 shrink-0">
            {mediaItems.map((_, i) => (
              <button key={i} onClick={() => setCurrentMediaIdx(i)}
                className={`w-2 h-2 rounded-full transition ${i === currentMediaIdx ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,.4)]' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Counter Bar */}
      <div className="flex shrink-0 border-t-2 border-amber-400/25 bg-black/35">
        {data.counters.map(c => (
          <div key={c.id}
            className={`flex-1 py-3.5 text-center border-r border-white/5 last:border-r-0 transition-all ${
              highlightCounterId === c.id ? 'bg-amber-400/8' : c.status !== 'aktif' ? 'opacity-30' : ''
            }`}>
            <div className="text-[10px] font-semibold text-white/40 tracking-widest uppercase mb-1.5">{c.name}</div>
            <div className={`text-2xl md:text-3xl font-black tracking-wider font-mono ${
              highlightCounterId === c.id ? 'text-amber-400' : c.currentNum ? 'text-amber-400' : 'text-[#334155]'
            }`}>
              {c.currentNum || '--'}
            </div>
            <div className="text-[9px] text-white/20 mt-1">{c.service?.name}</div>
            {officer && c.status === 'aktif' && (
              <button onClick={() => callNext(c.id)}
                className="mt-2 px-3 py-1 rounded-md text-[10px] font-semibold border border-amber-400/15 bg-amber-400/8 text-amber-400 hover:bg-amber-400/15 transition">
                Panggil Berikutnya
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Running Text */}
      <div className="bg-black/40 border-t border-amber-400/20 py-2.5 overflow-hidden shrink-0">
        <div className="flex whitespace-nowrap animate-[marqueeScroll_30s_linear_infinite]">
          {[1,2,3].map(i => (
            <span key={i} className="text-lg text-white/80 font-medium pr-16 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              {marqueeText}
            </span>
          ))}
        </div>
      </div>

      {/* Media Settings Modal */}
      {mediaSettingsOpen && officer && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={() => setMediaSettingsOpen(false)}>
          <div className="bg-[#0f2044] border border-amber-400/20 rounded-2xl w-[90%] max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h3 className="text-base font-bold text-amber-400 tracking-wide">Pengaturan Media</h3>
              <button onClick={() => setMediaSettingsOpen(false)} className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-red-400 transition flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-2">
              {mediaItems.map((item, i) => (
                <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition ${i === currentMediaIdx ? 'border-amber-400/35 bg-amber-400/8' : 'border-white/5 bg-white/3 hover:border-amber-400/20'}`}>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full inline-block mb-1 ${item.type === 'youtube' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'}`}>
                      {item.type}
                    </span>
                    <div className="text-sm font-semibold text-white/90 truncate">{item.title}</div>
                    <div className="text-[11px] text-white/25 font-mono truncate">{item.mediaId}</div>
                  </div>
                  <button onClick={() => removeMedia(item.id)} className="w-8 h-8 rounded-md border border-red-400/15 flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-400/10 transition shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="bg-white/3 border border-amber-400/15 rounded-xl p-4 mt-3">
                <div className="text-xs font-semibold text-amber-400 mb-3 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Tambah Media</div>
                <div className="flex gap-2 mb-2">
                  <select value={newMediaType} onChange={e => setNewMediaType(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white/90 text-xs outline-none cursor-pointer">
                    <option value="youtube">YouTube</option>
                    <option value="gdrive">Google Drive</option>
                  </select>
                  <input value={newMediaId} onChange={e => setNewMediaId(e.target.value)} placeholder="Video ID" className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white/90 text-xs outline-none" />
                </div>
                <div className="flex gap-2">
                  <input value={newMediaTitle} onChange={e => setNewMediaTitle(e.target.value)} placeholder="Judul media" className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white/90 text-xs outline-none" />
                  <button onClick={addMedia} className="px-4 py-2 rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-400 text-xs font-semibold hover:bg-amber-400/20 transition flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}
