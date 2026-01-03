import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getCurrentISOWeek } from '@/lib/utils'
import { Sign, Weekday } from '@prisma/client'

const querySchema = z.object({
  weekday: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
  isoWeek: z.coerce.number().int().positive().optional(),
  isoYear: z.coerce.number().int().positive().optional()
})

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const params = {
      weekday: searchParams.get('weekday'),
      isoWeek: searchParams.get('isoWeek'),
      isoYear: searchParams.get('isoYear')
    }

    const { week, year } = getCurrentISOWeek()
    const validated = querySchema.parse({
      ...params,
      isoWeek: params.isoWeek || week,
      isoYear: params.isoYear || year
    })

    const signs: Sign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
    const weekday = validated.weekday || 'monday'

    const [dailyPredictions, weeklyPredictions] = await Promise.all([
      prisma.dailyPrediction.findMany({
        where: {
          weekday: weekday as Weekday,
          isoWeek: validated.isoWeek!,
          isoYear: validated.isoYear!,
          status: 'published'
        }
      }),
      prisma.weeklyPrediction.findMany({
        where: {
          isoWeek: validated.isoWeek!,
          isoYear: validated.isoYear!,
          status: 'published'
        }
      })
    ])

    const result = signs.map(sign => {
      const daily = dailyPredictions.find(p => p.sign === sign)
      const weekly = weeklyPredictions.find(p => p.sign === sign)
      
      return {
        sign,
        daily: daily || null,
        weekly: weekly || null
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error fetching all predictions:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar previsões' },
      { status: 500 }
    )
  }
}

