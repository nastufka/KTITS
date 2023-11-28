import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ActionMode } from './types'

export const useActionSwitcherStore = defineStore('actionSwitcherStore', () => {
  const modes = ref<ActionMode[]>([
    {
      id: 1,
      name: 'card',
      cardTitle: 'card',
      availableStatus: [1, 2, 3]
    },
    {
      id: 2,
      name: 'annotations',
      cardTitle: 'annotations',
      availableStatus: [1, 2, 3]
    },
    {
      id: 3,
      name: 'cams',
      cardTitle: 'camsList',
      availableStatus: [1, 2]
    },
    {
      id: 4,
      name: 'settings',
      cardTitle: 'devicesSettings',
      availableStatus: [1, 2]
    },
    {
      id: 5,
      name: 'files',
      cardTitle: 'files',
      availableStatus: [3]
    },
  ])
  const activeMode = ref<Object | any>(modes.value[0])

  function setMode(id: number): void {
    activeMode.value = modes.value.find(m => m.id === id)
  }

  return { modes, activeMode, setMode }
})