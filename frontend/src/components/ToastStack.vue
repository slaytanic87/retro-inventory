<script setup lang="ts">
import { useToasts } from '../composables/useToasts'

const { toasts, dismiss } = useToasts()

const icons = { success: '✔', info: 'ℹ', error: '✖' } as const
</script>

<template>
  <Teleport to="body">
    <ul class="toasts" role="status" aria-live="polite">
      <li v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.tone}`">
        <span class="toast__icon" aria-hidden="true">{{ icons[toast.tone] }}</span>
        <span class="toast__text mono">{{ toast.message }}</span>
        <button class="toast__close" type="button" aria-label="Dismiss" @click="dismiss(toast.id)">
          ✕
        </button>
      </li>
    </ul>
  </Teleport>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 9600;
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
  max-width: min(360px, calc(100vw - 36px));
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  background: var(--panel-2);
  border: 2px solid var(--hard);
  border-left-width: 7px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  animation: pop-in 140ms steps(3);
}

.toast--success {
  border-left-color: var(--lime);
}
.toast--info {
  border-left-color: var(--cyan);
}
.toast--error {
  border-left-color: var(--danger);
}

.toast__icon {
  font-size: 14px;
}

.toast--success .toast__icon {
  color: var(--lime);
}
.toast--info .toast__icon {
  color: var(--cyan);
}
.toast--error .toast__icon {
  color: var(--danger);
}

.toast__text {
  flex: 1;
  font-size: 12px;
  line-height: 1.45;
}

.toast__close {
  background: transparent;
  border: 0;
  color: var(--muted);
  cursor: pointer;
  font-size: 12px;
}

.toast__close:hover {
  color: var(--ink);
}
</style>
