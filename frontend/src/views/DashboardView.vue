<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BarList from '../components/BarList.vue'
import EmptyState from '../components/EmptyState.vue'
import LoadingScreen from '../components/LoadingScreen.vue'
import SparkLine from '../components/SparkLine.vue'
import StatCard from '../components/StatCard.vue'
import TrendChart from '../components/TrendChart.vue'
import { formatMoney, formatPercent, formatSignedMoney } from '../composables/useFormat'
import { useLibraryStore } from '../stores/library'
import type { BarItem, TrendSeries } from '../types/charts'

const store = useLibraryStore()

const RANGES = [
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: '2Y', months: 24 },
]
const range = ref(12)

const visibleSeries = computed(() => store.portfolioSeries.slice(-(range.value + 1)))

const chartSeries = computed<TrendSeries[]>(() => [
  {
    name: 'Total',
    color: 'var(--magenta)',
    area: true,
    points: visibleSeries.value.map((point) => ({ date: point.date, value: point.total })),
  },
  {
    name: 'Games',
    color: 'var(--cyan)',
    points: visibleSeries.value.map((point) => ({ date: point.date, value: point.games })),
  },
  {
    name: 'Consoles',
    color: 'var(--amber)',
    points: visibleSeries.value.map((point) => ({ date: point.date, value: point.consoles })),
  },
])

const rangeChange = computed(() => {
  const series = visibleSeries.value
  if (series.length < 2) return { abs: 0, pct: 0 }
  const first = series[0].total
  const last = series[series.length - 1].total
  const abs = Math.round((last - first) * 100) / 100
  return { abs, pct: first === 0 ? 0 : Math.round((abs / first) * 1000) / 10 }
})

const consoleBars = computed<BarItem[]>(() =>
  store.consoleBreakdown.map((entry) => ({
    id: entry.console.id,
    label: entry.console.shortName,
    value: entry.total,
    color: entry.console.color,
    meta: `hardware ${formatMoney(entry.hardwareValue)}`,
  })),
)

const GENRE_COLORS = [
  'var(--magenta)',
  'var(--cyan)',
  'var(--lime)',
  'var(--amber)',
  'var(--violet)',
  '#4ad6c1',
  '#ff8a3d',
  '#ff6fae',
  '#8b7bd8',
  '#f2e14b',
]

const genreBars = computed<BarItem[]>(() =>
  store.genreBreakdown.map((entry, index) => ({
    id: entry.genre,
    label: entry.genre,
    value: entry.value,
    color: GENRE_COLORS[index % GENRE_COLORS.length],
    meta: `${entry.count} ${entry.count === 1 ? 'title' : 'titles'}`,
  })),
)

function sparkFor(id: string): number[] {
  return store.historyById.get(id)?.points.map((point) => point.value) ?? []
}
</script>

