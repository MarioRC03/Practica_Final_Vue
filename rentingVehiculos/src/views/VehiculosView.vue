<template>
  <div>
    <h2 class="page-title">Vehículos</h2>

    <div v-if="cargando" class="loading">Cargando...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>

    <template v-else>
      <div class="card" style="max-width:520px; margin-bottom:20px;">
        <div style="display:flex; gap:16px; align-items:flex-end; flex-wrap:wrap;">
          <div class="form-group" style="flex:1; min-width:180px; margin-bottom:0;">
            <label for="v-marca">Marca</label>
            <select id="v-marca" v-model="idMarcaFiltro" @change="onMarcaFiltroChange">
              <option value="">-- Todas las marcas --</option>
              <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
                {{ marca.nombre }}
              </option>
            </select>
          </div>
          <div class="form-group" style="flex:1; min-width:180px; margin-bottom:0;">
            <label for="v-modelo">Modelo</label>
            <select id="v-modelo" v-model="idModeloFiltro" :disabled="!idMarcaFiltro">
              <option value="">-- Todos los modelos --</option>
              <option v-for="modelo in modelosFiltro" :key="modelo.id" :value="modelo.id">
                {{ modelo.modelo }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="!vehiculosFiltrados.length" class="card">
        <p style="color:var(--text-light);">No hay vehículos que coincidan con los filtros.</p>
      </div>

      <div v-for="vehiculo in vehiculosFiltrados" :key="vehiculo.id" class="card vehiculo-card">
        <div class="vehiculo-header">
          <span class="vehiculo-modelo">{{ nombreModelo(vehiculo.idModelo) }}</span>
          <span class="vehiculo-precio">{{ vehiculo.precioDia }} €/día</span>
          <span class="vehiculo-detalle">{{ vehiculo.puertas }} puertas · Silla: {{ vehiculo.sillaInfantil ? 'Sí' : 'No' }}</span>
        </div>
        <div class="vehiculo-clientes">
          <span class="clientes-label">Clientes que lo han alquilado:</span>
          <span v-if="!clientesDeVehiculo(vehiculo.id).length" style="color:var(--text-light); font-size:0.88rem;">Ninguno</span>
          <ul v-else class="clientes-list">
            <li v-for="cliente in clientesDeVehiculo(vehiculo.id)" :key="cliente.id">
              {{ cliente.nombre }}
            </li>
          </ul>
        </div>
      </div>

      <div style="margin-top:8px;">
        <button class="btn btn-primary" @click="mostrarFormulario = !mostrarFormulario">
          {{ mostrarFormulario ? 'Cancelar' : '+ Nuevo Vehículo' }}
        </button>
      </div>

      <div v-if="mostrarFormulario" class="card" style="max-width:480px; margin-top:16px;">
        <h3 style="font-size:1rem; font-weight:700; color:var(--primary); margin-bottom:16px;">Nuevo Vehículo</h3>
        <NuevoVehiculo
          :marcaIdProp="idMarcaFiltro"
          :modeloIdProp="idModeloFiltro"
          @guardado="onVehiculoGuardado"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '../composables/useApi.js'
import NuevoVehiculo from '../components/NuevoVehiculo.vue'

const { getAll } = useApi()

const cargando = ref(true)
const error = ref('')
const marcas = ref([])
const modelos = ref([])
const vehiculos = ref([])
const clientes = ref([])
const idMarcaFiltro = ref('')
const idModeloFiltro = ref('')
const mostrarFormulario = ref(false)

onMounted(() => cargarDatos())

async function cargarDatos() {
  cargando.value = true
  try {
    ;[marcas.value, modelos.value, vehiculos.value, clientes.value] = await Promise.all([
      getAll('marcas'),
      getAll('modelos'),
      getAll('vehiculos'),
      getAll('clientes')
    ])
  } catch {
    error.value = 'Error al cargar datos. ¿Está el servidor JSON encendido?'
  } finally {
    cargando.value = false
  }
}

const modelosFiltro = computed(() =>
  modelos.value.filter(m => m.idMarca === idMarcaFiltro.value)
)

const vehiculosFiltrados = computed(() => {
  if (!idMarcaFiltro.value) return vehiculos.value
  const idsModelos = idModeloFiltro.value
    ? [idModeloFiltro.value]
    : modelosFiltro.value.map(m => m.id)
  return vehiculos.value.filter(v => idsModelos.includes(v.idModelo))
})

function onMarcaFiltroChange() {
  idModeloFiltro.value = ''
}

function nombreModelo(idModelo) {
  const modelo = modelos.value.find(m => m.id === idModelo)
  if (!modelo) return 'Desconocido'
  const marca = marcas.value.find(m => m.id === modelo.idMarca)
  return `${marca ? marca.nombre + ' ' : ''}${modelo.modelo}`
}

function clientesDeVehiculo(idVehiculo) {
  return clientes.value.filter(c =>
    c.alquileres?.some(a => a.idVehiculo === idVehiculo)
  )
}

async function onVehiculoGuardado() {
  mostrarFormulario.value = false
  await cargarDatos()
}
</script>

<style scoped>
.vehiculo-card {
  margin-bottom: 14px;
}
.vehiculo-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.vehiculo-modelo {
  font-weight: 700;
  font-size: 1rem;
  color: var(--primary);
}
.vehiculo-precio {
  color: var(--accent);
  font-weight: 700;
}
.vehiculo-detalle {
  font-size: 0.85rem;
  color: var(--text-light);
}
.vehiculo-clientes {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.clientes-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-light);
}
.clientes-list {
  list-style: none;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.clientes-list li {
  background: var(--bg);
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 0.82rem;
  color: var(--text);
}
</style>
