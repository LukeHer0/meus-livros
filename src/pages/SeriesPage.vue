<template>
  <div class="series-page">
    <h2>Séries de livros</h2>
    <p v-if="loadError" role="alert">{{ loadError }}</p>
    <p v-else-if="!isLoaded" role="status">Carregando séries…</p>
    <template v-else>
      <p class="series-description">{{ series.length }} séries · {{ series.reduce((total, item) => total + item.books.length, 0) }} livros na biblioteca</p>
      <div v-if="series.length" class="series-toolbar">
        <label class="series-search">
          <span>Buscar série, autor ou livro</span>
          <input v-model="search" type="search" placeholder="Qual história você procura?" />
        </label>
        <label>
          <span>Ordenar séries</span>
          <select v-model="sortBy">
            <option value="alpha">Nome (A–Z)</option>
            <option value="count">Mais livros</option>
          </select>
        </label>
      </div>
      <p v-if="!series.length">Nenhum livro com série informada ainda.</p>
      <p v-else-if="!filteredSeries.length" role="status">Nenhuma série encontrada. <button class="clear-search" @click="search = ''">Limpar busca</button></p>
      <div v-else class="series-layout">
        <nav class="series-index" aria-label="Escolher série">
          <p class="index-caption" aria-live="polite">{{ filteredSeries.length }} {{ filteredSeries.length === 1 ? 'série' : 'séries' }}</p>
          <button v-for="item in filteredSeries" :key="item.key" type="button"
            class="series-index-item" :class="{ active: collection?.key === item.key }"
            :aria-current="collection?.key === item.key ? 'true' : undefined"
            aria-controls="series-detail" @click="selectedSeries = item.key">
            <span>{{ item.name }}</span>
            <small>{{ item.books.length }} {{ item.books.length === 1 ? 'livro' : 'livros' }}</small>
          </button>
        </nav>
      <section v-if="collection" id="series-detail" class="series-collection" aria-labelledby="series-name">
        <div class="collection-heading">
          <span class="collection-eyebrow">SUA ESTANTE DE SÉRIES</span>
          <h3 id="series-name">{{ collection.name }}</h3>
          <p class="series-description">{{ collection.authors.join(', ') }}</p>
          <span class="collection-count">{{ collection.books.length }} {{ collection.books.length === 1 ? 'livro cadastrado' : 'livros cadastrados' }}</span>
          <p class="collection-hint">Em ordem de volume. Selecione um livro para ver os detalhes.</p>
        </div>
        <ol class="series-books">
          <li v-for="book in collection.books" :key="book.original_index">
            <button type="button" class="series-book" @click="selectedBook = book">
              <img class="series-cover" :src="getCover(book)" alt="" loading="lazy" @error="coverError($event, book)" />
              <span class="series-book-info">
              <span class="series-volume">{{ book.series_number ? `Vol. ${book.series_number}` : 'Sem volume' }}</span>
              <span class="series-title">{{ book.title }}</span>
              <span class="series-read">Lido em: {{ book.read_in || 'Não informado' }}</span>
              <span class="book-stars" :aria-label="book.rate ? `Nota ${book.rate} de 5` : 'Sem avaliação'">{{ getStars(book.rate) }}</span>
              </span>
              <span class="book-arrow" aria-hidden="true">›</span>
            </button>
          </li>
        </ol>
      </section>
      </div>
    </template>
    <BookModal :book="selectedBook" @close="selectedBook = null" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useBooks } from '@/stores/books'
import { getStars } from '@/utils/helpers'
import { getAuthorNames } from '@/utils/authors'
import { getCover, generatePlaceholderCover } from '@/utils/covers'
import BookModal from '@/components/BookModal.vue'

