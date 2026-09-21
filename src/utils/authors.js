// Aceita o formato antigo (texto) e coautoria (lista de nomes).
export function getAuthorNames(value) {
  const names = new Map()
  for (const entry of Array.isArray(value) ? value : [value]) {
    if (typeof entry !== 'string' || !entry.trim()) continue
    const name = entry.trim()
    const key = name.toLocaleLowerCase('pt-BR')
    if (!names.has(key)) names.set(key, name)
  }
  return [...names.values()]
}

export function formatAuthors(value) {
  return getAuthorNames(value).join(', ')
}
