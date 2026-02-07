// Versão client-side do gerador (sem dependências do Prisma)

export type Sign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces'
export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

interface GeneratorContext {
  sign: Sign
  weekday: Weekday
  isoWeek: number
  isoYear: number
}

// Hash melhorado usando algoritmo djb2 (mais robusto que o anterior)
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
    'renovação', 'início de ciclos', 'reflexão profunda', 'preparação',
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

// 1. Elementos e qualidades astrológicas
const signElements: Record<Sign, 'fogo' | 'terra' | 'ar' | 'água'> = {
  aries: 'fogo',
  taurus: 'terra',
  gemini: 'ar',
  cancer: 'água',
  leo: 'fogo',
  virgo: 'terra',
  libra: 'ar',
  scorpio: 'água',
  sagittarius: 'fogo',
  capricorn: 'terra',
  aquarius: 'ar',
  pisces: 'água'
}

const signQualities: Record<Sign, 'cardinal' | 'fixo' | 'mutável'> = {
  aries: 'cardinal',
  taurus: 'fixo',
  gemini: 'mutável',
  cancer: 'cardinal',
  leo: 'fixo',
  virgo: 'mutável',
  libra: 'cardinal',
  scorpio: 'fixo',
  sagittarius: 'mutável',
  capricorn: 'cardinal',
  aquarius: 'fixo',
  pisces: 'mutável'
}

// 2. Planetas regentes
const rulingPlanets: Record<Sign, string> = {
  aries: 'Marte',
  taurus: 'Vênus',
  gemini: 'Mercúrio',
  cancer: 'Lua',
  leo: 'Sol',
  virgo: 'Mercúrio',
  libra: 'Vênus',
  scorpio: 'Marte',
  sagittarius: 'Júpiter',
  capricorn: 'Saturno',
  aquarius: 'Urano',
  pisces: 'Netuno'
}

// 3. Cores da sorte por signo
const luckyColors: Record<Sign, string[]> = {
  aries: ['vermelho', 'laranja', 'coral', 'escarlate'],
  taurus: ['verde', 'rosa', 'azul claro', 'marrom'],
  gemini: ['amarelo', 'azul', 'prata', 'branco'],
  cancer: ['prata', 'branco', 'azul claro', 'verde água'],
  leo: ['dourado', 'laranja', 'amarelo', 'vermelho'],
  virgo: ['marrom', 'bege', 'verde oliva', 'amarelo claro'],
  libra: ['rosa', 'azul', 'verde', 'branco'],
  scorpio: ['vermelho escuro', 'preto', 'roxo', 'marrom'],
  sagittarius: ['roxo', 'azul', 'laranja', 'dourado'],
  capricorn: ['preto', 'marrom', 'cinza', 'verde escuro'],
  aquarius: ['azul', 'prata', 'roxo', 'branco'],
  pisces: ['verde água', 'roxo', 'azul claro', 'rosa']
}

// 4. Emoções específicas por signo
const emotions: Record<Sign, string[]> = {
  aries: ['coragem', 'entusiasmo', 'determinação', 'confiança', 'impulsividade'],
  taurus: ['tranquilidade', 'prazer', 'satisfação', 'estabilidade', 'sensualidade'],
  gemini: ['curiosidade', 'alegria', 'versatilidade', 'inquietação', 'entusiasmo'],
  cancer: ['sensibilidade', 'nostalgia', 'proteção', 'carinho', 'intuição'],
  leo: ['orgulho', 'generosidade', 'alegria', 'confiança', 'criatividade'],
  virgo: ['precisão', 'modéstia', 'preocupação', 'organização', 'discernimento'],
  libra: ['harmonia', 'beleza', 'diplomacia', 'equilíbrio', 'romance'],
  scorpio: ['intensidade', 'paixão', 'mistério', 'transformação', 'profundidade'],
  sagittarius: ['liberdade', 'otimismo', 'aventura', 'filosofia', 'expansão'],
  capricorn: ['ambição', 'disciplina', 'responsabilidade', 'realismo', 'perseverança'],
  aquarius: ['originalidade', 'liberdade', 'humanitarismo', 'inovação', 'independência'],
  pisces: ['intuição', 'compaixão', 'sonhos', 'espiritualidade', 'empatia']
}

// 5. Conselhos práticos por signo
const practicalAdvices: Record<Sign, string[]> = {
  aries: [
    'Inicie um novo projeto hoje',
    'Tome uma decisão importante',
    'Faça exercícios físicos',
    'Expresse sua opinião com confiança',
    'Assuma a liderança em uma situação'
  ],
  taurus: [
    'Dedique tempo para relaxar',
    'Aprecie uma boa refeição',
    'Cuidar do jardim ou plantas',
    'Organize seu espaço pessoal',
    'Valorize os momentos de prazer'
  ],
  gemini: [
    'Leia um livro interessante',
    'Converse com pessoas novas',
    'Aprenda algo novo hoje',
    'Escreva suas ideias',
    'Faça networking'
  ],
  cancer: [
    'Passe tempo com a família',
    'Cozinhe algo especial',
    'Cuide de alguém querido',
    'Reflita sobre suas emoções',
    'Crie um ambiente acolhedor'
  ],
  leo: [
    'Expresse sua criatividade',
    'Celebre suas conquistas',
    'Compartilhe sua alegria',
    'Faça algo que te divirta',
    'Seja generoso com os outros'
  ],
  virgo: [
    'Organize sua rotina',
    'Cuide da sua saúde',
    'Revise detalhes importantes',
    'Faça uma lista de tarefas',
    'Pratique mindfulness'
  ],
  libra: [
    'Harmonize seu ambiente',
    'Passe tempo com seu parceiro',
    'Aprecie arte e beleza',
    'Busque equilíbrio nas decisões',
    'Seja diplomático em conflitos'
  ],
  scorpio: [
    'Explore sua intuição',
    'Transforme algo em sua vida',
    'Aprofunde um relacionamento',
    'Investigue algo que te intriga',
    'Libere o que não serve mais'
  ],
  sagittarius: [
    'Planeje uma viagem',
    'Explore novos lugares',
    'Estude algo que te interessa',
    'Pratique esportes',
    'Compartilhe sua filosofia'
  ],
  capricorn: [
    'Trabalhe em seus objetivos',
    'Planeje o futuro',
    'Assuma responsabilidades',
    'Demonstre sua competência',
    'Construa algo duradouro'
  ],
  aquarius: [
    'Inove em algo',
    'Conecte-se com grupos',
    'Apoie uma causa social',
    'Use tecnologia criativamente',
    'Seja original e autêntico'
  ],
  pisces: [
    'Pratique meditação',
    'Expresse sua criatividade',
    'Ajude alguém necessitado',
    'Conecte-se com sua espiritualidade',
    'Confie em sua intuição'
  ]
}

