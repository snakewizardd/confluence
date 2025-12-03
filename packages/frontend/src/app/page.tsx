import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-950/20 to-gray-900 flex items-center justify-center p-8">
        <div className="max-w-5xl text-center space-y-12">
          {/* Hero Section */}
          <div className="space-y-6">
            <h1 className="text-7xl font-serif text-white/95 tracking-tight">
              CONFLUENCE
            </h1>
            <p className="text-3xl text-purple-300/80 font-light">
              Data becomes music
            </p>
            <p className="text-lg text-white/60 font-mono max-w-2xl mx-auto leading-relaxed">
              Where rivers meet. Where disciplines dissolve.
              <br />
              Where the universal soul hums through data.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="pt-8 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link
              href="/pulse"
              className="group relative overflow-hidden p-8 bg-gradient-to-br from-blue-900/30 to-green-900/30 hover:from-blue-900/40 hover:to-green-900/40 rounded-2xl border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="relative z-10">
                <h2 className="text-2xl font-light text-white mb-3">Pulse</h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  Live synthesis of growth and flow patterns. Watch data transform into
                  animated visuals and generative soundscapes in real-time.
                </p>
                <div className="mt-6 inline-block px-4 py-2 bg-white/5 rounded-lg border border-white/20 text-xs text-white/70 font-mono">
                  Interactive Sonification →
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-water-500/10 to-growth-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <Link
              href="/iris"
              className="group relative overflow-hidden p-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 hover:from-purple-900/40 hover:to-pink-900/40 rounded-2xl border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="relative z-10">
                <h2 className="text-2xl font-light text-white mb-3">Iris</h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  Fisher's 1936 dataset transformed to sound. Experience the beauty of
                  statistical data as sinusoidal waves and harmonic progressions.
                </p>
                <div className="mt-6 inline-block px-4 py-2 bg-white/5 rounded-lg border border-white/20 text-xs text-white/70 font-mono">
                  Historic Data Sonification →
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>

          {/* Footer */}
          <div className="pt-12 border-t border-white/5">
            <p className="text-white/40 text-sm font-mono">
              Where statistics meets soul • Where engineering becomes philosophy
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
