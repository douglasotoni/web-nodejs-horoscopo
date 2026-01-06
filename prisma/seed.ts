import { PrismaClient, UserRole, Sign, Weekday, PredictionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { getISOWeek, getISOWeekYear } from 'date-fns'
import { 
  careerAdvices, 
  loveAdvices, 
  crystals, 
  dailyAlerts, 
  recommendedActivities, 
  practicalAdvices, 
  luckyColors, 
  emotions, 
  impactPhrases, 
  mantras 
} from '../lib/generator'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Criar usuário admin padrão
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@horoscopo.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@horoscopo.com',
      passwordHash: adminPassword,
      role: UserRole.admin
    }
  })
  console.log('✅ Usuário admin criado:', admin.email)

  // Criar usuário editor
  const editorPassword = await bcrypt.hash('editor123', 10)
  const editor = await prisma.user.upsert({
    where: { email: 'editor@horoscopo.com' },
    update: {},
    create: {
      name: 'Editor',
      email: 'editor@horoscopo.com',
      passwordHash: editorPassword,
      role: UserRole.editor
    }
  })
  console.log('✅ Usuário editor criado:', editor.email)

  // Criar usuário viewer
  const viewerPassword = await bcrypt.hash('viewer123', 10)
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@horoscopo.com' },
    update: {},
    create: {
      name: 'Visualizador',
      email: 'viewer@horoscopo.com',
      passwordHash: viewerPassword,
      role: UserRole.viewer
    }
  })
  console.log('✅ Usuário viewer criado:', viewer.email)

  // Obter semana atual
  const now = new Date()
  const isoWeek = getISOWeek(now)
  const isoYear = getISOWeekYear(now)

  // Criar algumas previsões diárias de exemplo
  const signs: Sign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
  const weekdays: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  for (const sign of signs) {
    for (const weekday of weekdays) {
      const seed = `${sign}-${weekday}-${isoWeek}-${isoYear}`
      let hash = 0
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      const luckyNumber = Math.abs(hash % 60) + 1

      const texts: Partial<Record<Sign, string>> = {
        aries: 'Este é um momento propício para explorar liderança. O início da semana favorece novas oportunidades. Mantenha o foco e evite decisões impulsivas.',
        taurus: 'Este é um momento propício para explorar estabilidade. O meio da semana favorece segurança. Invista em seus projetos pessoais.',
        gemini: 'Este é um momento propício para explorar comunicação. O fim da semana favorece socialização. Pense bem antes de agir.',
        cancer: 'Este é um momento propício para explorar emoções. O início da semana favorece família. Mantenha o equilíbrio.',
        leo: 'Este é um momento propício para explorar criatividade. O meio da semana favorece expressão. Aproveite as oportunidades.',
        virgo: 'Este é um momento propício para explorar organização. O fim da semana favorece perfeccionismo. Não se apresse.',
        libra: 'Este é um momento propício para explorar harmonia. O início da semana favorece relacionamentos. Busque o equilíbrio em todas as áreas.',
        scorpio: 'Este é um momento propício para explorar transformação. O meio da semana favorece introspecção. Confie em sua intuição profunda.',
        sagittarius: 'Este é um momento propício para explorar aventura. O fim da semana favorece novas experiências. Mantenha-se aberto a oportunidades.',
        capricorn: 'Este é um momento propício para explorar ambição. O início da semana favorece planejamento. Foque em seus objetivos de longo prazo.',
        aquarius: 'Este é um momento propício para explorar inovação. O meio da semana favorece criatividade. Pense fora da caixa.',
        pisces: 'Este é um momento propício para explorar intuição. O fim da semana favorece espiritualidade. Conecte-se com seu lado emocional.'
      }

      await prisma.dailyPrediction.upsert({
        where: {
          sign_weekday_isoWeek_isoYear: {
            sign,
            weekday,
            isoWeek,
            isoYear
          }
        },
        update: {},
        create: {
          sign,
          weekday,
          isoWeek,
          isoYear,
          text: texts[sign] || 'Previsão gerada automaticamente.',
          luckyNumber,
          status: PredictionStatus.published
        }
      })
    }
  }
  console.log('✅ Previsões diárias criadas')

  // Criar previsões semanais
  for (const sign of signs) {
    const seed = `${sign}-week-${isoWeek}-${isoYear}`
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    const luckyNumber = Math.abs(hash % 60) + 1

    const texts: Partial<Record<Sign, string>> = {
      aries: 'Esta semana será marcada por liderança para Áries. As áreas de trabalho e amor merecem atenção especial. Invista em seus projetos pessoais e mantenha o equilíbrio. Evite tomar decisões impulsivas. Mantenha-se atento aos sinais e confie em sua intuição.',
      taurus: 'Esta semana será marcada por estabilidade para Touro. As áreas de finanças e saúde merecem atenção especial. Priorize seus objetivos e aproveite as oportunidades que surgirem. Cuidado com excessos. Aproveite os momentos de calma para recarregar suas energias.',
      gemini: 'Esta semana será marcada por comunicação para Gêmeos. As áreas de relacionamentos e trabalho merecem atenção especial. Dedique tempo para seus projetos e mantenha o foco. Pense bem antes de agir. Confie em sua intuição e aproveite as oportunidades.',
      cancer: 'Esta semana será marcada por emoções para Câncer. As áreas de família e amor merecem atenção especial. Invista em seus relacionamentos e mantenha o equilíbrio. Evite decisões impulsivas. Mantenha-se atento aos sinais e confie em sua intuição.',
      leo: 'Esta semana será marcada por criatividade para Leão. As áreas de trabalho e expressão merecem atenção especial. Priorize seus projetos criativos e aproveite as oportunidades. Cuidado com excessos. Aproveite os momentos de calma para recarregar.',
      virgo: 'Esta semana será marcada por organização para Virgem. As áreas de saúde e trabalho merecem atenção especial. Dedique tempo para organização e mantenha o foco. Pense bem antes de agir. Confie em sua intuição e aproveite as oportunidades.',
      libra: 'Esta semana será marcada por harmonia para Libra. As áreas de relacionamentos e parcerias merecem atenção especial. Busque o equilíbrio em todas as decisões. Evite conflitos desnecessários. Mantenha-se aberto ao diálogo e à cooperação.',
      scorpio: 'Esta semana será marcada por transformação para Escorpião. As áreas de crescimento pessoal e introspecção merecem atenção especial. Confie em sua intuição profunda. Evite guardar ressentimentos. Aproveite para renovar suas energias.',
      sagittarius: 'Esta semana será marcada por aventura para Sagitário. As áreas de aprendizado e novas experiências merecem atenção especial. Mantenha-se aberto a oportunidades. Evite ficar preso à rotina. Aproveite para expandir seus horizontes.',
      capricorn: 'Esta semana será marcada por ambição para Capricórnio. As áreas de carreira e planejamento merecem atenção especial. Foque em seus objetivos de longo prazo. Evite ser muito rígido. Mantenha o equilíbrio entre trabalho e descanso.',
      aquarius: 'Esta semana será marcada por inovação para Aquário. As áreas de criatividade e projetos inovadores merecem atenção especial. Pense fora da caixa. Evite seguir apenas o convencional. Aproveite para expressar suas ideias únicas.',
      pisces: 'Esta semana será marcada por intuição para Peixes. As áreas de espiritualidade e conexão emocional merecem atenção especial. Conecte-se com seu lado sensível. Evite se perder em sonhos. Mantenha os pés no chão enquanto explora seu mundo interior.'
    }

    await prisma.weeklyPrediction.upsert({
      where: {
        sign_isoWeek_isoYear: {
          sign,
          isoWeek,
          isoYear
        }
      },
      update: {},
      create: {
        sign,
        isoWeek,
        isoYear,
        text: texts[sign] || 'Previsão semanal gerada automaticamente.',
        luckyNumber,
        status: PredictionStatus.published
      }
    })
  }
  console.log('✅ Previsões semanais criadas')

  console.log('🎉 Seed concluído!')
  console.log('\n📝 Credenciais de acesso:')
  console.log('Admin: admin@horoscopo.com / admin123')
  console.log('Editor: editor@horoscopo.com / editor123')
  console.log('Viewer: viewer@horoscopo.com / viewer123')
  
  // Seed de dados astrológicos
  await seedZodiacData()
}

