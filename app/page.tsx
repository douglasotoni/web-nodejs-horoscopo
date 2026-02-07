'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })
import 'swagger-ui-react/swagger-ui.css'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #1a1535 0%, #0f0c29 100%)',
        padding: '0.5rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
        fontSize: '0.9rem'
      }}>
        <Link href="/horoscope" style={{ color: '#c4b5fd', textDecoration: 'none', fontWeight: 500 }}>
          ✦ Ver previsões (Horóscopo)
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
        <Link href="/aniversariantes" style={{ color: '#c4b5fd', textDecoration: 'none', fontWeight: 500 }}>
          Aniversariantes
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
        <span style={{ color: '#a78bfa' }}>Documentação da API</span>
      </div>
      <main style={{ height: '100vh', paddingTop: '48px' }}>
        {mounted && (
          <ErrorBoundary>
            <div key="swagger-container" style={{ height: '100%' }}>
              <SwaggerUI url="/api/docs" />
            </div>
          </ErrorBoundary>
        )}
      </main>
    </>
  )
}
