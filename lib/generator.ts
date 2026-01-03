import { Sign, Weekday } from '@prisma/client'

interface GeneratorContext {
  sign: Sign
  weekday: Weekday
  isoWeek: number
  isoYear: number
}

// Temas expandidos por signo (12-15 temas cada)
const signThemes: Record<Sign, string[]> = {
  aries: [
    'liderança', 'ação', 'iniciativa', 'coragem', 'competição',
    'independência', 'pioneirismo', 'determinação', 'entusiasmo', 'espontaneidade',
    'aventura', 'desafios', 'novos projetos', 'tomada de decisões', 'energia'
  ],
  taurus: [
    'estabilidade', 'prazer', 'segurança', 'persistência', 'beleza',
    'paciência', 'sensualidade', 'materialismo', 'determinação', 'lealdade',
    'conforto', 'natureza', 'arte', 'valores', 'tradição'
  ],
  gemini: [
    'comunicação', 'curiosidade', 'versatilidade', 'aprendizado', 'socialização',
    'adaptabilidade', 'inteligência', 'criatividade', 'humor', 'agilidade mental',
    'networking', 'educação', 'viagens', 'escrita', 'expressão'
  ],
  cancer: [
    'emoções', 'família', 'intuição', 'proteção', 'memórias',
    'cuidado', 'nutrição', 'lar', 'tradição familiar', 'sensibilidade',
    'compaixão', 'imaginação', 'segurança emocional', 'vínculos', 'nostalgia'
  ],
  leo: [
    'criatividade', 'expressão', 'reconhecimento', 'generosidade', 'diversão',
    'liderança', 'confiança', 'orgulho', 'teatro', 'romance',
    'crianças', 'lazer', 'luxo', 'autoexpressão', 'magnanimidade'
  ],
  virgo: [
    'organização', 'perfeccionismo', 'saúde', 'serviço', 'análise',
    'modéstia', 'trabalho', 'praticidade', 'atenção aos detalhes', 'eficência',
    'rotina', 'bem-estar', 'purificação', 'crítica construtiva', 'disciplina'
  ],
  libra: [
    'harmonia', 'relacionamentos', 'beleza', 'justiça', 'diplomacia',
    'parcerias', 'equilíbrio', 'estética', 'sociabilidade', 'cooperação',
    'arte', 'casamento', 'negociação', 'graça', 'refinamento'
  ],
  scorpio: [
    'transformação', 'intensidade', 'mistério', 'poder', 'profundidade',
    'paixão', 'regeneração', 'psicologia', 'segredos', 'intensidade emocional',
    'investigação', 'tabus', 'recursos compartilhados', 'intuição profunda', 'renovação'
  ],
  sagittarius: [
    'aventura', 'filosofia', 'liberdade', 'expansão', 'otimismo',
    'viagens', 'aprendizado superior', 'exploração', 'honestidade', 'busca da verdade',
    'esportes', 'cultura', 'religião', 'ensino', 'abertura mental'
  ],
  capricorn: [
    'ambição', 'disciplina', 'responsabilidade', 'estrutura', 'sucesso',
    'autoridade', 'tradição', 'perseverança', 'organização', 'realismo',
    'carreira', 'status', 'planejamento de longo prazo', 'maturidade', 'conquistas'
  ],
  aquarius: [
    'inovação', 'liberdade', 'humanitarismo', 'originalidade', 'amizade',
    'revolução', 'tecnologia', 'futuro', 'independência', 'igualdade',
    'grupos', 'causas sociais', 'invenção', 'excentricidade', 'progresso'
  ],
  pisces: [
    'intuição', 'compaixão', 'criatividade', 'espiritualidade', 'sensibilidade',
    'sonhos', 'arte', 'sacrifício', 'psicologia', 'misticismo',
    'meditação', 'empatia', 'ilusão', 'cura', 'transcendência'
  ]
}

