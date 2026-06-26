<template>
  <footer class="paginometer">
    <div class="page-stat">
      <strong>{{ totalPages.toLocaleString('pt-BR') }}</strong> Páginas Lidas
    </div>
    <div class="page-stat">
      <strong>{{ averagePages }}</strong> Média p/ Livro
    </div>
  </footer>
</template>

<script setup>
import { useBooks } from '@/stores/books'

const { totalPages, averagePages } = useBooks()
</script>
