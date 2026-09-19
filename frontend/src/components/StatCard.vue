<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string
    hint?: string
    accent?: string
    trend?: { text: string; direction: 'up' | 'down' | 'flat' }
    icon?: string
  }>(),
  { accent: 'var(--magenta)' },
)
</script>

<template>
  <article class="stat panel" :style="{ '--accent': accent }">
    <div class="stat__top">
      <span class="eyebrow">{{ label }}</span>
      <span v-if="icon" class="stat__icon" aria-hidden="true">{{ icon }}</span>
    </div>
    <p class="stat__value pixel">{{ value }}</p>
    <div class="stat__foot">
      <span
        v-if="trend"
        class="chip chip--dot"
        :class="{ 'chip--up': trend.direction === 'up', 'chip--down': trend.direction === 'down' }"
      >
        {{ trend.text }}
      </span>
      <span v-if="hint" class="stat__hint mono">{{ hint }}</span>
    </div>
  </article>
</template>

<style scoped>
.stat {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  padding-top: 20px;
}

.stat::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 6px;
  background: var(--accent);
}

.stat__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.stat__icon {
  font-size: 18px;
  filter: saturate(1.2);
}

.stat__value {
  font-size: clamp(15px, 2vw, 20px);
  color: var(--ink);
  text-shadow: 2px 2px 0 var(--hard);
  margin: 0;
  word-break: break-word;
}

.stat__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}

.stat__hint {
  font-size: 11px;
  color: var(--muted);
}
</style>
