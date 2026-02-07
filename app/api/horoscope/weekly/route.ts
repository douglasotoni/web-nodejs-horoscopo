import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseDateToContext } from '@/lib/utils'
import { generateWeeklyPrediction } from '@/lib/generator'
import { improveHoroscopeText } from '@/lib/openrouter'
import type { Sign } from '@prisma/client'

const SIGNS: Sign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']

const TONE_VALUES = ['bem_humorada', 'vibe_sertaneja', 'resumida'] as const

const querySchema = z.object({
  sign: z.enum(['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']).optional(),
  date: z.string().optional(), // YYYY-MM-DD; se omitido = dia corrente (semana da data)
  regenerate: z.enum(['1', 'true']).optional(),
  tone: z.enum(TONE_VALUES).optional()
})

async function getOrCreateWeeklyPrediction(
  sign: Sign,
  isoWeek: number,
  isoYear: number,
  weekLabel: string,
  forceRegenerate: boolean,
  tone: string | null
) {
  const existing = await prisma.weeklyPrediction.findUnique({
    where: {
      sign_isoWeek_isoYear: { sign, isoWeek, isoYear }
    }
  })

  if (!forceRegenerate && existing && existing.status === 'published') {
    return existing
  }

  const generated = generateWeeklyPrediction({ sign, isoWeek, isoYear })
  const improvedText = await improveHoroscopeText(
    generated.text,
    sign,
    weekLabel,
    tone,
    'weekly'
  )
  const finalText = (improvedText && improvedText.trim() !== '') ? improvedText.trim() : generated.text

  const data = {
    text: finalText,
    luckyNumber: generated.luckyNumber,
    status: 'published' as const
  }

  const prediction = await prisma.weeklyPrediction.upsert({
    where: {
      sign_isoWeek_isoYear: { sign, isoWeek, isoYear }
    },
    create: {
      sign,
      isoWeek,
      isoYear,
      ...data
    },
    update: data
  })

  return prediction
}

/**
 * GET /api/horoscope/weekly
 * Parâmetros: sign (opcional), date (opcional, YYYY-MM-DD).
 * Sem sign = todos os signos. Sem date = semana do dia corrente.
 * Se não existir previsão, gera e persiste antes de retornar.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const validated = querySchema.parse({
      sign: searchParams.get('sign') || undefined,
      date: searchParams.get('date') || undefined,
      regenerate: searchParams.get('regenerate') || undefined,
      tone: searchParams.get('tone') || undefined
    })

    const forceRegenerate = validated.regenerate === '1' || validated.regenerate === 'true'
    const tone = validated.tone ?? null
    const { isoWeek, isoYear } = parseDateToContext(validated.date ?? null)
    const weekLabel = `semana ${isoWeek}/${isoYear}`

    if (validated.sign) {
      const prediction = await getOrCreateWeeklyPrediction(
        validated.sign,
        isoWeek,
        isoYear,
        weekLabel,
        forceRegenerate,
        tone
      )
      return NextResponse.json(prediction)
    }

    const predictions = await Promise.all(
      SIGNS.map(sign =>
        getOrCreateWeeklyPrediction(sign, isoWeek, isoYear, weekLabel, forceRegenerate, tone)
      )
    )

    return NextResponse.json(predictions)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error fetching/generating weekly prediction:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar ou gerar previsão semanal' },
      { status: 500 }
    )
  }
}
