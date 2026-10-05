import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import 'driver.js/dist/driver.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Operación Uno — Gestión operativa adaptable',
  description: 'Sistema de gestión de proyectos y procesos internos para equipos que trabajan por proyectos.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f6f7f9',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-MX">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
