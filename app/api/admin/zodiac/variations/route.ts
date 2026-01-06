import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { canEditPredictions } from '@/lib/rbac'
import { zodiacCache } from '@/lib/zodiac-cache'

const variationTypes = [
  'careerAdvice',
  'loveAdvice',
  'crystal',
  'dailyAlert',
  'recommendedActivity',
  'practicalAdvice',
  'luckyColor',
  'emotion',
  'impactPhrase',
  'mantra'
] as const

type VariationType = typeof variationTypes[number]

const createSchema = z.object({
  signId: z.string().uuid(),
  type: z.enum(variationTypes),
  text: z.string().min(1),
  isActive: z.boolean().optional().default(true)
})

const updateSchema = createSchema.partial().extend({
  id: z.string().uuid()
})

const querySchema = z.object({
  signId: z.string().uuid().optional(),
  type: z.enum(variationTypes).optional(),
  isActive: z.coerce.boolean().optional()
})

// GET - Listar variações
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
      signId: searchParams.get('signId') || undefined,
      type: searchParams.get('type') || undefined,
      isActive: searchParams.get('isActive') || undefined
    }

    const validated = querySchema.parse(params)

    // Construir where dinamicamente
    const where: any = {}
    if (validated.signId) where.signId = validated.signId
    if (validated.isActive !== undefined) where.isActive = validated.isActive

    // Buscar baseado no tipo
    if (!validated.type) {
      return NextResponse.json(
        { error: 'Tipo de variação é obrigatório' },
        { status: 400 }
      )
    }

    let results: any[] = []
    switch (validated.type) {
      case 'careerAdvice':
        results = await prisma.careerAdvice.findMany({ where, include: { sign: true }, orderBy: { createdAt: 'desc' } })
        break
      case 'loveAdvice':
        results = await prisma.loveAdvice.findMany({ where, include: { sign: true }, orderBy: { createdAt: 'desc' } })
        break
      case 'crystal':
        results = await prisma.crystal.findMany({ where, include: { sign: true }, orderBy: { createdAt: 'desc' } })
        break
      case 'dailyAlert':
        results = await prisma.dailyAlert.findMany({ where, include: { sign: true }, orderBy: { createdAt: 'desc' } })
        break
      case 'recommendedActivity':
        results = await prisma.recommendedActivity.findMany({ where, include: { sign: true }, orderBy: { createdAt: 'desc' } })
        break
      case 'practicalAdvice':
        results = await prisma.practicalAdvice.findMany({ where, include: { sign: true }, orderBy: { createdAt: 'desc' } })
        break
      case 'luckyColor':
        results = await prisma.luckyColor.findMany({ where, include: { sign: true }, orderBy: { createdAt: 'desc' } })
        break
      case 'emotion':
        results = await prisma.emotion.findMany({ where, include: { sign: true }, orderBy: { createdAt: 'desc' } })
        break
      case 'impactPhrase':
        results = await prisma.impactPhrase.findMany({ where, include: { sign: true }, orderBy: { createdAt: 'desc' } })
        break
      case 'mantra':
        results = await prisma.mantra.findMany({ where, include: { sign: true }, orderBy: { createdAt: 'desc' } })
        break
    }

    return NextResponse.json(results)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error fetching variations:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar variações' },
      { status: 500 }
    )
  }
}

