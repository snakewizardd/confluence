// While the data breathes to life, we wait with intention

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-earth-900 via-water-900 to-growth-900">
      <div className="text-center space-y-6">
        {/* Animated pulse loader */}
        <div className="relative w-24 h-24 mx-auto">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-water-500/30 animate-breathe" />

          {/* Middle ring */}
          <div className="absolute inset-2 rounded-full border-4 border-growth-500/40 animate-breathe"
               style={{ animationDelay: '0.5s' }} />

          {/* Inner core */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-water-400 to-growth-400 animate-breathe"
               style={{ animationDelay: '1s' }} />
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <p className="text-earth-100 text-lg font-medium">
            Confluence is forming...
          </p>
          <p className="text-earth-400 text-sm">
            Where rivers meet. Where data becomes sound.
          </p>
        </div>
      </div>
    </div>
  )
}
