import { NextResponse } from 'next/server'
import { checkOpenRouterConnection } from '@/lib/openrouter'

/**
 * GET /api/openrouter/check
 * Verifica se a API está utilizando a OpenRouter com sucesso (chave configurada e requisição mínima ok).
 */
export async function GET() {
  const result = await checkOpenRouterConnection()

  if (result.ok) {
    return NextResponse.json({
      success: true,
      message: 'OpenRouter está em uso com sucesso.',
      model: result.model
    })
  }

  return NextResponse.json(
    {
      success: false,
      message: 'OpenRouter não está disponível ou não está configurada.',
      error: result.error
    },
    { status: 503 }
  )
}
