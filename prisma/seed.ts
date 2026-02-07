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
    
    const expanded = expandToMinimum(mantras, 30, (base, i) => {
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

