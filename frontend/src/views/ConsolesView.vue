<script setup lang="ts">
import { computed, ref } from 'vue'
import ConsoleCard from '../components/ConsoleCard.vue'
import EmptyState from '../components/EmptyState.vue'
import LoadingScreen from '../components/LoadingScreen.vue'
import { formatMoney } from '../composables/useFormat'
import { useToasts } from '../composables/useToasts'
import { useLibraryStore } from '../stores/library'

const emit = defineEmits<{ addConsole: [] }>()

const store = useLibraryStore()
const { push } = useToasts()

const search = ref('')
const sort = ref<'value-desc' | 'library-desc' | 'name' | 'year'>('value-desc')

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  const rows = store.consoleBreakdown.filter(
    (entry) =>
      !term ||
      entry.console.name.toLowerCase().includes(term) ||
      entry.console.manufacturer.toLowerCase().includes(term),
  )

  return [...rows].sort((a, b) => {
    switch (sort.value) {
      case 'name':
        return a.console.name.localeCompare(b.console.name)
      case 'year':
        return a.console.releaseYear - b.console.releaseYear
      default:
        return b.console.marketPrice - a.console.marketPrice
    }
  })
})

const totalHardware = computed(() =>
  filtered.value.reduce((acc, entry) => acc + entry.hardwareValue, 0),
)

async function remove(id: string) {
  const item = store.consoles.find((entry) => entry.id === id)
  if (!item) return
  const linked = store.games.filter((game) => game.consoleId === id).length
  await store.removeConsole(id)
  push(
    linked
      ? `${item.name} and its ${linked} ${linked === 1 ? 'game' : 'games'} were removed.`
      : `${item.name} removed from the collection.`,
    'info',
  )
}
</script>

<template>
  <section class="shell">
    <header class="page-head">
      <div>
        <p class="eyebrow">Hardware rack</p>
        <h1>Consoles</h1>
      </div>
      <div class="page-head__aside">
        <span class="chip mono">{{ filtered.length }} / {{ store.consoles.length }} shown</span>
        <span class="chip mono">{{ formatMoney(totalHardware) }} hardware value</span>
        <button class="btn btn--cyan btn--sm" type="button" @click="emit('addConsole')">
          + Add console
        </button>
      </div>
    </header>

    <div class="panel toolbar">
      <div class="field toolbar__search">
        <label class="field__label" for="console-search">Search</label>
        <input
          id="console-search"
          v-model="search"
          class="input"
          type="search"
          placeholder="Console or manufacturer…"
        />
      </div>

      <div class="field">
        <label class="field__label" for="console-sort">Sort by</label>
        <select id="console-sort" v-model="sort" class="select">
          <option value="value-desc">Hardware value ↓</option>
          <option value="name">Name A–Z</option>
          <option value="year">Release year</option>
        </select>
      </div>
    </div>

    <LoadingScreen v-if="store.loading && !store.loaded" label="Spinning up hardware" />

    <EmptyState
      v-else-if="!store.consoles.length"
      icon="📺"
      title="The rack is empty"
      message="Add a console first — games are always attached to a platform."
    >
      <button class="btn btn--cyan" type="button" @click="emit('addConsole')">Add a console</button>
    </EmptyState>

    <EmptyState
      v-else-if="!filtered.length"
      icon="🔍"
      title="No matches"
      message="No console matches that search."
    >
      <button class="btn btn--ghost" type="button" @click="search = ''">Clear search</button>
    </EmptyState>

    <div v-else class="collection grid">
      <ConsoleCard
        v-for="entry in filtered"
        :key="entry.console.id"
        :item="entry.console"
        @remove="remove"
      />
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
  grid-template-columns: minmax(220px, 2fr) minmax(160px, 1fr);
  gap: 14px;
  align-items: end;
  margin-bottom: 20px;
}

.collection {
  grid-template-columns: repeat(auto-fill, minmax(292px, 1fr));
}

@media (max-width: 720px) {
  .toolbar {
    grid-template-columns: 1fr;
  }
}
</style>
