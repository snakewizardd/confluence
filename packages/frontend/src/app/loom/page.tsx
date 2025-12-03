'use client';

import { useEffect, useRef, useState } from 'react';
import Navigation from '@/components/Navigation';
import WaveformVisualizer from '@/components/WaveformVisualizer';
import InstrumentWrapper from '@/components/InstrumentWrapper';
import { LoomSonifier, LoomData } from '@/lib/loom-sonify';

type SystemType = 'lorenz' | 'automaton' | 'fibonacci' | 'clifford';

interface SystemInfo {
  id: SystemType;
  name: string;
  description: string;
}

const SYSTEMS: SystemInfo[] = [
  {
    id: 'lorenz',
    name: 'Lorenz',
    description: "The butterfly's wing. Deterministic chaos—predictable yet unknowable.",
  },
  {
    id: 'automaton',
    name: 'Automaton',
    description: 'Simple rules, emergent complexity. The flamenco of logic.',
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci',
    description: "Nature's favorite number. Shells, galaxies, your heartbeat.",
  },
  {
    id: 'clifford',
    name: 'Clifford',
    description: 'Four numbers, infinite beauty. Adjust and discover.',
  },
];

export default function LoomPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sonifierRef = useRef<LoomSonifier | null>(null);
  const animationRef = useRef<number | null>(null);

  const [selectedSystem, setSelectedSystem] = useState<SystemType>('lorenz');
  const [loomData, setLoomData] = useState<LoomData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [tempo, setTempo] = useState(80);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // System-specific parameters
  const [lorenzParams, setLorenzParams] = useState({
    n: 2000,
    sigma: 10,
    rho: 28,
    beta: 2.667,
  });

  const [automatonParams, setAutomatonParams] = useState({
    rule: 110,
    width: 64,
    generations: 64,
  });

  const [fibonacciParams, setFibonacciParams] = useState({
    n: 144,
  });

  const [cliffordParams, setCliffordParams] = useState({
    n: 5000,
    a: -1.4,
    b: 1.6,
    c: 1.0,
    d: 0.7,
  });

  // Visualization animation frame
  const [animFrame, setAnimFrame] = useState(0);

  // Load parameters from URL hash on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash.slice(1);
    if (!hash) return;

    try {
      const params = JSON.parse(decodeURIComponent(hash));
      if (params.system) {
        setSelectedSystem(params.system);
      }
      if (params.params) {
        switch (params.system) {
          case 'lorenz':
            setLorenzParams({ ...lorenzParams, ...params.params });
            break;
          case 'automaton':
            setAutomatonParams({ ...automatonParams, ...params.params });
            break;
          case 'fibonacci':
            setFibonacciParams({ ...fibonacciParams, ...params.params });
            break;
          case 'clifford':
            setCliffordParams({ ...cliffordParams, ...params.params });
            break;
        }
      }
    } catch (err) {
      console.error('Failed to parse URL hash:', err);
    }
  }, []);

  // Draw visualization based on system
  useEffect(() => {
    if (!loomData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    // Clear with dark background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0a0a0a');
    bgGradient.addColorStop(1, '#1a0a1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    switch (loomData.system) {
      case 'lorenz':
        drawLorenz(ctx, loomData.data, width, height, animFrame);
        break;
      case 'automaton':
        drawAutomaton(ctx, loomData.data, width, height, animFrame);
        break;
      case 'fibonacci':
        drawFibonacci(ctx, loomData.data, width, height, animFrame);
        break;
      case 'clifford':
        drawClifford(ctx, loomData.data, width, height, animFrame);
        break;
    }
  }, [loomData, animFrame]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setAnimFrame((f) => f + 1);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Draw Lorenz attractor (3D projection)
  const drawLorenz = (ctx: CanvasRenderingContext2D, data: any, w: number, h: number, frame: number) => {
    const { x, y, z } = data;
    const points = Math.min(x.length, 2000);
    const rotationAngle = (frame * 0.01) % (2 * Math.PI);

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let i = 0; i < points - 1; i++) {
      // 3D rotation (simple Y-axis rotation)
      const x1 = x[i] * Math.cos(rotationAngle) - z[i] * Math.sin(rotationAngle);
      const y1 = y[i];
      const x2 = x[i + 1] * Math.cos(rotationAngle) - z[i + 1] * Math.sin(rotationAngle);
      const y2 = y[i + 1];

      const px1 = x1 * w * 0.8 + w / 2;
      const py1 = y1 * h * 0.8 + h / 2;
      const px2 = x2 * w * 0.8 + w / 2;
      const py2 = y2 * h * 0.8 + h / 2;

      if (i === 0) {
        ctx.moveTo(px1, py1);
      }
      ctx.lineTo(px2, py2);

      // Color gradient based on z
      const hue = 260 + z[i] * 40;
      ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${0.3 + z[i] * 0.4})`;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px2, py2);
    }

    // Draw current point
    const currIdx = Math.floor((frame * 5) % x.length);
    const cx = x[currIdx] * Math.cos(rotationAngle) - z[currIdx] * Math.sin(rotationAngle);
    const cy = y[currIdx];
    const px = cx * w * 0.8 + w / 2;
    const py = cy * h * 0.8 + h / 2;

    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, 2 * Math.PI);
    ctx.fill();
  };

  // Draw cellular automaton grid
  const drawAutomaton = (ctx: CanvasRenderingContext2D, data: any, w: number, h: number, frame: number) => {
    const { grid, generations, width } = data;
    const cellWidth = w / width;
    const cellHeight = h / generations;

    // Highlight current generation
    const currentGen = Math.floor((frame / 10) % generations);

    for (let row = 0; row < generations; row++) {
      for (let col = 0; col < width; col++) {
        if (grid[row][col] === 1) {
          // Active cell
          const alpha = row === currentGen ? 1 : 0.6;
          ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
        } else {
          // Inactive cell
          ctx.fillStyle = 'rgba(10, 10, 10, 0.3)';
        }

        ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth - 1, cellHeight - 1);
      }
    }

    // Draw current generation line
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, currentGen * cellHeight);
    ctx.lineTo(w, currentGen * cellHeight);
    ctx.stroke();
  };

  // Draw Fibonacci spiral
  const drawFibonacci = (ctx: CanvasRenderingContext2D, data: any, w: number, h: number, frame: number) => {
    const { x, y, phi } = data;
    const points = x.length;
    const visiblePoints = Math.min(points, Math.floor((frame * 2) % (points + 50)));

    // Draw spiral path
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let i = 0; i < visiblePoints - 1; i++) {
      const px1 = x[i] * w * 0.9 + w * 0.05;
      const py1 = y[i] * h * 0.9 + h * 0.05;
      const px2 = x[i + 1] * w * 0.9 + w * 0.05;
      const py2 = y[i + 1] * h * 0.9 + h * 0.05;

      if (i === 0) {
        ctx.moveTo(px1, py1);
      }
      ctx.lineTo(px2, py2);
    }
    ctx.stroke();

    // Draw points
    for (let i = 0; i < visiblePoints; i++) {
      const px = x[i] * w * 0.9 + w * 0.05;
      const py = y[i] * h * 0.9 + h * 0.05;

      // Size based on Fibonacci index
      const size = Math.sqrt(i + 1) * 0.5;

      // Color based on position
      const hue = 260 + (i / points) * 60;

      ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw phi label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '16px monospace';
    ctx.fillText(`φ = ${phi.toFixed(6)}`, 10, 30);
  };

  // Draw Clifford attractor
  const drawClifford = (ctx: CanvasRenderingContext2D, data: any, w: number, h: number, frame: number) => {
    const { x, y } = data;
    const points = x.length;
    const visiblePoints = Math.min(points, Math.floor((frame * 10) % (points + 100)));

    // Draw attractor points
    for (let i = 0; i < visiblePoints; i++) {
      const px = x[i] * w * 0.9 + w * 0.05;
      const py = y[i] * h * 0.9 + h * 0.05;

      // Color gradient
      const hue = 260 + (i / points) * 60;
      const alpha = 0.1 + (i / visiblePoints) * 0.3;

      ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
      ctx.fillRect(px, py, 2, 2);
    }

    // Draw connecting lines for recent points
    if (visiblePoints > 100) {
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();

      const startIdx = Math.max(0, visiblePoints - 100);
      for (let i = startIdx; i < visiblePoints - 1; i++) {
        const px1 = x[i] * w * 0.9 + w * 0.05;
        const py1 = y[i] * h * 0.9 + h * 0.05;
        const px2 = x[i + 1] * w * 0.9 + w * 0.05;
        const py2 = y[i + 1] * h * 0.9 + h * 0.05;

        if (i === startIdx) {
          ctx.moveTo(px1, py1);
        }
        ctx.lineTo(px2, py2);
      }
      ctx.stroke();
    }
  };

  // Generate mathematical system
  const generate = async () => {
    setLoading(true);
    setError(null);

    try {
      let params = {};
      switch (selectedSystem) {
        case 'lorenz':
          params = lorenzParams;
          break;
        case 'automaton':
          params = automatonParams;
          break;
        case 'fibonacci':
          params = fibonacciParams;
          break;
        case 'clifford':
          params = cliffordParams;
          break;
      }

      const response = await fetch('http://localhost:8000/api/loom/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: selectedSystem,
          params: params,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setLoomData(data);
      setAnimFrame(0); // Reset animation
    } catch (err) {
      console.error('Loom generation failed:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  // Load demo (Lorenz)
  const loadDemo = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/loom/demo');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setLoomData(data);
      setSelectedSystem('lorenz');
      setAnimFrame(0);
    } catch (err) {
      console.error('Demo load failed:', err);
      setError('Failed to load demo. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // Play sonification
  const playSonification = async () => {
    if (!loomData) return;

    if (!isInitialized) {
      sonifierRef.current = new LoomSonifier();
      const success = await sonifierRef.current.init();
      if (!success) {
        setError('Failed to initialize audio');
        return;
      }
      setIsInitialized(true);
    }

    if (isPlaying) {
      sonifierRef.current?.stop();
      setIsPlaying(false);
    } else {
      await sonifierRef.current?.play(loomData, tempo);
      setIsPlaying(true);
    }
  };

  // Export data as JSON
  const exportData = () => {
    if (!loomData) return;

    const data = JSON.stringify(loomData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loom-${loomData.system}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export parameters
  const exportParams = () => {
    let params = {};
    switch (selectedSystem) {
      case 'lorenz':
        params = lorenzParams;
        break;
      case 'automaton':
        params = automatonParams;
        break;
      case 'fibonacci':
        params = fibonacciParams;
        break;
      case 'clifford':
        params = cliffordParams;
        break;
    }

    const config = {
      system: selectedSystem,
      params: params,
      tempo: tempo,
      timestamp: new Date().toISOString(),
    };

    const data = JSON.stringify(config, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loom-params-${selectedSystem}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate share link
  const generateShareLink = () => {
    let params = {};
    switch (selectedSystem) {
      case 'lorenz':
        params = lorenzParams;
        break;
      case 'automaton':
        params = automatonParams;
        break;
      case 'fibonacci':
        params = fibonacciParams;
        break;
      case 'clifford':
        params = cliffordParams;
        break;
    }

    const config = {
      system: selectedSystem,
      params: params,
    };

    const hash = encodeURIComponent(JSON.stringify(config));
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;

    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      alert('Share link copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy:', err);
      alert('Failed to copy link');
    });
  };

  // Randomize parameters
  const randomize = () => {
    switch (selectedSystem) {
      case 'lorenz':
        setLorenzParams({
          n: 2000,
          sigma: 5 + Math.random() * 15,
          rho: 10 + Math.random() * 40,
          beta: 1 + Math.random() * 4,
        });
        break;
      case 'automaton':
        setAutomatonParams({
          rule: Math.floor(Math.random() * 256),
          width: 64,
          generations: 64,
        });
        break;
      case 'fibonacci':
        setFibonacciParams({
          n: 50 + Math.floor(Math.random() * 300),
        });
        break;
      case 'clifford':
        setCliffordParams({
          n: 5000,
          a: -3 + Math.random() * 6,
          b: -3 + Math.random() * 6,
          c: -3 + Math.random() * 6,
          d: -3 + Math.random() * 6,
        });
        break;
    }
  };

  // Render parameter controls
  const renderParams = () => {
    switch (selectedSystem) {
      case 'lorenz':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-white/70 text-xs font-mono mb-1">Sigma (σ)</label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.1"
                value={lorenzParams.sigma}
                onChange={(e) =>
                  setLorenzParams({ ...lorenzParams, sigma: parseFloat(e.target.value) })
                }
                className="w-full"
              />
              <span className="text-white/50 text-xs">{lorenzParams.sigma.toFixed(1)}</span>
            </div>
            <div>
              <label className="block text-white/70 text-xs font-mono mb-1">Rho (ρ)</label>
              <input
                type="range"
                min="1"
                max="50"
                step="0.5"
                value={lorenzParams.rho}
                onChange={(e) =>
                  setLorenzParams({ ...lorenzParams, rho: parseFloat(e.target.value) })
                }
                className="w-full"
              />
              <span className="text-white/50 text-xs">{lorenzParams.rho.toFixed(1)}</span>
            </div>
            <div>
              <label className="block text-white/70 text-xs font-mono mb-1">Beta (β)</label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={lorenzParams.beta}
                onChange={(e) =>
                  setLorenzParams({ ...lorenzParams, beta: parseFloat(e.target.value) })
                }
                className="w-full"
              />
              <span className="text-white/50 text-xs">{lorenzParams.beta.toFixed(2)}</span>
            </div>
          </div>
        );

      case 'automaton':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-white/70 text-xs font-mono mb-1">Rule (0-255)</label>
              <input
                type="range"
                min="0"
                max="255"
                step="1"
                value={automatonParams.rule}
                onChange={(e) =>
                  setAutomatonParams({ ...automatonParams, rule: parseInt(e.target.value) })
                }
                className="w-full"
              />
              <span className="text-white/50 text-xs">Rule {automatonParams.rule}</span>
            </div>
          </div>
        );

      case 'fibonacci':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-white/70 text-xs font-mono mb-1">
                Points (10-500)
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={fibonacciParams.n}
                onChange={(e) =>
                  setFibonacciParams({ ...fibonacciParams, n: parseInt(e.target.value) })
                }
                className="w-full"
              />
              <span className="text-white/50 text-xs">{fibonacciParams.n} points</span>
            </div>
          </div>
        );

      case 'clifford':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-white/70 text-xs font-mono mb-1">a</label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={cliffordParams.a}
                onChange={(e) =>
                  setCliffordParams({ ...cliffordParams, a: parseFloat(e.target.value) })
                }
                className="w-full"
              />
              <span className="text-white/50 text-xs">{cliffordParams.a.toFixed(2)}</span>
            </div>
            <div>
              <label className="block text-white/70 text-xs font-mono mb-1">b</label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={cliffordParams.b}
                onChange={(e) =>
                  setCliffordParams({ ...cliffordParams, b: parseFloat(e.target.value) })
                }
                className="w-full"
              />
              <span className="text-white/50 text-xs">{cliffordParams.b.toFixed(2)}</span>
            </div>
            <div>
              <label className="block text-white/70 text-xs font-mono mb-1">c</label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={cliffordParams.c}
                onChange={(e) =>
                  setCliffordParams({ ...cliffordParams, c: parseFloat(e.target.value) })
                }
                className="w-full"
              />
              <span className="text-white/50 text-xs">{cliffordParams.c.toFixed(2)}</span>
            </div>
            <div>
              <label className="block text-white/70 text-xs font-mono mb-1">d</label>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={cliffordParams.d}
                onChange={(e) =>
                  setCliffordParams({ ...cliffordParams, d: parseFloat(e.target.value) })
                }
                className="w-full"
              />
              <span className="text-white/50 text-xs">{cliffordParams.d.toFixed(2)}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <InstrumentWrapper
      instrumentName="LOOM"
      instrumentSubtitle="Mathematical dreams woven into sound"
      instrumentId="loom"
    >
      <Navigation />
      <main
        id="main-content"
        className="min-h-screen bg-gradient-to-b from-purple-950 to-black flex flex-col items-center p-8 pt-24 page-enter"
      >
        <h1 className="text-5xl font-light text-white/90 mb-2 tracking-wide">The Loom</h1>
        <p className="text-purple-400/60 text-sm font-mono mb-6 tracking-wider">
          Mathematical dreams
        </p>

        <p className="text-purple-300/70 mb-8 text-center max-w-2xl leading-relaxed">
          Mathematics made audible. Four systems, each a window into the infinite.
          <br />
          Chaos, emergence, harmony, and strange beauty—rendered as sound.
        </p>

        {/* System Selector */}
        <div className="flex gap-2 mb-8">
          {SYSTEMS.map((sys) => (
            <button
              key={sys.id}
              onClick={() => setSelectedSystem(sys.id)}
              className={`px-6 py-3 rounded-lg transition-all duration-300 border ${
                selectedSystem === sys.id
                  ? 'bg-purple-600/30 border-purple-400/50 text-white'
                  : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
              }`}
            >
              {sys.name}
            </button>
          ))}
        </div>

        {/* System Description */}
        <div className="text-center mb-8 max-w-2xl">
          <p className="text-purple-300/80 italic">
            {SYSTEMS.find((s) => s.id === selectedSystem)?.description}
          </p>
        </div>

        {/* Main Layout */}
        <div className="w-full max-w-6xl grid grid-cols-3 gap-6 mb-8">
          {/* Visualization (2 columns) */}
          <div className="col-span-2">
            <h2 className="text-xl font-light text-white/80 mb-3">Visualization</h2>
            <canvas
              ref={canvasRef}
              width={1000}
              height={600}
              className="rounded-xl shadow-2xl border border-purple-800/30 w-full bg-black"
              aria-label="Mathematical system visualization"
              role="img"
            />
          </div>

          {/* Parameters (1 column) */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-light text-white/80 mb-3">Parameters</h2>
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                {renderParams()}
              </div>
            </div>

            <button
              onClick={randomize}
              className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white/70 text-sm transition-colors"
            >
              🎲 Randomize
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-6xl mb-8 flex gap-4 items-center">
          <button
            onClick={generate}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 text-white rounded-lg transition-all duration-300 border border-white/20 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Weaving...' : '▶ Weave'}
          </button>

          <button
            onClick={loadDemo}
            disabled={loading}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 border border-white/20 disabled:opacity-50"
          >
            📊 Demo
          </button>

          <div className="flex items-center gap-2">
            <label className="text-white/70 text-sm font-mono">Tempo:</label>
            <input
              type="number"
              value={tempo}
              onChange={(e) => setTempo(parseInt(e.target.value))}
              min="40"
              max="200"
              className="w-20 bg-white/5 border border-white/20 rounded px-2 py-1 text-white text-sm"
            />
            <span className="text-white/50 text-xs">BPM</span>
          </div>

          {/* Export/Share Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 border border-white/20"
            >
              📤 Export
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-white/20 rounded-lg shadow-xl z-10">
                <button
                  onClick={() => {
                    exportData();
                    setShowExportMenu(false);
                  }}
                  disabled={!loomData}
                  className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 rounded-t-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📊 Export Data (JSON)
                </button>
                <button
                  onClick={() => {
                    exportParams();
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10"
                >
                  ⚙️ Export Parameters
                </button>
                <button
                  onClick={() => {
                    generateShareLink();
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 rounded-b-lg"
                >
                  🔗 Copy Share Link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-6xl mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Play/Stop */}
        {loomData && (
          <>
            <button
              onClick={playSonification}
              disabled={loading}
              className="mb-8 px-8 py-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 text-white rounded-lg transition-all duration-300 border border-white/20 shadow-lg text-lg"
            >
              {isPlaying ? '■ Stop' : '▶ Play Sonification'}
            </button>

            {/* Waveform Visualizer */}
            {isPlaying && (
              <div className="w-full max-w-6xl mb-8">
                <WaveformVisualizer
                  audioContext={sonifierRef.current?.getTone()?.context.rawContext}
                />
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="max-w-3xl text-center text-white/50 text-sm space-y-2 border-t border-white/10 pt-6">
          <p className="italic">
            &ldquo;Mathematics doesn&apos;t just describe the universe—it sings.&rdquo;
          </p>
          <p className="text-xs text-white/30 mt-4">
            Lorenz · Cellular Automaton · Fibonacci Spiral · Clifford Attractor
          </p>
        </div>
      </main>
    </InstrumentWrapper>
  );
}
