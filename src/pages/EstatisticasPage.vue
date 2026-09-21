<template>
  <div class="stats-page">
    <div class="period-navigation">
      <button type="button" class="period-arrow" aria-label="Ver períodos mais recentes" @click="scrollPeriods(-1)">‹</button>
      <div ref="periodStrip" class="stats-period" role="group" aria-label="Período das estatísticas">
        <button type="button" :aria-pressed="period === 'all'" @click="selectPeriod('all', $event)">Estatísticas gerais</button>
        <button v-for="year in availableYears" :key="year" type="button" :aria-pressed="period === year" @click="selectPeriod(year, $event)">{{ year }}{{ year === currentYear ? ' · Atual' : '' }}</button>
      </div>
      <button type="button" class="period-arrow" aria-label="Ver períodos mais antigos" @click="scrollPeriods(1)">›</button>
    </div>
    <p class="stats-description">{{ period === 'all' ? 'Todos os livros da biblioteca.' : `Livros lidos em ${period}, conforme o campo “Lido em”.` }}</p>
    <p v-if="loadError" role="alert">{{ loadError }}</p>
    <p v-else-if="!isLoaded" role="status">Carregando estatísticas…</p>
    <p v-else-if="!books.length" role="status">{{ period !== 'all' ? `Nenhum livro lido em ${period} cadastrado ainda.` : 'Adicione livros à biblioteca para descobrir suas estatísticas.' }}</p>
    <template v-if="isLoaded && !loadError">
    <!-- Overview cards -->
    <div class="stats-overview">
      <div class="stat-card">
        <span class="value">{{ totalBooks }}</span>
        <span class="label">Livros</span>
      </div>
      <div class="stat-card">
        <span class="value">{{ uniqueAuthors }}</span>
        <span class="label">Autores</span>
      </div>
      <div class="stat-card">
        <span class="value">{{ uniqueCountries }}</span>
        <span class="label">Países</span>
      </div>
      <div class="stat-card">
        <span class="value">{{ allTotalPages.toLocaleString('pt-BR') }}</span>
        <span class="label">Páginas</span>
      </div>
      <div class="stat-card">
        <span class="value">{{ avgRating }}</span>
        <span class="label">Nota Média</span>
      </div>
      <div class="stat-card">
        <span class="value">{{ physicalVsEbook }}</span>
        <span class="label">Físico / Ebook</span>
      </div>
    </div>

    <section class="stats-section">
      <h2>{{ period === 'all' ? 'Seu perfil de leitura' : `Seu ano em livros · ${period}` }}</h2>
      <p class="stats-description">Destaques {{ period === 'all' ? 'de toda a biblioteca' : 'das leituras do ano' }}. Cada cálculo considera apenas os livros com o dado correspondente informado.</p>
      <div class="reading-highlights">
        <article v-for="item in highlights" :key="item.label" class="stat-card">
          <span class="label">{{ item.label }}</span>
          <strong class="value">{{ item.value }}</strong>
          <p>{{ item.detail }}</p>
        </article>
      </div>
    </section>

    <!-- Livros por ano de leitura -->
    <div v-if="period === 'all'" class="stats-section">
      <h2>📅 Livros por Ano de Leitura</h2>
      <div class="bar-chart">
        <div v-for="item in booksByYear" :key="item.year" class="bar-row">
          <span class="bar-label">{{ item.year }}</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: item.pct + '%' }"></div>
          </div>
          <span class="bar-value">{{ item.count }}</span>
        </div>
      </div>
    </div>

    <!-- Gêneros mais lidos -->
    <div class="stats-section">
      <h2>📚 Gêneros Mais Lidos</h2>
      <div class="bar-chart">
        <div v-for="item in topGenres" :key="item.genre" class="bar-row">
          <span class="bar-label">{{ item.genre }}</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: item.pct + '%' }"></div>
          </div>
          <span class="bar-value">{{ item.count }}</span>
        </div>
      </div>
    </div>

    <!-- Distribuição de notas -->
    <div class="stats-section">
      <h2>⭐ Distribuição de Notas</h2>
      <div class="bar-chart">
        <div v-for="item in ratingDistribution" :key="item.rating" class="bar-row">
          <span class="bar-label">{{ item.label }}</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: item.pct + '%' }"></div>
          </div>
          <span class="bar-value">{{ item.count }}</span>
        </div>
      </div>
    </div>

    <!-- Páginas por ano -->
    <div v-if="period === 'all'" class="stats-section">
      <h2>📖 Páginas por Ano de Leitura</h2>
      <div class="bar-chart">
        <div v-for="item in pagesByYear" :key="item.year" class="bar-row">
          <span class="bar-label">{{ item.year }}</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: item.pct + '%' }"></div>
          </div>
          <span class="bar-value">{{ item.pages.toLocaleString('pt-BR') }}</span>
        </div>
      </div>
    </div>
    <div class="reading-breakdowns">
      <section v-for="section in readingStats.sections" :key="section.title" class="stats-section">
        <h2>{{ section.title }}</h2>
        <p class="stats-description">{{ section.description }}</p>
        <div v-if="section.rows.length" class="bar-chart">
          <div v-for="item in section.rows" :key="item.label" class="reading-bar">
            <div class="reading-bar-heading">
              <span>{{ item.label }}</span>
              <strong>{{ item.display }}</strong>
            </div>
            <div class="bar-track" aria-hidden="true">
              <div class="bar-fill" :style="{ width: item.pct + '%' }"></div>
            </div>
            <small v-if="item.detail">{{ item.detail }}</small>
          </div>
        </div>
        <p v-else class="stats-description">Ainda não há dados suficientes para este recorte.</p>
      </section>
    </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useBooks } from '@/stores/books'
