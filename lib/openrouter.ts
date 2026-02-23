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
  vibe_sertaneja: 'O texto melhorado deve ter um tom sertanejo: use expressões e um jeito caloroso, romântico e “de raiz”, como nas letras de música sertaneja, mantendo o significado da previsão.',
  resumida: 'O texto melhorado deve ser resumido e direto: poucas frases, só o essencial da previsão, sem enrolação, em um único parágrafo curto.'
}

/** Substituições de linguagem neutra/inclusiva pelo português padrão (gentílicos dos signos e termos comuns). */
const NEUTRAL_TO_STANDARD: Array<[RegExp, string]> = [
  [/\barianx\b/gi, 'ariano'],
  [/\bleoninx\b/gi, 'leonino'],
  [/\btaurinx\b/gi, 'taurino'],
  [/\bgemininx\b/gi, 'geminiano'],
  [/\bcancerianx\b/gi, 'canceriano'],
  [/\bvirginx\b/gi, 'virginiano'],
  [/\blibrax\b/gi, 'libriano'],
  [/\bescorpianx\b/gi, 'escorpiano'],
  [/\bscorpiox\b/gi, 'escorpiano'],
  [/\bsagittarix\b/gi, 'sagitariano'],
  [/\bsagitarix\b/gi, 'sagitariano'],
  [/\bcapricornx\b/gi, 'capricorniano'],
  [/\baquarix\b/gi, 'aquariano'],
  [/\bpiscianx\b/gi, 'pisciano'],
  [/\btodes\b/gi, 'todos'],
  [/\belu\b/gi, 'ele'],
  [/\bamigue\b/gi, 'amigo'],
  [/\bamigues\b/gi, 'amigos'],
  [/\btodxs\b/gi, 'todos']
]

function toTitleCase(word: string): string {
  if (!word.length) return word
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

/** Remove linguagem neutra do texto (ex.: arianx → ariano, leoninx → leonino). */
function removeNeutralLanguage(text: string): string {
  let result = text
  for (const [regex, standard] of NEUTRAL_TO_STANDARD) {
    result = result.replace(regex, (match) =>
      match.charAt(0) === match.charAt(0).toUpperCase() ? toTitleCase(standard) : standard
    )
  }
  return result
}

function getApiKey(): string | null {
  const raw = process.env.OPENROUTER_API_KEY
  if (!raw || typeof raw !== 'string') return null
  const key = raw.trim().replace(/^["']|["']$/g, '')
  return key.length > 0 ? key : null
}

const CHECK_TIMEOUT_MS = 10_000

/**
 * Verifica se a API OpenRouter está acessível e a chave é válida.
 * Faz uma requisição mínima (uma palavra). Use para health check / diagnóstico.
 */
export async function checkOpenRouterConnection(): Promise<
  { ok: true; model: string } | { ok: false; error: string }
> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return { ok: false, error: 'OPENROUTER_API_KEY não configurada' }
  }

  const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS)

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Responda apenas: OK' }],
        max_tokens: 10,
        temperature: 0
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      const msg = body.slice(0, 200) || res.statusText
      return { ok: false, error: `OpenRouter retornou ${res.status}: ${msg}` }
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
      error?: { message?: string }
    }

    if (data.error?.message) {
      return { ok: false, error: data.error.message }
    }

    const content = data.choices?.[0]?.message?.content?.trim()
    if (content === undefined) {
      return { ok: false, error: 'Resposta da OpenRouter sem conteúdo' }
    }

    return { ok: true, model }
  } catch (err) {
    clearTimeout(timeoutId)
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: message }
  }
}

export type HoroscopeContext = 'daily' | 'weekly'

/**
 * Descreve o nível de energia (1-10) em texto para o prompt da IA.
 */
function getEnergyContext(energyLevel: number | null | undefined): string {
  if (energyLevel == null || energyLevel < 1 || energyLevel > 10) return ''
  if (energyLevel <= 3) return ' A energia do dia para este signo está prevista como baixa (1-3/10): use linguagem que reflita calma, introspecção ou necessidade de descanso; evite sugerir muita agitação ou gasto de energia.'
  if (energyLevel <= 6) return ' A energia do dia está em nível moderado (4-6/10): equilíbrio entre ação e descanso.'
  return ' A energia do dia para este signo está prevista como alta (7-10/10): use linguagem que reflita vitalidade, disposição para ação e aproveitamento do pico de energia; mantenha o texto consistente com esse nível.'
}

