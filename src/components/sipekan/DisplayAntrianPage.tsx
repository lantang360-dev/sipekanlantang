'use client';

import { useSipekanStore } from '@/store/sipekan-store';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  X, Volume2, VolumeX, RefreshCw, SkipForward, RotateCcw,
  Settings, Plus, Trash2, Phone, Play, Video, Link as LinkIcon,
  CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';

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
  callingCounters: { number: string; counter: { name: string }; service: { name: string }; calledAt?: string }[];
}

interface CallFeedback {
  type: 'success' | 'error' | 'loading';
  message: string;
  counterId?: string;
}

// Generate a bell/chime sound using Web Audio API
function playChimeSound(audioCtx?: AudioContext) {
  try {
    const ctx = audioCtx || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const now = ctx.currentTime;

    // Play 3 bell tones (ding ding ding)
    [0, 0.4, 0.8].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = 880 + (i * 110); // A5, A#5, B5
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.3, now + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);

      osc.start(now + delay);
      osc.stop(now + delay + 0.5);
    });

    return ctx;
  } catch {
    return null;
  }
}

// Spell out a queue number for speech: "B-001" -> "B dash nol nol satu"
function spellQueueNumber(num: string): string {
  const digitMap: Record<string, string> = {
    '0': 'nol', '1': 'satu', '2': 'dua', '3': 'tiga', '4': 'empat',
    '5': 'lima', '6': 'enam', '7': 'tujuh', '8': 'delapan', '9': 'sembilan',
  };

  let result = '';
  for (const ch of num) {
    if (ch === '-') {
      result += ' ';
    } else if (digitMap[ch]) {
      result += digitMap[ch] + ' ';
    } else {
      result += ch + ' ';
    }
  }
  return result.trim();
}

