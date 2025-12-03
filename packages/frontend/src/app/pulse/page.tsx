'use client';

// The pulse of information, visualized and heard.

import { useEffect, useRef, useState, useCallback } from 'react';
import { generateGrowth, generateFlow, TimeSeriesPoint } from '@confluence/shared/utils/generators';
import { calculateHarmony, HarmonyMetrics } from '@confluence/shared/utils/math';
import { DataSonifier } from '@/lib/sonify';
import Navigation from '@/components/Navigation';
import WaveformVisualizer from '@/components/WaveformVisualizer';

// Particle system for audio-reactive visuals
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
  size: number;
}

// Ring expansion animation
interface Ring {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  hue: number;
}

export default function PulsePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sonifierRef = useRef<DataSonifier | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ringsRef = useRef<Ring[]>([]);
  const timeRef = useRef(0);

  const [growth, setGrowth] = useState<TimeSeriesPoint[]>([]);
  const [flow, setFlow] = useState<TimeSeriesPoint[]>([]);
  const [harmony, setHarmony] = useState<HarmonyMetrics | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 900, height: 500 });
  const [tempo, setTempo] = useState(72);
  const [scale, setScale] = useState('lydian');
  const [reverb, setReverb] = useState(35);
  const [harmonyBlend, setHarmonyBlend] = useState(50);
  const [showControls, setShowControls] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [allMuted, setAllMuted] = useState(false);
  const [tempoFlash, setTempoFlash] = useState(false);
  const [scaleFlash, setScaleFlash] = useState('');
  const [toneInstance, setToneInstance] = useState<any>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTempo = localStorage.getItem('pulse_tempo');
      const savedScale = localStorage.getItem('pulse_scale');
      const savedReverb = localStorage.getItem('pulse_reverb');
      const savedHarmonyBlend = localStorage.getItem('pulse_harmonyBlend');
      const savedShowControls = localStorage.getItem('pulse_showControls');

      if (savedTempo) setTempo(Number(savedTempo));
      if (savedScale) setScale(savedScale);
      if (savedReverb) setReverb(Number(savedReverb));
      if (savedHarmonyBlend) setHarmonyBlend(Number(savedHarmonyBlend));
      if (savedShowControls) setShowControls(savedShowControls === 'true');
    }
  }, []);

  // Generate data on mount
  useEffect(() => {
    const g = generateGrowth(100, 0.08);
    const f = generateFlow(100, 4, 0.15);
    setGrowth(g);
    setFlow(f);
    setHarmony(calculateHarmony([g, f]));
  }, []);

  // Apply control changes to sonifier in real-time
  useEffect(() => {
    if (sonifierRef.current) {
      sonifierRef.current.setTempo(tempo);
      sonifierRef.current.setScale(scale);
      sonifierRef.current.setReverb(reverb / 100);
      sonifierRef.current.setHarmonyBlend(harmonyBlend / 100);

      // If playing and tempo changed, restart playback to apply new tempo
      if (isPlaying && growth.length > 0) {
        sonifierRef.current.playSeries(growth);
        if (harmony) {
          sonifierRef.current.setHarmony(harmony.overall);
          sonifierRef.current.setMomentum(harmony.momentum);
          sonifierRef.current.setBalance(harmony.balance);
        }
      }
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulse_tempo', tempo.toString());
      localStorage.setItem('pulse_scale', scale);
      localStorage.setItem('pulse_reverb', reverb.toString());
      localStorage.setItem('pulse_harmonyBlend', harmonyBlend.toString());
    }
  }, [tempo, scale, reverb, harmonyBlend]);

  // Save control panel state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulse_showControls', showControls.toString());
    }
  }, [showControls]);

  // Handle window resize for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      const maxWidth = Math.min(window.innerWidth - 64, 1200);
      const height = Math.min(window.innerHeight * 0.5, 500);
      setCanvasDimensions({ width: maxWidth, height });
    };

    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simple perlin-like noise for organic motion
  const noise = (x: number, y: number, t: number): number => {
    return Math.sin(x * 0.01 + t * 0.1) * Math.cos(y * 0.01 + t * 0.15) * 0.5 + 0.5;
  };

  // Add particles burst
  const addParticleBurst = (x: number, y: number, count: number, hue: number) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1 + Math.random() * 3;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.5 + Math.random() * 1,
        hue,
        size: 2 + Math.random() * 4
      });
    }
  };

  // Add expanding ring
  const addRing = (x: number, y: number, hue: number) => {
    ringsRef.current.push({
      x,
      y,
      radius: 0,
      maxRadius: 80 + Math.random() * 120,
      alpha: 1,
      hue
    });
  };

  // Animation loop - continuous rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      timeRef.current += dt;
      const t = timeRef.current;

      // Trail effect (instead of full clear)
      ctx.fillStyle = 'rgba(10, 10, 20, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // === BACKGROUND - Swirling organic noise ===
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const n = noise(x, y, t);
        const hue = (n * 60 + t * 10) % 360;
        const alpha = n * 0.1;
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
        ctx.fillRect(x, y, 2, 2);
      }

      // === DRAW FLOW - Flowing water with glow ===
      if (flow.length > 0) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(100, 180, 255, 0.8)';
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(100, 180, 255, 0.6)';
        ctx.lineWidth = 3;

        flow.forEach((point, i) => {
          const x = (i / flow.length) * width;
          const baseY = height - point.value * height * 0.3 - height * 0.15;
          // Add wave motion
          const wave = Math.sin(i * 0.2 + t * 2) * 10;
          const y = baseY + wave;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          // Particle emission along the flow
          if (isPlaying && i % 5 === 0 && Math.random() < 0.1) {
            addParticleBurst(x, y, 3, 200);
          }
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // === DRAW GROWTH - Rising earth with organic texture ===
      if (growth.length > 0) {
        ctx.shadowBlur = 25;
        ctx.shadowColor = 'rgba(120, 200, 120, 0.8)';
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(120, 200, 120, 0.9)';
        ctx.lineWidth = 4;

        growth.forEach((point, i) => {
          const x = (i / growth.length) * width;
          const baseY = height - point.value * height * 0.5 - height * 0.25;
          // Add organic motion
          const organic = noise(x, baseY, t * 0.5) * 15;
          const y = baseY + organic;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          // Ring expansion on peaks
          if (isPlaying && i > 0 && i < growth.length - 1) {
            const prev = growth[i - 1].value;
            const curr = point.value;
            const next = growth[i + 1].value;
            // Local maximum
            if (curr > prev && curr > next && curr > 0.6 && Math.random() < 0.05) {
              addRing(x, y, 120);
            }
          }
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // === HARMONY CIRCLE - Sacred geometry center ===
      if (harmony) {
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = 40 + harmony.overall * 60;

        // Outer glow rings (mandala-inspired)
        for (let ring = 3; ring >= 0; ring--) {
          const r = baseRadius + ring * 20;
          const alpha = (0.1 + harmony.coherence * 0.2) / (ring + 1);

          ctx.beginPath();
          ctx.arc(centerX, centerY, r + Math.sin(t + ring) * 5, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(45, 80%, 60%, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Main harmony circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius);
        gradient.addColorStop(0, `hsla(45, 90%, 70%, ${0.4 + harmony.overall * 0.4})`);
        gradient.addColorStop(1, `hsla(45, 80%, 50%, ${0.1 + harmony.overall * 0.2})`);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Petals (like lotus) - rotate based on time
        const petalCount = 8;
        for (let i = 0; i < petalCount; i++) {
          const angle = (i / petalCount) * Math.PI * 2 + t * 0.3;
          const petalX = centerX + Math.cos(angle) * baseRadius * 0.7;
          const petalY = centerY + Math.sin(angle) * baseRadius * 0.7;

          ctx.beginPath();
          ctx.arc(petalX, petalY, baseRadius * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${45 + i * 15}, 70%, 60%, ${0.3 + harmony.balance * 0.3})`;
          ctx.fill();
        }

        // Harmony text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 220, 150, 0.8)';
        ctx.fillText(`${(harmony.overall * 100).toFixed(1)}%`, centerX, centerY + 6);
        ctx.shadowBlur = 0;

        // Emit particles from center when playing
        if (isPlaying && Math.random() < 0.15) {
          addParticleBurst(centerX, centerY, 5, 45);
        }
      }

      // === UPDATE AND DRAW PARTICLES ===
      particlesRef.current = particlesRef.current.filter(p => {
        // Update
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity
        p.life -= dt / p.maxLife;

        // Draw
        if (p.life > 0) {
          const alpha = p.life * 0.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${alpha})`;
          ctx.fill();

          // Glow
          ctx.shadowBlur = 15;
          ctx.shadowColor = `hsla(${p.hue}, 80%, 60%, ${alpha * 0.6})`;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        return p.life > 0;
      });

      // === UPDATE AND DRAW RINGS ===
      ringsRef.current = ringsRef.current.filter(ring => {
        // Update
        ring.radius += 2;
        ring.alpha = 1 - (ring.radius / ring.maxRadius);

        // Draw
        if (ring.alpha > 0) {
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${ring.hue}, 80%, 60%, ${ring.alpha * 0.6})`;
          ctx.lineWidth = 3;
          ctx.stroke();

          // Glow
          ctx.shadowBlur = 20;
          ctx.shadowColor = `hsla(${ring.hue}, 80%, 60%, ${ring.alpha * 0.4})`;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        return ring.alpha > 0;
      });

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [growth, flow, harmony, isPlaying]);

  // Handle play/pause
  const togglePlay = useCallback(async () => {
    if (!isInitialized) {
      sonifierRef.current = new DataSonifier();
      await sonifierRef.current.init();
      setToneInstance(sonifierRef.current.getTone());
      setIsInitialized(true);
    }

    if (isPlaying) {
      sonifierRef.current?.stop();
      setIsPlaying(false);
    } else {
      sonifierRef.current?.playSeries(growth, flow);
      if (harmony) {
        sonifierRef.current?.setHarmony(harmony.overall);
        sonifierRef.current?.setMomentum(harmony.momentum);
        sonifierRef.current?.setBalance(harmony.balance);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, isInitialized, growth, flow, harmony]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'Escape':
          e.preventDefault();
          sonifierRef.current?.stop();
          setIsPlaying(false);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setTempo(prev => {
            const newTempo = Math.min(120, prev + 5);
            flashTempo();
            return newTempo;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setTempo(prev => {
            const newTempo = Math.max(40, prev - 5);
            flashTempo();
            return newTempo;
          });
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMuteAll();
          break;
        case 'Slash':
          if (e.shiftKey) { // ? key
            e.preventDefault();
            setShowShortcuts(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlay]);

  // Flash tempo display when changed
  const flashTempo = () => {
    setTempoFlash(true);
    setTimeout(() => setTempoFlash(false), 300);
  };

  // Flash scale display when changed
  const flashScale = (scaleName: string) => {
    setScaleFlash(scaleName);
    setTimeout(() => setScaleFlash(''), 1500);
  };

  // Toggle mute all
  const toggleMuteAll = () => {
    const newMuted = !allMuted;
    setAllMuted(newMuted);
    if (sonifierRef.current) {
      sonifierRef.current._config.volume = newMuted ? 0 : 0.6;
    }
  };

  // Regenerate data
  const regenerate = () => {
    const g = generateGrowth(100, 0.05 + Math.random() * 0.1);
    const f = generateFlow(100, 2 + Math.random() * 4, 0.1 + Math.random() * 0.2);
    setGrowth(g);
    setFlow(f);
    const newHarmony = calculateHarmony([g, f]);
    setHarmony(newHarmony);

    if (isPlaying && sonifierRef.current) {
      sonifierRef.current.playSeries(g, f);
      sonifierRef.current.setHarmony(newHarmony.overall);
      sonifierRef.current.setMomentum(newHarmony.momentum);
      sonifierRef.current.setBalance(newHarmony.balance);
    }
  };

  return (
    <>
      <Navigation />
      <main id="main-content" className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8 pt-24 page-enter">
        <h1 className="text-4xl font-light text-white/90 mb-2 tracking-wide">The Pulse</h1>
        <p className="text-water-400/60 text-sm font-mono mb-4 tracking-wider">
          Synthetic rhythms
        </p>
        <p className="text-white/60 mb-4 text-center max-w-md leading-relaxed">
          Growth and flow, visualized and sonified.
          <br />
          A self-contained meditation on data becoming experience.
        </p>

        {/* Tempo Display with flash effect */}
        <div className={`mb-2 text-white/50 text-sm font-mono transition-all duration-300 ${tempoFlash ? 'scale-125 text-white/90' : ''}`}>
          ♪ {tempo} BPM {allMuted ? '(muted)' : ''}
        </div>

        {/* Info Tooltip */}
        <div className="mb-6 text-white/40 text-xs text-center max-w-lg">
          <span className="inline-block px-3 py-1 bg-white/5 rounded-full border border-white/10">
            💡 Press ? for keyboard shortcuts
          </span>
        </div>

        {/* Scale flash overlay */}
        {scaleFlash && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <div className="px-8 py-4 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl animate-fade-in">
              <p className="text-white text-2xl font-mono capitalize">{scaleFlash}</p>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          className="rounded-xl shadow-2xl mb-6 border border-purple-800/30"
          style={{ background: 'linear-gradient(to bottom, #0a0a14, #14141e)' }}
          role="img"
          aria-label="Real-time visualization of data harmony, showing animated particles and waves representing growth and flow patterns"
        />

        {/* Waveform Visualizer - appears below main canvas when audio is playing */}
        {toneInstance && (
          <div className="w-full mb-8" style={{ maxWidth: `${canvasDimensions.width}px` }}>
            <WaveformVisualizer
              Tone={toneInstance}
              isPlaying={isPlaying}
              color="#60a5fa"
              height={60}
            />
          </div>
        )}

      <div className="flex gap-4 mb-8">
        <button
          onClick={togglePlay}
          className="px-8 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white rounded-lg transition-all duration-300 border border-white/20 shadow-lg"
          aria-label={isPlaying ? 'Pause sonification' : 'Play sonification'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Listen'}
        </button>

        <button
          onClick={regenerate}
          className="px-8 py-3 bg-gradient-to-r from-green-500/20 to-teal-500/20 hover:from-green-500/30 hover:to-teal-500/30 text-white rounded-lg transition-all duration-300 border border-white/20 shadow-lg"
          aria-label="Regenerate data with new random patterns"
        >
          ↻ Regenerate
        </button>
      </div>

      {harmony && (
        <div className="grid grid-cols-4 gap-6 text-white/70 text-sm">
          <div className="card-lift text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">coherence</div>
            <div className="text-xl font-light">{(harmony.coherence * 100).toFixed(0)}%</div>
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500"
                style={{ width: `${harmony.coherence * 100}%` }}
              />
            </div>
          </div>

          <div className="card-lift text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">balance</div>
            <div className="text-xl font-light">{(harmony.balance * 100).toFixed(0)}%</div>
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-teal-400 transition-all duration-500"
                style={{ width: `${harmony.balance * 100}%` }}
              />
            </div>
          </div>

          <div className="card-lift text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">momentum</div>
            <div className="text-xl font-light">
              {harmony.momentum > 0 ? '↑' : '↓'} {(Math.abs(harmony.momentum) * 100).toFixed(0)}%
            </div>
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r transition-all duration-500 ${
                  harmony.momentum > 0
                    ? 'from-yellow-400 to-orange-400'
                    : 'from-purple-400 to-pink-400'
                }`}
                style={{ width: `${Math.abs(harmony.momentum) * 100}%` }}
              />
            </div>
          </div>

          <div className="card-lift text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">volatility</div>
            <div className="text-xl font-light">{(harmony.volatility * 100).toFixed(0)}%</div>
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-400 to-orange-400 transition-all duration-500"
                style={{ width: `${harmony.volatility * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Control Panel Toggle Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-black/60 backdrop-blur-xl hover:bg-black/70 text-white rounded-xl transition-all duration-300 border border-white/20 shadow-2xl hover:scale-105 text-sm font-mono"
        aria-label="Toggle controls"
      >
        ⚙️ Controls
      </button>

      {/* Control Panel */}
      {showControls && (
        <div className="fixed bottom-24 right-6 z-40 w-80 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-6 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-mono text-lg">Sound Controls</h3>
            <button
              onClick={() => setShowControls(false)}
              className="text-white/50 hover:text-white text-xl leading-none"
              aria-label="Close controls"
            >
              ×
            </button>
          </div>

          {/* Tempo Slider */}
          <div>
            <label className="block text-white/70 text-sm font-mono mb-2">
              Tempo: {tempo} BPM
            </label>
            <input
              type="range"
              min="40"
              max="120"
              value={tempo}
              onChange={(e) => {
                setTempo(Number(e.target.value));
                flashTempo();
              }}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
          </div>

          {/* Scale Selector */}
          <div>
            <label className="block text-white/70 text-sm font-mono mb-2">
              Scale
            </label>
            <select
              value={scale}
              onChange={(e) => {
                setScale(e.target.value);
                flashScale(e.target.value);
              }}
              className="w-full px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20 font-mono text-sm appearance-none cursor-pointer"
            >
              <option value="lydian">Lydian</option>
              <option value="dorian">Dorian</option>
              <option value="pentatonic">Pentatonic</option>
              <option value="minor">Minor</option>
            </select>
          </div>

          {/* Reverb Slider */}
          <div>
            <label className="block text-white/70 text-sm font-mono mb-2">
              Reverb: {reverb}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={reverb}
              onChange={(e) => setReverb(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
          </div>

          {/* Harmony Blend Slider */}
          <div>
            <label className="block text-white/70 text-sm font-mono mb-2">
              Harmony Blend: {harmonyBlend}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={harmonyBlend}
              onChange={(e) => setHarmonyBlend(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <p className="text-white/40 text-xs mt-1">Controls pad/chord prominence</p>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8 max-w-md animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white text-2xl font-mono mb-6">Keyboard Shortcuts</h2>
            <div className="space-y-3 text-white/80 font-mono text-sm">
              <div className="flex justify-between items-center">
                <span className="text-white/50">Spacebar</span>
                <span>Play / Pause</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">Escape</span>
                <span>Stop & Reset</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">↑ / ↓</span>
                <span>Tempo ±5 BPM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">M</span>
                <span>Mute / Unmute All</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">?</span>
                <span>Show Shortcuts</span>
              </div>
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-6 w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20 font-mono text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        .slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
      </main>
    </>
  );
}
