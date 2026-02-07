'use client'

import { useState, useCallback } from 'react'
import styles from './horoscope.module.css'

const SIGNS = [
  { id: 'aries', name: 'Áries', symbol: '♈' },
  { id: 'taurus', name: 'Touro', symbol: '♉' },
  { id: 'gemini', name: 'Gêmeos', symbol: '♊' },
  { id: 'cancer', name: 'Câncer', symbol: '♋' },
  { id: 'leo', name: 'Leão', symbol: '♌' },
  { id: 'virgo', name: 'Virgem', symbol: '♍' },
  { id: 'libra', name: 'Libra', symbol: '♎' },
  { id: 'scorpio', name: 'Escorpião', symbol: '♏' },
  { id: 'sagittarius', name: 'Sagitário', symbol: '♐' },
  { id: 'capricorn', name: 'Capricórnio', symbol: '♑' },
  { id: 'aquarius', name: 'Aquário', symbol: '♒' },
  { id: 'pisces', name: 'Peixes', symbol: '♓' }
] as const

type SignId = (typeof SIGNS)[number]['id']

interface DailyPrediction {
  id: number
  sign: string
  weekday?: string
  isoWeek: number
  isoYear: number
  text: string
  luckyNumber: number
  element?: string | null
  quality?: string | null
  rulingPlanet?: string | null
  luckyColor?: string | null
  emotion?: string | null
  practicalAdvice?: string | null
  compatibleSigns?: string | null
  impactPhrase?: string | null
  recommendedActivities?: string | null
  dailyAlert?: string | null
  energyLevel?: number | null
  crystal?: string | null
  mantra?: string | null
  loveAdvice?: string | null
  careerAdvice?: string | null
}

interface WeeklyPrediction {
  id: number
  sign: string
  isoWeek: number
  isoYear: number
  text: string
  luckyNumber: number
}

function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function HoroscopePage() {
  const [mode, setMode] = useState<'daily' | 'weekly'>('daily')
  const [date, setDate] = useState(todayISO())
  const [selectedSign, setSelectedSign] = useState<SignId | 'all'>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dailyData, setDailyData] = useState<DailyPrediction | DailyPrediction[] | null>(null)
  const [weeklyData, setWeeklyData] = useState<WeeklyPrediction | WeeklyPrediction[] | null>(null)

  const fetchData = useCallback(async () => {
    setError(null)
    setLoading(true)
    const params = new URLSearchParams()
    if (date) params.set('date', date)
    if (selectedSign !== 'all') params.set('sign', selectedSign)

    try {
      if (mode === 'daily') {
        const res = await fetch(`/api/horoscope/daily?${params}`)
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setDailyData(data)
        setWeeklyData(null)
      } else {
        const res = await fetch(`/api/horoscope/weekly?${params}`)
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setWeeklyData(data)
        setDailyData(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar previsões')
      setDailyData(null)
      setWeeklyData(null)
    } finally {
      setLoading(false)
    }
  }, [mode, date, selectedSign])

  const predictions = mode === 'daily' ? dailyData : weeklyData
  const isArray = Array.isArray(predictions)
  const list = isArray ? predictions : predictions ? [predictions] : []

  const signName = (signId: string) => SIGNS.find(s => s.id === signId)?.name ?? signId

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>Horóscopo</h1>
          <p className={styles.subtitle}>Previsões do dia e da semana</p>
          <a href="/" className={styles.apiLink}>Documentação da API</a>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.controls}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={mode === 'daily' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={() => setMode('daily')}
            >
              Previsão do dia
            </button>
            <button
              type="button"
              className={mode === 'weekly' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={() => setMode('weekly')}
            >
              Previsão da semana
            </button>
          </div>

          <div className={styles.filters}>
            <div className={styles.field}>
              <label htmlFor="horoscope-date" className={styles.fieldLabel}>Data</label>
              <input
                id="horoscope-date"
                type="date"
                className={styles.dateInput}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Signo</span>
              <div className={styles.signs}>
                <button
                  type="button"
                  className={selectedSign === 'all' ? `${styles.signBtn} ${styles.signBtnActive}` : styles.signBtn}
                  onClick={() => setSelectedSign('all')}
                >
                  Todos
                </button>
                {SIGNS.map(({ id, name, symbol }) => (
                  <button
                    key={id}
                    type="button"
                    className={selectedSign === id ? `${styles.signBtn} ${styles.signBtnActive}` : styles.signBtn}
                    onClick={() => setSelectedSign(id)}
                    title={name}
                  >
                    <span className={styles.signSymbol}>{symbol}</span>
                    <span className={styles.signName}>{name}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              className={styles.submit}
              onClick={fetchData}
              disabled={loading}
            >
              {loading ? 'Carregando…' : 'Ver previsão'}
            </button>
          </div>
        </section>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {predictions !== null && !error && (
          <section className={styles.results}>
            <p className={styles.resultsMeta}>
              {mode === 'daily' ? 'Previsão do dia' : 'Previsão da semana'}
              {date && ` — ${formatDateBR(date)}`}
              {selectedSign !== 'all' && ` — ${signName(selectedSign)}`}
            </p>

            <div className={styles.cards}>
              {list.map((item: DailyPrediction | WeeklyPrediction) => (
                <article
                  key={`${item.sign}-${(item as DailyPrediction).weekday ?? (item as WeeklyPrediction).isoWeek}`}
                  className={styles.card}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.cardSymbol}>
                      {SIGNS.find(s => s.id === item.sign)?.symbol ?? '☆'}
                    </span>
                    <h2 className={styles.cardTitle}>{signName(item.sign)}</h2>
                    <span className={styles.cardLucky}>Nº da sorte: {item.luckyNumber}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardText}>{item.text}</p>
                    {'loveAdvice' in item && (item as DailyPrediction).loveAdvice && (
                      <p className={styles.cardExtra}>
                        <strong className={styles.cardExtraStrong}>Amor:</strong>{(item as DailyPrediction).loveAdvice}
                      </p>
                    )}
                    {'careerAdvice' in item && (item as DailyPrediction).careerAdvice && (
                      <p className={styles.cardExtra}>
                        <strong className={styles.cardExtraStrong}>Carreira:</strong>{(item as DailyPrediction).careerAdvice}
                      </p>
                    )}
                    {'practicalAdvice' in item && (item as DailyPrediction).practicalAdvice && (
                      <p className={styles.cardExtra}>
                        <strong className={styles.cardExtraStrong}>Conselho prático:</strong>{(item as DailyPrediction).practicalAdvice}
                      </p>
                    )}
                    {'crystal' in item && (item as DailyPrediction).crystal && (
                      <p className={styles.cardExtra}>
                        <strong className={styles.cardExtraStrong}>Cristal:</strong>{(item as DailyPrediction).crystal}
                      </p>
                    )}
                    {'mantra' in item && (item as DailyPrediction).mantra && (
                      <p className={styles.cardMantra}>{(item as DailyPrediction).mantra}</p>
                    )}
                    {'impactPhrase' in item && (item as DailyPrediction).impactPhrase && (
                      <p className={styles.cardImpact}>{(item as DailyPrediction).impactPhrase}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {predictions === null && !loading && !error && (
          <p className={styles.hint}>Escolha a data e o signo e clique em &quot;Ver previsão&quot;.</p>
        )}
      </main>
    </div>
  )
}
