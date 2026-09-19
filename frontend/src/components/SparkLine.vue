<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    values: number[]
    color?: string
    width?: number
    height?: number
  }>(),
  { color: 'var(--cyan)', width: 120, height: 34 },
)

const path = computed(() => {
  const values = props.values
  if (values.length < 2) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * (props.width - 4) + 2
      const y = props.height - 3 - ((value - min) / span) * (props.height - 8)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})
</script>

<template>
  <svg
    class="spark"
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    aria-hidden="true"
  >
    <polyline
      :points="path"
      fill="none"
      :stroke="color"
      stroke-width="2"
      stroke-linejoin="miter"
      stroke-linecap="square"
    />
  </svg>
</template>

<style scoped>
.spark {
  display: block;
  shape-rendering: crispEdges;
}
</style>
