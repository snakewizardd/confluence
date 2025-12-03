'use client';

import { useEffect, useRef } from 'react';

/**
 * Animated background component using sine waves
 * Creates a subtle, organic flowing pattern
 */
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation parameters
    let time = 0;
    const waves = [
      { amplitude: 30, frequency: 0.01, speed: 0.02, offset: 0, color: 'rgba(147, 51, 234, 0.15)' }, // purple
      { amplitude: 40, frequency: 0.008, speed: 0.015, offset: 100, color: 'rgba(59, 130, 246, 0.1)' }, // blue
      { amplitude: 25, frequency: 0.012, speed: 0.025, offset: 200, color: 'rgba(236, 72, 153, 0.08)' }, // pink
    ];

    const drawWave = (wave: typeof waves[0], time: number) => {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);

      for (let x = 0; x < canvas.width; x++) {
        const y =
          canvas.height / 2 +
          Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
          wave.offset;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();

      ctx.fillStyle = wave.color;
      ctx.fill();
    };

    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'transparent';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw waves
      waves.forEach(wave => drawWave(wave, time));

      time += 1;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
}