// Temas expandidos por dia da semana (8-10 temas cada)
const weekdayThemes: Record<Weekday, string[]> = {
  monday: [
    'organização', 'planejamento', 'novos começos', 'foco profissional',
    'produtividade', 'estabelecimento de metas', 'energia renovada', 'determinação semanal',
    'priorização', 'estruturação'
  ],
  tuesday: [
    'ação', 'decisões', 'energia', 'produtividade',
    'iniciativa', 'coragem', 'movimento', 'execução de planos',
    'dinamismo', 'resolução de problemas'
  ],
  wednesday: [
    'comunicação', 'negociações', 'meio-termo', 'equilíbrio',
    'colaboração', 'diálogo', 'networking', 'troca de ideias',
    'mediação', 'harmonia'
  ],
  thursday: [
    'expansão', 'aprendizado', 'oportunidades', 'crescimento',
    'abundância', 'prosperidade', 'desenvolvimento', 'exploração',
    'abertura', 'progresso'
  ],
  friday: [
    'socialização', 'criatividade', 'prazer', 'celebração',
    'diversão', 'relacionamentos', 'expressão artística', 'relaxamento',
    'alegria', 'conquistas da semana'
  ],
  saturday: [
    'descanso', 'reflexão', 'pessoas próximas', 'autocuidado',
    'introspecção', 'recarregar energias', 'hobbies', 'tranquilidade',
    'renovação', 'preparação para o domingo'
  ],
  sunday: [
    'espiritualidade', 'planejamento', 'família', 'preparação',
    'contemplação', 'gratidão', 'organização da semana', 'conexão interior',
    'descanso ativo', 'reflexão profunda'
  ]
}

// Templates expandidos (20 de cada tipo)
const templates = {
  positive: [
    'Este é um momento propício para {action}',
    'As energias estão favoráveis para {action}',
    'Você terá oportunidades de {action}',
    'Mantenha o foco em {focus}',
    'Este período favorece {area}',
    'As estrelas alinham-se para {action}',
    'Um período excelente para {action}',
    'As condições estão ideais para {action}',
    'Este é o momento certo para {action}',
    'Você está em sintonia com {area}',
    'As oportunidades surgem em {area}',
    'Este ciclo favorece especialmente {action}',
    'Um tempo de crescimento em {area}',
    'As energias cósmicas apoiam {action}',
    'Este período traz potencial para {action}',
    'Você pode se destacar em {area}',
    'As circunstâncias favorecem {action}',
    'Um momento de expansão em {area}',
    'As vibrações positivas envolvem {action}',
    'Este é um período de realização em {area}'
  ],
  caution: [
    'Evite tomar decisões impulsivas',
    'Cuidado com excessos',
    'Pense bem antes de agir',
    'Mantenha o equilíbrio',
    'Não se apresse em conclusões',
    'Seja cauteloso com mudanças bruscas',
    'Evite conflitos desnecessários',
    'Não ignore sinais de alerta',
    'Mantenha a calma em situações tensas',
    'Evite sobrecarga de responsabilidades',
    'Cuidado com promessas que não pode cumprir',
    'Não deixe emoções guiarem decisões importantes',
    'Evite procrastinação em questões urgentes',
    'Mantenha-se alerta a detalhes importantes',
    'Não subestime desafios que surgirem',
    'Cuidado com pessoas que podem te influenciar negativamente',
    'Evite gastos desnecessários',
    'Não ignore sua intuição quando ela alertar',
    'Mantenha limites saudáveis',
    'Evite se comprometer além de suas capacidades'
  ],
  advice: [
    'Invista em {investment}',
    'Dedique tempo para {dedication}',
    'Priorize {priority}',
    'Aproveite para {enjoy}',
    'Foque em {focus}',
    'Explore novas possibilidades em {area}',
    'Desenvolva suas habilidades em {focus}',
    'Conecte-se com pessoas que compartilham {area}',
    'Invista energia em {investment}',
    'Cultive {dedication} em sua vida',
    'Dê atenção especial a {priority}',
    'Aproveite as oportunidades em {area}',
    'Trabalhe em {focus} com dedicação',
    'Explore o potencial de {area}',
    'Desenvolva estratégias para {investment}',
    'Mantenha o foco em {priority}',
    'Aproveite para fortalecer {dedication}',
    'Invista em relacionamentos relacionados a {area}',
    'Explore novas formas de {enjoy}',
    'Dedique-se a desenvolver {focus}'
  ],
  relationship: [
    'Momento favorável para fortalecer vínculos',
    'Comunicação aberta trará benefícios',
    'Dedique tempo para pessoas importantes',
    'Expressar sentimentos será positivo',
    'Novas conexões podem surgir',
    'Harmonia nos relacionamentos está em alta',
    'Momento de reconciliação se necessário',
    'Aprofundar relacionamentos existentes',
    'Compartilhar experiências fortalece laços',
    'Escutar atentamente é essencial'
  ],
  career: [
    'Oportunidades profissionais se apresentam',
    'Momento de demonstrar suas capacidades',
    'Networking pode trazer benefícios',
    'Projetos em andamento ganham impulso',
    'Reconhecimento pelo trabalho é possível',
    'Novas responsabilidades podem surgir',
    'Colaboração com colegas será produtiva',
    'Momento de planejar próximos passos',
    'Desenvolvimento de habilidades é favorecido',
    'Tomar iniciativa trará resultados positivos'
  ],
  health: [
    'Cuidar do bem-estar físico é importante',
    'Equilíbrio entre trabalho e descanso é essencial',
    'Atividades físicas trarão benefícios',
    'Atenção à alimentação é recomendada',
    'Momento de recarregar energias',
    'Práticas de relaxamento serão benéficas',
    'Ritmo adequado evita esgotamento',
    'Cuidar da saúde mental é prioridade',
    'Descanso adequado é fundamental',
    'Atividades ao ar livre são recomendadas'
  ]
}

