import { PermissionEnum } from '@/features/auth/model/permissions'
import Routing from './routing.vue'

export const routes = [
  {
    path: '/',
    redirect: { path: '/schedule' },
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('./login')
  },
  {
    name: 'session',
    path: '/session/:id',
    component: () => import('./session'),
    meta: {
      permissions: [PermissionEnum.CAN_READ_SESSIONS],
    },
  },
  {
    name: 'sessions',
    path: '/sessions',
    component: () => import('./sessionList'),
    meta: {
      permissions: [PermissionEnum.CAN_READ_SESSIONS],
    },
  },
  {
    name: 'sessionsSort',
    path: '/sessions/:sort',
    component: () => import('./sessionList'),
    meta: {
      permissions: [PermissionEnum.CAN_READ_SESSIONS],
    },
  },
  {
    name: 'users',
    path: '/users',
    component: () => import('./userList'),
    meta: {
      permissions: [PermissionEnum.CAN_READ_USERS],
    },
  },
  {
    name: 'groups',
    path: '/groups',
    component: () => import('./groupList'),
    meta: {
      permissions: [PermissionEnum.CAN_READ_GROUPS],
    },
  },
  {
    name: 'schedule',
    path: '/schedule',
    component: () => import('./schedule'),
    meta: {
      permissions: [PermissionEnum.CAN_READ_SCHEDULE],
    },
  },
  {
    name: 'rooms',
    path: '/rooms',
    component: () => import('./roomList'),
    meta: {
      permissions: [PermissionEnum.CAN_READ_ROOMS],
    },
  },
  {
    name: 'roomsSort',
    path: '/rooms/:sort',
    component: () => import('./roomList'),
    meta: {
      permissions: [PermissionEnum.CAN_READ_ROOMS],
    },
  },
  {
    name: 'devices',
    path: '/devices',
    component: () => import('./deviceList'),
    meta: {
      permissions: [PermissionEnum.CAN_READ_DEVICES],
    },
  },
  {
    name: 'settings',
    path: '/settings',
    component: () => import('./systemSettings'),
    meta: {
      permissions: [PermissionEnum.CAN_READ_SETTINGS],
    },
  },
  {
    name: 'room',
    path: '/room/:id',
    component: () => import('./roomPage'),
    meta: {
      permissions: [PermissionEnum.CAN_READ_ROOM],
    },
  },
  {
    name: 'error',
    path: '/:pathMatch(.*)*/:status',
    component: () => import('./errorPage'),
  },
]

export { Routing }
