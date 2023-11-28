<script setup lang="ts">
import type { FormProps } from 'ant-design-vue'

export interface EosFormProps extends FormProps {}

const props = defineProps<EosFormProps>()
</script>

<template>
  <a-form v-bind="{ ...$attrs, ...props }">
    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-form>  
</template>
