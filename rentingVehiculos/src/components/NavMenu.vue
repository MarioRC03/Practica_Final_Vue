<template>
  <nav class="nav-lateral">
    <div class="nav-logo">
      <span class="logo-icon">🚗</span>
      <span class="logo-text">RentCar</span>
    </div>

    <ul class="nav-list">
      <li>
        <RouterLink to="/" class="nav-link" active-class="nav-link--active" exact>
          <span class="nav-icon">🏠</span> Inicio
        </RouterLink>
      </li>

      <li class="nav-group">
        <span class="nav-group-label">Marcas</span>
        <RouterLink to="/marcas" class="nav-link" active-class="nav-link--active">
          <span class="nav-icon">📋</span> Marcas
        </RouterLink>
        <RouterLink to="/marcas/nueva" class="nav-link nav-link--sub" active-class="nav-link--active">
          <span class="nav-icon">➕</span> Nueva Marca
        </RouterLink>
      </li>

      <li class="nav-group">
        <span class="nav-group-label">Modelos</span>
        <RouterLink to="/modelos" class="nav-link" active-class="nav-link--active">
          <span class="nav-icon">🗂️</span> Modelos
        </RouterLink>
        <RouterLink to="/modelos/nuevo" class="nav-link nav-link--sub" active-class="nav-link--active">
          <span class="nav-icon">➕</span> Nuevo Modelo
        </RouterLink>
      </li>

      <li class="nav-group">
        <span class="nav-group-label">Vehículos</span>
        <RouterLink to="/vehiculos" class="nav-link" active-class="nav-link--active">
          <span class="nav-icon">🚙</span> Vehículos
        </RouterLink>
        <RouterLink to="/vehiculos/nuevo" class="nav-link nav-link--sub" active-class="nav-link--active">
          <span class="nav-icon">➕</span> Nuevo Vehículo
        </RouterLink>
      </li>

      <li>
        <RouterLink to="/alquiler" class="nav-link" active-class="nav-link--active">
          <span class="nav-icon">🔑</span> Alquiler
        </RouterLink>
      </li>

      <li>
        <RouterLink to="/clientes" class="nav-link" active-class="nav-link--active">
          <span class="nav-icon">👥</span> Clientes
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.nav-lateral {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--nav-width);
  height: 100vh;
  background: var(--primary);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 2px 0 10px rgba(0,0,0,0.15);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo-icon { font-size: 1.6rem; }

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 1px;
}

.nav-list {
  list-style: none;
  padding: 12px 0;
  flex: 1;
}

.nav-group {
  margin-bottom: 4px;
}

.nav-group-label {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: rgba(255,255,255,0.35);
  padding: 14px 18px 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
}

.nav-link--active {
  background: rgba(232, 160, 32, 0.15);
  color: var(--accent) !important;
  border-left: 3px solid var(--accent);
}

.nav-link--sub {
  padding-left: 36px;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.55);
}

.nav-icon { font-size: 1rem; }
</style>