// Hash melhorado usando algoritmo djb2
function generateLuckyNumber(seed: string): number {
  let hash = 5381
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) + seed.charCodeAt(i)
  }
  return Math.abs(hash % 60) + 1 // 1-60
}

// Gera múltiplos números de seed para melhor distribuição
function generateSeedNumbers(seed: string, count: number): number[] {
  const numbers: number[] = []
  for (let i = 0; i < count; i++) {
    const seedWithIndex = `${seed}-${i}`
    numbers.push(generateLuckyNumber(seedWithIndex))
  }
  return numbers
}

function getRandomElement<T>(array: T[], seed: number): T {
  return array[Math.abs(seed) % array.length]
}

function generateSeed(context: GeneratorContext): string {
  return `${context.sign}-${context.weekday}-${context.isoWeek}-${context.isoYear}`
}

// Contexto sazonal e mensal
function getSeasonalContext(isoWeek: number, isoYear: number): {
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  month: number
  monthName: string
  isMonthStart: boolean
  isMonthEnd: boolean
  date: Date
} {
  // Aproximação: semana ISO 1 geralmente é início de janeiro
  const weekDate = new Date(isoYear, 0, 1)
  weekDate.setDate(weekDate.getDate() + (isoWeek - 1) * 7)
  
  const month = weekDate.getMonth() + 1
  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]
  
  let season: 'spring' | 'summer' | 'autumn' | 'winter'
  if (month >= 3 && month <= 5) season = 'spring'
  else if (month >= 6 && month <= 8) season = 'summer'
  else if (month >= 9 && month <= 11) season = 'autumn'
  else season = 'winter'
  
  const dayOfMonth = weekDate.getDate()
  const isMonthStart = dayOfMonth <= 7
  const isMonthEnd = dayOfMonth >= 23
  
  return {
    season,
    month,
    monthName: monthNames[month - 1],
    isMonthStart,
    isMonthEnd,
    date: weekDate
  }
}

