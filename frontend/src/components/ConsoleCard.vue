<script setup lang="ts">
import { computed, ref } from 'vue'
import ImageDropZone from './ImageDropZone.vue'
import SparkLine from './SparkLine.vue'
import { CONSOLE_TARGET } from '../composables/useImageUpload'
import { formatMoney, formatPercent, formatSignedMoney, trendClass } from '../composables/useFormat'
import { useToasts } from '../composables/useToasts'
import { useLibraryStore } from '../stores/library'
import type { GameConsole } from '../types'

const props = defineProps<{ item: GameConsole }>()
const emit = defineEmits<{ remove: [id: string] }>()

const store = useLibraryStore()
const { push } = useToasts()

const savingImage = ref(false)

const history = computed(() => store.historyById.get(props.item.id)?.points.map((p) => p.value) ?? [])
const change = computed(() => store.changeFor(props.item.id, 12))
const owned = computed(() => store.games.filter((game) => game.consoleId === props.item.id))
const libraryValue = computed(() => owned.value.reduce((acc, game) => acc + game.marketPrice, 0))
const profit = computed(() => props.item.marketPrice - props.item.buyPrice)

async function saveImage(imageUrl: string | undefined) {
  savingImage.value = true
  try {
    await store.setConsoleImage(props.item.id, imageUrl)
    push(
      imageUrl ? `Photo updated for ${props.item.name}.` : `Photo removed from ${props.item.name}.`,
      'success',
    )
  } catch (error) {
    push(error instanceof Error ? error.message : 'Could not save that photo.', 'error')
  } finally {
    savingImage.value = false
  }
}
</script>

<template>
  <article class="console panel" :style="{ '--platform': item.color }">
    <ImageDropZone
      class="console__art"
      :name="item.name"
      noun="photo"
      :has-image="Boolean(item.imageUrl)"
      :busy="savingImage"
      :target="CONSOLE_TARGET"
      @uploaded="saveImage"
      @cleared="saveImage(undefined)"
      @failed="push($event, 'error')"
    >
      <img v-if="item.imageUrl" class="console__img" :src="item.imageUrl" :alt="item.name" loading="lazy" />
      <svg v-else viewBox="0 0 120 72" class="console__svg" role="img" :aria-label="`${item.name} illustration`">
        <rect x="6" y="16" width="108" height="46" rx="2" fill="var(--platform)" stroke="#05040d" stroke-width="3" />
        <rect x="6" y="16" width="108" height="9" fill="rgba(255,255,255,0.28)" />
        <rect x="16" y="32" width="46" height="16" fill="#05040d" opacity="0.75" />
        <rect x="20" y="36" width="38" height="3" fill="var(--platform)" opacity="0.6" />
        <circle cx="80" cy="40" r="6" fill="#05040d" opacity="0.8" />
        <rect x="92" y="34" width="12" height="12" fill="#05040d" opacity="0.8" />
        <rect x="24" y="62" width="14" height="6" fill="#05040d" />
        <rect x="82" y="62" width="14" height="6" fill="#05040d" />
        <rect x="46" y="6" width="28" height="10" fill="#05040d" />
      </svg>
      <button
        class="console__remove"
        type="button"
        :aria-label="`Remove ${item.name} from the collection`"
        @click="emit('remove', item.id)"
      >
        ✕
      </button>
    </ImageDropZone>

    <div class="console__body">
      <h3 class="console__title">{{ item.name }}</h3>
      <p class="console__meta mono">{{ item.manufacturer }} · {{ item.releaseYear }}</p>

      <div class="console__chips">
        <span class="chip">{{ item.condition }}</span>
        <span class="chip">{{ owned.length }} games</span>
      </div>

      <dl class="console__stats">
        <div>
          <dt class="eyebrow">Hardware</dt>
          <dd class="pixel">{{ formatMoney(item.marketPrice) }}</dd>
        </div>
        <div>
          <dt class="eyebrow">Library</dt>
          <dd class="mono">{{ formatMoney(libraryValue) }}</dd>
        </div>
        <div>
          <dt class="eyebrow">Paid</dt>
          <dd class="mono">{{ formatMoney(item.buyPrice) }}</dd>
        </div>
      </dl>

      <footer class="console__foot">
        <span class="chip chip--dot" :class="change.pct >= 0 ? 'chip--up' : 'chip--down'">
          {{ formatPercent(change.pct) }} / 12m
        </span>
        <span class="console__profit mono" :class="trendClass(profit)">
          {{ formatSignedMoney(profit) }}
        </span>
        <SparkLine
          :values="history"
          :color="change.pct >= 0 ? 'var(--lime)' : 'var(--danger)'"
          :width="88"
          :height="30"
        />
      </footer>
    </div>
  </article>
</template>

<style scoped>
.console {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  transition: transform 120ms steps(2), box-shadow 120ms steps(2);
}

.console:hover {
  transform: translate(-3px, -3px);
  box-shadow: 7px 7px 0 var(--hard);
}

.console__art {
  position: relative;
  display: grid;
  place-items: center;
  padding: 20px;
  background:
    radial-gradient(70% 90% at 50% 20%, color-mix(in srgb, var(--platform) 30%, transparent), transparent 70%),
    repeating-linear-gradient(45deg, var(--panel-2) 0 10px, var(--panel) 10px 20px);
  border-bottom: 2px solid var(--hard);
}

.console__svg,
.console__img {
  width: min(230px, 100%);
  filter: drop-shadow(4px 4px 0 rgba(0, 0, 0, 0.55));
}

.console__img {
  aspect-ratio: 5 / 3;
  object-fit: contain;
}

.console__remove {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  color: var(--muted);
  background: var(--panel);
  border: 2px solid var(--line);
  border-radius: 2px;
  cursor: pointer;
  line-height: 1;
}

.console__remove:hover {
  color: #fff;
  background: var(--danger);
  border-color: var(--hard);
}

.console__body {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 14px;
}

.console__title {
  font-size: 11px;
  line-height: 1.6;
  color: var(--platform);
}

.console__meta {
  font-size: 12px;
  color: var(--ink-dim);
}

.console__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.console__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 0;
  padding-top: 10px;
  border-top: 2px dashed var(--line);
}

.console__stats dd {
  margin: 5px 0 0;
  font-size: 12px;
  color: var(--ink);
}

.console__stats div:first-child dd {
  color: var(--lime);
}

.console__foot {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.console__foot > :last-child {
  margin-left: auto;
}

.console__profit {
  font-size: 11px;
}
</style>
