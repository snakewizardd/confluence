'use client';

import { useEffect, useRef, useState } from 'react';
import { IrisSonifier, IrisWave } from '@/lib/iris-sonify';

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

      sonifierRef.current?.playWaves(wavesToPlay, 140);
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
      <main className="min-h-screen bg-gradient-to-b from-purple-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">Loading Iris data from R...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-950 to-black flex items-center justify-center">
        <div className="text-center text-red-400 max-w-lg p-8">
          <h2 className="text-2xl mb-4">Error Loading Data</h2>
          <p className="mb-4">{error}</p>
          <p className="text-sm text-white/50">
            Make sure the backend is running and R is installed
          </p>
        </div>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-950 to-black flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-light text-white/90 mb-2 tracking-wide">
        Iris Sonification
      </h1>
      <p className="text-purple-300/70 mb-8 text-center max-w-2xl leading-relaxed">
        Fisher's 1936 dataset transformed into sinusoidal waves and sound.
        <br />
        Where statistics meets soul. Where data becomes music.
      </p>

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
        className="px-12 py-4 bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/40 hover:to-pink-600/40 text-white text-lg rounded-lg transition-all duration-300 border border-white/20 shadow-lg mb-8"
      >
        {isPlaying ? '⏹ Stop' : '▶ Play Sonification'}
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
    </main>
  );
}
