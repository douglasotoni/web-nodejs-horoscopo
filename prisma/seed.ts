import { PrismaClient, UserRole, Sign, Weekday, PredictionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { getISOWeek, getISOWeekYear } from 'date-fns'

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
  const signs: Sign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo']
  const weekdays: Weekday[] = ['monday', 'tuesday', 'wednesday']

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

      const texts = {
        aries: 'Este é um momento propício para explorar liderança. O início da semana favorece novas oportunidades. Mantenha o foco e evite decisões impulsivas.',
        taurus: 'Este é um momento propício para explorar estabilidade. O meio da semana favorece segurança. Invista em seus projetos pessoais.',
        gemini: 'Este é um momento propício para explorar comunicação. O fim da semana favorece socialização. Pense bem antes de agir.',
        cancer: 'Este é um momento propício para explorar emoções. O início da semana favorece família. Mantenha o equilíbrio.',
        leo: 'Este é um momento propício para explorar criatividade. O meio da semana favorece expressão. Aproveite as oportunidades.',
        virgo: 'Este é um momento propício para explorar organização. O fim da semana favorece perfeccionismo. Não se apresse.'
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

    const texts = {
      aries: 'Esta semana será marcada por liderança para Áries. As áreas de trabalho e amor merecem atenção especial. Invista em seus projetos pessoais e mantenha o equilíbrio. Evite tomar decisões impulsivas. Mantenha-se atento aos sinais e confie em sua intuição.',
      taurus: 'Esta semana será marcada por estabilidade para Touro. As áreas de finanças e saúde merecem atenção especial. Priorize seus objetivos e aproveite as oportunidades que surgirem. Cuidado com excessos. Aproveite os momentos de calma para recarregar suas energias.',
      gemini: 'Esta semana será marcada por comunicação para Gêmeos. As áreas de relacionamentos e trabalho merecem atenção especial. Dedique tempo para seus projetos e mantenha o foco. Pense bem antes de agir. Confie em sua intuição e aproveite as oportunidades.',
      cancer: 'Esta semana será marcada por emoções para Câncer. As áreas de família e amor merecem atenção especial. Invista em seus relacionamentos e mantenha o equilíbrio. Evite decisões impulsivas. Mantenha-se atento aos sinais e confie em sua intuição.',
      leo: 'Esta semana será marcada por criatividade para Leão. As áreas de trabalho e expressão merecem atenção especial. Priorize seus projetos criativos e aproveite as oportunidades. Cuidado com excessos. Aproveite os momentos de calma para recarregar.',
      virgo: 'Esta semana será marcada por organização para Virgem. As áreas de saúde e trabalho merecem atenção especial. Dedique tempo para organização e mantenha o foco. Pense bem antes de agir. Confie em sua intuição e aproveite as oportunidades.'
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
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

