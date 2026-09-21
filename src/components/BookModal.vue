<template>
  <div v-if="book" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content book-modal">
      <span class="close-btn" @click="$emit('close')">&times;</span>
      <div class="modal-poster">
        <img
          :src="getCover(book)"
          @error="$event.target.src = generatePlaceholderCover(book)"
        />
      </div>
      <div class="modal-details">
        <h2>{{ book.title }}</h2>
        <div class="stars" style="font-size: 1.2rem; margin-bottom: 10px">
          {{ getStars(book.rate) }}
        </div>
        <div class="modal-meta">
          <span>{{ book.year }}</span>
          <span>{{ formatAuthors(book.author) }}</span>
          <span v-if="book.artist">Arte: {{ book.artist }}</span>
          <span v-if="book.format">{{ book.format }}</span>
          <span>{{ book.country }}</span>
          <span>{{ book.pages }} pág.</span>
          <span>Lido em: {{ book.read_in || 'Não informado' }}</span>

          <div v-if="book.genre && book.genre.length" style="margin-top: 8px">
            <span v-for="g in book.genre" :key="g" class="genre-tag" style="color: black">
              {{ g }}
            </span>
          </div>
        </div>
        <div class="review-box">
          <h3>Minha Resenha</h3>
          <p v-if="book.review" style="white-space: pre-wrap" v-html="book.review"></p>
          <div v-else class="review-placeholder">
            Nenhuma resenha escrita.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCover, generatePlaceholderCover } from '@/utils/covers'
import { getStars } from '@/utils/helpers'
import { formatAuthors } from '@/utils/authors'

defineProps({
  book: { type: Object, default: null },
})

defineEmits(['close'])
</script>

<style scoped>
.book-modal {
  max-width: 1100px;
  max-height: 92vh;
  padding: 40px;
  gap: 40px;
  overflow-y: auto;
}

.book-modal .modal-poster {
  width: 300px;
}

.book-modal .modal-details {
  min-width: 0;
  overflow: visible;
  overflow-wrap: anywhere;
}

.book-modal .modal-details h2 {
  padding-right: 20px;
}

.book-modal .review-box {
  max-height: none;
  overflow: visible;
}

@media (max-width: 800px) {
  .book-modal {
    flex-direction: column;
    padding: 24px;
    gap: 24px;
  }

  .book-modal .modal-poster {
    width: 180px;
    max-width: 100%;
    margin: 0 auto;
  }
}
</style>
