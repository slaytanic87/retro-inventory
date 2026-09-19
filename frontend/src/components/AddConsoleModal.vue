<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import ModalShell from './ModalShell.vue'
import ImageUploadField from './ImageUploadField.vue'
import { CONSOLE_TARGET } from '../composables/useImageUpload'
import { useLibraryStore } from '../stores/library'
import { CONDITIONS, type Condition } from '../types'

const emit = defineEmits<{ close: []; created: [name: string] }>()

const store = useLibraryStore()
const saving = ref(false)
const submitted = ref(false)
const serverError = ref<string | null>(null)

const currentYear = new Date().getFullYear()

const SWATCHES = [
  '#e14b4b',
  '#ff8a3d',
  '#ffbf3d',
  '#b6ff3d',
  '#4ad6c1',
  '#34e6ff',
  '#8b7bd8',
  '#ff6fae',
]

const form = reactive({
  name: '',
  shortName: '',
  manufacturer: '',
  releaseYear: '' as number | '',
  marketPrice: '' as number | '',
  buyPrice: '' as number | '',
  condition: 'Complete in box' as Condition,
  color: SWATCHES[5],
  imageUrl: '',
})

const errors = computed(() => {
  const result: Record<string, string> = {}
  if (!form.name.trim()) result.name = 'Name the machine.'
  if (!form.shortName.trim()) result.shortName = 'A short label keeps cards readable.'
  if (!form.manufacturer.trim()) result.manufacturer = 'Manufacturer is required.'
  if (form.releaseYear === '' || Number.isNaN(Number(form.releaseYear))) {
    result.releaseYear = 'Enter a release year.'
  } else if (Number(form.releaseYear) < 1970 || Number(form.releaseYear) > currentYear + 1) {
    result.releaseYear = `Year must be between 1970 and ${currentYear + 1}.`
  }
  if (form.marketPrice === '' || Number(form.marketPrice) < 0) {
    result.marketPrice = 'Market price must be 0 or more.'
  }
  if (form.buyPrice === '' || Number(form.buyPrice) < 0) {
    result.buyPrice = 'Buy price must be 0 or more.'
  }
  return result
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

async function submit() {
  submitted.value = true
  serverError.value = null
  if (!isValid.value) return
  saving.value = true
  try {
    await store.addConsole({
      name: form.name.trim(),
      shortName: form.shortName.trim(),
      manufacturer: form.manufacturer.trim(),
      releaseYear: Number(form.releaseYear),
      marketPrice: Number(form.marketPrice),
      buyPrice: Number(form.buyPrice),
      condition: form.condition,
      color: form.color,
      imageUrl: form.imageUrl.trim() || undefined,
    })
    emit('created', form.name.trim())
    emit('close')
  } catch (error) {
    serverError.value = error instanceof Error ? error.message : 'Saving failed. Try again.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <ModalShell title="Plug in console" subtitle="Add hardware to the collection" @close="emit('close')">
    <form id="add-console-form" class="form" novalidate @submit.prevent="submit">
      <div class="form__row">
        <div class="field">
          <label class="field__label" for="con-name">Console name</label>
          <input
            id="con-name"
            v-model="form.name"
            class="input"
            :class="{ 'input--invalid': submitted && errors.name }"
            placeholder="Super Nintendo"
            autocomplete="off"
          />
          <span v-if="submitted && errors.name" class="field__error">{{ errors.name }}</span>
        </div>

        <div class="field">
          <label class="field__label" for="con-short">Short label</label>
          <input
            id="con-short"
            v-model="form.shortName"
            class="input"
            :class="{ 'input--invalid': submitted && errors.shortName }"
            placeholder="SNES"
            maxlength="14"
            autocomplete="off"
          />
          <span v-if="submitted && errors.shortName" class="field__error">
            {{ errors.shortName }}
          </span>
        </div>
      </div>

      <div class="form__row">
        <div class="field">
          <label class="field__label" for="con-manufacturer">Manufacturer</label>
          <input
            id="con-manufacturer"
            v-model="form.manufacturer"
            class="input"
            :class="{ 'input--invalid': submitted && errors.manufacturer }"
            placeholder="Nintendo"
            autocomplete="off"
          />
          <span v-if="submitted && errors.manufacturer" class="field__error">
            {{ errors.manufacturer }}
          </span>
        </div>

        <div class="field">
          <label class="field__label" for="con-year">Release year</label>
          <input
            id="con-year"
            v-model="form.releaseYear"
            class="input"
            :class="{ 'input--invalid': submitted && errors.releaseYear }"
            type="number"
            min="1970"
            :max="currentYear + 1"
            placeholder="1990"
          />
          <span v-if="submitted && errors.releaseYear" class="field__error">
            {{ errors.releaseYear }}
          </span>
        </div>
      </div>

      <div class="form__row">
        <div class="field">
          <label class="field__label" for="con-market">Market price (€)</label>
          <input
            id="con-market"
            v-model="form.marketPrice"
            class="input"
            :class="{ 'input--invalid': submitted && errors.marketPrice }"
            type="number"
            min="0"
            step="1"
            placeholder="265"
          />
          <span v-if="submitted && errors.marketPrice" class="field__error">
            {{ errors.marketPrice }}
          </span>
        </div>

        <div class="field">
          <label class="field__label" for="con-buy">Buy price (€)</label>
          <input
            id="con-buy"
            v-model="form.buyPrice"
            class="input"
            :class="{ 'input--invalid': submitted && errors.buyPrice }"
            type="number"
            min="0"
            step="1"
            placeholder="180"
          />
          <span v-if="submitted && errors.buyPrice" class="field__error">
            {{ errors.buyPrice }}
          </span>
        </div>
      </div>

      <div class="form__row">
        <div class="field">
          <label class="field__label" for="con-condition">Condition</label>
          <select id="con-condition" v-model="form.condition" class="select">
            <option v-for="condition in CONDITIONS" :key="condition" :value="condition">
              {{ condition }}
            </option>
          </select>
        </div>
      </div>

      <ImageUploadField
        v-model="form.imageUrl"
        label="Console photo (optional)"
        input-id="con-image"
        hint="Pixel-art hardware is drawn for you until you upload a photo."
        :target="CONSOLE_TARGET"
        aspect="5 / 3"
        fit="contain"
      />

      <div class="field">
        <span class="field__label">Accent colour</span>
        <div class="swatches">
          <button
            v-for="swatch in SWATCHES"
            :key="swatch"
            type="button"
            class="swatch"
            :class="{ 'swatch--active': form.color === swatch }"
            :style="{ background: swatch }"
            :aria-label="`Use accent colour ${swatch}`"
            :aria-pressed="form.color === swatch"
            @click="form.color = swatch"
          ></button>
        </div>
      </div>

      <p v-if="serverError" class="field__error">{{ serverError }}</p>
    </form>

    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancel</button>
      <button type="submit" form="add-console-form" class="btn btn--cyan" :disabled="saving">
        {{ saving ? 'Saving…' : 'Add console' }}
      </button>
    </template>
  </ModalShell>
</template>

<style scoped>
.form {
  display: grid;
  gap: 14px;
}

.form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.swatch {
  width: 34px;
  height: 26px;
  border: 2px solid var(--hard);
  border-radius: 2px;
  cursor: pointer;
  box-shadow: 3px 3px 0 var(--hard);
}

.swatch--active {
  outline: 3px solid var(--ink);
  outline-offset: 2px;
}

@media (max-width: 620px) {
  .form__row {
    grid-template-columns: 1fr;
  }
}
</style>
