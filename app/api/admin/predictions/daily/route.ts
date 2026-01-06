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
  isoWeek: z.coerce.number().int().positive(),
  isoYear: z.coerce.number().int().positive(),
  text: z.string().min(10).optional(),
  luckyNumber: z.coerce.number().int().min(1).max(60).optional(),
  element: z.string().optional(),
  quality: z.string().optional(),
  rulingPlanet: z.string().optional(),
  luckyColorId: z.coerce.number().int().positive().optional().nullable(),
  emotionId: z.coerce.number().int().positive().optional().nullable(),
  practicalAdviceId: z.coerce.number().int().positive().optional().nullable(),
  compatibleSigns: z.string().optional(),
  numerologyMeaning: z.string().optional(),
  impactPhraseId: z.coerce.number().int().positive().optional().nullable(),
  recommendedActivityId: z.coerce.number().int().positive().optional().nullable(),
  dailyAlertId: z.coerce.number().int().positive().optional().nullable(),
  energyLevel: z.coerce.number().int().min(1).max(10).optional().nullable(),
  crystalId: z.coerce.number().int().positive().optional().nullable(),
  mantraId: z.coerce.number().int().positive().optional().nullable(),
  loveAdviceId: z.coerce.number().int().positive().optional().nullable(),
  careerAdviceId: z.coerce.number().int().positive().optional().nullable(),
  status: z.enum(['draft', 'published']).optional(),
  generate: z.boolean().optional()
})

