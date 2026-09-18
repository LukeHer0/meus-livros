<template>
  <div class="stats-page">
    <p v-if="loadError" role="alert">{{ loadError }}</p>
    <p v-else-if="!isLoaded" role="status">Carregando estatísticas…</p>
    <p v-else-if="!books.length">Adicione livros à biblioteca para descobrir suas estatísticas.</p>
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
      <h2>Seu perfil de leitura</h2>
      <p class="stats-description">Destaques de toda a biblioteca. Cada cálculo considera apenas os livros com o dado correspondente informado.</p>
      <div class="reading-highlights">
        <article v-for="item in readingStats.highlights" :key="item.label" class="stat-card">
          <span class="label">{{ item.label }}</span>
          <strong class="value">{{ item.value }}</strong>
          <p>{{ item.detail }}</p>
        </article>
      </div>
    </section>

    <!-- Livros por ano de leitura -->
    <div class="stats-section">
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
    <div class="stats-section">
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBooks } from '@/stores/books'
import { getReadingStatistics } from '@/utils/statistics'

const { books, totalBooks, uniqueAuthors, uniqueCountries, isLoaded, loadError } = useBooks()
const readingStats = computed(() => getReadingStatistics(books.value))

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
