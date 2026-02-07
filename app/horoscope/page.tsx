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
              {list.map((item: DailyPrediction | WeeklyPrediction) => {
                const daily = mode === 'daily' ? (item as DailyPrediction) : null
                const hasDailyExtras = daily && (daily.loveAdvice || daily.careerAdvice || daily.practicalAdvice || daily.crystal || daily.mantra || daily.impactPhrase || daily.energyLevel != null || daily.luckyColor)
                const energyLevel = daily?.energyLevel != null ? Math.min(10, Math.max(1, daily.energyLevel)) : 0
                const colorMap: Record<string, string> = {
                  vermelho: '#dc2626', laranja: '#ea580c', amarelo: '#ca8a04', verde: '#16a34a',
                  azul: '#2563eb', roxo: '#7c3aed', rosa: '#db2777', preto: '#1f2937',
                  branco: '#f5f5f5', dourado: '#d97706', prata: '#9ca3af', coral: '#f97316'
                }
                const luckyColorHex = daily?.luckyColor
                  ? (colorMap[daily.luckyColor.toLowerCase().trim()] ?? '#8b5cf6')
                  : null

                return (
                  <article
                    key={`${item.sign}-${(item as DailyPrediction).weekday ?? (item as WeeklyPrediction).isoWeek}`}
                    className={styles.card}
                  >
                    <header className={styles.cardHeader}>
                      <div className={styles.cardHeaderTop}>
                        <div className={styles.cardSymbolWrap}>
                          <span className={styles.cardSymbol}>
                            {SIGNS.find(s => s.id === item.sign)?.symbol ?? '☆'}
                          </span>
                        </div>
                        <div className={styles.cardTitleWrap}>
                          <h2 className={styles.cardTitle}>{signName(item.sign)}</h2>
                          {daily?.element != null || daily?.rulingPlanet != null ? (
                            <div className={styles.cardMeta}>
                              {daily.element != null && daily.element !== '' && (
                                <span className={styles.cardMetaPill}>{daily.element}</span>
                              )}
                              {daily.rulingPlanet != null && daily.rulingPlanet !== '' && (
                                <span className={styles.cardMetaPill}>{daily.rulingPlanet}</span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className={styles.cardLuckyWrap} title="Número da sorte">
                        {item.luckyNumber}
                      </div>
                    </header>

                    <div className={styles.cardBody}>
                      <p className={styles.cardLead}>{item.text}</p>

                      {hasDailyExtras && (
                        <>
                          <div className={styles.cardDivider} aria-hidden />

                          {(energyLevel > 0 || daily?.luckyColor || daily?.crystal) && (
                            <div className={styles.cardQuickRow}>
                              {energyLevel > 0 && (
                                <div className={styles.cardQuickItem}>
                                  <span className={styles.cardQuickLabel}>Energia</span>
                                  <div className={styles.cardEnergyBar}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                      <span
                                        key={n}
                                        className={`${styles.cardEnergyDot} ${n <= energyLevel ? styles.cardEnergyDotFilled : ''}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                              {daily?.luckyColor && (
                                <div className={styles.cardQuickItem}>
                                  <span
                                    className={styles.cardColorSwatch}
                                    style={{ backgroundColor: luckyColorHex ?? undefined }}
                                    title={daily.luckyColor}
                                  />
                                  <span>{daily.luckyColor}</span>
                                </div>
                              )}
                              {daily?.crystal && (
                                <div className={styles.cardQuickItem}>
                                  <span className={styles.cardQuickLabel}>Cristal</span>
                                  <span>{(daily as DailyPrediction).crystal}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {daily?.loveAdvice && (
                            <div className={styles.cardBlock}>
                              <div className={styles.cardBlockLabel}>
                                <span className={styles.cardBlockLabelIcon}>♥</span>
                                Amor
                              </div>
                              <p className={styles.cardBlockText}>{daily.loveAdvice}</p>
                            </div>
                          )}
                          {daily?.careerAdvice && (
                            <div className={styles.cardBlock}>
                              <div className={styles.cardBlockLabel}>
                                <span className={styles.cardBlockLabelIcon}>◆</span>
                                Carreira
                              </div>
                              <p className={styles.cardBlockText}>{daily.careerAdvice}</p>
                            </div>
                          )}
                          {daily?.practicalAdvice && (
                            <div className={styles.cardBlock}>
                              <div className={styles.cardBlockLabel}>
                                <span className={styles.cardBlockLabelIcon}>✦</span>
                                Conselho prático
                              </div>
                              <p className={styles.cardBlockText}>{daily.practicalAdvice}</p>
                            </div>
                          )}

                          {daily?.mantra && (
                            <div className={styles.cardMantraWrap}>
                              <p className={styles.cardMantra}>{daily.mantra}</p>
                            </div>
                          )}

                          {daily?.impactPhrase && (
                            <div className={styles.cardImpactWrap}>
                              <p className={styles.cardImpact}>{daily.impactPhrase}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </article>
                )
              })}
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
