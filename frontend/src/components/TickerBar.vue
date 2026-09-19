<script setup lang="ts">
import { computed } from 'vue'
import { formatMoney, formatPercent } from '../composables/useFormat'
import { useLibraryStore } from '../stores/library'

const store = useLibraryStore()

/** Duplicated once so the marquee can loop seamlessly. */
const ticker = computed(() => {
  const entries = store.movers.slice(0, 14)
  return [...entries, ...entries]
})
</script>

<template>
  <div v-if="ticker.length" class="ticker" aria-hidden="true">
    <div class="ticker__track">
      <span v-for="(item, index) in ticker" :key="`${item.id}-${index}`" class="ticker__item mono">
        <span class="ticker__name">{{ item.name }}</span>
        <span>{{ formatMoney(item.price) }}</span>
        <span :class="item.changePct >= 0 ? 'up' : 'down'">
          {{ item.changePct >= 0 ? '▲' : '▼' }} {{ formatPercent(item.changePct) }}
        </span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.ticker {
  overflow: hidden;
  background: var(--bg-deep);
  border-bottom: 2px solid var(--hard);
  padding: 7px 0;
  mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
}

.ticker__track {
  display: flex;
  width: max-content;
  gap: 34px;
  animation: marquee 70s linear infinite;
}

.ticker__item {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 11px;
  color: var(--muted);
  white-space: nowrap;
}

.ticker__name {
  color: var(--ink-dim);
}
</style>
