<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LoginForm from '@/features/login'
import LanguageSelect from '@/features/languageSelect'

const { t } = useI18n({})
const version = ref<string>('1.00')
</script>

<template>
  <div class="login-page">
    <language-select class="login-page-lang" />
    <login-form class="login-page-form" />
    <div class="version">
      {{ t('version') }} {{ version }}
    </div>
  </div>
</template>

<style lang="scss">
.login-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  &-lang {
    position: absolute;
    top: 20px;
    right: 26px;
  }
  &-form {
    width: 416px;
    max-height: 574px;
  }
  .version {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    color: var(--sc-base-3);
  }
}
</style>