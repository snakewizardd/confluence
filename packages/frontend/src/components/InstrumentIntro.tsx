'use client';

import { useEffect, useState } from 'react';

interface InstrumentIntroProps {
  name: string;
  subtitle: string;
  onComplete: () => void;
}

export default function InstrumentIntro({ name, subtitle, onComplete }: InstrumentIntroProps) {
  const [phase, setPhase] = useState<'name' | 'subtitle' | 'fadeout'>('name');

  useEffect(() => {
    // Name appears immediately, fades in
    const timer1 = setTimeout(() => {
      setPhase('subtitle');
    }, 1500);

    // Subtitle appears
    const timer2 = setTimeout(() => {
      setPhase('fadeout');
    }, 2500);

    // Both fade out, then complete
    const timer3 = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      {/* Instrument name */}
      <h1
        className={`font-extralight text-5xl tracking-[0.5em] uppercase transition-opacity duration-700 ${
          phase === 'name' || phase === 'subtitle' ? 'opacity-100' : 'opacity-0'
        } ${
          phase === 'name' ? 'text-white' : 'text-gray-400'
        }`}
      >
        {name}
      </h1>

      {/* Subtitle */}
      {(phase === 'subtitle' || phase === 'fadeout') && (
        <p
          className={`font-light text-lg text-gray-500 tracking-wider mt-6 transition-opacity duration-700 ${
            phase === 'subtitle' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
