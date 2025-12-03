'use client';

import { useEffect, useRef, useState } from 'react';
import Navigation from '@/components/Navigation';
import { SpectralSonifier, SpectralData } from '@/lib/spectral-sonify';

export default function SpectrumPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sonifierRef = useRef<SpectralSonifier | null>(null);

  const [spectralData, setSpectralData] = useState<SpectralData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [inputData, setInputData] = useState('');
  const [sampleRate, setSampleRate] = useState(1.0);
  const [duration, setDuration] = useState(8);
  const [showEducation, setShowEducation] = useState(false);

  // Draw power spectrum visualization
  useEffect(() => {
    if (!spectralData || !canvasRef.current) return;

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

    const spectrum = spectralData.full_spectrum;
    const freqs = spectrum.frequencies;
    const power = spectrum.power;

    // Find max power for normalization (excluding DC)
    const maxPower = Math.max(...power.slice(1));

    // Draw spectrum
    const barWidth = width / freqs.length;

    freqs.forEach((freq, i) => {
      if (i === 0) return; // Skip DC component

      const normalizedPower = power[i] / maxPower;
      const barHeight = normalizedPower * height * 0.8;

      const x = (i / freqs.length) * width;
      const y = height - barHeight;

      // Color gradient based on frequency (low = red, high = blue)
      const hue = (i / freqs.length) * 240;
      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;

      ctx.fillRect(x, y, barWidth, barHeight);

      // Add glow to peaks
      if (normalizedPower > 0.3) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsl(${hue}, 90%, 70%)`;
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.shadowBlur = 0;
      }
    });

    // Draw dominant frequencies as vertical lines
    spectralData.components.forEach((comp, i) => {
      if (i >= 8) return; // Only show top 8

      // Find x position for this frequency
      const freqIndex = freqs.findIndex((f) => Math.abs(f - comp.frequency) < 0.001);
      if (freqIndex < 0) return;

      const x = (freqIndex / freqs.length) * width;

      // Draw vertical line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x, 0);
      ctx.stroke();

      // Label
      ctx.fillStyle = 'white';
      ctx.font = '10px monospace';
      ctx.fillText(`${comp.frequency.toFixed(3)} Hz`, x + 4, 15);
    });

    // Draw axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '12px monospace';
    ctx.fillText('Frequency →', 10, height - 10);
    ctx.fillText('Power', 10, 20);

    // Spectral stats overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '11px monospace';
    const stats = [
      `Centroid: ${spectralData.metadata.spectral_centroid.toFixed(3)} Hz`,
      `Entropy: ${spectralData.metadata.spectral_entropy.toFixed(3)}`,
      `Rolloff: ${spectralData.metadata.spectral_rolloff.toFixed(3)} Hz`,
    ];
    stats.forEach((stat, i) => {
      ctx.fillText(stat, width - 200, 20 + i * 15);
    });
  }, [spectralData]);

  // Analyze spectrum
  const analyzeSpectrum = async () => {
    if (!inputData.trim() && spectralData === null) {
      setError('Please enter data or use demo mode');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parse input data
      const values = inputData
        .split(/[\s,]+/)
        .map((v) => parseFloat(v.trim()))
        .filter((v) => !isNaN(v));

      if (values.length < 4) {
        throw new Error('Need at least 4 data points for FFT');
      }

      // Call API
      const response = await fetch('http://localhost:8000/api/spectrum/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          series: values,
          sample_rate: sampleRate,
          n_peaks: 8,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.spectral) {
        setSpectralData(data.spectral);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Spectrum analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Load demo data
  const loadDemo = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/spectrum/demo');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.spectral) {
        setSpectralData(data.spectral);
        setInputData(''); // Clear input when using demo
      }
    } catch (err) {
      console.error('Demo load failed:', err);
      setError('Failed to load demo. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // Play sonification
  const playSonification = async () => {
    if (!spectralData) return;

    if (!isInitialized) {
      sonifierRef.current = new SpectralSonifier();
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
      await sonifierRef.current?.play(spectralData, duration);
      setIsPlaying(true);

      // Auto-stop after duration
      setTimeout(() => {
        setIsPlaying(false);
      }, duration * 1000);
    }
  };

  // Generate sample data patterns
  const generatePattern = (pattern: string) => {
    let data: number[] = [];
    const n = 100;

    switch (pattern) {
      case 'sine':
        // Single sine wave
        data = Array.from({ length: n }, (_, i) => Math.sin((2 * Math.PI * i) / 20));
        setSampleRate(1.0);
        break;
      case 'multi':
        // Multiple frequencies
        data = Array.from(
          { length: n },
          (_, i) => Math.sin((2 * Math.PI * i) / 10) + 0.5 * Math.sin((2 * Math.PI * i) / 30)
        );
        setSampleRate(1.0);
        break;
      case 'noisy':
        // Sine + noise
        data = Array.from(
          { length: n },
          (_, i) => Math.sin((2 * Math.PI * i) / 15) + (Math.random() - 0.5) * 0.5
        );
        setSampleRate(1.0);
        break;
      case 'trend':
        // Sine with trend
        data = Array.from(
          { length: n },
          (_, i) => Math.sin((2 * Math.PI * i) / 25) + i * 0.01
        );
        setSampleRate(1.0);
        break;
    }

    setInputData(data.map((v) => v.toFixed(4)).join(' '));
  };

  return (
    <>
      <Navigation />
      <main
        id="main-content"
        className="min-h-screen bg-gradient-to-b from-indigo-950 to-black flex flex-col items-center p-8 pt-24 page-enter"
      >
        <h1 className="text-5xl font-light text-white/90 mb-2 tracking-wide">
          Spectral Sonification
        </h1>
        <p className="text-indigo-400/60 text-sm font-mono mb-6 tracking-wider">
          Hidden cycles revealed
        </p>

        <p className="text-indigo-300/70 mb-8 text-center max-w-2xl leading-relaxed">
          Fourier transform reveals hidden frequencies. Hear the cycles within your data.
          <br />
          Not arbitrary mapping—actual periodicities, transposed into the audible range.
        </p>

        {/* Educational Toggle */}
        <button
          onClick={() => setShowEducation(!showEducation)}
          className="mb-6 text-indigo-300/60 hover:text-indigo-300/90 text-sm transition-colors underline"
        >
          {showEducation ? '▼ Hide' : '▶ What is spectral sonification?'}
        </button>

        {showEducation && (
          <div className="mb-8 max-w-3xl bg-white/5 rounded-lg border border-white/10 p-6 text-white/70 text-sm space-y-3">
            <h3 className="text-white font-mono text-lg mb-3">The Fourier Transform</h3>
            <p>
              Every time series can be decomposed into sine waves—pure frequencies. The{' '}
              <strong>FFT (Fast Fourier Transform)</strong> extracts these hidden cycles.
            </p>
            <p>
              A signal oscillating at 0.1 Hz completes one cycle every 10 seconds. In your data,
              this might be weekly patterns, circadian rhythms, or market cycles.
            </p>
            <p>
              <strong>This module makes those frequencies audible.</strong> Data cycling at 0.1 Hz
              becomes a low drone. Data cycling at 5 Hz becomes a mid-range tone. You&apos;re
              hearing the signal itself, not a representation.
            </p>
            <h4 className="text-white font-mono mt-4">Key Concepts:</h4>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>
                <strong>Power Spectrum:</strong> Shows which frequencies are strongest
              </li>
              <li>
                <strong>Spectral Centroid:</strong> Center of mass of spectrum (brightness)
              </li>
              <li>
                <strong>Spectral Entropy:</strong> Complexity/noisiness of the signal
              </li>
              <li>
                <strong>Spectral Rolloff:</strong> Frequency below which 85% of energy lies
              </li>
            </ul>
          </div>
        )}

        {/* Input Section */}
        <div className="w-full max-w-4xl mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Data Input */}
            <div>
              <label className="block text-white/70 text-sm font-mono mb-2">
                Time Series Data (space or comma separated)
              </label>
              <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="1.2 3.4 2.1 4.5 3.2 ..."
                className="w-full h-32 bg-white/5 border border-white/20 rounded-lg p-3 text-white font-mono text-sm resize-none focus:outline-none focus:border-indigo-400/50"
              />
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-mono mb-2">
                  Sample Rate (Hz)
                </label>
                <input
                  type="number"
                  value={sampleRate}
                  onChange={(e) => setSampleRate(parseFloat(e.target.value))}
                  step="0.1"
                  min="0.001"
                  className="w-full bg-white/5 border border-white/20 rounded-lg p-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-400/50"
                />
                <p className="text-white/40 text-xs mt-1">
                  Observations per second (1.0 = 1 sample/sec)
                </p>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-mono mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  min="2"
                  max="30"
                  className="w-full bg-white/5 border border-white/20 rounded-lg p-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-400/50"
                />
              </div>
            </div>
          </div>

          {/* Sample Data Buttons */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-white/50 text-sm font-mono self-center">Quick patterns:</span>
            <button
              onClick={() => generatePattern('sine')}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/20 rounded text-white/70 text-xs transition-colors"
            >
              Sine Wave
            </button>
            <button
              onClick={() => generatePattern('multi')}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/20 rounded text-white/70 text-xs transition-colors"
            >
              Multi-Frequency
            </button>
            <button
              onClick={() => generatePattern('noisy')}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/20 rounded text-white/70 text-xs transition-colors"
            >
              Noisy Signal
            </button>
            <button
              onClick={() => generatePattern('trend')}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/20 rounded text-white/70 text-xs transition-colors"
            >
              With Trend
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={analyzeSpectrum}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 text-white rounded-lg transition-all duration-300 border border-white/20 shadow-lg disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : '🔬 Analyze Spectrum'}
            </button>
            <button
              onClick={loadDemo}
              disabled={loading}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 border border-white/20 disabled:opacity-50"
            >
              📊 Load Demo
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-4xl mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Visualization */}
        {spectralData && (
          <>
            <div className="w-full max-w-4xl mb-6">
              <h2 className="text-2xl font-light text-white/80 mb-4">Power Spectrum</h2>
              <canvas
                ref={canvasRef}
                width={1200}
                height={400}
                className="rounded-xl shadow-2xl border border-purple-800/30 w-full"
                aria-label="Power spectrum visualization showing frequency content"
                role="img"
              />
            </div>

            {/* Dominant Frequencies Table */}
            <div className="w-full max-w-4xl mb-8">
              <h3 className="text-xl font-light text-white/80 mb-3">
                Dominant Frequencies (Top 8)
              </h3>
              <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                <table className="w-full text-white/70 text-sm font-mono">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-3">Frequency (Hz)</th>
                      <th className="text-left p-3">Period</th>
                      <th className="text-left p-3">Power</th>
                      <th className="text-left p-3">Phase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spectralData.components.map((comp, i) => (
                      <tr key={i} className="border-t border-white/10">
                        <td className="p-3">{comp.frequency.toFixed(4)}</td>
                        <td className="p-3">
                          {comp.period === Infinity
                            ? 'DC'
                            : `${comp.period.toFixed(2)} ${sampleRate === 1 ? 's' : 'samples'}`}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-400"
                                style={{ width: `${comp.power_normalized * 100}%` }}
                              />
                            </div>
                            <span>{(comp.power_normalized * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="p-3">{comp.phase_degrees.toFixed(1)}°</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Play Button */}
            <button
              onClick={playSonification}
              disabled={loading}
              className="mb-8 px-6 py-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 text-white rounded-lg transition-all duration-300 border border-white/20 shadow-lg text-lg"
            >
              {isPlaying ? '⏹ Stop' : '▶ Play Sonification'}
            </button>

            {/* Metadata */}
            <div className="grid grid-cols-4 gap-4 text-white/70 text-sm mb-8 max-w-4xl w-full">
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Samples</div>
                <div className="text-2xl font-light">{spectralData.metadata.n_samples}</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="text-white/50 text-xs uppercase tracking-wider mb-2">
                  Centroid (Hz)
                </div>
                <div className="text-2xl font-light">
                  {spectralData.metadata.spectral_centroid.toFixed(3)}
                </div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Entropy</div>
                <div className="text-2xl font-light">
                  {spectralData.metadata.spectral_entropy.toFixed(3)}
                </div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="text-white/50 text-xs uppercase tracking-wider mb-2">
                  Rolloff (Hz)
                </div>
                <div className="text-2xl font-light">
                  {spectralData.metadata.spectral_rolloff.toFixed(3)}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="max-w-3xl text-center text-white/50 text-sm space-y-2 border-t border-white/10 pt-6">
          <p className="italic">
            &ldquo;All things in nature have rhythm. Find the frequency, and you find the
            truth.&rdquo;
          </p>
          <p className="text-xs text-white/30 mt-4">
            FFT with Hann windowing · Peak detection · Spectral statistics · Octave-folded audio
            mapping
          </p>
        </div>
      </main>
    </>
  );
}
