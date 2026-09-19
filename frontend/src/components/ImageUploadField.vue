<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ACCEPT_ATTRIBUTE,
  COVER_TARGET,
  dataUrlBytes,
  formatBytes,
  useImageUpload,
  type ImageTarget,
} from '../composables/useImageUpload'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    hint?: string
    inputId?: string
    target?: ImageTarget
    /** CSS aspect-ratio for the preview box. */
    aspect?: string
    /** How the preview fills its box. */
    fit?: 'cover' | 'contain'
    /** Set to false when the surrounding form already previews the image. */
    preview?: boolean
  }>(),
  {
    modelValue: '',
    label: 'Image',
    inputId: 'image-upload',
    aspect: '3 / 4',
    fit: 'cover',
    preview: true,
  },
)

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const fileInput = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const urlDraft = ref(isDataUrl(props.modelValue) ? '' : props.modelValue)

const { busy, error, processFile, reset } = useImageUpload(props.target ?? COVER_TARGET)

const hasImage = computed(() => Boolean(props.modelValue))
const uploadedSize = computed(() =>
  isDataUrl(props.modelValue) ? formatBytes(dataUrlBytes(props.modelValue)) : null,
)

function isDataUrl(value: string): boolean {
  return value.startsWith('data:')
}

watch(
  () => props.modelValue,
  (value) => {
    if (!isDataUrl(value) && value !== urlDraft.value) urlDraft.value = value
    if (!value) reset()
  },
)

async function handleFile(file: File | undefined) {
  const dataUrl = await processFile(file)
  if (!dataUrl) return
  urlDraft.value = ''
  emit('update:modelValue', dataUrl)
}

function onPick(event: Event) {
  const input = event.target as HTMLInputElement
  void handleFile(input.files?.[0]).finally(() => {
    // Allows picking the very same file again after a removal.
    input.value = ''
  })
}

function onDrop(event: DragEvent) {
  dragging.value = false
  void handleFile(event.dataTransfer?.files?.[0])
}

function onPaste(event: ClipboardEvent) {
  const file = event.clipboardData?.files?.[0]
  if (!file) return
  event.preventDefault()
  void handleFile(file)
}

function onUrlInput() {
  reset()
  emit('update:modelValue', urlDraft.value.trim())
}

function clear() {
  urlDraft.value = ''
  reset()
  emit('update:modelValue', '')
}

function browse() {
  fileInput.value?.click()
}
</script>

<template>
  <div class="upload">
    <span class="field__label">{{ label }}</span>

    <div
      class="upload__zone"
      :class="{ 'upload__zone--over': dragging, 'upload__zone--busy': busy }"
      role="button"
      tabindex="0"
      :aria-label="`${label}: choose a file, or drop one here`"
      @click="browse"
      @keydown.enter.prevent="browse"
      @keydown.space.prevent="browse"
      @dragover.prevent="dragging = true"
      @dragenter.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
      @paste="onPaste"
    >
      <div v-if="hasImage && preview" class="upload__preview" :style="{ aspectRatio: aspect }">
        <img class="upload__img" :src="modelValue" alt="" :style="{ objectFit: fit }" />
      </div>
      <span v-else-if="!hasImage" class="upload__icon" aria-hidden="true">🖼</span>

      <p class="upload__text mono">
        <template v-if="busy">Processing…</template>
        <template v-else-if="hasImage">Click or drop to replace</template>
        <template v-else>Drop an image, or click to browse</template>
      </p>
      <p class="upload__note mono">
        PNG · JPEG · WebP · GIF — resized automatically
        <template v-if="uploadedSize"> · stored at {{ uploadedSize }}</template>
      </p>

      <input
        :id="inputId"
        ref="fileInput"
        class="upload__input"
        type="file"
        :accept="ACCEPT_ATTRIBUTE"
        @change="onPick"
        @click.stop
      />
    </div>

    <div class="upload__actions">
      <button type="button" class="btn btn--ghost btn--sm" :disabled="busy" @click="browse">
        {{ hasImage ? 'Replace image' : 'Choose file' }}
      </button>
      <button
        v-if="hasImage"
        type="button"
        class="btn btn--ghost btn--sm"
        :disabled="busy"
        @click="clear"
      >
        Remove
      </button>
    </div>

    <div class="field">
      <label class="field__label field__label--soft" :for="`${inputId}-url`">
        …or paste an image URL
      </label>
      <input
        :id="`${inputId}-url`"
        v-model="urlDraft"
        class="input"
        placeholder="https://…"
        autocomplete="off"
        @input="onUrlInput"
      />
    </div>

    <p v-if="error" class="field__error">{{ error }}</p>
    <p v-else-if="hint" class="upload__hint mono">{{ hint }}</p>
  </div>
</template>

<style scoped>
.upload {
  display: grid;
  gap: 10px;
}

.upload__input {
  display: none;
}

.upload__zone {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 14px;
  text-align: center;
  background: var(--panel-2);
  border: 2px dashed var(--line);
  border-radius: var(--radius);
  cursor: pointer;
}

.upload__zone:hover,
.upload__zone:focus-visible {
  border-color: var(--violet);
  outline: none;
}

.upload__zone--over {
  border-color: var(--lime);
  border-style: solid;
  background: color-mix(in srgb, var(--lime) 12%, var(--panel-2));
}

.upload__zone--busy {
  opacity: 0.65;
  cursor: progress;
}

.upload__preview {
  width: min(150px, 100%);
  overflow: hidden;
  border: 2px solid var(--hard);
  border-radius: 2px;
  background: #05040d;
}

.upload__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.upload__icon {
  font-size: 26px;
  line-height: 1;
}

.upload__text {
  font-size: 11px;
  color: var(--ink-dim);
}

.upload__note,
.upload__hint {
  font-size: 10px;
  line-height: 1.5;
  color: var(--muted);
}

.upload__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.field__label--soft {
  color: var(--muted);
}
</style>
