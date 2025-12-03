'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function About() {
  return (
    <>
      <Navigation />

      {/* Hero Section */}
      <section id="main-content" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 via-purple-950/40 to-gray-900 page-enter">
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-32 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-6xl md:text-7xl font-serif text-white tracking-tight">
              The Philosophy
            </h1>
            <p className="text-2xl md:text-3xl text-purple-300/90 font-light">
              Why turn data into music?
            </p>
          </div>

          {/* The Idea */}
          <div className="space-y-6 border-l-2 border-purple-500/30 pl-8">
            <h2 className="text-3xl font-light text-white">The Idea</h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Every dataset carries rhythm. Growth patterns breathe. Time series pulse.
              Variance hums. Sound reaches us differently than sight—it bypasses analysis
              and speaks directly to intuition.
            </p>
            <p className="text-lg text-white/80 leading-relaxed">
              When Fisher catalogued 150 iris flowers in 1936, he saw measurements.
              We hear three distinct voices in conversation. When the USDA tracks crop yields
              across seasons, they see trends. We hear the slow dance of earth and sun.
            </p>
          </div>

          {/* The Method */}
          <div className="space-y-6 border-l-2 border-blue-500/30 pl-8">
            <h2 className="text-3xl font-light text-white">The Method</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-400" />
                <div>
                  <span className="text-white/90 font-mono text-sm">Numbers → Pitch</span>
                  <p className="text-white/70 mt-1">
                    Values map to musical notes. Higher numbers, higher tones. The data sings its scale.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-green-400" />
                <div>
                  <span className="text-white/90 font-mono text-sm">Trends → Tempo</span>
                  <p className="text-white/70 mt-1">
                    Growth accelerates the rhythm. Decay slows it. Time becomes tangible.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-purple-400" />
                <div>
                  <span className="text-white/90 font-mono text-sm">Variance → Timbre</span>
                  <p className="text-white/70 mt-1">
                    Consistency rings pure. Chaos adds texture. Statistical spread becomes sonic color.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* The Stack */}
          <div className="space-y-6 border-l-2 border-green-500/30 pl-8">
            <h2 className="text-3xl font-light text-white">The Stack</h2>
            <p className="text-lg text-white/80 leading-relaxed">
              R computes statistical truth. FastAPI bridges worlds. Next.js renders the interface.
              Tone.js breathes sound into numbers. Each layer serves the whole.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
              <div className="card-lift px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-center">
                <span className="text-white/80 text-sm font-mono">R</span>
              </div>
              <div className="card-lift px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-center">
                <span className="text-white/80 text-sm font-mono">FastAPI</span>
              </div>
              <div className="card-lift px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-center">
                <span className="text-white/80 text-sm font-mono">Next.js</span>
              </div>
              <div className="card-lift px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-center">
                <span className="text-white/80 text-sm font-mono">Tone.js</span>
              </div>
            </div>
          </div>

          {/* The Invitation */}
          <div className="space-y-6 text-center pt-8">
            <h2 className="text-3xl font-light text-white">The Invitation</h2>
            <p className="text-xl text-white/80 leading-relaxed">
              What data would you want to hear?
            </p>
            <p className="text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
              Climate patterns? Market movements? Your own heartbeat? Every number
              tells a story. Some stories are better heard than seen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link
                href="/pulse"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 rounded-xl font-mono text-sm text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50"
              >
                Experience Pulse
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/iris"
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-mono text-sm text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
              >
                Explore Iris
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>

          {/* Return Home */}
          <div className="text-center pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm font-mono transition-colors duration-300"
            >
              <span>←</span>
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </>
  );
}
