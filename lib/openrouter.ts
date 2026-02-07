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

/** Tons aceitos para a melhoria do texto (valor enviado pela API). */
export const TONE_OPTIONS = ['bem_humorada', 'vibe_sertaneja', 'resumida'] as const
export type ToneOption = (typeof TONE_OPTIONS)[number]

const TONE_PROMPTS: Record<ToneOption, string> = {
  bem_humorada: 'O texto melhorado deve ser bem humorado e leve: use um tom divertido e otimista, com toques de humor quando fizer sentido, sem perder o clima de horóscopo.',
  vibe_sertaneja: 'O texto melhorado deve ter vibe sertaneja: use expressões e um jeito caloroso, romântico e “de raiz”, como nas letras de música sertaneja, mantendo o significado da previsão.',
  resumida: 'O texto melhorado deve ser resumido e direto: poucas frases, só o essencial da previsão, sem enrolação, em um único parágrafo curto.'
}

function getApiKey(): string | null {
  const raw = process.env.OPENROUTER_API_KEY
  if (!raw || typeof raw !== 'string') return null
  const key = raw.trim().replace(/^["']|["']$/g, '')
  return key.length > 0 ? key : null
}

export type HoroscopeContext = 'daily' | 'weekly'

/**
 * Envia o texto atual do horóscopo para o OpenRouter pedindo uma versão melhorada.
 * Retorna o texto melhorado ou null em caso de erro/timeout/chave ausente (use o texto original).
 * tone: opcional; define o tom da melhoria (bem_humorada, vibe_sertaneja, resumida).
 * context: 'daily' = previsão do dia; 'weekly' = previsão da semana (dateOrWeekStr é usado como rótulo).
 */
export async function improveHoroscopeText(
  originalText: string,
  sign: string,
  dateOrWeekStr: string,
  tone?: ToneOption | string | null,
  context: HoroscopeContext = 'daily'
): Promise<string | null> {
  const apiKey = getApiKey()
  if (!apiKey || originalText.trim() === '') {
    return null
  }

  const signName = getSignName(sign)
  const toneInstruction =
    tone && TONE_OPTIONS.includes(tone as ToneOption)
      ? ` ${TONE_PROMPTS[tone as ToneOption]}`
      : ''
  const systemPrompt = `Você é um revisor de textos de horóscopo. Sua tarefa é melhorar o texto recebido: deixá-lo mais fluido e envolvente, mantendo o tom de previsão astrológica e o mesmo significado. Responda apenas com o texto melhorado, em um único parágrafo, em português do Brasil. Não invente informações novas; preserve número da sorte e dados mencionados se existirem.${toneInstruction}`
  const periodLabel = context === 'weekly' ? `previsão da semana (${dateOrWeekStr})` : `data ${dateOrWeekStr}`
  const userPrompt = `Melhore este horóscopo ${context === 'weekly' ? 'da semana' : 'do dia'} para o signo de ${signName} - ${periodLabel}:\n\n${originalText}`

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
