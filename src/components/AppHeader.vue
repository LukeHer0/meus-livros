<template>
  <header>
    <h1>Minha Biblioteca</h1>
    <div class="stats">
      <div class="stat-box">
        <span>{{ totalBooks }}</span>
        <small>Livros</small>
      </div>
      <div class="stat-box" :title="`Livros lidos em ${currentYear}`">
        <span>{{ booksReadThisYear }}</span>
        <small>Em {{ currentYear }}</small>
      </div>
      <div class="stat-box">
        <span>{{ uniqueAuthors }}</span>
        <small>Autores</small>
      </div>
      <div class="stat-box interactive" @click="$emit('open-map')" title="Ver Mapa Mundi">
        <span>{{ uniqueCountries }}</span>
        <small>Países</small>
      </div>
    </div>
    <nav class="nav-links">
      <router-link to="/">📚 Biblioteca</router-link>
      <router-link to="/autores">✍️ Autores</router-link>
      <router-link to="/series">📚 Séries</router-link>
      <router-link to="/estatisticas">📊 Estatísticas</router-link>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useBooks } from '@/stores/books'

const { books, totalBooks, uniqueAuthors, uniqueCountries } = useBooks()
const currentYear = new Date().getFullYear()
const booksReadThisYear = computed(() =>
  books.value.filter(book => Number(book.read_in) === currentYear).length
)

defineEmits(['open-map'])
</script>

<style scoped>
@media (max-width: 400px) {
  .stats { gap: 16px; }
}
</style>
