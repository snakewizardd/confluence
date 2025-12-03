import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-4xl text-center space-y-8">
        <h1 className="text-6xl font-serif text-earth-900">
          CONFLUENCE
        </h1>
        <p className="text-2xl text-water-700 font-light">
          Where rivers meet. Where disciplines dissolve.
        </p>
        <p className="text-lg text-earth-600 font-mono">
          Where the universal soul hums through data.
        </p>

        <div className="pt-12 flex gap-4 justify-center">
          <Link
            href="/pulse"
            className="inline-block px-8 py-4 bg-gradient-to-r from-water-500 to-growth-500 text-white rounded-full font-mono text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Experience The Pulse →
          </Link>
          <Link
            href="/iris"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-mono text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Iris Sonification 🌸
          </Link>
        </div>

        <div className="pt-8 text-sm text-earth-500">
          <p>The system is breathing...</p>
        </div>
      </div>
    </main>
  )
}
