import { formatAuthors, getAuthorNames } from './authors.js'

const number = (value) => value !== null && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null
const format = (value) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
const key = (value) => typeof value === 'string' ? value.trim().toLocaleLowerCase('pt-BR') : ''

function groups(books, field) {
  const result = new Map()
  for (const book of books) {
    const values = field === 'author' ? getAuthorNames(book.author) : Array.isArray(book[field]) ? book[field] : [book[field]]
    for (const value of new Map(values.filter(key).map(value => [key(value), value.trim()])).values()) {
      const id = key(value)
      if (!result.has(id)) result.set(id, { label: value, books: [] })
      result.get(id).books.push(book)
    }
  }
  return [...result.values()]
}

function counts(books, field, limit = 10) {
  const rows = groups(books, field)
    .map(group => ({ label: group.label, value: group.books.length }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR'))
    .slice(0, limit)
  return bars(rows)
}

function bars(rows, maximum) {
  const max = maximum || Math.max(1, ...rows.map(row => row.value))
  return rows.map(row => ({ ...row, display: row.display ?? format(row.value), pct: row.value / max * 100 }))
}

export function getReadingStatistics(books) {
  const withPages = books.filter(book => number(book.pages) > 0)
  const pages = withPages.map(book => Number(book.pages)).sort((a, b) => a - b)
  const middle = Math.floor(pages.length / 2)
  const median = pages.length ? (pages.length % 2 ? pages[middle] : (pages[middle - 1] + pages[middle]) / 2) : null
  const longest = withPages.reduce((best, book) => !best || Number(book.pages) > Number(best.pages) ? book : best, null)
  const years = groups(books.filter(book => number(book.read_in) > 0).map(book => ({ ...book, readingYear: String(book.read_in) })), 'readingYear')
  const bestYear = [...years].sort((a, b) => b.books.length - a.books.length || Number(a.label) - Number(b.label))[0]
  const genres = groups(books, 'genre').map(group => {
    const rated = group.books.map(book => number(book.rate)).filter(rate => rate > 0 && rate <= 5)
    return { label: group.label, value: rated.length ? rated.reduce((sum, rate) => sum + rate, 0) / rated.length : 0, count: rated.length }
  }).filter(group => group.count >= 3).sort((a, b) => b.value - a.value || b.count - a.count || a.label.localeCompare(b.label, 'pt-BR')).slice(0, 10)
  const periods = new Map()
  for (const book of books) {
    const year = number(book.year)
    if (!year || !Number.isInteger(year)) continue
    const century = Math.ceil(Math.abs(year) / 100)
    const label = `Século ${century}${year < 0 ? ' a.C.' : ''}`
    if (!periods.has(label)) periods.set(label, { label, value: 0, order: year < 0 ? -century : century })
    periods.get(label).value++
  }
  return {
    highlights: [
      { label: 'Páginas por livro', value: pages.length ? format(pages.reduce((sum, value) => sum + value, 0) / pages.length) : '—', detail: `Média entre ${pages.length} livros com páginas informadas.` },
      { label: 'Mediana de páginas', value: median === null ? '—' : format(median), detail: 'O tamanho central ao ordenar os livros por número de páginas.' },
      { label: 'Livro mais longo', value: longest ? `${format(Number(longest.pages))} pág.` : '—', detail: longest ? `${longest.title} · ${formatAuthors(longest.author) || 'Autor não informado'}` : 'Sem páginas informadas.' },
      { label: 'Ano com mais leituras', value: bestYear?.label || '—', detail: bestYear ? `${bestYear.books.length} livros registrados. Em caso de empate, o primeiro ano.` : 'Sem ano de leitura informado.' },
    ],
    sections: [
      { title: 'Autores mais lidos', description: 'Até 10 autores com mais livros na sua biblioteca. Obras em coautoria contam uma vez para cada autor.', rows: counts(books, 'author') },
      { title: 'Idiomas originais', description: 'Idioma original das obras, independentemente do idioma da edição lida.', rows: counts(books, 'original_language', Infinity) },
      { title: 'Tamanho dos livros', description: `${pages.length} livros com páginas informadas.`, rows: bars([
        { label: 'Até 199 páginas', value: pages.filter(value => value < 200).length },
        { label: '200 a 399 páginas', value: pages.filter(value => value >= 200 && value < 400).length },
        { label: '400 a 599 páginas', value: pages.filter(value => value >= 400 && value < 600).length },
        { label: '600 páginas ou mais', value: pages.filter(value => value >= 600).length },
      ]) },
      { title: 'Épocas de publicação', description: 'Distribuição pelo século do ano de publicação cadastrado.', rows: bars([...periods.values()].sort((a, b) => a.order - b.order)) },
      { title: 'Gêneros mais bem avaliados', description: 'Nota média de 0 a 5, com pelo menos 3 livros avaliados por gênero. Um livro pode participar de vários gêneros.', rows: bars(genres.map(group => ({ ...group, display: `${format(group.value)} ★`, detail: `${group.count} avaliações` })), 5) },
      { title: 'Editoras mais presentes', description: 'Até 10 editoras com mais livros cadastrados.', rows: counts(books, 'publisher') },
    ],
  }
}
