// Zustand store for app-wide state
import { create } from 'zustand'

export const useAppStore = create((set) => ({
  // Theme
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Audio atmosphere
  audioEnabled: false,
  setAudioEnabled: (v) => set({ audioEnabled: v }),

  // Selected member for profile modal
  selectedMember: null,
  setSelectedMember: (member) => set({ selectedMember: member }),
  clearSelectedMember: () => set({ selectedMember: null }),

  // Tree state
  treeLayout: 'topDown',
  setTreeLayout: (layout) => set({ treeLayout: layout }),
  treeSearch: '',
  setTreeSearch: (q) => set({ treeSearch: q }),
  highlightedMemberId: null,
  setHighlightedMemberId: (id) => set({ highlightedMemberId: id }),
  highlightMode: 'ancestor', // 'ancestor' | 'descendant'
  setHighlightMode: (mode) => set({ highlightMode: mode }),

  // Zoom-to-member (camera fly)
  zoomToMemberId: null,
  setZoomToMemberId: (id) => set({ zoomToMemberId: id }),
  clearZoomToMember: () => set({ zoomToMemberId: null }),

  // Gallery state
  galleryFilter: 'all',
  setGalleryFilter: (cat) => set({ galleryFilter: cat }),
  lightboxImage: null,
  setLightboxImage: (img) => set({ lightboxImage: img }),
  clearLightboxImage: () => set({ lightboxImage: null }),

  isDark: false,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),

  // Compare mode — select 2 members and see their relationship
  compareMode: false,
  toggleCompareMode: () =>
    set((state) => ({
      compareMode: !state.compareMode,
      // Clear compare state when toggling off
      ...(state.compareMode
        ? { comparePathIds: new Set(), compareM1: null, compareM2: null }
        : {}),
    })),
  comparePathIds: new Set(),
  setComparePathIds: (ids) => set({ comparePathIds: ids }),
  clearComparePathIds: () => set({ comparePathIds: new Set() }),

  // The two members currently selected for comparison
  compareM1: null,
  compareM2: null,
  setCompareM1: (m) => set({ compareM1: m }),
  setCompareM2: (m) => set({ compareM2: m }),
  swapCompareMembers: () =>
    set((state) => ({ compareM1: state.compareM2, compareM2: state.compareM1 })),
  clearCompareMembers: () =>
    set({ compareM1: null, compareM2: null, comparePathIds: new Set() }),
  // Called when a tree node is clicked in compare mode:
  // first click → m1, second → m2, third → replace m1 and clear m2
  cycleCompareMember: (member) =>
    set((state) => {
      if (!state.compareM1) return { compareM1: member }
      if (!state.compareM2) {
        if (state.compareM1.id === member.id) return {} // same node, ignore
        return { compareM2: member }
      }
      // Both already set — start fresh
      return { compareM1: member, compareM2: null, comparePathIds: new Set() }
    }),
}))