// Novos campos: Atividades recomendadas, Alertas, Cristais, Mantras, Conselhos
const recommendedActivities: Record<Sign, string[]> = {
  aries: [
    'Exercícios físicos intensos', 'Iniciar novos projetos', 'Tomar decisões importantes',
    'Competições esportivas', 'Liderar equipes', 'Aventuras ao ar livre',
    'Praticar artes marciais', 'Explorar novos lugares', 'Atividades de ação'
  ],
  taurus: [
    'Cuidar do jardim', 'Cozinhar receitas especiais', 'Massagem relaxante',
    'Apreciar música ao vivo', 'Compras em feiras', 'Artesanato manual',
    'Caminhadas na natureza', 'Sessão de spa', 'Degustação de vinhos'
  ],
  gemini: [
    'Leitura de livros', 'Conversas interessantes', 'Cursos online',
    'Escrita criativa', 'Networking', 'Jogos de palavras',
    'Podcasts educativos', 'Visitas a museus', 'Aulas de idiomas'
  ],
  cancer: [
    'Tempo com família', 'Cozinhar para entes queridos', 'Organizar álbuns de fotos',
    'Cuidar de plantas', 'Meditação em casa', 'Conversas profundas',
    'Atividades caseiras', 'Cuidar de animais', 'Preparar refeições especiais'
  ],
  leo: [
    'Expressão artística', 'Apresentações públicas', 'Fotografia criativa',
    'Teatro ou cinema', 'Celebrações', 'Dança',
    'Eventos sociais', 'Criar conteúdo', 'Atividades com crianças'
  ],
  virgo: [
    'Organização pessoal', 'Exercícios de yoga', 'Leitura sobre saúde',
    'Planejamento detalhado', 'Cuidados com alimentação', 'Atividades de limpeza',
    'Estudos práticos', 'Rotinas de bem-estar', 'Trabalhos manuais precisos'
  ],
  libra: [
    'Apreciar arte', 'Sessões de beleza', 'Encontros sociais',
    'Decoração de ambientes', 'Música harmoniosa', 'Negociações',
    'Parcerias criativas', 'Eventos culturais', 'Atividades em grupo'
  ],
  scorpio: [
    'Meditação profunda', 'Investigação de temas', 'Transformação pessoal',
    'Terapias alternativas', 'Estudos psicológicos', 'Atividades intensas',
    'Exploração espiritual', 'Exercícios de força', 'Reflexão introspectiva'
  ],
  sagittarius: [
    'Viagens curtas', 'Esportes ao ar livre', 'Estudos filosóficos',
    'Exploração cultural', 'Aventuras', 'Prática de esportes',
    'Caminhadas longas', 'Aulas de algo novo', 'Atividades de expansão'
  ],
  capricorn: [
    'Planejamento estratégico', 'Trabalho focado', 'Exercícios de disciplina',
    'Estudos profissionais', 'Organização de metas', 'Atividades estruturadas',
    'Desenvolvimento de carreira', 'Exercícios de resistência', 'Trabalhos práticos'
  ],
  aquarius: [
    'Inovação tecnológica', 'Atividades em grupo', 'Causas sociais',
    'Eventos comunitários', 'Criatividade original', 'Networking amplo',
    'Projetos inovadores', 'Atividades futuristas', 'Colaborações'
  ],
  pisces: [
    'Meditação guiada', 'Arte criativa', 'Música relaxante',
    'Atividades aquáticas', 'Voluntariado', 'Sonhos e visualizações',
    'Terapias holísticas', 'Atividades espirituais', 'Conexão com natureza'
  ]
}

