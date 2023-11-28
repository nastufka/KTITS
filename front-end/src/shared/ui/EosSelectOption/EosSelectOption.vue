<template>
  <a-select-option v-bind="$attrs">
    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-select-option>
</template>