import { getReadingStatistics } from '@/utils/statistics'
import { getAuthorNames, formatAuthors } from '@/utils/authors'

const { books: allBooks, isLoaded, loadError } = useBooks()
const period = ref('all')
const currentYear = new Date().getFullYear()
const availableYears = computed(() => [...new Set(allBooks.value.map(book => Number(book.read_in))
  .filter(year => Number.isInteger(year) && year > 0))].sort((a, b) => b - a))
const periodStrip = ref(null)
function scrollPeriods(direction) {
  periodStrip.value?.scrollBy({ left: direction * periodStrip.value.clientWidth * 0.75 })
}
function selectPeriod(value, event) {
  period.value = value
  event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}
const books = computed(() => period.value === 'all' ? allBooks.value : allBooks.value.filter(book => Number(book.read_in) === period.value))
const totalBooks = computed(() => books.value.length)
const uniqueAuthors = computed(() => getAuthorNames(books.value.flatMap(book => getAuthorNames(book.author))).length)
const uniqueCountries = computed(() => new Set(books.value.map(book => book.country).filter(Boolean)).size)
const readingStats = computed(() => getReadingStatistics(books.value))
const highlights = computed(() => {
  if (period.value === 'all') return readingStats.value.highlights
  const previousAuthors = new Set(allBooks.value
    .filter(book => Number(book.read_in) > 0 && Number(book.read_in) < period.value)
    .flatMap(book => getAuthorNames(book.author)).map(name => name.toLocaleLowerCase('pt-BR')))
  const newAuthors = getAuthorNames(books.value.flatMap(book => getAuthorNames(book.author)))
    .filter(name => !previousAuthors.has(name.toLocaleLowerCase('pt-BR')))
  const rated = books.value.filter(book => Number(book.rate) > 0 && Number(book.rate) <= 5)
  const bestRate = Math.max(0, ...rated.map(book => Number(book.rate)))
  const bestBooks = rated.filter(book => Number(book.rate) === bestRate)
  const previousBooks = allBooks.value.filter(book => Number(book.read_in) === period.value - 1)
  return [
    ...readingStats.value.highlights.slice(0, 3),
    { label: 'Autores novos no ano', value: newAuthors.length, detail: 'Autores sem leituras registradas em anos anteriores. Livros sem ano informado não entram nessa comparação.' },
    { label: 'Melhor nota do ano', value: bestRate ? `${bestRate.toLocaleString('pt-BR')} ★` : '—', detail: bestBooks.length ? bestBooks.map(book => `${book.title} · ${formatAuthors(book.author)}`).join('; ') : 'Nenhum livro avaliado neste ano.' },
    { label: `Leituras em ${period.value - 1}`, value: previousBooks.length, detail: `${books.value.length} livros registrados em ${period.value}${period.value === currentYear ? ' até agora' : ''}. ${previousBooks.length ? `A referência de ${period.value - 1} considera o ano inteiro.` : 'Não há leituras cadastradas no ano anterior.'}` },
  ]
})

// --- Total de páginas (todos os livros, sem filtro) ---
const allTotalPages = computed(() =>
  books.value.reduce((acc, b) => acc + (b.pages || 0), 0)
)

