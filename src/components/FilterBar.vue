<template>
  <div class="filter-bar">
    <div class="filter-container">
      <div class="filter-row">
        <div class="filter-group">
          <select v-model="filterGenre">
            <option value="">Todos os Gêneros</option>
            <option v-for="g in availableGenres" :key="g" :value="g">{{ g }}</option>
          </select>

          <select v-model="filterCountry">
            <option value="">Todos os Países</option>
            <option v-if="filterCountry && !availableCountries.includes(filterCountry)" :value="filterCountry">{{ mapCountryName(filterCountry) }} (mapa)</option>
            <option v-for="c in availableCountries" :key="c" :value="c">{{ c }}</option>
          </select>

          <select v-model="filterDecade">
            <option value="">Todas as Décadas</option>
            <option v-for="d in availableDecades" :key="d" :value="d">Anos {{ d }}</option>
          </select>
          <select v-model="filterPublisher" aria-label="Filtrar por editora">
            <option value="">Todas as Editoras</option>
            <option v-for="publisher in availablePublishers" :key="publisher" :value="publisher">{{ publisher }}</option>
          </select>
        </div>

        <div class="filter-group">
          <span class="sort-label">Ordenar:</span>
          <select v-model="sortBy">
            <option value="read_desc">Lidos Recentemente</option>
            <option value="read_asc">Lidos Antigamente</option>
            <option value="rating">Melhores Notas</option>
            <option value="year_desc">Publicação (Novo)</option>
            <option value="year_asc">Publicação (Velho)</option>
            <option value="pages_desc">Mais Páginas</option>
            <option value="pages_asc">Menos Páginas</option>
            <option value="alpha">A-Z</option>
          </select>

          <button v-if="hasActiveFilters" @click="resetFilters" class="reset-btn">
            Limpar &times;
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBooks } from '@/stores/books'
import { mapCountryName } from '@/utils/countries'

const {
  filterGenre,
  filterCountry,
  filterDecade,
  filterPublisher,
  availablePublishers,
  sortBy,
  availableGenres,
  availableCountries,
  availableDecades,
  hasActiveFilters,
  resetFilters,
} = useBooks()
</script>
