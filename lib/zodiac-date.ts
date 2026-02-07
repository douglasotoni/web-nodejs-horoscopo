/**
 * Retorna o signo do zodíaco a partir do dia e mês (data de nascimento).
 * Usa as datas tropicais padrão.
 */
export interface SignFromDate {
  id: string
  name: string
  symbol: string
}

const SIGNS: SignFromDate[] = [
  { id: 'capricorn', name: 'Capricórnio', symbol: '♑' },
  { id: 'aquarius', name: 'Aquário', symbol: '♒' },
  { id: 'pisces', name: 'Peixes', symbol: '♓' },
  { id: 'aries', name: 'Áries', symbol: '♈' },
  { id: 'taurus', name: 'Touro', symbol: '♉' },
  { id: 'gemini', name: 'Gêmeos', symbol: '♊' },
  { id: 'cancer', name: 'Câncer', symbol: '♋' },
  { id: 'leo', name: 'Leão', symbol: '♌' },
  { id: 'virgo', name: 'Virgem', symbol: '♍' },
  { id: 'libra', name: 'Libra', symbol: '♎' },
  { id: 'scorpio', name: 'Escorpião', symbol: '♏' },
  { id: 'sagittarius', name: 'Sagitário', symbol: '♐' }
]

/** (mes, dia) dentro do intervalo? endMes/endDia é o último dia do signo (inclusive). */
function inRange(mes: number, dia: number, startMes: number, startDia: number, endMes: number, endDia: number): boolean {
  if (startMes < endMes) {
    return (mes === startMes && dia >= startDia) || (mes === endMes && dia <= endDia) || (mes > startMes && mes < endMes)
  }
  // signo cruza ano (ex: Cap 22/12 a 19/1)
  return (mes === startMes && dia >= startDia) || (mes === endMes && dia <= endDia) || (mes > startMes || mes < endMes)
}

/** Intervalos (startMes, startDia, endMes, endDia) de cada signo. */
const RANGES: [number, number, number, number][] = [
  [12, 22, 1, 19],   // Capricórnio
  [1, 20, 2, 18],    // Aquário
  [2, 19, 3, 20],    // Peixes
  [3, 21, 4, 19],    // Áries
  [4, 20, 5, 20],    // Touro
  [5, 21, 6, 20],    // Gêmeos
  [6, 21, 7, 22],    // Câncer
  [7, 23, 8, 22],    // Leão
  [8, 23, 9, 22],    // Virgem
  [9, 23, 10, 22],   // Libra
  [10, 23, 11, 21],  // Escorpião
  [11, 22, 12, 21]   // Sagitário
]

const MONTH_FULL: Record<number, string> = {
  1: 'janeiro', 2: 'fevereiro', 3: 'março', 4: 'abril', 5: 'maio', 6: 'junho',
  7: 'julho', 8: 'agosto', 9: 'setembro', 10: 'outubro', 11: 'novembro', 12: 'dezembro'
}

const SIGN_IDS_ORDER: SignFromDate['id'][] = [
  'capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini',
  'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius'
]

/** Retorna o intervalo de datas do signo (ex.: "de 21 de março a 19 de abril") para exibição no card. */
export function getSignDateRange(signId: string): string {
  const i = SIGN_IDS_ORDER.indexOf(signId as SignFromDate['id'])
  if (i < 0) return ''
  const [startMes, startDia, endMes, endDia] = RANGES[i]
  return `de ${startDia} de ${MONTH_FULL[startMes]} a ${endDia} de ${MONTH_FULL[endMes]}`
}

export function getSignFromDayMonth(dia: number, mes: number): SignFromDate {
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return SIGNS[0]
  for (let i = 0; i < RANGES.length; i++) {
    const [sm, sd, em, ed] = RANGES[i]
    if (inRange(mes, dia, sm, sd, em, ed)) return SIGNS[i]
  }
  return SIGNS[0]
}
