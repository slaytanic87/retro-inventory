<script setup lang="ts">
import { computed } from 'vue'
import { formatMoney } from '../composables/useFormat'
import type { BarItem } from '../types/charts'

const props = defineProps<{ items: BarItem[] }>()

const max = computed(() => Math.max(1, ...props.items.map((item) => item.value)))
</script>

<template>
  <ul class="bars">
    <li v-for="item in items" :key="item.id" class="bars__row">
      <div class="bars__head">
        <span class="bars__label">{{ item.label }}</span>
        <span class="bars__value mono">{{ formatMoney(item.value) }}</span>
      </div>
      <div class="bars__track">
        <div
          class="bars__fill"
          :style="{
            width: `${Math.max(3, (item.value / max) * 100)}%`,
            background: item.color || 'var(--magenta)',
          }"
        ></div>
      </div>
      <span v-if="item.meta" class="bars__meta mono">{{ item.meta }}</span>
    </li>
  </ul>
</template>

<style scoped>
.bars {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 14px;
}

.bars__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.bars__label {
  font-size: 14px;
  font-weight: 600;
}

.bars__value {
  font-size: 13px;
  color: var(--ink-dim);
}

.bars__track {
  height: 14px;
  background: var(--bg-deep);
  border: 2px solid var(--hard);
  border-radius: 2px;
  overflow: hidden;
}

.bars__fill {
  height: 100%;
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.22) 0 4px,
    transparent 4px 8px
  );
  background-blend-mode: overlay;
  transition: width 420ms steps(12);
}

.bars__meta {
  display: inline-block;
  margin-top: 5px;
  font-size: 11px;
  color: var(--muted);
}
</style>
