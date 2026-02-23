import { NextRequest, NextResponse } from 'next/server'

const signEnum = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'] as const

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get('host') || 'localhost:3002'
  const protocol = req.headers.get('x-forwarded-proto') || 'http'
  return `${protocol}://${host}`
}

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl(req)

  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'API Horóscopo',
      description: 'API com endpoints de **Horóscopo** (previsão do dia e da semana por signo, reset), **Lua** (fase da lua e textos místicos), **Famosos** (aniversariantes do mês) e **OpenRouter** (verificação do uso da IA).',
      version: '1.0.0'
    },
    servers: [{ url: baseUrl, description: 'Servidor atual' }],
    tags: [
      { name: 'Horóscopo', description: 'Previsão do dia, da semana e reset' },
      { name: 'Lua', description: 'Fase da lua e informações místicas' },
      { name: 'Famosos', description: 'Aniversariantes do mês' },
      { name: 'OpenRouter', description: 'Verificação do uso da OpenRouter (IA)' }
    ],
    paths: {
      '/api/horoscope/daily': {
        get: {
          summary: 'Previsão do dia',
          description: 'Retorna a previsão do dia. **sign**: se omitido, retorna todos os signos. **date**: YYYY-MM-DD; omitido = hoje. **regenerate**: 1 ou true força regenerar (e passar pela IA se configurada). **tone**: tom da melhoria pela IA (bem_humorada, vibe_sertaneja, resumida). Se não existir previsão, ela é gerada e salva.',
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
              description: 'Data no formato YYYY-MM-DD. Se omitido, usa a data de hoje.',
              schema: { type: 'string', format: 'date', example: '2025-02-07' }
            },
            {
              name: 'regenerate',
              in: 'query',
              required: false,
              description: 'Força regenerar previsão (e passar pela IA). Valores: 1 ou true.',
              schema: { type: 'string', enum: ['1', 'true'] }
            },
            {
              name: 'tone',
              in: 'query',
              required: false,
              description: 'Tom da melhoria pela IA: bem_humorada, vibe_sertaneja ou resumida.',
              schema: { type: 'string', enum: ['bem_humorada', 'vibe_sertaneja', 'resumida'] }
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
          description: 'Retorna a previsão da semana. **sign**: se omitido, retorna todos os signos. **date**: YYYY-MM-DD; omitido = semana atual. **regenerate** e **tone** funcionam como no daily. Se não existir previsão, ela é gerada e salva.',
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
              description: 'Data no formato YYYY-MM-DD. Se omitido, usa a semana da data atual.',
              schema: { type: 'string', format: 'date', example: '2025-02-07' }
            },
            {
              name: 'regenerate',
              in: 'query',
              required: false,
              description: 'Força regenerar previsão semanal (e passar pela IA). Valores: 1 ou true.',
              schema: { type: 'string', enum: ['1', 'true'] }
            },
            {
              name: 'tone',
              in: 'query',
              required: false,
              description: 'Tom da melhoria pela IA: bem_humorada, vibe_sertaneja ou resumida.',
              schema: { type: 'string', enum: ['bem_humorada', 'vibe_sertaneja', 'resumida'] }
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
      },
      '/api/horoscope/reset': {
        delete: {
          summary: 'Resetar previsões do dia e da semana',
          description: 'Remove da base todas as previsões do dia e da semana para a data informada. Útil para forçar nova geração (com ou sem IA).',
          operationId: 'resetPredictions',
          tags: ['Horóscopo'],
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
              description: 'Previsões removidas',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean', example: true },
                      date: { type: 'string', format: 'date' },
                      deleted: {
                        type: 'object',
                        properties: {
                          daily: { type: 'integer', description: 'Quantidade de previsões diárias removidas' },
                          weekly: { type: 'integer', description: 'Quantidade de previsões semanais removidas' }
                        }
                      }
                    }
                  }
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
      '/api/openrouter/check': {
        get: {
          summary: 'Verificar uso da OpenRouter',
          description: 'Verifica se a API está utilizando a OpenRouter com sucesso: chave configurada e requisição mínima à IA ok. Útil para health check ou diagnóstico.',
          operationId: 'checkOpenRouter',
          tags: ['OpenRouter'],
          responses: {
            '200': {
              description: 'OpenRouter em uso com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'OpenRouter está em uso com sucesso.' },
                      model: { type: 'string', description: 'Modelo configurado (ex.: openai/gpt-3.5-turbo)' }
                    }
                  }
                }
              }
            },
            '503': {
              description: 'OpenRouter não disponível ou não configurada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      message: { type: 'string' },
                      error: { type: 'string', description: 'Detalhe do erro (ex.: chave não configurada, timeout)' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/famosos/aniversariantes': {
        get: {
          summary: 'Aniversariantes do mês',
          description: 'Retorna a lista de cantores/artistas famosos que fazem aniversário no mês da data informada. Exclui nomes que são apenas de duplas (ex.: "Praião & Prainha"); mantém nomes de pessoas.',
          operationId: 'getAniversariantes',
          tags: ['Famosos'],
          parameters: [
            {
              name: 'date',
              in: 'query',
              required: false,
              description: 'Data no formato YYYY-MM-DD (usa o mês). Se omitido, usa o mês atual.',
              schema: { type: 'string', format: 'date', example: '2025-02-07' }
            }
          ],
          responses: {
            '200': {
              description: 'Lista de aniversariantes do mês',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      mes: { type: 'integer', description: 'Número do mês (1-12)' },
                      mesNome: { type: 'string', description: 'Nome do mês em português (ex.: fevereiro)' },
                      total: { type: 'integer', description: 'Quantidade de aniversariantes' },
                      aniversariantes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            nome: { type: 'string' },
                            dia: { type: 'integer' },
                            mes: { type: 'integer' },
                            dataFormatada: { type: 'string', description: 'Ex.: 07/02' }
                          }
                        }
                      }
                    }
                  }
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