export function DisplayAntrianPage() {
  const { setCurrentPage } = useSipekanStore();
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
  const [manualNumbers, setManualNumbers] = useState<Record<string, string>>({});
  const [showManualInput, setShowManualInput] = useState<string | null>(null);
  const [callFeedback, setCallFeedback] = useState<CallFeedback | null>(null);
  const [videoMuted, setVideoMuted] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const speechInitializedRef = useRef(false);
  const prevCalledRef = useRef<string | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytPlayerRef = useRef<HTMLIFrameElement | null>(null);

  // Initialize speech synthesis on first user interaction
  useEffect(() => {
    const initSpeech = () => {
      if (speechInitializedRef.current) return;
      try {
        const utterance = new SpeechSynthesisUtterance('');
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
        speechInitializedRef.current = true;
      } catch {}
    };
    document.addEventListener('click', initSpeech, { once: true });
    document.addEventListener('touchstart', initSpeech, { once: true });
    return () => {
      document.removeEventListener('click', initSpeech);
      document.removeEventListener('touchstart', initSpeech);
    };
  }, []);

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

  // Show feedback toast
  const showFeedback = useCallback((fb: CallFeedback) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setCallFeedback(fb);
    if (fb.type !== 'loading') {
      feedbackTimeoutRef.current = setTimeout(() => setCallFeedback(null), 4000);
    }
  }, []);

  // Toggle video sound
  const toggleVideoSound = useCallback(() => {
    setVideoMuted(prev => {
      const newMuted = !prev;
      // Update HTML5 video element directly
      if (videoRef.current) {
        videoRef.current.muted = newMuted;
      }
      return newMuted;
    });
  }, []);

  // Play chime + speak queue number (temporarily mutes video)
  const announceQueue = useCallback((number: string, counterName: string) => {
    if (!soundOn) return;

    // Temporarily mute video during announcement
    const wasVideoMuted = videoMuted;
    setVideoMuted(true);
    if (videoRef.current) videoRef.current.muted = true;

    // Play chime sound
    audioCtxRef.current = playChimeSound(audioCtxRef.current) || audioCtxRef.current;

    // Wait a bit after chime then speak
    setTimeout(() => {
      try {
        if (!window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const spelledNumber = spellQueueNumber(number);
        const text = `Perhatian. Nomor antrian ${spelledNumber}, silakan menuju ${counterName}.`;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to find Indonesian voice
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find(v => v.lang.startsWith('id'));
        if (idVoice) utterance.voice = idVoice;

        utterance.onend = () => {
          // Restore video sound after announcement finishes
          if (!wasVideoMuted) {
            setVideoMuted(false);
            if (videoRef.current) videoRef.current.muted = false;
          }
        };
        utterance.onerror = () => {
          // Restore video sound on error too
          if (!wasVideoMuted) {
            setVideoMuted(false);
            if (videoRef.current) videoRef.current.muted = false;
          }
        };

        window.speechSynthesis.speak(utterance);

        // Fallback: restore video sound after 10 seconds max
        setTimeout(() => {
          if (!wasVideoMuted) {
            setVideoMuted(false);
            if (videoRef.current) videoRef.current.muted = false;
          }
        }, 10000);
      } catch (e) {
        console.error('Speech error:', e);
        // Restore video sound on error
        if (!wasVideoMuted) {
          setVideoMuted(false);
          if (videoRef.current) videoRef.current.muted = false;
        }
      }
    }, 1200);
  }, [soundOn, videoMuted]);

  // Poll display data
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/display');
      const d = await res.json();

      // Detect new calls from polling
      if (d.callingCounters?.length > 0 && soundOn) {
        const latest = d.callingCounters[0];
        const callKey = latest.number + '-' + latest.counter?.name + '-' + (latest.calledAt || '');
        if (callKey !== prevCalledRef.current) {
          prevCalledRef.current = callKey;
          setHighlightCounterId(latest.counter?.id || null);
          announceQueue(latest.number, latest.counter?.name || '');
          setTimeout(() => setHighlightCounterId(null), 8000);
        }
      }

      setData(d);
    } catch {}
  }, [soundOn, announceQueue]);

  useEffect(() => {
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
        if (d.settings?.marquee_text) setMarqueeText(d.settings.marquee_text);
      })
      .catch(() => {});
  }, []);

  // Ensure voices are loaded
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    const handleVoicesChanged = () => { window.speechSynthesis?.getVoices(); };
    window.speechSynthesis?.addEventListener('voiceschanged', handleVoicesChanged);
    return () => { window.speechSynthesis?.removeEventListener('voiceschanged', handleVoicesChanged); };
  }, []);

  // Call next for a counter
  const callNext = async (counterId: string, counterName: string) => {
    showFeedback({ type: 'loading', message: 'Memanggil antrian berikutnya...', counterId });
    try {
      const res = await fetch(`/api/counters/${counterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'call_next' }),
      });
      const result = await res.json();

      if (result.error) {
        showFeedback({ type: 'error', message: result.error, counterId });
        return;
      }

      // Directly announce from the API response
      const queueNumber = result.queue?.number || result.counter?.currentNum || '';
      const cName = result.queue?.counter?.name || counterName;
      prevCalledRef.current = queueNumber + '-' + cName + '-' + new Date().toISOString();
      setHighlightCounterId(counterId);
      announceQueue(queueNumber, cName);
      setTimeout(() => setHighlightCounterId(null), 8000);

      showFeedback({ type: 'success', message: `Nomor ${queueNumber} dipanggil ke ${cName}`, counterId });
      fetchData();
    } catch {
      showFeedback({ type: 'error', message: 'Gagal memanggil antrian', counterId });
    }
  };

  // Recall current number
  const recallQueue = async (counterId: string, counterName: string, currentNum: string) => {
    if (!currentNum) {
      showFeedback({ type: 'error', message: 'Tidak ada nomor antrian yang sedang dilayani', counterId });
      return;
    }

    showFeedback({ type: 'loading', message: 'Mengulangi panggilan...', counterId });
    try {
      const res = await fetch(`/api/counters/${counterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recall' }),
      });
      const result = await res.json();

      if (result.error) {
        // If recall API fails, still try to announce from current counter number
        prevCalledRef.current = currentNum + '-' + counterName + '-recall-' + Date.now();
        announceQueue(currentNum, counterName);
        setHighlightCounterId(counterId);
        setTimeout(() => setHighlightCounterId(null), 8000);
        showFeedback({ type: 'success', message: `Mengulangi panggilan ${currentNum} ke ${counterName}`, counterId });
        return;
      }

      const queueNumber = result.queue?.number || currentNum;
      const cName = result.queue?.counter?.name || counterName;
      prevCalledRef.current = queueNumber + '-' + cName + '-' + Date.now();
      setHighlightCounterId(counterId);
      announceQueue(queueNumber, cName);
      setTimeout(() => setHighlightCounterId(null), 8000);

      showFeedback({ type: 'success', message: `Mengulangi panggilan ${queueNumber} ke ${cName}`, counterId });
      fetchData();
    } catch {
      // Fallback: just announce directly
      prevCalledRef.current = currentNum + '-' + counterName + '-recall-' + Date.now();
      announceQueue(currentNum, counterName);
      setHighlightCounterId(counterId);
      setTimeout(() => setHighlightCounterId(null), 8000);
      showFeedback({ type: 'success', message: `Mengulangi panggilan ${currentNum}`, counterId });
    }
  };

  // Manual call
  const callManual = async (counterId: string, counterName: string) => {
    const number = manualNumbers[counterId];
    if (!number) {
      showFeedback({ type: 'error', message: 'Masukkan nomor antrian terlebih dahulu', counterId });
      return;
    }

    showFeedback({ type: 'loading', message: `Memanggil nomor ${number}...`, counterId });
    try {
      const res = await fetch(`/api/counters/${counterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'call_manual', manualNumber: number }),
      });
      const result = await res.json();

      if (result.error) {
        showFeedback({ type: 'error', message: result.error, counterId });
        return;
      }

      const queueNumber = result.queue?.number || result.counter?.currentNum || number;
      const cName = result.queue?.counter?.name || counterName;
      prevCalledRef.current = queueNumber + '-' + cName + '-' + new Date().toISOString();
      setHighlightCounterId(counterId);
      announceQueue(queueNumber, cName);
      setTimeout(() => setHighlightCounterId(null), 8000);

      setManualNumbers(prev => ({ ...prev, [counterId]: '' }));
      setShowManualInput(null);
      showFeedback({ type: 'success', message: `Nomor ${queueNumber} dipanggil ke ${cName}`, counterId });
      fetchData();
    } catch {
      showFeedback({ type: 'error', message: 'Gagal memanggil antrian', counterId });
    }
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

  // Only show up to 3 counters
  const displayCounters = data.counters.slice(0, 3);
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
              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition ${soundOn ? 'border-amber-400/30 bg-amber-400/10 text-amber-400' : 'border-white/10 bg-white/5 text-white/50 hover:text-amber-400 hover:bg-white/10'}`}
              title={soundOn ? 'Suara Aktif' : 'Suara Mati'}>
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button onClick={fetchData}
              className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-amber-400 hover:bg-white/10 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => setMediaSettingsOpen(!mediaSettingsOpen)}
              className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-amber-400 hover:bg-white/10 transition"
              title="Pengaturan Video">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentPage('dashboard')}
              className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-red-400/10 transition"
              title="Kembali ke Beranda">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Call Feedback Toast */}
      {callFeedback && (
        <div className={`absolute top-16 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-xl border flex items-center gap-3 shadow-2xl animate-in slide-in-from-top-2 ${
          callFeedback.type === 'success' ? 'bg-emerald-900/90 border-emerald-400/30 text-emerald-200' :
          callFeedback.type === 'error' ? 'bg-red-900/90 border-red-400/30 text-red-200' :
          'bg-[#0f2044]/90 border-amber-400/30 text-amber-200'
        }`}>
          {callFeedback.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {callFeedback.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
          {callFeedback.type === 'loading' && <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />}
          <span className="text-sm font-medium">{callFeedback.message}</span>
        </div>
      )}

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
            <span className="text-[10px] font-semibold text-white/40 tracking-widest uppercase">Informasi Video</span>
            <div className="flex gap-1.5">
              <button onClick={toggleVideoSound}
                className={`w-7 h-7 rounded-md border flex items-center justify-center transition ${videoMuted ? 'border-white/8 bg-white/5 text-white/50 hover:text-amber-400' : 'border-amber-400/30 bg-amber-400/10 text-amber-400'}`}
                title={videoMuted ? 'Nyalakan Suara Video' : 'Matikan Suara Video'}>
                {videoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setCurrentMediaIdx(Math.max(0, currentMediaIdx - 1))} className="w-7 h-7 rounded-md border border-white/8 bg-white/5 flex items-center justify-center text-white/50 hover:text-amber-400 transition">
                <RefreshCw className="w-3.5 h-3.5" />
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
                  key={`yt-${mediaItems[currentMediaIdx].id}-${videoMuted}`}
                  ref={ytPlayerRef}
                  src={`https://www.youtube.com/embed/${mediaItems[currentMediaIdx].mediaId}?autoplay=1&mute=${videoMuted ? 1 : 0}&loop=1&controls=0&playlist=${mediaItems[currentMediaIdx].mediaId}`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; encrypted-media"
                />
              ) : mediaItems[currentMediaIdx].type === 'gdrive' ? (
                <iframe
                  key={`gd-${mediaItems[currentMediaIdx].id}-${videoMuted}`}
                  src={`https://drive.google.com/file/d/${mediaItems[currentMediaIdx].mediaId}/preview`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay"
                />
              ) : mediaItems[currentMediaIdx].type === 'url' ? (
                <video
                  ref={videoRef}
                  src={mediaItems[currentMediaIdx].mediaId}
                  className="absolute inset-0 w-full h-full object-contain"
                  autoPlay
                  muted={videoMuted}
                  loop
                  controls={false}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/20">
                  <Video className="w-16 h-16" />
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/15">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-3" />
                  <p className="text-sm">Tidak ada media</p>
                  <p className="text-xs mt-1">Klik ⚙ untuk menambah video informasi</p>
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

      {/* 3 Counter/Loket Bar */}
      <div className="grid grid-cols-3 shrink-0 border-t-2 border-amber-400/25 bg-black/35">
        {displayCounters.map(c => (
          <div key={c.id}
            className={`py-3.5 text-center border-r border-white/5 last:border-r-0 transition-all relative ${
              highlightCounterId === c.id ? 'bg-amber-400/8' : c.status !== 'aktif' ? 'opacity-30' : ''
            }`}>
            <div className="text-[10px] font-semibold text-white/40 tracking-widest uppercase mb-1.5">{c.name}</div>
            <div className={`text-2xl md:text-3xl font-black tracking-wider font-mono ${
              highlightCounterId === c.id ? 'text-amber-400' : c.currentNum ? 'text-amber-400' : 'text-[#334155]'
            }`}>
              {c.currentNum || '--'}
            </div>
            <div className="text-[9px] text-white/20 mt-1">{c.service?.name}</div>

            {/* Loket Controls - always visible */}
            {c.status === 'aktif' && (
              <div className="flex items-center justify-center gap-1.5 mt-2.5 px-2 flex-wrap">
                {/* Panggil Berikutnya */}
                <button onClick={() => callNext(c.id, c.name)}
                  className="px-2.5 py-1.5 rounded-md text-[10px] font-semibold border border-amber-400/15 bg-amber-400/8 text-amber-400 hover:bg-amber-400/15 transition flex items-center gap-1 active:scale-95">
                  <SkipForward className="w-3 h-3" />
                  Berikutnya
                </button>
                {/* Ulangi Panggilan */}
                <button onClick={() => recallQueue(c.id, c.name, c.currentNum)}
                  className="px-2.5 py-1.5 rounded-md text-[10px] font-semibold border border-blue-400/15 bg-blue-400/8 text-blue-400 hover:bg-blue-400/15 transition flex items-center gap-1 active:scale-95">
                  <RotateCcw className="w-3 h-3" />
                  Ulangi
                </button>
                {/* Panggilan Manual */}
                <button onClick={() => setShowManualInput(showManualInput === c.id ? null : c.id)}
                  className={`px-2.5 py-1.5 rounded-md text-[10px] font-semibold border transition flex items-center gap-1 active:scale-95 ${
                    showManualInput === c.id
                      ? 'border-green-400/30 bg-green-400/15 text-green-400'
                      : 'border-green-400/15 bg-green-400/8 text-green-400 hover:bg-green-400/15'
                  }`}>
                  <Phone className="w-3 h-3" />
                  Manual
                </button>
              </div>
            )}

            {/* Manual Input */}
            {showManualInput === c.id && (
              <div className="flex items-center justify-center gap-1.5 mt-2 px-2">
                <input
                  value={manualNumbers[c.id] || ''}
                  onChange={e => setManualNumbers(prev => ({ ...prev, [c.id]: e.target.value }))}
                  placeholder="No. antrian (B-001)"
                  className="w-28 px-2 py-1 rounded-md border border-white/15 bg-white/5 text-white text-[11px] outline-none text-center focus:border-green-400/40"
                  onKeyDown={e => e.key === 'Enter' && callManual(c.id, c.name)}
                  autoFocus
                />
                <button onClick={() => callManual(c.id, c.name)}
                  className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-green-400/15 border border-green-400/25 text-green-400 hover:bg-green-400/25 transition active:scale-95">
                  Panggil
                </button>
              </div>
            )}

            {/* Per-counter feedback indicator */}
            {callFeedback?.counterId === c.id && callFeedback.type === 'loading' && (
              <div className="flex items-center justify-center gap-1 mt-1.5">
                <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
                <span className="text-[9px] text-amber-400/80">Memproses...</span>
              </div>
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
      {mediaSettingsOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={() => setMediaSettingsOpen(false)}>
          <div className="bg-[#0f2044] border border-amber-400/20 rounded-2xl w-[90%] max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h3 className="text-base font-bold text-amber-400 tracking-wide">Pengaturan Video Informasi</h3>
              <button onClick={() => setMediaSettingsOpen(false)} className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-red-400 transition flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-2">
              {mediaItems.map((item, i) => (
                <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition ${i === currentMediaIdx ? 'border-amber-400/35 bg-amber-400/8' : 'border-white/5 bg-white/3 hover:border-amber-400/20'}`}>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full inline-block mb-1 ${
                      item.type === 'youtube' ? 'bg-red-500/15 text-red-400' :
                      item.type === 'gdrive' ? 'bg-blue-500/15 text-blue-400' :
                      'bg-green-500/15 text-green-400'
                    }`}>
                      {item.type === 'youtube' ? 'YouTube' : item.type === 'gdrive' ? 'Google Drive' : 'URL Video'}
                    </span>
                    <div className="text-sm font-semibold text-white/90 truncate">{item.title}</div>
                    <div className="text-[11px] text-white/25 font-mono truncate">
                      {item.mediaId}
                    </div>
                  </div>
                  <button onClick={() => removeMedia(item.id)} className="w-8 h-8 rounded-md border border-red-400/15 flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-400/10 transition shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="bg-white/3 border border-amber-400/15 rounded-xl p-4 mt-3">
                <div className="text-xs font-semibold text-amber-400 mb-3 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Tambah Video</div>

                {/* Source Type Selection */}
                <div className="mb-3">
                  <div className="text-[10px] font-semibold text-white/40 tracking-wider uppercase mb-2">Sumber Video</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewMediaType('youtube')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition ${
                        newMediaType === 'youtube' ? 'border-red-400/40 bg-red-400/10 text-red-400' : 'border-white/10 bg-white/3 text-white/40 hover:text-white/60'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      YouTube
                    </button>
                    <button
                      onClick={() => setNewMediaType('gdrive')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition ${
                        newMediaType === 'gdrive' ? 'border-blue-400/40 bg-blue-400/10 text-blue-400' : 'border-white/10 bg-white/3 text-white/40 hover:text-white/60'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      Google Drive
                    </button>
                    <button
                      onClick={() => setNewMediaType('url')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition ${
                        newMediaType === 'url' ? 'border-green-400/40 bg-green-400/10 text-green-400' : 'border-white/10 bg-white/3 text-white/40 hover:text-white/60'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      URL Video
                    </button>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-2">
                  <input
                    value={newMediaId}
                    onChange={e => setNewMediaId(e.target.value)}
                    placeholder={
                      newMediaType === 'youtube' ? 'YouTube Video ID (contoh: dQw4w9WgXcQ)' :
                      newMediaType === 'gdrive' ? 'Google Drive File ID' :
                      'URL video (contoh: https://example.com/video.mp4)'
                    }
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white/90 text-xs outline-none focus:border-amber-400/30"
                  />
                  <div className="flex gap-2">
                    <input
                      value={newMediaTitle}
                      onChange={e => setNewMediaTitle(e.target.value)}
                      placeholder="Judul video"
                      className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white/90 text-xs outline-none focus:border-amber-400/30"
                    />
                    <button onClick={addMedia} className="px-4 py-2 rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-400 text-xs font-semibold hover:bg-amber-400/20 transition flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Tambah
                    </button>
                  </div>
                </div>

                {/* Help Text */}
                <div className="mt-3 text-[10px] text-white/25 leading-relaxed">
                  {newMediaType === 'youtube' && '💡 Masukkan YouTube Video ID yang terdapat di URL setelah "v=". Contoh: https://youtube.com/watch?v=XXXXXXX → masukkan XXXXXXX'}
                  {newMediaType === 'gdrive' && '💡 Masukkan Google Drive File ID dari link berbagi. Contoh: https://drive.google.com/file/d/XXXXXXX/view → masukkan XXXXXXX'}
                  {newMediaType === 'url' && '💡 Masukkan URL langsung ke file video (MP4, WebM, dll). Video akan diputar otomatis dengan loop.'}
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
