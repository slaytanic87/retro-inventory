import type { Game, GameConsole, NewConsole, NewGame, PriceHistory } from '../types'
import { consoles as seedConsoles, flatPriceHistory, games as seedGames } from './mockDb'

/**
 * Fake REST client.
 *
 * There is no backend in this project: every call below resolves against an in-memory
 * "database" after a simulated network round-trip, so the UI can be developed and
 * demoed exactly as if it were talking to a real API.
 */

const LATENCY_MS = 320
const STORAGE_KEY = 'retro-inventory/db/v2'

interface Db {
  games: Game[]
  consoles: GameConsole[]
}

function loadDb(): Db {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Db
        if (Array.isArray(parsed.games) && Array.isArray(parsed.consoles)) return parsed
      }
    } catch {
      // Corrupt payload: fall through to the seed data.
    }
  }
  return { games: structuredClone(seedGames), consoles: structuredClone(seedConsoles) }
}

const db: Db = loadDb()

function persist(): boolean {
  if (typeof localStorage === 'undefined') return true
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
    return true
  } catch {
    // Storage full or unavailable.
    return false
  }
}

const STORAGE_FULL_MESSAGE =
  'The local collection storage is full — remove or shrink some images and try again.'

/** Rolls the in-memory db back when a write could not be persisted (usually an image blowing the quota). */
function persistOrRollback(rollback: () => void): void {
  if (persist()) return
  rollback()
  persist()
  throw new Error(STORAGE_FULL_MESSAGE)
}

function fail<T>(message: string): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), LATENCY_MS)
  })
}

function delay<T>(payload: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(payload)), LATENCY_MS + Math.random() * 180)
  })
}

function makeId(prefix: string, name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 28)
  return `${prefix}-${slug || 'item'}-${Math.random().toString(36).slice(2, 6)}`
}

export const api = {
  /** GET /api/games */
  listGames(): Promise<Game[]> {
    return delay(db.games)
  },

  /** GET /api/consoles */
  listConsoles(): Promise<GameConsole[]> {
    return delay(db.consoles)
  },

  /** GET /api/price-history */
  listPriceHistory(): Promise<PriceHistory[]> {
    const histories: PriceHistory[] = [
      ...db.games.map((game) => ({
        entityId: game.id,
        entityType: 'game' as const,
        points: game.priceHistory,
      })),
      ...db.consoles.map((item) => ({
        entityId: item.id,
        entityType: 'console' as const,
        points: item.priceHistory,
      })),
    ]
    return delay(histories)
  },

  /** POST /api/games */
  async createGame(payload: NewGame): Promise<Game> {
    const game: Game = {
      ...payload,
      id: makeId('gm', payload.name),
      addedAt: new Date().toISOString().slice(0, 10),
      priceHistory: flatPriceHistory(payload.marketPrice),
    }
    const previous = db.games
    db.games = [game, ...db.games]
    persistOrRollback(() => {
      db.games = previous
    })
    return delay(game)
  },

  /** POST /api/consoles */
  async createConsole(payload: NewConsole): Promise<GameConsole> {
    const item: GameConsole = {
      ...payload,
      id: makeId('con', payload.shortName || payload.name),
      addedAt: new Date().toISOString().slice(0, 10),
      priceHistory: flatPriceHistory(payload.marketPrice),
    }
    const previous = db.consoles
    db.consoles = [item, ...db.consoles]
    persistOrRollback(() => {
      db.consoles = previous
    })
    return delay(item)
  },

  /** PATCH /api/games/:id/cover */
  async updateGameCover(id: string, coverUrl: string | undefined): Promise<Game> {
    const game = db.games.find((entry) => entry.id === id)
    if (!game) return fail<Game>('That game is no longer in the collection.')
    const previous = game.coverUrl
    if (coverUrl) game.coverUrl = coverUrl
    else delete game.coverUrl
    persistOrRollback(() => {
      if (previous) game.coverUrl = previous
      else delete game.coverUrl
    })
    return delay(game)
  },

  /** PATCH /api/consoles/:id/image */
  async updateConsoleImage(id: string, imageUrl: string | undefined): Promise<GameConsole> {
    const item = db.consoles.find((entry) => entry.id === id)
    if (!item) return fail<GameConsole>('That console is no longer in the collection.')
    const previous = item.imageUrl
    if (imageUrl) item.imageUrl = imageUrl
    else delete item.imageUrl
    persistOrRollback(() => {
      if (previous) item.imageUrl = previous
      else delete item.imageUrl
    })
    return delay(item)
  },

  /** DELETE /api/games/:id */
  deleteGame(id: string): Promise<{ id: string }> {
    db.games = db.games.filter((game) => game.id !== id)
    persist()
    return delay({ id })
  },

  /** DELETE /api/consoles/:id */
  deleteConsole(id: string): Promise<{ id: string }> {
    db.consoles = db.consoles.filter((item) => item.id !== id)
    db.games = db.games.filter((game) => game.consoleId !== id)
    persist()
    return delay({ id })
  },

  /** Drops every local change and restores the shipped demo collection. */
  resetCollection(): Promise<Db> {
    db.games = structuredClone(seedGames)
    db.consoles = structuredClone(seedConsoles)
    persist()
    return delay(db)
  },
}
