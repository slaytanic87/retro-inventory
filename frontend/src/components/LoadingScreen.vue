<script setup lang="ts">
defineProps<{ label?: string }>()
</script>

<template>
  <div class="loader panel panel--flat" role="status">
    <p class="pixel loader__label">{{ label || 'Now loading' }}<span class="blink">…</span></p>
    <div class="loader__bar">
      <div class="loader__fill"></div>
    </div>
    <p class="mono loader__hint">Reading cartridge data from the mock API</p>
  </div>
</template>

<style scoped>
.loader {
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 56px 24px;
  text-align: center;
}

.loader__label {
  font-size: 13px;
  color: var(--cyan);
}

.loader__bar {
  width: min(320px, 80%);
  height: 18px;
  background: var(--bg-deep);
  border: 2px solid var(--hard);
  border-radius: 2px;
  overflow: hidden;
}

.loader__fill {
  height: 100%;
  width: 40%;
  background: repeating-linear-gradient(
    90deg,
    var(--magenta) 0 8px,
    var(--violet) 8px 16px
  );
  animation: slide 1.1s steps(10) infinite;
}

.loader__hint {
  font-size: 11px;
  color: var(--muted);
}

@keyframes slide {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(250%);
  }
}
</style>
