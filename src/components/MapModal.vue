<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content" style="display: block; max-width: 900px">
      <span class="close-btn" @click="$emit('close')">&times;</span>
      <h2 style="text-align: center; margin-bottom: 10px">Mapa de Leitura</h2>
      <p style="text-align: center; color: var(--text-color); margin-bottom: 20px">
        Clique em um país para filtrar os livros.
      </p>
      <div class="map-container" id="google_map_div">
        <div v-if="loading" style="color: #ccc">Carregando Mapa...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, nextTick, onMounted, ref } from 'vue'
import { useBooks } from '@/stores/books'

const props = defineProps({
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const { chartData, filterCountry } = useBooks()

const loading = ref(false)
const chartsLoaded = ref(false)

onMounted(() => {
  const charts = window.google?.charts
  if (!charts) return

  charts.load('current', { packages: ['geochart'] })
  charts.setOnLoadCallback(() => {
    chartsLoaded.value = true
  })
})

watch(
  () => props.visible,
  async (isVisible) => {
    if (!isVisible) return
    loading.value = true

    const charts = window.google?.charts
    if (!charts) {
      loading.value = false
      return
    }

    if (chartsLoaded.value) {
      nextTick(() => {
        drawRegionsMap()
        loading.value = false
      })
    } else {
      charts.load('current', { packages: ['geochart'] })
      charts.setOnLoadCallback(() => {
        chartsLoaded.value = true
        nextTick(() => {
          drawRegionsMap()
          loading.value = false
        })
      })
    }
  }
)

function drawRegionsMap() {
  const data = google.visualization.arrayToDataTable(chartData.value)

  const options = {
    backgroundColor: '#232a31',
    datalessRegionColor: '#2c3440',
    colorAxis: { colors: ['#40bcf4', '#0083e0'] },
    legend: 'none',
    tooltip: {
      textStyle: { color: '#000' },
      showColorCode: true,
    },
    defaultColor: '#2c3440',
  }

  const chart = new google.visualization.GeoChart(
    document.getElementById('google_map_div')
  )

  google.visualization.events.addListener(chart, 'select', () => {
    const selection = chart.getSelection()
    if (selection.length > 0) {
      const countryName = data.getValue(selection[0].row, 0)
      filterCountry.value = countryName
      emit('close')
    }
  })

  chart.draw(data, options)
}
</script>