const dailyAlerts: Record<Sign, string[]> = {
  aries: [
    'Evite impulsividade em decisões importantes',
    'Cuidado com confrontos desnecessários',
    'Não ignore sinais de cansaço',
    'Evite agir sem pensar nas consequências',
    'Atenção para não ser muito agressivo'
  ],
  taurus: [
    'Evite teimosia excessiva',
    'Cuidado com gastos impulsivos',
    'Não resista demais a mudanças necessárias',
    'Evite comodismo extremo',
    'Atenção para não ser muito possessivo'
  ],
  gemini: [
    'Evite superficialidade em assuntos importantes',
    'Cuidado com promessas que não pode cumprir',
    'Não se distraia demais',
    'Evite fofocas e conversas vazias',
    'Atenção para não ser muito disperso'
  ],
  cancer: [
    'Evite sensibilidade excessiva',
    'Cuidado para não se isolar demais',
    'Não guarde ressentimentos',
    'Evite apego emocional exagerado',
    'Atenção para não ser muito defensivo'
  ],
  leo: [
    'Evite orgulho excessivo',
    'Cuidado com vaidade desmedida',
    'Não ignore opiniões dos outros',
    'Evite ser muito autoritário',
    'Atenção para não ser muito dramático'
  ],
  virgo: [
    'Evite perfeccionismo obsessivo',
    'Cuidado com críticas excessivas',
    'Não se preocupe demais com detalhes',
    'Evite ansiedade desnecessária',
    'Atenção para não ser muito crítico consigo mesmo'
  ],
  libra: [
    'Evite indecisão prolongada',
    'Cuidado para não evitar conflitos importantes',
    'Não dependa demais da aprovação alheia',
    'Evite superficialidade em relacionamentos',
    'Atenção para não ser muito passivo'
  ],
  scorpio: [
    'Evite ciúmes excessivos',
    'Cuidado com manipulação emocional',
    'Não guarde segredos desnecessários',
    'Evite vingança ou ressentimento',
    'Atenção para não ser muito controlador'
  ],
  sagittarius: [
    'Evite promessas que não pode cumprir',
    'Cuidado com falta de tato',
    'Não ignore compromissos',
    'Evite ser muito direto sem considerar sentimentos',
    'Atenção para não ser muito irresponsável'
  ],
  capricorn: [
    'Evite trabalho excessivo',
    'Cuidado com frieza emocional',
    'Não ignore necessidades pessoais',
    'Evite ser muito rígido',
    'Atenção para não ser muito pessimista'
  ],
  aquarius: [
    'Evite distanciamento emocional',
    'Cuidado com rebeldia desnecessária',
    'Não ignore sentimentos dos outros',
    'Evite ser muito excêntrico',
    'Atenção para não ser muito imprevisível'
  ],
  pisces: [
    'Evite escapismo da realidade',
    'Cuidado com vitimização',
    'Não se deixe enganar facilmente',
    'Evite confusão emocional',
    'Atenção para não ser muito passivo'
  ]
}

const crystals: Record<Sign, string[]> = {
  aries: ['Rubi', 'Ágata de fogo', 'Jaspe vermelho', 'Coral', 'Granada'],
  taurus: ['Esmeralda', 'Quartzo rosa', 'Ágata musgo', 'Lápis-lazúli', 'Jade'],
  gemini: ['Ágata', 'Citrino', 'Topázio amarelo', 'Ámbar', 'Calcita'],
  cancer: ['Pérola', 'Quartzo rosa', 'Opala', 'Água-marinha', 'Lua'],
  leo: ['Topázio', 'Citrino', 'Âmbar', 'Olho de tigre', 'Pirita'],
  virgo: ['Safira', 'Jaspe', 'Ágata musgo', 'Peridoto', 'Amazonita'],
  libra: ['Opala', 'Quartzo rosa', 'Lápis-lazúli', 'Água-marinha', 'Turquesa'],
  scorpio: ['Obsidiana', 'Ágata musgo', 'Granada', 'Turmalina preta', 'Jaspe vermelho'],
  sagittarius: ['Turquesa', 'Lápis-lazúli', 'Sodalita', 'Ametista', 'Topázio azul'],
  capricorn: ['Ônix', 'Quartzo fumê', 'Obsidiana', 'Ágata', 'Hematita'],
  aquarius: ['Ametista', 'Quartzo cristal', 'Sodalita', 'Lápis-lazúli', 'Água-marinha'],
  pisces: ['Água-marinha', 'Ametista', 'Quartzo rosa', 'Opala', 'Pérola']
}

const mantras: string[] = [
  'Sou capaz de superar qualquer desafio',
  'A abundância flui naturalmente para mim',
  'Estou em harmonia com o universo',
  'Minha energia atrai o que desejo',
  'Confio no processo da vida',
  'Sou merecedor de amor e felicidade',
  'Cada dia é uma nova oportunidade',
  'Minha intuição me guia com sabedoria',
  'Estou aberto a receber bênçãos',
  'Sou grato por todas as experiências',
  'Minha criatividade flui livremente',
  'Estou em paz comigo mesmo',
  'Aceito o que não posso mudar',
  'Transformo desafios em oportunidades',
  'Sou forte e resiliente',
  'Minha luz brilha intensamente',
  'Estou conectado com minha essência',
  'Aproveito cada momento presente',
  'Sou compassivo comigo e com os outros',
  'Minha jornada é única e especial'
]

