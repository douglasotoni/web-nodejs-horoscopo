/**
 * Helper para melhorar o texto da previsão diária via OpenRouter (LLM).
 * Se a API falhar ou a chave não existir, retorna null e o chamador usa o texto original.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = 'openai/gpt-3.5-turbo'
const REQUEST_TIMEOUT_MS = 18_000

const SIGN_NAMES: Record<string, string> = {
  aries: 'Áries',
  taurus: 'Touro',
  gemini: 'Gêmeos',
  cancer: 'Câncer',
  leo: 'Leão',
  virgo: 'Virgem',
  libra: 'Libra',
  scorpio: 'Escorpião',
  sagittarius: 'Sagitário',
  capricorn: 'Capricórnio',
  aquarius: 'Aquário',
  pisces: 'Peixes'
}

function getSignName(sign: string): string {
  return SIGN_NAMES[sign.toLowerCase()] ?? sign
}

/**
 * Envia o texto atual do horóscopo para o OpenRouter pedindo uma versão melhorada.
 * Retorna o texto melhorado ou null em caso de erro/timeout/chave ausente (use o texto original).
 */
function getApiKey(): string | null {
  const raw = process.env.OPENROUTER_API_KEY
  if (!raw || typeof raw !== 'string') return null
  const key = raw.trim().replace(/^["']|["']$/g, '')
  return key.length > 0 ? key : null
}

export async function improveHoroscopeText(
  originalText: string,
  sign: string,
  dateStr: string
): Promise<string | null> {
  const apiKey = getApiKey()
  if (!apiKey || originalText.trim() === '') {
    return null
  }

  const signName = getSignName(sign)
  const systemPrompt = `Você é um revisor de textos de horóscopo. Sua tarefa é melhorar o texto recebido: deixá-lo mais fluido e envolvente, mantendo o tom de previsão astrológica e o mesmo significado. Responda apenas com o texto melhorado, em um único parágrafo, em português do Brasil. Não invente informações novas; preserve número da sorte e dados mencionados se existirem.`
  const userPrompt = `Melhore este horóscopo para o signo de ${signName} na data ${dateStr}:\n\n${originalText}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 400,
        temperature: 0.5
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.warn('[OpenRouter] Falha na API:', res.status, body.slice(0, 200))
      return null
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
      error?: { message?: string }
    }

    if (data.error?.message) {
      console.warn('[OpenRouter]', data.error.message)
      return null
    }

    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) return null

    return content
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error) {
      console.warn('[OpenRouter]', err.message)
    }
    return null
  }
}