async function seedZodiacData() {
  console.log('\n🌱 Iniciando seed de dados astrológicos...')

  const signsData: Array<{
    name: Sign
    displayName: string
    element: string
    quality: string
    rulingPlanet: string
  }> = [
    { name: 'aries', displayName: 'Áries', element: 'fogo', quality: 'cardinal', rulingPlanet: 'Marte' },
    { name: 'taurus', displayName: 'Touro', element: 'terra', quality: 'fixo', rulingPlanet: 'Vênus' },
    { name: 'gemini', displayName: 'Gêmeos', element: 'ar', quality: 'mutável', rulingPlanet: 'Mercúrio' },
    { name: 'cancer', displayName: 'Câncer', element: 'água', quality: 'cardinal', rulingPlanet: 'Lua' },
    { name: 'leo', displayName: 'Leão', element: 'fogo', quality: 'fixo', rulingPlanet: 'Sol' },
    { name: 'virgo', displayName: 'Virgem', element: 'terra', quality: 'mutável', rulingPlanet: 'Mercúrio' },
    { name: 'libra', displayName: 'Libra', element: 'ar', quality: 'cardinal', rulingPlanet: 'Vênus' },
    { name: 'scorpio', displayName: 'Escorpião', element: 'água', quality: 'fixo', rulingPlanet: 'Marte' },
    { name: 'sagittarius', displayName: 'Sagitário', element: 'fogo', quality: 'mutável', rulingPlanet: 'Júpiter' },
    { name: 'capricorn', displayName: 'Capricórnio', element: 'terra', quality: 'cardinal', rulingPlanet: 'Saturno' },
    { name: 'aquarius', displayName: 'Aquário', element: 'ar', quality: 'fixo', rulingPlanet: 'Urano' },
    { name: 'pisces', displayName: 'Peixes', element: 'água', quality: 'mutável', rulingPlanet: 'Netuno' }
  ]

  function expandToMinimum<T>(items: T[], targetCount: number, generator: (base: T[], index: number) => T): T[] {
    if (items.length >= targetCount) return items
    const expanded = [...items]
    for (let i = items.length; i < targetCount; i++) {
      expanded.push(generator(items, i))
    }
    return expanded
  }

  function generateVariation(baseTexts: string[], index: number): string {
    const base = baseTexts[index % baseTexts.length]
    const variations = [
      base, `${base} hoje`, `${base} neste período`,
      `É importante ${base.toLowerCase()}`, `Recomenda-se ${base.toLowerCase()}`,
      `Mantenha ${base.toLowerCase()}`, `Valorize ${base.toLowerCase()}`,
      `Foque em ${base.toLowerCase()}`, `Seja ${base.toLowerCase()}`,
      `Demonstre ${base.toLowerCase()}`
    ]
    return variations[index % variations.length]
  }

  const createdSigns: Partial<Record<Sign, number>> = {}
  for (const signData of signsData) {
    const sign = await prisma.zodiacSign.upsert({
      where: { name: signData.name },
      update: {
        displayName: signData.displayName,
        element: signData.element,
        quality: signData.quality,
        rulingPlanet: signData.rulingPlanet
      },
      create: signData
    })
    createdSigns[signData.name] = sign.id
    console.log(`✅ Signo ${signData.displayName} criado/atualizado`)
  }

  // Popular todas as tabelas
  const tables = [
    { name: 'conselhos profissionais', data: careerAdvices, model: prisma.careerAdvice, minCount: 30 },
    { name: 'conselhos amorosos', data: loveAdvices, model: prisma.loveAdvice, minCount: 30 },
    { name: 'cristais', data: crystals, model: prisma.crystal, minCount: 30 },
    { name: 'alertas do dia', data: dailyAlerts, model: prisma.dailyAlert, minCount: 30 },
    { name: 'atividades recomendadas', data: recommendedActivities, model: prisma.recommendedActivity, minCount: 30 },
    { name: 'conselhos práticos', data: practicalAdvices, model: prisma.practicalAdvice, minCount: 30 },
    { name: 'cores da sorte', data: luckyColors, model: prisma.luckyColor, minCount: 30 },
    { name: 'emoções', data: emotions, model: prisma.emotion, minCount: 30 }
  ]

  for (const table of tables) {
    console.log(`📝 Populando ${table.name}...`)
    for (const signName of Object.keys(createdSigns) as Sign[]) {
      const signId = createdSigns[signName]
      if (!signId) continue
      
      const items = (table.data as Record<Sign, string[]>)[signName] || []
      const expanded = expandToMinimum(items, table.minCount, (base, i) => generateVariation(base, i))
      
      await table.model.deleteMany({ where: { signId } })
      
      for (const text of expanded) {
        await table.model.create({ data: { signId, text } })
      }
      console.log(`  ✅ ${expanded.length} ${table.name} para ${signName}`)
    }
  }

  // ImpactPhrase e Mantra (globais, mas vamos criar por signo)
  console.log('💫 Populando frases de impacto...')
  for (const signName of Object.keys(createdSigns) as Sign[]) {
    const signId = createdSigns[signName]
    if (!signId) continue
    
    const expanded = expandToMinimum(impactPhrases, 30, (base, i) => {
      const signDisplay = signsData.find(s => s.name === signName)?.displayName || ''
      return `${base} ${signDisplay}`
    })
    
    await prisma.impactPhrase.deleteMany({ where: { signId } })
    for (const text of expanded) {
      await prisma.impactPhrase.create({ data: { signId, text } })
    }
    console.log(`  ✅ ${expanded.length} frases de impacto para ${signName}`)
  }

  console.log('🧘 Populando mantras...')
  for (const signName of Object.keys(createdSigns) as Sign[]) {
    const signId = createdSigns[signName]
    if (!signId) continue
    
    const expanded = expandToMinimum(mantras, 30, (base, i) => {
      const signDisplay = signsData.find(s => s.name === signName)?.displayName || ''
      return `${base} ${signDisplay}`
    })
    
    await prisma.mantra.deleteMany({ where: { signId } })
    for (const text of expanded) {
      await prisma.mantra.create({ data: { signId, text } })
    }
    console.log(`  ✅ ${expanded.length} mantras para ${signName}`)
  }

  console.log('✅ Seed de dados astrológicos concluído!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

