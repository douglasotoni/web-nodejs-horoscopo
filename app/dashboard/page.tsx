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

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { text: string; color: string; bg: string }> = {
      admin: { text: 'Administrador', color: '#fff', bg: '#dc3545' },
      editor: { text: 'Editor', color: '#fff', bg: '#0070f3' },
      viewer: { text: 'Visualizador', color: '#333', bg: '#e0e0e0' }
    }
    const badge = badges[role] || badges.viewer
    return (
      <span style={{
        padding: '0.4rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '600',
        color: badge.color,
        backgroundColor: badge.bg,
        display: 'inline-block',
        marginLeft: '1rem'
      }}>
        {badge.text}
      </span>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', fontWeight: 'bold', color: '#1a1a1a' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666', margin: 0 }}>
            Bem-vindo, <strong>{session.user.name}</strong>!{getRoleBadge(session.user.role)}
          </p>
        </div>

        {/* Cards principais */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Consultar Previsões - Todos os usuários */}
          <div className="card" style={{
            border: 'none',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              🔮
            </div>
            <h2 style={{ 
              marginTop: 0, 
              marginBottom: '0.75rem',
              fontSize: '1.5rem',
              color: '#1a1a1a'
            }}>
              Consultar Previsões
            </h2>
            <p style={{ 
              color: '#666', 
              marginBottom: '1.5rem',
              lineHeight: '1.6'
            }}>
              Consulte previsões diárias e semanais por signo
            </p>
            <Link 
              href="/predictions" 
              className="btn btn-primary"
              style={{ 
                width: '100%',
                textAlign: 'center',
                display: 'block',
                textDecoration: 'none'
              }}
            >
              Ver Previsões
            </Link>
          </div>

          {/* Gerenciar Previsões - Admin e Editor */}
          {(session.user.role === 'admin' || session.user.role === 'editor') && (
            <>
              <div className="card" style={{
                border: 'none',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  ✏️
                </div>
                <h2 style={{ 
                  marginTop: 0, 
                  marginBottom: '0.75rem',
                  fontSize: '1.5rem',
                  color: '#fff'
                }}>
                  Gerenciar Previsões
                </h2>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  marginBottom: '1.5rem',
                  lineHeight: '1.6'
                }}>
                  Crie e edite previsões diárias e semanais
                </p>
                <Link 
                  href="/admin/predictions" 
                  className="btn"
                  style={{ 
                    width: '100%',
                    textAlign: 'center',
                    display: 'block',
                    textDecoration: 'none',
                    backgroundColor: '#fff',
                    color: '#667eea',
                    border: 'none'
                  }}
                >
                  Admin Previsões
                </Link>
              </div>

              {/* Gerenciar Variações Astrológicas - Admin e Editor */}
              <div className="card" style={{
                border: 'none',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: '#fff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  ⭐
                </div>
                <h2 style={{ 
                  marginTop: 0, 
                  marginBottom: '0.75rem',
                  fontSize: '1.5rem',
                  color: '#fff'
                }}>
                  Variações Astrológicas
                </h2>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  marginBottom: '1.5rem',
                  lineHeight: '1.6'
                }}>
                  Gerencie conselhos, cristais, cores e outras variações por signo
                </p>
                <Link 
                  href="/admin/zodiac" 
                  className="btn"
                  style={{ 
                    width: '100%',
                    textAlign: 'center',
                    display: 'block',
                    textDecoration: 'none',
                    backgroundColor: '#fff',
                    color: '#f5576c',
                    border: 'none'
                  }}
                >
                  Gerenciar Variações
                </Link>
              </div>
            </>
          )}

          {/* Gerenciar Usuários - Apenas Admin */}
          {session.user.role === 'admin' && (
            <div className="card" style={{
              border: 'none',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: '#fff'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                👥
              </div>
              <h2 style={{ 
                marginTop: 0, 
                marginBottom: '0.75rem',
                fontSize: '1.5rem',
                color: '#fff'
              }}>
                Gerenciar Usuários
              </h2>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                Gerencie usuários e permissões do sistema
              </p>
              <Link 
                href="/admin/users" 
                className="btn"
                style={{ 
                  width: '100%',
                  textAlign: 'center',
                  display: 'block',
                  textDecoration: 'none',
                  backgroundColor: '#fff',
                  color: '#4facfe',
                  border: 'none'
                }}
              >
                Usuários
              </Link>
            </div>
          )}
        </div>

        {/* Estatísticas rápidas (apenas para admin/editor) */}
        {(session.user.role === 'admin' || session.user.role === 'editor') && (
          <div className="card" style={{
            marginTop: '2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none'
          }}>
            <h3 style={{ marginTop: 0, color: '#fff' }}>Acesso Rápido</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              marginTop: '1rem'
            }}>
              <Link 
                href="/admin/predictions" 
                style={{ 
                  padding: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  textDecoration: 'none',
                  textAlign: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              >
                <strong>📝 Previsões</strong>
              </Link>
              <Link 
                href="/admin/zodiac" 
                style={{ 
                  padding: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  textDecoration: 'none',
                  textAlign: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              >
                <strong>⭐ Variações</strong>
              </Link>
              {session.user.role === 'admin' && (
                <Link 
                  href="/admin/users" 
                  style={{ 
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                >
                  <strong>👥 Usuários</strong>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

