import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { GridMode } from './types'

export const useGridSelectionStore = defineStore('gridSelectionStore', () => {
  const modes = ref<GridMode[]>([
    {
      id: 1,
      name: '4x4',
      count: 4,
      className: '4x4'
    },
    {
      id: 2,
      name: '1x3',
      count: 4,
      className: '1x3',
    },
    {
      id: 3,
      name: 'Один экран',
      count: 1,
      className: 'one-frame'
    },
    {
      id: 4,
      name: 'Кадр в кадре',
      count: 2,
      className: 'picture-in-picture'
    },
  ])
  const activeMode = ref<Object | any>(modes.value[0])

  function setMode(id: number): void {
    activeMode.value = modes.value.find(m => m.id === id)
  }

  return { modes, activeMode, setMode }
})