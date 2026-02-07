import { NextRequest, NextResponse } from 'next/server'
import { CANTORES_SERTANEJOS } from '../cantores-data'

/**
 * GET /api/sertanejo/aniversariantes
 * Retorna a lista de cantores sertanejos famosos que fazem aniversário no mês.
 * Query: date (opcional) YYYY-MM-DD — usa o mês dessa data; sem date = mês corrente.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dateParam = searchParams.get('date')
  let mesCorrente: number
  let mesNome: string
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const [y, m] = dateParam.split('-').map(Number)
    mesCorrente = m
    const ref = new Date(y, m - 1, 1)
    mesNome = ref.toLocaleDateString('pt-BR', { month: 'long' })
  } else {
    const hoje = new Date()
    mesCorrente = hoje.getMonth() + 1
    mesNome = hoje.toLocaleDateString('pt-BR', { month: 'long' })
  }

  const aniversariantes = CANTORES_SERTANEJOS.filter((c) => c.mes === mesCorrente)
    .sort((a, b) => a.dia - b.dia)
    .map((c) => ({
      nome: c.nome,
      dia: c.dia,
      mes: c.mes,
      dataFormatada: `${String(c.dia).padStart(2, '0')}/${String(c.mes).padStart(2, '0')}`,
    }))

  return NextResponse.json({
    mes: mesCorrente,
    mesNome,
    aniversariantes,
    total: aniversariantes.length,
  })
}
