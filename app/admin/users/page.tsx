'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer' as 'admin' | 'editor' | 'viewer'
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session && session.user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session && session.user.role === 'admin') {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      } else {
        setError('Erro ao buscar usuários')
      }
    } catch (err) {
      setError('Erro ao buscar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!editingId && !formData.password) {
      setError('Senha é obrigatória para novos usuários')
      return
    }

    setLoading(true)
    try {
      const url = '/api/admin/users'
      const method = editingId ? 'PUT' : 'POST'
      const body: any = { ...formData }
      
      if (editingId) {
        body.id = editingId
        if (!formData.password) {
          delete body.password
        }
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setSuccess(editingId ? 'Usuário atualizado!' : 'Usuário criado!')
        setShowForm(false)
        setEditingId(null)
        setFormData({ name: '', email: '', password: '', role: 'viewer' })
        fetchUsers()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao salvar usuário')
      }
    } catch (err) {
      setError('Erro ao salvar usuário')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: any) => {
    setEditingId(user.id)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setSuccess('Usuário deletado!')
        fetchUsers()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao deletar usuário')
      }
    } catch (err) {
      setError('Erro ao deletar usuário')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="loading">Carregando...</div>
  }

  if (!session || session.user.role !== 'admin') {
    return null
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>Gerenciar Usuários</h1>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              setFormData({ name: '', email: '', password: '', role: 'viewer' })
            }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancelar' : 'Novo Usuário'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2>{editingId ? 'Editar Usuário' : 'Novo Usuário'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Senha {editingId && '(deixe em branco para não alterar)'}
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingId}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </button>
            </form>
          </div>
        )}

        {error && !showForm && <div className="alert alert-error">{error}</div>}
        {success && !showForm && <div className="alert alert-success">{success}</div>}

        {loading && !showForm ? (
          <div className="loading">Carregando...</div>
        ) : (
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Nome</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Criado em</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem' }}>{user.name}</td>
                    <td style={{ padding: '0.5rem' }}>{user.email}</td>
                    <td style={{ padding: '0.5rem' }}>{user.role}</td>
                    <td style={{ padding: '0.5rem' }}>
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <button
                        onClick={() => handleEdit(user)}
                        className="btn btn-secondary"
                        style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                      >
                        Editar
                      </button>
                      {user.id !== session.user.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                        >
                          Deletar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

