<script setup lang="ts">
import CameraIP from '@/entities/camera/ui'
import type { Camera } from '@/entities/camera/model/types';
import { ref, computed, onMounted, watch } from 'vue'
import EosCard from '@/shared/ui/EosCard'
import EosButton from '@/shared/ui/EosButton'
import { useRoomsStore } from '@/entities/room/model/roomsStore'
import { useGridSelectionStore } from '@/features/roomsGridSelection/model/gridSeletionStore'
import { ax, dayjs } from '@/shared/api/common'
import EosTrackSlider from '@/shared/ui/EosTrackSlider'
import EosNoSignal from '@/shared/ui/EosNoSignal'
import type { PlayStatus, Room, ActiveRecord } from '@/entities/room/model/types'
import type { GridMode } from '@/features/roomsGridSelection/model/types'

const props = defineProps<{
  cams: Camera[] | undefined,
  roomId: number,
  annotations: any[]
}>()

const emit = defineEmits(['setActiveCam'])

const roomId = ref<number>(props.roomId)
const roomsStore = useRoomsStore()
const sessionStatusId = computed<number>(() => roomsStore.sessionInfo.status?.id)
const activeRoom = computed<Room | undefined>(() => roomsStore.activeRoom)
const activeRecord = computed<ActiveRecord | undefined>(() => roomsStore.activeRecord)
const activeMode = computed<GridMode[] | any>(() => roomsStore.gridModes.find(m => m.id === activeRoom.value?.gridModeId))
const playStatus = computed<PlayStatus | undefined>(() => roomsStore.activeRoom?.playStatus)
const videoDuration = computed<number>(() => <number>roomsStore.activeRoom?.videoDuration)
const cams = computed<Camera[]>(() => props.cams || [])
const camElem = ref<typeof CameraIP | typeof CameraIP[]>()
const sliderTime = ref<number>(<number>roomsStore.activeRoom?.time)
const mediaType = computed<'record' | 'stream'>(() => sessionStatusId.value === 3 ? 'record' : 'stream')
const roomCams = ref<HTMLElement>()
const orderedCams = computed<Camera[] | undefined>(() => {
  return sortCams(cams.value)
})
watch(() => activeRoom.value?.time, val => {
  if (props.roomId === activeRoom.value?.id) {
      sliderTime.value = <number>val
  }
})
watch(playStatus, val => {
  if (props.roomId === activeRoom.value?.id) {
    playVideo(val)
  }
})
watch(() => activeMode.value?.count, val => {
  setStylesForActiveCams()
})
watch(() => activeRecord.value?.id, val => {
  setStylesForActiveCams()
}, { deep: true })

function sortCams(cams: Camera[]): Camera[] {
  return [...cams].sort((a: Camera, b: Camera): number => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order
    } else {
      return 0
    }
  })
}
const showCamByIdx = (idx: number): boolean => {
  const cam = getCamByOrder(idx)
  return !!cam && !!cam.active && (!!cam.streamConnected || sessionStatusId.value === 3)
}
const noSignal = (idx: number): boolean => {
  const cam = getCamByOrder(idx)
  return !!cam && !!cam.active && !cam.streamConnected && sessionStatusId.value !== 3
}
const getCamByOrder = (idx: number): Camera => {
  //const cam = orderedCams.value && orderedCams.value.length >= idx ? orderedCams.value[idx] : null
  const cam = orderedCams.value?.find(c => c.order === idx)
  return cam ?? { id: 0 }
}

function addStream() {
  const form = new FormData()
  form.append('uuid', 'H264_AAC5')
  form.append('url', 'rtsp://admin:mklP54sd@192.168.110.136:554/cam1')
  ax.post(`${import.meta.env.VITE_RTSP_TO_WEB_RTC}/stream/add`, form)
    .then(res => {
  });
}
function setStylesForActiveCams(): void {
  setTimeout(() => {
    if (activeMode.value?.count < 4 && props.roomId === activeRoom.value?.id) {
      const cards = roomCams.value?.getElementsByClassName('camera-card')
      cards && Array.from(cards).forEach(elem => {
        elem.classList.remove('firstActiveCam')
        elem.classList.remove('secondActiveCam')
      })
      const activeCards = cards ? Array.from(cards).filter(c => c.classList.contains('activeCam')) : []
      const activeCamsCollection = activeCards.length ? activeCards : cards
      if (activeCamsCollection) {
        if (activeCamsCollection.length > 1) {
          const [firstActive, secondActive]: Element[] = Array.from(activeCamsCollection)
          firstActive && firstActive.classList.add('firstActiveCam')
          secondActive && secondActive.classList.add('secondActiveCam')
        } else {
          if (activeCamsCollection[0].classList.contains('item2')) {
            if (activeMode.value.count === 1) {
              activeCamsCollection[0].classList.add('firstActiveCam')
            } else {
              cards?.length && cards[0].classList.add('firstActiveCam')
              activeCamsCollection[0].classList.add('secondActiveCam')
            }
          } else {
            activeCamsCollection[0].classList.add('firstActiveCam')
            cards?.length && cards[1].classList.add('secondActiveCam')
          }
        }
      }
    }
  }, 0)
}

