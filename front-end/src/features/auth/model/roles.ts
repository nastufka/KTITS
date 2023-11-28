import { PermissionEnum } from '@/features/auth/model/permissions'

export enum UserRoles {
  Admin,
  Manager,
  Teacher,
  Student
}

const adminPermissions: PermissionEnum[] = [
  PermissionEnum.CAN_READ_SCHEDULE,

  PermissionEnum.CAN_CREATE_SESSIONS,
  PermissionEnum.CAN_READ_SESSIONS,
  PermissionEnum.CAN_UPDATE_OWN_SESSIONS,
  PermissionEnum.CAN_UPDATE_ALL_SESSIONS,

  PermissionEnum.CAN_CREATE_USERS,
  PermissionEnum.CAN_READ_USERS,
  PermissionEnum.CAN_UPDATE_USERS,

  PermissionEnum.CAN_CREATE_GROUPS,
  PermissionEnum.CAN_READ_GROUPS,
  PermissionEnum.CAN_UPDATE_GROUPS,

  PermissionEnum.CAN_CREATE_ROOMS,
  PermissionEnum.CAN_READ_ROOMS,
  PermissionEnum.CAN_READ_ROOM,
  PermissionEnum.CAN_UPDATE_ROOMS,

  PermissionEnum.CAN_READ_DEVICES,
  PermissionEnum.CAN_UPDATE_DEVICES,

  PermissionEnum.CAN_READ_SETTINGS,
  PermissionEnum.CAN_UPDATE_SETTINGS,
]

const managerPermissions: PermissionEnum[] = [
  PermissionEnum.CAN_READ_SCHEDULE,

  PermissionEnum.CAN_CREATE_SESSIONS,
  PermissionEnum.CAN_READ_SESSIONS,
  PermissionEnum.CAN_UPDATE_OWN_SESSIONS,
  PermissionEnum.CAN_UPDATE_ALL_SESSIONS,

  PermissionEnum.CAN_CREATE_USERS,
  PermissionEnum.CAN_READ_USERS,
  PermissionEnum.CAN_UPDATE_USERS,

  PermissionEnum.CAN_CREATE_GROUPS,
  PermissionEnum.CAN_READ_GROUPS,
  PermissionEnum.CAN_UPDATE_GROUPS,

  PermissionEnum.CAN_CREATE_ROOMS,
  PermissionEnum.CAN_READ_ROOMS,
  PermissionEnum.CAN_READ_ROOM,
  PermissionEnum.CAN_UPDATE_ROOMS,

  PermissionEnum.CAN_READ_DEVICES,
  PermissionEnum.CAN_UPDATE_DEVICES,

  PermissionEnum.CAN_READ_SETTINGS,
  PermissionEnum.CAN_UPDATE_SETTINGS,
]

const teacherPermissions: PermissionEnum[] = [
  PermissionEnum.CAN_READ_SCHEDULE,

  PermissionEnum.CAN_CREATE_SESSIONS,
  PermissionEnum.CAN_READ_SESSIONS,
  PermissionEnum.CAN_UPDATE_OWN_SESSIONS,

  PermissionEnum.CAN_READ_USERS,

  PermissionEnum.CAN_READ_GROUPS,

  PermissionEnum.CAN_READ_ROOMS,
  PermissionEnum.CAN_READ_ROOM,

  PermissionEnum.CAN_READ_SETTINGS,
]

const studentPermissions: PermissionEnum[] = [
  PermissionEnum.CAN_READ_SCHEDULE,

  PermissionEnum.CAN_READ_ROOMS,
]

export const AccessPermissions: { [key: number]: PermissionEnum[] } = {
  [UserRoles.Admin]: adminPermissions,
  [UserRoles.Manager]: managerPermissions,
  [UserRoles.Teacher]: teacherPermissions,
  [UserRoles.Student]: studentPermissions,
}
