<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import type { UploadChangeParam, UploadProps } from 'ant-design-vue'


const handleChange = (info: UploadChangeParam) => {
  const status = info.file.status;
  if (status !== 'uploading') {
    console.log(info.file, info.fileList)
  }
  if (status === 'done') {
    message.success(`${info.file.name} file uploaded successfully.`)
  } else if (status === 'error') {
    message.error(`${info.file.name} file upload failed.`)
  }
};
function handleDrop(e: DragEvent) {
  console.log(e)
}
</script>

<template>
  <a-upload-dragger
    v-bind="{ ...$attrs, ...$props }"
    class="eos-upload"
  >
    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-upload-dragger>
</template>

<style lang="scss">
.ant-upload-drag {
  height: 56px !important;
  width: fit-content !important;
  padding: 16px;
  border-radius: 12px;
  border: 1px dashed var(--sc-base-3) !important;
  &:hover {
    border-color: var(--sc-base-7) !important;
  }
  .ant-upload-btn {
    display: flex !important;
    padding: 0 !important;
  }
}
</style>

