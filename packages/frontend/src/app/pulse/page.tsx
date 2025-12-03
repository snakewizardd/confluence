'use client';

import { useEffect, useRef, useState } from 'react';
import { generateGrowth, generateFlow, TimeSeriesPoint } from '@confluence/shared/utils/generators';
import { calculateHarmony, HarmonyMetrics } from '@confluence/shared/utils/math';
import { DataSonifier } from '@/lib/sonify';

export default function PulsePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sonifierRef = useRef<DataSonifier | null>(null);

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

  // Draw visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || growth.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Background gradient (earth tones)
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw flow as water (blue wave)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(100, 180, 255, 0.6)';
    ctx.lineWidth = 2;
    flow.forEach((point, i) => {
      const x = (i / flow.length) * width;
      const y = height - point.value * height * 0.4 - height * 0.1;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw growth as earth (green/brown rising)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(120, 200, 120, 0.8)';
    ctx.lineWidth = 3;
    growth.forEach((point, i) => {
      const x = (i / growth.length) * width;
      const y = height - point.value * height * 0.6 - height * 0.2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Harmony indicator (circle in center)
    if (harmony) {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 30 + harmony.overall * 40;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 220, 150, ${0.2 + harmony.overall * 0.4})`;
      ctx.fill();

      // Harmony text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`harmony: ${(harmony.overall * 100).toFixed(1)}%`, centerX, centerY + 5);
    }
  }, [growth, flow, harmony]);

  // Handle play/pause
  const togglePlay = async () => {
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
      }
      setIsPlaying(true);
    }
  };

  // Regenerate data
  const regenerate = () => {
    const g = generateGrowth(100, 0.05 + Math.random() * 0.1);
    const f = generateFlow(100, 2 + Math.random() * 4, 0.1 + Math.random() * 0.2);
    setGrowth(g);
    setFlow(f);
    setHarmony(calculateHarmony([g, f]));

    if (isPlaying && sonifierRef.current) {
      sonifierRef.current.playSeries(g, f);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-light text-white/80 mb-2">The Pulse</h1>
      <p className="text-white/50 mb-8 text-center max-w-md">
        Growth and flow, visualized and sonified.
        A self-contained meditation on data becoming experience.
      </p>

      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="rounded-lg shadow-2xl mb-8"
      />

      <div className="flex gap-4">
        <button
          onClick={togglePlay}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          {isPlaying ? '⏸ Pause' : '▶ Listen'}
        </button>

        <button
          onClick={regenerate}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          ↻ Regenerate
        </button>
      </div>

      {harmony && (
        <div className="mt-8 grid grid-cols-4 gap-4 text-white/60 text-sm">
          <div className="text-center">
            <div className="text-white/40">coherence</div>
            <div>{(harmony.coherence * 100).toFixed(0)}%</div>
          </div>
          <div className="text-center">
            <div className="text-white/40">balance</div>
            <div>{(harmony.balance * 100).toFixed(0)}%</div>
          </div>
          <div className="text-center">
            <div className="text-white/40">momentum</div>
            <div>{harmony.momentum > 0 ? '↑' : '↓'} {(Math.abs(harmony.momentum) * 100).toFixed(0)}%</div>
          </div>
          <div className="text-center">
            <div className="text-white/40">volatility</div>
            <div>{(harmony.volatility * 100).toFixed(0)}%</div>
          </div>
        </div>
      )}
    </main>
  );
}
