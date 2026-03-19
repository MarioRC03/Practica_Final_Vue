<template>
  <div>
    <div v-if="mensaje.texto" :class="['alert', mensaje.tipo === 'ok' ? 'alert-success' : 'alert-error']">
      {{ mensaje.texto }}
    </div>

    <div v-if="cargando" class="loading">Cargando datos...</div>

    <template v-else>
      <div class="form-group">
        <label for="nv-marca">Marca *</label>
        <select id="nv-marca" v-model="form.idMarca" :disabled="!!marcaIdProp" @change="onMarcaChange">
          <option value="">-- Selecciona una marca --</option>
          <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
            {{ marca.nombre }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="nv-modelo">Modelo *</label>
        <select id="nv-modelo" v-model="form.idModelo" :disabled="!!modeloIdProp || !form.idMarca">
          <option value="">-- Selecciona un modelo --</option>
          <option v-for="modelo in modelosFiltrados" :key="modelo.id" :value="modelo.id">
            {{ modelo.modelo }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="nv-precio">Precio por día (€) *</label>
        <input id="nv-precio" type="number" min="0" v-model.number="form.precioDia" placeholder="Ej: 80" />
      </div>

      <div class="form-group">
        <label for="nv-puertas">Número de puertas *</label>
        <input id="nv-puertas" type="number" min="2" max="5" v-model.number="form.puertas" placeholder="Ej: 4" />
      </div>

      <div class="form-group">
        <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-weight:600;">
          <input type="checkbox" v-model="form.sillaInfantil" style="width:auto; padding:0;" />
          Silla infantil incluida
        </label>
      </div>

      <div style="display:flex; gap:12px; margin-top:8px;">
        <button class="btn btn-primary" @click="guardar" :disabled="guardando">
          {{ guardando ? 'Guardando...' : 'Guardar vehículo' }}
        </button>
        <button class="btn btn-secondary" @click="limpiar">Limpiar</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useApi } from '../composables/useApi.js'

const props = defineProps({
  marcaIdProp: { type: String, default: '' },
  modeloIdProp: { type: String, default: '' }
})

const emit = defineEmits(['guardado'])

const { getAll, post } = useApi()

const cargando = ref(true)
const guardando = ref(false)
const mensaje = ref({ texto: '', tipo: '' })
const marcas = ref([])
const modelos = ref([])

const form = ref({
  idMarca: '',
  idModelo: '',
  precioDia: '',
  puertas: '',
  sillaInfantil: false
})

onMounted(async () => {
  try {
    ;[marcas.value, modelos.value] = await Promise.all([
      getAll('marcas'),
      getAll('modelos')
    ])
    if (props.marcaIdProp) form.value.idMarca = props.marcaIdProp
    if (props.modeloIdProp) form.value.idModelo = props.modeloIdProp
  } catch {
    mensaje.value = { texto: 'Error al cargar datos.', tipo: 'error' }
  } finally {
    cargando.value = false
  }
})

const modelosFiltrados = computed(() =>
  modelos.value.filter(m => m.idMarca === form.value.idMarca)
)

function onMarcaChange() {
  if (!props.modeloIdProp) form.value.idModelo = ''
}

function limpiar() {
  form.value = {
    idMarca: props.marcaIdProp || '',
    idModelo: props.modeloIdProp || '',
    precioDia: '',
    puertas: '',
    sillaInfantil: false
  }
  mensaje.value = { texto: '', tipo: '' }
}

async function guardar() {
  mensaje.value = { texto: '', tipo: '' }
  if (!form.value.idMarca || !form.value.idModelo || form.value.precioDia === '' || form.value.puertas === '') {
    mensaje.value = { texto: 'Todos los campos son obligatorios.', tipo: 'error' }
    return
  }
  guardando.value = true
  try {
    const vehiculos = await getAll('vehiculos')
    const nextId = String(vehiculos.length > 0 ? Math.max(...vehiculos.map(v => Number(v.id))) + 1 : 1)
    await post('vehiculos', {
      id: nextId,
      idModelo: form.value.idModelo,
      precioDia: Number(form.value.precioDia),
      puertas: Number(form.value.puertas),
      sillaInfantil: form.value.sillaInfantil
    })
    mensaje.value = { texto: 'Vehículo dado de alta con éxito.', tipo: 'ok' }
    emit('guardado')
    limpiar()
    mensaje.value = { texto: 'Vehículo dado de alta con éxito.', tipo: 'ok' }
  } catch {
    mensaje.value = { texto: 'Error al guardar. ¿Está el servidor JSON encendido?', tipo: 'error' }
  } finally {
    guardando.value = false
  }
}
</script>
