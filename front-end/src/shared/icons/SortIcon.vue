<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@ant-design/icons-vue'

export interface SortIconProps {
  active?: boolean
}

const props = withDefaults(defineProps<SortIconProps>(), {
  active: false,
})

const fill = computed<string>(() => props.active ? '#FFF' : '#2F3144')
const fillOpacity = computed<number>(() => props.active ? 1 : .65)
</script>

<template>
  <icon>
    <template #component>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="Icons">
          <path id="Vector (Stroke)" fill-rule="evenodd" clip-rule="evenodd" d="M4.80273 12C4.80273 11.5858 5.13852 11.25 5.55273 11.25H17.5527C17.9669 11.25 18.3027 11.5858 18.3027 12C18.3027 12.4142 17.9669 12.75 17.5527 12.75H5.55273C5.13852 12.75 4.80273 12.4142 4.80273 12Z" :fill="fill" :fill-opacity="fillOpacity"/>
          <path id="Vector (Stroke)_2" fill-rule="evenodd" clip-rule="evenodd" d="M1.05273 7.5C1.05273 7.08579 1.38852 6.75 1.80273 6.75H21.3027C21.7169 6.75 22.0527 7.08579 22.0527 7.5C22.0527 7.91421 21.7169 8.25 21.3027 8.25H1.80273C1.38852 8.25 1.05273 7.91421 1.05273 7.5Z" :fill="fill" :fill-opacity="fillOpacity"/>
          <path id="Vector (Stroke)_3" fill-rule="evenodd" clip-rule="evenodd" d="M8.55273 16.5C8.55273 16.0858 8.88852 15.75 9.30273 15.75H13.8027C14.2169 15.75 14.5527 16.0858 14.5527 16.5C14.5527 16.9142 14.2169 17.25 13.8027 17.25H9.30273C8.88852 17.25 8.55273 16.9142 8.55273 16.5Z" :fill="fill" :fill-opacity="fillOpacity"/>
        </g>
      </svg>
    </template>
  </icon>
</template>
