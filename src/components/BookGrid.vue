<template>
  <div class="grid">
    <BookCard
      v-for="book in books"
      :key="book.title"
      :book="book"
      @select="$emit('select', book)"
    />
  </div>
</template>

<script setup>
import BookCard from '@/components/BookCard.vue'

defineProps({
  books: { type: Array, required: true },
})

defineEmits(['select'])
</script>