<template>
  <section class="shell">
    <header class="page-head">
      <div>
        <p class="eyebrow">Player 1 · collection status</p>
        <h1>Dashboard</h1>
      </div>
      <div class="page-head__aside">
        <span class="chip mono">{{ store.games.length }} games</span>
        <span class="chip mono">{{ store.consoles.length }} consoles</span>
        <button class="btn btn--ghost btn--sm" type="button" @click="store.resetCollection()">
          Reset demo data
        </button>
      </div>
    </header>

    <LoadingScreen v-if="store.loading && !store.loaded" label="Booting collection" />

    <EmptyState
      v-else-if="store.error"
      icon="⚠"
      title="Signal lost"
      :message="store.error"
    >
      <button class="btn btn--primary" type="button" @click="store.fetchAll()">Retry</button>
    </EmptyState>

    <template v-else>
      <div class="stats grid">
        <StatCard
          label="Collection value"
          :value="formatMoney(store.totalValue)"
          icon="💎"
          accent="var(--magenta)"
          :trend="{
            text: `${formatPercent(store.collectionChange12m.pct)} / 12m`,
            direction: store.collectionChange12m.pct >= 0 ? 'up' : 'down',
          }"
          :hint="`${formatSignedMoney(store.collectionChange12m.abs)} in 12 months`"
        />
        <StatCard
          label="Games value"
          :value="formatMoney(store.gamesValue)"
          icon="🕹"
          accent="var(--cyan)"
          :hint="`${store.games.length} cartridges & discs`"
        />
        <StatCard
          label="Console value"
          :value="formatMoney(store.consolesValue)"
          icon="📺"
          accent="var(--amber)"
          :hint="`${store.consoles.length} machines`"
        />
        <StatCard
          label="Total invested"
          :value="formatMoney(store.totalSpent)"
          icon="💾"
          accent="var(--violet)"
          hint="Sum of all buy prices"
        />
        <StatCard
          label="Unrealised profit"
          :value="formatSignedMoney(store.totalProfit)"
          icon="📈"
          :accent="store.totalProfit >= 0 ? 'var(--lime)' : 'var(--danger)'"
          :trend="{
            text: `ROI ${formatPercent(store.roi)}`,
            direction: store.totalProfit >= 0 ? 'up' : 'down',
          }"
          :hint="
            store.mostValuableGame
              ? `Top title: ${store.mostValuableGame.name}`
              : 'No games yet'
          "
        />
      </div>

      <section class="panel chart-panel">
        <header class="panel__head">
          <div>
            <h2>Collection value trend</h2>
            <p class="mono chart-panel__sub">
              {{ formatMoney(store.totalValue) }} today ·
              <span :class="rangeChange.pct >= 0 ? 'up' : 'down'">
                {{ formatSignedMoney(rangeChange.abs) }} ({{ formatPercent(rangeChange.pct) }})
              </span>
              over the selected window
            </p>
          </div>
          <div class="range">
            <button
              v-for="option in RANGES"
              :key="option.months"
              type="button"
              class="range__btn"
              :class="{ 'range__btn--active': range === option.months }"
              @click="range = option.months"
            >
              {{ option.label }}
            </button>
          </div>
        </header>
        <TrendChart :series="chartSeries" :height="300" />
      </section>

      <div class="split grid">
        <section class="panel">
          <header class="panel__head">
            <h2>Value by platform</h2>
            <RouterLink to="/library/consoles" class="chip">View all →</RouterLink>
          </header>
          <BarList :items="consoleBars" />
        </section>

        <section class="panel">
          <header class="panel__head">
            <h2>Value by genre</h2>
            <RouterLink to="/library/games" class="chip">View all →</RouterLink>
          </header>
          <BarList :items="genreBars" />
        </section>
      </div>

      <div class="split grid">
        <section class="panel">
          <header class="panel__head">
            <h2>Trending up</h2>
            <span class="eyebrow">12 month change</span>
          </header>
          <ul class="movers">
            <li v-for="mover in store.topGainers" :key="mover.id" class="movers__row">
              <span class="movers__type" aria-hidden="true">{{ mover.type === 'game' ? '▣' : '▥' }}</span>
              <span class="movers__name">{{ mover.name }}</span>
              <SparkLine :values="sparkFor(mover.id)" color="var(--lime)" :width="76" :height="26" />
              <span class="movers__price mono">{{ formatMoney(mover.price) }}</span>
              <span class="chip chip--up">{{ formatPercent(mover.changePct) }}</span>
            </li>
          </ul>
        </section>

        <section class="panel">
          <header class="panel__head">
            <h2>Cooling down</h2>
            <span class="eyebrow">12 month change</span>
          </header>
          <ul v-if="store.topLosers.length" class="movers">
            <li v-for="mover in store.topLosers" :key="mover.id" class="movers__row">
              <span class="movers__type" aria-hidden="true">{{ mover.type === 'game' ? '▣' : '▥' }}</span>
              <span class="movers__name">{{ mover.name }}</span>
              <SparkLine :values="sparkFor(mover.id)" color="var(--danger)" :width="76" :height="26" />
              <span class="movers__price mono">{{ formatMoney(mover.price) }}</span>
              <span class="chip chip--down">{{ formatPercent(mover.changePct) }}</span>
            </li>
          </ul>
          <p v-else class="dim">Every item in the collection gained value this year. Nice run.</p>
        </section>
      </div>
    </template>
  </section>
</template>

<style scoped>
.page-head__aside {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.stats {
  grid-template-columns: repeat(auto-fit, minmax(215px, 1fr));
  margin-bottom: 18px;
}

.chart-panel {
  margin-bottom: 18px;
}

.chart-panel__sub {
  margin-top: 7px;
  font-size: 12px;
  color: var(--ink-dim);
}

.range {
  display: flex;
  gap: 0;
  border: 2px solid var(--hard);
  border-radius: var(--radius);
  overflow: hidden;
  flex: none;
}

.range__btn {
  padding: 7px 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--ink-dim);
  background: var(--panel-2);
  border: 0;
  border-right: 2px solid var(--hard);
  cursor: pointer;
}

.range__btn:last-child {
  border-right: 0;
}

.range__btn--active {
  color: #05040d;
  background: var(--cyan);
}

.split {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  margin-bottom: 18px;
  align-items: start;
}

.movers {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.movers__row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 11px;
  background: var(--panel-2);
  border: 2px solid var(--hard);
  border-radius: var(--radius);
}

.movers__type {
  color: var(--muted);
}

.movers__name {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.movers__price {
  font-size: 12px;
  color: var(--ink-dim);
}

@media (max-width: 560px) {
  .movers__row {
    flex-wrap: wrap;
  }

  .movers__name {
    flex: 1 0 100%;
  }
}
</style>
