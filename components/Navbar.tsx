'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { canEditPredictions, canManageUsers } from '@/lib/rbac'

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  const canEdit = canEditPredictions(session.user.role)
  const canManage = canManageUsers(session.user.role)

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div>
          <Link href="/dashboard" className="navbar-link">
            Horóscopo
          </Link>
        </div>
        <div className="navbar-links">
          <Link 
            href="/dashboard" 
            className={`navbar-link ${pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/predictions" 
            className={`navbar-link ${pathname === '/predictions' ? 'active' : ''}`}
          >
            Previsões
          </Link>
          {canEdit && (
            <Link 
              href="/admin/predictions" 
              className={`navbar-link ${pathname === '/admin/predictions' ? 'active' : ''}`}
            >
              Admin Previsões
            </Link>
          )}
          {canManage && (
            <Link 
              href="/admin/users" 
              className={`navbar-link ${pathname === '/admin/users' ? 'active' : ''}`}
            >
              Usuários
            </Link>
          )}
          <span className="navbar-link">
            {session.user.name} ({session.user.role})
          </span>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="btn btn-secondary"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  )
}

