<script setup lang="ts">
import { ref } from 'vue'
import {
  ACCEPT_ATTRIBUTE,
  COVER_TARGET,
  useImageUpload,
  type ImageTarget,
} from '../composables/useImageUpload'

const props = withDefaults(
  defineProps<{
    /** Name of the item, used to build accessible labels. */
    name: string
    hasImage?: boolean
    busy?: boolean
    target?: ImageTarget
    /** Wording used in the tooltips, e.g. "cover" or "photo". */
    noun?: string
  }>(),
  { hasImage: false, busy: false, noun: 'image' },
)

const emit = defineEmits<{ uploaded: [string]; cleared: []; failed: [string] }>()

const fileInput = ref<HTMLInputElement | null>(null)
const dragging = ref(false)

const { busy: processing, error, processFile } = useImageUpload(props.target ?? COVER_TARGET)

async function handleFile(file: File | undefined) {
  if (!file) return
  const dataUrl = await processFile(file)
  if (dataUrl) emit('uploaded', dataUrl)
  else if (error.value) emit('failed', error.value)
}

function onPick(event: Event) {
  const input = event.target as HTMLInputElement
  void handleFile(input.files?.[0]).finally(() => {
    input.value = ''
  })
}

function onDrop(event: DragEvent) {
  dragging.value = false
  void handleFile(event.dataTransfer?.files?.[0])
}

function browse() {
  fileInput.value?.click()
}
</script>

<template>
  <div
    class="drop"
    :class="{ 'drop--over': dragging, 'drop--busy': processing || busy }"
    @dragover.prevent="dragging = true"
    @dragenter.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <slot />

    <div class="drop__tools">
      <button
        class="drop__btn"
        type="button"
        :disabled="processing || busy"
        :title="hasImage ? `Replace ${noun}` : `Upload ${noun}`"
        :aria-label="`${hasImage ? 'Replace' : 'Upload'} ${noun} for ${name}`"
        @click="browse"
      >
        {{ hasImage ? '🔄' : '⬆' }}
      </button>
      <button
        v-if="hasImage"
        class="drop__btn"
        type="button"
        :disabled="processing || busy"
        :title="`Remove ${noun}`"
        :aria-label="`Remove ${noun} from ${name}`"
        @click="emit('cleared')"
      >
        🗑
      </button>
    </div>

    <p v-if="processing || busy" class="drop__status pixel">Uploading…</p>
    <p v-else-if="dragging" class="drop__status pixel">Drop to upload</p>

    <input
      ref="fileInput"
      class="drop__input"
      type="file"
      :accept="ACCEPT_ATTRIBUTE"
      tabindex="-1"
      @change="onPick"
    />
  </div>
</template>

<style scoped>
.drop {
  position: relative;
}

.drop__input {
  display: none;
}

.drop--over::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px dashed var(--lime);
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--lime) 14%, transparent);
  pointer-events: none;
}

.drop--busy {
  opacity: 0.75;
}

.drop__tools {
  position: absolute;
  left: 4px;
  bottom: 4px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 120ms steps(2);
}

.drop:hover .drop__tools,
.drop:focus-within .drop__tools {
  opacity: 1;
}

.drop__btn {
  width: 26px;
  height: 26px;
  font-size: 11px;
  line-height: 1;
  color: var(--ink);
  background: var(--panel);
  border: 2px solid var(--hard);
  border-radius: 2px;
  cursor: pointer;
}

.drop__btn:hover:not(:disabled) {
  background: var(--panel-2);
  border-color: var(--violet);
}

.drop__btn:disabled {
  cursor: progress;
  opacity: 0.6;
}

.drop__status {
  position: absolute;
  inset-inline: 4px;
  top: 4px;
  padding: 4px;
  font-size: 8px;
  text-align: center;
  color: #05040d;
  background: var(--lime);
  border: 2px solid var(--hard);
  border-radius: 2px;
  pointer-events: none;
}

@media (hover: none) {
  .drop__tools {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .drop__tools {
    transition: none;
  }
}
</style>
