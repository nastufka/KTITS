import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { GridMode } from '@/features/roomsGridSelection/model/types'
import type { PlayStatus, Room, RoomNames, ActiveRecord } from '../model/types'
import type { User } from '@/entities/user/model/types'
import type { Group } from '@/entities/group/model/types'
import type { Camera } from '@/entities/camera/model/types'
import type { Session, SessionType } from '@/entities/session/model/types'
import { getCapture } from '@/entities/camera/api'
import { useAnnotationsStore } from '@/features/annotations/model/annotationsStore'
import { useGridSelectionStore } from '@/features/roomsGridSelection/model/gridSeletionStore'
import { useActionSwitcherStore } from '@/features/roomsActionSwitcher/model/actionSwitcherStore'


const annotationsStore = useAnnotationsStore()
const gridSelectionStore = useGridSelectionStore()
const actionSwitcherStore = useActionSwitcherStore()

export const useRoomsStore = defineStore('roomsStore', () => {
  const sessionInfo = ref<Session | {} | any>({})
  const rooms = ref<Room[]>([])
  const activeRoom = ref<Room | undefined>(rooms.value[0])
  const gridModes = ref<GridMode[]>(gridSelectionStore.modes)
  const wndSet = reactive<Set<number>>(new Set())
  const activeRecord = ref<ActiveRecord>(null)
  const roomNames = computed<RoomNames[]>(() => rooms.value.map(r => { 
    return { id: r.id, name: r.name, recording: <boolean>r.recording }
  }))
  const recordinginProgress = computed<boolean>(() => {
    return rooms.value.some(r => {
      return r.recording
    })
  })
  const sessionGroups = computed<Group[]>(() => {
    return sessionInfo.value.groups.map((group: Group) => {
      return { id: group.id, name: group.name }
    })
  })
  const sessionStudents = computed<User[]>(() => {
    const students: User[] = []
    sessionInfo.value.groups.forEach((group: Group) => {
      // @ts-ignore
      const groupUsers = group.users?.map((user: User) => {
        return { id: user.id, name: user.name }
      })
      groupUsers && students.push(...groupUsers)
    })
    return students
  })

  function setSession(data: any): void {
    sessionInfo.value = {
      id: data.id,
      module: data.module,
      type: data.type,
      typeList: data.type_list,
      start: data.start,
      end: data.end,
      groups: data.groups,
      rooms: data.rooms,
      users: data.users,
      status: data.status,
      statusList: data.status_list,
    }
    setRooms(data.rooms)
  }
  function setRooms<T extends object & Room>(data: T[]): void {
    rooms.value = data.map(r => {
      return { 
        ...r,
        recording: false,
        playStatus: 'reset',
        time: 0,
        pluginConnected: false,
        videoDuration: 0,
        gridModeId: 1,
        records: r.records?.filter(r => r.video?.length).map((recordItem: any) => {
          return {
            id: recordItem.record_id,
            userId: recordItem.id,
            userName: `${sessionInfo.value.type.id === 1 ? 'Студент ' : ''}${recordItem.name}`,
            userRole: recordItem.role,
            date: recordItem.record_date,
            hasCaptures: false,
            annotations: recordItem.annotation,
            videos: recordItem.video.map((v: any, i: number) => {
              return {
                id: i,
                name: v.split('/').reverse()[0],
                src: v,
                order: i,
                volume: 1,
                muted: false,
                active: false
              }
            })
          }
        }),
        cams: r.devices?.map((v: Camera, i: number) => {
          v.order = i
          v.volume = 1
          v.muted = false
          v.streamConnected = true
          return v
        })
      }
    })
    setCaptures()
    rooms.value.length && setActiveRoom(rooms.value[0].id)
  }
  function setActiveRoom(id: number): void {
    muteCamsInRoom()
    activeRoom.value = rooms.value.find(r => r.id === id)
    muteCamsInRoom(false)
  }
  function muteCamsInRoom(muted: boolean = true): void {
    activeRoom.value?.cams && activeRoom.value?.cams.forEach(cam => {
      cam.muted = muted
    })
  }
  function setCaptures() {
    rooms.value.forEach(room => {
      room.cams && room.cams.forEach(async (cam) => {
        cam.image = await getCapture(`/camera/${cam.id}`)
      })
    })
  }
  function setRecordCaptures(idx: number):void {
    if (activeRoom.value?.records) {
      activeRoom.value?.records[idx].videos.forEach(async(v) => {
        v.image = await getCapture(`/video/?name=${v.src}`)
      })
      activeRoom.value.records[idx].hasCaptures = true
    }
  }
  function setActiveVideo(order: number, id: number, type: 'stream' | 'record' = 'stream', recordId: number | null = null) {
    if (rooms.value) {
      if (activeRoom.value) {
        let chdCam, currentCam
        if (type === 'stream' && activeRoom.value.cams) {
          currentCam = activeRoom.value.cams.find(c => c.id === id)
          chdCam = activeRoom.value.cams.find(c => c.order === order)
        } else if ( type === 'record' && activeRoom.value.records) {
          currentCam = activeRoom.value.records.find(r => r.id === recordId)?.videos.find((v: any) => v.id === id)
          chdCam = activeRoom.value.records.find(r => r.id === recordId)?.videos.find((v: any) => v.order === order)
        }
        if (currentCam) {
          if (chdCam) {
            chdCam.order = currentCam.order
            chdCam.active = !chdCam.active ? false : currentCam.active
          }
          currentCam.order = order
          currentCam.active = true
        }
      }
    }
  }
  function setStreamObject(camId: number, streamObject: any): void {
    const cam = activeRoom.value?.cams && activeRoom.value?.cams.find(c => c.id == camId)
    if (cam)
      cam.streamObject = streamObject
  }
  function setCamVolume(roomId: number, camId: number, volume: number = 0) {
    const cam = rooms.value?.find(room => room.id === roomId)?.cams?.find(c => c.id == camId)
    if (cam)
      cam.volume = volume
  }
  function setCamMuted(roomId: number, camId: number, muted: boolean = false) {
    const cam = rooms.value?.find(room => room.id === roomId)?.cams?.find(c => c.id == camId)
    if (cam)
      cam.muted = muted
  }
  function addToWndSet(id: number): void {
    wndSet.add(id)
  }
  function handleRecording(recordId: number): void {
    if (activeRoom.value) {
      activeRoom.value.recording = !activeRoom.value.recording
      if (activeRoom.value.recording) {
        startInterval(activeRoom.value?.id)
        activeRoom.value.recordId = recordId
        annotationsStore.clearList(activeRoom.value.id)
        actionSwitcherStore.setMode(2)
      } else {
        stopInterval()
      }
    }
  }
  function setStudentID(id: number): void {
    if (activeRoom.value)
      activeRoom.value.studentID = id
  }
  function startInterval(roomId: number): void {
    const room = rooms.value.find(r => r.id === roomId)
    const intervalId: number = setInterval((e) => {
      if (room && room.time !== undefined)
        room.time += 1
    }, 1000)
    if (room)
      room.intervalId = intervalId
  }
  function setTime(time: number, seek: boolean = false): void {
    if (activeRoom.value) {
      activeRoom.value.time = seek ? time : Math.max(<number>activeRoom.value.time, time)
      if (activeRoom.value.time >= <number>activeRoom.value.videoDuration && activeRoom.value.playStatus !== 'reset') {
        setPlayStatus('pause')
      }
    }
  }
  function stopInterval(): void {
    if (activeRoom.value) {
      clearInterval(activeRoom.value.intervalId)
      activeRoom.value.time = 0
    }
  }
  function setPluginConnected(camId: number, connected: boolean = true) {
    if (activeRoom.value && activeRoom.value?.cams) {
      const cam = activeRoom.value.cams.find((c: Camera) => c.id === camId)
      if (cam)
        cam.pluginConnected = connected
    }
  }
  function setStreamConnected(camId: number, connected: boolean = true) {
    if (activeRoom.value && activeRoom.value?.cams) {
      const cam = activeRoom.value.cams.find((c: Camera) => c.id === camId)
      if (cam)
        cam.streamConnected = connected
    }
  }
  function updateDevice(camId: number, deviceData: Camera): void {
    if (activeRoom.value && activeRoom.value.cams) {
      const camIdx = activeRoom.value.cams.findIndex((c: Camera) => c.id === camId)
      if (camIdx !== -1) {
        activeRoom.value.cams[camIdx] = { ...activeRoom.value.cams[camIdx], ...deviceData }
      }
    }
  }
  function setVideoDuration(duration: number, recordFileId: number): void {
    if (activeRoom.value) {
      if (duration > <number>activeRoom.value.videoDuration) {
        activeRoom.value.videoDuration = duration
        activeRoom.value.longestRecordFileId = recordFileId
      }
    }
  }
  function setPlayStatus(status: PlayStatus): void {
    if (activeRoom.value) {
      activeRoom.value.playStatus = status
    }
  }
  function setActiveRecord(recordId: number | null): void {
    activeRecord.value = { id: recordId, roomId: <number>activeRoom.value?.id}
  }
  function resetActiveFiles(): void {
    if (activeRoom.value) {
      activeRoom.value.records && activeRoom.value.records.forEach(record => {
        record.videos.forEach((v: any) => {
          v.active = false
        })
      })
      activeRoom.value.playStatus = 'reset'
      activeRoom.value.time = 0
      activeRoom.value.videoDuration = 0
      activeRecord.value = null
      // Вернем полосу перемотки видео к началу
      setTrackToStartPosition()
    }
  }
  function setTrackToStartPosition(): void {
    const roomCams = Array.from(document.getElementsByClassName('room-cams') as HTMLCollectionOf<HTMLElement>)
    roomCams.forEach((roomItem: HTMLElement) => {
      if (roomItem.style.display !== 'none') {
        const slider = <HTMLElement>roomItem.getElementsByClassName('ant-slider-track')[0]
        const handle = <HTMLElement>roomItem.getElementsByClassName('ant-slider-handle')[0]
        slider.style.width = '0%'
        handle.style.left = '0%'
      }
    })
  }
  function setGridMode(id: number): void {
    if (activeRoom.value)
      activeRoom.value.gridModeId = id
  }
  return { 
    rooms,
    wndSet,
    setTime,
    setRooms,
    gridModes,
    roomNames,
    setSession,
    activeRoom,
    sessionInfo,
    addToWndSet,
    setGridMode,
    setCamMuted,
    setStudentID,
    setCamVolume,
    updateDevice,
    sessionGroups,
    setPlayStatus,
    setActiveRoom,
    setActiveVideo,
    activeRecord,
    setStreamObject,
    sessionStudents,
    handleRecording,
    setVideoDuration,
    resetActiveFiles,
    setRecordCaptures,
    setActiveRecord,
    setPluginConnected,
    setStreamConnected,
    recordinginProgress
  }
})
