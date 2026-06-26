/**
 * Mapeamento de nomes de países PT-BR → inglês (para Google Charts).
 */
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
}

export function mapCountryName(ptName) {
  if (!ptName) return ''
  return countryMap[ptName] || ptName
}
