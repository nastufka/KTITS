<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  styles?: object
}>()

const styles = ref<object | undefined>(props.styles)

const customStyle = computed<object>(() => {
  return {
    background: 'var(--sc-base-6, #FFF)',
    'border-radius': '12px',
    'margin-bottom': '8px',
    ...styles.value
  }
})

</script>

<template>
  <a-collapse-panel v-bind="{ ...$attrs, ...props }" :style="customStyle">
    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-collapse-panel>
</template>