const { books, isLoaded, loadError } = useBooks()
const selectedBook = ref(null)
const search = ref('')
const sortBy = ref('alpha')
const selectedSeries = ref(null)
const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
const filteredSeries = computed(() => {
  const query = normalize(search.value.trim())
  return series.value.filter(item => normalize([item.name, ...item.authors, ...item.books.map(book => book.title)].join(' ')).includes(query))
    .sort((a, b) => (sortBy.value === 'count' ? b.books.length - a.books.length : 0) || a.name.localeCompare(b.name, 'pt-BR'))
})
const collection = computed(() => filteredSeries.value.find(item => item.key === selectedSeries.value) || filteredSeries.value[0])
function coverError(event, book) {
  event.target.onerror = null
  const placeholder = generatePlaceholderCover(book)
  if (event.target.src !== placeholder) event.target.src = placeholder
}
const series = computed(() => {
  const collections = new Map()
  for (const book of books.value) {
    const name = book.series_name?.trim()
    if (!name) continue
    const key = name.toLocaleLowerCase('pt-BR')
    if (!collections.has(key)) collections.set(key, { key, name, books: [] })
    collections.get(key).books.push(book)
  }
  return [...collections.values()].map(collection => ({
    ...collection,
    authors: getAuthorNames(collection.books.flatMap(book => getAuthorNames(book.author))),
    books: [...collection.books].sort((a, b) => {
      const volumeA = String(a.series_number ?? '').trim()
      const volumeB = String(b.series_number ?? '').trim()
      if (!volumeA || !volumeB) return Number(!volumeA) - Number(!volumeB) || a.original_index - b.original_index
      return volumeA.localeCompare(volumeB, 'pt-BR', { numeric: true }) || a.original_index - b.original_index
    }),
  })).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
})
</script>

<style scoped>
.series-page { padding-top: 20px; }
.series-description { line-height: 1.6; margin: 8px 0 20px; color: var(--text-color); }
.series-toolbar { display: flex; gap: 16px; margin-bottom: 24px; }
.series-toolbar label { display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; color: var(--text-color); }
.series-search { flex: 1; min-width: 0; }
.series-toolbar input, .series-toolbar select {
  width: 100%; min-height: 44px; padding: 10px 12px; border-radius: 6px;
  border: 1px solid var(--border-subtle); background: var(--input-bg); color: #fff; font: inherit;
}
.series-layout { display: grid; grid-template-columns: 230px minmax(0, 1fr); gap: 24px; align-items: start; }
.series-index { position: sticky; top: 20px; max-height: calc(100vh - 40px); overflow-y: auto; padding: 4px; }
.index-caption { color: var(--text-color); font-size: 0.8rem; margin-bottom: 12px; }
.series-index-item {
  display: flex; flex-direction: column; gap: 6px; width: 100%; padding: 14px;
  margin-bottom: 6px; border: 1px solid transparent; border-radius: 8px;
  background: transparent; color: var(--text-color); text-align: left; font: inherit; cursor: pointer;
}
.series-index-item small { font-size: 0.75rem; color: var(--text-color); }
.series-index-item:hover { background: var(--hover-bg); }
.series-index-item.active { border-color: var(--highlight); background: var(--card-bg); color: #fff; }
.collection-heading { padding-bottom: 20px; border-bottom: 1px solid var(--border-subtle); }
.collection-eyebrow { font-size: 0.65rem; letter-spacing: 1.5px; color: var(--text-color); }
.collection-heading h3 { font-size: 1.65rem; margin-top: 8px; line-height: 1.25; }
.collection-count { display: inline-block; background: var(--input-bg); padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; }
.collection-hint { color: var(--text-color); font-size: 0.8rem; margin-top: 12px; }
.clear-search { background: transparent; border: 0; color: var(--highlight); text-decoration: underline; font: inherit; cursor: pointer; }
.series-collection {
  margin-bottom: 24px;
  padding: 24px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  min-width: 0;
}
.series-collection h3 { margin: 0; color: var(--highlight); }
.series-books { list-style: none; padding: 0; margin: 0; }
.series-books li + li { border-top: 1px solid var(--border-subtle); }
.series-book {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) 16px;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px 8px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--text-color);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.series-book:hover { background: var(--hover-bg); }
.series-page :is(button, input, select):focus-visible { outline: 2px solid var(--highlight); outline-offset: 2px; }
.series-cover { width: 64px; height: 96px; object-fit: cover; border-radius: 4px; background: var(--input-bg); }
.series-book-info { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.series-title { overflow-wrap: anywhere; color: #fff; font-weight: 600; }
.series-volume { color: var(--highlight); font-size: 0.75rem; }
.series-read { font-size: 0.8rem; }
.book-arrow { font-size: 1.5rem; color: var(--highlight); }
.book-stars { color: var(--star-color); }
@media (max-width: 700px) {
  .series-toolbar { flex-direction: column; }
  .series-layout { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .series-index { position: static; display: flex; flex-wrap: wrap; gap: 8px; max-height: 210px; }
  .index-caption { width: 100%; margin-bottom: 0; }
  .series-index-item { width: auto; max-width: 100%; padding: 10px 12px; margin: 0; flex: 1 1 140px; }
  .series-collection { padding: 16px; }
}
</style>
