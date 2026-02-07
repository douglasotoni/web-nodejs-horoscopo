import { NextRequest, NextResponse } from 'next/server'
import { getMoonPhaseInfo, getMoonAgeDays } from '@/lib/moon'

/**
 * GET /api/moon/phase
 * Retorna a fase da lua do dia selecionado com informações místicas e conselhos.
 * Query: date (opcional) YYYY-MM-DD — se omitido, usa a data de hoje.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dateParam = searchParams.get('date')

  let date: Date
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const [y, m, d] = dateParam.split('-').map(Number)
    date = new Date(y, m - 1, d)
    if (isNaN(date.getTime())) {
      date = new Date()
    }
  } else {
    date = new Date()
  }

  const ageDays = getMoonAgeDays(date)
  const phase = getMoonPhaseInfo(date)

  return NextResponse.json({
    date: date.toISOString().slice(0, 10),
    dateFormatted: date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    moonAgeDays: Math.round(ageDays * 100) / 100,
    phase: {
      id: phase.phaseId,
      name: phase.phaseName,
      nameShort: phase.phaseNameShort,
      emoji: phase.emoji,
      description: phase.description,
      mystical: phase.mystical,
      advice: phase.advice,
      keywords: phase.keywords
    }
  })
}
