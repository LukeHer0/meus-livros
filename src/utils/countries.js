/** Nomes em português para a interface; códigos ISO para o mapa. */
const countryMap = {
  EUA: 'United States',
  'Reino Unido': 'United Kingdom',
  Brasil: 'Brazil',
  Colômbia: 'Colombia',
  Alemanha: 'Germany',
  Rússia: 'Russia',
  França: 'France',
  Áustria: 'Austria',
  Noruega: 'Norway',
  China: 'China',
  Israel: 'Israel',
  Portugal: 'Portugal',
  Itália: 'Italy',
  'Roma Antiga': 'Italy',
  Japão: 'Japan',
  Irlanda: 'Ireland',
  Tchéquia: 'Czech Republic',
}

const countryCodes = {
  'United States': 'US', 'United Kingdom': 'GB', Brazil: 'BR', Colombia: 'CO',
  Germany: 'DE', Russia: 'RU', France: 'FR', Austria: 'AT', Norway: 'NO',
  China: 'CN', Israel: 'IL', Portugal: 'PT', Italy: 'IT', Japan: 'JP',
  Ireland: 'IE', 'Czech Republic': 'CZ',
}

export function mapCountryName(ptName) {
  if (!ptName) return ''
  const raw = String(ptName).trim()
  const name = Object.entries(countryCodes).find(([, code]) => code === raw)?.[0] || raw
  if (name === 'República Tcheca' || name === 'Czechia') return 'Tchéquia'
  if (name === 'Estados Unidos') return 'EUA'
  return Object.entries(countryMap).find(([, english]) => english === name)?.[0] || name
}

export function getMapCountry(name) {
  return countryCodes[countryMap[mapCountryName(name)]] || ''
}
