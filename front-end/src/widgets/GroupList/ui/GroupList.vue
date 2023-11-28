<script setup lang="ts">
import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import type { AxiosError } from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { ref, watch, onBeforeMount, onMounted } from 'vue'
import type { ColumnsType } from 'ant-design-vue/es/table/interface'

import { ax } from '@/shared/api/common'
import EosCard from '@/shared/ui/EosCard'
import EosTable from '@/shared/ui/EosTable'
import EosButton from '@/shared/ui/EosButton'
import UserForm from '@/features/userForm/ui'
import GroupForm from '@/features/groupForm/ui'
import EditIcon from '@/shared/icons/EditIcon.vue'
import GroupFilter from '@/features/groupFilter/ui'
import ArchiveGroup from '@/features/archiveGroup/ui'
import type { Group } from '@/entities/group/model/types'
import HasPermission from '@/features/auth/ui/HasPermission.vue'
import EosSort, { type EosSortOption } from '@/shared/ui/EosSort'
import { PermissionEnum } from '@/features/auth/model/permissions'

const { t } = useI18n({})
const route = useRoute()
const router = useRouter()

const columns: ColumnsType = [
  {
    title: t('groupName'),
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: t('speciality'),
    dataIndex: 'speciality',
    key: 'speciality',
  },
  {
    title: t('numberOfStudents'),
    dataIndex: 'users',
    key: 'student_count',
  },
  {
    title: t('teacher'),
    dataIndex: 'teacher',
    key: 'teacher__name',
  },
  {
    key: 'actions',
    width: 130,
  },
]

const page = ref<number>()
const total = ref<number>(0)
const groupToEdit = ref<Group>()
const sort = ref<string>('name')
const pageSize = ref<number>(100)
const minStudents = ref<number>()
const maxStudents = ref<number>()
const loading = ref<boolean>(false)
const dataSource = ref<Group[]>([])
const isGroupFormOpen = ref<boolean>(false)
const isUserFormOpen = ref<boolean>(false)
const sortOptions = ref<EosSortOption[]>([
  { label: t('groupName'), value: 'name' },
  { label: t('teacher'), value: 'teacher__name' },
  { label: t('speciality'), value: 'speciality' },
  { label: t('numberOfStudents'), value: 'student_count' },
])
const groupFormRef = ref<InstanceType<typeof GroupForm> | null>(null)

function handleError(e: AxiosError) {
  if (e.response) {
    router.push({ name: 'error', params: { status: e.response.status }})
  }
}

const getData = _.debounce(() => {
  if (route.name === 'groups') {
    loading.value = true

    const minimalQuery = route.query.ordering !== undefined
      && route.query.offset !== undefined
      && route.query.limit !== undefined

    if (!minimalQuery) {
      setQuery([sort.value, 1])
    }

    minimalQuery && ax.get<Group[]>(route.fullPath)
      .then(r => {
        loading.value = false
        dataSource.value = r.data
        total.value = +r.headers.count

        if (minStudents.value === undefined || maxStudents.value === undefined || maxStudents.value === 0) {
          setMinMaxStudent()
        }
      })
      .catch(handleError)
  }
}, 300)

function getFreeStudents() {
  groupFormRef.value?.getFreeStudents()
}

function formatUsers(users: Group['users']) {
  return users?.length || 0
}

function formatTeacher(teacher: Group['teacher']) {
  return teacher?.name
}

function setMinMaxStudent() {
  const studentCount = dataSource.value.map(g => formatUsers(g.users))
  minStudents.value = studentCount.length ? Math.min(...studentCount) : 0
  maxStudents.value = studentCount.length ? Math.max(...studentCount) : 0
}

function readQuery() {
  const ordering = route.query.ordering as string
  const limit = route.query.limit
  const offset = route.query.offset

  if (ordering) {
    sort.value = ordering
  }

  if (limit && offset) {
    page.value = Math.floor(+offset / +limit) + 1
  }
}

function setQuery([ordering, page]: [string | undefined, number | undefined]) {
  const query = {
    ...route.query,
    ordering,
    limit: page ? pageSize.value : page,
    offset: page ? pageSize.value * (page - 1) : page,
  }
  router.push({ name: 'groups', query })
}

function openGroupForm() {
  isGroupFormOpen.value = true
}

function openUserForm() {
  isUserFormOpen.value = true
}

function editGroup(group: Group) {
  groupToEdit.value = group
  openGroupForm()
}

function goToFirstPage() {
  page.value = 1
}

watch(sort, goToFirstPage)
watch([sort, page], setQuery)
watch(route, getData)
watch(isGroupFormOpen, open => {
  if (!open) {
    groupToEdit.value = undefined
  }
})

onBeforeMount(() => {
  readQuery()
})

onMounted(() => {
  getData()
})
</script>

<template>
  <eos-card
    class="group-list"
    :title="t('learningGroups')"
    :hideHeadBorder="true"
  >
    <group-form
      v-model:open="isGroupFormOpen"
      ref="groupFormRef"
      :group="groupToEdit"
      @submit="getData"
      @add-student="openUserForm"
    />

    <user-form
      v-model:open="isUserFormOpen"
      @submit="getFreeStudents"
    />

    <template #extra>
      <div class="group-list__btns">
        <group-filter
          :min="minStudents"
          :max="maxStudents"
          @filter="goToFirstPage"
        />

        <eos-sort
          v-model:sort="sort"
          :options="sortOptions"
        />

        <has-permission :permissions="[PermissionEnum.CAN_CREATE_GROUPS]">
          <eos-button
            type="primary"
            style="width: 122px;"
            @click="openGroupForm"
          >
            {{ t('create') }}
          </eos-button>
        </has-permission>
      </div>
    </template>

    <eos-table
      v-model:page="page"
      v-model:pageSize="pageSize"
      :sort="sort"
      :total="total"
      :loading="loading"
      :columns="columns"
      :fullHeight="true"
      :dataSource="dataSource"
      :serverSidePagination="true"
      :scroll="{ y: 'calc(100vh - 227px)' }"
    >
      <template #bodyCell="{ column, record: group }">
        <div v-if="column.key === 'student_count'">
          {{ formatUsers(group.users) }}
        </div>

        <div v-if="column.key === 'teacher__name'">
          {{ formatTeacher(group.teacher) }}
        </div>

        <div v-if="column.key === 'actions'" class="group-list__actions">
          <has-permission :permissions="[PermissionEnum.CAN_UPDATE_GROUPS]">
            <eos-button
              type="secondary"
              class="group-list__action"
              @click="editGroup(group)"
            >
              <edit-icon />
            </eos-button>
          </has-permission>

          <has-permission :permissions="[PermissionEnum.CAN_UPDATE_GROUPS]">
            <archive-group
              class="group-list__action"
              :group="group"
              @archive="getData"
            />
          </has-permission>
        </div>
      </template>
    </eos-table>
  </eos-card>
</template>

<style lang="scss">
.group-list {
  &__btns {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__action {
    width: 44px;
    opacity: 0;
    pointer-events: none;
  }

  .ant-table-cell-row-hover {
    .group-list__action {
      opacity: 1;
      pointer-events: all;
    }
  }
}
</style>
