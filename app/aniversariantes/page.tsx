'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/app/components/PageHeader'
import { getSignFromDayMonth } from '@/lib/zodiac-date'
import styles from './aniversariantes.module.css'

const MESES = [
  { value: 1, label: 'Janeiro', short: 'Jan' },
  { value: 2, label: 'Fevereiro', short: 'Fev' },
  { value: 3, label: 'Março', short: 'Mar' },
  { value: 4, label: 'Abril', short: 'Abr' },
  { value: 5, label: 'Maio', short: 'Mai' },
  { value: 6, label: 'Junho', short: 'Jun' },
  { value: 7, label: 'Julho', short: 'Jul' },
  { value: 8, label: 'Agosto', short: 'Ago' },
  { value: 9, label: 'Setembro', short: 'Set' },
  { value: 10, label: 'Outubro', short: 'Out' },
  { value: 11, label: 'Novembro', short: 'Nov' },
  { value: 12, label: 'Dezembro', short: 'Dez' }
]

interface Aniversariante {
  nome: string
  dia: number
  mes: number
  dataFormatada: string
}

interface ApiResponse {
  mes: number
  mesNome: string
  aniversariantes: Aniversariante[]
  total: number
}

export default function AniversariantesPage() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano] = useState(hoje.getFullYear())
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAniversariantes = useCallback(async () => {
    setLoading(true)
    setError(null)
    const dateStr = `${ano}-${String(mes).padStart(2, '0')}-01`
    try {
      const res = await fetch(`/api/famosos/aniversariantes?date=${dateStr}`)
      if (!res.ok) throw new Error('Falha ao carregar aniversariantes')
      const json: ApiResponse = await res.json()
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [mes, ano])

  useEffect(() => {
    fetchAniversariantes()
  }, [fetchAniversariantes])

  const monthShort = (m: number) => MESES.find(x => x.value === m)?.short ?? ''

  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden />
      <div className={styles.bgPattern} aria-hidden />

      <PageHeader
        title="Aniversariantes do mês"
        subtitle="Cantores e artistas que fazem aniversário — com signo"
        links={[
          { href: '/horoscope', label: 'Horóscopo' },
          { href: '/api', label: 'Documentação da API' }
        ]}
      />

      <main className={styles.main}>
        <div className={styles.controlsCard}>
          <div className={styles.monthWrap}>
            <label htmlFor="mes" className={styles.monthLabel}>
              Escolha o mês
            </label>
            <select
              id="mes"
              className={styles.monthSelect}
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
            >
              {MESES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading && (
          <div className={styles.loading}>
            <div className={styles.loadingDots}>
              <span />
              <span />
              <span />
            </div>
            <p>Carregando aniversariantes…</p>
          </div>
        )}

        {!loading && data && (
          <>
            <div className={styles.resume}>
              <span className={styles.resumeEmoji} aria-hidden>🎂</span>
              <p className={styles.resumeText}>
                <strong>{data.mesNome}</strong>
                {' — '}
                {data.total} artista{data.total !== 1 ? 's' : ''} aniversariante{data.total !== 1 ? 's' : ''} no mês
              </p>
              <span className={styles.resumeCount}>{data.total}</span>
            </div>
            {data.aniversariantes.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyEmoji} aria-hidden>📅</span>
                Nenhum aniversariante encontrado para este mês.
              </div>
            ) : (
              <ul className={styles.list}>
                {data.aniversariantes.map((a) => {
                  const sign = getSignFromDayMonth(a.dia, a.mes)
                  return (
                    <li key={`${a.nome}-${a.dia}-${a.mes}`} className={styles.card}>
                      <div className={styles.cardDate}>
                        <span className={styles.cardDateInner}>
                          <span className={styles.cardDateDay}>{a.dia}</span>
                          <span className={styles.cardDateMonth}>{monthShort(a.mes)}</span>
                        </span>
                      </div>
                      <div className={styles.cardBody}>
                        <span className={styles.cardName}>{a.nome}</span>
                      </div>
                      <span className={styles.cardSign} title={sign.name}>
                        <span className={styles.cardSignSymbol}>{sign.symbol}</span>
                        {sign.name}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  )
}
