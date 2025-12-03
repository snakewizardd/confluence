'use client';

import { useEffect, useRef, useState } from 'react';
import { IrisSonifier, IrisWave } from '@/lib/iris-sonify';
import Navigation from '@/components/Navigation';

interface IrisData {
  waves: IrisWave[];
  species_stats: Array<{
    species: string;
    count: number;
    mean_sepal_length: number;
    mean_sepal_width: number;
    mean_petal_length: number;
    mean_petal_width: number;
  }>;
  metadata: {
    dataset: string;
    source: string;
    observations: number;
    features: number;
    species: number;
    year: number;
  };
}

const SPECIES_COLORS: Record<string, string> = {
  setosa: '#4ade80',      // green
  versicolor: '#60a5fa',  // blue
  virginica: '#f472b6',   // pink
};

export default function IrisPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sonifierRef = useRef<IrisSonifier | null>(null);

  const [data, setData] = useState<IrisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [tempo, setTempo] = useState(120);
  const [reverb, setReverb] = useState(40);
  const [loop, setLoop] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [allMuted, setAllMuted] = useState(false);
  const [tempoFlash, setTempoFlash] = useState(false);
  const [mutedVoices, setMutedVoices] = useState({
    sepalLength: false,
    sepalWidth: false,
    petalLength: false,
    petalWidth: false,
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTempo = localStorage.getItem('iris_tempo');
      const savedReverb = localStorage.getItem('iris_reverb');
      const savedLoop = localStorage.getItem('iris_loop');
      const savedShowControls = localStorage.getItem('iris_showControls');
      const savedMutedVoices = localStorage.getItem('iris_mutedVoices');

      if (savedTempo) setTempo(Number(savedTempo));
      if (savedReverb) setReverb(Number(savedReverb));
      if (savedLoop) setLoop(savedLoop === 'true');
      if (savedShowControls) setShowControls(savedShowControls === 'true');
      if (savedMutedVoices) setMutedVoices(JSON.parse(savedMutedVoices));
    }
  }, []);

  // Fetch iris data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/iris/data');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const irisData = await response.json();
        setData(irisData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch iris data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch iris data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply control changes to sonifier in real-time
  useEffect(() => {
    if (sonifierRef.current) {
      sonifierRef.current.setTempo(tempo);
      sonifierRef.current.setReverb(reverb / 100);
      sonifierRef.current.setLoop(loop);

      // Apply muted voices
      Object.entries(mutedVoices).forEach(([voice, muted]) => {
        sonifierRef.current?.muteVoice(voice, muted);
      });
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('iris_tempo', tempo.toString());
      localStorage.setItem('iris_reverb', reverb.toString());
      localStorage.setItem('iris_loop', loop.toString());
      localStorage.setItem('iris_mutedVoices', JSON.stringify(mutedVoices));
    }
  }, [tempo, reverb, loop, mutedVoices]);

  // Save control panel state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('iris_showControls', showControls.toString());
    }
  }, [showControls]);

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
  }, []);

  // Flash tempo display when changed
  const flashTempo = () => {
    setTempoFlash(true);
    setTimeout(() => setTempoFlash(false), 300);
  };

  // Toggle mute all
  const toggleMuteAll = () => {
    const newMuted = !allMuted;
    setAllMuted(newMuted);
    // Mute/unmute all voices
    const newMutedVoices = {
      sepalLength: newMuted,
      sepalWidth: newMuted,
      petalLength: newMuted,
      petalWidth: newMuted,
    };
    setMutedVoices(newMutedVoices);
  };

  // Draw visualization
  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    // Clear with dark gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#0a0014');
    bgGradient.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Filter waves by selected species
    const wavesToDraw = selectedSpecies
      ? data.waves.filter(w => w.species === selectedSpecies)
      : data.waves;

    // Draw sinusoidal waves for each observation
    wavesToDraw.forEach((wave, idx) => {
      const x = (wave.index / (data.metadata.observations - 1)) * width;

      // Draw composite wave
      const centerY = height / 2;
      const amplitude = height * 0.35;
      const y = centerY + wave.composite_wave * amplitude;

      const color = SPECIES_COLORS[wave.species] || '#888888';

      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Connect with line (for smooth wave)
      if (idx > 0) {
        const prevWave = wavesToDraw[idx - 1];
        const prevX = (prevWave.index / (data.metadata.observations - 1)) * width;
        const prevY = centerY + prevWave.composite_wave * amplitude;

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = `${color}80`; // Add transparency
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Add subtle glow
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw centerline
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '12px monospace';
    ctx.fillText('Observation →', 10, height - 10);
    ctx.fillText('Wave Amplitude', 10, 20);

  }, [data, selectedSpecies]);

  // Handle play/pause
  const togglePlay = async () => {
    if (!data) return;

    if (!isInitialized) {
      sonifierRef.current = new IrisSonifier();
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
      const wavesToPlay = selectedSpecies
        ? data.waves.filter(w => w.species === selectedSpecies)
        : data.waves;

      sonifierRef.current?.playWaves(wavesToPlay, tempo, loop);
      setIsPlaying(true);
    }
  };

  // Filter by species
  const filterSpecies = (species: string | null) => {
    setSelectedSpecies(species);
    if (isPlaying) {
      sonifierRef.current?.stop();
      setIsPlaying(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-gradient-to-b from-purple-950 to-black flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-white/70 text-lg">Loading Iris data from R...</p>
          </div>
        </main>
      </>
    );
  }

  // Generate demo/synthetic iris data for fallback
  const generateDemoData = (): IrisData => {
    const waves: IrisWave[] = [];
    const species = ['setosa', 'versicolor', 'virginica'];

    // Generate 150 synthetic iris observations (50 per species)
    for (let i = 0; i < 150; i++) {
      const speciesIdx = Math.floor(i / 50);
      const speciesName = species[speciesIdx];
      const t = i / 149;

      // Synthetic normalized values with species-specific patterns
      const sepal_length = 0.4 + (speciesIdx * 0.15) + Math.random() * 0.2;
      const sepal_width = 0.5 - (speciesIdx * 0.1) + Math.random() * 0.2;
      const petal_length = 0.3 + (speciesIdx * 0.2) + Math.random() * 0.2;
      const petal_width = 0.2 + (speciesIdx * 0.25) + Math.random() * 0.2;

      // Generate waves (matching R script logic)
      const wave1 = sepal_length * Math.sin(2 * Math.PI * 1 * t + Math.PI/4);
      const wave2 = sepal_width * Math.sin(2 * Math.PI * 2 * t + Math.PI/2);
      const wave3 = petal_length * Math.sin(2 * Math.PI * 3 * t + 3*Math.PI/4);
      const wave4 = petal_width * Math.sin(2 * Math.PI * 4 * t + Math.PI);
      const composite_wave = (wave1 + wave2 + wave3 + wave4) / 4;

      waves.push({
        index: i,
        t,
        sepal_length,
        sepal_width,
        petal_length,
        petal_width,
        species: speciesName,
        composite_wave,
        wave1,
        wave2,
        wave3,
        wave4,
      });
    }

    return {
      waves,
      species_stats: [
        { species: 'setosa', count: 50, mean_sepal_length: 5.0, mean_sepal_width: 3.4, mean_petal_length: 1.5, mean_petal_width: 0.2 },
        { species: 'versicolor', count: 50, mean_sepal_length: 5.9, mean_sepal_width: 2.8, mean_petal_length: 4.3, mean_petal_width: 1.3 },
        { species: 'virginica', count: 50, mean_sepal_length: 6.5, mean_sepal_width: 3.0, mean_petal_length: 5.6, mean_petal_width: 2.0 },
      ],
      metadata: {
        dataset: 'iris (demo)',
        source: 'Synthetic demo data - backend unavailable',
        observations: 150,
        features: 4,
        species: 3,
        year: 1936,
      },
    };
  };

  const useDemoData = () => {
    setData(generateDemoData());
    setError(null);
  };

  if (error) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-gradient-to-b from-purple-950 to-black flex items-center justify-center pt-24">
          <div className="text-center text-red-400 max-w-lg p-8">
            <h2 className="text-2xl mb-4">Error Loading Data</h2>
            <p className="mb-4">{error}</p>
            <p className="text-sm text-white/50 mb-6">
              Make sure the backend is running and R is installed
            </p>
            <button
              onClick={useDemoData}
              className="px-8 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 text-white rounded-lg transition-all duration-300 border border-white/20 shadow-lg"
            >
              Use Demo Data
            </button>
            <p className="text-xs text-white/40 mt-4">
              Demo data is generated client-side for demonstration purposes
            </p>
          </div>
        </main>
      </>
    );
  }

  if (!data) return null;

  // Determine data source
  const isLiveData = data.metadata.source.includes('Fisher');
  const dataSourceIndicator = isLiveData ? '🟢 Live from R' : '🟡 Demo Mode';
  const dataSourceColor = isLiveData ? 'text-green-400/70' : 'text-yellow-400/70';

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-purple-950 to-black flex flex-col items-center justify-center p-8 pt-24">
        <h1 className="text-5xl font-light text-white/90 mb-2 tracking-wide">
          Iris Sonification
        </h1>

        {/* Data Source Indicator */}
        <div className={`text-xs ${dataSourceColor} mb-4 font-mono`}>
          {dataSourceIndicator}
        </div>

        <p className="text-purple-300/70 mb-4 text-center max-w-2xl leading-relaxed">
          Fisher's 1936 dataset transformed into sinusoidal waves and sound.
          <br />
          Where statistics meets soul. Where data becomes music.
        </p>

        {/* Tempo Display with flash effect */}
        <div className={`mb-4 text-purple-300/70 text-sm font-mono transition-all duration-300 ${tempoFlash ? 'scale-125 text-purple-300/90' : ''}`}>
          ♪ {tempo} BPM {loop ? '(loop)' : ''} {allMuted ? '(muted)' : ''}
        </div>

        {/* Info Tooltip */}
        <div className="mb-8 text-purple-300/40 text-xs text-center max-w-lg">
          <span className="inline-block px-3 py-1 bg-white/5 rounded-full border border-white/10">
            💡 Press ? for keyboard shortcuts
          </span>
        </div>

      {/* Canvas Visualization */}
      <canvas
        ref={canvasRef}
        width={1200}
        height={400}
        className="rounded-xl shadow-2xl mb-8 border border-purple-500/20"
      />

      {/* Species Filter Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => filterSpecies(null)}
          className={`px-6 py-2 rounded-lg transition-all duration-300 border ${
            selectedSpecies === null
              ? 'bg-white/20 border-white/40 text-white'
              : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
          }`}
        >
          All Species
        </button>
        <button
          onClick={() => filterSpecies('setosa')}
          className={`px-6 py-2 rounded-lg transition-all duration-300 border ${
            selectedSpecies === 'setosa'
              ? 'bg-green-500/30 border-green-400/60 text-white'
              : 'bg-green-500/10 border-green-500/30 text-green-300/70 hover:bg-green-500/20'
          }`}
        >
          Setosa
        </button>
        <button
          onClick={() => filterSpecies('versicolor')}
          className={`px-6 py-2 rounded-lg transition-all duration-300 border ${
            selectedSpecies === 'versicolor'
              ? 'bg-blue-500/30 border-blue-400/60 text-white'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-300/70 hover:bg-blue-500/20'
          }`}
        >
          Versicolor
        </button>
        <button
          onClick={() => filterSpecies('virginica')}
          className={`px-6 py-2 rounded-lg transition-all duration-300 border ${
            selectedSpecies === 'virginica'
              ? 'bg-pink-500/30 border-pink-400/60 text-white'
              : 'bg-pink-500/10 border-pink-500/30 text-pink-300/70 hover:bg-pink-500/20'
          }`}
        >
          Virginica
        </button>
      </div>

      {/* Play/Stop Button */}
      <button
        onClick={togglePlay}
        className="px-12 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 text-white rounded-lg transition-all duration-300 border border-white/20 shadow-lg mb-8"
      >
        {isPlaying ? '⏸ Pause' : '▶ Play Sonification'}
      </button>

      {/* Stats Section */}
      <div className="grid grid-cols-4 gap-6 text-white/70 text-sm mb-8 max-w-4xl w-full">
        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Observations</div>
          <div className="text-2xl font-light">{data.metadata.observations}</div>
        </div>
        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Species</div>
          <div className="text-2xl font-light">{data.metadata.species}</div>
        </div>
        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Features</div>
          <div className="text-2xl font-light">{data.metadata.features}</div>
        </div>
        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Year</div>
          <div className="text-2xl font-light">{data.metadata.year}</div>
        </div>
      </div>

      {/* Educational Footer */}
      <div className="max-w-3xl text-center text-white/50 text-sm space-y-2 border-t border-white/10 pt-6">
        <p className="italic">
          "The use of multiple measurements in taxonomic problems"
        </p>
        <p>
          R.A. Fisher's 1936 iris dataset — 150 observations of iris flowers
          across three species (setosa, versicolor, virginica) measuring sepal
          and petal dimensions. A foundational dataset in statistics and machine learning.
        </p>
        <p className="text-xs text-white/30 mt-4">
          Each species plays in a different musical scale: setosa (major), versicolor (minor), virginica (lydian)
        </p>
      </div>

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

          {/* Loop Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-white/70 text-sm font-mono">Loop</label>
            <button
              onClick={() => setLoop(!loop)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                loop ? 'bg-purple-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                  loop ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Voice Toggles */}
          <div>
            <label className="block text-white/70 text-sm font-mono mb-3">Voice Toggles</label>
            <div className="space-y-2">
              {Object.entries({
                sepalLength: 'Sepal Length (melody)',
                sepalWidth: 'Sepal Width (harmony)',
                petalLength: 'Petal Length (bass)',
                petalWidth: 'Petal Width (shimmer)',
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-white/60 text-xs">{label}</span>
                  <input
                    type="checkbox"
                    checked={!mutedVoices[key as keyof typeof mutedVoices]}
                    onChange={(e) => {
                      setMutedVoices({
                        ...mutedVoices,
                        [key]: !e.target.checked,
                      });
                    }}
                    className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>
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
          background: linear-gradient(to right, #a855f7, #ec4899);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }

        .slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(to right, #a855f7, #ec4899);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
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