const loveAdvices: Record<Sign, string[]> = {
  aries: [
    'Seja direto e honesto sobre seus sentimentos',
    'Mostre interesse ativo no seu parceiro',
    'Surpreenda com gestos espontâneos de carinho',
    'Evite discussões por coisas pequenas',
    'Valorize a independência do outro'
  ],
  taurus: [
    'Demonstre afeto através de ações práticas',
    'Crie momentos românticos especiais',
    'Seja paciente e compreensivo',
    'Valorize a estabilidade no relacionamento',
    'Expresse seus sentimentos com calma'
  ],
  gemini: [
    'Mantenha a comunicação aberta e sincera',
    'Compartilhe seus pensamentos e ideias',
    'Seja espontâneo e divertido',
    'Evite superficialidade emocional',
    'Valorize conversas profundas'
  ],
  cancer: [
    'Demonstre cuidado e proteção',
    'Crie um ambiente emocional seguro',
    'Seja sensível às necessidades do parceiro',
    'Valorize momentos íntimos e especiais',
    'Expresse seus sentimentos com vulnerabilidade'
  ],
  leo: [
    'Demonstre generosidade e carinho',
    'Celebre o relacionamento com alegria',
    'Seja romântico e apaixonado',
    'Valorize o reconhecimento mútuo',
    'Compartilhe momentos de diversão'
  ],
  virgo: [
    'Demonstre cuidado através de ações práticas',
    'Seja atencioso com os detalhes',
    'Valorize a comunicação clara',
    'Evite críticas desnecessárias',
    'Mostre apoio e compreensão'
  ],
  libra: [
    'Busque harmonia e equilíbrio',
    'Valorize a parceria e cooperação',
    'Seja diplomático em discussões',
    'Crie momentos de beleza juntos',
    'Demonstre apreço e gratidão'
  ],
  scorpio: [
    'Aprofunde a conexão emocional',
    'Seja intenso e apaixonado',
    'Valorize a intimidade e confiança',
    'Evite ciúmes excessivos',
    'Demonstre lealdade e compromisso'
  ],
  sagittarius: [
    'Mantenha a liberdade e aventura',
    'Compartilhe experiências novas',
    'Seja otimista e entusiasmado',
    'Valorize a independência mútua',
    'Crie memórias divertidas juntos'
  ],
  capricorn: [
    'Demonstre compromisso e responsabilidade',
    'Valorize a estabilidade e segurança',
    'Seja leal e confiável',
    'Planeje o futuro juntos',
    'Mostre apoio nos objetivos do parceiro'
  ],
  aquarius: [
    'Valorize a amizade no relacionamento',
    'Seja original e autêntico',
    'Respeite a independência mútua',
    'Compartilhe ideias e sonhos',
    'Mantenha a comunicação aberta'
  ],
  pisces: [
    'Demonstre compaixão e empatia',
    'Seja romântico e sonhador',
    'Valorize a conexão espiritual',
    'Crie momentos mágicos juntos',
    'Expresse seus sentimentos com sensibilidade'
  ]
}

