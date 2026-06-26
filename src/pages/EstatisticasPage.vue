<template>
  <div class="stats-page">
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBooks } from '@/stores/books'

const { books, totalBooks, uniqueAuthors, uniqueCountries } = useBooks()

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