// Calcula a fase da lua para uma data específica
// Baseado em uma lua nova de referência: 11 de janeiro de 2000, 20:24 UTC
function getMoonPhase(date: Date): {
  phase: 'new' | 'waxing' | 'full' | 'waning'
  day: number // dia do ciclo (0-29)
  name: string // nome em português
  intensity: number // 0-1, intensidade da fase
} {
  // Data de referência: lua nova conhecida (11 de janeiro de 2000, 20:24 UTC)
  const referenceNewMoon = new Date(Date.UTC(2000, 0, 11, 20, 24, 0))
  
  // Ciclo lunar médio: 29.53058867 dias
  const lunarCycle = 29.53058867
  
  // Diferença em dias desde a lua nova de referência
  const diffMs = date.getTime() - referenceNewMoon.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  
  // Posição no ciclo atual (0-29.53)
  const cyclePosition = ((diffDays % lunarCycle) + lunarCycle) % lunarCycle
  
  // Determina a fase
  let phase: 'new' | 'waxing' | 'full' | 'waning'
  let name: string
  let intensity: number
  
  if (cyclePosition < 1.84) {
    phase = 'new'
    name = 'Lua Nova'
    intensity = cyclePosition / 1.84
  } else if (cyclePosition < 7.38) {
    phase = 'waxing'
    name = 'Lua Crescente'
    intensity = (cyclePosition - 1.84) / (7.38 - 1.84)
  } else if (cyclePosition < 14.77) {
    phase = 'waxing'
    name = 'Lua Crescente'
    intensity = (cyclePosition - 1.84) / (14.77 - 1.84)
  } else if (cyclePosition < 16.61) {
    phase = 'full'
    name = 'Lua Cheia'
    intensity = 1 - Math.abs(cyclePosition - 14.77) / (16.61 - 14.77)
  } else if (cyclePosition < 22.15) {
    phase = 'waning'
    name = 'Lua Minguante'
    intensity = (cyclePosition - 16.61) / (22.15 - 16.61)
  } else if (cyclePosition < 29.53) {
    phase = 'waning'
    name = 'Lua Minguante'
    intensity = (cyclePosition - 16.61) / (29.53 - 16.61)
  } else {
    phase = 'new'
    name = 'Lua Nova'
    intensity = 0
  }
  
  return {
    phase,
    day: Math.floor(cyclePosition),
    name,
    intensity: Math.min(1, Math.max(0, intensity))
  }
}

// Temas por fase da lua
const moonPhaseThemes: Record<'new' | 'waxing' | 'full' | 'waning', string[]> = {
  new: [
    'novos começos', 'plantio de sementes', 'introspecção', 'planejamento',
    'renovações', 'início de ciclos', 'reflexão profunda', 'preparação',
    'limpeza energética', 'estabelecimento de intenções'
  ],
  waxing: [
    'crescimento', 'ação', 'desenvolvimento', 'expansão',
    'progresso', 'movimento', 'construção', 'acúmulo de energia',
    'manifestação', 'tomada de iniciativa'
  ],
  full: [
    'culminação', 'clareza', 'realização', 'emoções intensas',
    'iluminação', 'completude', 'celebração', 'revelações',
    'pico de energia', 'momento de colheita'
  ],
  waning: [
    'liberação', 'reflexão', 'finalização', 'desapego',
    'conclusão de ciclos', 'preparação para o novo', 'gratidão',
    'deixar ir', 'limpeza', 'descanso necessário'
  ]
}

