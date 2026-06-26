<template>
  <div v-if="book" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
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
          <span>{{ book.author }}</span>
          <span>{{ book.country }}</span>
          <span>{{ book.pages }} pág.</span>

          <div v-if="book.genre && book.genre.length" style="margin-top: 8px">
            <span v-for="g in book.genre" :key="g" class="genre-tag">
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

defineProps({
  book: { type: Object, default: null },
})

defineEmits(['close'])
</script>
