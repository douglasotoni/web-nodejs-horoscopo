// Versão client-side do gerador (sem dependências do Prisma)

export type Sign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces'
export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

interface GeneratorContext {
  sign: Sign
  weekday: Weekday
  isoWeek: number
  isoYear: number
}

function generateLuckyNumber(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash % 60) + 1
}

function getRandomElement<T>(array: T[], seed: number): T {
  return array[seed % array.length]
}

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

const weekdayThemes: Record<Weekday, string[]> = {
  monday: ['organização', 'planejamento', 'novos começos', 'foco profissional'],
  tuesday: ['ação', 'decisões', 'energia', 'produtividade'],
  wednesday: ['comunicação', 'negociações', 'meio-termo', 'equilíbrio'],
  thursday: ['expansão', 'aprendizado', 'oportunidades', 'crescimento'],
  friday: ['socialização', 'criatividade', 'prazer', 'celebração'],
  saturday: ['descanso', 'reflexão', 'pessoas próximas', 'autocuidado'],
  sunday: ['espiritualidade', 'planejamento', 'família', 'preparação']
}

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

export function generateDailyPredictionClient(context: GeneratorContext): {
  text: string
  luckyNumber: number
} {
  const seed = `${context.sign}-${context.weekday}-${context.isoWeek}-${context.isoYear}`
  const seedNum = generateLuckyNumber(seed)
  
  const signTheme = getRandomElement(signThemes[context.sign], seedNum)
  const weekdayTheme = getRandomElement(weekdayThemes[context.weekday], seedNum + 1)
  
  const sentences: string[] = []
  
  const positiveTemplate = getRandomElement(templates.positive, seedNum)
  sentences.push(positiveTemplate
    .replace('{action}', `explorar ${signTheme}`)
    .replace('{focus}', signTheme)
    .replace('{area}', signTheme)
  )
  
  const weekdayAction = weekdayThemes[context.weekday][seedNum % weekdayThemes[context.weekday].length]
  sentences.push(`O ${context.weekday === 'monday' ? 'início' : context.weekday === 'friday' ? 'fim' : 'meio'} da semana favorece ${weekdayAction}.`)
  
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
  
  if (seedNum % 2 === 0) {
    sentences.push(`Seu número da sorte é ${generateLuckyNumber(seed + 'extra')}.`)
  }
  
  const text = sentences.join(' ')
  const luckyNumber = generateLuckyNumber(seed)
  
  return { text, luckyNumber }
}

export function generateWeeklyPredictionClient(context: Omit<GeneratorContext, 'weekday'>): {
  text: string
  luckyNumber: number
} {
  const seed = `${context.sign}-week-${context.isoWeek}-${context.isoYear}`
  const seedNum = generateLuckyNumber(seed)
  
  const signTheme = getRandomElement(signThemes[context.sign], seedNum)
  
  const sentences: string[] = []
  
  sentences.push(`Esta semana será marcada por ${signTheme} para ${context.sign}.`)
  
  const areas = ['trabalho', 'amor', 'finanças', 'saúde', 'família']
  const focusArea1 = areas[seedNum % areas.length]
  const focusArea2 = areas[(seedNum + 1) % areas.length]
  
  sentences.push(`As áreas de ${focusArea1} e ${focusArea2} merecem atenção especial.`)
  
  const advice = getRandomElement(templates.advice, seedNum + 2)
  sentences.push(advice
    .replace('{investment}', signTheme)
    .replace('{dedication}', 'seus projetos pessoais')
    .replace('{priority}', 'equilíbrio')
    .replace('{enjoy}', 'as oportunidades que surgirem')
    .replace('{focus}', signTheme)
  )
  
  sentences.push(getRandomElement(templates.caution, seedNum + 3))
  sentences.push(`Mantenha-se atento aos sinais e confie em sua intuição.`)
  
  if (seedNum % 3 !== 0) {
    sentences.push(`Aproveite os momentos de calma para recarregar suas energias.`)
  }
  
  const text = sentences.join(' ')
  const luckyNumber = generateLuckyNumber(seed)
  
  return { text, luckyNumber }
}