// Frases específicas por fase da lua
const moonPhaseMessages: Record<'new' | 'waxing' | 'full' | 'waning', string[]> = {
  new: [
    'A Lua Nova favorece novos começos e plantio de sementes.',
    'Este é um momento propício para estabelecer novas intenções.',
    'A energia da Lua Nova traz oportunidades de renovação.',
    'Momento ideal para planejar e refletir sobre seus objetivos.'
  ],
  waxing: [
    'A Lua Crescente favorece o crescimento e desenvolvimento.',
    'Este período é ideal para colocar planos em ação.',
    'A energia crescente da lua apoia seus projetos.',
    'Momento de construir e expandir suas realizações.'
  ],
  full: [
    'A Lua Cheia traz clareza e culminação de processos.',
    'Este é um momento de realização e celebração.',
    'A energia da Lua Cheia intensifica emoções e intuições.',
    'Momento de colher os frutos de seus esforços.'
  ],
  waning: [
    'A Lua Minguante favorece reflexão e liberação.',
    'Este período é ideal para finalizar e deixar ir.',
    'A energia minguante da lua apoia a conclusão de ciclos.',
    'Momento de preparação para novos começos que virão.'
  ]
}

const seasonalThemes: Record<'spring' | 'summer' | 'autumn' | 'winter', string[]> = {
  spring: ['renovação', 'crescimento', 'novos começos', 'florescimento', 'energia renovada'],
  summer: ['vitalidade', 'expansão', 'celebração', 'calor humano', 'atividades ao ar livre'],
  autumn: ['colheita', 'reflexão', 'organização', 'preparação', 'mudanças'],
  winter: ['introspecção', 'planejamento', 'calor interno', 'reflexão profunda', 'preparação para o futuro']
}

// Validação de qualidade e diversidade
function validatePredictionQuality(sentences: string[], seedNums: number[]): boolean {
  // Verifica se há repetição excessiva de palavras
  const allWords = sentences.join(' ').toLowerCase().split(/\s+/)
  const wordCounts = new Map<string, number>()
  
  for (const word of allWords) {
    if (word.length > 3) { // Ignora palavras muito curtas
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
    }
  }
  
  // Se alguma palavra aparece mais de 3 vezes, pode ser repetitiva
  for (const count of wordCounts.values()) {
    if (count > 3) return false
  }
  
  // Verifica se há variedade suficiente nos números de seed
  const uniqueSeeds = new Set(seedNums.map(n => n % 10))
  if (uniqueSeeds.size < 3) return false
  
  return true
}

