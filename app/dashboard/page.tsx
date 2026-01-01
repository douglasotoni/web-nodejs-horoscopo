'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="loading">Carregando...</div>
  }

  if (!session) return null

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Dashboard</h1>
        <p>Bem-vindo, {session.user.name}!</p>
        <div className="grid grid-2" style={{ marginTop: '2rem' }}>
          <div className="card">
            <h2>Consultar Previsões</h2>
            <p>Consulte previsões diárias e semanais por signo</p>
            <Link href="/predictions" className="btn btn-primary">
              Ver Previsões
            </Link>
          </div>
          {(session.user.role === 'admin' || session.user.role === 'editor') && (
            <div className="card">
              <h2>Gerenciar Previsões</h2>
              <p>Crie e edite previsões diárias e semanais</p>
              <Link href="/admin/predictions" className="btn btn-primary">
                Admin Previsões
              </Link>
            </div>
          )}
          {session.user.role === 'admin' && (
            <div className="card">
              <h2>Gerenciar Usuários</h2>
              <p>Gerencie usuários e permissões do sistema</p>
              <Link href="/admin/users" className="btn btn-primary">
                Usuários
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

