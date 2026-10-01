<script setup lang="ts">
import { computed, ref } from 'vue'
import EmptyState from '../components/EmptyState.vue'
import GameCard from '../components/GameCard.vue'
import LoadingScreen from '../components/LoadingScreen.vue'
import { formatMoney, formatSignedMoney, trendClass } from '../composables/useFormat'
import { useToasts } from '../composables/useToasts'
import { useLibraryStore } from '../stores/library'
import { GENRES } from '../types'

const emit = defineEmits<{ addGame: [] }>()

const store = useLibraryStore()
const { push } = useToasts()

const search = ref('')
const consoleFilter = ref('all')
const genreFilter = ref('all')
const sort = ref<'value-desc' | 'value-asc' | 'name' | 'year' | 'recent' | 'profit'>('value-desc')

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  const result = store.games.filter((game) => {
    const matchesTerm =
      !term ||
      game.name.toLowerCase().includes(term) ||
      game.publisher.toLowerCase().includes(term)
    const matchesConsole = consoleFilter.value === 'all' || game.consolePlatform === consoleFilter.value
    const matchesGenre = genreFilter.value === 'all' || game.genre === genreFilter.value
    return matchesTerm && matchesConsole && matchesGenre
  })

  return [...result].sort((a, b) => {
    switch (sort.value) {
      case 'value-asc':
        return a.marketPrice - b.marketPrice
      case 'name':
        return a.name.localeCompare(b.name)
      case 'year':
        return a.releaseYear - b.releaseYear
      case 'recent':
        return b.addedAt.localeCompare(a.addedAt)
      case 'profit':
        return b.marketPrice - b.buyPrice - (a.marketPrice - a.buyPrice)
      default:
        return b.marketPrice - a.marketPrice
    }
  })
})

const visibleValue = computed(() =>
  filtered.value.reduce((acc, game) => acc + game.marketPrice, 0),
)
const visibleProfit = computed(() =>
  filtered.value.reduce((acc, game) => acc + (game.marketPrice - game.buyPrice), 0),
)

const hasFilters = computed(
  () => Boolean(search.value) || consoleFilter.value !== 'all' || genreFilter.value !== 'all',
)

function clearFilters() {
  search.value = ''
  consoleFilter.value = 'all'
  genreFilter.value = 'all'
}

async function remove(id: string) {
  const game = store.games.find((entry) => entry.id === id)
  if (!game) return
  await store.removeGame(id)
  push(`${game.name} removed from the shelf.`, 'info')
}
</script>

<template>
  <section class="shell">
    <header class="page-head">
      <div>
        <p class="eyebrow">Software shelf</p>
        <h1>Games</h1>
      </div>
      <div class="page-head__aside">
        <span class="chip mono">{{ filtered.length }} / {{ store.games.length }} shown</span>
        <span class="chip mono">{{ formatMoney(visibleValue) }} market value</span>
        <span class="chip mono" :class="trendClass(visibleProfit)">
          {{ formatSignedMoney(visibleProfit) }} vs. paid
        </span>
        <button class="btn btn--primary btn--sm" type="button" @click="emit('addGame')">
          + Add game
        </button>
      </div>
    </header>

    <div class="panel toolbar">
      <div class="field toolbar__search">
        <label class="field__label" for="game-search">Search</label>
        <input
          id="game-search"
          v-model="search"
          class="input"
          type="search"
          placeholder="Title or publisher…"
        />
      </div>

      <div class="field">
        <label class="field__label" for="filter-console">Console</label>
        <select id="filter-console" v-model="consoleFilter" class="select">
          <option value="all">All consoles</option>
          <option v-for="item in store.consoles" :key="item.id" :value="item.id">
            {{ item.shortName }}
          </option>
        </select>
      </div>

      <div class="field">
        <label class="field__label" for="filter-genre">Genre</label>
        <select id="filter-genre" v-model="genreFilter" class="select">
          <option value="all">All genres</option>
          <option v-for="genre in GENRES" :key="genre" :value="genre">{{ genre }}</option>
        </select>
      </div>

      <div class="field">
        <label class="field__label" for="sort-by">Sort by</label>
        <select id="sort-by" v-model="sort" class="select">
          <option value="value-desc">Market price ↓</option>
          <option value="value-asc">Market price ↑</option>
          <option value="profit">Biggest profit</option>
          <option value="name">Name A–Z</option>
          <option value="year">Release year</option>
          <option value="recent">Recently added</option>
        </select>
      </div>

      <button
        class="btn btn--ghost btn--sm toolbar__clear"
        type="button"
        :disabled="!hasFilters"
        @click="clearFilters"
      >
        Clear
      </button>
    </div>

    <LoadingScreen v-if="store.loading && !store.loaded" label="Loading shelf" />

    <EmptyState
      v-else-if="!store.games.length"
      icon="🕹"
      title="No games yet"
      message="Add your first cartridge and the collection stats will follow."
    >
      <button class="btn btn--primary" type="button" @click="emit('addGame')">Add a game</button>
    </EmptyState>

    <EmptyState
      v-else-if="!filtered.length"
      icon="🔍"
      title="No matches"
      message="Nothing on the shelf matches these filters."
    >
      <button class="btn btn--ghost" type="button" @click="clearFilters">Clear filters</button>
    </EmptyState>

    <div v-else class="collection grid">
      <GameCard v-for="game in filtered" :key="game.id" :game="game" @remove="remove" />
    </div>
  </section>
</template>

<style scoped>
.page-head__aside {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.toolbar {
  display: grid;
  grid-template-columns: minmax(190px, 1.6fr) repeat(3, minmax(140px, 1fr)) auto;
  gap: 14px;
  align-items: end;
  margin-bottom: 20px;
}

.toolbar__clear {
  height: 42px;
}

.collection {
  grid-template-columns: repeat(auto-fill, minmax(238px, 1fr));
}

@media (max-width: 880px) {
  .toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .toolbar__search {
    grid-column: 1 / -1;
  }

  .toolbar__clear {
    grid-column: 1 / -1;
  }
}
</style>
