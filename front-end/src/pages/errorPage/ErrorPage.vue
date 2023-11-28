<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import EosCard from '@/shared/ui/EosCard'
import EosButton from '@/shared/ui/EosButton'

const { t } = useI18n({})
const route = useRoute()

const status = computed(() => route.params.status || '404')
const statusText = computed(() => {
  switch (route.params.status) {
    case '403':
      return t('accessDeniedContactAdministrator')
    case '404':
      return t('pageNotFound')
    default:
      return t('somethingWentWrong')
  }
})
</script>

<template>
  <div class="error-page">
    <eos-card class="error-page__error">
      <h1 class="error-page__title">
        {{ status }}
      </h1>

      <p class="error-page__text">
        {{ statusText }}
      </p>

      <router-link to="/">
        <eos-button size="large" type="primary">
          {{ t('goToMainPage') }}
        </eos-button>
      </router-link>

      <img class="error-page__img" src="@/shared/img/error.svg">
    </eos-card>
  </div>
</template>

<style lang="scss">
.error-page {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  &__error {
    width: 775px;
    height: 282px;
    padding: 54.04px 49.5px 56.09px;
    overflow: hidden;
  }

  &__title {
    font-weight: 800;
    margin-bottom: 8.78px;
  }

  &__text {
    color: var(--sc-base-2);
    font-size: 19px;
    font-weight: 500;
    line-height: 28px;
    margin-bottom: 23.1px;
  }

  &__img {
    position: absolute;
    top: 0;
    right: 0;
    pointer-events: none;
  }
}
</style>
