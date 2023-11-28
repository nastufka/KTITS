<script setup lang="ts">
import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { SelectProps } from 'ant-design-vue'

import EosModal from '@/shared/ui/EosModal'
import EosInput from '@/shared/ui/EosInput'
import EosButton from '@/shared/ui/EosButton'
import EosSelect from '@/shared/ui/EosSelect'
import EosFormItem from '@/shared/ui/EosFormItem'
import { useGlobalStore } from '@/stores/globalStore'
import FilterIcon from '@/shared/icons/FilterIcon.vue'
import type { Role } from '@/entities/user/model/types'
import type { Group } from '@/entities/group/model/types'

import type { UserFilter } from '../model/types'

interface UserFilterEmits {
  (e: 'filter'): void
}

type Options = SelectProps['options']

const route = useRoute()
const router = useRouter()
const { t } = useI18n({})
const globalStore = useGlobalStore()

const emit = defineEmits<UserFilterEmits>()

const initialValues: UserFilter = {
  roles: [],
  groups: [],
  email: ''
}

const isOpen = ref<boolean>(false)
const filter = ref<UserFilter>({ ...initialValues })
const filterState = ref<UserFilter>({ ...initialValues })

const roleList = computed<Role[]>(() => globalStore.roleList)
const groupList = computed<Group[]>(() => globalStore.groupList)
const isFilterApplied = computed<boolean>(() => !_.isEqual(filterState.value, initialValues))
const groupOptions = computed<Options>(() => groupList.value.map(g => ({ value: g.id, label: g.name })))
const roleOptions = computed<Options>(() => roleList.value.map(r => ({ value: r.id, label: t(r.name) })))

function openModal() {
  isOpen.value = true
}

function closeModal() {
  isOpen.value = false
}

function updateFilterState() {
  filterState.value = { ...filter.value }
}

function applyFilter() {
  updateFilterState()
  const query = { ...route.query }
  query.roles = JSON.stringify(filter.value.roles)
  query.groups = JSON.stringify(filter.value.groups)
  query.email = filter.value.email
  router.push({ name: 'users', query })
  emit('filter')
}

function clearAll() {
  filter.value = ({ ...initialValues })
  applyFilter()
  closeModal()
}

function submit() {
  applyFilter()
  closeModal()
}
</script>

<template>
  <eos-button :type="isFilterApplied ? 'primary' : 'secondary'" @click="openModal">
    <FilterIcon :active="isFilterApplied" />
  </eos-button>

  <eos-modal
    v-model:open="isOpen"
    width="578px"
    :title="t('filters')"
  >
    <a-form
      name="user-filter"
      :model="filter"
    >
      <eos-form-item
        name="userRole"
        :label="t('userRole')"
      >
        <eos-select
          v-model:value="filter.roles"
          size="large"
          mode="multiple"
          style="width: 529px;"
          optionFilterProp="label"
          :options="roleOptions"
          :allowClear="true"
        ></eos-select>
      </eos-form-item>

      <eos-form-item
        name="learningGroup"
        :label="t('learningGroup')"
      >
        <eos-select
          v-model:value="filter.groups"
          size="large"
          mode="multiple"
          style="width: 529px;"
          optionFilterProp="label"
          :options="groupOptions"
          :allowClear="true"
        ></eos-select>
      </eos-form-item>

      <eos-form-item
        name="email"
        :label="t('email')"
      >
        <eos-input
          v-model:value="filter.email"
          size="large"
          type="email"
          style="width: 529px;"
        />
      </eos-form-item>
    </a-form>

    <template #footer>
      <eos-button type="primary" size="large" @click="submit">{{ t('applyFilter') }}</eos-button>
      <eos-button size="large" @click="clearAll">{{ t('clearAll') }}</eos-button>
    </template>
  </eos-modal>
</template>
