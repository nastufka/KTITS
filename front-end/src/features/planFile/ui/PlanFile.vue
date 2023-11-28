<script setup lang="ts">
import { ax } from '@/shared/api/common'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import EosUpload from '@/shared/ui/EosUpload'
import EosProgress from '@/shared/ui/EosProgress'
import type { UploadProps } from 'ant-design-vue'
import { getCapture, blobToBase64 } from '@/entities/camera/api'
import PlacementIcon from '@/shared/icons/PlacementIcon.vue'
import type { Attachment } from '@/widgets/RoomPlacement/model/types'

interface PlanFileProps {
  attach: Attachment | undefined | null
  newFile?: boolean,
  drawing?: boolean
}
interface PlanFileEmits {
  (e: 'update:attach', attach: Attachment): void
}
const props = withDefaults(defineProps<PlanFileProps>(), {
  newFile: false
})
const emit = defineEmits<PlanFileEmits>()
const { t } = useI18n({})

const fileList = ref<UploadProps['fileList']>([])
const previewImage = ref<string>('')
const loading = ref<boolean>(false)
const uploadInput = ref<HTMLElement>()
const imgFile = ref<HTMLImageElement>()

watch(() => props.newFile, value => {
  if (!value) {
    fileList.value = []
    previewImage.value = ''
  }
})

function handleChange(e: any): void {
  console.log('change', e)
  loading.value = false
}
function handleDrop(): void {

}
const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
  loading.value = true
  fileList.value?.push(file)
  const src = await blobToBase64(file)
  emit('update:attach', { ...props.attach, file: src, blob: file })
  return false
}
const doUpload = (): void => {
  fileList.value = []
  emit('update:attach', {})
  queueMicrotask(() => {
    const uploadInput = document.querySelector('.ant-upload-btn')?.querySelector('input[type=file]') as HTMLElement
    uploadInput && uploadInput.click()
  })
}

defineExpose({
  doUpload,
})
</script>

<template>
  <div class="plan-file">
    <div v-if="!attach?.file && !newFile" class="plan-file-empty">
      <placement-icon />
      <span class="plan-file-empty-text">{{ t('emptyPlan') }}</span>
    </div>
    <div v-else-if="!attach?.id && newFile">
      <eos-upload 
        v-if="!attach?.file && !loading"
        v-model:fileList="fileList"
        class="plan-file-upload"
        name="file"
        :multiple="false"
        :before-upload="beforeUpload"
        @change="handleChange"
        @drop="handleDrop"
      >
        <div class="plan-file-upload-text">
          <span class="text-blue">{{ t('selectFile') }}</span>
          <span>{{ t('orDragDrop') }}</span>
        </div>
      </eos-upload>
      <div v-else-if="loading">
        <eos-progress 
          type="circle"
          :percent="fileList?.length ? fileList[0].percent : 0"
          :size="32"
          :text="t('uploadingMessage')"
        />
      </div>
      <img v-else class="plan-file-img" :src="attach?.file">
    </div>
    <div v-else>
      <img :src="attach?.file" ref="imgFile" class="plan-file-img">
    </div>
  </div>
</template>

<style lang="scss">
.plan-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  &-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    &-text {
      font-size: 15px;
      font-weight: 500;
      line-height: 24px;
      color: var(--sc-base-9);
    }
  }
  &-upload {

    &-text {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
      .text-blue {
        color: var(--sc-base-7);
      }
    }
  }
  &-img {
    max-height: 576px;
    width: 100%;
  }
}
</style>