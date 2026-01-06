'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Sign } from '@prisma/client'

const SIGN_NAMES: Record<string, string> = {
  aries: 'Áries', taurus: 'Touro', gemini: 'Gêmeos', cancer: 'Câncer',
  leo: 'Leão', virgo: 'Virgem', libra: 'Libra', scorpio: 'Escorpião',
  sagittarius: 'Sagitário', capricorn: 'Capricórnio', aquarius: 'Aquário', pisces: 'Peixes'
}

const VARIATION_TYPES = [
  { value: 'careerAdvice', label: 'Conselho Profissional' },
  { value: 'loveAdvice', label: 'Conselho Amoroso' },
  { value: 'crystal', label: 'Cristal/Pedra' },
  { value: 'dailyAlert', label: 'Alerta do Dia' },
  { value: 'recommendedActivity', label: 'Atividade Recomendada' },
  { value: 'practicalAdvice', label: 'Conselho Prático' },
  { value: 'luckyColor', label: 'Cor da Sorte' },
  { value: 'emotion', label: 'Emoção' },
  { value: 'impactPhrase', label: 'Frase de Impacto' },
  { value: 'mantra', label: 'Mantra/Afirmação' }
] as const

type VariationType = typeof VARIATION_TYPES[number]['value']

interface Variation {
  id: number
  text: string
  isActive: boolean
  sign: {
    id: number
    name: Sign
    displayName: string
  }
  createdAt: string
  updatedAt: string
}

interface ZodiacSign {
  id: number
  name: Sign
  displayName: string
  element: string
  quality: string
  rulingPlanet: string
}

export default function AdminZodiacPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [signs, setSigns] = useState<ZodiacSign[]>([])
  const [selectedType, setSelectedType] = useState<VariationType>('careerAdvice')
  const [selectedSignId, setSelectedSignId] = useState<number | null>(null)
  const [variations, setVariations] = useState<Variation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Formulário
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formText, setFormText] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session && session.user.role !== 'admin' && session.user.role !== 'editor') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    loadSigns()
  }, [])

  useEffect(() => {
    if (selectedSignId && selectedType) {
      loadVariations()
    } else {
      setVariations([])
    }
  }, [selectedSignId, selectedType])

  const loadSigns = async () => {
    try {
      const res = await fetch('/api/admin/zodiac/signs', {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setSigns(data)
        if (data.length > 0 && !selectedSignId) {
          setSelectedSignId(data[0].id)
        }
      }
    } catch (err) {
      console.error('Erro ao carregar signos:', err)
    }
  }

  const loadVariations = async () => {
    if (!selectedSignId || !selectedType) return
    
    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `/api/admin/zodiac/variations?signId=${selectedSignId}&type=${selectedType}`,
        { credentials: 'include' }
      )
      if (res.ok) {
        const data = await res.json()
        setVariations(data)
      } else {
        setError('Erro ao carregar variações')
      }
    } catch (err) {
      setError('Erro ao carregar variações')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formText.trim() || !selectedSignId) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const url = '/api/admin/zodiac/variations'
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId
        ? { id: editingId, type: selectedType, text: formText, isActive: formIsActive }
        : { signId: selectedSignId, type: selectedType, text: formText, isActive: formIsActive }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      })

      if (res.ok) {
        setSuccess(editingId ? 'Variação atualizada!' : 'Variação criada!')
        setFormText('')
        setEditingId(null)
        setFormIsActive(true)
        loadVariations()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao salvar')
      }
    } catch (err) {
      setError('Erro ao salvar variação')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (variation: Variation) => {
    setEditingId(variation.id)
    setFormText(variation.text)
    setFormIsActive(variation.isActive)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta variação?')) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/zodiac/variations?id=${id}&type=${selectedType}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        setSuccess('Variação deletada!')
        loadVariations()
      } else {
        setError('Erro ao deletar variação')
      }
    } catch (err) {
      setError('Erro ao deletar variação')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormText('')
    setFormIsActive(true)
  }

  if (status === 'loading') {
    return <div className="loading">Carregando...</div>
  }

  if (!session || (session.user.role !== 'admin' && session.user.role !== 'editor')) {
    return null
  }

  const selectedSign = signs.find(s => s.id === selectedSignId)

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Gerenciar Variações Astrológicas</h1>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Tipo de Variação</label>
              <select
                className="form-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as VariationType)}
              >
                {VARIATION_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Signo</label>
              <select
                className="form-select"
                value={selectedSignId || ''}
                onChange={(e) => setSelectedSignId(e.target.value ? Number(e.target.value) : null)}
              >
                {signs.map(sign => (
                  <option key={sign.id} value={sign.id}>
                    {sign.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedSign && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <strong>Informações do Signo:</strong>
              <div style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div><strong>Elemento:</strong> {selectedSign.element}</div>
                <div><strong>Qualidade:</strong> {selectedSign.quality}</div>
                <div><strong>Planeta Regente:</strong> {selectedSign.rulingPlanet}</div>
              </div>
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{success}</div>}
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0 }}>
            {editingId ? 'Editar' : 'Criar'} Variação
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Texto</label>
              <textarea
                className="form-textarea"
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                rows={3}
                required
                placeholder="Digite o texto da variação..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Ativo
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !formText.trim()}
              >
                {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>
            Variações ({variations.length})
            {selectedSign && (
              <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '1rem' }}>
                {VARIATION_TYPES.find(t => t.value === selectedType)?.label} - {selectedSign.displayName}
              </span>
            )}
          </h2>

          {loading && !variations.length ? (
            <div className="loading">Carregando variações...</div>
          ) : variations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
              Nenhuma variação encontrada. Crie uma nova acima.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {variations.map(variation => (
                <div
                  key={variation.id}
                  className="card"
                  style={{
                    padding: '1rem',
                    backgroundColor: variation.isActive ? '#fff' : '#f9f9f9',
                    border: `1px solid ${variation.isActive ? '#ddd' : '#ccc'}`,
                    opacity: variation.isActive ? 1 : 0.7
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        {!variation.isActive && (
                          <span style={{ 
                            padding: '0.25rem 0.5rem', 
                            backgroundColor: '#ccc', 
                            color: '#666',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            marginRight: '0.5rem'
                          }}>
                            Inativo
                          </span>
                        )}
                        <strong>{variation.sign.displayName}</strong>
                      </div>
                      <div style={{ color: '#333', lineHeight: '1.6' }}>
                        {variation.text}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEdit(variation)}
                        disabled={loading}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(variation.id)}
                        disabled={loading}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

