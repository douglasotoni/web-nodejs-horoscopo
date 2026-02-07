import { NextRequest, NextResponse } from 'next/server'
import { getMoonPhaseInfo, getMoonAgeDays } from '@/lib/moon'
import { improveMoonPhaseTexts } from '@/lib/openrouter'
import type { MoonPhaseId } from '@/lib/moon'

/** Cache em memória: textos melhorados por IA por fase (evita chamar a API a cada request). */
const moonPhaseTextCache = new Map<MoonPhaseId, { mystical: string; advice: string }>()

/**
 * GET /api/moon/phase
 * Retorna a fase da lua do dia selecionado com informações místicas e conselhos.
 * Se OPENROUTER_API_KEY estiver definida, "Energia e simbolismo" e "Conselho" podem ser melhorados pela IA (cache por fase).
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

  let mystical = phase.mystical
  let advice = phase.advice

  const cached = moonPhaseTextCache.get(phase.phaseId)
  if (cached) {
    mystical = cached.mystical
    advice = cached.advice
  } else {
    const improved = await improveMoonPhaseTexts(phase.phaseName, phase.mystical, phase.advice)
    if (improved) {
      mystical = improved.mystical
      advice = improved.advice
      moonPhaseTextCache.set(phase.phaseId, { mystical, advice })
      if (process.env.NODE_ENV === 'development') {
        console.log('[OpenRouter] Textos da fase da lua melhorados:', phase.phaseId)
      }
    }
  }

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
      mystical,
      advice,
      keywords: phase.keywords
    }
  })
}
