'use client'

import { useState, useCallback, useMemo } from 'react'
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

const SIGN_IDS = SIGNS.map(s => s.id)

type SignId = (typeof SIGNS)[number]['id']

/** Cor representativa de cada signo (primeira cor da sorte do signo) → hex */
const SIGN_COLOR_HEX: Record<SignId, string> = {
  aries: '#dc2626',
  taurus: '#16a34a',
  gemini: '#ca8a04',
  cancer: '#9ca3af',
  leo: '#d97706',
  virgo: '#78350f',
  libra: '#db2777',
  scorpio: '#7f1d1d',
  sagittarius: '#7c3aed',
  capricorn: '#1f2937',
  aquarius: '#2563eb',
  pisces: '#06b6d4'
}

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

type CombinedItem = {
  sign: string
  daily: DailyPrediction
  weekly: WeeklyPrediction
}

function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

// Gera estrelas com posição e efeito aleatórios pela página (uma vez por carregamento)
function useStarPositions(count: number) {
  return useMemo(() => {
    const list: {
      left: number
      top: number
      size: 'small' | 'medium' | 'large'
      delay: number
      duration: number
      opacityMin: number
    }[] = []
    for (let i = 0; i < count; i++) {
      list.push({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large',
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 3,
        opacityMin: 0.2 + Math.random() * 0.35
      })
    }
    return list
  }, [count])
}

