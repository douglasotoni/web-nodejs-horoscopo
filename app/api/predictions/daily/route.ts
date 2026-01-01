import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getCurrentISOWeek } from '@/lib/utils'

const querySchema = z.object({
  sign: z.enum(['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']),
  weekday: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
  isoWeek: z.coerce.number().int().positive().optional(),
  isoYear: z.coerce.number().int().positive().optional()
})

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const params = {
      sign: searchParams.get('sign'),
      weekday: searchParams.get('weekday'),
      isoWeek: searchParams.get('isoWeek'),
      isoYear: searchParams.get('isoYear')
    }

    const { isoWeek, isoYear } = getCurrentISOWeek()
    const validated = querySchema.parse({
      ...params,
      isoWeek: params.isoWeek || isoWeek,
      isoYear: params.isoYear || isoYear
    })

    const prediction = await prisma.dailyPrediction.findUnique({
      where: {
        sign_weekday_isoWeek_isoYear: {
          sign: validated.sign,
          weekday: validated.weekday || 'monday',
          isoWeek: validated.isoWeek!,
          isoYear: validated.isoYear!
        }
      }
    })

    if (!prediction || prediction.status !== 'published') {
      return NextResponse.json(
        { error: 'Previsão não encontrada ou não publicada' },
        { status: 404 }
      )
    }

    return NextResponse.json(prediction)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error fetching daily prediction:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar previsão' },
      { status: 500 }
    )
  }
}