const careerAdvices: Record<Sign, string[]> = {
  aries: [
    'Tome a iniciativa em projetos novos',
    'Assuma posições de liderança',
    'Seja proativo e determinado',
    'Não tenha medo de competir',
    'Demonstre sua capacidade de ação',
    'Enfrente desafios com coragem',
    'Seja o primeiro a propor soluções',
    'Aproveite oportunidades de crescimento rápido',
    'Mantenha energia alta em reuniões',
    'Estabeleça metas ambiciosas',
    'Tome decisões rápidas quando necessário',
    'Seja direto na comunicação profissional',
    'Busque projetos que exijam ação imediata',
    'Demonstre independência no trabalho',
    'Valorize resultados rápidos e eficazes',
    'Seja pioneiro em novas tecnologias',
    'Assuma riscos calculados',
    'Mantenha foco em objetivos claros',
    'Seja competitivo de forma saudável',
    'Demonstre capacidade de liderar equipes',
    'Aproveite momentos de alta energia',
    'Seja assertivo em negociações',
    'Valorize ambientes dinâmicos',
    'Busque reconhecimento por resultados',
    'Mantenha entusiasmo em projetos longos',
    'Seja inovador em processos',
    'Demonstre capacidade de resolver crises',
    'Valorize feedback direto e honesto',
    'Seja estratégico em competições',
    'Mantenha disciplina mesmo com energia alta',
    'Busque parcerias com pessoas proativas',
    'Seja visionário em novos mercados',
    'Demonstre resiliência em desafios',
    'Valorize trabalho com propósito claro',
    'Seja exemplo de determinação'
  ],
  taurus: [
    'Foque em resultados duradouros',
    'Seja paciente e persistente',
    'Valorize a estabilidade financeira',
    'Construa relacionamentos sólidos',
    'Demonstre sua confiabilidade',
    'Mantenha consistência no trabalho',
    'Valorize qualidade sobre quantidade',
    'Seja meticuloso em planejamentos',
    'Construa uma base financeira sólida',
    'Demonstre lealdade à empresa',
    'Aprecie processos bem estabelecidos',
    'Seja resistente a mudanças desnecessárias',
    'Valorize segurança no trabalho',
    'Mantenha rotinas produtivas',
    'Seja cuidadoso com investimentos',
    'Demonstre paciência em negociações',
    'Valorize ambiente de trabalho estável',
    'Seja confiável em prazos',
    'Mantenha organização financeira',
    'Demonstre capacidade de construir patrimônio',
    'Valorize relacionamentos duradouros',
    'Seja persistente em objetivos',
    'Mantenha qualidade em entregas',
    'Demonstre estabilidade emocional',
    'Valorize reconhecimento por dedicação',
    'Seja paciente com crescimento gradual',
    'Mantenha foco em resultados concretos',
    'Demonstre capacidade de manter equipes',
    'Valorize processos comprovados',
    'Seja resistente a pressões desnecessárias',
    'Mantenha disciplina financeira',
    'Demonstre capacidade de negociar bem',
    'Valorize trabalho com propósito duradouro',
    'Seja exemplo de consistência',
    'Mantenha compromisso com qualidade'
  ],
  gemini: [
    'Use sua comunicação como ferramenta',
    'Aproveite oportunidades de networking',
    'Seja versátil e adaptável',
    'Compartilhe conhecimento',
    'Explore múltiplas áreas de interesse',
    'Mantenha-se atualizado com tendências',
    'Use tecnologia para melhorar comunicação',
    'Seja ágil em mudanças de contexto',
    'Valorize aprendizado contínuo',
    'Demonstre capacidade de multitarefa',
    'Seja criativo em soluções',
    'Mantenha curiosidade profissional',
    'Use redes sociais profissionalmente',
    'Seja eficiente em apresentações',
    'Valorize feedback rápido',
    'Demonstre capacidade de adaptação',
    'Mantenha mente aberta a novas ideias',
    'Seja colaborativo em equipes',
    'Use escrita como ferramenta profissional',
    'Demonstre capacidade de ensino',
    'Valorize ambientes dinâmicos',
    'Seja inovador em comunicação',
    'Mantenha flexibilidade em projetos',
    'Demonstre capacidade de networking',
    'Valorize conhecimento diversificado',
    'Seja eficiente em processos',
    'Mantenha entusiasmo em novos projetos',
    'Demonstre capacidade de mediação',
    'Valorize trabalho com variedade',
    'Seja exemplo de comunicação clara',
    'Mantenha agilidade mental',
    'Demonstre capacidade de inovação',
    'Valorize parcerias estratégicas',
    'Seja eficaz em negociações',
    'Mantenha versatilidade profissional'
  ],
  cancer: [
    'Use sua intuição nos negócios',
    'Crie um ambiente de trabalho acolhedor',
    'Valorize relacionamentos profissionais',
    'Seja protetor com sua equipe',
    'Use sua sensibilidade como vantagem',
    'Mantenha cuidado com detalhes emocionais',
    'Valorize segurança no ambiente de trabalho',
    'Seja atencioso com necessidades da equipe',
    'Demonstre capacidade de criar vínculos',
    'Mantenha memória de relacionamentos',
    'Seja protetor de informações confidenciais',
    'Valorize tradições da empresa',
    'Demonstre capacidade de cuidar de projetos',
    'Mantenha sensibilidade em negociações',
    'Seja estratégico em decisões emocionais',
    'Valorize ambiente familiar no trabalho',
    'Demonstre capacidade de criar confiança',
    'Mantenha cuidado com mudanças bruscas',
    'Seja protetor de valores da empresa',
    'Valorize relacionamentos duradouros',
    'Demonstre capacidade de criar harmonia',
    'Mantenha intuição em negócios',
    'Seja cuidadoso com investimentos',
    'Valorize segurança financeira',
    'Demonstre capacidade de criar ambiente seguro',
    'Mantenha sensibilidade a necessidades',
    'Seja protetor de informações importantes',
    'Valorize trabalho com propósito emocional',
    'Demonstre capacidade de criar conexões',
    'Mantenha cuidado com detalhes',
    'Seja estratégico em relacionamentos',
    'Valorize ambiente acolhedor',
    'Demonstre capacidade de criar vínculos duradouros',
    'Mantenha intuição profissional',
    'Seja exemplo de cuidado e atenção'
  ],
  leo: [
    'Demonstre confiança e carisma',
    'Use sua criatividade profissionalmente',
    'Busque reconhecimento merecido',
    'Seja generoso com colegas',
    'Assuma papéis de destaque',
    'Mantenha presença marcante em reuniões',
    'Valorize oportunidades de liderança',
    'Seja inspirador para a equipe',
    'Demonstre capacidade de motivar outros',
    'Mantenha entusiasmo em projetos',
    'Seja generoso com conhecimento',
    'Valorize reconhecimento público',
    'Demonstre capacidade de criar impacto',
    'Mantenha confiança em apresentações',
    'Seja criativo em soluções',
    'Valorize trabalho com visibilidade',
    'Demonstre capacidade de liderar com paixão',
    'Mantenha generosidade em sucessos',
    'Seja estratégico em posicionamento',
    'Valorize oportunidades de crescimento',
    'Demonstre capacidade de criar legado',
    'Mantenha carisma em negociações',
    'Seja inspirador em momentos difíceis',
    'Valorize trabalho com propósito grandioso',
    'Demonstre capacidade de celebrar conquistas',
    'Mantenha confiança em desafios',
    'Seja generoso com oportunidades',
    'Valorize reconhecimento por mérito',
    'Demonstre capacidade de criar visão',
    'Mantenha criatividade em processos',
    'Seja exemplo de liderança positiva',
    'Valorize trabalho com impacto',
    'Demonstre capacidade de motivar equipes',
    'Mantenha presença profissional',
    'Seja inspirador em todos os momentos'
  ],
  virgo: [
    'Foque em organização e eficiência',
    'Demonstre atenção aos detalhes',
    'Valorize a qualidade do trabalho',
    'Seja útil e prestativo',
    'Use sua análise crítica positivamente',
    'Mantenha sistemas organizados',
    'Valorize processos bem definidos',
    'Seja meticuloso em planejamentos',
    'Demonstre capacidade de melhorar processos',
    'Mantenha foco em eficiência',
    'Seja útil em resolução de problemas',
    'Valorize trabalho bem feito',
    'Demonstre capacidade de análise',
    'Mantenha organização em projetos',
    'Seja prestativo com a equipe',
    'Valorize qualidade sobre velocidade',
    'Demonstre capacidade de otimização',
    'Mantenha atenção a detalhes importantes',
    'Seja estratégico em melhorias',
    'Valorize feedback construtivo',
    'Demonstre capacidade de criar sistemas',
    'Mantenha eficiência em processos',
    'Seja útil em momentos de necessidade',
    'Valorize trabalho com precisão',
    'Demonstre capacidade de análise crítica',
    'Mantenha organização financeira',
    'Seja prestativo em projetos complexos',
    'Valorize processos eficientes',
    'Demonstre capacidade de melhorar continuamente',
    'Mantenha foco em qualidade',
    'Seja exemplo de organização',
    'Valorize trabalho com propósito claro',
    'Demonstre capacidade de criar eficiência',
    'Mantenha atenção aos detalhes',
    'Seja útil e prestativo sempre'
  ],
  libra: [
    'Use sua diplomacia em negociações',
    'Valorize parcerias profissionais',
    'Busque harmonia no ambiente de trabalho',
    'Use seu senso estético profissionalmente',
    'Seja justo e equilibrado',
    'Mantenha equilíbrio em decisões',
    'Valorize relacionamentos profissionais',
    'Seja diplomático em conflitos',
    'Demonstre capacidade de criar consenso',
    'Mantenha harmonia em equipes',
    'Seja justo em avaliações',
    'Valorize parcerias estratégicas',
    'Demonstre capacidade de mediação',
    'Mantenha equilíbrio em negociações',
    'Seja estético em apresentações',
    'Valorize ambiente harmonioso',
    'Demonstre capacidade de criar acordos',
    'Mantenha justiça em processos',
    'Seja diplomático em relacionamentos',
    'Valorize trabalho em equipe',
    'Demonstre capacidade de balancear interesses',
    'Mantenha harmonia em projetos',
    'Seja justo em distribuição de trabalho',
    'Valorize parcerias duradouras',
    'Demonstre capacidade de criar equilíbrio',
    'Mantenha diplomacia em negociações',
    'Seja estético em comunicações',
    'Valorize relacionamentos equilibrados',
    'Demonstre capacidade de mediar conflitos',
    'Mantenha justiça em decisões',
    'Seja exemplo de equilíbrio',
    'Valorize trabalho com harmonia',
    'Demonstre capacidade de criar consensos',
    'Mantenha diplomacia profissional',
    'Seja justo e equilibrado sempre'
  ],
  scorpio: [
    'Use sua intensidade estrategicamente',
    'Mantenha discrição em assuntos sensíveis',
    'Valorize transformações profissionais',
    'Seja determinado em seus objetivos',
    'Use sua intuição nos negócios',
    'Mantenha profundidade em análises',
    'Valorize projetos transformadores',
    'Seja estratégico em movimentos',
    'Demonstre capacidade de investigação',
    'Mantenha discrição profissional',
    'Seja determinado em objetivos',
    'Valorize transformações positivas',
    'Demonstre capacidade de regeneração',
    'Mantenha intensidade focada',
    'Seja estratégico em negociações',
    'Valorize trabalho com profundidade',
    'Demonstre capacidade de transformar',
    'Mantenha discrição em informações',
    'Seja determinado em desafios',
    'Valorize projetos intensos',
    'Demonstre capacidade de análise profunda',
    'Mantenha estratégia em movimentos',
    'Seja transformador em processos',
    'Valorize trabalho com propósito profundo',
    'Demonstre capacidade de regenerar projetos',
    'Mantenha intensidade em objetivos',
    'Seja estratégico em decisões',
    'Valorize transformações profissionais',
    'Demonstre capacidade de investigar',
    'Mantenha discrição em assuntos importantes',
    'Seja exemplo de determinação',
    'Valorize trabalho com intensidade focada',
    'Demonstre capacidade de transformar negativamente',
    'Mantenha estratégia profissional',
    'Seja determinado e estratégico sempre'
  ],
  sagittarius: [
    'Explore oportunidades de expansão',
    'Use sua visão de longo prazo',
    'Valorize aprendizado contínuo',
    'Busque liberdade profissional',
    'Compartilhe sua filosofia de trabalho',
    'Mantenha otimismo em projetos',
    'Valorize oportunidades internacionais',
    'Seja visionário em estratégias',
    'Demonstre capacidade de expandir',
    'Mantenha mente aberta a novas culturas',
    'Seja filosófico em decisões',
    'Valorize aprendizado constante',
    'Demonstre capacidade de ensinar',
    'Mantenha visão de futuro',
    'Seja explorador de novas áreas',
    'Valorize liberdade criativa',
    'Demonstre capacidade de inspirar',
    'Mantenha otimismo em desafios',
    'Seja visionário em negócios',
    'Valorize oportunidades de crescimento',
    'Demonstre capacidade de expandir horizontes',
    'Mantenha filosofia positiva',
    'Seja explorador de possibilidades',
    'Valorize aprendizado contínuo',
    'Demonstre capacidade de criar visão',
    'Mantenha liberdade em projetos',
    'Seja otimista em resultados',
    'Valorize oportunidades de expansão',
    'Demonstre capacidade de inspirar outros',
    'Mantenha visão de longo prazo',
    'Seja exemplo de otimismo',
    'Valorize trabalho com propósito amplo',
    'Demonstre capacidade de expandir negócios',
    'Mantenha filosofia profissional',
    'Seja visionário e otimista sempre'
  ],
  capricorn: [
    'Foque em objetivos de longo prazo',
    'Demonstre disciplina e responsabilidade',
    'Valorize estrutura e organização',
    'Construa uma carreira sólida',
    'Seja paciente com o progresso',
    'Mantenha foco em resultados duradouros',
    'Valorize hierarquia e estrutura',
    'Seja estratégico em planejamentos',
    'Demonstre capacidade de construir',
    'Mantenha disciplina em processos',
    'Seja responsável em compromissos',
    'Valorize reconhecimento por mérito',
    'Demonstre capacidade de liderar',
    'Mantenha estrutura em projetos',
    'Seja paciente em crescimento',
    'Valorize trabalho com propósito sólido',
    'Demonstre capacidade de construir legado',
    'Mantenha disciplina financeira',
    'Seja estratégico em investimentos',
    'Valorize estrutura organizacional',
    'Demonstre capacidade de criar sistemas',
    'Mantenha foco em objetivos',
    'Seja responsável em decisões',
    'Valorize trabalho com disciplina',
    'Demonstre capacidade de construir carreira',
    'Mantenha estrutura em processos',
    'Seja paciente com resultados',
    'Valorize reconhecimento por dedicação',
    'Demonstre capacidade de liderar',
    'Mantenha disciplina profissional',
    'Seja exemplo de responsabilidade',
    'Valorize trabalho com propósito duradouro',
    'Demonstre capacidade de construir futuro',
    'Mantenha foco em objetivos claros',
    'Seja disciplinado e responsável sempre'
  ],
  aquarius: [
    'Use sua inovação profissionalmente',
    'Valorize trabalho em equipe',
    'Explore tecnologia e futuro',
    'Seja original em suas ideias',
    'Apoie causas que acredita',
    'Mantenha mente aberta a inovações',
    'Valorize trabalho colaborativo',
    'Seja visionário em tecnologia',
    'Demonstre capacidade de inovar',
    'Mantenha originalidade em projetos',
    'Seja humanitário em decisões',
    'Valorize causas sociais',
    'Demonstre capacidade de criar futuro',
    'Mantenha inovação em processos',
    'Seja original em soluções',
    'Valorize trabalho em equipe diversa',
    'Demonstre capacidade de revolucionar',
    'Mantenha mente aberta a mudanças',
    'Seja visionário em negócios',
    'Valorize tecnologia e inovação',
    'Demonstre capacidade de criar',
    'Mantenha originalidade profissional',
    'Seja humanitário em projetos',
    'Valorize causas que acredita',
    'Demonstre capacidade de inovar processos',
    'Mantenha visão de futuro',
    'Seja original em estratégias',
    'Valorize trabalho colaborativo',
    'Demonstre capacidade de revolucionar',
    'Mantenha inovação constante',
    'Seja exemplo de originalidade',
    'Valorize trabalho com propósito social',
    'Demonstre capacidade de criar futuro',
    'Mantenha mente aberta sempre',
    'Seja inovador e original sempre'
  ],
  pisces: [
    'Use sua criatividade profissionalmente',
    'Valorize trabalho com propósito',
    'Seja compassivo com colegas',
    'Use sua intuição nos negócios',
    'Explore áreas artísticas ou de ajuda',
    'Mantenha sensibilidade em projetos',
    'Valorize trabalho com significado',
    'Seja criativo em soluções',
    'Demonstre capacidade de ajudar',
    'Mantenha intuição profissional',
    'Seja compassivo em relacionamentos',
    'Valorize trabalho artístico',
    'Demonstre capacidade de criar',
    'Mantenha sensibilidade em decisões',
    'Seja intuitivo em negócios',
    'Valorize propósito sobre lucro',
    'Demonstre capacidade de inspirar',
    'Mantenha criatividade em processos',
    'Seja compassivo com equipe',
    'Valorize trabalho com significado',
    'Demonstre capacidade de criar arte',
    'Mantenha intuição em projetos',
    'Seja sensível a necessidades',
    'Valorize trabalho humanitário',
    'Demonstre capacidade de ajudar outros',
    'Mantenha criatividade profissional',
    'Seja intuitivo em decisões',
    'Valorize propósito em projetos',
    'Demonstre capacidade de criar significado',
    'Mantenha sensibilidade profissional',
    'Seja exemplo de compaixão',
    'Valorize trabalho com propósito profundo',
    'Demonstre capacidade de inspirar através da arte',
    'Mantenha intuição e criatividade',
    'Seja compassivo e criativo sempre'
  ]
}

