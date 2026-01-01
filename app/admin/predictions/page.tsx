'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { getISOWeek, getISOWeekYear } from 'date-fns'

const SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
] as const

const WEEKDAYS = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
] as const

const SIGN_NAMES: Record<string, string> = {
  aries: 'Áries', taurus: 'Touro', gemini: 'Gêmeos', cancer: 'Câncer',
  leo: 'Leão', virgo: 'Virgem', libra: 'Libra', scorpio: 'Escorpião',
  sagittarius: 'Sagitário', capricorn: 'Capricórnio', aquarius: 'Aquário', pisces: 'Peixes'
}

const WEEKDAY_NAMES: Record<string, string> = {
  monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta', thursday: 'Quinta',
  friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo'
}

type PredictionType = 'daily' | 'weekly'

export default function AdminPredictionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const now = new Date()
  const currentWeek = getISOWeek(now)
  const currentYear = getISOWeekYear(now)

  const [type, setType] = useState<PredictionType>('daily')
  const [sign, setSign] = useState('aries')
  const [weekday, setWeekday] = useState('monday')
  const [isoWeek, setIsoWeek] = useState(currentWeek)
  const [isoYear, setIsoYear] = useState(currentYear)
  const [text, setText] = useState('')
  const [luckyNumber, setLuckyNumber] = useState(1)
  const [statusPred, setStatusPred] = useState<'draft' | 'published'>('draft')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session && session.user.role !== 'admin' && session.user.role !== 'editor') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  const generatePrediction = async () => {
    setLoading(true)
    setError('')
    try {
      const { generateDailyPredictionClient, generateWeeklyPredictionClient } = await import('@/lib/generator-client')
      
      if (type === 'daily') {
        const result = generateDailyPredictionClient({
          sign: sign as any,
          weekday: weekday as any,
          isoWeek,
          isoYear
        })
        setText(result.text)
        setLuckyNumber(result.luckyNumber)
      } else {
        const result = generateWeeklyPredictionClient({
          sign: sign as any,
          isoWeek,
          isoYear,
          weekday: 'monday' // não usado
        })
        setText(result.text)
        setLuckyNumber(result.luckyNumber)
      }
      setSuccess('Previsão gerada automaticamente!')
    } catch (err) {
      setError('Erro ao gerar previsão')
    } finally {
      setLoading(false)
    }
  }

  const savePrediction = async () => {
    if (!text.trim() || luckyNumber < 1 || luckyNumber > 60) {
      setError('Texto e número da sorte (1-60) são obrigatórios')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const url = type === 'daily' 
        ? '/api/admin/predictions/daily'
        : '/api/admin/predictions/weekly'
      
      const body: any = {
        sign,
        isoWeek,
        isoYear,
        text,
        luckyNumber,
        status: statusPred
      }

      if (type === 'daily') {
        body.weekday = weekday
      }

      const method = editingId ? 'PUT' : 'POST'
      if (editingId) {
        body.id = editingId
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setSuccess(editingId ? 'Previsão atualizada!' : 'Previsão salva!')
        setEditingId(null)
        setTimeout(() => {
          setText('')
          setLuckyNumber(1)
          setStatusPred('draft')
        }, 2000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao salvar')
      }
    } catch (err) {
      setError('Erro ao salvar previsão')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="loading">Carregando...</div>
  }

  if (!session || (session.user.role !== 'admin' && session.user.role !== 'editor')) {
    return null
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Gerenciar Previsões</h1>

        <div className="card">
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value as PredictionType)}
            >
              <option value="daily">Diária</option>
              <option value="weekly">Semanal</option>
            </select>
          </div>

          <div className="grid grid-4">
            <div className="form-group">
              <label className="form-label">Signo</label>
              <select
                className="form-select"
                value={sign}
                onChange={(e) => setSign(e.target.value)}
              >
                {SIGNS.map(s => (
                  <option key={s} value={s}>{SIGN_NAMES[s]}</option>
                ))}
              </select>
            </div>

            {type === 'daily' && (
              <div className="form-group">
                <label className="form-label">Dia da Semana</label>
                <select
                  className="form-select"
                  value={weekday}
                  onChange={(e) => setWeekday(e.target.value)}
                >
                  {WEEKDAYS.map(w => (
                    <option key={w} value={w}>{WEEKDAY_NAMES[w]}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Semana ISO</label>
              <input
                type="number"
                className="form-input"
                value={isoWeek}
                onChange={(e) => setIsoWeek(Number(e.target.value))}
                min={1}
                max={53}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ano</label>
              <input
                type="number"
                className="form-input"
                value={isoYear}
                onChange={(e) => setIsoYear(Number(e.target.value))}
                min={2020}
                max={2100}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Texto</label>
            <textarea
              className="form-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Digite o texto da previsão..."
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Número da Sorte (1-60)</label>
              <input
                type="number"
                className="form-input"
                value={luckyNumber}
                onChange={(e) => setLuckyNumber(Number(e.target.value))}
                min={1}
                max={60}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={statusPred}
                onChange={(e) => setStatusPred(e.target.value as 'draft' | 'published')}
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </select>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              onClick={generatePrediction}
              className="btn btn-secondary"
              disabled={loading}
            >
              Gerar Automaticamente
            </button>
            <button
              onClick={savePrediction}
              className="btn btn-primary"
              disabled={loading}
            >
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null)
                  setText('')
                  setLuckyNumber(1)
                  setStatusPred('draft')
                }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

