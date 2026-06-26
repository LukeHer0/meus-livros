import { ref, computed } from 'vue'
import { mapCountryName } from '@/utils/countries'

/**
 * Store reativa centralizada para os livros.
 * Usa o padrão composable do Vue 3 (singleton via módulo).
 */

const books = ref([])
const isLoaded = ref(false)

// Filtros
const filterGenre = ref('')
const filterCountry = ref('')
const filterDecade = ref('')
const sortBy = ref('read_desc')

/**
 * Carrega os livros do JSON (executa apenas uma vez).
 */
async function loadBooks() {
  if (isLoaded.value) return
  const response = await fetch('/livros.json')
  const data = await response.json()
  books.value = data.map((book, index) => ({
    ...book,
    original_index: index,
    pages: book.pages || 0,
    year: book.year || 0,
    country: mapCountryName(book.country),
    decade: book.year ? Math.floor(book.year / 10) * 10 : null,
  }))
  isLoaded.value = true
}

// --- Computed: listas de filtros disponíveis ---

const availableGenres = computed(() => {
  const allGenres = books.value.flatMap((b) => b.genre || [])
  return [...new Set(allGenres)].sort()
})

const availableCountries = computed(() => {
  const countries = new Set(books.value.map((b) => b.country).filter(Boolean))
  return [...countries].sort()
})

const availableDecades = computed(() => {
  const decades = new Set(
    books.value.map((b) => b.decade).filter((d) => d !== null)
  )
  return [...decades].sort((a, b) => b - a)
})

// --- Computed: filtros ativos ---

const hasActiveFilters = computed(
  () => filterGenre.value || filterCountry.value || filterDecade.value
)

function resetFilters() {
  filterGenre.value = ''
  filterCountry.value = ''
  filterDecade.value = ''
}

// --- Computed: livros filtrados e ordenados ---

const sortedBooks = computed(() => {
  let list = [...books.value]

  if (filterGenre.value) {
    list = list.filter((b) => {
      if (!b.genre || !b.genre.length) return false
      return b.genre.includes(filterGenre.value)
    })
  }
  if (filterCountry.value) {
    list = list.filter((b) => b.country === filterCountry.value)
  }
  if (filterDecade.value) {
    list = list.filter((b) => b.decade === Number(filterDecade.value))
  }

  return list.sort((a, b) => {
    if (sortBy.value === 'read_desc') {
      const diff = Number(b.read_in) - Number(a.read_in)
      return diff === 0 ? b.original_index - a.original_index : diff
    }
    if (sortBy.value === 'read_asc') {
      const diff = Number(a.read_in) - Number(b.read_in)
      return diff === 0 ? a.original_index - b.original_index : diff
    }
    if (sortBy.value === 'rating') {
      const diff = (Number(b.rate) || 0) - (Number(a.rate) || 0)
      return diff === 0 ? b.original_index - a.original_index : diff
    }
    if (sortBy.value === 'year_desc') {
      const diff = (Number(b.year) || 0) - (Number(a.year) || 0)
      return diff === 0 ? b.original_index - a.original_index : diff
    }
    if (sortBy.value === 'year_asc') {
      const diff = (Number(a.year) || 0) - (Number(b.year) || 0)
      return diff === 0 ? a.original_index - b.original_index : diff
    }
    if (sortBy.value === 'alpha') {
      const diff = a.title.localeCompare(b.title)
      return diff === 0 ? a.original_index - b.original_index : diff
    }
    return 0
  })
})

// --- Computed: estatísticas globais ---

const totalBooks = computed(() => books.value.length)

const uniqueAuthors = computed(
  () => [...new Set(books.value.map((b) => b.author))].length
)

const uniqueCountries = computed(
  () => [...new Set(books.value.map((b) => b.country))].length
)

const totalPages = computed(() =>
  sortedBooks.value.reduce((acc, book) => acc + book.pages, 0)
)

const averagePages = computed(() => {
  if (sortedBooks.value.length === 0) return 0
  return Math.round(totalPages.value / sortedBooks.value.length)
})

const chartData = computed(() => {
  const counts = {}
  books.value.forEach((book) => {
    const c = book.country
    if (c) counts[c] = (counts[c] || 0) + 1
  })
  const data = [['Country', 'Livros']]
  for (const [country, count] of Object.entries(counts)) {
    data.push([country, count])
  }
  return data
})

// --- Computed: dados de autores ---

const authors = computed(() => {
  const map = {}
  books.value.forEach((book) => {
    const name = book.author
    if (!name) return
    if (!map[name]) {
      map[name] = {
        name,
        country: book.country,
        books: [],
        totalPages: 0,
        totalRate: 0,
        ratedCount: 0,
      }
    }
    map[name].books.push(book)
    map[name].totalPages += book.pages
    if (book.rate) {
      map[name].totalRate += book.rate
      map[name].ratedCount++
    }
  })

  return Object.values(map).map((a) => ({
    ...a,
    bookCount: a.books.length,
    averageRate: a.ratedCount > 0
      ? Math.round((a.totalRate / a.ratedCount) * 10) / 10
      : null,
  }))
})

/**
 * Composable que expõe a store de livros.
 */
export function useBooks() {
  return {
    // Data
    books,
    isLoaded,
    loadBooks,

    // Filtros
    filterGenre,
    filterCountry,
    filterDecade,
    sortBy,
    availableGenres,
    availableCountries,
    availableDecades,
    hasActiveFilters,
    resetFilters,

    // Livros processados
    sortedBooks,

    // Estatísticas
    totalBooks,
    uniqueAuthors,
    uniqueCountries,
    totalPages,
    averagePages,
    chartData,

    // Autores
    authors,
  }
}
