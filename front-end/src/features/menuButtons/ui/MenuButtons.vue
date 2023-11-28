<script setup lang="ts">
import { h } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import EosButton from '@/shared/ui/EosButton'
import DateIcon from '@/shared/icons/DateIcon.vue'
import DoorIcon from '@/shared/icons/DoorIcon.vue'
import CamsIcon from '@/shared/icons/CamsIcon.vue'
import GroupIcon from '@/shared/icons/GroupIcon.vue'
import StudentIcon from '@/shared/icons/StudentIcon.vue'
import SettingsIcon from '@/shared/icons/SettingsIcon.vue'
import GraduationIcon from '@/shared/icons/GraduationIcon.vue'

import HasPermission from '@/features/auth/ui/HasPermission.vue'
import { PermissionEnum } from '@/features/auth/model/permissions'

import type { MenuButtonsProps } from '../model/types'

const { t } = useI18n({})
const route = useRoute()

defineProps<MenuButtonsProps>()
</script>

<template>
  <div class="menu-buttons">
    <has-permission :permissions="[PermissionEnum.CAN_READ_SCHEDULE]">
      <router-link to="/schedule/">
        <eos-button
          type="menu"
          :icon="h(DateIcon)"
          :active="route.name === 'schedule'"
        >
          <span v-if="!collapsed">{{ t('schedule') }}</span>
        </eos-button>
      </router-link>
    </has-permission>
    
    <has-permission :permissions="[PermissionEnum.CAN_READ_SESSIONS]">
      <router-link to="/sessions/">
        <eos-button
          type="menu"
          :icon="h(GraduationIcon)"
          :active="route.name === 'sessions' || route.name === 'sessionsSort'"
        >
          <span v-if="!collapsed">{{ t('learnSessionList') }}</span>
        </eos-button>
      </router-link>
    </has-permission>

    <has-permission :permissions="[PermissionEnum.CAN_READ_ROOMS]">
      <router-link to="/rooms/">
        <eos-button
          type="menu"
          :icon="h(DoorIcon)"
          :active="route.name === 'rooms' || route.name === 'roomsSort'"
        >
          <span v-if="!collapsed">{{ t('roomList') }}</span>
        </eos-button>
      </router-link>
    </has-permission>
    
    <has-permission :permissions="[PermissionEnum.CAN_READ_USERS]">
      <router-link to="/users/">
        <eos-button
          type="menu"
          :icon="h(StudentIcon)"
          :active="route.name === 'users'"
        >
          <span v-if="!collapsed">{{ t('users') }}</span>
        </eos-button>
      </router-link>
    </has-permission>
    
    <has-permission :permissions="[PermissionEnum.CAN_READ_GROUPS]">
      <router-link to="/groups/">
        <eos-button
          type="menu"
          :icon="h(GroupIcon)"
          :active="route.name === 'groups'"
        >
          <span v-if="!collapsed">{{ t('learningGroups') }}</span>
        </eos-button>
      </router-link>
    </has-permission>
    
    <has-permission :permissions="[PermissionEnum.CAN_READ_DEVICES]">
      <router-link to="/devices/">
        <eos-button
          type="menu"
          :icon="h(CamsIcon)"
          :active="route.name === 'devices'"
        >
          <span v-if="!collapsed">{{ t('deviceList') }}</span>
        </eos-button>
      </router-link>
    </has-permission>
    
    <has-permission :permissions="[PermissionEnum.CAN_READ_SETTINGS]">
      <router-link to="/settings/">
        <eos-button
          type="menu"
          :icon="h(SettingsIcon)"
          :active="route.name === 'settings'"
        >
          <span v-if="!collapsed">{{ t('systemSettings') }}</span>
        </eos-button>
      </router-link>
    </has-permission>
  </div>
</template>

<style lang="scss">
.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
