<template>
  <div>
    <h2 class="page-title">Clientes</h2>

    <div v-if="cargando" class="loading">Cargando...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>

    <div v-else class="clientes-layout">
      <div class="card clientes-lista">
        <h3 class="col-titulo">Clientes</h3>
        <div v-if="!clientes.length" style="color:var(--text-light); font-size:0.9rem;">
          No hay clientes registrados.
        </div>
        <ul class="item-list">
          <li
            v-for="cliente in clientes"
            :key="cliente.id"
            :class="{ active: clienteSeleccionado?.id === cliente.id }"
            @click="seleccionarCliente(cliente)"
          >
            <span class="cliente-nombre">{{ cliente.nombre }}</span>
            <span class="cliente-dni">{{ cliente.dni }}</span>
          </li>
        </ul>
      </div>


      <div class="col-derecha">
        <div class="card historial-card">
          <h3 class="col-titulo">Historial de alquileres</h3>
          <div v-if="!clienteSeleccionado" style="color:var(--text-light); font-style:italic;">
            Selecciona un cliente para ver su historial.
          </div>
          <div v-else-if="!historialCliente.length" style="color:var(--text-light);">
            Este cliente no tiene alquileres registrados.
          </div>
          <table v-else class="tabla-historial">
            <thead>
              <tr>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Precio pagado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in historialCliente" :key="i">
                <td>{{ item.marcaNombre }}</td>
                <td>{{ item.modeloNombre }}</td>
                <td class="precio-pagado">{{ item.precioPagado.toFixed(2) }} €</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3 class="col-titulo">{{ clienteSeleccionado ? 'Datos del cliente' : 'Nuevo cliente' }}</h3>

          <div v-if="mensajeForm.texto" :class="['alert', mensajeForm.tipo === 'ok' ? 'alert-success' : 'alert-error']">
            {{ mensajeForm.texto }}
          </div>

          <div class="form-group">
            <label for="cl-nombre">Nombre *</label>
            <input id="cl-nombre" type="text" v-model.trim="form.nombre" placeholder="Nombre completo" />
          </div>

          <div class="form-group">
            <label for="cl-dni">DNI *</label>
            <input id="cl-dni" type="text" v-model.trim="form.dni" placeholder="Ej: 12345678A" />
          </div>

          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button
              class="btn btn-success"
              :disabled="!!clienteSeleccionado || procesando"
              @click="darDeAlta"
            >
              Alta
            </button>
            <button
              class="btn btn-primary"
              :disabled="!clienteSeleccionado || procesando"
              @click="modificar"
            >
              Modificar
            </button>
            <button
              class="btn btn-danger"
              :disabled="!clienteSeleccionado || procesando"
              @click="eliminar"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '../composables/useApi.js'

const { getAll, post, put, eliminar: apiEliminar } = useApi()

const cargando = ref(true)
const error = ref('')
const clientes = ref([])
const modelos = ref([])
const vehiculos = ref([])
const marcas = ref([])
const clienteSeleccionado = ref(null)
const procesando = ref(false)
const mensajeForm = ref({ texto: '', tipo: '' })

const form = ref({ nombre: '', dni: '' })

onMounted(async () => {
  try {
    ;[clientes.value, modelos.value, vehiculos.value, marcas.value] = await Promise.all([
      getAll('clientes'),
      getAll('modelos'),
      getAll('vehiculos'),
      getAll('marcas')
    ])
  } catch {
    error.value = 'Error al cargar datos. ¿Está el servidor JSON encendido?'
  } finally {
    cargando.value = false
  }
})


const historialCliente = computed(() => {
  if (!clienteSeleccionado.value) return []
  return (clienteSeleccionado.value.alquileres || []).map(alquiler => {
    const vehiculo = vehiculos.value.find(v => v.id === alquiler.idVehiculo)
    if (!vehiculo) return { marcaNombre: '?', modeloNombre: '?', precioPagado: 0 }
    const modelo = modelos.value.find(m => m.id === vehiculo.idModelo)
    if (!modelo) return { marcaNombre: '?', modeloNombre: '?', precioPagado: 0 }
    const marca = marcas.value.find(m => m.id === modelo.idMarca)
    const extra = modelo.extraPorModelo || 0
    return {
      marcaNombre: marca ? marca.nombre : '?',
      modeloNombre: modelo.modelo,
      precioPagado: (vehiculo.precioDia + extra) * alquiler.numDias
    }
  })
})

