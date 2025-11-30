import { AuthProvider } from '@/contexts/AuthContext'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pixoa - AI-Powered Design Tool',
  description: 'Create stunning professional graphics, web page designs, and brand assets with AI. No design skills required.',
  keywords: 'AI design tool, graphic design, logo maker, brand assets, design generator',
  authors: [{ name: 'Pixoa Team' }],
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'Pixoa - AI-Powered Design Tool',
    description: 'Create stunning professional graphics, web page designs, and brand assets with AI. No design skills required.',
    url: 'https://pixoa.com',
    siteName: 'Pixoa',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pixoa - AI-Powered Design Tool',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixoa - AI-Powered Design Tool',
    description: 'Create stunning professional graphics, web page designs, and brand assets with AI. No design skills required.',
    images: ['/og-image.png'],
  },
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
        {/* Google Fonts for Text Overlay */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700&family=Playfair+Display:wght@700&family=Montserrat:wght@700&family=Poppins:wght@600&family=Bebas+Neue&family=Space+Mono:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}