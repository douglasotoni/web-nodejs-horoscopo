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

// Função para buscar variações do banco com cache
export async function getZodiacVariations(
  type: 'careerAdvice' | 'loveAdvice' | 'crystal' | 'dailyAlert' | 'recommendedActivity' | 'practicalAdvice' | 'luckyColor' | 'emotion' | 'impactPhrase' | 'mantra',
  sign: Sign
): Promise<string[]> {
  const cached = zodiacCache.get<string[]>(type, sign)
  
  if (cached) {
    return cached
  }

  const signRecord = await prisma.zodiacSign.findUnique({
    where: { name: sign },
    include: {
      careerAdvices: type === 'careerAdvice' ? { where: { isActive: true } } : false,
      loveAdvices: type === 'loveAdvice' ? { where: { isActive: true } } : false,
      crystals: type === 'crystal' ? { where: { isActive: true } } : false,
      dailyAlerts: type === 'dailyAlert' ? { where: { isActive: true } } : false,
      recommendedActivities: type === 'recommendedActivity' ? { where: { isActive: true } } : false,
      practicalAdvices: type === 'practicalAdvice' ? { where: { isActive: true } } : false,
      luckyColors: type === 'luckyColor' ? { where: { isActive: true } } : false,
      emotions: type === 'emotion' ? { where: { isActive: true } } : false,
      impactPhrases: type === 'impactPhrase' ? { where: { isActive: true } } : false,
      mantras: type === 'mantra' ? { where: { isActive: true } } : false
    }
  })

  if (!signRecord) {
    return []
  }

  let texts: string[] = []
  
  switch (type) {
    case 'careerAdvice':
      texts = signRecord.careerAdvices.map(a => a.text)
      break
    case 'loveAdvice':
      texts = signRecord.loveAdvices.map(a => a.text)
      break
    case 'crystal':
      texts = signRecord.crystals.map(c => c.text)
      break
    case 'dailyAlert':
      texts = signRecord.dailyAlerts.map(a => a.text)
      break
    case 'recommendedActivity':
      texts = signRecord.recommendedActivities.map(a => a.text)
      break
    case 'practicalAdvice':
      texts = signRecord.practicalAdvices.map(a => a.text)
      break
    case 'luckyColor':
      texts = signRecord.luckyColors.map(c => c.text)
      break
    case 'emotion':
      texts = signRecord.emotions.map(e => e.text)
      break
    case 'impactPhrase':
      texts = signRecord.impactPhrases.map(p => p.text)
      break
    case 'mantra':
      texts = signRecord.mantras.map(m => m.text)
      break
  }

  zodiacCache.set(type, texts, sign)
  return texts
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