// --- Nota média global ---
const avgRating = computed(() => {
  const rated = books.value.filter((b) => b.rate)
  if (rated.length === 0) return '—'
  const sum = rated.reduce((acc, b) => acc + b.rate, 0)
  return (sum / rated.length).toFixed(1)
})

// --- Físico vs Ebook ---
const physicalVsEbook = computed(() => {
  let phys = 0
  let ebook = 0
  books.value.forEach((b) => {
    if (b.source === 'Físico') phys++
    else if (b.source === 'Ebook') ebook++
  })
  return `${phys} / ${ebook}`
})

// --- Livros por ano ---
const booksByYear = computed(() => {
  const counts = {}
  books.value.forEach((b) => {
    if (b.read_in) counts[b.read_in] = (counts[b.read_in] || 0) + 1
  })
  const entries = Object.entries(counts)
    .map(([year, count]) => ({ year: Number(year), count }))
    .sort((a, b) => a.year - b.year)
  const max = Math.max(...entries.map((e) => e.count), 1)
  return entries.map((e) => ({ ...e, pct: (e.count / max) * 100 }))
})

// --- Top gêneros ---
const topGenres = computed(() => {
  const counts = {}
  books.value.forEach((b) => {
    ;(b.genre || []).forEach((g) => {
      counts[g] = (counts[g] || 0) + 1
    })
  })
  const entries = Object.entries(counts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)
  const max = Math.max(...entries.map((e) => e.count), 1)
  return entries.map((e) => ({ ...e, pct: (e.count / max) * 100 }))
})

// --- Distribuição de notas ---
const ratingDistribution = computed(() => {
  const buckets = {}
  books.value.forEach((b) => {
    if (!b.rate) return
    const rounded = Math.floor(b.rate)
    const label = `${rounded}${b.rate % 1 !== 0 ? '.5' : ''}`
    const key = b.rate
    buckets[key] = (buckets[key] || 0) + 1
  })
  const entries = Object.entries(buckets)
    .map(([rating, count]) => ({
      rating: Number(rating),
      label: `★ ${rating}`,
      count,
    }))
    .sort((a, b) => b.rating - a.rating)
  const max = Math.max(...entries.map((e) => e.count), 1)
  return entries.map((e) => ({ ...e, pct: (e.count / max) * 100 }))
})

// --- Páginas por ano ---
const pagesByYear = computed(() => {
  const counts = {}
  books.value.forEach((b) => {
    if (b.read_in) counts[b.read_in] = (counts[b.read_in] || 0) + (b.pages || 0)
  })
  const entries = Object.entries(counts)
    .map(([year, pages]) => ({ year: Number(year), pages }))
    .sort((a, b) => a.year - b.year)
  const max = Math.max(...entries.map((e) => e.pages), 1)
  return entries.map((e) => ({ ...e, pct: (e.pages / max) * 100 }))
})
</script>

<style scoped>
.period-navigation { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.period-arrow { flex-shrink: 0; font-size: 1.5rem; padding: 4px 12px; }
.stats-period {
  display: flex;
  gap: 8px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  padding: 4px 2px 10px;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
  scrollbar-color: var(--border-subtle) transparent;
}
.stats-period button { flex-shrink: 0; white-space: nowrap; scroll-snap-align: start; }
.period-arrow,
.stats-period button {
  padding: 10px 16px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-color);
  font: inherit;
  cursor: pointer;
}
.stats-period button[aria-pressed="true"] {
  color: #fff;
  border-color: var(--highlight);
  background: var(--input-bg);
}
.period-navigation button:focus-visible { outline: 2px solid var(--highlight); outline-offset: 3px; }
.stats-description {
  margin: 0 0 20px;
  line-height: 1.6;
}

.reading-highlights,
.reading-breakdowns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.reading-highlights .stat-card {
  text-align: left;
}

.reading-highlights .value {
  margin-top: 12px;
}

.reading-highlights p {
  margin: 8px 0 0;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.reading-breakdowns .stats-section {
  min-width: 0;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 0;
}

.reading-bar-heading {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 6px;
}

.reading-bar-heading span {
  overflow-wrap: anywhere;
}

.reading-bar-heading strong {
  flex-shrink: 0;
  color: var(--highlight);
}

.reading-bar .bar-track {
  height: 12px;
}

.reading-bar .bar-fill {
  min-width: 0;
}

.reading-bar small {
  display: block;
  margin-top: 4px;
}

.reading-breakdowns .bar-chart {
  gap: 16px;
}

@media (max-width: 600px) {
  .reading-highlights,
  .reading-breakdowns {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
