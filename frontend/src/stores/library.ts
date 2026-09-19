import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api } from '../api/client'
import type { Game, GameConsole, NewConsole, NewGame, PriceHistory } from '../types'

export interface PortfolioPoint {
  date: string
  games: number
  consoles: number
  total: number
}

export interface ConsoleBreakdown {
  console: GameConsole
  gameCount: number
  gameValue: number
  hardwareValue: number
  total: number
  spent: number
}

export interface Mover {
  id: string
  name: string
  type: 'game' | 'console'
  price: number
  changeAbs: number
  changePct: number
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0)
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

export const useLibraryStore = defineStore('library', () => {
  const games = ref<Game[]>([])
  const consoles = ref<GameConsole[]>([])
  const histories = ref<PriceHistory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  const historyById = computed(() => {
    const map = new Map<string, PriceHistory>()
    for (const history of histories.value) map.set(history.entityId, history)
    return map
  })

  const consoleById = computed(() => {
    const map = new Map<string, GameConsole>()
    for (const item of consoles.value) map.set(item.id, item)
    return map
  })

  const gamesValue = computed(() => round(sum(games.value.map((g) => g.marketPrice))))
  const consolesValue = computed(() => round(sum(consoles.value.map((c) => c.marketPrice))))
  const totalValue = computed(() => round(gamesValue.value + consolesValue.value))
  const totalSpent = computed(() =>
    round(sum([...games.value, ...consoles.value].map((item) => item.buyPrice))),
  )
  const totalProfit = computed(() => round(totalValue.value - totalSpent.value))
  const roi = computed(() =>
    totalSpent.value === 0 ? 0 : round((totalProfit.value / totalSpent.value) * 100),
  )
  const mostValuableGame = computed(() =>
    games.value.reduce<Game | null>(
      (best, game) => (!best || game.marketPrice > best.marketPrice ? game : best),
      null,
    ),
  )

  /** Monthly value of the whole collection, split into software and hardware. */
  const portfolioSeries = computed<PortfolioPoint[]>(() => {
    const gameIds = new Set(games.value.map((g) => g.id))
    const consoleIds = new Set(consoles.value.map((c) => c.id))
    const buckets = new Map<string, { games: number; consoles: number }>()

    for (const history of histories.value) {
      const isGame = gameIds.has(history.entityId)
      const isConsole = consoleIds.has(history.entityId)
      if (!isGame && !isConsole) continue
      for (const point of history.points) {
        const bucket = buckets.get(point.date) ?? { games: 0, consoles: 0 }
        if (isGame) bucket.games += point.value
        else bucket.consoles += point.value
        buckets.set(point.date, bucket)
      }
    }

    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, bucket]) => ({
        date,
        games: round(bucket.games),
        consoles: round(bucket.consoles),
        total: round(bucket.games + bucket.consoles),
      }))
  })

  const consoleBreakdown = computed<ConsoleBreakdown[]>(() =>
    consoles.value
      .map((item) => {
        const owned = games.value.filter((game) => game.consoleId === item.id)
        const gameValue = round(sum(owned.map((g) => g.marketPrice)))
        return {
          console: item,
          gameCount: owned.length,
          gameValue,
          hardwareValue: item.marketPrice,
          total: round(gameValue + item.marketPrice),
          spent: round(sum(owned.map((g) => g.buyPrice)) + item.buyPrice),
        }
      })
      .sort((a, b) => b.total - a.total),
  )

  const genreBreakdown = computed(() => {
    const buckets = new Map<string, { value: number; count: number }>()
    for (const game of games.value) {
      const bucket = buckets.get(game.genre) ?? { value: 0, count: 0 }
      bucket.value += game.marketPrice
      bucket.count += 1
      buckets.set(game.genre, bucket)
    }
    return [...buckets.entries()]
      .map(([genre, bucket]) => ({ genre, value: round(bucket.value), count: bucket.count }))
      .sort((a, b) => b.value - a.value)
  })

  /** Relative price change of a single item over the trailing `months` window. */
  function changeFor(entityId: string, months = 12) {
    const history = historyById.value.get(entityId)
    if (!history || history.points.length < 2) return { abs: 0, pct: 0 }
    const points = history.points
    const last = points[points.length - 1].value
    const first = points[Math.max(0, points.length - 1 - months)].value
    const abs = round(last - first)
    return { abs, pct: first === 0 ? 0 : round((abs / first) * 100) }
  }

  const movers = computed<Mover[]>(() => {
    const entries: Mover[] = [
      ...games.value.map((game) => ({
        id: game.id,
        name: game.name,
        type: 'game' as const,
        price: game.marketPrice,
      })),
      ...consoles.value.map((item) => ({
        id: item.id,
        name: item.name,
        type: 'console' as const,
        price: item.marketPrice,
      })),
    ].map((entry) => {
      const change = changeFor(entry.id, 12)
      return { ...entry, changeAbs: change.abs, changePct: change.pct }
    })
    return entries.sort((a, b) => b.changePct - a.changePct)
  })

  const topGainers = computed(() => movers.value.slice(0, 5))
  const topLosers = computed(() =>
    [...movers.value].reverse().filter((m) => m.changePct < 0).slice(0, 5),
  )

  const collectionChange12m = computed(() => {
    const series = portfolioSeries.value
    if (series.length < 2) return { abs: 0, pct: 0 }
    const last = series[series.length - 1].total
    const first = series[Math.max(0, series.length - 13)].total
    const abs = round(last - first)
    return { abs, pct: first === 0 ? 0 : round((abs / first) * 100) }
  })

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const [gameList, consoleList, historyList] = await Promise.all([
        api.listGames(),
        api.listConsoles(),
        api.listPriceHistory(),
      ])
      games.value = gameList
      consoles.value = consoleList
      histories.value = historyList
      loaded.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Could not reach the collection service.'
    } finally {
      loading.value = false
    }
  }

  async function addGame(payload: NewGame) {
    const created = await api.createGame(payload)
    games.value = [created, ...games.value]
    histories.value = await api.listPriceHistory()
    return created
  }

  async function addConsole(payload: NewConsole) {
    const created = await api.createConsole(payload)
    consoles.value = [created, ...consoles.value]
    histories.value = await api.listPriceHistory()
    return created
  }

  /** Uploads (or clears, when `coverUrl` is empty) the cover art of a single game. */
  async function setGameCover(id: string, coverUrl: string | undefined) {
    const updated = await api.updateGameCover(id, coverUrl)
    games.value = games.value.map((game) => (game.id === id ? updated : game))
    return updated
  }

  /** Uploads (or clears, when `imageUrl` is empty) the photo of a single console. */
  async function setConsoleImage(id: string, imageUrl: string | undefined) {
    const updated = await api.updateConsoleImage(id, imageUrl)
    consoles.value = consoles.value.map((item) => (item.id === id ? updated : item))
    return updated
  }

  async function removeGame(id: string) {
    await api.deleteGame(id)
    games.value = games.value.filter((game) => game.id !== id)
  }

  async function removeConsole(id: string) {
    await api.deleteConsole(id)
    consoles.value = consoles.value.filter((item) => item.id !== id)
    games.value = games.value.filter((game) => game.consoleId !== id)
  }

  async function resetCollection() {
    await api.resetCollection()
    await fetchAll()
  }

  return {
    games,
    consoles,
    histories,
    loading,
    error,
    loaded,
    consoleById,
    historyById,
    gamesValue,
    consolesValue,
    totalValue,
    totalSpent,
    totalProfit,
    roi,
    mostValuableGame,
    portfolioSeries,
    consoleBreakdown,
    genreBreakdown,
    movers,
    topGainers,
    topLosers,
    collectionChange12m,
    changeFor,
    fetchAll,
    addGame,
    addConsole,
    setGameCover,
    setConsoleImage,
    removeGame,
    removeConsole,
    resetCollection,
  }
})
