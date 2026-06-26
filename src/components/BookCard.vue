<template>
  <div class="card" @click="$emit('select', book)">
    <div class="poster">
      <img
        :src="getCover(book)"
        loading="lazy"
        @error="$event.target.src = generatePlaceholderCover(book)"
      />
    </div>
    <div class="info">
      <div class="stars">{{ getStars(book.rate) }}</div>
    </div>
  </div>
</template>

<script setup>
import { getCover, generatePlaceholderCover } from '@/utils/covers'
import { getStars } from '@/utils/helpers'

defineProps({
  book: { type: Object, required: true },
})

defineEmits(['select'])
</script>
