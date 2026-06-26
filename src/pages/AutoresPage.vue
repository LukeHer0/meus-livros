<template>
  <div>
    <div class="filter-bar">
      <div class="filter-container">
        <div class="filter-row">
          <div class="filter-group">
            <span class="sort-label">Ordenar:</span>
            <select v-model="sortBy">
              <option value="books_desc">Mais Livros</option>
              <option value="books_asc">Menos Livros</option>
              <option value="rating">Melhor Nota</option>
              <option value="pages">Mais Páginas</option>
              <option value="alpha">A-Z</option>
            </select>
          </div>
          <div class="filter-group">
            <span style="color: var(--text-color); font-size: 0.9rem">
              {{ sortedAuthors.length }} autores
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="authors-grid">
      <div
        v-for="author in sortedAuthors"
        :key="author.name"
        class="author-card"
        @click="toggleExpanded(author.name)"
      >
        <h3>{{ author.name }}</h3>
        <div class="author-country">{{ author.country }}</div>

        <div class="author-stats">
          <div class="stat">
            <span>{{ author.bookCount }}</span>
            <small>{{ author.bookCount === 1 ? 'Livro' : 'Livros' }}</small>
          </div>
          <div class="stat" v-if="author.averageRate">
            <span>{{ author.averageRate }}</span>
            <small>Nota média</small>
          </div>
          <div class="stat">
            <span>{{ author.totalPages.toLocaleString('pt-BR') }}</span>
            <small>Páginas</small>
          </div>
        </div>

        <div v-if="expandedAuthor === author.name" class="author-books-list">
          <h4>Livros lidos</h4>
          <div
            v-for="book in author.books"
            :key="book.title"
            class="author-book-item"
            @click.stop="selectedBook = book"
          >
            <span>{{ book.title }}</span>
            <span class="book-stars">{{ getStars(book.rate) }}</span>
          </div>
        </div>
      </div>
    </div>

    <BookModal :book="selectedBook" @close="selectedBook = null" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBooks } from '@/stores/books'
import { getStars } from '@/utils/helpers'
import BookModal from '@/components/BookModal.vue'

const { authors } = useBooks()

const sortBy = ref('books_desc')
const expandedAuthor = ref(null)
const selectedBook = ref(null)

function toggleExpanded(name) {
  expandedAuthor.value = expandedAuthor.value === name ? null : name
}

const sortedAuthors = computed(() => {
  const list = [...authors.value]
  return list.sort((a, b) => {
    if (sortBy.value === 'books_desc') return b.bookCount - a.bookCount
    if (sortBy.value === 'books_asc') return a.bookCount - b.bookCount
    if (sortBy.value === 'rating') return (b.averageRate || 0) - (a.averageRate || 0)
    if (sortBy.value === 'pages') return b.totalPages - a.totalPages
    if (sortBy.value === 'alpha') return a.name.localeCompare(b.name)
    return 0
  })
})
</script>
