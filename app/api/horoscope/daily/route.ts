import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseDateToContext } from '@/lib/utils'
import { generateDailyPrediction } from '@/lib/generator'
import type { Sign, Weekday } from '@prisma/client'

const SIGNS: Sign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']

const querySchema = z.object({
  sign: z.enum(['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']).optional(),
  date: z.string().optional() // YYYY-MM-DD; se omitido = hoje
})

function toId(id: number | null): number | null {
  return id != null && id > 0 ? id : null
}

async function getOrCreateDailyPrediction(
  sign: Sign,
  weekday: Weekday,
  isoWeek: number,
  isoYear: number
) {
  const existing = await prisma.dailyPrediction.findUnique({
    where: {
      sign_weekday_isoWeek_isoYear: { sign, weekday, isoWeek, isoYear }
    }
  })

  if (existing && existing.status === 'published') {
    return existing
  }

  const generated = await generateDailyPrediction({ sign, weekday, isoWeek, isoYear })

  const data = {
    text: generated.text,
    luckyNumber: generated.luckyNumber,
    element: generated.element,
    quality: generated.quality,
    rulingPlanet: generated.rulingPlanet,
    luckyColor: generated.luckyColor,
    luckyColorId: toId(generated.luckyColorId),
    emotion: generated.emotion,
    emotionId: toId(generated.emotionId),
    practicalAdvice: generated.practicalAdvice,
    practicalAdviceId: toId(generated.practicalAdviceId),
    compatibleSigns: generated.compatibleSigns,
    numerologyMeaning: generated.numerologyMeaning,
    impactPhrase: generated.impactPhrase,
    impactPhraseId: toId(generated.impactPhraseId),
    recommendedActivities: generated.recommendedActivities,
    recommendedActivityId: toId(generated.recommendedActivityId),
    dailyAlert: generated.dailyAlert,
    dailyAlertId: toId(generated.dailyAlertId),
    energyLevel: generated.energyLevel,
    crystal: generated.crystal,
    crystalId: toId(generated.crystalId),
    mantra: generated.mantra,
    mantraId: toId(generated.mantraId),
    loveAdvice: generated.loveAdvice,
    loveAdviceId: toId(generated.loveAdviceId),
    careerAdvice: generated.careerAdvice,
    careerAdviceId: toId(generated.careerAdviceId),
    status: 'published' as const
  }

  const prediction = await prisma.dailyPrediction.upsert({
    where: {
      sign_weekday_isoWeek_isoYear: { sign, weekday, isoWeek, isoYear }
    },
    create: {
      sign,
      weekday,
      isoWeek,
      isoYear,
      ...data
    },
    update: data
  })

  return prediction
}

/**
 * GET /api/horoscope/daily
 * Parâmetros: sign (opcional), date (opcional, YYYY-MM-DD).
 * Sem sign = todos os signos. Sem date = previsão do dia (hoje).
 * Se não existir previsão, gera e persiste antes de retornar.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const validated = querySchema.parse({
      sign: searchParams.get('sign') || undefined,
      date: searchParams.get('date') || undefined
    })

    const { weekday, isoWeek, isoYear } = parseDateToContext(validated.date ?? null)

    if (validated.sign) {
      const prediction = await getOrCreateDailyPrediction(
        validated.sign,
        weekday,
        isoWeek,
        isoYear
      )
      return NextResponse.json(prediction)
    }

    const predictions = await Promise.all(
      SIGNS.map(sign =>
        getOrCreateDailyPrediction(sign, weekday, isoWeek, isoYear)
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

    console.error('Error fetching/generating daily prediction:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar ou gerar previsão' },
      { status: 500 }
    )
  }
}
