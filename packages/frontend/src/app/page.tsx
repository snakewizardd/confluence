'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionTracker } from '@/lib/session-tracker';

interface FloatingWord {
  id: string;
  text: string;
  x: number; // percentage
  y: number; // percentage
  route: string;
  phase: number; // for animation offset
}

const WORDS: FloatingWord[] = [
  { id: 'chaos', text: 'Chaos', x: 20, y: 35, route: '/loom?system=lorenz', phase: 0 },
  { id: 'order', text: 'Order', x: 75, y: 30, route: '/loom?system=fibonacci', phase: 1.5 },
  { id: 'growth', text: 'Growth', x: 50, y: 50, route: '/pulse', phase: 3 },
  { id: 'memory', text: 'Memory', x: 25, y: 65, route: '/iris', phase: 4.5 },
  { id: 'infinity', text: 'Infinity', x: 70, y: 68, route: '/spectrum', phase: 2 },
];

export default function Home() {
  const router = useRouter();
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [lightPosition, setLightPosition] = useState({ x: 50, y: 50 });
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [mostListened, setMostListened] = useState<string | null>(null);
  const [isFading, setIsFading] = useState(false);

  // Load user history on mount
  useEffect(() => {
    const tracker = new SessionTracker();
    const data = tracker.getData();

    if (data.sessions.length > 0) {
      const duration = SessionTracker.formatDuration(data.totalTime);
      setWelcomeMessage(`Welcome back. You've spent ${duration} listening.`);
      setMostListened(tracker.getMostListened());
    }
  }, []);

  // Handle word hover - shift light toward it
  const handleMouseEnter = (word: FloatingWord) => {
    setHoveredWord(word.id);
    setLightPosition({ x: word.x, y: word.y });
  };

  const handleMouseLeave = () => {
    setHoveredWord(null);
    setLightPosition({ x: 50, y: 50 });
  };

  // Handle click - fade and navigate
  const handleClick = (word: FloatingWord) => {
    setIsFading(true);
    setTimeout(() => {
      router.push(word.route);
    }, 800); // Wait for fade animation
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Fade overlay for transitions */}
      <div
        className={`fixed inset-0 bg-black pointer-events-none transition-opacity duration-700 z-50 ${
          isFading ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Central point of light */}
      <div
        className="absolute w-96 h-96 rounded-full transition-all duration-1000 ease-out"
        style={{
          left: `${lightPosition.x}%`,
          top: `${lightPosition.y}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, rgba(168, 85, 247, ${hoveredWord ? 0.15 : 0.05}) 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* The Question */}
        <h1 className="font-extralight text-2xl text-gray-400 tracking-[0.3em] mb-32 animate-fade-in uppercase">
          What do you want to feel?
        </h1>

        {/* Floating Words */}
        <div className="relative w-full h-96">
          {WORDS.map((word) => (
            <button
              key={word.id}
              onMouseEnter={() => handleMouseEnter(word)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(word)}
              className={`absolute font-thin text-lg tracking-widest uppercase transition-all duration-500 ${
                hoveredWord === word.id
                  ? 'text-white scale-110'
                  : mostListened === word.id
                  ? 'text-gray-300'
                  : 'text-gray-400'
              }`}
              style={{
                left: `${word.x}%`,
                top: `${word.y}%`,
                transform: 'translate(-50%, -50%)',
                animation: `float-${word.id} 4s ease-in-out infinite`,
                animationDelay: `${word.phase}s`,
                textShadow:
                  hoveredWord === word.id
                    ? '0 0 20px rgba(168, 85, 247, 0.6)'
                    : mostListened === word.id
                    ? '0 0 10px rgba(168, 85, 247, 0.3)'
                    : 'none',
              }}
            >
              {word.text}

              {/* Particle trail on hover */}
              {hoveredWord === word.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-px h-24 bg-gradient-to-b from-purple-500/50 via-purple-500/20 to-transparent absolute -bottom-24 left-1/2 -translate-x-1/2" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Welcome message for returning users */}
        {welcomeMessage && (
          <p className="font-light text-sm text-gray-500 tracking-wider mt-32 animate-fade-in-delayed">
            {welcomeMessage}
          </p>
        )}
      </div>

      {/* Floating animations for each word */}
      <style jsx>{`
        @keyframes float-chaos {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
        }
        @keyframes float-order {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-12px); }
        }
        @keyframes float-growth {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }
        @keyframes float-memory {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-6px); }
        }
        @keyframes float-infinity {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-14px); }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 2s ease-out;
        }

        .animate-fade-in-delayed {
          opacity: 0;
          animation: fade-in 2s ease-out 1s forwards;
        }
      `}</style>
    </div>
  );
}
