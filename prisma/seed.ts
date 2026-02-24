import { PrismaClient, UserRole, Sign } from '@prisma/client'
import bcrypt from 'bcryptjs'
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

  /** Limite máximo de variações por tipo (por signo quando aplicável). */
  const LIMITS = {
    practicalAdvices: 30,
    recommendedActivities: 20,
    dailyAlerts: 20,
    mantras: 30,
    loveAdvices: 20,
    impactPhrases: 40,
    careerAdvices: 100,
    crystals: 100,
    luckyColors: 100,
    emotions: 100
  } as const

  function expandToMinimum<T>(items: T[], targetCount: number, generator: (base: T[], index: number) => T): T[] {
    const limit = Math.min(targetCount, 200)
    if (items.length >= limit) return items.slice(0, limit)
    const expanded = [...items]
    for (let i = items.length; i < limit; i++) {
      expanded.push(generator(items, i))
    }
    return expanded
  }

  /** Templates com contexto de previsão horóscopo para gerar até 100 variações. */
  function generateVariation(baseTexts: string[], index: number): string {
    const base = baseTexts[index % baseTexts.length]
    const b = base.toLowerCase()
    const templates = [
      () => base,
      () => `${base} hoje`,
      () => `${base} neste período`,
      () => `Para hoje: ${b}`,
      () => `O dia favorece ${b}`,
      () => `As estrelas favorecem ${b}`,
      () => `O momento pede ${b}`,
      () => `É importante ${b}`,
      () => `Recomenda-se ${b}`,
      () => `Mantenha ${b}`,
      () => `Valorize ${b}`,
      () => `Foque em ${b}`,
      () => `Seja ${b}`,
      () => `Demonstre ${b}`,
      () => `Aproveite ${b}`,
      () => `Dê prioridade a ${b}`,
      () => `Evite negligenciar ${b}`,
      () => `No trabalho: ${b}`,
      () => `No amor: ${b}`,
      () => `Na saúde: ${b}`,
      () => `Na rotina: ${b}`,
      () => `Em decisões: ${b}`,
      () => `${base} — boa energia para o dia`,
      () => `Previsão do dia: ${b}`,
      () => `Conselho das estrelas: ${b}`,
    ]
    return templates[index % templates.length]()
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

  // Para cores da sorte: apenas nomes de cores (sem prefixos)
  function expandColorsOnly(baseTexts: string[], targetCount: number): string[] {
    const limit = Math.min(targetCount, 200)
    if (baseTexts.length >= limit) return baseTexts.slice(0, limit)
    const out = [...baseTexts]
    for (let i = baseTexts.length; i < limit; i++) {
      out.push(baseTexts[i % baseTexts.length])
    }
    return out
  }

  // Popular todas as tabelas (limites por tipo: 20/30/40/100)
  const tables = [
    { name: 'conselhos profissionais', data: careerAdvices, model: prisma.careerAdvice, minCount: LIMITS.careerAdvices },
    { name: 'conselhos amorosos', data: loveAdvices, model: prisma.loveAdvice, minCount: LIMITS.loveAdvices },
    { name: 'cristais', data: crystals, model: prisma.crystal, minCount: LIMITS.crystals },
    { name: 'alertas do dia', data: dailyAlerts, model: prisma.dailyAlert, minCount: LIMITS.dailyAlerts },
    { name: 'atividades recomendadas', data: recommendedActivities, model: prisma.recommendedActivity, minCount: LIMITS.recommendedActivities },
    { name: 'conselhos práticos', data: practicalAdvices, model: prisma.practicalAdvice, minCount: LIMITS.practicalAdvices },
    { name: 'cores da sorte', data: luckyColors, model: prisma.luckyColor, minCount: LIMITS.luckyColors },
    { name: 'emoções', data: emotions, model: prisma.emotion, minCount: LIMITS.emotions }
  ]

  for (const table of tables) {
    console.log(`📝 Populando ${table.name}...`)
    for (const signName of Object.keys(createdSigns) as Sign[]) {
      const signId = createdSigns[signName]
      if (!signId) continue

      const items = (table.data as Record<Sign, string[]>)[signName] || []
      const expanded = table.name === 'cores da sorte'
        ? expandColorsOnly(items, table.minCount)
        : expandToMinimum(items, table.minCount, (base, i) => generateVariation(base, i))

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
    
    const expanded = expandToMinimum(impactPhrases, LIMITS.impactPhrases, (base, i) => {
      const phrase = base[i % base.length]
      const signDisplay = signsData.find(s => s.name === signName)?.displayName || ''
      return `${phrase} ${signDisplay}`
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
    
    const expanded = expandToMinimum(mantras, LIMITS.mantras, (base, i) => {
      const phrase = base[i % base.length]
      const signDisplay = signsData.find(s => s.name === signName)?.displayName || ''
      return `${phrase} ${signDisplay}`
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

