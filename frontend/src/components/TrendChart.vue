<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatMoney, formatMonth } from '../composables/useFormat'
import type { TrendSeries } from '../types/charts'

const props = withDefaults(
  defineProps<{
    series: TrendSeries[]
    height?: number
    yTicks?: number
  }>(),
  { height: 280, yTicks: 4 },
)

const wrapper = ref<HTMLElement | null>(null)
const width = ref(720)
const hoverIndex = ref<number | null>(null)

let observer: ResizeObserver | null = null

onMounted(() => {
  if (!wrapper.value) return
  observer = new ResizeObserver(([entry]) => {
    width.value = Math.max(320, entry.contentRect.width)
  })
  observer.observe(wrapper.value)
  width.value = Math.max(320, wrapper.value.clientWidth)
})

onBeforeUnmount(() => observer?.disconnect())

const pad = { top: 16, right: 14, bottom: 30, left: 58 }

const labels = computed(() => props.series[0]?.points.map((point) => point.date) ?? [])
const count = computed(() => labels.value.length)

const bounds = computed(() => {
  const values = props.series.flatMap((serie) => serie.points.map((point) => point.value))
  if (!values.length) return { min: 0, max: 1 }
  const max = Math.max(...values)
  const min = Math.min(...values)
  const headroom = (max - min) * 0.18 || max * 0.1 || 1
  return { min: Math.max(0, min - headroom), max: max + headroom }
})

const innerW = computed(() => width.value - pad.left - pad.right)
const innerH = computed(() => props.height - pad.top - pad.bottom)

function xAt(index: number): number {
  if (count.value <= 1) return pad.left + innerW.value / 2
  return pad.left + (index / (count.value - 1)) * innerW.value
}

function yAt(value: number): number {
  const { min, max } = bounds.value
  const ratio = max === min ? 0.5 : (value - min) / (max - min)
  return pad.top + innerH.value - ratio * innerH.value
}

const lines = computed(() =>
  props.series.map((serie) => ({
    ...serie,
    path: serie.points.map((point, index) => `${xAt(index)},${yAt(point.value)}`).join(' '),
    areaPath:
      `${pad.left},${pad.top + innerH.value} ` +
      serie.points.map((point, index) => `${xAt(index)},${yAt(point.value)}`).join(' ') +
      ` ${xAt(serie.points.length - 1)},${pad.top + innerH.value}`,
  })),
)

const gridLines = computed(() => {
  const { min, max } = bounds.value
  return Array.from({ length: props.yTicks + 1 }, (_, i) => {
    const value = min + ((max - min) * i) / props.yTicks
    return { value, y: yAt(value) }
  })
})

const xLabels = computed(() => {
  const step = Math.max(1, Math.ceil(count.value / (width.value > 620 ? 8 : 4)))
  return labels.value
    .map((date, index) => ({ date, index }))
    .filter((entry) => entry.index % step === 0 || entry.index === count.value - 1)
})

const tooltip = computed(() => {
  if (hoverIndex.value === null) return null
  const index = hoverIndex.value
  const x = xAt(index)
  return {
    x,
    flip: x > pad.left + innerW.value * 0.62,
    date: labels.value[index],
    rows: props.series.map((serie) => ({
      name: serie.name,
      color: serie.color,
      value: serie.points[index]?.value ?? 0,
      y: yAt(serie.points[index]?.value ?? 0),
    })),
  }
})

function onMove(event: MouseEvent) {
  const rect = (event.currentTarget as SVGElement).getBoundingClientRect()
  const relative = event.clientX - rect.left - pad.left
  const ratio = Math.min(1, Math.max(0, relative / innerW.value))
  hoverIndex.value = Math.round(ratio * (count.value - 1))
}
</script>

