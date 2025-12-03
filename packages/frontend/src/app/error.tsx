'use client'

// Error boundaries are grace - they catch the fall and offer a way back

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Confluence encountered an error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-earth-900 via-water-900 to-growth-900">
      <div className="max-w-md w-full mx-4 p-8 bg-earth-800/50 backdrop-blur-sm rounded-lg border border-earth-700/30 shadow-2xl">
        <div className="text-center space-y-6">
          {/* Animated pulse icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-water-500 to-growth-500 animate-breathe" />

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-earth-100">
              A Disruption in the Flow
            </h2>
            <p className="text-earth-300 text-sm">
              The stream encountered an obstacle. Even rivers must sometimes find new paths.
            </p>
          </div>

          {/* Error details in dev mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-left p-4 bg-earth-900/50 rounded border border-earth-700/50">
              <p className="text-xs font-mono text-earth-400 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={reset}
              className="px-4 py-2 bg-water-600 hover:bg-water-500 text-white rounded-md transition-colors duration-200 text-sm font-medium"
              aria-label="Try again"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-earth-700 hover:bg-earth-600 text-earth-100 rounded-md transition-colors duration-200 text-sm font-medium"
              aria-label="Return to home page"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
