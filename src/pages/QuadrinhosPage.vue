<template>
  <div class="comics-page">
    <h2>Quadrinhos</h2>
    <p class="comics-intro">Suas HQs, mangás e graphic novels, com páginas contabilizadas separadamente dos livros.</p>
    <p v-if="loadError" role="alert">{{ loadError }} <button @click="loadComics">Tentar novamente</button></p>
    <p v-else-if="!isLoaded" role="status">Carregando quadrinhos…</p>
    <template v-else>
      <div class="comics-stats">
        <div class="stat-box"><span>{{ comics.length }}</span><small>Quadrinhos</small></div>
        <div class="stat-box"><span>{{ readThisYear }}</span><small>Em {{ currentYear }}</small></div>
        <div class="stat-box"><span>{{ totalPages.toLocaleString('pt-BR') }}</span><small>Páginas lidas</small></div>
        <div class="stat-box"><span>{{ averagePages }}</span><small>Média de páginas</small></div>
      </div>
      <p v-if="!comics.length" class="comics-empty">Nenhum quadrinho cadastrado ainda.</p>
      <template v-else>
        <div class="comics-controls">
          <label>Buscar quadrinhos<input v-model="search" type="search" placeholder="Título, autor, artista ou série" /></label>
          <label>Ordenar<select v-model="sortBy"><option value="recent">Lidos recentemente</option><option value="alpha">Título (A–Z)</option><option value="pages">Mais páginas</option></select></label>
        </div>
        <p class="comics-intro" role="status">{{ filteredComics.length }} de {{ comics.length }} quadrinhos</p>
        <div class="comics-grid">
          <button v-for="comic in filteredComics" :key="comic.original_index" class="comic-card" @click="selectedComic = comic">
            <img :src="getCover(comic)" alt="" loading="lazy" @error="coverError($event, comic)" />
            <strong>{{ comic.title }}</strong>
            <span v-if="comic.series_name">{{ comic.series_name }}{{ comic.series_number ? ` · Vol. ${comic.series_number}` : '' }}</span>
            <span>{{ comic.pages }} pág. · {{ comic.read_in || 'Ano não informado' }}</span>
          </button>
        </div>
        <p v-if="!filteredComics.length">Nenhum quadrinho encontrado.</p>
      </template>
    </template>
    <BookModal :book="selectedComic" collection="comics" @close="selectedComic = null" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useComics } from '@/stores/comics'
import { getCover, generatePlaceholderCover } from '@/utils/covers'
import BookModal from '@/components/BookModal.vue'

const { comics, isLoaded, loadError, loadComics, totalPages, averagePages } = useComics()
const selectedComic = ref(null)
const search = ref('')
const sortBy = ref('recent')
const currentYear = new Date().getFullYear()
const readThisYear = computed(() => comics.value.filter(comic => Number(comic.read_in) === currentYear).length)
const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const filteredComics = computed(() => comics.value.filter(comic => normalize([comic.title, comic.author, comic.artist, comic.series_name].join(' ')).includes(normalize(search.value.trim())))
  .sort((a, b) => {
    if (sortBy.value === 'alpha') return a.title.localeCompare(b.title, 'pt-BR')
    if (sortBy.value === 'pages') return b.pages - a.pages || b.original_index - a.original_index
    return (Number(b.read_in) || 0) - (Number(a.read_in) || 0) || b.original_index - a.original_index
  }))
function coverError(event, comic) {
  const fallback = generatePlaceholderCover(comic)
  if (event.target.src !== fallback) event.target.src = fallback
}
onMounted(loadComics)
</script>

<style scoped>
.comics-page { padding-top: 20px; }
.comics-intro { color: var(--text-color); margin: 12px 0 24px; }
.comics-stats { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 28px; }
.comics-empty { padding: 32px; text-align: center; border: 1px dashed var(--border-subtle); border-radius: 8px; color: var(--text-color); }
.comics-controls { display: flex; flex-wrap: wrap; gap: 16px; }
.comics-controls label { display: flex; flex-direction: column; gap: 8px; flex: 1 1 220px; color: var(--text-color); }
.comics-controls input, .comics-controls select { padding: 12px; width: 100%; background: var(--input-bg); color: #fff; border: 1px solid var(--border-subtle); border-radius: 6px; font: inherit; }
.comics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 20px; }
.comic-card { display: flex; flex-direction: column; gap: 8px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; color: #fff; font: inherit; text-align: left; cursor: pointer; }
.comic-card img { width: 100%; aspect-ratio: 2 / 3; object-fit: cover; border-radius: 4px; }
.comic-card span { color: var(--text-color); font-size: 0.8rem; }
.comic-card strong { overflow-wrap: anywhere; }
.comic-card:hover { border-color: var(--highlight); }
.comics-page :is(button, input, select):focus-visible { outline: 2px solid var(--highlight); outline-offset: 3px; }
</style>
