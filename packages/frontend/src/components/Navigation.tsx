'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <Link
          href="/"
          className="text-xl font-serif text-white/90 hover:text-white transition-colors duration-300"
        >
          Confluence
        </Link>

        {/* Right: Navigation Links */}
        <div className="flex gap-6">
          <Link
            href="/pulse"
            className={`text-sm font-mono transition-all duration-300 ${
              pathname === '/pulse'
                ? 'text-white border-b-2 border-water-400'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            pulse
          </Link>
          <Link
            href="/iris"
            className={`text-sm font-mono transition-all duration-300 ${
              pathname === '/iris'
                ? 'text-white border-b-2 border-purple-400'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            iris
          </Link>
        </div>
      </div>
    </nav>
  );
}
