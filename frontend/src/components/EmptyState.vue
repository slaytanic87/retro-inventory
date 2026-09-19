<script setup lang="ts">
defineProps<{ title: string; message?: string; icon?: string }>()
</script>

<template>
  <div class="empty panel panel--flat">
    <span class="empty__icon" aria-hidden="true">{{ icon || '👾' }}</span>
    <h3>{{ title }}</h3>
    <p v-if="message" class="empty__text">{{ message }}</p>
    <div v-if="$slots.default" class="empty__actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.empty {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
  border-style: dashed;
  border-color: var(--line);
  background: rgba(25, 21, 52, 0.5);
}

.empty__icon {
  font-size: 34px;
}

.empty__text {
  max-width: 44ch;
  color: var(--ink-dim);
  font-size: 14px;
}

.empty__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 4px;
}
</style>