function seleccionarCliente(cliente) {
  if (clienteSeleccionado.value?.id === cliente.id) {
    clienteSeleccionado.value = null
    form.value = { nombre: '', dni: '' }
  } else {
    clienteSeleccionado.value = cliente
    form.value = { nombre: cliente.nombre, dni: cliente.dni }
  }
  mensajeForm.value = { texto: '', tipo: '' }
}

function limpiarSeleccion() {
  clienteSeleccionado.value = null
  form.value = { nombre: '', dni: '' }
  mensajeForm.value = { texto: '', tipo: '' }
}

async function darDeAlta() {
  mensajeForm.value = { texto: '', tipo: '' }
  if (!form.value.nombre || !form.value.dni) {
    mensajeForm.value = { texto: 'Nombre y DNI son obligatorios.', tipo: 'error' }
    return
  }
  procesando.value = true
  try {
    const nextId = String(clientes.value.length > 0 ? Math.max(...clientes.value.map(c => Number(c.id))) + 1 : 1)
    const nuevoCliente = { id: nextId, nombre: form.value.nombre, dni: form.value.dni, alquileres: [] }
    await post('clientes', nuevoCliente)
    clientes.value.push(nuevoCliente)
    mensajeForm.value = { texto: 'Cliente dado de alta con éxito.', tipo: 'ok' }
    form.value = { nombre: '', dni: '' }
  } catch {
    mensajeForm.value = { texto: 'Error al dar de alta el cliente.', tipo: 'error' }
  } finally {
    procesando.value = false
  }
}

async function modificar() {
  mensajeForm.value = { texto: '', tipo: '' }
  if (!form.value.nombre || !form.value.dni) {
    mensajeForm.value = { texto: 'Nombre y DNI son obligatorios.', tipo: 'error' }
    return
  }
  procesando.value = true
  try {
    const actualizado = { ...clienteSeleccionado.value, nombre: form.value.nombre, dni: form.value.dni }
    await put('clientes', clienteSeleccionado.value.id, actualizado)
    clientes.value = clientes.value.map(c => c.id === actualizado.id ? actualizado : c)
    mensajeForm.value = { texto: 'Cliente actualizado con éxito.', tipo: 'ok' }
    limpiarSeleccion()
    mensajeForm.value = { texto: 'Cliente actualizado con éxito.', tipo: 'ok' }
  } catch {
    mensajeForm.value = { texto: 'Error al modificar el cliente.', tipo: 'error' }
  } finally {
    procesando.value = false
  }
}

async function eliminar() {
  mensajeForm.value = { texto: '', tipo: '' }
  procesando.value = true
  try {
    await apiEliminar('clientes', clienteSeleccionado.value.id)
    clientes.value = clientes.value.filter(c => c.id !== clienteSeleccionado.value.id)
    mensajeForm.value = { texto: 'Cliente eliminado.', tipo: 'ok' }
    limpiarSeleccion()
    mensajeForm.value = { texto: 'Cliente eliminado.', tipo: 'ok' }
  } catch {
    mensajeForm.value = { texto: 'Error al eliminar el cliente.', tipo: 'error' }
  } finally {
    procesando.value = false
  }
}
</script>

<style scoped>
.clientes-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.clientes-lista {
  flex: 0 0 260px;
  min-width: 220px;
}
.col-derecha {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.col-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 14px;
}
.item-list li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cliente-nombre {
  font-weight: 600;
  font-size: 0.95rem;
}
.cliente-dni {
  font-size: 0.78rem;
  color: var(--text-light);
}
.historial-card {
  min-height: 120px;
}
.tabla-historial {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.tabla-historial th {
  text-align: left;
  padding: 8px 12px;
  background: var(--bg);
  color: var(--text-light);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tabla-historial td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
}
.tabla-historial tr:last-child td { border-bottom: none; }
.precio-pagado {
  font-weight: 700;
  color: var(--accent);
}
</style>
