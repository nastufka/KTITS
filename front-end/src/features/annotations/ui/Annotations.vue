<script setup lang="ts">
import type { VNode } from 'vue'
import { useI18n } from 'vue-i18n'
import { ax } from '@/shared/api/common'
import { ref, computed, h, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import EosCard from '@/shared/ui/EosCard'
import EosInput from '@/shared/ui/EosInput'
import EosRadio from '@/shared/ui/EosRadio'
import EosButton from '@/shared/ui/EosButton'
import SendIcon from '@/shared/icons/SendIcon.vue'
import InfoIcon from '@/shared/icons/InfoIcon.vue'
import PlusIcon from '@/shared/icons/PlusIcon.vue'
import MinusIcon from '@/shared/icons/MinusIcon.vue'
import MessageIcon from '@/shared/icons/MessageIcon.vue'
import EosAnnotationItem from '@/shared/ui/EosAnnotationItem'
import FatalErrorIcon from '@/shared/icons/FatalErrorIcon.vue'
import { useAnnotationsStore } from '../model/annotationsStore'
import { useRoomsStore } from '@/entities/room/model/roomsStore'
import type { AnnotationItem } from '@/features/annotations/model/types'
import type { RecordFile, Room } from '@/entities/room/model/types'

export interface AnnoBtn {
  icon: VNode,
  iconName: string
}

const { t } = useI18n({})

const roomsStore = useRoomsStore()
const annotationsStore = useAnnotationsStore()
const activeRecordId = computed<number | undefined | null>(() => roomsStore.activeRecord?.id)
const sessionStatusId = computed<number>(() => roomsStore.sessionInfo.status?.id)
const activeRoom = computed<Room | undefined>(() => roomsStore.activeRoom)
const currentTime = computed<number>(() => <number>activeRoom.value?.time)
const disabled = computed<boolean | undefined>(() => !activeRoom.value?.recording)
const annotationList = computed<AnnotationItem[]>(() => {
  if (sessionStatusId.value !== 3) {
    return annotationsStore.annotationList[<number>activeRoom.value?.id]?.sort((a, b) => {
      if (a.id && b.id) {
        return b.id - a.id
      } else {
        return 0
      }
    })
  } else if (activeRoom.value && activeRoom.value.records && activeRecordId.value) {
    const annotations = activeRoom.value.records.find((r: RecordFile) => r.id === activeRecordId.value)?.annotations
    return annotations ?? []
  } else {
    return []
  }
})

const comment = ref<string>('')
const sendIcon = h(SendIcon)
const annotationBtn = ref<AnnoBtn>()
const annotationsBtns = ref<AnnoBtn[]>([
  {
    icon: h(MessageIcon),
    iconName: 'message'
  },
  {
    icon: h(FatalErrorIcon),
    iconName: 'error'
  },
  {
    icon: h(MinusIcon),
    iconName: 'minus'
  },
  {
    icon: h(InfoIcon),
    iconName: 'info'
  },
  {
    icon: h(PlusIcon),
    iconName: 'plus'
  },
])


const getIdx = (idx: number): number => sessionStatusId.value === 3 ? idx + 1 : annotationList.value.length - idx

function addAnnotation() {
  if (comment.value === '') {
    message.info({
      content: () => t('commentNeeded'),
      class: 'comment-needed',
      icon: h(InfoIcon),
      duration: 2
    })
    return
  }
  const annotation: AnnotationItem = {
    record: activeRoom.value?.recordId,
    time: currentTime.value * 1000,
    icon: annotationBtn.value?.iconName || 'message',
    comment: comment.value
  }
  ax.post(`/sessions/${roomsStore.sessionInfo.id}/annotations/`, { ...annotation, author: 1 })
    .then(res => {
      comment.value = ''
      annotationsStore.addAnnotation(<number>activeRoom.value?.id, res.data)
    })
}

onMounted(() => {
  //getAnnotations()
})
</script>

<template>
  <div class="annotations" :class="{ 'annotations-viewing': sessionStatusId === 3 }">
    <div v-show="sessionStatusId !== 3" class="annotations-form">
      <eos-radio
        v-model:value="annotationBtn"
        :options="annotationsBtns"
        :disabled="disabled"
        name="annotations-buttons"
        class="annotations-form-buttons"
      >
        <template v-slot:label="{ active, value: btn }">
          <eos-button
            class="annotation-button"
            type="annotation"
            :disabled="disabled"
            :icon="btn.icon"
            :active="active"
          />
        </template>
      </eos-radio>
      <a-form class="annotations-form-comment">
        <eos-input 
          v-model:value="comment" 
          :disabled="disabled"
          class="comment-input" 
          size="large" 
          placeholder="Оставить комментарий" 
        />
        <eos-button 
          class="comment-button"
          type="primary" 
          :icon="sendIcon" 
          @click="addAnnotation" 
          :disabled="disabled"  
        />
      </a-form>
    </div>
    <eos-card class="annotations-list-card" :bodyStyle="{ padding: '12px' }">
      <div class="annotation-list">
        <eos-annotation-item
          v-for="(anno, idx) in annotationList"
          :key="anno.id"
          :idx="getIdx(idx)"
          :annotation="anno"
        />
      </div>   
    </eos-card>
  </div>
</template>

<style lang="scss">
.annotations {
  //display: grid;
  // grid-template-columns: 100%;
  // grid-template-rows: 132px 572px;
  // grid-row-gap: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  background: var(--sc-base-6) !important;
  &-form {
    display: flex;
    flex-direction: column;
    width: 100%;
    &-buttons {
      position: absolute;
      display: flex;
      flex-direction: row !important;
      align-items: center;
      gap: 8px;
      .annotation-button {
        width: 66px;
        height: 66px;
        svg {
          font-size: 34px;
          width: 34px;
          height: 34px;
        }
      }
    }
    &-comment {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-top: 76px;
      .comment-input {
        width: 364px;
      }
      .comment-button {
        width: 56px;
        height: 56px;
      }
    }
  }
  &-list-card {
    //min-height: 572px;
    background: var(--sc-base-5);
    overflow-y: scroll;
    .annotation-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
  }
}
.comment-needed {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
  .ant-message-custom-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
.annotations-viewing {
  grid-template-rows: unset;
  .annotations-list-card {
    height: 704px;
  }
}
</style>