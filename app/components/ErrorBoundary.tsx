'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
}

/** Captura erros de renderização e desmontagem (ex.: removeChild do Swagger UI). */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary:', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          <p>Algo deu errado ao carregar a documentação.</p>
          <a href="/api/docs" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa' }}>
            Abrir documentação em nova aba
          </a>
        </div>
      )
    }
    return this.props.children
  }
}
