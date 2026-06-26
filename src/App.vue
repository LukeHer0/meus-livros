<template>
  <div class="container">
    <AppHeader @open-map="openMap" />
    <router-view ref="pageRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBooks } from '@/stores/books'
import AppHeader from '@/components/AppHeader.vue'

const { loadBooks } = useBooks()
const pageRef = ref(null)

onMounted(() => {
  loadBooks()

  // Carregar Google Charts
  google.charts.load('current', { packages: ['geochart'] })
})

function openMap() {
  // Se a página atual é a Biblioteca, abre o mapa dela
  if (pageRef.value?.showMapModal !== undefined) {
    pageRef.value.showMapModal = true
  }
}
</script>
