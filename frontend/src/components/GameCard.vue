<script setup lang="ts">
import { computed, ref } from 'vue'
import GameCover from './GameCover.vue'
import ImageDropZone from './ImageDropZone.vue'
import SparkLine from './SparkLine.vue'
import { generateCover } from '../composables/useCoverArt'
import { COVER_TARGET } from '../composables/useImageUpload'
import { formatMoney, formatPercent, formatSignedMoney, trendClass } from '../composables/useFormat'
import { useToasts } from '../composables/useToasts'
import { useLibraryStore } from '../stores/library'
import type { Game } from '../types'

const props = defineProps<{ game: Game }>()
const emit = defineEmits<{ remove: [id: string] }>()

const store = useLibraryStore()
const { push } = useToasts()

const savingCover = ref(false)
const art = computed(() => generateCover(props.game.name))

const platform = computed(() => props.game.consolePlatform)
const history = computed(() => store.historyById.get(props.game.id)?.points.map((p) => p.value) ?? [])
const change = computed(() => store.changeFor(props.game.id, 12))
const profit = computed(() => props.game.marketPrice - props.game.buyPrice)

async function saveCover(coverUrl: string | undefined) {
  savingCover.value = true
  try {
    await store.setGameCover(props.game.id, coverUrl)
    push(
      coverUrl ? `Cover updated for ${props.game.name}.` : `Cover removed from ${props.game.name}.`,
      'success',
    )
  } catch (error) {
    push(error instanceof Error ? error.message : 'Could not save that cover.', 'error')
  } finally {
    savingCover.value = false
  }
}
</script>

<template>
  <article class="card panel" :style="{ '--platform': art.accent ?? 'var(--violet)' }">
    <div class="card__art">
      <ImageDropZone
        :name="game.name"
        noun="cover"
        :has-image="Boolean(game.coverUrl)"
        :busy="savingCover"
        :target="COVER_TARGET"
        @uploaded="saveCover"
        @cleared="saveCover(undefined)"
        @failed="push($event, 'error')"
      >
        <GameCover :title="game.name" :cover-url="game.coverUrl" />
      </ImageDropZone>
      <span class="card__platform pixel">{{ platform ?? 'Unknown' }}</span>
    </div>

    <div class="card__body">
      <header class="card__head">
        <h3 class="card__title">{{ game.name }}</h3>
        <button
          class="card__remove"
          type="button"
          :aria-label="`Remove ${game.name} from the collection`"
          @click="emit('remove', game.id)"
        >
          ✕
        </button>
      </header>

      <p class="card__meta mono">{{ game.publisher }} · {{ game.releaseYear }}</p>

      <div class="card__chips">
        <span class="chip">{{ game.genre }}</span>
        <span class="chip">{{ game.condition }}</span>
      </div>

      <div class="card__prices">
        <div>
          <span class="eyebrow">Market</span>
          <p class="card__price pixel">{{ formatMoney(game.marketPrice) }}</p>
        </div>
        <div>
          <span class="eyebrow">Paid</span>
          <p class="card__paid mono">{{ formatMoney(game.buyPrice) }}</p>
        </div>
        <SparkLine
          :values="history"
          :color="change.pct >= 0 ? 'var(--lime)' : 'var(--danger)'"
          :width="96"
          :height="32"
        />
      </div>

      <footer class="card__foot">
        <span class="chip chip--dot" :class="change.pct >= 0 ? 'chip--up' : 'chip--down'">
          {{ formatPercent(change.pct) }} / 12m
        </span>
        <span class="card__profit mono" :class="trendClass(profit)">
          {{ formatSignedMoney(profit) }} vs. paid
        </span>
      </footer>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  overflow: hidden;
  transition: transform 120ms steps(2), box-shadow 120ms steps(2);
}

.card:hover {
  transform: translate(-3px, -3px);
  box-shadow: 7px 7px 0 var(--hard);
}

.card__art {
  position: relative;
  padding: 14px 14px 0;
}

.card__platform {
  position: absolute;
  right: 20px;
  top: 20px;
  padding: 5px 7px;
  font-size: 8px;
  color: #05040d;
  background: var(--platform);
  border: 2px solid var(--hard);
  border-radius: 2px;
}

.card__body {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 14px;
}

.card__head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.card__title {
  flex: 1;
  font-size: 11px;
  line-height: 1.6;
}

.card__remove {
  flex: none;
  width: 24px;
  height: 24px;
  color: var(--muted);
  background: transparent;
  border: 2px solid var(--line);
  border-radius: 2px;
  cursor: pointer;
  line-height: 1;
}

.card__remove:hover {
  color: #fff;
  background: var(--danger);
  border-color: var(--hard);
}

.card__meta {
  font-size: 12px;
  color: var(--ink-dim);
}

.card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card__prices {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  padding-top: 10px;
  border-top: 2px dashed var(--line);
}

.card__price {
  font-size: 13px;
  color: var(--lime);
  margin-top: 5px;
}

.card__paid {
  font-size: 13px;
  color: var(--ink-dim);
  margin-top: 5px;
}

.card__prices > :last-child {
  margin-left: auto;
}

.card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.card__profit {
  font-size: 11px;
}
</style>