<template>
  <div ref="wrapper" class="chart">
    <svg
      class="chart__svg"
      :width="width"
      :height="height"
      @mousemove="onMove"
      @mouseleave="hoverIndex = null"
    >
      <defs>
        <linearGradient
          v-for="serie in lines"
          :id="`fill-${serie.name.replace(/\W/g, '')}`"
          :key="serie.name"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" :stop-color="serie.color" stop-opacity="0.42" />
          <stop offset="100%" :stop-color="serie.color" stop-opacity="0" />
        </linearGradient>
      </defs>

      <g class="chart__grid">
        <template v-for="line in gridLines" :key="line.value">
          <line
            :x1="pad.left"
            :x2="width - pad.right"
            :y1="line.y"
            :y2="line.y"
            stroke="#3b3372"
            stroke-width="1"
            stroke-dasharray="3 5"
          />
          <text :x="pad.left - 10" :y="line.y + 4" text-anchor="end" class="chart__tick">
            {{ formatMoney(line.value) }}
          </text>
        </template>
      </g>

      <g>
        <text
          v-for="label in xLabels"
          :key="label.date"
          :x="xAt(label.index)"
          :y="height - 9"
          text-anchor="middle"
          class="chart__tick"
        >
          {{ formatMonth(label.date) }}
        </text>
      </g>

      <g v-for="serie in lines" :key="serie.name">
        <polygon
          v-if="serie.area"
          :points="serie.areaPath"
          :fill="`url(#fill-${serie.name.replace(/\W/g, '')})`"
        />
        <polyline
          :points="serie.path"
          fill="none"
          :stroke="serie.color"
          stroke-width="3"
          stroke-linejoin="miter"
          stroke-linecap="square"
        />
      </g>

      <g v-if="tooltip">
        <line
          :x1="tooltip.x"
          :x2="tooltip.x"
          :y1="pad.top"
          :y2="pad.top + innerH"
          stroke="#f4f0ff"
          stroke-width="1"
          stroke-dasharray="2 4"
        />
        <rect
          v-for="row in tooltip.rows"
          :key="row.name"
          :x="tooltip.x - 5"
          :y="row.y - 5"
          width="10"
          height="10"
          :fill="row.color"
          stroke="#05040d"
          stroke-width="2"
        />
      </g>
    </svg>

    <div
      v-if="tooltip"
      class="chart__tooltip"
      :style="{ left: `${tooltip.x}px`, transform: tooltip.flip ? 'translateX(-100%)' : 'none' }"
    >
      <p class="eyebrow">{{ formatMonth(tooltip.date) }}</p>
      <p v-for="row in tooltip.rows" :key="row.name" class="chart__tooltip-row mono">
        <span class="chart__swatch" :style="{ background: row.color }"></span>
        {{ row.name }}
        <strong>{{ formatMoney(row.value) }}</strong>
      </p>
    </div>

    <ul class="chart__legend">
      <li v-for="serie in series" :key="serie.name" class="mono">
        <span class="chart__swatch" :style="{ background: serie.color }"></span>{{ serie.name }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.chart {
  position: relative;
}

.chart__svg {
  display: block;
  max-width: 100%;
}

.chart__tick {
  fill: #8079ad;
  font-family: var(--font-mono);
  font-size: 10px;
}

.chart__tooltip {
  position: absolute;
  top: 8px;
  min-width: 168px;
  padding: 9px 11px;
  background: var(--panel-2);
  border: 2px solid var(--hard);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  pointer-events: none;
  z-index: 3;
}

.chart__tooltip-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--ink-dim);
}

.chart__tooltip-row strong {
  margin-left: auto;
  color: var(--ink);
}

.chart__swatch {
  width: 9px;
  height: 9px;
  border: 1px solid var(--hard);
  flex: none;
}

.chart__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  list-style: none;
  margin: 6px 0 0;
  padding: 0 0 0 58px;
  font-size: 12px;
  color: var(--ink-dim);
}

.chart__legend li {
  display: flex;
  align-items: center;
  gap: 7px;
}
</style>
