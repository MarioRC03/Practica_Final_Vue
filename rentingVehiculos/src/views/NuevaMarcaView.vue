<template>
  <div>
    <h2 class="page-title">Nueva Marca</h2>

    <div class="card" style="max-width: 480px;">
      <div v-if="mensaje.texto" :class="['alert', mensaje.tipo === 'ok' ? 'alert-success' : 'alert-error']">
        {{ mensaje.texto }}
      </div>

      <div class="form-group">
        <label for="nombre">Nombre *</label>
        <input
          id="nombre"
          v-model.trim="form.nombre"
          type="text"
          placeholder="Ej: BMW"
        />
      </div>

      <div class="form-group">
        <label for="anio">Año de fundación *</label>
        <input
          id="anio"
          v-model.number="form.anioFundacion"
          type="number"
          placeholder="Ej: 1916"
          min="1800"
          :max="anioActual"
        />
      </div>

      <div class="form-group">
        <label for="origen">País de origen *</label>
        <input
          id="origen"
          v-model.trim="form.origen"
          type="text"
          placeholder="Ej: Alemania"
        />
      </div>

      <div style="display:flex; gap:12px; margin-top:8px;">
        <button class="btn btn-primary" @click="guardar" :disabled="guardando">
          {{ guardando ? 'Guardando...' : 'Guardar marca' }}
        </button>
        <button class="btn btn-secondary" @click="limpiar">Limpiar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useApi } from '../composables/useApi.js'

const { getAll, post } = useApi()

const anioActual = new Date().getFullYear()
const guardando = ref(false)
const mensaje = ref({ texto: '', tipo: '' })

const form = ref({
  nombre: '',
  anioFundacion: '',
  origen: ''
})

function limpiar() {
  form.value = { nombre: '', anioFundacion: '', origen: '' }
  mensaje.value = { texto: '', tipo: '' }
}

async function guardar() {
  mensaje.value = { texto: '', tipo: '' }

  if (!form.value.nombre || !form.value.anioFundacion || !form.value.origen) {
    mensaje.value = { texto: 'Todos los campos son obligatorios.', tipo: 'error' }
    return
  }
  if (form.value.anioFundacion < 1800 || form.value.anioFundacion > anioActual) {
    mensaje.value = { texto: `El año debe estar entre 1800 y ${anioActual}.`, tipo: 'error' }
    return
  }

  guardando.value = true
  try {
    const marcas = await getAll('marcas')
    const duplicado = marcas.find(
      m => m.nombre.toLowerCase() === form.value.nombre.toLowerCase()
    )
    if (duplicado) {
      mensaje.value = { texto: 'Ya existe una marca con ese nombre.', tipo: 'error' }
      return
    }

    const nextId = String(marcas.length > 0 ? Math.max(...marcas.map(m => Number(m.id))) + 1 : 1)

    await post('marcas', {
      id: nextId,
      nombre: form.value.nombre,
      origen: form.value.origen,
      anioFundacion: form.value.anioFundacion
    })

    mensaje.value = { texto: `Marca "${form.value.nombre}" creada con éxito.`, tipo: 'ok' }
    limpiar()
    mensaje.value = { texto: `Marca creada con éxito.`, tipo: 'ok' }
  } catch (e) {
    mensaje.value = { texto: 'Error al guardar. ¿Está el servidor JSON encendido?', tipo: 'error' }
  } finally {
    guardando.value = false
  }
}
</script>
