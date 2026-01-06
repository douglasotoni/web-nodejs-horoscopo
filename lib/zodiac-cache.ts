import { PrismaClient, Sign } from '@prisma/client'
import { prisma } from './prisma'

type CacheEntry<T> = {
  data: T
  timestamp: number
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

class ZodiacCache {
  private cache: Map<string, CacheEntry<any>> = new Map()

  private getCacheKey(type: string, sign?: Sign): string {
    return sign ? `${type}:${sign}` : type
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > CACHE_TTL
  }

  get<T>(type: string, sign?: Sign): T | null {
    const key = this.getCacheKey(type, sign)
    const entry = this.cache.get(key)
    
    if (!entry || this.isExpired(entry)) {
      return null
    }
    
    return entry.data as T
  }

  set<T>(type: string, data: T, sign?: Sign): void {
    const key = this.getCacheKey(type, sign)
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }

  clearByType(type: string): void {
    const keysToDelete: string[] = []
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${type}:`)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key))
  }
}

export const zodiacCache = new ZodiacCache()

// Tipo para variação com ID e texto
export type VariationWithId = {
  id: number
  text: string
}

// Função para buscar variações do banco com cache (retorna strings para compatibilidade)
export async function getZodiacVariations(
  type: 'careerAdvice' | 'loveAdvice' | 'crystal' | 'dailyAlert' | 'recommendedActivity' | 'practicalAdvice' | 'luckyColor' | 'emotion' | 'impactPhrase' | 'mantra',
  sign: Sign
): Promise<string[]> {
  const variations = await getZodiacVariationsWithIds(type, sign)
  return variations.map(v => v.text)
}

// Função para buscar variações com IDs
export async function getZodiacVariationsWithIds(
  type: 'careerAdvice' | 'loveAdvice' | 'crystal' | 'dailyAlert' | 'recommendedActivity' | 'practicalAdvice' | 'luckyColor' | 'emotion' | 'impactPhrase' | 'mantra',
  sign: Sign
): Promise<VariationWithId[]> {
  const cacheKey = `${type}WithIds`
  const cached = zodiacCache.get<VariationWithId[]>(cacheKey, sign)
  
  if (cached) {
    return cached
  }

  // Buscar o signo primeiro
  const zodiacSign = await prisma.zodiacSign.findUnique({
    where: { name: sign }
  })

  if (!zodiacSign) {
    return []
  }

  // Buscar variações diretamente das tabelas usando o signId
  let variations: VariationWithId[] = []
  
  switch (type) {
    case 'careerAdvice':
      const careerAdvices = await prisma.careerAdvice.findMany({
        where: { signId: zodiacSign.id, isActive: true },
        select: { id: true, text: true }
      })
      variations = careerAdvices.map(a => ({ id: a.id, text: a.text }))
      break
    case 'loveAdvice':
      const loveAdvices = await prisma.loveAdvice.findMany({
        where: { signId: zodiacSign.id, isActive: true },
        select: { id: true, text: true }
      })
      variations = loveAdvices.map(a => ({ id: a.id, text: a.text }))
      break
    case 'crystal':
      const crystals = await prisma.crystal.findMany({
        where: { signId: zodiacSign.id, isActive: true },
        select: { id: true, text: true }
      })
      variations = crystals.map(c => ({ id: c.id, text: c.text }))
      break
    case 'dailyAlert':
      const dailyAlerts = await prisma.dailyAlert.findMany({
        where: { signId: zodiacSign.id, isActive: true },
        select: { id: true, text: true }
      })
      variations = dailyAlerts.map(a => ({ id: a.id, text: a.text }))
      break
    case 'recommendedActivity':
      const recommendedActivities = await prisma.recommendedActivity.findMany({
        where: { signId: zodiacSign.id, isActive: true },
        select: { id: true, text: true }
      })
      variations = recommendedActivities.map(a => ({ id: a.id, text: a.text }))
      break
    case 'practicalAdvice':
      const practicalAdvices = await prisma.practicalAdvice.findMany({
        where: { signId: zodiacSign.id, isActive: true },
        select: { id: true, text: true }
      })
      variations = practicalAdvices.map(a => ({ id: a.id, text: a.text }))
      break
    case 'luckyColor':
      const luckyColors = await prisma.luckyColor.findMany({
        where: { signId: zodiacSign.id, isActive: true },
        select: { id: true, text: true }
      })
      variations = luckyColors.map(c => ({ id: c.id, text: c.text }))
      break
    case 'emotion':
      const emotions = await prisma.emotion.findMany({
        where: { signId: zodiacSign.id, isActive: true },
        select: { id: true, text: true }
      })
      variations = emotions.map(e => ({ id: e.id, text: e.text }))
      break
    case 'impactPhrase':
      const impactPhrases = await prisma.impactPhrase.findMany({
        where: { signId: zodiacSign.id, isActive: true },
        select: { id: true, text: true }
      })
      variations = impactPhrases.map(p => ({ id: p.id, text: p.text }))
      break
    case 'mantra':
      const mantras = await prisma.mantra.findMany({
        where: { signId: zodiacSign.id, isActive: true },
        select: { id: true, text: true }
      })
      variations = mantras.map(m => ({ id: m.id, text: m.text }))
      break
  }

  zodiacCache.set(cacheKey, variations, sign)
  return variations
}

// Função para buscar informações imutáveis do signo
export async function getZodiacSignInfo(sign: Sign): Promise<{
  element: string
  quality: string
  rulingPlanet: string
} | null> {
  const cached = zodiacCache.get<{ element: string; quality: string; rulingPlanet: string }>('signInfo', sign)
  
  if (cached) {
    return cached
  }

  const signRecord = await prisma.zodiacSign.findUnique({
    where: { name: sign },
    select: {
      element: true,
      quality: true,
      rulingPlanet: true
    }
  })

  if (!signRecord) {
    return null
  }

  zodiacCache.set('signInfo', signRecord, sign)
  return signRecord
}