export function generateDailyPrediction(context: GeneratorContext): {
  text: string
  luckyNumber: number
} {
  const seasonal = getSeasonalContext(context.isoWeek, context.isoYear)
  const moonPhase = getMoonPhase(seasonal.date)
  
  // Incluir fase da lua na seed para determinismo
  const seed = `${context.sign}-${context.weekday}-${context.isoWeek}-${context.isoYear}-${moonPhase.phase}`
  const seedNum = generateLuckyNumber(seed)
  const seedNums = generateSeedNumbers(seed, 12)
  
  const signTheme = getRandomElement(signThemes[context.sign], seedNums[0])
  const weekdayTheme = getRandomElement(weekdayThemes[context.weekday], seedNums[1])
  const seasonalTheme = getRandomElement(seasonalThemes[seasonal.season], seedNums[2])
  const moonTheme = getRandomElement(moonPhaseThemes[moonPhase.phase], seedNums[3])
  
  const sentences: string[] = []
  let attempts = 0
  const maxAttempts = 5
  
  // Tenta gerar até obter uma previsão de qualidade
  while (attempts < maxAttempts) {
    sentences.length = 0
    
    // Primeira frase - positiva com tema do signo
    const positiveTemplate = getRandomElement(templates.positive, seedNums[3])
    sentences.push(positiveTemplate
      .replace('{action}', `explorar ${signTheme}`)
      .replace('{focus}', signTheme)
      .replace('{area}', signTheme)
    )
    
    // Segunda frase - tema do dia da semana
    const weekdayAction = getRandomElement(weekdayThemes[context.weekday], seedNums[4])
    const weekPosition = context.weekday === 'monday' ? 'início' : 
                        context.weekday === 'friday' ? 'fim' : 
                        context.weekday === 'sunday' ? 'final' : 'meio'
    sentences.push(`O ${weekPosition} da semana favorece ${weekdayAction}.`)
    
    // Contexto sazonal (opcional, 50% de chance)
    if (seedNums[5] % 2 === 0) {
      if (seasonal.isMonthStart) {
        sentences.push(`O início de ${seasonal.monthName} traz energias de ${seasonalTheme}.`)
      } else if (seasonal.isMonthEnd) {
        sentences.push(`O final de ${seasonal.monthName} favorece ${seasonalTheme}.`)
      }
    }
    
    // Fase da lua (40% de chance, mas mais provável em fases intensas)
    const moonChance = moonPhase.intensity > 0.7 ? 0.6 : 0.4
    if (seedNums[4] % 10 < (moonChance * 10)) {
      const moonMessage = getRandomElement(moonPhaseMessages[moonPhase.phase], seedNums[5])
      sentences.push(moonMessage)
    } else if (seedNums[4] % 10 < 5) {
      // Menção mais sutil à fase da lua
      sentences.push(`A energia da ${moonPhase.name.toLowerCase()} favorece ${moonTheme}.`)
    }
    
    // Terceira frase - conselho ou advertência
    if (seedNums[6] % 3 === 0) {
      const advice = getRandomElement(templates.advice, seedNums[7])
      sentences.push(advice
        .replace('{investment}', signTheme)
        .replace('{dedication}', weekdayTheme)
        .replace('{priority}', signTheme)
        .replace('{enjoy}', weekdayTheme)
        .replace('{focus}', signTheme)
        .replace('{area}', signTheme)
      )
    } else {
      sentences.push(getRandomElement(templates.caution, seedNums[8]))
    }
    
    // Área específica (relacionamentos, carreira, saúde) - 50% de chance
    if (seedNums[9] % 2 === 0) {
      const areaType = seedNums[9] % 3
      if (areaType === 0) {
        sentences.push(getRandomElement(templates.relationship, seedNums[0]))
      } else if (areaType === 1) {
        sentences.push(getRandomElement(templates.career, seedNums[1]))
      } else {
        sentences.push(getRandomElement(templates.health, seedNums[2]))
      }
    }
    
    // Combinação signo + fase da lua (30% de chance)
    if (seedNums[10] % 10 < 3) {
      const signMoonCombination = `${signTheme} alinhado com a energia da ${moonPhase.name.toLowerCase()}`
      sentences.push(`Seu signo de ${context.sign} está em sintonia com ${signMoonCombination}.`)
    }
    
    // Valida qualidade
    if (validatePredictionQuality(sentences, seedNums) || attempts === maxAttempts - 1) {
      break
    }
    attempts++
  }
  
  const text = sentences.join(' ')
  const luckyNumber = generateLuckyNumber(seed)
  
  // Adicionar número da sorte no texto (sempre no final)
  const textWithLuckyNumber = text + ` Seu número da sorte é ${luckyNumber}.`
  
  return { text: textWithLuckyNumber, luckyNumber }
}

