import type { PricePoint } from './index'

export interface BarItem {
  id: string
  label: string
  value: number
  meta?: string
  color?: string
}

export interface TrendSeries {
  name: string
  color: string
  points: PricePoint[]
  /** Draw a translucent area below the line */
  area?: boolean
}
