<template>
  <div>
    <h2 class="page-title">Modelos</h2>

    <div class="card" style="max-width:520px; margin-bottom:20px;">
      <div v-if="cargando" class="loading">Cargando marcas...</div>
      <div v-else-if="error" class="alert alert-error">{{ error }}</div>
      <div v-else class="form-group" style="margin-bottom:0;">
        <label for="marcaSelect">Selecciona una marca</label>
        <select id="marcaSelect" v-model="idMarcaSeleccionada">
          <option value="">-- Selecciona una marca --</option>
          <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
            {{ marca.nombre }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="idMarcaSeleccionada" class="card">
      <div v-if="cargandoModelos" class="loading">Cargando modelos...</div>
      <div v-else-if="!modelosMarca.length" style="color:var(--text-light);">
        No hay modelos para esta marca.
      </div>
      <table v-else class="tabla-modelos">
        <thead>
          <tr>
            <th>Modelo</th>
            <th>Precio medio/día</th>
            <th>Extra/día</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="modelo in modelosMarca" :key="modelo.id">
            <td>{{ modelo.modelo }}</td>
            <td>{{ modelo.precioMedio !== null ? modelo.precioMedio.toFixed(2) + ' €' : '—' }}</td>
            <td>
              <span v-if="modelo.extraPorModelo && modelo.extraPorModelo > 0">
                {{ modelo.extraPorModelo }} €
              </span>
              <div v-else class="extra-form">
                <input
                  type="number"
                  min="0"
                  v-model.number="modelo.extraInput"
                  placeholder="0"
                  style="width:80px; padding:5px 8px; border:1.5px solid var(--border); border-radius:6px;"
                />
                <button
                  class="btn btn-primary"
                  style="padding:5px 12px; font-size:0.82rem;"
                  :disabled="guardandoExtra === modelo.id"
                  @click="guardarExtra(modelo)"
                >
                  {{ guardandoExtra === modelo.id ? '...' : 'Guardar' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useApi } from '../composables/useApi.js'

const { getAll, patch } = useApi()

const cargando = ref(true)
const cargandoModelos = ref(false)
const error = ref('')
const marcas = ref([])
const idMarcaSeleccionada = ref('')
const modelosMarca = ref([])
const vehiculos = ref([])
const guardandoExtra = ref(null)

onMounted(async () => {
  try {
    ;[marcas.value, vehiculos.value] = await Promise.all([
      getAll('marcas'),
      getAll('vehiculos')
    ])
  } catch {
    error.value = 'Error al cargar datos. ¿Está el servidor JSON encendido?'
  } finally {
    cargando.value = false
  }
})

watch(idMarcaSeleccionada, async (idMarca) => {
  if (!idMarca) { modelosMarca.value = []; return }
  cargandoModelos.value = true
  try {
    const todosModelos = await getAll('modelos')
    modelosMarca.value = todosModelos
      .filter(m => m.idMarca === idMarca)
      .map(m => {
        const vehiculosModelo = vehiculos.value.filter(v => v.idModelo === m.id)
        const precioMedio = vehiculosModelo.length
          ? vehiculosModelo.reduce((s, v) => s + v.precioDia, 0) / vehiculosModelo.length
          : null
        return { ...m, precioMedio, extraInput: 0 }
      })
  } catch {
    error.value = 'Error al cargar modelos.'
  } finally {
    cargandoModelos.value = false
  }
})

async function guardarExtra(modelo) {
  if (!modelo.extraInput || modelo.extraInput <= 0) return
  guardandoExtra.value = modelo.id
  try {
    await patch('modelos', modelo.id, { extraPorModelo: modelo.extraInput })
    modelo.extraPorModelo = modelo.extraInput
  } catch {
    error.value = 'Error al actualizar el extra.'
  } finally {
    guardandoExtra.value = null
  }
}
</script>

<style scoped>
.tabla-modelos {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}
.tabla-modelos th {
  text-align: left;
  padding: 10px 14px;
  background: var(--bg);
  color: var(--text-light);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tabla-modelos td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
}
.tabla-modelos tr:last-child td { border-bottom: none; }
.extra-form {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
