<template>
  <div class="container">
    <AppHeader @open-map="showMapModal = true" />
    <router-view />
    <MapModal :visible="showMapModal" @close="showMapModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBooks } from '@/stores/books'
import AppHeader from '@/components/AppHeader.vue'
import MapModal from '@/components/MapModal.vue'

const { loadBooks } = useBooks()
const showMapModal = ref(false)

onMounted(() => {
  loadBooks()
  google.charts.load('current', { packages: ['geochart'] })
})
</script>
