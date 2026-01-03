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
  id?: string
  text: string
  luckyNumber: number
  element?: string
  quality?: string
  rulingPlanet?: string
  luckyColor?: string
  emotion?: string
  practicalAdvice?: string
  compatibleSigns?: string
  numerologyMeaning?: string
  impactPhrase?: string
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
  const [globalStatus, setGlobalStatus] = useState<'draft' | 'published'>('draft')
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
              newPredictions[prediction.sign] = {
                id: prediction.id,
                text: prediction.text || '',
                luckyNumber: prediction.luckyNumber || 1,
                element: prediction.element,
                quality: prediction.quality,
                rulingPlanet: prediction.rulingPlanet,
                luckyColor: prediction.luckyColor,
                emotion: prediction.emotion,
                practicalAdvice: prediction.practicalAdvice,
                compatibleSigns: prediction.compatibleSigns,
                numerologyMeaning: prediction.numerologyMeaning,
                impactPhrase: prediction.impactPhrase,
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
            emotion: data.emotion,
            practicalAdvice: data.practicalAdvice,
            compatibleSigns: data.compatibleSigns,
            numerologyMeaning: data.numerologyMeaning,
            impactPhrase: data.impactPhrase,
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
      const { generateDailyPredictionClient, generateWeeklyPredictionClient } = await import('@/lib/generator-client')
      const newPredictions: Record<string, PredictionData> = {}
      
      console.log('Gerando previsões para', SIGNS.length, 'signos:', SIGNS)
      
      for (const sign of SIGNS) {
        try {
          let result
          if (type === 'daily') {
            result = generateDailyPredictionClient({
              sign: sign as any,
              weekday: weekday as any,
              isoWeek,
              isoYear
            })
          } else {
            result = generateWeeklyPredictionClient({
              sign: sign as any,
              isoWeek,
              isoYear
            })
          }
          
          newPredictions[sign] = {
            ...predictions[sign],
            text: result.text,
            luckyNumber: result.luckyNumber,
            element: result.element,
            quality: result.quality,
            rulingPlanet: result.rulingPlanet,
            luckyColor: result.luckyColor,
            emotion: result.emotion,
            practicalAdvice: result.practicalAdvice,
            compatibleSigns: result.compatibleSigns,
            numerologyMeaning: result.numerologyMeaning,
            impactPhrase: result.impactPhrase,
            status: globalStatus
          }
          
          console.log(`Previsão gerada para ${SIGN_NAMES[sign]}:`, result.text.substring(0, 50) + '...')
        } catch (err) {
          console.error(`Erro ao gerar previsão para ${sign}:`, err)
          // Continua para o próximo signo mesmo se houver erro
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
        
        if (type === 'daily') {
          body.weekday = weekday
        }
        
        if (pred.id) {
          body.id = pred.id
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
              emotion: savedData.emotion,
              practicalAdvice: savedData.practicalAdvice,
              compatibleSigns: savedData.compatibleSigns,
              numerologyMeaning: savedData.numerologyMeaning,
              impactPhrase: savedData.impactPhrase,
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
      
      if (type === 'daily') {
        body.weekday = weekday
      }
      
      if (pred.id) {
        body.id = pred.id
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
          <div className="grid grid-3">
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

            <div className="form-group">
              <label className="form-label">Status (para todos)</label>
              <select
                className="form-select"
                value={globalStatus}
                onChange={(e) => setGlobalStatus(e.target.value as 'draft' | 'published')}
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
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
              
              <div className="form-group">
                <label className="form-label">Texto</label>
                <textarea
                  className="form-textarea"
                  value={predictions[sign]?.text || ''}
                  onChange={(e) => updatePrediction(sign, 'text', e.target.value)}
                  rows={4}
                  placeholder="Digite o texto da previsão..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Número da Sorte</label>
                <input
                  type="number"
                  className="form-input"
                  value={predictions[sign]?.luckyNumber || 1}
                  onChange={(e) => updatePrediction(sign, 'luckyNumber', Number(e.target.value))}
                  min={1}
                  max={60}
                  style={{ maxWidth: '200px' }}
                />
              </div>

              {/* Informações Astrológicas Adicionais */}
              {(predictions[sign]?.element || predictions[sign]?.quality || predictions[sign]?.rulingPlanet || predictions[sign]?.luckyColor || predictions[sign]?.emotion || predictions[sign]?.practicalAdvice || predictions[sign]?.compatibleSigns || predictions[sign]?.numerologyMeaning || predictions[sign]?.impactPhrase) && (
                <div style={{ 
                  marginTop: '1.5rem', 
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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
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
                    
                    {predictions[sign]?.luckyColor && (
                      <div>
                        <strong style={{ color: '#666', fontSize: '0.9rem' }}>Cor da Sorte:</strong>
                        <div style={{ marginTop: '0.25rem', textTransform: 'capitalize' }}>
                          {predictions[sign].luckyColor}
                        </div>
                      </div>
                    )}
                    
                    {predictions[sign]?.emotion && (
                      <div>
                        <strong style={{ color: '#666', fontSize: '0.9rem' }}>Emoção:</strong>
                        <div style={{ marginTop: '0.25rem', textTransform: 'capitalize' }}>
                          {predictions[sign].emotion}
                        </div>
                      </div>
                    )}
                    
                    {predictions[sign]?.practicalAdvice && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <strong style={{ color: '#666', fontSize: '0.9rem' }}>Conselho Prático:</strong>
                        <div style={{ marginTop: '0.25rem' }}>
                          {predictions[sign].practicalAdvice}
                        </div>
                      </div>
                    )}
                    
                    {predictions[sign]?.compatibleSigns && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <strong style={{ color: '#666', fontSize: '0.9rem' }}>Compatibilidade:</strong>
                        <div style={{ marginTop: '0.25rem' }}>
                          {predictions[sign].compatibleSigns}
                        </div>
                      </div>
                    )}
                    
                    {predictions[sign]?.numerologyMeaning && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <strong style={{ color: '#666', fontSize: '0.9rem' }}>Significado Numerológico:</strong>
                        <div style={{ marginTop: '0.25rem' }}>
                          {predictions[sign].numerologyMeaning}
                        </div>
                      </div>
                    )}
                    
                    {predictions[sign]?.impactPhrase && (
                      <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#fff', borderRadius: '4px', borderLeft: '3px solid #0070f3' }}>
                        <strong style={{ color: '#0070f3', fontSize: '0.9rem' }}>Frase de Impacto:</strong>
                        <div style={{ marginTop: '0.25rem', fontStyle: 'italic', color: '#333' }}>
                          "{predictions[sign].impactPhrase}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => saveSinglePrediction(sign)}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={loading || !predictions[sign]?.text?.trim()}
              >
                Salvar {SIGN_NAMES[sign]}
              </button>
            </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
