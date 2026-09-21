import { computed, ref } from 'vue'
import { mapCountryName } from '@/utils/countries'

const comics = ref([])
const isLoaded = ref(false)
const loadError = ref('')
const totalPages = computed(() => comics.value.reduce((sum, comic) => sum + comic.pages, 0))
const averagePages = computed(() => comics.value.length ? Math.round(totalPages.value / comics.value.length) : 0)

async function loadComics() {
  if (isLoaded.value) return
  loadError.value = ''
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}quadrinhos.json`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!Array.isArray(data) || data.some(item => !item || typeof item.title !== 'string' || !item.title.trim())) {
      throw new Error('Use uma lista de quadrinhos com título preenchido.')
    }
    comics.value = data.map((comic, index) => ({
      ...comic,
      original_index: index,
      pages: Number.isFinite(Number(comic.pages)) ? Math.max(0, Number(comic.pages)) : 0,
      country: mapCountryName(comic.country),
      genre: Array.isArray(comic.genre) ? comic.genre : [],
    }))
    isLoaded.value = true
  } catch (error) {
    console.error('Não foi possível carregar os quadrinhos:', error)
    loadError.value = 'Não foi possível carregar os quadrinhos. Confira o arquivo quadrinhos.json e tente novamente.'
  }
}

export function useComics() {
  return { comics, isLoaded, loadError, loadComics, totalPages, averagePages }
}
