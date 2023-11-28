<script setup lang="ts">
import Icon from '@ant-design/icons-vue'

interface IconProp {
  color?: string
}
const props = withDefaults(defineProps<IconProp>(), {
  color: '#3761F3'
})
</script>

<template>
  <icon>
    <template #component>
      <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="Icons">
          <path id="Vector (Stroke)" fill-rule="evenodd" clip-rule="evenodd" d="M16.0624 2.29289C16.4529 1.90237 17.0861 1.90237 17.4766 2.29289L22.4766 7.29289C22.8672 7.68342 22.8672 8.31658 22.4766 8.70711L9.47664 21.7071C9.2891 21.8946 9.03475 22 8.76953 22H3.76953C3.21725 22 2.76953 21.5523 2.76953 21V16C2.76953 15.7348 2.87489 15.4804 3.06242 15.2929L16.0624 2.29289ZM4.76953 16.4142V20H8.35532L20.3553 8L16.7695 4.41421L4.76953 16.4142Z" :fill="props.color"/>
        </g>
      </svg>
    </template>
  </icon>
</template>
