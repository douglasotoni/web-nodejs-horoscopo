import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canEditPredictions } from '@/lib/rbac'

// GET - Listar todos os signos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !canEditPredictions(session.user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    const signs = await prisma.zodiacSign.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(signs)
  } catch (error) {
    console.error('Error fetching signs:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar signos' },
      { status: 500 }
    )
  }
}

