export type Genre =
  | 'Platformer'
  | 'RPG'
  | 'Shoot \'em up'
  | 'Fighting'
  | 'Racing'
  | 'Action-Adventure'
  | 'Puzzle'
  | 'Sports'
  | 'Survival Horror'
  | 'Strategy'

export const GENRES: Genre[] = [
  'Platformer',
  'RPG',
  'Shoot \'em up',
  'Fighting',
  'Racing',
  'Action-Adventure',
  'Puzzle',
  'Sports',
  'Survival Horror',
  'Strategy',
]

export type Condition = 'Loose' | 'Complete in box' | 'Sealed'

export const CONDITIONS: Condition[] = ['Loose', 'Complete in box', 'Sealed']

export interface Game {
  id: string
  /** Name of the game */
  name: string
  releaseYear: number
  publisher: string
  genre: Genre
  /** Estimated price the item would fetch today, in EUR */
  marketPrice: number
  /** What the collector actually paid, in EUR */
  buyPrice: number
  /** Name of the console the game belongs to */
  consolePlatform: string
  /** Optional cover artwork. Falls back to generated pixel art when empty. */
  coverUrl?: string
  condition: Condition
  /** ISO date the item entered the collection */
  addedAt: string
  /** Monthly market price track record; the last point matches `marketPrice`. */
  priceHistory: PricePoint[]
}

export interface GameConsole {
  id: string
  name: string
  shortName: string
  manufacturer: string
  releaseYear: number
  marketPrice: number
  buyPrice: number
  condition: Condition
  /** Accent colour used across the UI for this platform */
  color: string
  imageUrl?: string
  addedAt: string
  /** Monthly market price track record; the last point matches `marketPrice`. */
  priceHistory: PricePoint[]
}

export interface PricePoint {
  /** ISO month, e.g. 2025-03-01 */
  date: string
  value: number
}

export interface PriceHistory {
  entityId: string
  entityType: 'game' | 'console'
  points: PricePoint[]
}

export type NewGame = Omit<Game, 'id' | 'addedAt' | 'priceHistory'>
export type NewConsole = Omit<GameConsole, 'id' | 'addedAt' | 'priceHistory'>
