import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCameraStore = defineStore('camera', () => {
  const logged = ref<boolean>(false)
  const loginStarts = ref<boolean>(false)

  function setLogged() {
    logged.value = true
  }
  function setLoginStarts() {
    loginStarts.value = true
  }
  return { logged, setLogged, loginStarts, setLoginStarts }
})
