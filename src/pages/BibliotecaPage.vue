<template>
  <div>
    <FilterBar />

    <BookGrid :books="sortedBooks" @select="selectedBook = $event" />

    <BookModal :book="selectedBook" @close="selectedBook = null" />

    <MapModal :visible="showMapModal" @close="showMapModal = false" />

    <PageFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBooks } from '@/stores/books'
import FilterBar from '@/components/FilterBar.vue'
import BookGrid from '@/components/BookGrid.vue'
import BookModal from '@/components/BookModal.vue'
import MapModal from '@/components/MapModal.vue'
import PageFooter from '@/components/PageFooter.vue'

const { sortedBooks } = useBooks()

const selectedBook = ref(null)
const showMapModal = ref(false)

// Expor showMapModal para o App.vue via provide/inject ou evento
defineExpose({ showMapModal })
</script>
