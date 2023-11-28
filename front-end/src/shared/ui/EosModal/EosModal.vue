<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, watch, onBeforeMount } from 'vue'

import type { ModalProps } from 'ant-design-vue'

import CloseIcon from '@/shared/icons/CloseIcon.vue'
import EosButton, { type EosButtonProps } from '@/shared/ui/EosButton'

interface EosModalEmits {
  (e: 'ok'): void,
  (e: 'cancel'): void,
  (e: 'update:open', open: boolean): void,
}

export interface EosModalProps extends Omit<ModalProps, 'okType' | 'visible'> {
  open?: boolean,
  okType?: EosButtonProps['type'],
  okText?: string,
  showOk?: boolean,
  showCancel?: boolean,
  cancelText?: string,
  okButtonProps?: object,
  cancelButtonProps?: object,
}

const { t } = useI18n({})

const emit = defineEmits<EosModalEmits>()

const props = withDefaults(defineProps<EosModalProps>(), {
  open: false,
  okType: 'primary',
  closable: true,
  mask: true,
  maskClosable: true,
  showOk: true,
  showCancel: true,
})

const isOpen = ref<boolean>(false)

watch(() => props.open, (v) => isOpen.value = v)
watch(isOpen, v => emit('update:open', v))

function close() {
  isOpen.value = false
}

function onOk() {
  emit('ok')
  close()
}

function onCancel() {
  emit('cancel')
  close()
}

onBeforeMount(() => {
  isOpen.value = props.open
})
</script>

<template>
  <a-modal
    v-bind=" { ...$attrs, ...props }"
    v-model:open="isOpen"
    class="eos-modal"
  >
    <template #closeIcon>
      <eos-button>
        <CloseIcon />
      </eos-button>
    </template>

    <template #footer>
      <eos-button v-if="props.showOk" v-bind="okButtonProps" :type="okType" size="large" @click="onOk">{{ okText || t('ok') }}</eos-button>
      <eos-button v-if="props.showCancel" v-bind="cancelButtonProps" type="outline" size="large" @click="onCancel">{{ cancelText || t('cancel') }}</eos-button>
    </template>

    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </a-modal>
</template>

<style lang="scss">
@import "@/app/styles/mixins";

.ant-modal-root .ant-modal-mask {
  background-color: var(--sc-base-2);
}

.eos-modal {
  .ant-modal-title {
    @include h5;
    color: #000;
    width: calc(100% - 52px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ant-modal-content {
    border-radius: 12px;
    padding: 24px;
  }

  .ant-modal-close {
    height: 44px;
    width: 44px;
    top: 16px;
    right: 24px;
    border-radius: 12px;
  }

  .ant-modal-header {
    margin: 0 -24px 24px;
    padding: 0 24px 24px;
    border-bottom: 1px solid var(--sc-base-5);
  }

  .ant-modal-footer {
    margin-top: 24px;
    text-align: start;

    .ant-btn+.ant-btn:not(.ant-dropdown-trigger) {
      margin-inline-start: 24px;
    }
  }
}
</style>
