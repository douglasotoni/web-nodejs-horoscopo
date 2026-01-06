import { PrismaClient, Sign } from '@prisma/client'

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

async function seedZodiacData() {
  console.log('🌱 Iniciando seed de dados astrológicos...')

  // Criar signos
  const createdSigns: Partial<Record<Sign, string>> = {}
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
    const basePhrases = impactData || []
    const expanded = expandToMinimum(basePhrases, 30, (base, i) => {
      const signDisplay = signsData.find(s => s.name === signName)?.displayName || ''
      return `${base} ${signDisplay}`
    })
    
    await prisma.impactPhrase.deleteMany({ where: { signId } })
    
    for (const text of expanded) {
      await prisma.impactPhrase.create({
        data: { signId, text }
      })
    }
    console.log(`  ✅ ${expanded.length} frases de impacto para ${signName}`)
  }

  // Popular Mantra (expandir para 30+ por signo)
  console.log('🧘 Populando mantras...')
  for (const signName of Object.keys(createdSigns) as Sign[]) {
    const signId = createdSigns[signName]
    if (!signId) continue
    // Usar os mantras globais como base e criar variações por signo
    const baseMantras = mantraData || []
    const expanded = expandToMinimum(baseMantras, 30, (base, i) => {
      const signDisplay = signsData.find(s => s.name === signName)?.displayName || ''
      return `${base} ${signDisplay}`
    })
    
    await prisma.mantra.deleteMany({ where: { signId } })
    
    for (const text of expanded) {
      await prisma.mantra.create({
        data: { signId, text }
      })
    }
    console.log(`  ✅ ${expanded.length} mantras para ${signName}`)
  }

  console.log('✅ Seed de dados astrológicos concluído!')
}

seedZodiacData()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

