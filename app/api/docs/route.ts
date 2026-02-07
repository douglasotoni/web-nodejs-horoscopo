import { NextRequest, NextResponse } from 'next/server'

const signEnum = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'] as const

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get('host') || 'localhost:3000'
  const protocol = req.headers.get('x-forwarded-proto') || 'http'
  return `${protocol}://${host}`
}

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl(req)

  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'API Horóscopo',
      description: 'API que retorna previsão do dia e da semana para um ou todos os signos.',
      version: '1.0.0'
    },
    servers: [{ url: baseUrl, description: 'Servidor atual' }],
    paths: {
      '/api/horoscope/daily': {
        get: {
          summary: 'Previsão do dia',
          description: 'Retorna a previsão do dia. **sign**: se omitido, retorna todos os signos; se informado, retorna só aquele signo. **date**: formato YYYY-MM-DD; se omitido, usa o dia atual. Se não existir previsão para a data, ela é gerada e salva antes de ser retornada.',
          operationId: 'getDailyPrediction',
          tags: ['Horóscopo'],
          parameters: [
            {
              name: 'sign',
              in: 'query',
              required: false,
              description: 'Signo do zodíaco. Se omitido, retorna a previsão de todos os signos.',
              schema: { type: 'string', enum: [...signEnum] }
            },
            {
              name: 'date',
              in: 'query',
              required: false,
              description: 'Data no formato YYYY-MM-DD. Se omitido, usa a data de hoje (previsão do dia).',
              schema: { type: 'string', format: 'date', example: '2025-02-07' }
            }
          ],
          responses: {
            '200': {
              description: 'Previsão(ões) encontrada(s)',
              content: {
                'application/json': {
                  schema: {
                    oneOf: [
                      {
                        description: 'Um objeto quando `sign` é informado',
                        $ref: '#/components/schemas/DailyPrediction'
                      },
                      {
                        description: 'Array quando `sign` não é informado',
                        type: 'array',
                        items: { $ref: '#/components/schemas/DailyPrediction' }
                      }
                    ]
                  }
                }
              }
            },
            '400': {
              description: 'Parâmetros inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '500': {
              description: 'Erro interno',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/horoscope/weekly': {
        get: {
          summary: 'Previsão da semana',
          description: 'Retorna a previsão da semana. **sign**: se omitido, retorna todos os signos; se informado, retorna só aquele signo. **date**: formato YYYY-MM-DD; se omitido, usa o dia corrente (semana da data atual). Se não existir previsão para a semana, ela é gerada e salva antes de ser retornada.',
          operationId: 'getWeeklyPrediction',
          tags: ['Horóscopo'],
          parameters: [
            {
              name: 'sign',
              in: 'query',
              required: false,
              description: 'Signo do zodíaco. Se omitido, retorna a previsão semanal de todos os signos.',
              schema: { type: 'string', enum: [...signEnum] }
            },
            {
              name: 'date',
              in: 'query',
              required: false,
              description: 'Data no formato YYYY-MM-DD. Se omitido, usa o dia corrente (semana da data atual).',
              schema: { type: 'string', format: 'date', example: '2025-02-07' }
            }
          ],
          responses: {
            '200': {
              description: 'Previsão(ões) semanal(is) encontrada(s)',
              content: {
                'application/json': {
                  schema: {
                    oneOf: [
                      {
                        description: 'Um objeto quando `sign` é informado',
                        $ref: '#/components/schemas/WeeklyPrediction'
                      },
                      {
                        description: 'Array quando `sign` não é informado',
                        type: 'array',
                        items: { $ref: '#/components/schemas/WeeklyPrediction' }
                      }
                    ]
                  }
                }
              }
            },
            '400': {
              description: 'Parâmetros inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '500': {
              description: 'Erro interno',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/moon/phase': {
        get: {
          summary: 'Fase da lua',
          description: 'Retorna a fase da lua do dia selecionado, com descrição, informações místicas e conselhos. **date**: formato YYYY-MM-DD; se omitido, usa a data de hoje.',
          operationId: 'getMoonPhase',
          tags: ['Lua'],
          parameters: [
            {
              name: 'date',
              in: 'query',
              required: false,
              description: 'Data no formato YYYY-MM-DD. Se omitido, usa a data de hoje.',
              schema: { type: 'string', format: 'date', example: '2025-02-07' }
            }
          ],
          responses: {
            '200': {
              description: 'Fase da lua e informações místicas',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/MoonPhaseResponse' }
                }
              }
            },
            '500': {
              description: 'Erro interno',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        DailyPrediction: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            sign: { type: 'string', enum: [...signEnum] },
            weekday: { type: 'string', description: 'Dia da semana (monday..sunday)' },
            isoWeek: { type: 'integer' },
            isoYear: { type: 'integer' },
            text: { type: 'string', description: 'Texto da previsão' },
            luckyNumber: { type: 'integer' },
            element: { type: 'string', nullable: true },
            quality: { type: 'string', nullable: true },
            rulingPlanet: { type: 'string', nullable: true },
            luckyColor: { type: 'string', nullable: true },
            emotion: { type: 'string', nullable: true },
            practicalAdvice: { type: 'string', nullable: true },
            compatibleSigns: { type: 'string', nullable: true },
            numerologyMeaning: { type: 'string', nullable: true },
            impactPhrase: { type: 'string', nullable: true },
            recommendedActivities: { type: 'string', nullable: true },
            dailyAlert: { type: 'string', nullable: true },
            energyLevel: { type: 'integer', nullable: true },
            crystal: { type: 'string', nullable: true },
            mantra: { type: 'string', nullable: true },
            loveAdvice: { type: 'string', nullable: true },
            careerAdvice: { type: 'string', nullable: true }
          }
        },
        WeeklyPrediction: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            sign: { type: 'string', enum: [...signEnum] },
            isoWeek: { type: 'integer', description: 'Semana ISO do ano' },
            isoYear: { type: 'integer', description: 'Ano ISO' },
            text: { type: 'string', description: 'Texto da previsão semanal' },
            luckyNumber: { type: 'integer' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'array', items: { type: 'object' }, description: 'Apenas em erros de validação' }
          }
        },
        MoonPhaseResponse: {
          type: 'object',
          properties: {
            date: { type: 'string', format: 'date', example: '2025-02-07' },
            dateFormatted: { type: 'string', description: 'Data em português (ex.: sexta-feira, 7 de fevereiro de 2025)' },
            moonAgeDays: { type: 'number', description: 'Idade da lua em dias desde a última lua nova' },
            phase: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Identificador da fase (nova, crescente_inicial, quarto_crescente, etc.)' },
                name: { type: 'string', description: 'Nome completo da fase' },
                nameShort: { type: 'string', description: 'Nome curto da fase' },
                emoji: { type: 'string', description: 'Emoji da fase (ex.: 🌑 🌕)' },
                description: { type: 'string', description: 'Descrição astronômica' },
                mystical: { type: 'string', description: 'Texto místico sobre a fase' },
                advice: { type: 'string', description: 'Conselhos para o período' },
                keywords: { type: 'array', items: { type: 'string' }, description: 'Palavras-chave da fase' }
              }
            }
          }
        }
      }
    }
  }

  return NextResponse.json(spec)
}
