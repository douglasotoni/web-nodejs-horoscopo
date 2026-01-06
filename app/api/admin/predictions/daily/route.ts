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
  element: z.string().optional(),
  quality: z.string().optional(),
  rulingPlanet: z.string().optional(),
  luckyColor: z.string().optional(),
  emotion: z.string().optional(),
  practicalAdvice: z.string().optional(),
  compatibleSigns: z.string().optional(),
  numerologyMeaning: z.string().optional(),
  impactPhrase: z.string().optional(),
  recommendedActivities: z.string().optional().nullable(),
  dailyAlert: z.string().optional().nullable(),
  energyLevel: z.number().int().min(1).max(10).optional().nullable(),
  crystal: z.string().optional().nullable(),
  mantra: z.string().optional().nullable(),
  loveAdvice: z.string().optional().nullable(),
  careerAdvice: z.string().optional().nullable(),
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
    let element = data.element
    let quality = data.quality
    let rulingPlanet = data.rulingPlanet
    let luckyColor = data.luckyColor
    let emotion = data.emotion
    let practicalAdvice = data.practicalAdvice
    let compatibleSigns = data.compatibleSigns
    let numerologyMeaning = data.numerologyMeaning
    let impactPhrase = data.impactPhrase
    let recommendedActivities = data.recommendedActivities
    let dailyAlert = data.dailyAlert
    let energyLevel = data.energyLevel
    let crystal = data.crystal
    let mantra = data.mantra
    let loveAdvice = data.loveAdvice
    let careerAdvice = data.careerAdvice

    if (data.generate && !text) {
      const generated = generateDailyPrediction({
        sign: data.sign,
        weekday: data.weekday,
        isoWeek: data.isoWeek,
        isoYear: data.isoYear
      })
      text = generated.text
      luckyNumber = generated.luckyNumber
      element = generated.element
      quality = generated.quality
      rulingPlanet = generated.rulingPlanet
      luckyColor = generated.luckyColor
      emotion = generated.emotion
      practicalAdvice = generated.practicalAdvice
      compatibleSigns = generated.compatibleSigns
      numerologyMeaning = generated.numerologyMeaning
      impactPhrase = generated.impactPhrase
      recommendedActivities = generated.recommendedActivities
      dailyAlert = generated.dailyAlert
      energyLevel = generated.energyLevel
      crystal = generated.crystal
      mantra = generated.mantra
      loveAdvice = generated.loveAdvice
      careerAdvice = generated.careerAdvice
    }

    if (!text || !luckyNumber) {
      return NextResponse.json(
        { error: 'Texto e número da sorte são obrigatórios' },
        { status: 400 }
      )
    }

    // Preparar dados para update (incluir apenas campos definidos)
    const updateData: any = {
      text,
      luckyNumber,
      status: data.status || 'draft'
    }
    
    // Adicionar novos campos apenas se estiverem definidos
    if (element !== undefined) updateData.element = element
    if (quality !== undefined) updateData.quality = quality
    if (rulingPlanet !== undefined) updateData.rulingPlanet = rulingPlanet
    if (luckyColor !== undefined) updateData.luckyColor = luckyColor
    if (emotion !== undefined) updateData.emotion = emotion
    if (practicalAdvice !== undefined) updateData.practicalAdvice = practicalAdvice
    if (compatibleSigns !== undefined) updateData.compatibleSigns = compatibleSigns
    if (numerologyMeaning !== undefined) updateData.numerologyMeaning = numerologyMeaning
    if (impactPhrase !== undefined) updateData.impactPhrase = impactPhrase
    if (recommendedActivities !== undefined) updateData.recommendedActivities = recommendedActivities
    if (dailyAlert !== undefined) updateData.dailyAlert = dailyAlert
    if (energyLevel !== undefined) updateData.energyLevel = energyLevel
    if (crystal !== undefined) updateData.crystal = crystal
    if (mantra !== undefined) updateData.mantra = mantra
    if (loveAdvice !== undefined) updateData.loveAdvice = loveAdvice
    if (careerAdvice !== undefined) updateData.careerAdvice = careerAdvice
    
    const prediction = await prisma.dailyPrediction.upsert({
      where: {
        sign_weekday_isoWeek_isoYear: {
          sign: data.sign,
          weekday: data.weekday,
          isoWeek: data.isoWeek,
          isoYear: data.isoYear
        }
      },
      update: updateData,
      create: {
        sign: data.sign,
        weekday: data.weekday,
        isoWeek: data.isoWeek,
        isoYear: data.isoYear,
        text,
        luckyNumber,
        element: element || null,
        quality: quality || null,
        rulingPlanet: rulingPlanet || null,
        luckyColor: luckyColor || null,
        emotion: emotion || null,
        practicalAdvice: practicalAdvice || null,
        compatibleSigns: compatibleSigns || null,
        numerologyMeaning: numerologyMeaning || null,
        impactPhrase: impactPhrase || null,
        recommendedActivities: recommendedActivities || null,
        dailyAlert: dailyAlert || null,
        energyLevel: energyLevel || null,
        crystal: crystal || null,
        mantra: mantra || null,
        loveAdvice: loveAdvice || null,
        careerAdvice: careerAdvice || null,
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

    // Preparar dados para update (incluir apenas campos definidos)
    const updateData: any = {}
    if (data.text !== undefined) updateData.text = data.text
    if (data.luckyNumber !== undefined) updateData.luckyNumber = data.luckyNumber
    if (data.element !== undefined) updateData.element = data.element
    if (data.quality !== undefined) updateData.quality = data.quality
    if (data.rulingPlanet !== undefined) updateData.rulingPlanet = data.rulingPlanet
    if (data.luckyColor !== undefined) updateData.luckyColor = data.luckyColor
    if (data.emotion !== undefined) updateData.emotion = data.emotion
    if (data.practicalAdvice !== undefined) updateData.practicalAdvice = data.practicalAdvice
    if (data.compatibleSigns !== undefined) updateData.compatibleSigns = data.compatibleSigns
    if (data.numerologyMeaning !== undefined) updateData.numerologyMeaning = data.numerologyMeaning
    if (data.impactPhrase !== undefined) updateData.impactPhrase = data.impactPhrase
    if (data.recommendedActivities !== undefined) updateData.recommendedActivities = data.recommendedActivities
    if (data.dailyAlert !== undefined) updateData.dailyAlert = data.dailyAlert
    if (data.energyLevel !== undefined) updateData.energyLevel = data.energyLevel
    if (data.crystal !== undefined) updateData.crystal = data.crystal
    if (data.mantra !== undefined) updateData.mantra = data.mantra
    if (data.loveAdvice !== undefined) updateData.loveAdvice = data.loveAdvice
    if (data.careerAdvice !== undefined) updateData.careerAdvice = data.careerAdvice
    if (data.status !== undefined) updateData.status = data.status

    const prediction = await prisma.dailyPrediction.update({
      where: { id: data.id },
      data: updateData
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

