/**
 * Cálculo da fase da lua e informações místicas.
 * Referência: ciclo sinódico ~29.530588853 dias; Lua nova de referência (JD 2451550.1).
 */

const LUNAR_CYCLE_DAYS = 29.530588853
const REFERENCE_NEW_MOON_JD = 2451550.1 // 6 Jan 2000

export type MoonPhaseId =
  | 'nova'
  | 'crescente_inicial'
  | 'quarto_crescente'
  | 'crescente_gibosa'
  | 'cheia'
  | 'minguante_gibosa'
  | 'quarto_minguante'
  | 'minguante'

export interface MoonPhaseInfo {
  phaseId: MoonPhaseId
  phaseName: string
  phaseNameShort: string
  emoji: string
  description: string
  mystical: string
  advice: string
  keywords: string[]
}

/** Converte uma data para dia juliano (meio-dia UTC). */
function getJulianDay(date: Date): number {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const a = Math.floor((14 - m) / 12)
  const y2 = y + 4800 - a
  const m2 = m + 12 * a - 3
  let jd =
    d +
    Math.floor((153 * m2 + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045
  return jd
}

/** Idade da lua em dias (0 = lua nova, ~14.77 = lua cheia). */
export function getMoonAgeDays(date: Date): number {
  const jd = getJulianDay(date)
  const daysSinceNew = (jd - REFERENCE_NEW_MOON_JD) % LUNAR_CYCLE_DAYS
  return daysSinceNew >= 0 ? daysSinceNew : daysSinceNew + LUNAR_CYCLE_DAYS
}

/** Dados místicos e conselhos por fase (8 fases). */
const PHASE_DATA: Record<MoonPhaseId, Omit<MoonPhaseInfo, 'phaseId'>> = {
  nova: {
    phaseName: 'Lua Nova',
    phaseNameShort: 'Nova',
    emoji: '🌑',
    description: 'A lua está entre a Terra e o Sol; o lado iluminado não é visível.',
    mystical:
      'Momento de introspecção e plantio de intenções. A energia da Lua Nova favorece novos começos, planejamento e a definição de metas. Ritual de renovação e limpeza energética.',
    advice:
      'Escreva suas intenções e desejos para o ciclo que começa. Evite tomar decisões impulsivas; use este período para refletir e semear. Ideal para meditação e banhos de limpeza.',
    keywords: ['renovação', 'intenções', 'começos', 'introspecção', 'planejamento']
  },
  crescente_inicial: {
    phaseName: 'Lua Crescente (inicial)',
    phaseNameShort: 'Crescente inicial',
    emoji: '🌒',
    description: 'Pequena faixa iluminada aparece no lado direito; a lua “cresce” em visibilidade.',
    mystical:
      'Fase de impulso e crescimento. A energia acumula e favorece projetos que você iniciou na Lua Nova. Momento de dar os primeiros passos concretos e alimentar suas intenções.',
    advice:
      'Coloque em prática um plano que você traçou. Boa fase para buscar informações, fazer cursos e fortalecer hábitos. Evite desistir de algo que acabou de começar.',
    keywords: ['crescimento', 'ação', 'impulso', 'desenvolvimento', 'fé']
  },
  quarto_crescente: {
    phaseName: 'Quarto Crescente',
    phaseNameShort: 'Quarto crescente',
    emoji: '🌓',
    description: 'Metade do disco lunar visível (lado direito iluminado).',
    mystical:
      'Energia de superação de obstáculos. A Lua convida a enfrentar desafios e a persistir. Simboliza o equilíbrio entre o que foi plantado e o que ainda está por vir.',
    advice:
      'Enfrente resistências com determinação. Revisite metas e ajuste o que for necessário. Bom período para resolver conflitos e tomar decisões que exigem coragem.',
    keywords: ['persistência', 'desafios', 'equilíbrio', 'decisão', 'coragem']
  },
  crescente_gibosa: {
    phaseName: 'Lua Crescente Gibosa',
    phaseNameShort: 'Crescente gibosa',
    emoji: '🌔',
    description: 'Mais da metade do disco iluminado; a lua se aproxima da cheia.',
    mystical:
      'Abundância e expansão. A energia lunar está quase no ápice, favorecendo realização, reconhecimento e conclusão de etapas. Momento de confiar no processo.',
    advice:
      'Acelere o que está em andamento e finalize pendências. Boa fase para pedir aumentos, divulgar trabalho ou celebrar conquistas. Evite iniciar muitos projetos novos ao mesmo tempo.',
    keywords: ['abundância', 'expansão', 'realização', 'confiança', 'reconhecimento']
  },
  cheia: {
    phaseName: 'Lua Cheia',
    phaseNameShort: 'Cheia',
    emoji: '🌕',
    description: 'O disco lunar está totalmente iluminado pela luz do Sol.',
    mystical:
      'Clareza, plenitude e manifestação. A Lua Cheia ilumina o que estava oculto e amplifica emoções e intuições. Poderoso momento para rituais de gratidão, amor e realização.',
    advice:
      'Celebre suas conquistas e agradeça. Ótima noite para meditação ao ar livre, banhos de lua e rituais de amor. Evite discussões importantes; as emoções podem estar à flor da pele.',
    keywords: ['clareza', 'plenitude', 'gratidão', 'amor', 'manifestação']
  },
  minguante_gibosa: {
    phaseName: 'Lua Minguante Gibosa',
    phaseNameShort: 'Minguante gibosa',
    emoji: '🌖',
    description: 'Mais da metade ainda iluminada, mas a área visível começa a diminuir.',
    mystical:
      'Fase de entrega e liberação. A energia convida a soltar o que não serve mais, perdoar e fazer espaço. Momento de colher aprendizados e preparar o terreno para o novo ciclo.',
    advice:
      'Desapegue de hábitos ou situações que não fazem mais sentido. Boa fase para desintoxicação, limpeza física e emocional, e para encerrar ciclos com gratidão.',
    keywords: ['liberação', 'desapego', 'gratidão', 'limpeza', 'encerramento']
  },
  quarto_minguante: {
    phaseName: 'Quarto Minguante',
    phaseNameShort: 'Quarto minguante',
    emoji: '🌗',
    description: 'Metade do disco visível (lado esquerdo iluminado).',
    mystical:
      'Reflexão e revisão. A Lua convida a olhar para trás com sabedoria, corrigir rotas e integrar experiências. Energia propícia para autoconhecimento e cura.',
    advice:
      'Revise o mês e anote lições aprendidas. Ideal para terapia, jornais de reflexão e conversas profundas. Evite começar projetos grandes; use o tempo para organizar e planejar.',
    keywords: ['reflexão', 'revisão', 'cura', 'autoconhecimento', 'sabedoria']
  },
  minguante: {
    phaseName: 'Lua Minguante',
    phaseNameShort: 'Minguante',
    emoji: '🌘',
    description: 'Apenas uma fina faixa iluminada; a lua se prepara para a fase nova.',
    mystical:
      'Repouso e introspecção profunda. A energia está no mínimo, favorecendo descanso, sonhos e contato com o inconsciente. Preparação silenciosa para o renascimento.',
    advice:
      'Reduza o ritmo e priorize o descanso. Boa fase para dormir cedo, sonhar e anotar insights. Evite compromissos pesados ou decisões irreversíveis; espere a Lua Nova.',
    keywords: ['repouso', 'sonhos', 'introspecção', 'renascimento', 'silêncio']
  }
}

/** Retorna o id da fase a partir da idade da lua em dias (0 a ~29.53). */
function getPhaseId(ageDays: number): MoonPhaseId {
  if (ageDays < 1.85) return 'nova'
  if (ageDays < 7.38) return 'crescente_inicial'
  if (ageDays < 9.23) return 'quarto_crescente'
  if (ageDays < 14.76) return 'crescente_gibosa'
  if (ageDays < 16.61) return 'cheia'
  if (ageDays < 22.14) return 'minguante_gibosa'
  if (ageDays < 23.99) return 'quarto_minguante'
  return 'minguante'
}

/** Retorna informações completas da fase da lua para a data dada. */
export function getMoonPhaseInfo(date: Date): MoonPhaseInfo {
  const ageDays = getMoonAgeDays(date)
  const phaseId = getPhaseId(ageDays)
  const data = PHASE_DATA[phaseId]
  return {
    phaseId,
    phaseName: data.phaseName,
    phaseNameShort: data.phaseNameShort,
    emoji: data.emoji,
    description: data.description,
    mystical: data.mystical,
    advice: data.advice,
    keywords: data.keywords
  }
}
