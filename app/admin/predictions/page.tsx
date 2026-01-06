'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { getISOWeek, getISOWeekYear, format, getDay } from 'date-fns'

const SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
] as const

const SIGN_NAMES: Record<string, string> = {
  aries: 'Áries', taurus: 'Touro', gemini: 'Gêmeos', cancer: 'Câncer',
  leo: 'Leão', virgo: 'Virgem', libra: 'Libra', scorpio: 'Escorpião',
  sagittarius: 'Sagitário', capricorn: 'Capricórnio', aquarius: 'Aquário', pisces: 'Peixes'
}

const WEEKDAY_NAMES: Record<string, string> = {
  monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta', thursday: 'Quinta',
  friday: 'Sexta', saturday: 'Sábado', sunday: 'Domingo'
}

type PredictionType = 'daily' | 'weekly'

interface PredictionData {
  id?: number
  text: string
  luckyNumber: number
  element?: string
  quality?: string
  rulingPlanet?: string
  luckyColor?: string
  luckyColorId?: number | null
  emotion?: string
  emotionId?: number | null
  practicalAdvice?: string
  practicalAdviceId?: number | null
  compatibleSigns?: string
  numerologyMeaning?: string
  impactPhrase?: string
  impactPhraseId?: number | null
  recommendedActivities?: string
  recommendedActivityId?: number | null
  dailyAlert?: string
  dailyAlertId?: number | null
  energyLevel?: number
  crystal?: string
  crystalId?: number | null
  mantra?: string
  mantraId?: number | null
  loveAdvice?: string
  loveAdviceId?: number | null
  careerAdvice?: string
  careerAdviceId?: number | null
  status: 'draft' | 'published'
}

