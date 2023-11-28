import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

let localCollapsed = localStorage.getItem('sideMenuCollapsed')
if (localCollapsed === null) {
  localCollapsed = 'false'
  localStorage.setItem('sideMenuCollapsed', localCollapsed)
}
export const useSideMenuStore = defineStore('sideMenu', () => {
  const collapsed = ref<boolean>(localCollapsed === 'false' ? false : true)

  function toggleCollapse() {
    collapsed.value = !collapsed.value
    localStorage.setItem('sideMenuCollapsed', collapsed.value.toString())
  }

  return { collapsed, toggleCollapse }
})
