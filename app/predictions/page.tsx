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
  aries: 'Áries',
  taurus: 'Touro',
  gemini: 'Gêmeos',
  cancer: 'Câncer',
  leo: 'Leão',
  virgo: 'Virgem',
  libra: 'Libra',
  scorpio: 'Escorpião',
  sagittarius: 'Sagitário',
  capricorn: 'Capricórnio',
  aquarius: 'Aquário',
  pisces: 'Peixes'
}

const WEEKDAY_NAMES: Record<string, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo'
}

export default function PredictionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const now = new Date()
  const week = getISOWeek(now)
  const year = getISOWeekYear(now)

  const [sign, setSign] = useState<string>('aries')
  const [weekday, setWeekday] = useState<string>('monday')
  const [isoWeek, setIsoWeek] = useState(week)
  const [isoYear, setIsoYear] = useState(year)
  const [dailyPrediction, setDailyPrediction] = useState<any>(null)
  const [weeklyPrediction, setWeeklyPrediction] = useState<any>(null)
  const [allPredictions, setAllPredictions] = useState<any[]>([])
  const [showAll, setShowAll] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const fetchPredictions = async () => {
    setLoading(true)
    setError('')
    try {
      const [dailyRes, weeklyRes] = await Promise.all([
        fetch(`/api/predictions/daily?sign=${sign}&weekday=${weekday}&isoWeek=${isoWeek}&isoYear=${isoYear}`),
        fetch(`/api/predictions/weekly?sign=${sign}&isoWeek=${isoWeek}&isoYear=${isoYear}`)
      ])

      if (dailyRes.ok) {
        const daily = await dailyRes.json()
        setDailyPrediction(daily)
      } else {
        setDailyPrediction(null)
      }

      if (weeklyRes.ok) {
        const weekly = await weeklyRes.json()
        setWeeklyPrediction(weekly)
      } else {
        setWeeklyPrediction(null)
      }
    } catch (err) {
      setError('Erro ao buscar previsões')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllPredictions = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/predictions/all?weekday=${weekday}&isoWeek=${isoWeek}&isoYear=${isoYear}`)
      if (res.ok) {
        const data = await res.json()
        setAllPredictions(data)
        setShowAll(true)
      } else {
        setError('Erro ao buscar todas as previsões')
      }
    } catch (err) {
      setError('Erro ao buscar previsões')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchPredictions()
    }
  }, [sign, weekday, isoWeek, isoYear, session])

  if (status === 'loading') {
    return <div className="loading">Carregando...</div>
  }

  if (!session) return null

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Previsões</h1>

        <div className="card" style={{ marginBottom: '1rem' }}>
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
          <button
            onClick={fetchPredictions}
            className="btn btn-primary"
            disabled={loading}
          >
            Buscar
          </button>
          <button
            onClick={fetchAllPredictions}
            className="btn btn-secondary"
            style={{ marginLeft: '0.5rem' }}
            disabled={loading}
          >
            Ver Todos os Signos
          </button>
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {loading && (
          <div className="loading">Carregando...</div>
        )}

        {!showAll && !loading && (
          <>
            {dailyPrediction && (
              <div className="card">
                <h2>Previsão Diária - {SIGN_NAMES[sign]} - {WEEKDAY_NAMES[weekday]}</h2>
                <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
                  {dailyPrediction.text}
                </p>
                <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                  Número da Sorte: {dailyPrediction.luckyNumber}
                </p>
              </div>
            )}

            {weeklyPrediction && (
              <div className="card">
                <h2>Previsão Semanal - {SIGN_NAMES[sign]}</h2>
                <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
                  {weeklyPrediction.text}
                </p>
                <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                  Número da Sorte: {weeklyPrediction.luckyNumber}
                </p>
              </div>
            )}

            {!dailyPrediction && !weeklyPrediction && !loading && (
              <div className="alert alert-info">
                Nenhuma previsão encontrada para os filtros selecionados.
              </div>
            )}
          </>
        )}

        {showAll && !loading && (
          <div>
            <button
              onClick={() => setShowAll(false)}
              className="btn btn-secondary"
              style={{ marginBottom: '1rem' }}
            >
              Voltar
            </button>
            <div className="grid grid-3">
              {allPredictions.map((item) => (
                <div key={item.sign} className="card">
                  <h3>{SIGN_NAMES[item.sign]}</h3>
                  {item.daily && (
                    <div style={{ marginTop: '1rem' }}>
                      <strong>Diária:</strong>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        {item.daily.text}
                      </p>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        Sorte: {item.daily.luckyNumber}
                      </p>
                    </div>
                  )}
                  {item.weekly && (
                    <div style={{ marginTop: '1rem' }}>
                      <strong>Semanal:</strong>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        {item.weekly.text}
                      </p>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        Sorte: {item.weekly.luckyNumber}
                      </p>
                    </div>
                  )}
                  {!item.daily && !item.weekly && (
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>
                      Sem previsões disponíveis
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