/**
 * Envia o texto atual do horóscopo para o OpenRouter pedindo uma versão melhorada.
 * Retorna o texto melhorado ou null em caso de erro/timeout/chave ausente (use o texto original).
 * tone: opcional; define o tom da melhoria (bem_humorada, vibe_sertaneja, resumida).
 * energyLevel: opcional; 1-10, para a IA manter a previsão consistente com muita/pouca energia.
 * context: 'daily' = previsão do dia; 'weekly' = previsão da semana (dateOrWeekStr é usado como rótulo).
 */
export async function improveHoroscopeText(
  originalText: string,
  sign: string,
  dateOrWeekStr: string,
  tone?: ToneOption | string | null,
  context: HoroscopeContext = 'daily',
  energyLevel?: number | null
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
  const energyInstruction = getEnergyContext(energyLevel ?? null)
  const systemPrompt = `Você é um revisor de textos de horóscopo. Sua tarefa é melhorar o texto recebido: deixá-lo mais fluido e envolvente, mantendo o tom de previsão astrológica e o mesmo significado. Responda apenas com o texto melhorado, em um único parágrafo, em português do Brasil. Não invente informações novas; preserve número da sorte e dados mencionados se existirem. Nunca use linguagem neutra ou inclusiva. Use exclusivamente português padrão com concordância de gênero. Para gentílicos dos signos use sempre: ariano (nunca arianx), taurino (nunca taurinx), geminiano (nunca gemininx), canceriano (nunca cancerianx), leonino (nunca leoninx), virginiano (nunca virginx), libriano (nunca librax), escorpiano (nunca escorpianx/scorpiox), sagitariano (nunca sagittarix), capricorniano (nunca capricornx), aquariano (nunca aquarix), pisciano (nunca piscianx). Evite todes, elu, amigue, -x; use todos/todas, ele/ela, amigo/amiga.${toneInstruction} e mude o tom da previsão vide nivel de energia previsto.${energyInstruction}`
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

    return removeNeutralLanguage(content)
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error) {
      console.warn('[OpenRouter]', err.message)
    }
    return null
  }
}

/**
 * Melhora os textos "Energia e simbolismo" (mystical) e "Conselho" (advice) da fase da lua.
 * Retorna { mystical, advice } melhorados ou null em caso de erro (use os originais).
 * A resposta do modelo deve conter exatamente as linhas ENERGIA: e CONSELHO: para parsing.
 */
export async function improveMoonPhaseTexts(
  phaseName: string,
  mystical: string,
  advice: string
): Promise<{ mystical: string; advice: string } | null> {
  const apiKey = getApiKey()
  if (!apiKey || (!mystical.trim() && !advice.trim())) {
    return null
  }

  const systemPrompt = `Você é um revisor de textos sobre fases da lua e astrologia. Sua tarefa é melhorar dois textos curtos: um sobre "Energia e simbolismo" da fase lunar e outro com "Conselho" para o período. Mantenha o significado, deixe mais fluido e envolvente, em português do Brasil. Não invente dados novos. Nunca use linguagem neutra ou inclusiva. Use exclusivamente português padrão; para signos use ariano, leonino, taurino, geminiano, canceriano, virginiano, libriano, escorpiano, sagitariano, capricorniano, aquariano, pisciano (nunca arianx, leoninx, etc.).
Responda EXATAMENTE no formato abaixo, sem outros textos antes ou depois:
ENERGIA:
(um único parágrafo com o texto melhorado da energia/simbolismo)
CONSELHO:
(um único parágrafo com o texto melhorado do conselho)`

  const userPrompt = `Fase: ${phaseName}

Texto atual de Energia e simbolismo:
${mystical}

Texto atual de Conselho:
${advice}

Melhore ambos e responda no formato ENERGIA: / CONSELHO: pedido.`

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
        max_tokens: 600,
        temperature: 0.5
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.warn('[OpenRouter] Moon phase texts:', res.status, body.slice(0, 200))
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

    const energyMatch = content.match(/ENERGIA:\s*([\s\S]*?)(?=CONSELHO:|$)/i)
    const adviceMatch = content.match(/CONSELHO:\s*([\s\S]*?)$/im)
    const improvedMystical = energyMatch?.[1]?.trim()
    const improvedAdvice = adviceMatch?.[1]?.trim()

    if (!improvedMystical && !improvedAdvice) return null

    return {
      mystical: improvedMystical && improvedMystical.length > 0 ? removeNeutralLanguage(improvedMystical) : mystical,
      advice: improvedAdvice && improvedAdvice.length > 0 ? removeNeutralLanguage(improvedAdvice) : advice
    }
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error) {
      console.warn('[OpenRouter]', err.message)
    }
    return null
  }
}

