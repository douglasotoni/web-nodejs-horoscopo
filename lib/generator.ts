import { Sign, Weekday } from '@prisma/client'

interface GeneratorContext {
  sign: Sign
  weekday: Weekday
  isoWeek: number
  isoYear: number
}

// Temas por signo
const signThemes: Record<Sign, string[]> = {
  aries: ['liderança', 'ação', 'iniciativa', 'coragem', 'competição'],
  taurus: ['estabilidade', 'prazer', 'segurança', 'persistência', 'beleza'],
  gemini: ['comunicação', 'curiosidade', 'versatilidade', 'aprendizado', 'socialização'],
  cancer: ['emoções', 'família', 'intuição', 'proteção', 'memórias'],
  leo: ['criatividade', 'expressão', 'reconhecimento', 'generosidade', 'diversão'],
  virgo: ['organização', 'perfeccionismo', 'saúde', 'serviço', 'análise'],
  libra: ['harmonia', 'relacionamentos', 'beleza', 'justiça', 'diplomacia'],
  scorpio: ['transformação', 'intensidade', 'mistério', 'poder', 'profundidade'],
  sagittarius: ['aventura', 'filosofia', 'liberdade', 'expansão', 'otimismo'],
  capricorn: ['ambição', 'disciplina', 'responsabilidade', 'estrutura', 'sucesso'],
  aquarius: ['inovação', 'liberdade', 'humanitarismo', 'originalidade', 'amizade'],
  pisces: ['intuição', 'compaixão', 'criatividade', 'espiritualidade', 'sensibilidade']
}

// Temas por dia da semana
const weekdayThemes: Record<Weekday, string[]> = {
  monday: ['organização', 'planejamento', 'novos começos', 'foco profissional'],
  tuesday: ['ação', 'decisões', 'energia', 'produtividade'],
  wednesday: ['comunicação', 'negociações', 'meio-termo', 'equilíbrio'],
  thursday: ['expansão', 'aprendizado', 'oportunidades', 'crescimento'],
  friday: ['socialização', 'criatividade', 'prazer', 'celebração'],
  saturday: ['descanso', 'reflexão', 'pessoas próximas', 'autocuidado'],
  sunday: ['espiritualidade', 'planejamento', 'família', 'preparação']
}

// Frases template
const templates = {
  positive: [
    'Este é um momento propício para {action}',
    'As energias estão favoráveis para {action}',
    'Você terá oportunidades de {action}',
    'Mantenha o foco em {focus}',
    'Este período favorece {area}'
  ],
  caution: [
    'Evite tomar decisões impulsivas',
    'Cuidado com excessos',
    'Pense bem antes de agir',
    'Mantenha o equilíbrio',
    'Não se apresse em conclusões'
  ],
  advice: [
    'Invista em {investment}',
    'Dedique tempo para {dedication}',
    'Priorize {priority}',
    'Aproveite para {enjoy}',
    'Foque em {focus}'
  ]
}

// Gera número da sorte baseado em seed determinístico
function generateLuckyNumber(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash % 60) + 1 // 1-60
}

function getRandomElement<T>(array: T[], seed: number): T {
  return array[seed % array.length]
}

function generateSeed(context: GeneratorContext): string {
  return `${context.sign}-${context.weekday}-${context.isoWeek}-${context.isoYear}`
}

export function generateDailyPrediction(context: GeneratorContext): {
  text: string
  luckyNumber: number
} {
  const seed = generateSeed(context)
  const seedNum = generateLuckyNumber(seed)
  
  const signTheme = getRandomElement(signThemes[context.sign], seedNum)
  const weekdayTheme = getRandomElement(weekdayThemes[context.weekday], seedNum + 1)
  
  const sentences: string[] = []
  
  // Primeira frase - positiva com tema do signo
  const positiveTemplate = getRandomElement(templates.positive, seedNum)
  sentences.push(positiveTemplate
    .replace('{action}', `explorar ${signTheme}`)
    .replace('{focus}', signTheme)
    .replace('{area}', signTheme)
  )
  
  // Segunda frase - tema do dia da semana
  const weekdayAction = weekdayThemes[context.weekday][seedNum % weekdayThemes[context.weekday].length]
  sentences.push(`O ${context.weekday === 'monday' ? 'início' : context.weekday === 'friday' ? 'fim' : 'meio'} da semana favorece ${weekdayAction}.`)
  
  // Terceira frase - conselho ou advertência
  if (seedNum % 3 === 0) {
    const advice = getRandomElement(templates.advice, seedNum + 2)
    sentences.push(advice
      .replace('{investment}', signTheme)
      .replace('{dedication}', weekdayTheme)
      .replace('{priority}', signTheme)
      .replace('{enjoy}', weekdayTheme)
      .replace('{focus}', signTheme)
    )
  } else {
    sentences.push(getRandomElement(templates.caution, seedNum + 3))
  }
  
  // Quarta frase opcional (2-4 frases)
  if (seedNum % 2 === 0) {
    sentences.push(`Seu número da sorte é ${generateLuckyNumber(seed + 'extra')}.`)
  }
  
  const text = sentences.join(' ')
  const luckyNumber = generateLuckyNumber(seed)
  
  return { text, luckyNumber }
}

export function generateWeeklyPrediction(context: Omit<GeneratorContext, 'weekday'>): {
  text: string
  luckyNumber: number
} {
  const seed = `${context.sign}-week-${context.isoWeek}-${context.isoYear}`
  const seedNum = generateLuckyNumber(seed)
  
  const signTheme = getRandomElement(signThemes[context.sign], seedNum)
  
  const sentences: string[] = []
  
  // Abertura da semana
  sentences.push(`Esta semana será marcada por ${signTheme} para ${context.sign}.`)
  
  // Áreas de foco
  const areas = ['trabalho', 'amor', 'finanças', 'saúde', 'família']
  const focusArea1 = areas[seedNum % areas.length]
  const focusArea2 = areas[(seedNum + 1) % areas.length]
  
  sentences.push(`As áreas de ${focusArea1} e ${focusArea2} merecem atenção especial.`)
  
  // Conselho principal
  const advice = getRandomElement(templates.advice, seedNum + 2)
  sentences.push(advice
    .replace('{investment}', signTheme)
    .replace('{dedication}', 'seus projetos pessoais')
    .replace('{priority}', 'equilíbrio')
    .replace('{enjoy}', 'as oportunidades que surgirem')
    .replace('{focus}', signTheme)
  )
  
  // Advertência
  sentences.push(getRandomElement(templates.caution, seedNum + 3))
  
  // Mensagem final
  sentences.push(`Mantenha-se atento aos sinais e confie em sua intuição.`)
  
  // Frase extra opcional (3-6 frases)
  if (seedNum % 3 !== 0) {
    sentences.push(`Aproveite os momentos de calma para recarregar suas energias.`)
  }
  
  const text = sentences.join(' ')
  const luckyNumber = generateLuckyNumber(seed)
  
  return { text, luckyNumber }
}

