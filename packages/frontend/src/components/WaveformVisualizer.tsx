'use client';

import { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  /** The Tone.js library instance */
  Tone: any;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Color scheme for the waveform */
  color?: string;
  /** Height of the canvas in pixels */
  height?: number;
}

/**
 * WaveformVisualizer - Real-time audio waveform display
 *
 * Uses Tone.js Analyser to extract waveform data and renders it as a
 * flowing sine wave that responds to actual audio output.
 */
export default function WaveformVisualizer({
  Tone,
  isPlaying,
  color = '#8b5cf6',
  height = 60
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize analyser when Tone is available
  useEffect(() => {
    if (!Tone || analyserRef.current) return;

    try {
      // Create analyser node and connect to destination
      const analyser = new Tone.Analyser('waveform', 256);
      Tone.Destination.connect(analyser);
      analyserRef.current = analyser;
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to create waveform analyser:', e);
      }
    }

    return () => {
      if (analyserRef.current) {
        analyserRef.current.dispose();
        analyserRef.current = null;
      }
    };
  }, [Tone]);

  // Animation loop for waveform drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height: canvasHeight } = canvas;

    const draw = () => {
      if (!analyserRef.current) return;

      // Clear canvas with dark background
      ctx.fillStyle = 'rgba(10, 10, 20, 0.3)';
      ctx.fillRect(0, 0, width, canvasHeight);

      // Get waveform data from analyser
      const waveform = analyserRef.current.getValue();

      // Draw waveform
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isPlaying ? color : `${color}40`;

      const centerY = canvasHeight / 2;
      const amplitude = isPlaying ? canvasHeight * 0.4 : canvasHeight * 0.1;

      for (let i = 0; i < waveform.length; i++) {
        const x = (i / waveform.length) * width;
        const y = centerY + waveform[i] * amplitude;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Add glow effect
      if (isPlaying) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, color, height]);

  // Handle window resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <canvas
        ref={canvasRef}
        width={1200}
        height={height}
        className="w-full h-full rounded-lg"
        style={{ background: 'rgba(10, 10, 20, 0.5)' }}
        aria-label="Live audio waveform visualization"
        role="img"
      />
    </div>
  );
}
