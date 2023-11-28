import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { dayjs } from '@/shared/api/common'
import type { Group } from '@/entities/group/model/types'
import type { User, Role } from '@/entities/user/model/types'
import type { Room, DeviceType } from '@/entities/room/model/types'
import type { SessionType, SessionStatus } from '@/entities/session/model/types'
import type { SystemSettings, SystemSettingsResponse } from '@/entities/systemSettings/model/types'
import type { Camera } from '@/entities/camera/model/types'

interface DefaultList extends Record<string, any[]>{}

export const useGlobalStore = defineStore('globalStore', () => {
  const roomList = ref<Room[]>([])
  const roleList = ref<Role[]>([])
  const groupList = ref<Group[]>([])
  const studentList = ref<User[]>([])
  const teacherList = ref<User[]>([])
  const responsibleList = ref<User[]>([])
  const typeList = ref<SessionType[]>([])
  const specialityList = ref<string[]>([])
  const statusList = ref<SessionStatus[]>([])
  const deviceTypeList = ref<DeviceType[]>([])
  const systemSettings = ref<SystemSettings>()
  const isDefaultListLoaded = ref<boolean>(false)
  
  const roomNames = computed(() => roomList.value?.map(r =>  {
    const { id, name } = r
    return {
      id,
      name
    }
  }))

  function setDefaultList(defaultList: DefaultList) {
    setRooms(defaultList.room_list)
    setRoles(defaultList.role_list)
    setTypes(defaultList.type_list)
    setGroups(defaultList.group_list)
    setStatuses(defaultList.status_list)
    setStudents(defaultList.student_list)
    setTeachers(defaultList.teacher_list)
    setDeviceTypes(defaultList.device_type_list)
    setSpecialities(defaultList.speciality_list)
    setResponsibles(defaultList.responsible_list)
    isDefaultListLoaded.value = true
  }

  function setRooms(rooms: Room[]): void {
    roomList.value = rooms
  }
  function addRoom(room: Room | Room[]): void {
    if (Array.isArray(room)) {
      roomList.value?.push(...room)
    } else {
      roomList.value?.push(room)
    }
  }
  function setRoles(roles: Role[]) {
    roleList.value = roles
  }
  function setTypes(types: SessionType[]): void {
    typeList.value = types
  }
  function setGroups(groups: Group[]): void {
    groupList.value = groups
  }
  function setStatuses(statutses: SessionStatus[]): void {
    statusList.value = statutses
  }
  function setStudents(students: User[]): void {
    studentList.value = students
  }
  function setTeachers(teachers: User[]): void {
    teacherList.value = teachers
  }
  function setSpecialities(specialities: string[]): void {
    specialityList.value = specialities
  }
  function setResponsibles(responsibles: User[]): void {
    responsibleList.value = responsibles
  }
  function setDeviceTypes(types: DeviceType[]): void {
    deviceTypeList.value = types
  }
  function setSystemSettings(data: SystemSettingsResponse) {
    const centerName: string = data.center_name
    const workingModes: SystemSettings['workingModes'] = {}
    const formatTime = (time: string) => {
      const [hour, minute] = time.split(':')
      return dayjs().hour(+hour).minute(+minute).second(0).millisecond(0)
    }

    for (const key in data.working_modes) {
      const mode = data.working_modes[key]
      workingModes[key] = {
        isWorking: mode.is_working,
        startWork: formatTime(mode.start_work),
        endWork: formatTime(mode.end_work),
        startLunch: formatTime(mode.start_lunch),
        endLunch: formatTime(mode.end_lunch),
        noLunch: mode.no_lunch
      }
    }

    systemSettings.value = { centerName, workingModes }
  }
  function changeRoom(roomId: number, roomData: Partial<Room>): void {
    const roomIndex: number = roomList.value.findIndex(r => r.id === roomId)
    if (roomIndex > -1) {
      roomList.value[roomIndex] = {
        ...roomList.value[roomIndex],
        ...roomData
      } 
    }
  }
  function setRoomDevices(roomId: number, devices: Camera[]): void {
    const room = roomList.value.find(r => r.id === roomId)
    if (room) {
      room.devices = devices
    }
  }

  return {
    addRoom,
    roleList,
    roomList,
    typeList,
    groupList,
    statusList,
    studentList,
    teacherList,
    deviceTypeList,
    specialityList,
    responsibleList,
    roomNames,
    systemSettings,
    isDefaultListLoaded,
    setRoles,
    setRooms,
    setGroups,
    setStudents,
    setTeachers,
    setStatuses,
    setDefaultList,
    setSpecialities,
    setResponsibles,
    setSystemSettings,
    changeRoom,
    setRoomDevices,
  }
})