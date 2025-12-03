import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter, JetBrains_Mono, Crimson_Pro } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson-pro',
})

export const metadata: Metadata = {
  title: 'Confluence | Data Sonification',
  description: 'Transform datasets into music. A creative engineering project exploring the intersection of data visualization, sound synthesis, and mathematical beauty.',
  keywords: ['data sonification', 'data visualization', 'sound synthesis', 'generative music', 'creative coding', 'data art'],
  openGraph: {
    title: 'Confluence | Data Sonification',
    description: 'Transform datasets into music. Experience the intersection of data visualization, sound synthesis, and mathematical beauty.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Confluence | Data Sonification',
    description: 'Transform datasets into music. Experience the intersection of data visualization, sound synthesis, and mathematical beauty.',
  },
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${crimsonPro.variable}`}>
      <head>
        <meta name="theme-color" content="#6b21a8" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="font-sans">
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
