import { PrismaClient, Sign, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Dados dos signos (imutáveis)
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

// Função para expandir array para 30+ itens
function expandToMinimum<T>(items: T[], targetCount: number, generator: (base: T[], index: number) => T): T[] {
  if (items.length >= targetCount) return items
  
  const expanded = [...items]
  const baseCount = items.length
  
  for (let i = baseCount; i < targetCount; i++) {
    expanded.push(generator(items, i))
  }
  
  return expanded
}

// Função para gerar variações de textos
function generateVariation(baseTexts: string[], index: number): string {
  const base = baseTexts[index % baseTexts.length]
  const variations = [
    base,
    `${base} hoje`,
    `${base} neste período`,
    `É importante ${base.toLowerCase()}`,
    `Recomenda-se ${base.toLowerCase()}`,
    `Mantenha ${base.toLowerCase()}`,
    `Valorize ${base.toLowerCase()}`,
    `Foque em ${base.toLowerCase()}`,
    `Seja ${base.toLowerCase()}`,
    `Demonstre ${base.toLowerCase()}`
  ]
  return variations[index % variations.length]
}

async function createDefaultUsers() {
  console.log('👤 Criando usuários padrão...')

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

  console.log('\n📝 Credenciais de acesso:')
  console.log('Admin: admin@horoscopo.com / admin123')
  console.log('Editor: editor@horoscopo.com / editor123')
  console.log('Viewer: viewer@horoscopo.com / viewer123')
}

async function seedZodiacData() {
  console.log('\n🌱 Iniciando seed de dados astrológicos...')

  // Verificar se as tabelas existem
  try {
    await prisma.$queryRaw`SELECT 1 FROM zodiac_signs LIMIT 1`
  } catch (error: any) {
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      console.error('❌ Erro: As tabelas do banco de dados não existem!')
      console.error('📝 Execute as migrations primeiro:')
      console.error('   docker exec -it web_reactjs_horoscopo npx prisma migrate deploy')
      console.error('   ou')
      console.error('   docker exec -it web_reactjs_horoscopo npx prisma migrate dev')
      process.exit(1)
    }
    throw error
  }

  // Criar signos
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

  // Importar dados dos geradores
  const generatorModule = await import('../lib/generator')
  const careerData = generatorModule.careerAdvices as Record<Sign, string[]>
  const loveData = generatorModule.loveAdvices as Record<Sign, string[]>
  const crystalData = generatorModule.crystals as Record<Sign, string[]>
  const alertData = generatorModule.dailyAlerts as Record<Sign, string[]>
  const activityData = generatorModule.recommendedActivities as Record<Sign, string[]>
  const practicalData = generatorModule.practicalAdvices as Record<Sign, string[]>
  const colorData = generatorModule.luckyColors as Record<Sign, string[]>
  const emotionData = generatorModule.emotions as Record<Sign, string[]>
  const impactData = generatorModule.impactPhrases as string[]
  const mantraData = generatorModule.mantras as string[]

  // Popular CareerAdvice (já tem 35 por signo)
  console.log('📝 Populando conselhos profissionais...')
  for (const signName of Object.keys(createdSigns) as Sign[]) {
    const signId = createdSigns[signName]
    if (!signId) continue
    const advices = careerData[signName] || []
    
    // Deletar existentes e criar novos
    await prisma.careerAdvice.deleteMany({ where: { signId } })
    
    for (const text of advices) {
      await prisma.careerAdvice.create({
        data: { signId, text }
      })
    }
    console.log(`  ✅ ${advices.length} conselhos profissionais para ${signName}`)
  }

  // Popular LoveAdvice (expandir para 30+)
  console.log('💕 Populando conselhos amorosos...')
  for (const signName of Object.keys(createdSigns) as Sign[]) {
    const signId = createdSigns[signName]
    if (!signId) continue
    const advices = loveData[signName] || []
    const expanded = expandToMinimum(advices, 30, (base, i) => generateVariation(base, i))
    
    await prisma.loveAdvice.deleteMany({ where: { signId } })
    
    for (const text of expanded) {
      await prisma.loveAdvice.create({
        data: { signId, text }
      })
    }
    console.log(`  ✅ ${expanded.length} conselhos amorosos para ${signName}`)
  }

  // Popular Crystal (expandir para 30+)
  console.log('💎 Populando cristais...')
  for (const signName of Object.keys(createdSigns) as Sign[]) {
    const signId = createdSigns[signName]
    if (!signId) continue
    const crystals = crystalData[signName] || []
    const expanded = expandToMinimum(crystals, 30, (base, i) => {
      const crystalNames = ['Quartzo', 'Ametista', 'Citrino', 'Topázio', 'Esmeralda', 'Rubi', 'Safira', 'Opala', 'Pérola', 'Ágata', 'Jaspe', 'Obsidiana', 'Turquesa', 'Lápis-lazúli', 'Água-marinha']
      return `${crystalNames[i % crystalNames.length]} ${base}`
    })
    
    await prisma.crystal.deleteMany({ where: { signId } })
    
    for (const text of expanded) {
      await prisma.crystal.create({
        data: { signId, text }
      })
    }
    console.log(`  ✅ ${expanded.length} cristais para ${signName}`)
  }

  // Popular DailyAlert (expandir para 30+)
  console.log('⚠️ Populando alertas do dia...')
  for (const signName of Object.keys(createdSigns) as Sign[]) {
    const signId = createdSigns[signName]
    if (!signId) continue
    const alerts = alertData[signName] || []
    const expanded = expandToMinimum(alerts, 30, (base, i) => generateVariation(base, i))
    
    await prisma.dailyAlert.deleteMany({ where: { signId } })
    
    for (const text of expanded) {
      await prisma.dailyAlert.create({
        data: { signId, text }
      })
    }
    console.log(`  ✅ ${expanded.length} alertas para ${signName}`)
  }

  // Popular RecommendedActivity (expandir para 30+)
  console.log('✨ Populando atividades recomendadas...')
  for (const signName of Object.keys(createdSigns) as Sign[]) {
    const signId = createdSigns[signName]
    if (!signId) continue
    const activities = activityData[signName] || []
    const expanded = expandToMinimum(activities, 30, (base, i) => generateVariation(base, i))
    
    await prisma.recommendedActivity.deleteMany({ where: { signId } })
    
    for (const text of expanded) {
      await prisma.recommendedActivity.create({
        data: { signId, text }
      })
    }
    console.log(`  ✅ ${expanded.length} atividades para ${signName}`)
  }

  // Popular PracticalAdvice (expandir para 30+)
  console.log('💡 Populando conselhos práticos...')
  for (const signName of Object.keys(createdSigns) as Sign[]) {
    const signId = createdSigns[signName]
    if (!signId) continue
    const advices = practicalData[signName] || []
    const expanded = expandToMinimum(advices, 30, (base, i) => generateVariation(base, i))
    
    await prisma.practicalAdvice.deleteMany({ where: { signId } })
    
    for (const text of expanded) {
      await prisma.practicalAdvice.create({
        data: { signId, text }
      })
    }
    console.log(`  ✅ ${expanded.length} conselhos práticos para ${signName}`)
  }

  // Popular LuckyColor (expandir para 30+)
  console.log('🎨 Populando cores da sorte...')
  for (const signName of Object.keys(createdSigns) as Sign[]) {
    const signId = createdSigns[signName]
    if (!signId) continue
    const colors = colorData[signName] || []
    const colorVariations = ['claro', 'escuro', 'pastel', 'vibrante', 'suave', 'intenso', 'brilhante', 'opaco']
    const expanded = expandToMinimum(colors, 30, (base, i) => {
      const variation = colorVariations[i % colorVariations.length]
      return `${base} ${variation}`
    })
    
    await prisma.luckyColor.deleteMany({ where: { signId } })
    
    for (const text of expanded) {
      await prisma.luckyColor.create({
        data: { signId, text }
      })
    }
    console.log(`  ✅ ${expanded.length} cores para ${signName}`)
  }

  // Popular Emotion (expandir para 30+)
  console.log('😊 Populando emoções...')
  for (const signName of Object.keys(createdSigns) as Sign[]) {
    const signId = createdSigns[signName]
    if (!signId) continue
    const emotions = emotionData[signName] || []
    const expanded = expandToMinimum(emotions, 30, (base, i) => generateVariation(base, i))
    
    await prisma.emotion.deleteMany({ where: { signId } })
    
    for (const text of expanded) {
      await prisma.emotion.create({
        data: { signId, text }
      })
    }
    console.log(`  ✅ ${expanded.length} emoções para ${signName}`)
  }

  // Popular ImpactPhrase (expandir para 30+ por signo)
  console.log('💫 Populando frases de impacto...')
  for (const signName of Object.keys(createdSigns) as Sign[]) {
    const signId = createdSigns[signName]
    if (!signId) continue
    // Usar as frases globais como base e criar variações por signo
    // Garantir que impactData é um array
    let basePhrases: string[] = []
    if (Array.isArray(impactData)) {
      basePhrases = impactData
    } else if (typeof impactData === 'string') {
      // Se vier como string, tentar dividir por vírgula
      basePhrases = impactData.split(',').map(s => s.trim()).filter(s => s.length > 0)
    }
    
    const signDisplay = signsData.find(s => s.name === signName)?.displayName || ''
    
    // Processar cada frase individualmente
    const processedPhrases: string[] = []
    const targetCount = Math.max(30, basePhrases.length)
    for (let i = 0; i < targetCount; i++) {
      const phrase = basePhrases[i % basePhrases.length]
      if (typeof phrase === 'string' && phrase.trim().length > 0) {
        processedPhrases.push(`${phrase.trim()} ${signDisplay}`)
      }
    }
    
    await prisma.impactPhrase.deleteMany({ where: { signId } })
    
    for (const text of processedPhrases) {
      await prisma.impactPhrase.create({
        data: { signId, text }
      })
    }
    console.log(`  ✅ ${processedPhrases.length} frases de impacto para ${signName}`)
  }

  // Popular Mantra (expandir para 30+ por signo)
  console.log('🧘 Populando mantras...')
  for (const signName of Object.keys(createdSigns) as Sign[]) {
    const signId = createdSigns[signName]
    if (!signId) continue
    // Usar os mantras globais como base e criar variações por signo
    // Garantir que mantraData é um array
    let baseMantras: string[] = []
    if (Array.isArray(mantraData)) {
      baseMantras = mantraData
    } else if (typeof mantraData === 'string') {
      // Se vier como string, tentar dividir por vírgula
      baseMantras = mantraData.split(',').map(s => s.trim()).filter(s => s.length > 0)
    }
    
    const signDisplay = signsData.find(s => s.name === signName)?.displayName || ''
    
    // Processar cada mantra individualmente
    const processedMantras: string[] = []
    const targetCount = Math.max(30, baseMantras.length)
    for (let i = 0; i < targetCount; i++) {
      const mantra = baseMantras[i % baseMantras.length]
      if (typeof mantra === 'string' && mantra.trim().length > 0) {
        processedMantras.push(`${mantra.trim()} ${signDisplay}`)
      }
    }
    
    await prisma.mantra.deleteMany({ where: { signId } })
    
    for (const text of processedMantras) {
      await prisma.mantra.create({
        data: { signId, text }
      })
    }
    console.log(`  ✅ ${processedMantras.length} mantras para ${signName}`)
  }

  console.log('✅ Seed de dados astrológicos concluído!')
}

async function main() {
  // Criar usuários padrão primeiro
  await createDefaultUsers()
  
  // Depois popular dados astrológicos
  await seedZodiacData()
  
  console.log('\n🎉 Seed completo concluído!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

