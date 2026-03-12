import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import MarcasView from '../views/MarcasView.vue'
import NuevaMarcaView from '../views/NuevaMarcaView.vue'
import ModelosView from '../views/ModelosView.vue'
import NuevoModeloView from '../views/NuevoModeloView.vue'
import VehiculosView from '../views/VehiculosView.vue'
import NuevoVehiculoView from '../views/NuevoVehiculoView.vue'
import AlquilerView from '../views/AlquilerView.vue'
import ClientesView from '../views/ClientesView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/marcas', name: 'marcas', component: MarcasView },
  { path: '/marcas/nueva', name: 'nueva-marca', component: NuevaMarcaView },
  { path: '/modelos', name: 'modelos', component: ModelosView },
  { path: '/modelos/nuevo', name: 'nuevo-modelo', component: NuevoModeloView },
  { path: '/vehiculos', name: 'vehiculos', component: VehiculosView },
  { path: '/vehiculos/nuevo', name: 'nuevo-vehiculo', component: NuevoVehiculoView },
  { path: '/alquiler', name: 'alquiler', component: AlquilerView },
  { path: '/clientes', name: 'clientes', component: ClientesView },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
