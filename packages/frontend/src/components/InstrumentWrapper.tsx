'use client';

import { useEffect, useState, ReactNode } from 'react';
import Link from 'next/link';
import InstrumentIntro from './InstrumentIntro';
import { sessionTracker } from '@/lib/session-tracker';

interface InstrumentWrapperProps {
  instrumentName: string;
  instrumentSubtitle: string;
  instrumentId: string;
  children: ReactNode;
}

export default function InstrumentWrapper({
  instrumentName,
  instrumentSubtitle,
  instrumentId,
  children,
}: InstrumentWrapperProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);

  // Start tracking session after intro completes
  useEffect(() => {
    if (introComplete) {
      sessionTracker.start(instrumentId);
    }

    // Cleanup: end session when component unmounts
    return () => {
      if (introComplete) {
        sessionTracker.end();
      }
    };
  }, [introComplete, instrumentId]);

  // Handle intro completion
  const handleIntroComplete = () => {
    setShowIntro(false);
    setIntroComplete(true);
  };

  if (showIntro) {
    return (
      <InstrumentIntro
        name={instrumentName}
        subtitle={instrumentSubtitle}
        onComplete={handleIntroComplete}
      />
    );
  }

  return (
    <>
      {children}

      {/* Exit button - fixed position */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-40 px-4 py-2 bg-black/60 backdrop-blur-xl hover:bg-black/70 text-white/70 hover:text-white rounded-xl transition-all duration-300 border border-white/20 text-sm font-mono"
        onClick={() => {
          if (introComplete) {
            sessionTracker.end();
          }
        }}
      >
        ← Exit
      </Link>
    </>
  );
}
