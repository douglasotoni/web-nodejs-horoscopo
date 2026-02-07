import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-nunito',
  display: 'swap'
})

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
    <html lang="pt-BR" className={nunito.variable}>
      <body>{children}</body>
    </html>
  )
}
