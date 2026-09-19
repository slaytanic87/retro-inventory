<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{ title: string; subtitle?: string }>()
const emit = defineEmits<{ close: [] }>()

const dialog = ref<HTMLElement | null>(null)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.body.style.overflow = 'hidden'
  requestAnimationFrame(() => {
    dialog.value?.querySelector<HTMLElement>('input:not([type="file"]), select, textarea, button')?.focus()
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div class="modal" role="dialog" aria-modal="true" :aria-label="title">
      <div class="modal__backdrop" @click="emit('close')"></div>
      <div ref="dialog" class="modal__dialog panel panel--raised">
        <header class="modal__head">
          <div>
            <h2>{{ title }}</h2>
            <p v-if="subtitle" class="modal__sub mono">{{ subtitle }}</p>
          </div>
          <button class="btn btn--ghost btn--icon" type="button" aria-label="Close" @click="emit('close')">
            ✕
          </button>
        </header>
        <div class="modal__body scroll-y">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="modal__foot">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 9500;
  display: grid;
  place-items: center;
  padding: 20px;
}

.modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(5, 4, 13, 0.78);
  backdrop-filter: blur(3px);
}

.modal__dialog {
  position: relative;
  width: min(660px, 100%);
  max-height: min(86vh, 820px);
  display: flex;
  flex-direction: column;
  padding: 0;
  animation: pop-in 160ms steps(4);
}

.modal__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 18px 14px;
  border-bottom: 2px solid var(--hard);
  background: linear-gradient(180deg, var(--panel-2), var(--panel));
}

.modal__sub {
  margin-top: 6px;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

.modal__body {
  padding: 18px;
  overflow-y: auto;
}

.modal__foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 18px;
  border-top: 2px solid var(--hard);
  background: var(--panel-2);
}
</style>
