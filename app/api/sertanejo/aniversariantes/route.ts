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

  /** Exclui registros que são só o nome da dupla (ex.: "Praião & Prainha"); mantém só nomes de pessoas (ex.: "Praião (Praião & Prainha)"). */
  const soNomeDeDupla = (nome: string) =>
    !nome.includes('(') && (nome.includes(' & ') || nome.includes(' e '))

  const diaMesValido = (c: { dia: number; mes: number }) =>
    c.mes >= 1 && c.mes <= 12 && c.dia >= 1 && c.dia <= 31

  const aniversariantes = CANTORES_SERTANEJOS.filter(
    (c) =>
      diaMesValido(c) &&
      c.mes === mesCorrente &&
      !soNomeDeDupla(c.nome)
  )
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
