# RentCar - Gestión de Renting de Vehículos

Proyecto Vue 3 + Vite para gestión de una empresa de renting de vehículos.

## Instalación

```bash
npm install
```

## Arrancar el servidor JSON (API)

```bash
npx json-server --watch bbddRenting.json --port 3000
```

## Arrancar la aplicación Vue

```bash
npm run dev
```

La app estará en `http://localhost:5173`

## Estructura del proyecto

```
src/
├── main.js                  # Entrada principal
├── main.css                 # Estilos globales
├── App.vue                  # Layout raíz
├── router/index.js          # Rutas
├── composables/useApi.js    # Llamadas a la API
├── components/NavMenu.vue   # Menú lateral
└── views/
    ├── HomeView.vue
    ├── MarcasView.vue
    ├── NuevaMarcaView.vue   ✅ Completo
    ├── ModelosView.vue
    ├── NuevoModeloView.vue  ✅ Completo
    ├── VehiculosView.vue
    ├── NuevoVehiculoView.vue
    ├── AlquilerView.vue
    └── ClientesView.vue
```
