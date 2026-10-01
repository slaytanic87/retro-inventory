<script setup lang="ts">
import { computed } from 'vue'
import { COVER_GRID, generateCover } from '../composables/useCoverArt'

const props = defineProps<{
  title: string
  coverUrl?: string
}>()

const art = computed(() => generateCover(props.title))
const cell = 10
const viewBox = `0 0 ${COVER_GRID.width * cell} ${COVER_GRID.height * cell}`
</script>

<template>
  <div class="cover" :style="{ '--cover-bg': art.background, '--cover-accent': art.accent }">
    <img v-if="coverUrl" class="cover__img" :src="coverUrl" :alt="`${title} cover`" loading="lazy" />
    <template v-else>
      <svg
        class="cover__sprite"
        :viewBox="viewBox"
        role="img"
        :aria-label="`Generated cover art for ${title}`"
      >
        <rect
          v-for="(pixel, index) in art.pixels"
          :key="index"
          :x="pixel.x * cell"
          :y="pixel.y * cell"
          :width="cell"
          :height="cell"
          :fill="pixel.fill"
        />
      </svg>
      <span class="cover__tag pixel">{{ art.tag }}</span>
    </template>
    <div class="cover__glare" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.cover {
  position: relative;
  aspect-ratio: 3 / 4;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 2px solid var(--hard);
  border-radius: var(--radius);
  background:
    radial-gradient(
      80% 60% at 50% 12%,
      color-mix(in srgb, var(--cover-accent) 34%, transparent),
      transparent 70%
    ),
    linear-gradient(165deg, var(--cover-bg), #07061a 85%);
}

.cover__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover__sprite {
  width: 58%;
  image-rendering: pixelated;
  filter: drop-shadow(3px 3px 0 rgba(0, 0, 0, 0.6));
}

.cover__tag {
  position: absolute;
  left: 7px;
  bottom: 7px;
  padding: 3px 5px;
  font-size: 9px;
  color: #05040d;
  background: var(--cover-accent);
  border: 2px solid var(--hard);
  border-radius: 2px;
}

.cover__glare {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.16) 0px,
      rgba(0, 0, 0, 0.16) 2px,
      transparent 2px,
      transparent 4px
    ),
    linear-gradient(115deg, rgba(255, 255, 255, 0.16) 0%, transparent 42%);
}
</style>
