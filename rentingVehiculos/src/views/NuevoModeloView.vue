<template>
  <div>
    <h2 class="page-title">Nuevo Modelo</h2>

    <div class="card" style="max-width: 480px;">
      <div v-if="mensaje.texto" :class="['alert', mensaje.tipo === 'ok' ? 'alert-success' : 'alert-error']">
        {{ mensaje.texto }}
      </div>

      <div v-if="cargando" class="loading">Cargando marcas...</div>

      <template v-else>
        <div class="form-group">
          <label for="marca">Marca *</label>
          <select id="marca" v-model="form.idMarca">
            <option value="">-- Selecciona una marca --</option>
            <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
              {{ marca.nombre }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="modelo">Nombre del modelo *</label>
          <input
            id="modelo"
            v-model.trim="form.modelo"
            type="text"
            placeholder="Ej: Serie 3"
          />
        </div>

        <div class="form-group">
          <label for="extra">
            Extra por modelo (€/día)
            <span style="color:var(--text-light); font-weight:400;">(opcional)</span>
          </label>
          <input
            id="extra"
            v-model.number="form.extraPorModelo"
            type="number"
            placeholder="Ej: 15"
            min="0"
          />
        </div>

        <div style="display:flex; gap:12px; margin-top:8px;">
          <button class="btn btn-primary" @click="guardar" :disabled="guardando">
            {{ guardando ? 'Guardando...' : 'Guardar modelo' }}
          </button>
          <button class="btn btn-secondary" @click="limpiar">Limpiar</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/useApi.js'

const { getAll, post } = useApi()

const cargando = ref(true)
const guardando = ref(false)
const marcas = ref([])
const mensaje = ref({ texto: '', tipo: '' })

const form = ref({
  idMarca: '',
  modelo: '',
  extraPorModelo: ''
})

onMounted(async () => {
  try {
    marcas.value = await getAll('marcas')
  } catch (e) {
    mensaje.value = { texto: 'Error al cargar marcas. ¿Está el servidor JSON encendido?', tipo: 'error' }
  } finally {
    cargando.value = false
  }
})

function limpiar() {
  form.value = { idMarca: '', modelo: '', extraPorModelo: '' }
  mensaje.value = { texto: '', tipo: '' }
}

async function guardar() {
  mensaje.value = { texto: '', tipo: '' }

  if (!form.value.idMarca || !form.value.modelo.trim()) {
    mensaje.value = { texto: 'La marca y el nombre del modelo son obligatorios.', tipo: 'error' }
    return
  }

  guardando.value = true
  try {
    const modelos = await getAll('modelos')

    const duplicado = modelos.find(
      m => m.idMarca === form.value.idMarca &&
           m.modelo.toLowerCase() === form.value.modelo.toLowerCase()
    )
    if (duplicado) {
      mensaje.value = { texto: 'Ya existe ese modelo para la marca seleccionada.', tipo: 'error' }
      return
    }

    const nextId = String(modelos.length > 0 ? Math.max(...modelos.map(m => Number(m.id))) + 1 : 1)

    const nuevoModelo = {
      id: nextId,
      idMarca: form.value.idMarca,
      modelo: form.value.modelo,
      extraPorModelo: form.value.extraPorModelo !== '' ? Number(form.value.extraPorModelo) : 0
    }

    await post('modelos', nuevoModelo)

    const marcaNombre = marcas.value.find(m => m.id === form.value.idMarca)?.nombre || ''
    mensaje.value = { texto: `Modelo "${form.value.modelo}" (${marcaNombre}) creado con éxito.`, tipo: 'ok' }
    limpiar()
    mensaje.value = { texto: `Modelo creado con éxito.`, tipo: 'ok' }
  } catch (e) {
    mensaje.value = { texto: 'Error al guardar. ¿Está el servidor JSON encendido?', tipo: 'error' }
  } finally {
    guardando.value = false
  }
}
</script>
