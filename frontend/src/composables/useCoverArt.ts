import { seededRandom } from '../api/mockDb'

export interface CoverPixel {
  x: number
  y: number
  fill: string
}

export interface GeneratedCover {
  background: string
  accent: string
  pixels: CoverPixel[]
  /** Two initials burned into the corner of the sleeve */
  tag: string
}

const PALETTES: [string, string, string][] = [
  ['#1b1145', '#ff3d8b', '#34e6ff'],
  ['#0f2f3d', '#34e6ff', '#b6ff3d'],
  ['#3a1220', '#ffbf3d', '#ff3d8b'],
  ['#12233f', '#a97bff', '#34e6ff'],
  ['#22331a', '#b6ff3d', '#ffbf3d'],
  ['#2d1436', '#ff6fae', '#a97bff'],
  ['#341f0d', '#ff8a3d', '#f2e14b'],
  ['#101a33', '#4ad6c1', '#b6ff3d'],
]

const GRID_W = 7
const GRID_H = 7

/**
 * Builds a deterministic, mirrored pixel sprite for games that ship without cover art.
 * Same title in, same artwork out.
 */
export function generateCover(seed: string): GeneratedCover {
  const rand = seededRandom(seed)
  const palette = PALETTES[Math.floor(rand() * PALETTES.length)]
  const [background, accent, highlight] = palette
  const pixels: CoverPixel[] = []
  const half = Math.ceil(GRID_W / 2)

  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < half; x++) {
      const edgeBias = x === 0 ? 0.34 : 0.58
      if (rand() > edgeBias) continue
      const fill = rand() > 0.72 ? highlight : accent
      pixels.push({ x, y, fill })
      const mirrored = GRID_W - 1 - x
      if (mirrored !== x) pixels.push({ x: mirrored, y, fill })
    }
  }

  const words = seed.replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean)
  const tag = ((words[0]?.[0] ?? 'R') + (words[1]?.[0] ?? words[0]?.[1] ?? 'G')).toUpperCase()

  return { background, accent, pixels, tag }
}

export const COVER_GRID = { width: GRID_W, height: GRID_H }
