// ============================================================
// PLACES STORE — Persistent heritage locations
// Mirrors membersStore pattern: base data + localStorage overrides
// Admin auth reused from useMembersStore (same password)
// ============================================================
import { create } from 'zustand'
import { heritagePlaces as BASE_PLACES } from '@/data/heritagePlaces'

const LS_PLACES_KEY = 'giapha_places_overrides'

function loadOverrides() {
  try {
    const raw = localStorage.getItem(LS_PLACES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function buildPlaces(overrides) {
  const baseMap = Object.fromEntries(BASE_PLACES.map((p) => [p.id, p]))
  return Object.values({ ...baseMap, ...overrides }).sort((a, b) =>
    a.id.localeCompare(b.id),
  )
}

function saveOverrides(overrides) {
  localStorage.setItem(LS_PLACES_KEY, JSON.stringify(overrides))
}

const initialOverrides = loadOverrides()

export const usePlacesStore = create((set, get) => ({
  // ── Data ──────────────────────────────────────────────────
  overrides: initialOverrides,
  places: buildPlaces(initialOverrides),

  // ── CRUD ──────────────────────────────────────────────────

  /** Upsert a place (add or edit) */
  savePlace: (place) => {
    const overrides = { ...get().overrides, [place.id]: place }
    saveOverrides(overrides)
    set({ overrides, places: buildPlaces(overrides) })
  },

  /** Move a pin on the SVG map (saves svgX/svgY) */
  movePlacePin: (id, svgX, svgY) => {
    const existing = get().places.find((p) => p.id === id)
    if (!existing) return
    const updated = { ...existing, svgX, svgY }
    const overrides = { ...get().overrides, [id]: updated }
    saveOverrides(overrides)
    set({ overrides, places: buildPlaces(overrides) })
  },

  /** Delete a place — only non-base entries */
  deletePlace: (id) => {
    const isBase = BASE_PLACES.some((p) => p.id === id)
    if (isBase) {
      // For base entries, mark as hidden instead of deleting
      const existing = get().places.find((p) => p.id === id)
      if (!existing) return
      const overrides = { ...get().overrides, [id]: { ...existing, hidden: true } }
      saveOverrides(overrides)
      set({ overrides, places: buildPlaces(overrides) })
      return
    }
    const overrides = { ...get().overrides }
    delete overrides[id]
    saveOverrides(overrides)
    set({ overrides, places: buildPlaces(overrides) })
  },

  /** Revert a single place to base data */
  resetPlace: (id) => {
    const overrides = { ...get().overrides }
    delete overrides[id]
    saveOverrides(overrides)
    set({ overrides, places: buildPlaces(overrides) })
  },

  /** Clear all overrides */
  resetAllPlaces: () => {
    localStorage.removeItem(LS_PLACES_KEY)
    set({ overrides: {}, places: buildPlaces({}) })
  },

  /** Returns true if a place has been locally modified */
  isModified: (id) => id in get().overrides,

  /** Copy-friendly JSON export */
  exportJSON: () => JSON.stringify(get().places, null, 2),

  /** Generate next sequential place ID */
  generateId: () => {
    const nums = get()
      .places.map((p) => parseInt(p.id.replace('place-', ''), 10))
      .filter((n) => !isNaN(n))
    const max = nums.length > 0 ? Math.max(...nums) : 0
    return `place-${String(max + 1).padStart(3, '0')}`
  },
}))