export function generateWeeklyPrediction(context: Omit<GeneratorContext, 'weekday'>): {
  text: string
  luckyNumber: number
} {
  const seasonal = getSeasonalContext(context.isoWeek, context.isoYear)
  const moonPhase = getMoonPhase(seasonal.date)
  
  // Incluir fase da lua na seed para determinismo
  const seed = `${context.sign}-week-${context.isoWeek}-${context.isoYear}-${moonPhase.phase}`
  const seedNum = generateLuckyNumber(seed)
  const seedNums = generateSeedNumbers(seed, 14)
  
  const signTheme = getRandomElement(signThemes[context.sign], seedNums[0])
  const seasonalTheme = getRandomElement(seasonalThemes[seasonal.season], seedNums[1])
  const moonTheme = getRandomElement(moonPhaseThemes[moonPhase.phase], seedNums[2])
  
  const sentences: string[] = []
  let attempts = 0
  const maxAttempts = 5
  
  while (attempts < maxAttempts) {
    sentences.length = 0
    
    // Abertura da semana
    const openingVariations = [
      `Esta semana será marcada por ${signTheme} para ${context.sign}.`,
      `Os astros indicam um período de ${signTheme} para ${context.sign}.`,
      `A semana traz energias de ${signTheme} para ${context.sign}.`,
      `Um ciclo de ${signTheme} se inicia para ${context.sign}.`
    ]
    sentences.push(getRandomElement(openingVariations, seedNums[2]))
    
    // Contexto sazonal
    if (seedNums[3] % 3 === 0) {
      sentences.push(`A energia de ${seasonal.monthName} favorece ${seasonalTheme}.`)
    }
    
    // Fase da lua (sempre incluída em previsões semanais)
    const moonMessage = getRandomElement(moonPhaseMessages[moonPhase.phase], seedNums[4])
    sentences.push(moonMessage)
    
    // Áreas de foco
    const areas = ['trabalho', 'amor', 'finanças', 'saúde', 'família', 'criatividade', 'aprendizado']
    const focusArea1 = getRandomElement(areas, seedNums[4])
    let focusArea2 = getRandomElement(areas, seedNums[5])
    // Garante que as áreas sejam diferentes
    while (focusArea2 === focusArea1) {
      focusArea2 = getRandomElement(areas, seedNums[5] + 1)
    }
    
    sentences.push(`As áreas de ${focusArea1} e ${focusArea2} merecem atenção especial.`)
    
    // Conselho principal
    const advice = getRandomElement(templates.advice, seedNums[6])
    sentences.push(advice
      .replace('{investment}', signTheme)
      .replace('{dedication}', 'seus projetos pessoais')
      .replace('{priority}', 'equilíbrio')
      .replace('{enjoy}', 'as oportunidades que surgirem')
      .replace('{focus}', signTheme)
      .replace('{area}', signTheme)
    )
    
    // Advertência
    sentences.push(getRandomElement(templates.caution, seedNums[7]))
    
    // Área específica
    const areaType = seedNums[8] % 3
    if (areaType === 0) {
      sentences.push(getRandomElement(templates.relationship, seedNums[9]))
    } else if (areaType === 1) {
      sentences.push(getRandomElement(templates.career, seedNums[10]))
    } else {
      sentences.push(getRandomElement(templates.health, seedNums[11]))
    }
    
    // Combinação signo + fase da lua (50% de chance em semanais)
    if (seedNums[12] % 2 === 0) {
      const signMoonCombination = `${signTheme} em harmonia com a ${moonPhase.name.toLowerCase()}`
      sentences.push(`A energia de ${context.sign} está alinhada com ${signMoonCombination}, potencializando ${moonTheme}.`)
    }
    
    // Mensagem final
    const finalMessages = [
      'Mantenha-se atento aos sinais e confie em sua intuição.',
      'Esteja aberto às oportunidades que o universo oferece.',
      'Confie no processo e mantenha a fé em seus objetivos.',
      'A sabedoria está em encontrar o equilíbrio entre ação e paciência.'
    ]
    sentences.push(getRandomElement(finalMessages, seedNums[0]))
    
    // Frase extra opcional
    if (seedNums[1] % 3 !== 0) {
      const extraMessages = [
        'Aproveite os momentos de calma para recarregar suas energias.',
        'Lembre-se de que cada dia traz novas possibilidades.',
        'A paciência será sua aliada nesta semana.',
        'Mantenha-se conectado com suas metas e valores.'
      ]
      sentences.push(getRandomElement(extraMessages, seedNums[2]))
    }
    
    // Valida qualidade
    if (validatePredictionQuality(sentences, seedNums) || attempts === maxAttempts - 1) {
      break
    }
    attempts++
  }
  
  const text = sentences.join(' ')
  const luckyNumber = generateLuckyNumber(seed)
  
  // Adicionar número da sorte no texto (sempre no final)
  const textWithLuckyNumber = text + ` Seu número da sorte é ${luckyNumber}.`
  
  return { text: textWithLuckyNumber, luckyNumber }
}
