<template>
  <header>
    <h1>Minha Biblioteca</h1>
    <div class="stats">
      <div class="stat-box">
        <span>{{ totalBooks }}</span>
        <small>Livros</small>
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
      <router-link to="/estatisticas">📊 Estatísticas</router-link>
    </nav>
  </header>
</template>

<script setup>
import { useBooks } from '@/stores/books'

const { totalBooks, uniqueAuthors, uniqueCountries } = useBooks()

defineEmits(['open-map'])
</script>
