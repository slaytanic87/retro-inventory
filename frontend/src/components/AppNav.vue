<script setup lang="ts">
import { RouterLink } from 'vue-router'

const emit = defineEmits<{ addGame: []; addConsole: [] }>()

const links = [
  { to: '/', label: 'Dashboard', icon: '▤' },
  { to: '/library/games', label: 'Games', icon: '▣' },
  { to: '/library/consoles', label: 'Consoles', icon: '▥' },
]
</script>

<template>
  <header class="nav">
    <div class="nav__inner">
      <RouterLink to="/" class="brand" aria-label="Retro Inventory home">
        <span class="brand__badge" aria-hidden="true">
          <svg viewBox="0 0 24 16" width="30" height="20">
            <rect x="1" y="3" width="22" height="11" rx="2" fill="#ff3d8b" stroke="#05040d" stroke-width="2" />
            <rect x="5" y="7" width="5" height="2" fill="#05040d" />
            <rect x="6.5" y="5.5" width="2" height="5" fill="#05040d" />
            <circle cx="16" cy="7.5" r="1.4" fill="#05040d" />
            <circle cx="19" cy="9.5" r="1.4" fill="#05040d" />
          </svg>
        </span>
        <span class="brand__text">
          <strong class="pixel">RETRO</strong>
          <span class="mono">INVENTORY<span class="blink">_</span></span>
        </span>
      </RouterLink>

      <nav class="nav__links" aria-label="Main">
        <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="tab">
          <span aria-hidden="true">{{ link.icon }}</span>{{ link.label }}
        </RouterLink>
      </nav>

      <div class="nav__actions">
        <button class="btn btn--primary btn--sm" type="button" @click="emit('addGame')">
          + Game
        </button>
        <button class="btn btn--cyan btn--sm" type="button" @click="emit('addConsole')">
          + Console
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 900;
  background: linear-gradient(180deg, rgba(25, 21, 52, 0.97), rgba(13, 11, 26, 0.97));
  border-bottom: 3px solid var(--hard);
  backdrop-filter: blur(6px);
}

.nav__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px 22px;
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  text-decoration: none;
  color: var(--ink);
}

.brand__badge {
  display: grid;
  place-items: center;
  padding: 6px 7px;
  background: var(--panel-3);
  border: 2px solid var(--hard);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.brand__text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  line-height: 1;
}

.brand__text strong {
  font-size: 13px;
  letter-spacing: 0.08em;
  text-shadow: 2px 2px 0 var(--hard);
}

.brand__text span {
  font-size: 10px;
  letter-spacing: 0.3em;
  color: var(--muted);
}

.nav__links {
  display: flex;
  gap: 8px;
  margin-left: auto;
  flex-wrap: wrap;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 13px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--ink-dim);
  background: transparent;
  border: 2px solid transparent;
  border-radius: var(--radius);
  transition: color 120ms ease, background 120ms ease;
}

.tab:hover {
  color: var(--ink);
  background: var(--panel-2);
}

.tab.router-link-active {
  color: var(--ink);
  background: var(--panel-3);
  border-color: var(--hard);
  box-shadow: 3px 3px 0 var(--hard);
}

.nav__actions {
  display: flex;
  gap: 9px;
}

@media (max-width: 860px) {
  .nav__inner {
    padding: 12px 14px;
  }

  .nav__links {
    order: 3;
    width: 100%;
    margin-left: 0;
  }

  .nav__actions {
    margin-left: auto;
  }
}
</style>
