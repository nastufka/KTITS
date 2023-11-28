<script setup lang="ts">
import FormData from 'form-data'
import { loginToPlugin } from '../api'
import { ax } from '@/shared/api/common'
import { computed, onMounted, ref, watch } from 'vue'
import type { Room } from '@/entities/room/model/types'
import type { LoginParams, Camera } from '../model/types'
import { useRoomsStore } from '@/entities/room/model/roomsStore'

const props = defineProps<{
  cam: Camera
  order?: number
  roomId?: number
}>()

const emit = defineEmits<CameraEmits>()

interface CameraEmits {
  (e: 'updateSliderTime', time: number): void,
  (e: 'setVideoDuration', time: number, id: number): void
}

interface IMediaTarget extends EventTarget {
  currentTime?: number,
  duration?: number,
  volume?: number,
  muted?: boolean,
}

const roomsStore = useRoomsStore()
const activeRoom = computed<Room | undefined>(() => roomsStore.activeRoom)
const sessionStatusId = computed<number>(() => roomsStore.sessionInfo.status?.id)
const params = computed<LoginParams>(() => {
  return {
    ip: props.cam.ip,
    port: '80',
    login: props.cam.login,
    password: props.cam.password,
    protocol: 1,
    camId: props.cam.id,
    order: props.cam.order
  }
})
const camId = computed(() => props.cam.id)
const htmlTemp = ref<string>('')
const videoElem = ref<HTMLVideoElement | null>(null)
const videoElemId = computed<string>(() => `videoElem${props.roomId}_${props.cam.id}`)
const suuid = computed<string>(() => `H264_AAC${props.cam.id}`)
let stream = new MediaStream()
let pc: RTCPeerConnection
let config = {
  iceServers: [{
    urls: ["stun:stun.l.google.com:19302"]
  }],
}

watch(() => props.cam.id, id => {
  setTimeout(() => initConnect(), 0) 
}, { immediate: true })

function initConnect(): void {
  if (sessionStatusId.value !== 3) {
    if (!props.cam.streamObject) {
      if (props.cam.control && !props.cam.pluginConnected) {
        loginToPlugin(params.value)
      }
      getCodecInfo(true)
    } else {
      setStreamToSrc(props.cam.streamObject)
    }
  }
}

function setStreamToSrc(stream: MediaStream): void {
  const vElem = <HTMLVideoElement>document.getElementById(videoElemId.value)
  vElem.srcObject = stream
}

const pcInit = () => {
  pc = new RTCPeerConnection(config)
  pc.onnegotiationneeded = handleNegotiationNeededEvent
  stream = new MediaStream()
  pc.ontrack = function(event) {
    stream.addTrack(event.track)
    setStreamToSrc(stream)
    roomsStore.setStreamObject(props.cam.id, stream)
  }
}

function getCodecInfo(newCodec: boolean = false) {
  pcInit()
  if (newCodec) {
    pc.getSenders().forEach(sender => {
      pc.removeTrack(sender)
    })
  }
  ax.get(`${import.meta.env.VITE_RTSP_TO_WEB_RTC}/stream/codec/${suuid.value}`)
    .then(res => {
      const data = res.data
      data.forEach((value: any) => {
        pc.addTransceiver(value.Type, {
          'direction': 'sendrecv'
        })
      })
      roomsStore.setStreamConnected(props.cam.id)
    }).catch(e => {
      roomsStore.setStreamConnected(props.cam.id, false)
    })
}
async function handleNegotiationNeededEvent() {
  let offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  getRemoteSdp()
}
function getRemoteSdp() {
  const form = new FormData()
  form.append('suuid', suuid.value)
  form.append('data', pc.localDescription ? btoa(pc.localDescription.sdp) : null)
  ax.post(`${import.meta.env.VITE_RTSP_TO_WEB_RTC}/stream/receiver/${suuid.value}`, form)
    .then(res => {
      pc.setRemoteDescription(new RTCSessionDescription({
        type: 'answer',
        sdp: atob(res.data + '\n')
      }))
  })
}

function onVolumeChange(e: Event): void {
  if (e.target) {
    const { volume, muted }: IMediaTarget = e.target 
    roomsStore.setCamMuted(<number>props.roomId, props.cam.id, muted)
    roomsStore.setCamVolume(<number>props.roomId, props.cam.id, volume)
  }
}
function setVideoTime(time: number) : void {
  if (videoElem.value)
    videoElem.value.currentTime = time
}

function onLoadVideo(e: Event) {
  if (e.target && sessionStatusId.value === 3) {
    const target: IMediaTarget = e.target
    const duration: number = <number>target.duration
    emit('setVideoDuration', duration, props.cam.id)
  }
}
function onTimeUpdate(e: Event) {
  if (e.target && sessionStatusId.value === 3 && activeRoom.value?.longestRecordFileId === props.cam.id) {
    const target: IMediaTarget = e.target
    const currentTime: number = <number>target.currentTime
    emit('updateSliderTime', currentTime)
  }
}
function onClick(e: Event) {
  e.preventDefault()
}
function onDoubleClick() {
  videoElem.value?.requestFullscreen()
}
function playVideo(): void {
  if (videoElem.value)
    videoElem.value.play()
}
function pauseVideo(): void {
  if (videoElem.value)
    videoElem.value.pause()
}

onMounted(async () => {

})

const baseUrl = import.meta.env.DEV ? import.meta.env.VITE_TEST_SERVER_BASE_URL : import.meta.env.BASE_URL

defineExpose({
  camId,
  playVideo,
  pauseVideo,
  getCodecInfo,
  setVideoTime
})
</script>

<template>
  <div :id="'divPlugin' + '_' + videoElemId" class="plugin">
    <video 
      :id="videoElemId"
      class="videoWindow" 
      ref="videoElem"
      :autoplay="sessionStatusId === 3 ? false : true"
      controls
      playsinline
      :src="sessionStatusId === 3 && props.cam.active && props.cam.src ? `${baseUrl}${props.cam.src.slice(4)}` : undefined"
      :volume="props.cam.volume" 
      :muted="props.cam.muted"
      @loadeddata="onLoadVideo"
      @timeupdate="onTimeUpdate"
      @volumechange="onVolumeChange"
      @click="onClick"
      @dblclick="onDoubleClick"
    ></video>
    <div :id="`videoDiv_${props.cam.id}`" class="hiddenPlugin"></div>
  </div>
</template>

<style lang="scss">
.plugin {
  display: flex;
  height: 100%;
  width: 100%;
  .videoWindow {
    width: 100%;
    border-radius: 12px;
    cursor: pointer;
  }
}
.hiddenVideo {
  display: none;
}
audio::-webkit-media-controls-timeline,
video::-webkit-media-controls-timeline,
audio::-webkit-media-controls-play-button,
video::-webkit-media-controls-play-button,
audio::-webkit-media-controls-current-time-display,
video::-webkit-media-controls-current-time-display,
audio::-webkit-media-controls-time-remaining-display,
video::-webkit-media-controls-time-remaining-display {
  display: none !important;
  -webkit-appearance: none;
}
</style>