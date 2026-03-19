<template>
  <div>
    <h2 class="page-title">Alquiler de Vehículos</h2>

    <div v-if="cargando" class="loading">Cargando...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>

    <template v-else>
      <div class="card" style="max-width:540px; margin-bottom:20px;">
        <h3 class="paso-titulo">1. Selecciona marca y modelo</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; align-items:flex-end;">
          <div class="form-group" style="flex:1; min-width:180px; margin-bottom:0;">
            <label for="al-marca">Marca</label>
            <select id="al-marca" v-model="idMarcaSel" @change="onMarcaChange">
              <option value="">-- Selecciona --</option>
              <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
                {{ marca.nombre }}
              </option>
            </select>
          </div>
          <div class="form-group" style="flex:1; min-width:180px; margin-bottom:0;">
            <label for="al-modelo">Modelo</label>
            <select id="al-modelo" v-model="idModeloSel" :disabled="!idMarcaSel">
              <option value="">-- Selecciona --</option>
              <option v-for="modelo in modelosFiltrados" :key="modelo.id" :value="modelo.id">
                {{ modelo.modelo }}
              </option>
            </select>
          </div>
          <button
            class="btn btn-primary"
            :disabled="!idMarcaSel || !idModeloSel"
            @click="buscarVehiculos"
            style="margin-bottom:0;"
          >
            Buscar
          </button>
        </div>
      </div>

  
      <div v-if="mostrarFormulario" class="card" style="max-width:540px;">
        <h3 class="paso-titulo">2. Datos del alquiler</h3>

        <div v-if="mensajeForm.texto" :class="['alert', mensajeForm.tipo === 'ok' ? 'alert-success' : 'alert-error']">
          {{ mensajeForm.texto }}
        </div>

        <div class="form-group">
          <label for="al-vehiculo">Vehículo *</label>
          <select id="al-vehiculo" v-model="form.idVehiculo">
            <option value="">-- Selecciona un vehículo --</option>
            <option v-for="v in vehiculosDisponibles" :key="v.id" :value="v.id">
              {{ marcaModeloDeVehiculo(v) }} — {{ v.precioDia }} €/día
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="al-cliente">Cliente *</label>
          <select id="al-cliente" v-model="form.idCliente">
            <option value="">-- Selecciona un cliente --</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
              {{ cliente.nombre }} ({{ cliente.dni }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="al-dias">Número de días *</label>
          <input id="al-dias" type="number" min="1" v-model.number="form.numDias" placeholder="Ej: 5" />
        </div>

        <div class="form-group">
          <label for="al-fecha">Fecha de inicio *</label>
          <input id="al-fecha" type="date" v-model="form.fechaInic" />
        </div>

        <button class="btn btn-primary" @click="realizarAlquiler" :disabled="alquilando">
          {{ alquilando ? 'Registrando...' : 'Alquilar' }}
        </button>
      </div>


      <div v-if="resultado" class="card resultado-card" style="max-width:540px;">
        <h3 class="paso-titulo resultado-titulo">✅ Alquiler registrado</h3>
        <div class="resultado-grid">
          <span class="resultado-label">Marca</span>
          <span>{{ resultado.marcaNombre }}</span>
          <span class="resultado-label">Modelo</span>
          <span>{{ resultado.modeloNombre }}</span>
          <span class="resultado-label">Cliente</span>
          <span>{{ resultado.clienteNombre }}</span>
          <span class="resultado-label">DNI</span>
          <span>{{ resultado.clienteDni }}</span>
          <span class="resultado-label">Días</span>
          <span>{{ resultado.numDias }}</span>
          <span class="resultado-label">Fecha inicio</span>
          <span>{{ resultado.fechaInic }}</span>
          <span class="resultado-label">Precio total</span>
          <span class="resultado-precio">{{ resultado.precioTotal.toFixed(2) }} €</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '../composables/useApi.js'

const { getAll, put } = useApi()

const cargando = ref(true)
const error = ref('')
const marcas = ref([])
const modelos = ref([])
const vehiculos = ref([])
const clientes = ref([])

const idMarcaSel = ref('')
const idModeloSel = ref('')
const mostrarFormulario = ref(false)
const vehiculosDisponibles = ref([])
const alquilando = ref(false)
const mensajeForm = ref({ texto: '', tipo: '' })
const resultado = ref(null)

const form = ref({
  idVehiculo: '',
  idCliente: '',
  numDias: '',
  fechaInic: ''
})

onMounted(async () => {
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
})

const modelosFiltrados = computed(() =>
  modelos.value.filter(m => m.idMarca === idMarcaSel.value)
)

function onMarcaChange() {
  idModeloSel.value = ''
  mostrarFormulario.value = false
  resultado.value = null
}

function buscarVehiculos() {
  vehiculosDisponibles.value = vehiculos.value.filter(v => v.idModelo === idModeloSel.value)
  form.value = { idVehiculo: '', idCliente: '', numDias: '', fechaInic: '' }
  mensajeForm.value = { texto: '', tipo: '' }
  resultado.value = null
  mostrarFormulario.value = true
}

function marcaModeloDeVehiculo(v) {
  const modelo = modelos.value.find(m => m.id === v.idModelo)
  if (!modelo) return 'Desconocido'
  const marca = marcas.value.find(m => m.id === modelo.idMarca)
  return `${marca ? marca.nombre + ' ' : ''}${modelo.modelo}`
}

async function realizarAlquiler() {
  mensajeForm.value = { texto: '', tipo: '' }
  if (!form.value.idVehiculo || !form.value.idCliente || !form.value.numDias || !form.value.fechaInic) {
    mensajeForm.value = { texto: 'Todos los campos son obligatorios.', tipo: 'error' }
    return
  }
  alquilando.value = true
  try {
    const cliente = clientes.value.find(c => c.id === form.value.idCliente)
    const vehiculo = vehiculos.value.find(v => v.id === form.value.idVehiculo)
    const modelo = modelos.value.find(m => m.id === vehiculo.idModelo)
    const marca = marcas.value.find(m => m.id === modelo.idMarca)

   
    const [anio, mes, dia] = form.value.fechaInic.split('-')
    const fechaFormateada = `${dia}/${mes}/${anio}`

    const nuevoAlquiler = {
      idVehiculo: form.value.idVehiculo,
      numDias: Number(form.value.numDias),
      fechaInic: fechaFormateada
    }

    const alquileresActualizados = [...(cliente.alquileres || []), nuevoAlquiler]
    await put('clientes', cliente.id, { ...cliente, alquileres: alquileresActualizados })

    
    clientes.value = clientes.value.map(c =>
      c.id === cliente.id ? { ...c, alquileres: alquileresActualizados } : c
    )

    const extra = modelo.extraPorModelo || 0
    const precioTotal = (vehiculo.precioDia + extra) * Number(form.value.numDias)

    resultado.value = {
      marcaNombre: marca.nombre,
      modeloNombre: modelo.modelo,
      clienteNombre: cliente.nombre,
      clienteDni: cliente.dni,
      numDias: form.value.numDias,
      fechaInic: fechaFormateada,
      precioTotal
    }

    mostrarFormulario.value = false
    form.value = { idVehiculo: '', idCliente: '', numDias: '', fechaInic: '' }
  } catch {
    mensajeForm.value = { texto: 'Error al registrar el alquiler.', tipo: 'error' }
  } finally {
    alquilando.value = false
  }
}
</script>

<style scoped>
.paso-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 16px;
}
.resultado-card {
  border-left: 4px solid var(--success);
}
.resultado-titulo {
  color: var(--success);
}
.resultado-grid {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 8px 16px;
  font-size: 0.95rem;
}
.resultado-label {
  font-weight: 600;
  color: var(--text-light);
}
.resultado-precio {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--accent);
}
</style>
