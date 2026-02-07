import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'API Horóscopo',
  description: 'API de previsões diárias por signo'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