export default function AdminPredictionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const now = new Date()
  const currentWeek = getISOWeek(now)
  const currentYear = getISOWeekYear(now)

  // Função para converter dia da semana (0-6) para weekday do Prisma
  const getWeekdayFromDate = (date: Date): string => {
    const day = getDay(date) // 0 = domingo, 1 = segunda, ..., 6 = sábado
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return weekdays[day]
  }

  const [type, setType] = useState<PredictionType>('daily')
  const [selectedDate, setSelectedDate] = useState(format(now, 'yyyy-MM-dd'))
  const [weekday, setWeekday] = useState(getWeekdayFromDate(now))
  const [isoWeek, setIsoWeek] = useState(currentWeek)
  const [isoYear, setIsoYear] = useState(currentYear)
  const [predictions, setPredictions] = useState<Record<string, PredictionData>>({})
  const [globalStatus] = useState<'draft' | 'published'>('published') // Sempre publicado
  const [predictionStyle, setPredictionStyle] = useState<'bem-humorado' | 'natural' | 'vibe-country' | 'vibe-pop'>('natural')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session && session.user.role !== 'admin' && session.user.role !== 'editor') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  // Atualizar weekday e isoWeek/isoYear quando a data mudar
  useEffect(() => {
    const date = new Date(selectedDate)
    const newWeekday = getWeekdayFromDate(date)
    const newIsoWeek = getISOWeek(date)
    const newIsoYear = getISOWeekYear(date)
    
    setWeekday(newWeekday)
    setIsoWeek(newIsoWeek)
    setIsoYear(newIsoYear)
    
    // Carregar previsões existentes
    loadExistingPredictions(newWeekday, newIsoWeek, newIsoYear)
  }, [selectedDate, type])

  const loadExistingPredictions = async (weekdayValue: string, week: number, year: number) => {
    setLoading(true)
    try {
      const newPredictions: Record<string, PredictionData> = {}
      
      // Usar a API admin que retorna todas as previsões (incluindo rascunhos)
      const url = type === 'daily'
        ? `/api/admin/predictions/daily?weekday=${weekdayValue}&isoWeek=${week}&isoYear=${year}`
        : `/api/admin/predictions/weekly?isoWeek=${week}&isoYear=${year}`
      
      console.log('Carregando previsões:', url)
      
      const res = await fetch(url, {
        credentials: 'include', // Importante: envia cookies de autenticação
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Resposta da API:', res.status, res.statusText)
      
      if (res.ok) {
        const data = await res.json()
        console.log('Dados recebidos:', data)
        
        // A API retorna um array de previsões
        if (Array.isArray(data)) {
          console.log('Array com', data.length, 'previsões')
          data.forEach((prediction: any) => {
            if (prediction && prediction.id && prediction.sign) {
              console.log(`[DEBUG] ${prediction.sign} - IDs:`, {
                recommendedActivityId: prediction.recommendedActivityId,
                dailyAlertId: prediction.dailyAlertId,
                crystalId: prediction.crystalId,
                mantraId: prediction.mantraId,
                loveAdviceId: prediction.loveAdviceId,
                careerAdviceId: prediction.careerAdviceId
              })
              newPredictions[prediction.sign] = {
                id: prediction.id,
                text: prediction.text || '',
                luckyNumber: prediction.luckyNumber || 1,
                element: prediction.element,
                quality: prediction.quality,
                rulingPlanet: prediction.rulingPlanet,
                luckyColor: prediction.luckyColor,
                luckyColorId: prediction.luckyColorId,
                emotion: prediction.emotion,
                emotionId: prediction.emotionId,
                practicalAdvice: prediction.practicalAdvice,
                practicalAdviceId: prediction.practicalAdviceId,
                compatibleSigns: prediction.compatibleSigns,
                numerologyMeaning: prediction.numerologyMeaning,
                impactPhrase: prediction.impactPhrase,
                impactPhraseId: prediction.impactPhraseId,
                recommendedActivities: prediction.recommendedActivities,
                recommendedActivityId: prediction.recommendedActivityId,
                dailyAlert: prediction.dailyAlert,
                dailyAlertId: prediction.dailyAlertId,
                energyLevel: prediction.energyLevel,
                crystal: prediction.crystal,
                crystalId: prediction.crystalId,
                mantra: prediction.mantra,
                mantraId: prediction.mantraId,
                loveAdvice: prediction.loveAdvice,
                loveAdviceId: prediction.loveAdviceId,
                careerAdvice: prediction.careerAdvice,
                careerAdviceId: prediction.careerAdviceId,
                status: prediction.status || 'draft'
              }
            }
          })
        } else if (data && data.id && data.sign) {
          // Se retornar apenas uma previsão
          console.log('Previsão única recebida para', data.sign)
          newPredictions[data.sign] = {
            id: data.id,
            text: data.text || '',
            luckyNumber: data.luckyNumber || 1,
            element: data.element,
            quality: data.quality,
            rulingPlanet: data.rulingPlanet,
            luckyColor: data.luckyColor,
            luckyColorId: data.luckyColorId,
            emotion: data.emotion,
            emotionId: data.emotionId,
            practicalAdvice: data.practicalAdvice,
            practicalAdviceId: data.practicalAdviceId,
            compatibleSigns: data.compatibleSigns,
            numerologyMeaning: data.numerologyMeaning,
            impactPhrase: data.impactPhrase,
            impactPhraseId: data.impactPhraseId,
            recommendedActivities: data.recommendedActivities,
            recommendedActivityId: data.recommendedActivityId,
            dailyAlert: data.dailyAlert,
            dailyAlertId: data.dailyAlertId,
            energyLevel: data.energyLevel,
            crystal: data.crystal,
            crystalId: data.crystalId,
            mantra: data.mantra,
            mantraId: data.mantraId,
            loveAdvice: data.loveAdvice,
            loveAdviceId: data.loveAdviceId,
            careerAdvice: data.careerAdvice,
            careerAdviceId: data.careerAdviceId,
            status: data.status || 'draft'
          }
        } else {
          console.log('Nenhuma previsão encontrada ou formato inválido')
        }
      } else {
        let errorData: any = {}
        try {
          errorData = await res.json()
        } catch {
          const errorText = await res.text()
          errorData = { error: errorText }
        }
        
        console.error('Erro ao carregar previsões:', res.status, res.statusText, errorData)
        
        if (res.status === 403) {
          setError('Não autorizado. Faça login novamente.')
        } else if (res.status === 404) {
          console.log('Nenhuma previsão encontrada para esta data')
        } else if (res.status === 400) {
          setError(`Parâmetros inválidos: ${errorData.details ? JSON.stringify(errorData.details) : errorData.error || 'Erro desconhecido'}`)
        } else {
          setError(`Erro ao carregar previsões: ${errorData.error || res.statusText}`)
        }
      }
      
      setPredictions(newPredictions)
      console.log('Previsões carregadas:', Object.keys(newPredictions).length, 'signos')
    } catch (err) {
      console.error('Erro ao carregar previsões:', err)
      setError('Erro ao carregar previsões. Verifique o console para mais detalhes.')
    } finally {
      setLoading(false)
    }
  }

  const generateAllPredictions = async () => {
    setGenerating(true)
    setError('')
    setSuccess('')
    
    try {
      const newPredictions: Record<string, PredictionData> = {}
      
      console.log('Gerando previsões para', SIGNS.length, 'signos:', SIGNS)
      
      // Gerar via API para obter IDs
      for (const sign of SIGNS) {
        try {
          const url = type === 'daily'
            ? '/api/admin/predictions/daily'
            : '/api/admin/predictions/weekly'
          
          const body: any = {
            sign,
            isoWeek,
            isoYear,
            generate: true,
            status: globalStatus
          }
      
      if (type === 'daily') {
            body.weekday = weekday
          }
          
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            credentials: 'include'
          })
          
          if (res.ok) {
            const result = await res.json()
            newPredictions[sign] = {
              ...predictions[sign],
              id: result.id,
              text: result.text,
              luckyNumber: result.luckyNumber,
              element: result.element,
              quality: result.quality,
              rulingPlanet: result.rulingPlanet,
              luckyColor: result.luckyColor,
              luckyColorId: result.luckyColorId,
              emotion: result.emotion,
              emotionId: result.emotionId,
              practicalAdvice: result.practicalAdvice,
              practicalAdviceId: result.practicalAdviceId,
              compatibleSigns: result.compatibleSigns,
              numerologyMeaning: result.numerologyMeaning,
              impactPhrase: result.impactPhrase,
              impactPhraseId: result.impactPhraseId,
              recommendedActivities: result.recommendedActivities,
              recommendedActivityId: result.recommendedActivityId,
              dailyAlert: result.dailyAlert,
              dailyAlertId: result.dailyAlertId,
              energyLevel: result.energyLevel,
              crystal: result.crystal,
              crystalId: result.crystalId,
              mantra: result.mantra,
              mantraId: result.mantraId,
              loveAdvice: result.loveAdvice,
              loveAdviceId: result.loveAdviceId,
              careerAdvice: result.careerAdvice,
              careerAdviceId: result.careerAdviceId,
              status: result.status || globalStatus
            }
            console.log(`Previsão gerada para ${SIGN_NAMES[sign]}:`, result.text.substring(0, 50) + '...')
      } else {
            console.error(`Erro ao gerar previsão para ${sign}:`, res.status, res.statusText)
            newPredictions[sign] = {
              ...predictions[sign],
              text: predictions[sign]?.text || '',
              luckyNumber: predictions[sign]?.luckyNumber || 1,
              status: globalStatus
            }
          }
        } catch (err) {
          console.error(`Erro ao gerar previsão para ${sign}:`, err)
          newPredictions[sign] = {
            ...predictions[sign],
            text: predictions[sign]?.text || '',
            luckyNumber: predictions[sign]?.luckyNumber || 1,
            status: globalStatus
          }
        }
      }
      
      console.log('Total de previsões geradas:', Object.keys(newPredictions).length)
      setPredictions(newPredictions)
      setSuccess(`Previsões geradas automaticamente para ${Object.keys(newPredictions).length} signos!`)
    } catch (err) {
      console.error('Erro geral ao gerar previsões:', err)
      setError(`Erro ao gerar previsões: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    } finally {
      setGenerating(false)
    }
  }

  const updatePrediction = (sign: string, field: 'text' | 'luckyNumber', value: any) => {
    setPredictions(prev => ({
      ...prev,
      [sign]: {
        ...prev[sign],
        [field]: value,
        text: prev[sign]?.text || '',
        luckyNumber: prev[sign]?.luckyNumber || 1,
        status: globalStatus
      }
    }))
  }

  const saveAllPredictions = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const url = type === 'daily' 
        ? '/api/admin/predictions/daily'
        : '/api/admin/predictions/weekly'
      
      const promises = SIGNS.map(async sign => {
        const pred = predictions[sign]
        if (!pred || !pred.text.trim()) {
          return null
        }
        
        const body: any = {
          sign: sign,
          isoWeek,
          isoYear,
          text: pred.text,
          luckyNumber: pred.luckyNumber,
          status: globalStatus
        }
        
        // Incluir novos campos apenas se existirem
        if (pred.element) body.element = pred.element
        if (pred.quality) body.quality = pred.quality
        if (pred.rulingPlanet) body.rulingPlanet = pred.rulingPlanet
        if (pred.luckyColor) body.luckyColor = pred.luckyColor
        if (pred.emotion) body.emotion = pred.emotion
        if (pred.practicalAdvice) body.practicalAdvice = pred.practicalAdvice
        if (pred.compatibleSigns) body.compatibleSigns = pred.compatibleSigns
        if (pred.numerologyMeaning) body.numerologyMeaning = pred.numerologyMeaning
        if (pred.impactPhrase) body.impactPhrase = pred.impactPhrase
        if (pred.recommendedActivities) body.recommendedActivities = pred.recommendedActivities
        if (pred.recommendedActivityId !== undefined) body.recommendedActivityId = pred.recommendedActivityId
        if (pred.dailyAlert) body.dailyAlert = pred.dailyAlert
        if (pred.dailyAlertId !== undefined) body.dailyAlertId = pred.dailyAlertId
        if (pred.energyLevel !== undefined) body.energyLevel = pred.energyLevel
        if (pred.crystal) body.crystal = pred.crystal
        if (pred.crystalId !== undefined) body.crystalId = pred.crystalId
        if (pred.mantra) body.mantra = pred.mantra
        if (pred.mantraId !== undefined) body.mantraId = pred.mantraId
        if (pred.loveAdvice) body.loveAdvice = pred.loveAdvice
        if (pred.loveAdviceId !== undefined) body.loveAdviceId = pred.loveAdviceId
        if (pred.careerAdvice) body.careerAdvice = pred.careerAdvice
        if (pred.careerAdviceId !== undefined) body.careerAdviceId = pred.careerAdviceId
        if (pred.luckyColorId !== undefined) body.luckyColorId = pred.luckyColorId
        if (pred.emotionId !== undefined) body.emotionId = pred.emotionId
        if (pred.practicalAdviceId !== undefined) body.practicalAdviceId = pred.practicalAdviceId
        if (pred.impactPhraseId !== undefined) body.impactPhraseId = pred.impactPhraseId
        
        if (type === 'daily') {
          body.weekday = weekday
        }
        
        if (pred.id) {
          body.id = pred.id
          console.log(`[saveAllPredictions] Salvando ${SIGN_NAMES[sign]} com id:`, pred.id, 'tipo:', typeof pred.id)
        } else {
          console.log(`[saveAllPredictions] Salvando ${SIGN_NAMES[sign]} sem id (POST)`)
        }
        
        console.log(`Salvando ${SIGN_NAMES[sign]} com campos:`, Object.keys(body))
        
        const res = await fetch(url, {
          method: pred.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include'
        })
        
        if (res.ok) {
          const savedData = await res.json()
          return { sign, data: savedData }
        } else {
          console.error(`Erro ao salvar ${SIGN_NAMES[sign]}:`, res.status, res.statusText)
          return { sign, error: true }
        }
      })
      
      const results = await Promise.all(promises)
      const errors = results.filter(r => r && 'error' in r)
      const successes = results.filter(r => r && 'data' in r)
      
      if (errors.length > 0) {
        setError(`Erro ao salvar ${errors.length} previsão(ões)`)
      }
      
      if (successes.length > 0) {
        // Atualizar o estado com os dados salvos de cada previsão
        const updatedPredictions: Record<string, PredictionData> = { ...predictions }
        successes.forEach((result: any) => {
          if (result && result.data && result.data.sign) {
            const savedData = result.data
            updatedPredictions[savedData.sign] = {
              ...updatedPredictions[savedData.sign],
              id: savedData.id,
              text: savedData.text,
              luckyNumber: savedData.luckyNumber,
              element: savedData.element,
              quality: savedData.quality,
              rulingPlanet: savedData.rulingPlanet,
              luckyColor: savedData.luckyColor,
              luckyColorId: savedData.luckyColorId,
              emotion: savedData.emotion,
              emotionId: savedData.emotionId,
              practicalAdvice: savedData.practicalAdvice,
              practicalAdviceId: savedData.practicalAdviceId,
              compatibleSigns: savedData.compatibleSigns,
              numerologyMeaning: savedData.numerologyMeaning,
              impactPhrase: savedData.impactPhrase,
              impactPhraseId: savedData.impactPhraseId,
              recommendedActivities: savedData.recommendedActivities,
              recommendedActivityId: savedData.recommendedActivityId,
              dailyAlert: savedData.dailyAlert,
              dailyAlertId: savedData.dailyAlertId,
              energyLevel: savedData.energyLevel,
              crystal: savedData.crystal,
              crystalId: savedData.crystalId,
              mantra: savedData.mantra,
              mantraId: savedData.mantraId,
              loveAdvice: savedData.loveAdvice,
              loveAdviceId: savedData.loveAdviceId,
              careerAdvice: savedData.careerAdvice,
              careerAdviceId: savedData.careerAdviceId,
              status: savedData.status || globalStatus
            }
          }
        })
        setPredictions(updatedPredictions)
        setSuccess(`${successes.length} previsão(ões) salva(s) com sucesso!`)
      }
    } catch (err) {
      setError('Erro ao salvar previsões')
    } finally {
      setLoading(false)
    }
  }

  const saveSinglePrediction = async (sign: string) => {
    const pred = predictions[sign]
    if (!pred || !pred.text.trim()) {
      setError('Texto é obrigatório')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const url = type === 'daily' 
        ? '/api/admin/predictions/daily'
        : '/api/admin/predictions/weekly'
      
      const body: any = {
        sign,
        isoWeek,
        isoYear,
        text: pred.text,
        luckyNumber: pred.luckyNumber,
        status: globalStatus
      }
      
      // Incluir novos campos apenas se existirem
      if (pred.element) body.element = pred.element
      if (pred.quality) body.quality = pred.quality
      if (pred.rulingPlanet) body.rulingPlanet = pred.rulingPlanet
      if (pred.luckyColor) body.luckyColor = pred.luckyColor
      if (pred.emotion) body.emotion = pred.emotion
      if (pred.practicalAdvice) body.practicalAdvice = pred.practicalAdvice
      if (pred.compatibleSigns) body.compatibleSigns = pred.compatibleSigns
      if (pred.numerologyMeaning) body.numerologyMeaning = pred.numerologyMeaning
      if (pred.impactPhrase) body.impactPhrase = pred.impactPhrase
      if (pred.impactPhraseId !== undefined) body.impactPhraseId = pred.impactPhraseId
      if (pred.recommendedActivities) body.recommendedActivities = pred.recommendedActivities
      if (pred.recommendedActivityId !== undefined) body.recommendedActivityId = pred.recommendedActivityId
      if (pred.dailyAlert) body.dailyAlert = pred.dailyAlert
      if (pred.dailyAlertId !== undefined) body.dailyAlertId = pred.dailyAlertId
      if (pred.energyLevel !== undefined) body.energyLevel = pred.energyLevel
      if (pred.crystal) body.crystal = pred.crystal
      if (pred.crystalId !== undefined) body.crystalId = pred.crystalId
      if (pred.mantra) body.mantra = pred.mantra
      if (pred.mantraId !== undefined) body.mantraId = pred.mantraId
      if (pred.loveAdvice) body.loveAdvice = pred.loveAdvice
      if (pred.loveAdviceId !== undefined) body.loveAdviceId = pred.loveAdviceId
      if (pred.careerAdvice) body.careerAdvice = pred.careerAdvice
      if (pred.careerAdviceId !== undefined) body.careerAdviceId = pred.careerAdviceId
      if (pred.luckyColorId !== undefined) body.luckyColorId = pred.luckyColorId
      if (pred.emotionId !== undefined) body.emotionId = pred.emotionId
      if (pred.practicalAdviceId !== undefined) body.practicalAdviceId = pred.practicalAdviceId

      if (type === 'daily') {
        body.weekday = weekday
      }

      if (pred.id) {
        body.id = pred.id
        console.log(`[saveSinglePrediction] Salvando ${SIGN_NAMES[sign]} com id:`, pred.id)
      } else {
        console.log(`[saveSinglePrediction] Salvando ${SIGN_NAMES[sign]} sem id (POST)`)
      }
      
      console.log(`Salvando ${SIGN_NAMES[sign]} com campos:`, Object.keys(body))

      const res = await fetch(url, {
        method: pred.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      })

      if (res.ok) {
        const savedData = await res.json()
        // Atualizar o estado local com os dados salvos (incluindo todos os campos)
        setPredictions(prev => ({
          ...prev,
          [sign]: {
            ...prev[sign],
            id: savedData.id,
            text: savedData.text,
            luckyNumber: savedData.luckyNumber,
            element: savedData.element,
            quality: savedData.quality,
            rulingPlanet: savedData.rulingPlanet,
            luckyColor: savedData.luckyColor,
            emotion: savedData.emotion,
            practicalAdvice: savedData.practicalAdvice,
            compatibleSigns: savedData.compatibleSigns,
            numerologyMeaning: savedData.numerologyMeaning,
            impactPhrase: savedData.impactPhrase,
            impactPhraseId: savedData.impactPhraseId,
            recommendedActivities: savedData.recommendedActivities,
            recommendedActivityId: savedData.recommendedActivityId,
            dailyAlert: savedData.dailyAlert,
            dailyAlertId: savedData.dailyAlertId,
            energyLevel: savedData.energyLevel,
            crystal: savedData.crystal,
            crystalId: savedData.crystalId,
            mantra: savedData.mantra,
            mantraId: savedData.mantraId,
            loveAdvice: savedData.loveAdvice,
            loveAdviceId: savedData.loveAdviceId,
            careerAdvice: savedData.careerAdvice,
            careerAdviceId: savedData.careerAdviceId,
            status: savedData.status || globalStatus
          }
        }))
        setSuccess(`Previsão de ${SIGN_NAMES[sign]} salva!`)
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao salvar')
      }
    } catch (err) {
      setError('Erro ao salvar previsão')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="loading">Carregando...</div>
  }

  if (!session || (session.user.role !== 'admin' && session.user.role !== 'editor')) {
    return null
  }

  // Debug: verificar quantos signos temos
  console.log('Total de signos:', SIGNS.length, SIGNS)

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Gerenciar Previsões</h1>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="grid grid-4">
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value as PredictionType)}
            >
              <option value="daily">Diária</option>
              <option value="weekly">Semanal</option>
            </select>
          </div>

            <div className="form-group">
              <label className="form-label">Data</label>
              <input
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <small className="form-text">
                {type === 'daily' 
                  ? `Dia da semana: ${WEEKDAY_NAMES[weekday]} | Semana ISO: ${isoWeek}/${isoYear}`
                  : `Semana ISO: ${isoWeek}/${isoYear}`
                }
              </small>
            </div>

            <div className="form-group" style={{ display: 'none' }}>
              {/* Status oculto - sempre será 'published' */}
              <label className="form-label">Status (para todos)</label>
                <select
                  className="form-select"
                value={globalStatus}
                onChange={(e) => {}}
                >
                <option value="published">Publicado</option>
                </select>
              </div>

            <div className="form-group">
              <label className="form-label">Estilo da Previsão</label>
              <select
                className="form-select"
                value={predictionStyle}
                onChange={(e) => setPredictionStyle(e.target.value as 'bem-humorado' | 'natural' | 'vibe-country' | 'vibe-pop')}
              >
                <option value="bem-humorado">Bem humorado</option>
                <option value="natural">Natural</option>
                <option value="vibe-country">Vibe Country</option>
                <option value="vibe-pop">Vibe pop</option>
              </select>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              onClick={generateAllPredictions}
              className="btn btn-secondary"
              disabled={generating || loading}
            >
              {generating ? 'Gerando...' : 'Gerar Todos os Signos'}
            </button>
            <button
              onClick={saveAllPredictions}
              className="btn btn-primary"
              disabled={loading || generating}
            >
              {loading ? 'Salvando...' : 'Salvar Todos'}
            </button>
          </div>
        </div>

        {loading && !generating && (
          <div className="card">
            <div className="loading">Carregando previsões existentes...</div>
          </div>
        )}

        <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>
          Previsões para todos os signos ({SIGNS.length} signos)
          {Object.keys(predictions).length > 0 && (
            <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '1rem' }}>
              ({Object.keys(predictions).length} com dados)
            </span>
          )}
        </h2>

        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {SIGNS.map((sign, index) => {
            const hasData = predictions[sign]?.text && predictions[sign].text.trim().length > 0
            return (
            <div key={sign} className="card" style={{ 
              border: '1px solid #ddd',
              backgroundColor: hasData ? '#fff' : '#f9f9f9'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>
                {index + 1}. {SIGN_NAMES[sign]}
                {!hasData && <span style={{ fontSize: '0.8rem', color: '#999', marginLeft: '0.5rem' }}>(vazio)</span>}
              </h3>

              {/* Informações Astrológicas Imutáveis do Signo */}
              {(predictions[sign]?.element || predictions[sign]?.quality || predictions[sign]?.rulingPlanet) && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>
                    Informações Astrológicas
                  </h4>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem' 
                  }}>
                    {predictions[sign]?.element && (
                      <div>
                        <strong style={{ color: '#666', fontSize: '0.9rem' }}>Elemento:</strong>
                        <div style={{ marginTop: '0.25rem', textTransform: 'capitalize' }}>
                          {predictions[sign].element}
                        </div>
                      </div>
                    )}
                    
                    {predictions[sign]?.quality && (
                      <div>
                        <strong style={{ color: '#666', fontSize: '0.9rem' }}>Qualidade:</strong>
                        <div style={{ marginTop: '0.25rem', textTransform: 'capitalize' }}>
                          {predictions[sign].quality}
                        </div>
                      </div>
                    )}
                    
                    {predictions[sign]?.rulingPlanet && (
                      <div>
                        <strong style={{ color: '#666', fontSize: '0.9rem' }}>Planeta Regente:</strong>
                        <div style={{ marginTop: '0.25rem' }}>
                          {predictions[sign].rulingPlanet}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informações que mudam por período */}
              {(predictions[sign]?.text || predictions[sign]?.luckyNumber || predictions[sign]?.luckyColor || predictions[sign]?.emotion || predictions[sign]?.practicalAdvice || predictions[sign]?.compatibleSigns || predictions[sign]?.impactPhrase) && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  backgroundColor: '#f0f8ff', 
                  borderRadius: '8px',
                  border: '1px solid #b3d9ff'
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem', color: '#0066cc' }}>
                    Informações do Período
                  </h4>
                  
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {predictions[sign]?.text && (
                      <div>
                        <strong style={{ color: '#666', fontSize: '0.9rem' }}>Texto da Previsão:</strong>
                        <div style={{ 
                          marginTop: '0.5rem', 
                          padding: '0.75rem', 
                          backgroundColor: '#fff', 
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {predictions[sign].text}
                        </div>
                      </div>
                    )}

                    {predictions[sign]?.luckyNumber && (
                      <div>
                        <strong style={{ color: '#666', fontSize: '0.9rem' }}>Número da Sorte:</strong>
                        <div style={{ 
                          marginTop: '0.25rem',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          color: '#0070f3'
                        }}>
                          {predictions[sign].luckyNumber}
                        </div>
                      </div>
                    )}
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '1rem',
                      marginTop: '0.5rem'
                    }}>
                      {predictions[sign]?.luckyColor && (
                        <div>
                          <strong style={{ color: '#666', fontSize: '0.9rem' }}>
                            Cor da Sorte:
                            {typeof predictions[sign].luckyColorId === 'number' && (
                              <span style={{ fontSize: '0.8rem', color: '#999', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                                (ID: {predictions[sign].luckyColorId})
                              </span>
                            )}
                          </strong>
                          <div style={{ marginTop: '0.25rem', textTransform: 'capitalize' }}>
                            {predictions[sign].luckyColor}
                          </div>
                        </div>
                      )}
                      
                      {predictions[sign]?.emotion && (
                        <div>
                          <strong style={{ color: '#666', fontSize: '0.9rem' }}>
                            Emoção:
                            {typeof predictions[sign].emotionId === 'number' && (
                              <span style={{ fontSize: '0.8rem', color: '#999', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                                (ID: {predictions[sign].emotionId})
                              </span>
                            )}
                          </strong>
                          <div style={{ marginTop: '0.25rem', textTransform: 'capitalize' }}>
                            {predictions[sign].emotion}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {predictions[sign]?.practicalAdvice && (
                      <div>
                        <strong style={{ color: '#666', fontSize: '0.9rem' }}>
                          Conselho Prático:
                          {typeof predictions[sign].practicalAdviceId === 'number' && (
                            <span style={{ fontSize: '0.8rem', color: '#999', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                              (ID: {predictions[sign].practicalAdviceId})
                            </span>
                          )}
                        </strong>
                        <div style={{ marginTop: '0.25rem' }}>
                          {predictions[sign].practicalAdvice}
                        </div>
                      </div>
                    )}
                    
                    {predictions[sign]?.compatibleSigns && (
                      <div>
                        <strong style={{ color: '#666', fontSize: '0.9rem' }}>Signos Compatíveis:</strong>
                        <div style={{ 
                          marginTop: '0.5rem', 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '0.5rem' 
                        }}>
                          {predictions[sign].compatibleSigns
                            .replace('Signos compatíveis: ', '')
                            .split(', ')
                            .map((signName, idx) => (
                              <span
                                key={idx}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  backgroundColor: '#0070f3',
                                  color: '#fff',
                                  borderRadius: '20px',
                                  fontSize: '0.85rem',
                                  fontWeight: '500',
                                  display: 'inline-block'
                                }}
                              >
                                {signName.trim()}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {predictions[sign]?.impactPhrase && (() => {
                      // Limpar e formatar a frase de impacto - pegar apenas a primeira frase
                      let cleanPhrase = predictions[sign].impactPhrase
                        .trim()
                        .replace(/\n+/g, ' ') // Substituir quebras de linha por espaços
                        .replace(/\s+/g, ' ') // Remover espaços múltiplos
                        .replace(/^["']|["']$/g, '') // Remover aspas no início/fim se existirem
                        .trim()
                      
                      // Pegar apenas a primeira frase (até o primeiro ponto, exclamação ou interrogação)
                      const firstSentenceMatch = cleanPhrase.match(/^[^.!?]+[.!?]/)
                      if (firstSentenceMatch) {
                        cleanPhrase = firstSentenceMatch[0].trim()
                      } else {
                        // Se não encontrar pontuação, pegar até 100 caracteres ou até o primeiro espaço após 80 caracteres
                        if (cleanPhrase.length > 100) {
                          const spaceIndex = cleanPhrase.substring(80, 100).indexOf(' ')
                          if (spaceIndex !== -1) {
                            cleanPhrase = cleanPhrase.substring(0, 80 + spaceIndex).trim() + '.'
                          } else {
                            cleanPhrase = cleanPhrase.substring(0, 100).trim() + '...'
                          }
                        }
                      }
                      
                      return (
                        <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#fff', borderRadius: '4px', borderLeft: '3px solid #0070f3' }}>
                          <strong style={{ color: '#0070f3', fontSize: '0.9rem' }}>
                            Frase de Impacto:
                            {typeof predictions[sign].impactPhraseId === 'number' && (
                              <span style={{ fontSize: '0.8rem', color: '#999', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                                (ID: {predictions[sign].impactPhraseId})
                              </span>
                            )}
                          </strong>
                          <div style={{ 
                            marginTop: '0.25rem', 
                            fontStyle: 'italic', 
                            color: '#333',
                            lineHeight: '1.5',
                            whiteSpace: 'normal',
                            wordWrap: 'break-word'
                          }}>
                            "{cleanPhrase}"
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}

              {/* Card específico para os novos campos */}
              {(predictions[sign]?.recommendedActivities || predictions[sign]?.dailyAlert || predictions[sign]?.energyLevel || predictions[sign]?.crystal || predictions[sign]?.mantra || predictions[sign]?.loveAdvice || predictions[sign]?.careerAdvice) && (
                <div style={{ 
                  marginTop: '1.5rem', 
                  padding: '1.5rem', 
                  backgroundColor: '#fff3cd', 
                  borderRadius: '8px',
                  border: '1px solid #ffc107'
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.2rem', color: '#856404', fontWeight: 'bold' }}>
                    Informações Adicionais do Dia
                  </h4>
                  
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                  }}>
                    {predictions[sign]?.recommendedActivities && (
                      <div>
                        <strong style={{ color: '#856404', fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                          ✨ Atividades Recomendadas:
                          {typeof predictions[sign].recommendedActivityId === 'number' && (
                            <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                              (ID: {predictions[sign].recommendedActivityId})
                            </span>
                          )}
                        </strong>
                        <div style={{ 
                          padding: '0.75rem', 
                          backgroundColor: '#fff', 
                          borderRadius: '4px',
                          border: '1px solid #ffc107',
                          color: '#333'
                        }}>
                          {predictions[sign].recommendedActivities}
                        </div>
                      </div>
                    )}

                    {predictions[sign]?.dailyAlert && (
                      <div>
                        <strong style={{ color: '#856404', fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                          ⚠️ Alerta do Dia:
                          {typeof predictions[sign].dailyAlertId === 'number' && (
                            <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                              (ID: {predictions[sign].dailyAlertId})
                            </span>
                          )}
                        </strong>
                        <div style={{ 
                          padding: '0.75rem', 
                          backgroundColor: '#fff3cd', 
                          borderRadius: '4px',
                          border: '1px solid #ff9800',
                          borderLeft: '4px solid #ff9800',
                          color: '#856404',
                          fontWeight: '500'
                        }}>
                          {predictions[sign].dailyAlert}
                        </div>
                      </div>
                    )}

                    {predictions[sign]?.energyLevel !== undefined && (
                      <div>
                        <strong style={{ color: '#856404', fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                          ⚡ Energia do Dia:
                        </strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold', 
                            color: predictions[sign].energyLevel! >= 7 ? '#28a745' : predictions[sign].energyLevel! >= 4 ? '#ffc107' : '#dc3545'
                          }}>
                            {predictions[sign].energyLevel}/10
                          </div>
                          <div style={{ 
                            flex: 1, 
                            height: '20px', 
                            backgroundColor: '#e0e0e0', 
                            borderRadius: '10px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${(predictions[sign].energyLevel! / 10) * 100}%`, 
                              height: '100%', 
                              backgroundColor: predictions[sign].energyLevel! >= 7 ? '#28a745' : predictions[sign].energyLevel! >= 4 ? '#ffc107' : '#dc3545',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {predictions[sign]?.crystal && (
                      <div>
                        <strong style={{ color: '#856404', fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                          💎 Pedra/Cristal do Dia:
                          {typeof predictions[sign].crystalId === 'number' && (
                            <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                              (ID: {predictions[sign].crystalId})
                            </span>
                          )}
                        </strong>
                        <div style={{ 
                          padding: '0.75rem', 
                          backgroundColor: '#fff', 
                          borderRadius: '4px',
                          border: '1px solid #ffc107',
                          color: '#333',
                          textTransform: 'capitalize'
                        }}>
                          {predictions[sign].crystal}
                        </div>
                      </div>
                    )}

                    {predictions[sign]?.mantra && (() => {
                      // Limpar e formatar o mantra
                      const cleanMantra = predictions[sign].mantra
                        .trim()
                        .replace(/\n+/g, ' ') // Substituir quebras de linha por espaços
                        .replace(/\s+/g, ' ') // Remover espaços múltiplos
                        .replace(/^["']|["']$/g, '') // Remover aspas no início/fim se existirem
                        .trim()
                      
                      return (
                        <div>
                          <strong style={{ color: '#856404', fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                            🧘 Mantra ou Afirmação:
                            {typeof predictions[sign].mantraId === 'number' && (
                              <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                                (ID: {predictions[sign].mantraId})
                              </span>
                            )}
                          </strong>
                          <div style={{ 
                            padding: '1rem', 
                            backgroundColor: '#fff', 
                            borderRadius: '4px',
                            border: '1px solid #ffc107',
                            borderLeft: '4px solid #9c27b0',
                            color: '#333',
                            fontStyle: 'italic',
                            textAlign: 'center',
                            fontSize: '1.05rem',
                            lineHeight: '1.5',
                            whiteSpace: 'normal',
                            wordWrap: 'break-word'
                          }}>
                            "{cleanMantra}"
                          </div>
                        </div>
                      )
                    })()}

                    {predictions[sign]?.loveAdvice && (
                      <div>
                        <strong style={{ color: '#856404', fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                          💕 Conselho Amoroso:
                          {typeof predictions[sign].loveAdviceId === 'number' && (
                            <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                              (ID: {predictions[sign].loveAdviceId})
                            </span>
                          )}
                        </strong>
                        <div style={{ 
                          padding: '0.75rem', 
                          backgroundColor: '#fff', 
                          borderRadius: '4px',
                          border: '1px solid #ffc107',
                          borderLeft: '4px solid #e91e63',
                          color: '#333'
                        }}>
                          {predictions[sign].loveAdvice}
                        </div>
                      </div>
                    )}

                    {predictions[sign]?.careerAdvice && (
                      <div>
                        <strong style={{ color: '#856404', fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                          💼 Conselho Profissional:
                          {typeof predictions[sign].careerAdviceId === 'number' && (
                            <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                              (ID: {predictions[sign].careerAdviceId})
                            </span>
                          )}
                        </strong>
                        <div style={{ 
                          padding: '0.75rem', 
                          backgroundColor: '#fff', 
                          borderRadius: '4px',
                          border: '1px solid #ffc107',
                          borderLeft: '4px solid #2196f3',
                          color: '#333'
                        }}>
                          {predictions[sign].careerAdvice}
                        </div>
                      </div>
            )}
          </div>
                </div>
            )}
          </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