const updateSchema = createSchema.partial().extend({
  id: z.coerce.number().int().positive()
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
    // Remover id se presente (POST não deve ter id)
    const { id, ...bodyWithoutId } = body
    const data = createSchema.parse(bodyWithoutId)

    let text = data.text
    let luckyNumber = data.luckyNumber
    let element = data.element
    let quality = data.quality
    let rulingPlanet = data.rulingPlanet
    let luckyColor = data.luckyColor
    let luckyColorId = data.luckyColorId
    let emotion = data.emotion
    let emotionId = data.emotionId
    let practicalAdvice = data.practicalAdvice
    let practicalAdviceId = data.practicalAdviceId
    let compatibleSigns = data.compatibleSigns
    let numerologyMeaning = data.numerologyMeaning
    let impactPhrase = data.impactPhrase
    let impactPhraseId = data.impactPhraseId
    let recommendedActivities = data.recommendedActivities
    let recommendedActivityId = data.recommendedActivityId
    let dailyAlert = data.dailyAlert
    let dailyAlertId = data.dailyAlertId
    let energyLevel = data.energyLevel
    let crystal = data.crystal
    let crystalId = data.crystalId
    let mantra = data.mantra
    let mantraId = data.mantraId
    let loveAdvice = data.loveAdvice
    let loveAdviceId = data.loveAdviceId
    let careerAdvice = data.careerAdvice
    let careerAdviceId = data.careerAdviceId

    if (data.generate && !text) {
      const generated = await generateDailyPrediction({
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
      luckyColorId = generated.luckyColorId
      emotion = generated.emotion
      emotionId = generated.emotionId
      practicalAdvice = generated.practicalAdvice
      practicalAdviceId = generated.practicalAdviceId
      compatibleSigns = generated.compatibleSigns
      numerologyMeaning = generated.numerologyMeaning
      impactPhrase = generated.impactPhrase
      impactPhraseId = generated.impactPhraseId
      recommendedActivities = generated.recommendedActivities
      recommendedActivityId = generated.recommendedActivityId
      dailyAlert = generated.dailyAlert
      dailyAlertId = generated.dailyAlertId
      energyLevel = generated.energyLevel
      crystal = generated.crystal
      crystalId = generated.crystalId
      mantra = generated.mantra
      mantraId = generated.mantraId
      loveAdvice = generated.loveAdvice
      loveAdviceId = generated.loveAdviceId
      careerAdvice = generated.careerAdvice
      careerAdviceId = generated.careerAdviceId
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
        luckyColorId: luckyColorId || null,
        emotion: emotion || null,
        emotionId: emotionId || null,
        practicalAdvice: practicalAdvice || null,
        practicalAdviceId: practicalAdviceId || null,
        compatibleSigns: compatibleSigns || null,
        numerologyMeaning: numerologyMeaning || null,
        impactPhrase: impactPhrase || null,
        impactPhraseId: impactPhraseId || null,
        recommendedActivities: recommendedActivities || null,
        recommendedActivityId: recommendedActivityId || null,
        dailyAlert: dailyAlert || null,
        dailyAlertId: dailyAlertId || null,
        energyLevel: energyLevel || null,
        crystal: crystal || null,
        crystalId: crystalId || null,
        mantra: mantra || null,
        mantraId: mantraId || null,
        loveAdvice: loveAdvice || null,
        loveAdviceId: loveAdviceId || null,
        careerAdvice: careerAdvice || null,
        careerAdviceId: careerAdviceId || null,
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
    console.log('[PUT] Recebido body:', JSON.stringify(body, null, 2))
    
    const data = updateSchema.parse(body)
    console.log('[PUT] Dados validados, id:', data.id, 'tipo:', typeof data.id)

    // Tenta encontrar pelo id primeiro
    let existing = await prisma.dailyPrediction.findUnique({
      where: { id: data.id }
    })

    console.log('[PUT] Previsão encontrada pelo id:', existing ? 'sim' : 'não')

    // Se não encontrou pelo id, tenta encontrar pelo unique constraint
    if (!existing && data.sign && data.weekday && data.isoWeek && data.isoYear) {
      console.log('[PUT] Tentando encontrar pelo unique constraint:', {
        sign: data.sign,
        weekday: data.weekday,
        isoWeek: data.isoWeek,
        isoYear: data.isoYear
      })
      
      existing = await prisma.dailyPrediction.findUnique({
        where: {
          sign_weekday_isoWeek_isoYear: {
            sign: data.sign,
            weekday: data.weekday,
            isoWeek: data.isoWeek,
            isoYear: data.isoYear
          }
        }
      })
      
      if (existing) {
        console.log('[PUT] Previsão encontrada pelo unique, id real:', existing.id)
        // Usa o id real encontrado
        data.id = existing.id
      }
    }

    if (!existing) {
      console.log('[PUT] Previsão não encontrada, criando nova previsão via upsert')
      // Se não encontrou, cria/atualiza usando upsert com unique constraint
      if (data.sign && data.weekday && data.isoWeek && data.isoYear) {
        const upsertData: any = {
          sign: data.sign,
          weekday: data.weekday,
          isoWeek: data.isoWeek,
          isoYear: data.isoYear,
          text: data.text || '',
          luckyNumber: data.luckyNumber || 1,
          status: data.status || 'draft'
        }
        
        // Adicionar campos opcionais
        if (data.element !== undefined) upsertData.element = data.element
        if (data.quality !== undefined) upsertData.quality = data.quality
        if (data.rulingPlanet !== undefined) upsertData.rulingPlanet = data.rulingPlanet
        if (data.luckyColor !== undefined) upsertData.luckyColor = data.luckyColor
        if (data.luckyColorId !== undefined) upsertData.luckyColorId = data.luckyColorId
        if (data.emotion !== undefined) upsertData.emotion = data.emotion
        if (data.emotionId !== undefined) upsertData.emotionId = data.emotionId
        if (data.practicalAdvice !== undefined) upsertData.practicalAdvice = data.practicalAdvice
        if (data.practicalAdviceId !== undefined) upsertData.practicalAdviceId = data.practicalAdviceId
        if (data.compatibleSigns !== undefined) upsertData.compatibleSigns = data.compatibleSigns
        if (data.numerologyMeaning !== undefined) upsertData.numerologyMeaning = data.numerologyMeaning
        if (data.impactPhrase !== undefined) upsertData.impactPhrase = data.impactPhrase
        if (data.impactPhraseId !== undefined) upsertData.impactPhraseId = data.impactPhraseId
        if (data.recommendedActivities !== undefined) upsertData.recommendedActivities = data.recommendedActivities
        if (data.recommendedActivityId !== undefined) upsertData.recommendedActivityId = data.recommendedActivityId
        if (data.dailyAlert !== undefined) upsertData.dailyAlert = data.dailyAlert
        if (data.dailyAlertId !== undefined) upsertData.dailyAlertId = data.dailyAlertId
        if (data.energyLevel !== undefined) upsertData.energyLevel = data.energyLevel
        if (data.crystal !== undefined) upsertData.crystal = data.crystal
        if (data.crystalId !== undefined) upsertData.crystalId = data.crystalId
        if (data.mantra !== undefined) upsertData.mantra = data.mantra
        if (data.mantraId !== undefined) upsertData.mantraId = data.mantraId
        if (data.loveAdvice !== undefined) upsertData.loveAdvice = data.loveAdvice
        if (data.loveAdviceId !== undefined) upsertData.loveAdviceId = data.loveAdviceId
        if (data.careerAdvice !== undefined) upsertData.careerAdvice = data.careerAdvice
        if (data.careerAdviceId !== undefined) upsertData.careerAdviceId = data.careerAdviceId
        
        const prediction = await prisma.dailyPrediction.upsert({
          where: {
            sign_weekday_isoWeek_isoYear: {
              sign: data.sign,
              weekday: data.weekday,
              isoWeek: data.isoWeek,
              isoYear: data.isoYear
            }
          },
          update: upsertData,
          create: upsertData
        })
        
        console.log('[PUT] Previsão criada/atualizada via upsert, id:', prediction.id)
        return NextResponse.json(prediction)
      } else {
        return NextResponse.json(
          { error: 'Previsão não encontrada e dados insuficientes para criar' },
          { status: 404 }
        )
      }
    }

    // Preparar dados para update (incluir apenas campos definidos)
    const updateData: any = {}
    if (data.text !== undefined) updateData.text = data.text
    if (data.luckyNumber !== undefined) updateData.luckyNumber = data.luckyNumber
    if (data.element !== undefined) updateData.element = data.element
    if (data.quality !== undefined) updateData.quality = data.quality
    if (data.rulingPlanet !== undefined) updateData.rulingPlanet = data.rulingPlanet
    if (data.luckyColor !== undefined) updateData.luckyColor = data.luckyColor
    if (data.luckyColorId !== undefined) updateData.luckyColorId = data.luckyColorId
    if (data.emotion !== undefined) updateData.emotion = data.emotion
    if (data.emotionId !== undefined) updateData.emotionId = data.emotionId
    if (data.practicalAdvice !== undefined) updateData.practicalAdvice = data.practicalAdvice
    if (data.practicalAdviceId !== undefined) updateData.practicalAdviceId = data.practicalAdviceId
    if (data.compatibleSigns !== undefined) updateData.compatibleSigns = data.compatibleSigns
    if (data.numerologyMeaning !== undefined) updateData.numerologyMeaning = data.numerologyMeaning
    if (data.impactPhrase !== undefined) updateData.impactPhrase = data.impactPhrase
    if (data.impactPhraseId !== undefined) updateData.impactPhraseId = data.impactPhraseId
    if (data.recommendedActivities !== undefined) updateData.recommendedActivities = data.recommendedActivities
    if (data.recommendedActivityId !== undefined) updateData.recommendedActivityId = data.recommendedActivityId
    if (data.dailyAlert !== undefined) updateData.dailyAlert = data.dailyAlert
    if (data.dailyAlertId !== undefined) updateData.dailyAlertId = data.dailyAlertId
    if (data.energyLevel !== undefined) updateData.energyLevel = data.energyLevel
    if (data.crystal !== undefined) updateData.crystal = data.crystal
    if (data.crystalId !== undefined) updateData.crystalId = data.crystalId
    if (data.mantra !== undefined) updateData.mantra = data.mantra
    if (data.mantraId !== undefined) updateData.mantraId = data.mantraId
    if (data.loveAdvice !== undefined) updateData.loveAdvice = data.loveAdvice
    if (data.loveAdviceId !== undefined) updateData.loveAdviceId = data.loveAdviceId
    if (data.careerAdvice !== undefined) updateData.careerAdvice = data.careerAdvice
    if (data.careerAdviceId !== undefined) updateData.careerAdviceId = data.careerAdviceId
    if (data.status !== undefined) updateData.status = data.status

    console.log('[PUT] Atualizando previsão com id:', data.id, 'dados:', Object.keys(updateData))
    
    const prediction = await prisma.dailyPrediction.update({
      where: { id: data.id },
      data: updateData
    })
    
    console.log('[PUT] Previsão atualizada com sucesso, novo id:', prediction.id)
    
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