// POST - Criar variação
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

    let result: any
    switch (data.type) {
      case 'careerAdvice':
        result = await prisma.careerAdvice.create({ data: { signId: data.signId, text: data.text, isActive: data.isActive ?? true }, include: { sign: true } })
        break
      case 'loveAdvice':
        result = await prisma.loveAdvice.create({ data: { signId: data.signId, text: data.text, isActive: data.isActive ?? true }, include: { sign: true } })
        break
      case 'crystal':
        result = await prisma.crystal.create({ data: { signId: data.signId, text: data.text, isActive: data.isActive ?? true }, include: { sign: true } })
        break
      case 'dailyAlert':
        result = await prisma.dailyAlert.create({ data: { signId: data.signId, text: data.text, isActive: data.isActive ?? true }, include: { sign: true } })
        break
      case 'recommendedActivity':
        result = await prisma.recommendedActivity.create({ data: { signId: data.signId, text: data.text, isActive: data.isActive ?? true }, include: { sign: true } })
        break
      case 'practicalAdvice':
        result = await prisma.practicalAdvice.create({ data: { signId: data.signId, text: data.text, isActive: data.isActive ?? true }, include: { sign: true } })
        break
      case 'luckyColor':
        result = await prisma.luckyColor.create({ data: { signId: data.signId, text: data.text, isActive: data.isActive ?? true }, include: { sign: true } })
        break
      case 'emotion':
        result = await prisma.emotion.create({ data: { signId: data.signId, text: data.text, isActive: data.isActive ?? true }, include: { sign: true } })
        break
      case 'impactPhrase':
        result = await prisma.impactPhrase.create({ data: { signId: data.signId, text: data.text, isActive: data.isActive ?? true }, include: { sign: true } })
        break
      case 'mantra':
        result = await prisma.mantra.create({ data: { signId: data.signId, text: data.text, isActive: data.isActive ?? true }, include: { sign: true } })
        break
    }

    // Limpar cache
    const sign = await prisma.zodiacSign.findUnique({ where: { id: data.signId } })
    if (sign) {
      zodiacCache.clearByType(data.type)
    }

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating variation:', error)
    return NextResponse.json(
      { error: 'Erro ao criar variação' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar variação
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

    if (!data.type || !data.id) {
      return NextResponse.json(
        { error: 'Tipo e ID são obrigatórios' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (data.text !== undefined) updateData.text = data.text
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    let result: any
    switch (data.type) {
      case 'careerAdvice':
        result = await prisma.careerAdvice.update({ where: { id: data.id }, data: updateData, include: { sign: true } })
        break
      case 'loveAdvice':
        result = await prisma.loveAdvice.update({ where: { id: data.id }, data: updateData, include: { sign: true } })
        break
      case 'crystal':
        result = await prisma.crystal.update({ where: { id: data.id }, data: updateData, include: { sign: true } })
        break
      case 'dailyAlert':
        result = await prisma.dailyAlert.update({ where: { id: data.id }, data: updateData, include: { sign: true } })
        break
      case 'recommendedActivity':
        result = await prisma.recommendedActivity.update({ where: { id: data.id }, data: updateData, include: { sign: true } })
        break
      case 'practicalAdvice':
        result = await prisma.practicalAdvice.update({ where: { id: data.id }, data: updateData, include: { sign: true } })
        break
      case 'luckyColor':
        result = await prisma.luckyColor.update({ where: { id: data.id }, data: updateData, include: { sign: true } })
        break
      case 'emotion':
        result = await prisma.emotion.update({ where: { id: data.id }, data: updateData, include: { sign: true } })
        break
      case 'impactPhrase':
        result = await prisma.impactPhrase.update({ where: { id: data.id }, data: updateData, include: { sign: true } })
        break
      case 'mantra':
        result = await prisma.mantra.update({ where: { id: data.id }, data: updateData, include: { sign: true } })
        break
    }

    // Limpar cache
    if (result?.sign?.name) {
      zodiacCache.clearByType(data.type)
    }

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating variation:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar variação' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar variação
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canEditPredictions(session.user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    const { searchParams } = req.nextUrl
    const id = searchParams.get('id')
    const type = searchParams.get('type') as VariationType | null

    if (!id || !type) {
      return NextResponse.json(
        { error: 'ID e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar antes de deletar para limpar cache
    let signName: string | null = null
    try {
      switch (type) {
        case 'careerAdvice':
          const ca = await prisma.careerAdvice.findUnique({ where: { id }, include: { sign: true } })
          if (ca) {
            await prisma.careerAdvice.delete({ where: { id } })
            signName = ca.sign.name
          }
          break
        case 'loveAdvice':
          const la = await prisma.loveAdvice.findUnique({ where: { id }, include: { sign: true } })
          if (la) {
            await prisma.loveAdvice.delete({ where: { id } })
            signName = la.sign.name
          }
          break
        case 'crystal':
          const cr = await prisma.crystal.findUnique({ where: { id }, include: { sign: true } })
          if (cr) {
            await prisma.crystal.delete({ where: { id } })
            signName = cr.sign.name
          }
          break
        case 'dailyAlert':
          const da = await prisma.dailyAlert.findUnique({ where: { id }, include: { sign: true } })
          if (da) {
            await prisma.dailyAlert.delete({ where: { id } })
            signName = da.sign.name
          }
          break
        case 'recommendedActivity':
          const ra = await prisma.recommendedActivity.findUnique({ where: { id }, include: { sign: true } })
          if (ra) {
            await prisma.recommendedActivity.delete({ where: { id } })
            signName = ra.sign.name
          }
          break
        case 'practicalAdvice':
          const pa = await prisma.practicalAdvice.findUnique({ where: { id }, include: { sign: true } })
          if (pa) {
            await prisma.practicalAdvice.delete({ where: { id } })
            signName = pa.sign.name
          }
          break
        case 'luckyColor':
          const lc = await prisma.luckyColor.findUnique({ where: { id }, include: { sign: true } })
          if (lc) {
            await prisma.luckyColor.delete({ where: { id } })
            signName = lc.sign.name
          }
          break
        case 'emotion':
          const em = await prisma.emotion.findUnique({ where: { id }, include: { sign: true } })
          if (em) {
            await prisma.emotion.delete({ where: { id } })
            signName = em.sign.name
          }
          break
        case 'impactPhrase':
          const ip = await prisma.impactPhrase.findUnique({ where: { id }, include: { sign: true } })
          if (ip) {
            await prisma.impactPhrase.delete({ where: { id } })
            signName = ip.sign.name
          }
          break
        case 'mantra':
          const ma = await prisma.mantra.findUnique({ where: { id }, include: { sign: true } })
          if (ma) {
            await prisma.mantra.delete({ where: { id } })
            signName = ma.sign.name
          }
          break
      }
    } catch (error) {
      console.error('Error deleting variation:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar variação' },
        { status: 500 }
      )
    }

    // Limpar cache
    if (signName) {
      zodiacCache.clearByType(type)
    }

    return NextResponse.json({ message: 'Variação deletada com sucesso' })
  } catch (error) {
    console.error('Error deleting variation:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar variação' },
      { status: 500 }
    )
  }
}

