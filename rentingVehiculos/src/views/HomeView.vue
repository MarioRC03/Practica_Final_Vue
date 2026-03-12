<template>
  <div class="home-wrapper">
    <div class="home-card">
      <div class="home-logo">
        <span class="home-icon">🚗</span>
        <h1 class="home-title">RentCar</h1>
        <p class="home-subtitle">Gestión de Renting de Vehículos</p>
      </div>
      <p class="home-desc">
        Bienvenido al sistema de gestión de tu empresa de renting. Utiliza el menú lateral
        para acceder a las distintas secciones.
      </p>
      <div class="home-stats">
        <div class="stat-box">
          <span class="stat-icon">🏷️</span>
          <span class="stat-label">Marcas</span>
        </div>
        <div class="stat-box">
          <span class="stat-icon">🗂️</span>
          <span class="stat-label">Modelos</span>
        </div>
        <div class="stat-box">
          <span class="stat-icon">🚙</span>
          <span class="stat-label">Vehículos</span>
        </div>
        <div class="stat-box">
          <span class="stat-icon">👥</span>
          <span class="stat-label">Clientes</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.home-card {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  padding: 48px 56px;
  text-align: center;
  max-width: 560px;
  width: 100%;
}

.home-logo {
  margin-bottom: 24px;
}

.home-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 10px;
}

.home-title {
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: 2px;
}

.home-subtitle {
  font-size: 1rem;
  color: var(--accent);
  font-weight: 600;
  margin-top: 4px;
}

.home-desc {
  color: var(--text-light);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 32px;
}

.home-stats {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-box {
  background: var(--bg);
  border-radius: 12px;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 90px;
}

.stat-icon { font-size: 1.6rem; }

.stat-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