export type DailyExtraTexts = {
  crystal: string
  careerAdvice: string
  practicalAdvice: string
  loveAdvice: string
}

/**
 * Melhora os textos de Cristal, Carreira, Conselho prático e Amor da previsão do dia.
 * Uma única chamada à IA; retorna os quatro textos melhorados ou null em caso de erro.
 */
export async function improveDailyExtraTexts(
  sign: string,
  dateStr: string,
  texts: DailyExtraTexts,
  tone?: ToneOption | string | null
): Promise<DailyExtraTexts | null> {
  const apiKey = getApiKey()
  const hasAny = [texts.crystal, texts.careerAdvice, texts.practicalAdvice, texts.loveAdvice].some((t) => t?.trim())
  if (!apiKey || !hasAny) return null

  const signName = getSignName(sign)
  const toneInstruction =
    tone && TONE_OPTIONS.includes(tone as ToneOption) ? ` ${TONE_PROMPTS[tone as ToneOption]}` : ''
  const systemPrompt = `Você é um revisor de textos de horóscopo. Melhore os quatro textos curtos abaixo (Cristal, Carreira, Conselho prático, Amor) para o signo de ${signName} na data ${dateStr}: deixe cada um mais fluido e envolvente, mantendo o significado e o tom de previsão astrológica. Responda em português do Brasil. Não invente informações novas. Nunca use linguagem neutra ou inclusiva; use português padrão com concordância de gênero (ariano, leonino, etc., nunca arianx, leoninx).${toneInstruction}
Responda EXATAMENTE no formato abaixo, sem outros textos antes ou depois:
CRISTAL:
(uma linha ou frase curta melhorada para o cristal do dia)
CARREIRA:
(uma linha ou frase curta melhorada para conselho de carreira)
CONSELHO_PRATICO:
(uma linha ou frase curta melhorada para conselho prático)
AMOR:
(uma linha ou frase curta melhorada para conselho amoroso)`

  const userPrompt = `Signo: ${signName} - Data: ${dateStr}

Cristal atual: ${(texts.crystal || '').trim() || '(vazio)'}
Carreira atual: ${(texts.careerAdvice || '').trim() || '(vazio)'}
Conselho prático atual: ${(texts.practicalAdvice || '').trim() || '(vazio)'}
Amor atual: ${(texts.loveAdvice || '').trim() || '(vazio)'}

Melhore cada um e responda no formato CRISTAL: / CARREIRA: / CONSELHO_PRATICO: / AMOR: pedido.`

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
        max_tokens: 600,
        temperature: 0.5
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.warn('[OpenRouter] Daily extra texts:', res.status, body.slice(0, 200))
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

    const crystalMatch = content.match(/CRISTAL:\s*([\s\S]*?)(?=CARREIRA:|$)/i)
    const careerMatch = content.match(/CARREIRA:\s*([\s\S]*?)(?=CONSELHO_PRATICO:|$)/i)
    const practicalMatch = content.match(/CONSELHO_PRATICO:\s*([\s\S]*?)(?=AMOR:|$)/i)
    const loveMatch = content.match(/AMOR:\s*([\s\S]*?)$/im)

    const improvedCrystal = crystalMatch?.[1]?.trim()
    const improvedCareer = careerMatch?.[1]?.trim()
    const improvedPractical = practicalMatch?.[1]?.trim()
    const improvedLove = loveMatch?.[1]?.trim()

    const fallback = (improved: string | undefined, original: string) =>
      improved && improved.length > 0 ? removeNeutralLanguage(improved) : original

    return {
      crystal: fallback(improvedCrystal, texts.crystal || ''),
      careerAdvice: fallback(improvedCareer, texts.careerAdvice || ''),
      practicalAdvice: fallback(improvedPractical, texts.practicalAdvice || ''),
      loveAdvice: fallback(improvedLove, texts.loveAdvice || '')
    }
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error) {
      console.warn('[OpenRouter]', err.message)
    }
    return null
  }
}
