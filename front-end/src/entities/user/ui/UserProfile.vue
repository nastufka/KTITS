<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import EosCard from '@/shared/ui/EosCard'
import { useUserStore } from '../model/userStore'
import type { User } from '@/entities/user/model/types'

const props = withDefaults(defineProps<{
  collapsed: boolean
}>(), {
  collapsed: false
})

const { t } = useI18n({})
const userStore = useUserStore()
const currentUser = computed<User>(() => userStore.currentUser)
const bodyStyle = ref<Record<string, string>>({
  display: 'flex',
  alignItems: 'center',
  borderRadius: '16px',
  padding: '12px',
  boxShadow: '0px 4px 24px 0px rgba(0, 0, 0, 0.12)'
})
const getInitials = computed(() => {
  if (currentUser.value.name) {
    const fullName: string[] = currentUser.value.name.split(' ')
    return fullName.reduce((acc, item) => acc + item.at(0)?.toUpperCase(), '')
  }
})

</script>

<template>
  <div>
    <template v-if="!props.collapsed">
      <eos-card class="user-profile" :bodyStyle="bodyStyle">
        <div class="user-profile-info">
          <span class="user-profile-info-username">
            {{ currentUser.name }}
          </span>
          <span class="user-profile-info-role">
            {{ t(`${currentUser.role?.name}`) }}
          </span>
        </div>
        <div class="user-profile-circle">
          <span class="user-profile-circle-initials">{{ getInitials }}</span>
        </div>
      </eos-card>
    </template>
    <template v-else>
      <a-tooltip color="#fff" placement="right">
        <template #title>
          <span>{{ currentUser.name }}</span>
        </template>
        <div class="user-profile-circle">
          <span class="user-profile-circle-initials">{{ getInitials }}</span>
        </div>
      </a-tooltip>
    </template>
  </div>
</template>

<style lang="scss">
.user-profile {
  height: auto;
  &-info {
    display: flex;
    flex-direction: column;
    width: 166px;
    &-username {
      color: var(--sc-base-1);
      font-size: 15px;
      font-weight: 800;
      line-height: 24px;
    }
    &-role {
      color: var(--sc-base-2);
      font-size: 13px;
      font-weight: 500;
      line-height: 20px;
    }
  }
}
.user-profile-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: 48px;
  background: var(--sc-base-11);
  &-initials {
    color: var(--sc-base-6);
    font-size: 15px;
    font-weight: 800;
    line-height: 24px;
  }
}
</style>