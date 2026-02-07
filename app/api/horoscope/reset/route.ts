import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseDateToContext } from '@/lib/utils'

/**
 * DELETE /api/horoscope/reset?date=YYYY-MM-DD
 * Remove da base todas as previsões do dia e da semana para a data informada.
 * - Previsões do dia: mesmo weekday, isoWeek e isoYear (todos os signos).
 * - Previsões da semana: mesma isoWeek e isoYear (todos os signos).
 */
export async function DELETE(request: NextRequest) {
  try {
    const dateParam = request.nextUrl.searchParams.get('date')
    const dateStr = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : null
    const { weekday, isoWeek, isoYear } = parseDateToContext(dateStr)

    const [dailyResult, weeklyResult] = await Promise.all([
      prisma.dailyPrediction.deleteMany({
        where: { weekday, isoWeek, isoYear }
      }),
      prisma.weeklyPrediction.deleteMany({
        where: { isoWeek, isoYear }
      })
    ])

    return NextResponse.json({
      ok: true,
      date: dateStr ?? new Date().toISOString().slice(0, 10),
      deleted: {
        daily: dailyResult.count,
        weekly: weeklyResult.count
      }
    })
  } catch (error) {
    console.error('Error resetting predictions:', error)
    return NextResponse.json(
      { error: 'Erro ao resetar previsões' },
      { status: 500 }
    )
  }
}
