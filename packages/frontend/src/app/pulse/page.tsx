'use client';

// The pulse of information, visualized and heard.

import { useEffect, useRef, useState, useCallback } from 'react';
import { generateGrowth, generateFlow, TimeSeriesPoint } from '@confluence/shared/utils/generators';
import { calculateHarmony, HarmonyMetrics } from '@confluence/shared/utils/math';
import { DataSonifier } from '@/lib/sonify';

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

  // Generate data on mount
  useEffect(() => {
    const g = generateGrowth(100, 0.08);
    const f = generateFlow(100, 4, 0.15);
    setGrowth(g);
    setFlow(f);
    setHarmony(calculateHarmony([g, f]));
  }, []);

  // Keyboard handler for spacebar to toggle play/pause
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlay]);

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
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-light text-white/90 mb-3 tracking-wide">The Pulse</h1>
      <p className="text-white/60 mb-10 text-center max-w-md leading-relaxed">
        Growth and flow, visualized and sonified.
        <br />
        A self-contained meditation on data becoming experience.
      </p>

      <canvas
        ref={canvasRef}
        width={900}
        height={500}
        className="rounded-xl shadow-2xl mb-10 border border-white/10"
        style={{ background: 'linear-gradient(to bottom, #0a0a14, #14141e)' }}
        role="img"
        aria-label="Real-time visualization of data harmony, showing animated particles and waves representing growth and flow patterns"
      />

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
          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">coherence</div>
            <div className="text-xl font-light">{(harmony.coherence * 100).toFixed(0)}%</div>
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500"
                style={{ width: `${harmony.coherence * 100}%` }}
              />
            </div>
          </div>

          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">balance</div>
            <div className="text-xl font-light">{(harmony.balance * 100).toFixed(0)}%</div>
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-teal-400 transition-all duration-500"
                style={{ width: `${harmony.balance * 100}%` }}
              />
            </div>
          </div>

          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
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

          <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
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
    </main>
  );
}
