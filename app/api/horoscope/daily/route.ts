import { NextRequest, NextResponse } from 'next/server'
import { format } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseDateToContext } from '@/lib/utils'
import { generateDailyPrediction } from '@/lib/generator'
import { improveHoroscopeText } from '@/lib/openrouter'
import type { Sign, Weekday } from '@prisma/client'

const SIGNS: Sign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']

const TONE_VALUES = ['bem_humorada', 'vibe_sertaneja', 'resumida'] as const

const querySchema = z.object({
  sign: z.enum(['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']).optional(),
  date: z.string().optional(), // YYYY-MM-DD; se omitido = hoje
  regenerate: z.enum(['1', 'true']).optional(), // força regenerar (e passar pelo OpenRouter se a key existir)
  tone: z.enum(TONE_VALUES).optional() // tom da melhoria pela IA: bem_humorada | vibe_sertaneja | resumida
})

function toId(id: number | null): number | null {
  return id != null && id > 0 ? id : null
}

async function getOrCreateDailyPrediction(
  sign: Sign,
  weekday: Weekday,
  isoWeek: number,
  isoYear: number,
  dateStr: string,
  forceRegenerate: boolean,
  tone?: string | null
) {
  const existing = await prisma.dailyPrediction.findUnique({
    where: {
      sign_weekday_isoWeek_isoYear: { sign, weekday, isoWeek, isoYear }
    }
  })

  // Só gera (e chama OpenRouter para melhorar) quando não existe previsão publicada ou quando ?regenerate=1
  if (!forceRegenerate && existing && existing.status === 'published') {
    return existing
  }

  const generated = await generateDailyPrediction({ sign, weekday, isoWeek, isoYear })
  const improvedText = await improveHoroscopeText(generated.text, sign, dateStr, tone, 'daily', generated.energyLevel)
  const finalText = (improvedText && improvedText.trim() !== '') ? improvedText.trim() : generated.text
  if (process.env.NODE_ENV === 'development' && improvedText) {
    console.log('[OpenRouter] Texto melhorado usado para', sign, dateStr)
  }

  const data = {
    text: finalText,
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
      date: searchParams.get('date') || undefined,
      regenerate: searchParams.get('regenerate') || undefined,
      tone: searchParams.get('tone') || undefined
    })
    const forceRegenerate = validated.regenerate === '1' || validated.regenerate === 'true'
    const tone = validated.tone ?? null

    const { date, weekday, isoWeek, isoYear } = parseDateToContext(validated.date ?? null)
    const dateStr = format(date, 'yyyy-MM-dd')

    if (validated.sign) {
      const prediction = await getOrCreateDailyPrediction(
        validated.sign,
        weekday,
        isoWeek,
        isoYear,
        dateStr,
        forceRegenerate,
        tone
      )
      return NextResponse.json(prediction)
    }

    const predictions = await Promise.all(
      SIGNS.map(sign =>
        getOrCreateDailyPrediction(sign, weekday, isoWeek, isoYear, dateStr, forceRegenerate, tone)
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

    const message = error instanceof Error ? error.message : String(error)
    console.error('Error fetching/generating daily prediction:', error)
    return NextResponse.json(
      {
        error: 'Erro ao buscar ou gerar previsão',
        ...(process.env.NODE_ENV === 'development' && { details: message })
      },
      { status: 500 }
    )
  }
}