export default function HoroscopePage() {
  const [date, setDate] = useState(todayISO())
  const [selectedSign, setSelectedSign] = useState<SignId | 'all'>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dailyData, setDailyData] = useState<DailyPrediction | DailyPrediction[] | null>(null)
  const [weeklyData, setWeeklyData] = useState<WeeklyPrediction | WeeklyPrediction[] | null>(null)
  const [aniversariantes, setAniversariantes] = useState<{ mesNome: string; aniversariantes: { nome: string; dia: number; dataFormatada: string }[] } | null>(null)
  const [moonPhase, setMoonPhase] = useState<{
    date: string
    dateFormatted: string
    moonAgeDays: number
    phase: { id: string; name: string; nameShort: string; emoji: string; description: string; mystical: string; advice: string; keywords: string[] }
  } | null>(null)

  const stars = useStarPositions(85)

  const fetchData = useCallback(async () => {
    setError(null)
    setLoading(true)
    const params = new URLSearchParams()
    if (date) params.set('date', date)
    if (selectedSign !== 'all') params.set('sign', selectedSign)
    const dateParam = date || new Date().toISOString().slice(0, 10)

    try {
      const [dailyRes, weeklyRes, anivRes, moonRes] = await Promise.all([
        fetch(`/api/horoscope/daily?${params}`),
        fetch(`/api/horoscope/weekly?${params}`),
        fetch(`/api/sertanejo/aniversariantes?date=${dateParam}`),
        fetch(`/api/moon/phase?date=${dateParam}`)
      ])
      if (!dailyRes.ok) throw new Error(await dailyRes.text())
      if (!weeklyRes.ok) throw new Error(await weeklyRes.text())
      const daily = await dailyRes.json()
      const weekly = await weeklyRes.json()
      setDailyData(daily)
      setWeeklyData(weekly)
      if (anivRes.ok) {
        const aniv = await anivRes.json()
        setAniversariantes({ mesNome: aniv.mesNome, aniversariantes: aniv.aniversariantes })
      } else {
        setAniversariantes(null)
      }
      if (moonRes.ok) {
        const moon = await moonRes.json()
        setMoonPhase(moon)
      } else {
        setMoonPhase(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar previsões')
      setDailyData(null)
      setWeeklyData(null)
      setAniversariantes(null)
      setMoonPhase(null)
    } finally {
      setLoading(false)
    }
  }, [date, selectedSign])

  const combinedList: CombinedItem[] = useMemo(() => {
    if (dailyData == null || weeklyData == null) return []
    const dailyList = Array.isArray(dailyData) ? dailyData : [dailyData]
    const weeklyList = Array.isArray(weeklyData) ? weeklyData : [weeklyData]
    const bySign = (arr: (DailyPrediction | WeeklyPrediction)[], sign: string) =>
      arr.find(p => p.sign === sign)
    return SIGN_IDS.map(sign => {
      const daily = bySign(dailyList, sign) as DailyPrediction | undefined
      const weekly = bySign(weeklyList, sign) as WeeklyPrediction | undefined
      if (daily && weekly) return { sign, daily, weekly }
      return null
    }).filter((x): x is CombinedItem => x !== null)
  }, [dailyData, weeklyData])

  const signName = (signId: string) => SIGNS.find(s => s.id === signId)?.name ?? signId

  return (
    <div className={styles.page}>
      {/* Fundo espacial */}
      <div className={styles.spaceBg} aria-hidden>
        <div className={styles.nebulaBase} />
        <div className={styles.nebula + ' ' + styles.nebula1} />
        <div className={styles.nebula + ' ' + styles.nebula2} />
        <div className={styles.nebula + ' ' + styles.nebula3} />
        <div className={styles.nebula + ' ' + styles.nebula4} />
        <div className={styles.nebula + ' ' + styles.nebula5} />
        <div className={styles.nebula6} />
        <div className={styles.starsLayer}>
          {stars.map((s, i) => (
            <span
              key={i}
              className={`${styles.star} ${s.size === 'large' ? styles.starLarge : s.size === 'medium' ? styles.starMedium : styles.starSmall}`}
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
                ['--star-opacity-min' as string]: s.opacityMin
              }}
            />
          ))}
        </div>
      </div>

      <div className={styles.pageContent}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <h1 className={styles.title}>Horóscopo</h1>
            <p className={styles.subtitle}>Previsão do dia e da semana sob as estrelas</p>
            <a href="/aniversariantes" className={styles.apiLink}>Aniversariantes</a>
            <a href="/" className={styles.apiLink}>Documentação da API</a>
          </div>
        </header>

        <main className={styles.main}>
          <section className={styles.controls}>
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

          {combinedList.length > 0 && !error && (
            <section className={styles.results}>
              <p className={styles.resultsMeta}>
                Previsão do dia e da semana — {date && formatDateBR(date)}
                {selectedSign !== 'all' && ` — ${signName(selectedSign)}`}
              </p>

              <div className={styles.cards}>
                {combinedList.map(({ sign, daily, weekly }) => {
                  const hasDailyExtras = !!(daily.loveAdvice || daily.careerAdvice || daily.practicalAdvice || daily.crystal || daily.compatibleSigns || daily.mantra || daily.impactPhrase || daily.energyLevel != null || daily.luckyColor)
                  const energyLevel = daily.energyLevel != null ? Math.min(10, Math.max(1, daily.energyLevel)) : 0
                  const colorMap: Record<string, string> = {
                    vermelho: '#dc2626', laranja: '#ea580c', amarelo: '#ca8a04', verde: '#16a34a',
                    azul: '#2563eb', roxo: '#7c3aed', rosa: '#db2777', preto: '#1f2937',
                    branco: '#f5f5f5', dourado: '#d97706', prata: '#9ca3af', coral: '#f97316'
                  }
                  const luckyColorHex = daily.luckyColor
                    ? (colorMap[daily.luckyColor.toLowerCase().trim()] ?? '#8b5cf6')
                    : null

                  return (
                    <article
                      key={sign}
                      className={styles.card}
                    >
                      <header className={styles.cardHeader}>
                        <div className={styles.cardHeaderTop}>
                          <div className={styles.cardSymbolWrap}>
                            <span className={styles.cardSymbol}>
                              {SIGNS.find(s => s.id === sign)?.symbol ?? '☆'}
                            </span>
                          </div>
                          <div className={styles.cardTitleWrap}>
                            <h2 className={styles.cardTitle}>{signName(sign)}</h2>
                            {(daily.element != null && daily.element !== '') || (daily.rulingPlanet != null && daily.rulingPlanet !== '') ? (
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
                      </header>

                      <div className={styles.cardBody}>
                        <p className={styles.cardSectionTitle}>Previsão do dia</p>
                        <p className={styles.cardLead}>{daily.text}</p>

                        {hasDailyExtras && (
                          <>
                            <div className={styles.cardDivider} aria-hidden />

                            {(energyLevel > 0 || daily.luckyColor || daily.crystal) && (
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
                                {daily.luckyColor && (
                                  <div className={styles.cardQuickItem}>
                                    <span
                                      className={styles.cardColorSwatch}
                                      style={{ backgroundColor: SIGN_COLOR_HEX[sign as SignId] ?? luckyColorHex ?? '#8b5cf6' }}
                                      aria-hidden
                                    />
                                    <span>{daily.luckyColor}</span>
                                  </div>
                                )}
                                {daily.crystal && (
                                  <div className={styles.cardQuickItem}>
                                    <span className={styles.cardQuickLabel}>Cristal</span>
                                    <span>{daily.crystal}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {daily.loveAdvice && (
                              <div className={styles.cardBlock}>
                                <div className={styles.cardBlockLabel}>
                                  <span className={styles.cardBlockLabelIcon}>♥</span>
                                  Amor
                                </div>
                                <p className={styles.cardBlockText}>{daily.loveAdvice}</p>
                              </div>
                            )}
                            {daily.careerAdvice && (
                              <div className={styles.cardBlock}>
                                <div className={styles.cardBlockLabel}>
                                  <span className={styles.cardBlockLabelIcon}>◆</span>
                                  Carreira
                                </div>
                                <p className={styles.cardBlockText}>{daily.careerAdvice}</p>
                              </div>
                            )}
                            {daily.practicalAdvice && (
                              <div className={styles.cardBlock}>
                                <div className={styles.cardBlockLabel}>
                                  <span className={styles.cardBlockLabelIcon}>✦</span>
                                  Conselho prático
                                </div>
                                <p className={styles.cardBlockText}>{daily.practicalAdvice}</p>
                              </div>
                            )}

                            {daily.compatibleSigns && (() => {
                              const names = daily.compatibleSigns.replace(/^Signos compatíveis:\s*/i, '').split(',').map(s => s.trim()).filter(Boolean)
                              return (
                                <div className={styles.cardBlock}>
                                  <div className={styles.cardBlockLabel}>
                                    <span className={styles.cardBlockLabelIcon}>♡</span>
                                    Signos compatíveis
                                  </div>
                                  <div className={styles.compatibleSignsList}>
                                    {names.map((signNameStr) => {
                                      const signInfo = SIGNS.find(s => s.name === signNameStr)
                                      const hex = signInfo ? SIGN_COLOR_HEX[signInfo.id] : '#8b5cf6'
                                      return (
                                        <span key={signNameStr} className={styles.compatibleSignItem} title={signNameStr}>
                                          <span className={styles.compatibleSignSwatch} style={{ backgroundColor: hex }} />
                                          <span>{signNameStr}</span>
                                        </span>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })()}

                            {daily.mantra && (
                              <div className={styles.cardMantraWrap}>
                                <div className={styles.cardBlockLabel}>
                                  <span className={styles.cardBlockLabelIcon}>◐</span>
                                  Mantra
                                </div>
                                <p className={styles.cardMantra}>{daily.mantra}</p>
                              </div>
                            )}

                            {daily.impactPhrase && (
                              <div className={styles.cardImpactWrap}>
                                <div className={styles.cardBlockLabel}>
                                  <span className={styles.cardBlockLabelIcon}>✦</span>
                                  Frase de impacto
                                </div>
                                <p className={styles.cardImpact}>{daily.impactPhrase}</p>
                              </div>
                            )}
                          </>
                        )}

                        <div className={styles.cardSectionWeekly}>
                          <p className={styles.cardSectionTitle}>Previsão da semana</p>
                          <p className={styles.cardWeeklyText}>{weekly.text}</p>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              {moonPhase && (
                <div className={styles.moonPhaseBox}>
                  <h3 className={styles.moonPhaseTitle}>
                    <span className={styles.moonPhaseEmoji} aria-hidden>{moonPhase.phase.emoji}</span>
                    Fase da Lua — {moonPhase.phase.name}
                  </h3>
                  <p className={styles.moonPhaseDate}>{moonPhase.dateFormatted}</p>
                  <p className={styles.moonPhaseDesc}>{moonPhase.phase.description}</p>
                  <div className={styles.moonPhaseBlock}>
                    <span className={styles.moonPhaseLabel}>Energia e simbolismo</span>
                    <p className={styles.moonPhaseText}>{moonPhase.phase.mystical}</p>
                  </div>
                  <div className={styles.moonPhaseBlock}>
                    <span className={styles.moonPhaseLabel}>Conselho</span>
                    <p className={styles.moonPhaseText}>{moonPhase.phase.advice}</p>
                  </div>
                  {moonPhase.phase.keywords.length > 0 && (
                    <div className={styles.moonPhaseKeywords}>
                      {moonPhase.phase.keywords.map((kw, i) => (
                        <span key={i} className={styles.moonPhaseKeyword}>{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {aniversariantes && (
                <div className={styles.aniversariantesBox}>
                  <h3 className={styles.aniversariantesTitle}>
                    Aniversariantes do mês — {aniversariantes.mesNome}
                  </h3>
                  <p className={styles.aniversariantesSubtitle}>
                    Cantores sertanejos famosos que fazem aniversário em {aniversariantes.mesNome} ({aniversariantes.aniversariantes.length})
                  </p>
                  <ul className={styles.aniversariantesList}>
                    {aniversariantes.aniversariantes.slice(0, 50).map((a, i) => (
                      <li key={i} className={styles.aniversariantesItem}>
                        <span className={styles.aniversariantesData}>{a.dataFormatada}</span>
                        <span className={styles.aniversariantesNome}>{a.nome}</span>
                      </li>
                    ))}
                  </ul>
                  {aniversariantes.aniversariantes.length > 50 && (
                    <p className={styles.aniversariantesMore}>
                      + {aniversariantes.aniversariantes.length - 50} aniversariantes no mês
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {combinedList.length === 0 && !loading && !error && (
            <p className={styles.hint}>Escolha a data e o signo e clique em &quot;Ver previsão&quot; para ver o dia e a semana juntos.</p>
          )}
        </main>
      </div>
    </div>
  )
}
