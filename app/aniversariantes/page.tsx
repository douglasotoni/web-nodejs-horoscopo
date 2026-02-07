'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getSignFromDayMonth } from '@/lib/zodiac-date'
import styles from './aniversariantes.module.css'

const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
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
      const res = await fetch(`/api/sertanejo/aniversariantes?date=${dateStr}`)
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

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Aniversariantes do mês</h1>
        <nav className={styles.headerLinks}>
          <Link href="/" className={styles.headerLink}>
            API / Docs
          </Link>
          <Link href="/horoscope" className={styles.headerLink}>
            Horóscopo
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.monthWrap}>
          <label htmlFor="mes" className={styles.monthLabel}>
            Selecione o mês
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

        {error && <div className={styles.error}>{error}</div>}

        {loading && <p className={styles.loading}>Carregando…</p>}

        {!loading && data && (
          <>
            <p className={styles.resume}>
              <strong>{data.mesNome}</strong> — {data.total} artista{data.total !== 1 ? 's' : ''} aniversariante{data.total !== 1 ? 's' : ''} no mês.
            </p>
            {data.aniversariantes.length === 0 ? (
              <p className={styles.empty}>Nenhum aniversariante encontrado para este mês.</p>
            ) : (
              <ul className={styles.list}>
                {data.aniversariantes.map((a) => {
                  const sign = getSignFromDayMonth(a.dia, a.mes)
                  return (
                    <li key={`${a.nome}-${a.dia}-${a.mes}`} className={styles.card}>
                      <span className={styles.cardDate}>{a.dataFormatada}</span>
                      <span className={styles.cardName}>{a.nome}</span>
                      <span className={styles.cardSign} title={sign.name}>
                        {sign.symbol} {sign.name}
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
