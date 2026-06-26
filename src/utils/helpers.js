/**
 * Converte nota numérica em estrelas unicode.
 * Ex: 4.5 → "★★★★½"
 */
export function getStars(rate) {
  if (!rate) return ''
  const r = parseFloat(rate)
  return '★'.repeat(Math.floor(r)) + (r % 1 !== 0 ? '½' : '')
}
