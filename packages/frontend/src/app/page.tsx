'use client';

import Link from 'next/link'
import Navigation from '@/components/Navigation'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function Home() {
  return (
    <>
      <Navigation />

      {/* Hero Section - Full viewport height */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-purple-950/40 to-gray-900">
          <AnimatedBackground />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center space-y-8 px-6 animate-fade-in">
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-serif text-white tracking-tight animate-glow">
            Confluence
          </h1>
          <p className="text-2xl md:text-4xl text-purple-300/90 font-light">
            Where data becomes music
          </p>
          <p className="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
            Transform numbers into melody. See patterns. Hear truth.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
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

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Instruments Section */}
      <section className="relative bg-gray-900 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-white text-center mb-16 fade-in-on-scroll">
            Instruments
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Pulse Card */}
            <Link
              href="/pulse"
              className="group relative overflow-hidden p-10 bg-gradient-to-br from-blue-900/30 to-green-900/30 hover:from-blue-900/50 hover:to-green-900/50 rounded-2xl border border-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl fade-in-on-scroll"
            >
              {/* Animated Preview - Sine Wave */}
              <div className="mb-6 h-20 flex items-center justify-center overflow-hidden">
                <div className="flex items-center gap-1">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-blue-500 to-green-500 rounded-full transition-all duration-300 group-hover:from-blue-400 group-hover:to-green-400"
                      style={{
                        height: `${20 + Math.sin(i * 0.5) * 15}px`,
                        animation: `wave 2s ease-in-out ${i * 0.1}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <h3 className="text-3xl font-light text-white mb-4">The Pulse</h3>
              <p className="text-white/70 leading-relaxed mb-6">
                Real-time synthesis of growth and flow patterns. Watch data breathe. Hear it sing.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/20 text-sm text-white/80 font-mono">
                <span>Live Sonification</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* Iris Card */}
            <Link
              href="/iris"
              className="group relative overflow-hidden p-10 bg-gradient-to-br from-purple-900/30 to-pink-900/30 hover:from-purple-900/50 hover:to-pink-900/50 rounded-2xl border border-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl fade-in-on-scroll"
            >
              {/* Animated Preview - Three Dots */}
              <div className="mb-6 h-20 flex items-center justify-center gap-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 animate-breathe" style={{ animationDelay: '0s' }} />
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 animate-breathe" style={{ animationDelay: '0.3s' }} />
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 animate-breathe" style={{ animationDelay: '0.6s' }} />
              </div>

              <h3 className="text-3xl font-light text-white mb-4">Iris World</h3>
              <p className="text-white/70 leading-relaxed mb-6">
                Fisher&apos;s 1936 botanical dataset transformed into a 150-note composition across three species.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/20 text-sm text-white/80 font-mono">
                <span>Historic Dataset</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* Loom Card */}
            <Link
              href="/loom"
              className="group relative overflow-hidden p-10 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 hover:from-purple-900/50 hover:to-indigo-900/50 rounded-2xl border border-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl fade-in-on-scroll"
            >
              {/* Animated Preview - Spiral */}
              <div className="mb-6 h-20 flex items-center justify-center overflow-hidden">
                <div className="relative w-20 h-20">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-full border-2 border-purple-500/40"
                      style={{
                        animation: `spin ${3 + i}s linear infinite`,
                        transform: `scale(${1 - i * 0.3})`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <h3 className="text-3xl font-light text-white mb-4">The Loom</h3>
              <p className="text-white/70 leading-relaxed mb-6">
                Mathematical systems woven into sound. Lorenz, Fibonacci, cellular automata, and strange attractors.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/20 text-sm text-white/80 font-mono">
                <span>Mathematical Dreams</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* Spectrum Card */}
            <Link
              href="/spectrum"
              className="group relative overflow-hidden p-10 bg-gradient-to-br from-indigo-900/30 to-cyan-900/30 hover:from-indigo-900/50 hover:to-cyan-900/50 rounded-2xl border border-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl fade-in-on-scroll"
            >
              {/* Animated Preview - Bars */}
              <div className="mb-6 h-20 flex items-center justify-center gap-1">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-full"
                    style={{
                      height: `${30 + Math.random() * 50}px`,
                      animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite`,
                    }}
                  />
                ))}
              </div>

              <h3 className="text-3xl font-light text-white mb-4">Spectrum</h3>
              <p className="text-white/70 leading-relaxed mb-6">
                Fourier transforms reveal hidden frequencies. Turn time-series data into audible spectral patterns.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/20 text-sm text-white/80 font-mono">
                <span>Frequency Analysis</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative bg-gradient-to-b from-gray-900 to-gray-950 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center fade-in-on-scroll">
          <p className="text-white/40 text-sm font-mono mb-4">Built with</p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-white/60 text-sm">
            <span className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">Next.js</span>
            <span className="text-white/30">•</span>
            <span className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">R</span>
            <span className="text-white/30">•</span>
            <span className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">Tone.js</span>
            <span className="text-white/30">•</span>
            <span className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">Canvas API</span>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="relative bg-gray-950 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 fade-in-on-scroll">
          <blockquote className="text-2xl md:text-3xl text-white/90 font-light italic leading-relaxed">
            &ldquo;Data is not dead. It pulses with the rhythm of the systems that created it.
            Confluence reveals that hidden music.&rdquo;
          </blockquote>
          <Link
            href="/about"
            className="inline-block text-purple-400 hover:text-purple-300 text-sm font-mono transition-colors duration-300 border-b border-purple-400/30 hover:border-purple-300/50"
          >
            About this project →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-white/40">
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/snakewizardd/confluence"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/70 transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <p>© {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scaleY(0.8); }
          50% { opacity: 1; transform: scaleY(1.2); }
        }

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

        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 20px rgba(168, 85, 247, 0.3),
                         0 0 40px rgba(168, 85, 247, 0.2);
          }
          50% {
            text-shadow: 0 0 30px rgba(168, 85, 247, 0.5),
                         0 0 60px rgba(168, 85, 247, 0.3);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }

        .fade-in-on-scroll {
          opacity: 0;
          animation: fade-in 0.8s ease-out forwards;
          animation-timeline: view();
          animation-range: entry 0% cover 30%;
        }
      `}</style>
    </>
  )
}
