<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { h, ref, computed } from 'vue'

import { router } from '@/app/providers'
import Logo from '@/shared/icons/Logo.vue'
import { logout } from '@/features/auth/lib'
import EosButton from '@/shared/ui/EosButton'
import { UserProfile } from '@/entities/user/ui'
import LanguageSelect from '@/features/languageSelect'
import LogoutIcon from '@/shared/icons/LogoutIcon.vue'
import { LeftCircleFilled } from '@ant-design/icons-vue'
import { useSideMenuStore } from '../model/SideMenuStore'
import { useUserStore } from '@/entities/user/model/userStore'
import MenuButtons from '@/features/menuButtons/ui/MenuButtons.vue'

const { t } = useI18n({})
const userStore = useUserStore()
const store = useSideMenuStore()
const collapsed = computed(() => store.collapsed)
const version = ref<string>('1.00')

function toggleCollapse(): void {
  store.toggleCollapse()
}
const onLanguageButtonClick = (): void => {
  toggleCollapse()
}
const doLogout = async (): Promise<void> => {
  try {
    await logout()
    userStore.setAuth(false)
    router.push('/login')
  } catch(e) {

  }
}
</script>

<template>
  <div class="side-menu" :class="{ collapsed }">
    <div class="side-menu__main">
      <router-link class="side-menu__head" to="/">
        <Logo />
        <span v-if="!collapsed" class="side-menu__head__logo-title">
          Сим Центр
        </span>
      </router-link>
      <div class="side-menu__btns">
        <MenuButtons :collapsed="collapsed" />
      </div>
      <div class="side-menu__bottom">
        <user-profile :collapsed="collapsed" />
        <div>
          <eos-button
            class="logout-button"
            type="menu"
            :icon="h(LogoutIcon)"
            @click="doLogout"
          >
            <span v-if="!collapsed">{{ t('logout') }}</span>
          </eos-button>
          <language-select 
            :collapsed="collapsed"
            type="menu"
            size="medium"
            ref="languageSelect"
            @onButtonClick="onLanguageButtonClick"
          />
        </div>
        <div class="version">
          {{ t('version', collapsed ? 2 : 1) }} {{ version }}
        </div>
      </div>
    </div>
    <div class="side-menu__toggle">
      <LeftCircleFilled :rotate="collapsed ? 180 : 0" :style="{ color: '#2F3144' }" @click="toggleCollapse" />
    </div>
  </div>
</template>

<style lang="scss">
.side-menu {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 274px;
  height: 100%;
  background: #fff;

  &__main {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    height: 100%;
    padding: 19px 12px;
  }

  &__toggle {
    position: relative;
    top: 30px;
    right: 6px;
    width: 0px;
    z-index: 2;
  }

  &__head {
    display: flex;
    align-self: center;
    align-items: center;
    text-decoration: none;

    &__logo-title {
      margin-left: 14px;
      font-size: 24px;
      font-weight: 800;
      line-height: 28px;
    }
  }

  &__btns {
    margin-top: 24px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &__bottom {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-top: auto;
    .logout-button {
      margin-bottom: 4px;
    }
    .version {
      font-size: 13px;
      font-weight: 500;
      line-height: 20px;
      color: var(--sc-base-3);
      min-width: 40px;
    }
  }
}

.collapsed {
  max-width: 84px;
}
</style>
