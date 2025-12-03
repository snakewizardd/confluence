'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SessionTracker } from '@/lib/session-tracker';

interface InstrumentOutroProps {
  instrument: string;
  duration: number; // seconds
}

export default function InstrumentOutro({ instrument, duration }: InstrumentOutroProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<'message' | 'fadeout'>('message');

  useEffect(() => {
    // Show message for 2 seconds
    const timer1 = setTimeout(() => {
      setPhase('fadeout');
    }, 2000);

    // Then navigate back to threshold
    const timer2 = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [router]);

  const formattedDuration = SessionTracker.formatDuration(duration);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <p
        className={`font-light text-lg text-gray-400 tracking-wider transition-opacity duration-1000 ${
          phase === 'message' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        You heard {formattedDuration} of {instrument}
      </p>
    </div>
  );
}
