import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { canEditPredictions } from '@/lib/rbac'
import { generateDailyPrediction } from '@/lib/generator'

const createSchema = z.object({
  sign: z.enum(['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']),
  weekday: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  isoWeek: z.number().int().positive(),
  isoYear: z.number().int().positive(),
  text: z.string().min(10).optional(),
  luckyNumber: z.number().int().min(1).max(60).optional(),
  status: z.enum(['draft', 'published']).optional(),
  generate: z.boolean().optional()
})

const updateSchema = createSchema.partial().extend({
  id: z.string().uuid()
})

const querySchema = z.object({
  sign: z.enum(['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']).optional(),
  weekday: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
  isoWeek: z.coerce.number().int().positive().optional(),
  isoYear: z.coerce.number().int().positive().optional()
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canEditPredictions(session.user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const params = {
      sign: searchParams.get('sign') || undefined,
      weekday: searchParams.get('weekday') || undefined,
      isoWeek: searchParams.get('isoWeek') || undefined,
      isoYear: searchParams.get('isoYear') || undefined
    }

    console.log('Parâmetros recebidos:', params)

    const validated = querySchema.parse(params)
    console.log('Parâmetros validados:', validated)

    if (validated.sign && validated.weekday && validated.isoWeek && validated.isoYear) {
      // Buscar previsão específica
      const prediction = await prisma.dailyPrediction.findUnique({
        where: {
          sign_weekday_isoWeek_isoYear: {
            sign: validated.sign,
            weekday: validated.weekday,
            isoWeek: validated.isoWeek,
            isoYear: validated.isoYear
          }
        }
      })

      if (!prediction) {
        return NextResponse.json(
          { error: 'Previsão não encontrada' },
          { status: 404 }
        )
      }

      return NextResponse.json(prediction)
    } else if (validated.weekday && validated.isoWeek && validated.isoYear) {
      // Buscar todas as previsões para a data/semana
      const predictions = await prisma.dailyPrediction.findMany({
        where: {
          weekday: validated.weekday,
          isoWeek: validated.isoWeek,
          isoYear: validated.isoYear
        },
        orderBy: {
          sign: 'asc'
        }
      })

      // Sempre retornar um array, mesmo que vazio
      return NextResponse.json(predictions || [])
    } else {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Erro de validação Zod:', error.errors)
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error fetching daily predictions:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar previsões', message: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canEditPredictions(session.user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const data = createSchema.parse(body)

    let text = data.text
    let luckyNumber = data.luckyNumber

    if (data.generate && !text) {
      const generated = generateDailyPrediction({
        sign: data.sign,
        weekday: data.weekday,
        isoWeek: data.isoWeek,
        isoYear: data.isoYear
      })
      text = generated.text
      luckyNumber = generated.luckyNumber
    }

    if (!text || !luckyNumber) {
      return NextResponse.json(
        { error: 'Texto e número da sorte são obrigatórios' },
        { status: 400 }
      )
    }

    const prediction = await prisma.dailyPrediction.upsert({
      where: {
        sign_weekday_isoWeek_isoYear: {
          sign: data.sign,
          weekday: data.weekday,
          isoWeek: data.isoWeek,
          isoYear: data.isoYear
        }
      },
      update: {
        text,
        luckyNumber,
        status: data.status || 'draft'
      },
      create: {
        sign: data.sign,
        weekday: data.weekday,
        isoWeek: data.isoWeek,
        isoYear: data.isoYear,
        text,
        luckyNumber,
        status: data.status || 'draft'
      }
    })

    return NextResponse.json(prediction)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating/updating daily prediction:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar previsão' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canEditPredictions(session.user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const data = updateSchema.parse(body)

    const existing = await prisma.dailyPrediction.findUnique({
      where: { id: data.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Previsão não encontrada' },
        { status: 404 }
      )
    }

    const prediction = await prisma.dailyPrediction.update({
      where: { id: data.id },
      data: {
        text: data.text,
        luckyNumber: data.luckyNumber,
        status: data.status
      }
    })

    return NextResponse.json(prediction)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating daily prediction:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar previsão' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canEditPredictions(session.user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    await prisma.dailyPrediction.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting daily prediction:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar previsão' },
      { status: 500 }
    )
  }
}