// 6. Compatibilidade básica por elemento - signos específicos
const compatibleSignsByElement: Record<'fogo' | 'terra' | 'ar' | 'água', Sign[]> = {
  fogo: ['aries', 'leo', 'sagittarius', 'gemini', 'libra', 'aquarius'], // Fogo e Ar
  terra: ['taurus', 'virgo', 'capricorn', 'cancer', 'scorpio', 'pisces'], // Terra e Água
  ar: ['gemini', 'libra', 'aquarius', 'aries', 'leo', 'sagittarius'], // Ar e Fogo
  água: ['cancer', 'scorpio', 'pisces', 'taurus', 'virgo', 'capricorn'] // Água e Terra
}

// Nomes dos signos em português para exibição
const signNames: Record<Sign, string> = {
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

// 7. Significados numerológicos (1-60)
const numerologyMeanings: string[] = [
  'Novos começos e liderança', 'Cooperação e harmonia', 'Criatividade e expressão',
  'Estabilidade e organização', 'Liberdade e aventura', 'Amor e responsabilidade',
  'Espiritualidade e introspecção', 'Poder e materialismo', 'Humanitarismo e compaixão',
  'Completude e realização', 'Intuição e inspiração', 'Sacrifício e serviço',
  'Transformação e renovação', 'Equilíbrio e justiça', 'Criatividade e expansão',
  'Amor e relacionamentos', 'Espiritualidade e sabedoria', 'Materialismo e realização',
  'Comunicação e expressão', 'Completude e perfeição', 'Criatividade e originalidade',
  'Cooperação e parceria', 'Mistério e transformação', 'Comunicação e adaptabilidade',
  'Amor e harmonia', 'Espiritualidade e intuição', 'Criatividade e expressão',
  'Poder e liderança', 'Intuição e compaixão', 'Criatividade e comunicação',
  'Transformação e renovação', 'Comunicação e expressão', 'Espiritualidade e sabedoria',
  'Criatividade e expansão', 'Amor e relacionamentos', 'Materialismo e realização',
  'Intuição e inspiração', 'Comunicação e adaptabilidade', 'Transformação e renovação',
  'Criatividade e originalidade', 'Amor e harmonia', 'Espiritualidade e introspecção',
  'Poder e materialismo', 'Comunicação e expressão', 'Criatividade e expansão',
  'Intuição e compaixão', 'Transformação e renovação', 'Amor e relacionamentos',
  'Espiritualidade e sabedoria', 'Criatividade e originalidade', 'Comunicação e adaptabilidade',
  'Poder e liderança', 'Intuição e inspiração', 'Amor e harmonia',
  'Transformação e renovação', 'Criatividade e expressão', 'Espiritualidade e introspecção',
  'Comunicação e expressão', 'Criatividade e expansão', 'Amor e relacionamentos'
]

// 8. Frases de impacto
const impactPhrases: string[] = [
  'O universo conspira a seu favor',
  'Sua intuição é sua melhor guia',
  'As estrelas estão alinhadas para você',
  'Você tem o poder de criar sua realidade',
  'Confie no processo e mantenha a fé',
  'Grandes coisas estão por vir',
  'Sua energia atrai o que você precisa',
  'O momento é perfeito para agir',
  'Você está no caminho certo',
  'A sabedoria está dentro de você',
  'Seus sonhos estão mais próximos do que imagina',
  'A vida está conspirando para seu sucesso',
  'Você é mais forte do que pensa',
  'As oportunidades estão batendo à sua porta',
  'Sua luz brilha intensamente hoje',
  'O destino está trabalhando a seu favor',
  'Você tem tudo que precisa para ter sucesso',
  'A magia está acontecendo agora',
  'Seus desejos estão se manifestando',
  'Você está exatamente onde precisa estar'
]

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

export function generateDailyPredictionClient(context: GeneratorContext): {
  text: string
  luckyNumber: number
  element: string
  quality: string
  rulingPlanet: string
  luckyColor: string
  emotion: string
  practicalAdvice: string
  compatibleSigns: string
  numerologyMeaning: string
  impactPhrase: string
  recommendedActivities: string
  dailyAlert: string
  energyLevel: number
  crystal: string
  mantra: string
  loveAdvice: string
  careerAdvice: string
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
    
    // Frase positiva inicial
    const positiveTemplate = getRandomElement(templates.positive, seedNums[3])
  sentences.push(positiveTemplate
    .replace('{action}', `explorar ${signTheme}`)
    .replace('{focus}', signTheme)
    .replace('{area}', signTheme)
  )
  
    // Frase do dia da semana
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
    
    // Conselho ou advertência
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
  
  // 1. Elemento e qualidade
  const element = signElements[context.sign]
  const quality = signQualities[context.sign]
  
  // 2. Planeta regente
  const rulingPlanet = rulingPlanets[context.sign]
  
  // 3. Cor da sorte (selecionada baseada na seed)
  const colorSeed = generateLuckyNumber(seed + 'color')
  const luckyColor = getRandomElement(luckyColors[context.sign], colorSeed)
  
  // 4. Emoção específica
  const emotionSeed = generateLuckyNumber(seed + 'emotion')
  const emotion = getRandomElement(emotions[context.sign], emotionSeed)
  
  // 5. Conselho prático
  const adviceSeed = generateLuckyNumber(seed + 'advice')
  const practicalAdvice = getRandomElement(practicalAdvices[context.sign], adviceSeed)
  
  // 6. Compatibilidade - seleciona 2-3 signos compatíveis aleatoriamente
  const compatibleSignsList = compatibleSignsByElement[element]
  const compatibleSeed = generateLuckyNumber(seed + 'compatible')
  const numCompatible = 2 + (compatibleSeed % 2) // 2 ou 3 signos
  const selectedCompatible: Sign[] = []
  
  // Seleciona signos compatíveis diferentes do signo atual
  const availableSigns = compatibleSignsList.filter(s => s !== context.sign)
  for (let i = 0; i < numCompatible && i < availableSigns.length; i++) {
    const signSeed = generateLuckyNumber(seed + `compatible-${i}`)
    const selected = availableSigns[signSeed % availableSigns.length]
    if (!selectedCompatible.includes(selected)) {
      selectedCompatible.push(selected)
    }
  }
  
  // Formata como string com nomes em português
  const compatibleSignsNames = selectedCompatible.map(s => signNames[s]).join(', ')
  const compatibleSigns = `${compatibleSignsNames}`
  
  // 7. Significado numerológico
  const numerologyMeaning = numerologyMeanings[(luckyNumber - 1) % numerologyMeanings.length]
  
  // 8. Frase de impacto
  const impactSeed = generateLuckyNumber(seed + 'impact')
  const impactPhrase = getRandomElement(impactPhrases, impactSeed)
  
  // 9. Atividades recomendadas
  const activitiesSeed = generateLuckyNumber(seed + 'activities')
  const recommendedActivitiesText = getRandomElement(recommendedActivities[context.sign], activitiesSeed)
  
  // 10. Alerta do dia
  const alertSeed = generateLuckyNumber(seed + 'alert')
  const dailyAlert = getRandomElement(dailyAlerts[context.sign], alertSeed)
  
  // 11. Energia do dia (1-10)
  const energySeed = generateLuckyNumber(seed + 'energy')
  const energyLevel = 1 + (energySeed % 10) // 1-10
  
  // 12. Pedra/cristal do dia
  const crystalSeed = generateLuckyNumber(seed + 'crystal')
  const crystal = getRandomElement(crystals[context.sign], crystalSeed)
  
  // 13. Mantra ou afirmação
  const mantraSeed = generateLuckyNumber(seed + 'mantra')
  const mantra = getRandomElement(mantras, mantraSeed)
  
  // 14. Conselho amoroso específico
  const loveSeed = generateLuckyNumber(seed + 'love')
  const loveAdvice = getRandomElement(loveAdvices[context.sign], loveSeed)
  
  // 15. Conselho profissional
  const careerSeed = generateLuckyNumber(seed + 'career')
  const careerAdvice = getRandomElement(careerAdvices[context.sign], careerSeed)
  
  return {
    text: textWithLuckyNumber,
    luckyNumber,
    element,
    quality,
    rulingPlanet,
    luckyColor,
    emotion,
    practicalAdvice,
    compatibleSigns,
    numerologyMeaning,
    impactPhrase,
    recommendedActivities: recommendedActivitiesText,
    dailyAlert,
    energyLevel,
    crystal,
    mantra,
    loveAdvice,
    careerAdvice
  }
}

export function generateWeeklyPredictionClient(context: Omit<GeneratorContext, 'weekday'>): {
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
  const textWithLuckyNumber = text + ` Esta semana é regida pelo número ${luckyNumber}.`
  
  return { text: textWithLuckyNumber, luckyNumber }
}
