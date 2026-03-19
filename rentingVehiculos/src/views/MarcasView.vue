<template>
  <div>
    <h2 class="page-title">Marcas</h2>

    <div v-if="cargando" class="loading">Cargando marcas...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>

    <div v-else class="marcas-layout">
      <div class="card marcas-list">
        <p class="seccion-hint">Ordenadas por precio medio (mayor a menor)</p>
        <ul class="item-list">
          <li
            v-for="marca in marcasOrdenadas"
            :key="marca.id"
            :class="{ active: marcaSeleccionada?.id === marca.id }"
            @click="seleccionarMarca(marca)"
          >
            <span class="marca-nombre">{{ marca.nombre }}</span>
            <span class="marca-precio">
              {{ marca.precioMedio !== null ? marca.precioMedio.toFixed(2) + ' €/día' : '—' }}
            </span>
          </li>
        </ul>
      </div>

      <div v-if="marcaSeleccionada" class="card modelos-detalle">
        <h3 class="detalle-titulo">Modelos en stock — {{ marcaSeleccionada.nombre }}</h3>
        <div v-if="!modelosMarca.length" style="color:var(--text-light);">
          No hay modelos en stock para esta marca.
        </div>
        <ul v-else class="item-list no-pointer">
          <li v-for="modelo in modelosMarca" :key="modelo.id">
            <span class="modelo-nombre">{{ modelo.modelo }}</span>
            <span class="modelo-precio">{{ modelo.precioDiaMedia.toFixed(2) }} €/día</span>
          </li>
        </ul>
      </div>

      <div v-else class="card modelos-detalle modelos-placeholder">
        <span>Selecciona una marca para ver sus modelos en stock.</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '../composables/useApi.js'

const { getAll } = useApi()

const cargando = ref(true)
const error = ref('')
const marcas = ref([])
const modelos = ref([])
const vehiculos = ref([])
const marcaSeleccionada = ref(null)

onMounted(async () => {
  try {
    ;[marcas.value, modelos.value, vehiculos.value] = await Promise.all([
      getAll('marcas'),
      getAll('modelos'),
      getAll('vehiculos')
    ])
  } catch {
    error.value = 'Error al cargar datos. ¿Está el servidor JSON encendido?'
  } finally {
    cargando.value = false
  }
})

const marcasOrdenadas = computed(() => {
  return marcas.value
    .map(marca => {
      const modelosDeMarca = modelos.value.filter(m => m.idMarca === marca.id)
      const idsModelos = modelosDeMarca.map(m => m.id)
      const vehiculosDeMarca = vehiculos.value.filter(v => idsModelos.includes(v.idModelo))
      const precioMedio = vehiculosDeMarca.length
        ? vehiculosDeMarca.reduce((sum, v) => sum + v.precioDia, 0) / vehiculosDeMarca.length
        : null
      return { ...marca, precioMedio }
    })
    .sort((a, b) => {
      if (a.precioMedio === null && b.precioMedio === null) return 0
      if (a.precioMedio === null) return 1
      if (b.precioMedio === null) return -1
      return b.precioMedio - a.precioMedio
    })
})

const modelosMarca = computed(() => {
  if (!marcaSeleccionada.value) return []
  return modelos.value
    .filter(m => m.idMarca === marcaSeleccionada.value.id)
    .map(modelo => {
      const vehiculosModelo = vehiculos.value.filter(v => v.idModelo === modelo.id)
      if (!vehiculosModelo.length) return null
      const precioDiaMedia = vehiculosModelo.reduce((s, v) => s + v.precioDia, 0) / vehiculosModelo.length
      return { ...modelo, precioDiaMedia }
    })
    .filter(Boolean)
})

function seleccionarMarca(marca) {
  marcaSeleccionada.value = marcaSeleccionada.value?.id === marca.id ? null : marca
}
</script>

<style scoped>
.marcas-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.marcas-list {
  min-width: 280px;
  flex: 0 0 280px;
}
.modelos-detalle {
  flex: 1;
}
.modelos-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: var(--text-light);
  font-style: italic;
}
.seccion-hint {
  font-size: 0.78rem;
  color: var(--text-light);
  margin-bottom: 12px;
}
.item-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.no-pointer li { cursor: default; }
.marca-nombre, .modelo-nombre { font-weight: 600; }
.marca-precio, .modelo-precio {
  font-size: 0.88rem;
  color: var(--accent);
  font-weight: 600;
}
.detalle-titulo {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 14px;
}
</style>