function onDrop(e: DragEvent, place: number) {
  e.preventDefault()
  let camId: number | null = null
  let recordId: number | null = null
  if (e.dataTransfer) {
    const data = e.dataTransfer.getData('text/plain')
    if (data.includes('/')) {
      const splittedData: string[] = data.split('/')
      camId = parseInt(splittedData[0])
      recordId = parseInt(splittedData[1])
    } else {
      camId = parseInt(data)
    }    
  }
  mediaType.value === 'record' && roomsStore.setActiveRecord(recordId)
  roomsStore.setActiveVideo(place, <number>camId, mediaType.value, recordId)
  setStylesForActiveCams()
}
function onDragOver(e: DragEvent) {
  e.preventDefault();
}
const formatter = (value: number) => {
  return dayjs(value * 1000).format("mm:ss")
}
function setVideoTime(time: number): void {
  if (camElem.value) {
    roomsStore.setTime(time, true)
    camElem.value.forEach((elem: typeof CameraIP) => {
      elem.setVideoTime(time)
    })
  }
}
function playVideo(val: PlayStatus | undefined): void {
  if (camElem.value) {
    camElem.value.forEach((elem: typeof CameraIP) => {
      if (val === 'play' && <number>activeRoom.value?.time >= <number>activeRoom.value?.videoDuration && sessionStatusId.value === 3) {
        setVideoTime(0)
      }
      val !== 'play' ? elem.pauseVideo() : elem.playVideo()
    })
  }
}
function setVideoDuration(duration: number, recordFileId: number) {
  roomsStore.setVideoDuration(Math.trunc(duration), recordFileId)
}
function updateSliderTime(time: number) {
  roomsStore.setTime(Number(time))
}


onMounted(() => {

})

defineExpose({
  roomId,
  playVideo
})
</script>

<template>
  <div class="room-cams">
    <div
      ref="roomCams"
      class="room"
      :class="`room__${activeMode.className}`"
      :style="{ height: mediaType === 'record' ? '100%' : '100%' }"
    >
      <template v-for="idx in 4" :key="idx" >
        <EosCard   
          class="camera-card" 
          :class="[`item${idx}`, { activeCam: showCamByIdx(idx - 1) }]"
          :body-style="{ height: '100%', padding: 0 }"
        >
          <CameraIP
            v-if="showCamByIdx(idx - 1)"
            ref="camElem"
            :cam="getCamByOrder(idx - 1)"
            :room-id="roomId"
            class="room__camera"
            @updateSliderTime="updateSliderTime"
            @setVideoDuration="setVideoDuration"
            @drop="(e: DragEvent) => onDrop(e, idx - 1)"
            @dragover="onDragOver"
          />
          <EosNoSignal v-else-if="noSignal(idx - 1)" />
          <div v-else class="room__drop-place" @drop="(e) => onDrop(e, idx - 1)" @dragover="onDragOver"></div>
        </EosCard>
      </template>
    </div>
    <eos-track-slider 
      v-if="sessionStatusId === 3"
      v-model:value="sliderTime"
      class="room-cams-track"
      :tip-formatter="formatter"
      :min="0"
      :max="videoDuration"
      :step="0.001"
      :annotations="props.annotations"
      @change="setVideoTime" 
    />
  </div>
</template>

<style lang="scss">
@import '/src/app/styles/vars.scss';
.room-cams {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .room {
    display: grid;
    width: 100%;
    flex: 1;
    height: 100%;
    //margin-top: 12px;
    grid-gap: 8px;
    .camera-card {
      background: var(--sc-base-4);
      border-radius: 12px;
    }
    &__drop-place {
      height: 100%;
    }
    &__4x4 {
      height: 100%;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: repeat(2, 300px);
      .videoWindow {
        width: 100%;
        max-height: 100%;
        object-fit: fill;
      }
    }
    &__1x3 {
      grid-template-rows: repeat(3, 196px);
      grid-template-columns: repeat(3, 1fr);
      grid-template-areas: 
        "a a b"
        "a a c"
        "a a d";
      .videoWindow {
        object-fit: fill;
        max-height: 100%;
      }
      .item1 {
        grid-area: a;
        .videoWindow {
          max-height: 100%;
          object-fit: contain;
        }
      }
      .item2 {
        grid-area: b;
      }
      .item3 {
        grid-area: c;
      }
      .item4 {
        grid-area: d;
      }
    }
    &__one-frame {
      grid-template-columns: 1fr;
      grid-template-rows: 610px;
      .firstActiveCam {
        display: block !important;
      }
      .camera-card {
        display: none;
      }
    }
    &__picture-in-picture {
      grid-template-columns: 1fr;
      grid-template-rows: 610px;
      .firstActiveCam {
        display: block !important;
      }
      .secondActiveCam {
        display: block !important;
        position: absolute;
        right: 24px;
        margin-top: 12px;
        margin-right: 12px;
        width: 366px;
        height: 207px;
        z-index: 9;
      }
      .camera-card {
        display: none;
      }
    }
  }
  &__buttons {
    display: flex;
    justify-content: space-between;
    height: 100px;
    width: 220px;
    margin-top: 12px;
    .eos-btn {
      width: 100px;
    }
  }
  &-track {
    //margin-top: 12px;
  }
}

</style>