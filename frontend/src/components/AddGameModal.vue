<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import ModalShell from './ModalShell.vue'
import GameCover from './GameCover.vue'
import ImageUploadField from './ImageUploadField.vue'
import { COVER_TARGET } from '../composables/useImageUpload'
import { useLibraryStore } from '../stores/library'
import { CONDITIONS, GENRES, type Condition, type Genre } from '../types'

const emit = defineEmits<{ close: []; created: [name: string] }>()

const store = useLibraryStore()
const saving = ref(false)
const submitted = ref(false)
const serverError = ref<string | null>(null)

const currentYear = new Date().getFullYear()

const form = reactive({
  name: '',
  releaseYear: '' as number | '',
  publisher: '',
  genre: GENRES[0] as Genre,
  consoleId: store.consoles[0]?.id ?? '',
  consolePlatform: '',
  marketPrice: '' as number | '',
  buyPrice: '' as number | '',
  condition: 'Complete in box' as Condition,
  coverUrl: '',
})

const errors = computed(() => {
  const result: Record<string, string> = {}
  if (!form.name.trim()) result.name = 'Give the cartridge a name.'
  if (!form.publisher.trim()) result.publisher = 'Publisher is required.'
  if (form.releaseYear === '' || Number.isNaN(Number(form.releaseYear))) {
    result.releaseYear = 'Enter a release year.'
  } else if (Number(form.releaseYear) < 1970 || Number(form.releaseYear) > currentYear + 1) {
    result.releaseYear = `Year must be between 1970 and ${currentYear + 1}.`
  }
  if (!form.consolePlatform.trim()) result.consolePlatform = 'Add a console platform which this game belongs to.'
  if (form.marketPrice === '' || Number(form.marketPrice) < 0) {
    result.marketPrice = 'Market price must be 0 or more.'
  }
  if (form.buyPrice === '' || Number(form.buyPrice) < 0) {
    result.buyPrice = 'Buy price must be 0 or more.'
  }
  return result
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

const previewAccent = computed(() => store.consoleById.get(form.consoleId)?.color)

async function submit() {
  submitted.value = true
  serverError.value = null
  if (!isValid.value) return
  saving.value = true
  try {
    await store.addGame({
      name: form.name.trim(),
      releaseYear: Number(form.releaseYear),
      publisher: form.publisher.trim(),
      genre: form.genre,
      marketPrice: Number(form.marketPrice),
      buyPrice: Number(form.buyPrice),
      consolePlatform: form.consolePlatform,
      condition: form.condition,
      coverUrl: form.coverUrl.trim() || undefined,
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
  <ModalShell title="Insert cartridge" subtitle="Add a game to the library" @close="emit('close')">
    <form id="add-game-form" class="form" novalidate @submit.prevent="submit">
      <div class="form__preview">
        <GameCover
          :title="form.name || 'New Entry'"
          :cover-url="form.coverUrl || undefined"
          :accent="previewAccent"
        />
        <p class="form__preview-hint mono">
          Cover art is generated from the title until you upload one.
        </p>
      </div>

      <div class="form__fields">
        <div class="field">
          <label class="field__label" for="game-name">Game name</label>
          <input
            id="game-name"
            v-model="form.name"
            class="input"
            :class="{ 'input--invalid': submitted && errors.name }"
            placeholder="Super Metroid"
            autocomplete="off"
          />
          <span v-if="submitted && errors.name" class="field__error">{{ errors.name }}</span>
        </div>

        <div class="form__row">
          <div class="field">
            <label class="field__label" for="game-year">Release year</label>
            <input
              id="game-year"
              v-model="form.releaseYear"
              class="input"
              :class="{ 'input--invalid': submitted && errors.releaseYear }"
              type="number"
              min="1970"
              :max="currentYear + 1"
              placeholder="1994"
            />
            <span v-if="submitted && errors.releaseYear" class="field__error">
              {{ errors.releaseYear }}
            </span>
          </div>

          <div class="field">
            <label class="field__label" for="game-publisher">Publisher</label>
            <input
              id="game-publisher"
              v-model="form.publisher"
              class="input"
              :class="{ 'input--invalid': submitted && errors.publisher }"
              placeholder="Nintendo"
              autocomplete="off"
            />
            <span v-if="submitted && errors.publisher" class="field__error">
              {{ errors.publisher }}
            </span>
          </div>
        </div>

        <div class="form__row">
          <div class="field">
            <label class="field__label" for="game-genre">Genre</label>
            <select id="game-genre" v-model="form.genre" class="select">
              <option v-for="genre in GENRES" :key="genre" :value="genre">{{ genre }}</option>
            </select>
          </div>

          <div class="field">
            <label class="field__label" for="game-console-platform">Console Platform</label>
            <input
              id="game-console-platform"
              v-model="form.consolePlatform"
              class="input"
              :class="{ 'input--invalid': submitted && errors.consolePlatform }"
              placeholder="Super Nintendo Entertainment System"
              autocomplete="off"
            />
            <span v-if="submitted && errors.consolePlatform" class="field__error">
              {{ errors.consolePlatform }}
            </span>
          </div>
        </div>

        <div class="form__row">
          <div class="field">
            <label class="field__label" for="game-market">Market price (€)</label>
            <input
              id="game-market"
              v-model="form.marketPrice"
              class="input"
              :class="{ 'input--invalid': submitted && errors.marketPrice }"
              type="number"
              min="0"
              step="1"
              placeholder="240"
            />
            <span v-if="submitted && errors.marketPrice" class="field__error">
              {{ errors.marketPrice }}
            </span>
          </div>

          <div class="field">
            <label class="field__label" for="game-buy">Buy price (€)</label>
            <input
              id="game-buy"
              v-model="form.buyPrice"
              class="input"
              :class="{ 'input--invalid': submitted && errors.buyPrice }"
              type="number"
              min="0"
              step="1"
              placeholder="130"
            />
            <span v-if="submitted && errors.buyPrice" class="field__error">
              {{ errors.buyPrice }}
            </span>
          </div>
        </div>

        <div class="form__row">
          <div class="field">
            <label class="field__label" for="game-condition">Condition</label>
            <select id="game-condition" v-model="form.condition" class="select">
              <option v-for="condition in CONDITIONS" :key="condition" :value="condition">
                {{ condition }}
              </option>
            </select>
          </div>
        </div>

        <ImageUploadField
          v-model="form.coverUrl"
          label="Cover image (optional)"
          input-id="game-cover"
          :target="COVER_TARGET"
          :preview="false"
          aspect="3 / 4"
        />

        <p v-if="serverError" class="field__error">{{ serverError }}</p>
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn btn--ghost" @click="emit('close')">Cancel</button>
      <button type="submit" form="add-game-form" class="btn btn--primary" :disabled="saving">
        {{ saving ? 'Saving…' : 'Add game' }}
      </button>
    </template>
  </ModalShell>
</template>

<style scoped>
.form {
  display: grid;
  grid-template-columns: 168px 1fr;
  gap: 20px;
  align-items: start;
}

.form__preview {
  position: sticky;
  top: 0;
}

.form__preview-hint {
  margin-top: 9px;
  font-size: 10px;
  line-height: 1.5;
  color: var(--muted);
}

.form__fields {
  display: grid;
  gap: 14px;
}

.form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 620px) {
  .form {
    grid-template-columns: 1fr;
  }

  .form__preview {
    width: 140px;
  }

  .form__row {
    grid-template-columns: 1fr;
  }
}
</style>
